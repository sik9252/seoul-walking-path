import fs from "node:fs";
import path from "node:path";

type RawCourse = {
  road_no: number;
  road_nm: string;
  bgng_pstn: string;
  end_pstn: string;
  road_dtl_nm: string;
};

type RawPayload = {
  DATA: RawCourse[];
};

type CheckpointSeed = {
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
const rawPath = path.join(rootDir, "data/raw/seoul-course-info.json");
const generatedPath = path.join(rootDir, "data/generated/course-checkpoints.seed.json");

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
  const b = normalizeName(begin);
  const e = normalizeName(end);

  const forwardScore = Number(points[0] === b) + Number(points[points.length - 1] === e);
  const reversed = [...points].reverse();
  const reverseScore = Number(reversed[0] === b) + Number(reversed[reversed.length - 1] === e);

  if (reverseScore > forwardScore) return reversed;
  return points;
}

function main() {
  if (!fs.existsSync(rawPath)) {
    throw new Error(`Raw file not found: ${rawPath}`);
  }

  const rawJson = fs.readFileSync(rawPath, "utf8");
  const payload = JSON.parse(rawJson) as RawPayload;

  const seed: CheckpointSeed[] = [];

  for (const row of payload.DATA) {
    const parsed = parseDetailNames(row.road_dtl_nm);
    const ordered = reorderByBoundary(parsed, row.bgng_pstn, row.end_pstn);

    ordered.forEach((name, index) => {
      seed.push({
        courseId: `road-${row.road_no}`,
        checkpointOrder: index + 1,
        rawName: name,
        canonicalName: name,
        lat: null,
        lng: null,
        confidenceScore: 0,
        needsReview: true,
        source: "manual_fix",
      });
    });
  }

  fs.mkdirSync(path.dirname(generatedPath), { recursive: true });
  fs.writeFileSync(generatedPath, JSON.stringify(seed, null, 2), "utf8");
  console.log(`Wrote ${seed.length} checkpoints -> ${generatedPath}`);
}

main();
