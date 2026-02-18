import * as fs from "node:fs";
import * as path from "node:path";

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

const rootDir = path.resolve(__dirname, "..");
const inputPath = path.join(rootDir, "data/generated/course-checkpoints.geocoded.json");
const outputPath = path.join(rootDir, "data/generated/unresolved-checkpoints.csv");

function toCsvLine(values: Array<string | number | null>) {
  return values
    .map((value) => {
      const raw = value === null ? "" : String(value);
      return `"${raw.replace(/"/g, '""')}"`;
    })
    .join(",");
}

function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing geocoded checkpoint file: ${inputPath}`);
  }

  const payload = JSON.parse(fs.readFileSync(inputPath, "utf8")) as GeocodedSnapshot;
  const checkpoints = Array.isArray(payload.checkpoints) ? payload.checkpoints : [];
  const unresolved = checkpoints.filter((cp) => cp.needsReview);

  const header = toCsvLine(["course_id", "checkpoint_order", "canonical_name", "lat", "lng", "confidence_score"]);
  const rows = unresolved.map((cp) =>
    toCsvLine([cp.courseId, cp.checkpointOrder, cp.canonicalName, cp.lat, cp.lng, cp.confidenceScore]),
  );
  const csv = [header, ...rows].join("\n");

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, csv, "utf8");

  console.log(`Wrote ${unresolved.length} unresolved checkpoints -> ${outputPath}`);
}

main();
