import fs from "node:fs";
import path from "node:path";
import { loadEnvFile } from "../src/common/load-env";

type SeoulCourseRow = {
  roadNo: number;
  roadNm: string;
  roadDtlNm: string;
  bgngPstn: string;
  endPstn: string;
};

type NormalizedSnapshot = {
  courses: SeoulCourseRow[];
};

type KakaoKeywordResult = {
  documents?: Array<{
    place_name?: string;
    address_name?: string;
    x?: string;
    y?: string;
  }>;
};

type CourseCheckpoint = {
  courseId: string;
  checkpointOrder: number;
  rawName: string;
  canonicalName: string;
  lat: number | null;
  lng: number | null;
  confidenceScore: number;
  needsReview: boolean;
  source: "manual_fix" | "auto_geocode";
};

const rootDir = path.resolve(__dirname, "..");
const normalizedInputPath = path.join(rootDir, "data/generated/seoul-courses.normalized.json");
const geocodedOutputPath = path.join(rootDir, "data/generated/course-checkpoints.geocoded.json");
const manualOverridesPath = path.join(rootDir, "data/manual/checkpoint-overrides.json");

function normalizeName(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\([^)]*\)/g, "")
    .replace(/[\u00B7\u318D]/g, "·")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDetailNames(raw: string): string[] {
  const seen = new Set<string>();
  return raw
    .split(",")
    .map((name) => normalizeName(name))
    .filter((name) => name.length > 0)
    .filter((name) => {
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
}

function reorderByBoundary(points: string[], begin: string, end: string): string[] {
  if (points.length === 0) return points;
  const b = normalizeName(begin);
  const e = normalizeName(end);

  const forwardScore = Number(points[0] === b) + Number(points[points.length - 1] === e);
  const reversed = [...points].reverse();
  const reverseScore = Number(reversed[0] === b) + Number(reversed[reversed.length - 1] === e);
  return reverseScore > forwardScore ? reversed : points;
}

function buildCheckpointNames(course: SeoulCourseRow): string[] {
  const begin = normalizeName(course.bgngPstn);
  const end = normalizeName(course.endPstn);
  const middle = reorderByBoundary(parseDetailNames(course.roadDtlNm), course.bgngPstn, course.endPstn).filter(
    (name) => name !== begin && name !== end,
  );
  return [begin, ...middle, end].filter((name) => name.length > 0);
}

function scoreConfidence(placeName: string, addressName: string): number {
  if (addressName.includes("서울")) return 0.9;
  if (placeName.includes("서울")) return 0.75;
  return 0.55;
}

async function geocodeWithKakao(query: string, restKey: string): Promise<{
  lat: number | null;
  lng: number | null;
  confidenceScore: number;
}> {
  const params = new URLSearchParams({ query });
  const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params.toString()}`, {
    headers: {
      Authorization: `KakaoAK ${restKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Kakao geocode failed (${response.status})`);
  }

  const data = (await response.json()) as KakaoKeywordResult;
  const first = data.documents?.[0];
  if (!first || !first.x || !first.y) {
    return { lat: null, lng: null, confidenceScore: 0 };
  }

  const lat = Number(first.y);
  const lng = Number(first.x);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { lat: null, lng: null, confidenceScore: 0 };
  }

  return {
    lat,
    lng,
    confidenceScore: scoreConfidence(first.place_name ?? "", first.address_name ?? ""),
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  loadEnvFile();
  if (!fs.existsSync(normalizedInputPath)) {
    throw new Error(`Missing normalized course file: ${normalizedInputPath}`);
  }

  const kakaoKey = process.env.KAKAO_REST_API_KEY;
  if (!kakaoKey) {
    throw new Error("Missing KAKAO_REST_API_KEY env.");
  }

  const rateLimitMs = Number(process.env.KAKAO_RATE_LIMIT_MS ?? 120);
  const parsed = JSON.parse(fs.readFileSync(normalizedInputPath, "utf8")) as NormalizedSnapshot;
  const cache = new Map<string, { lat: number | null; lng: number | null; confidenceScore: number }>();
  const manualOverrides = fs.existsSync(manualOverridesPath)
    ? (JSON.parse(fs.readFileSync(manualOverridesPath, "utf8")) as Record<
        string,
        { lat: number; lng: number; confidenceScore?: number }
      >)
    : {};

  const checkpoints: CourseCheckpoint[] = [];

  for (const course of parsed.courses) {
    const names = buildCheckpointNames(course);
    for (let i = 0; i < names.length; i += 1) {
      const canonicalName = names[i];
      const cacheKey = canonicalName;
      let result = cache.get(cacheKey);

      if (!result) {
        const manual = manualOverrides[cacheKey];
        if (manual && Number.isFinite(manual.lat) && Number.isFinite(manual.lng)) {
          result = {
            lat: manual.lat,
            lng: manual.lng,
            confidenceScore: manual.confidenceScore ?? 1,
          };
        } else {
          result = await geocodeWithKakao(`서울 ${canonicalName}`, kakaoKey);
          await sleep(Number.isFinite(rateLimitMs) ? rateLimitMs : 120);
        }
        cache.set(cacheKey, result);
      }

      checkpoints.push({
        courseId: `road-${course.roadNo}`,
        checkpointOrder: i + 1,
        rawName: canonicalName,
        canonicalName,
        lat: result.lat,
        lng: result.lng,
        confidenceScore: result.confidenceScore,
        needsReview: result.lat === null || result.lng === null || result.confidenceScore < 0.7,
        source:
          manualOverrides[cacheKey] && result.lat !== null && result.lng !== null
            ? "manual_fix"
            : result.lat === null || result.lng === null
              ? "manual_fix"
              : "auto_geocode",
      });
    }
  }

  const output = {
    generatedAt: new Date().toISOString(),
    count: checkpoints.length,
    unresolvedCount: checkpoints.filter((checkpoint) => checkpoint.needsReview).length,
    checkpoints,
  };

  fs.mkdirSync(path.dirname(geocodedOutputPath), { recursive: true });
  fs.writeFileSync(geocodedOutputPath, JSON.stringify(output, null, 2), "utf8");

  console.log(`Geocoded ${checkpoints.length} checkpoints`);
  console.log(`Unresolved or low-confidence: ${output.unresolvedCount}`);
  console.log(`Output: ${geocodedOutputPath}`);
}

void main();
