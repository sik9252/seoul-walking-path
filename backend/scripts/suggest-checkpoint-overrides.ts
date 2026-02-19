import * as fs from "node:fs";
import * as path from "node:path";
import { loadEnvFile } from "../src/common/load-env";

type GeocodedCheckpoint = {
  courseId: string;
  checkpointOrder: number;
  canonicalName: string;
  lat: number | null;
  lng: number | null;
  confidenceScore: number;
  needsReview: boolean;
};

type GeocodedSnapshot = {
  checkpoints: GeocodedCheckpoint[];
};

type KakaoKeywordResult = {
  documents?: Array<{
    place_name?: string;
    address_name?: string;
    x?: string;
    y?: string;
  }>;
};

type Suggestion = {
  courseId: string;
  checkpointOrder: number;
  canonicalName: string;
  query: string;
  lat: number;
  lng: number;
  score: number;
  placeName: string;
  addressName: string;
};

const rootDir = path.resolve(__dirname, "..");
const geocodedPath = path.join(rootDir, "data/generated/course-checkpoints.geocoded.json");
const suggestionPath = path.join(rootDir, "data/generated/checkpoint-override-suggestions.json");
const manualOverridePath = path.join(rootDir, "data/manual/checkpoint-overrides.json");

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function scoreCandidate(target: string, placeName: string, addressName: string, queryIndex: number): number {
  let score = 0.4;
  if (placeName.includes(target)) score += 0.3;
  if (addressName.includes("서울")) score += 0.2;
  score += Math.max(0, 0.1 - queryIndex * 0.02);
  return Math.min(1, Number(score.toFixed(2)));
}

async function searchKakaoKeyword(
  key: string,
  query: string,
  context?: { lat: number; lng: number },
): Promise<KakaoKeywordResult> {
  const params = new URLSearchParams({ query, size: "5" });
  if (context) {
    params.set("y", String(context.lat));
    params.set("x", String(context.lng));
    params.set("radius", "12000");
  }

  const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params.toString()}`, {
    headers: {
      Authorization: `KakaoAK ${key}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Kakao keyword search failed (${response.status})`);
  }
  return (await response.json()) as KakaoKeywordResult;
}

function toNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function main() {
  loadEnvFile();

  if (!fs.existsSync(geocodedPath)) {
    throw new Error(`Missing geocoded file: ${geocodedPath}`);
  }

  const restKey = process.env.KAKAO_REST_API_KEY;
  if (!restKey) {
    throw new Error("Missing KAKAO_REST_API_KEY");
  }

  const payload = JSON.parse(fs.readFileSync(geocodedPath, "utf8")) as GeocodedSnapshot;
  const checkpoints = payload.checkpoints;
  const unresolved = checkpoints.filter((cp) => cp.needsReview);

  const grouped = new Map<string, GeocodedCheckpoint[]>();
  checkpoints.forEach((cp) => {
    if (!grouped.has(cp.courseId)) grouped.set(cp.courseId, []);
    grouped.get(cp.courseId)!.push(cp);
  });
  for (const list of grouped.values()) {
    list.sort((a, b) => a.checkpointOrder - b.checkpointOrder);
  }

  const suggestions: Suggestion[] = [];

  for (const target of unresolved) {
    const routeList = grouped.get(target.courseId) ?? [];
    const prev = [...routeList]
      .reverse()
      .find((cp) => cp.checkpointOrder < target.checkpointOrder && cp.lat !== null && cp.lng !== null);
    const next = routeList.find((cp) => cp.checkpointOrder > target.checkpointOrder && cp.lat !== null && cp.lng !== null);
    const context =
      prev && next
        ? { lat: (prev.lat! + next.lat!) / 2, lng: (prev.lng! + next.lng!) / 2 }
        : prev
          ? { lat: prev.lat!, lng: prev.lng! }
          : next
            ? { lat: next.lat!, lng: next.lng! }
            : undefined;

    const queries = [
      target.canonicalName,
      `서울 ${target.canonicalName}`,
      `${target.courseId.replace("road-", "")}코스 ${target.canonicalName}`,
      `서울둘레길 ${target.canonicalName}`,
    ];

    let best: Suggestion | null = null;

    for (let i = 0; i < queries.length; i += 1) {
      const query = queries[i];
      const result = await searchKakaoKeyword(restKey, query, context);
      const first = result.documents?.[0];
      if (!first) continue;
      const lat = toNumber(first.y);
      const lng = toNumber(first.x);
      if (lat === null || lng === null) continue;

      const placeName = first.place_name ?? "";
      const addressName = first.address_name ?? "";
      const score = scoreCandidate(target.canonicalName, placeName, addressName, i);
      const suggestion: Suggestion = {
        courseId: target.courseId,
        checkpointOrder: target.checkpointOrder,
        canonicalName: target.canonicalName,
        query,
        lat,
        lng,
        score,
        placeName,
        addressName,
      };
      if (!best || suggestion.score > best.score) {
        best = suggestion;
      }
      await sleep(120);
    }

    if (best) {
      suggestions.push(best);
    }
  }

  const groupedByName = new Map<string, Suggestion[]>();
  suggestions.forEach((item) => {
    if (!groupedByName.has(item.canonicalName)) groupedByName.set(item.canonicalName, []);
    groupedByName.get(item.canonicalName)!.push(item);
  });

  const overrides: Record<string, { lat: number; lng: number; confidenceScore: number }> = {};
  for (const [name, list] of groupedByName) {
    const best = [...list].sort((a, b) => b.score - a.score)[0];
    if (best.score >= 0.65) {
      overrides[name] = {
        lat: best.lat,
        lng: best.lng,
        confidenceScore: best.score,
      };
    }
  }

  fs.mkdirSync(path.dirname(suggestionPath), { recursive: true });
  fs.mkdirSync(path.dirname(manualOverridePath), { recursive: true });
  fs.writeFileSync(
    suggestionPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        unresolvedCount: unresolved.length,
        suggestionCount: suggestions.length,
        suggestions,
      },
      null,
      2,
    ),
    "utf8",
  );
  fs.writeFileSync(manualOverridePath, JSON.stringify(overrides, null, 2), "utf8");

  console.log(`Unresolved: ${unresolved.length}`);
  console.log(`Suggestions: ${suggestions.length}`);
  console.log(`Overrides written: ${Object.keys(overrides).length}`);
  console.log(`- ${suggestionPath}`);
  console.log(`- ${manualOverridePath}`);
}

void main();
