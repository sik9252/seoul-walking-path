import fs from "node:fs";
import path from "node:path";

type SeoulCourseRow = {
  menuSn: string;
  roadNo: number;
  roadNm: string;
  roadSubTtl: string;
  roadExpln: string;
  roadDtlNm: string;
  reqHr: string;
  roadLenKm: number;
  lvKorn: string;
  bgngPstn: string;
  endPstn: string;
  seoulMapUrl: string;
  fileDownloadLink: string;
  stmpPstn1: string | null;
  stmpPstn2: string | null;
  stmpPstn3: string | null;
};

type RawPayload = {
  DATA?: unknown[];
  data?: unknown[];
};

const rootDir = path.resolve(__dirname, "..");
const rawOutputPath = path.join(rootDir, "data/raw/seoul-course-info.json");
const normalizedOutputPath = path.join(rootDir, "data/generated/seoul-courses.normalized.json");

function pickString(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function pickNullableString(row: Record<string, unknown>, keys: string[]): string | null {
  const value = pickString(row, keys);
  return value.length > 0 ? value : null;
}

function pickNumber(row: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function normalizeRows(rows: unknown[]): SeoulCourseRow[] {
  return rows
    .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
    .map((row) => ({
      menuSn: pickString(row, ["menu_sn", "MENU_SN"]),
      roadNo: pickNumber(row, ["road_no", "ROAD_NO"]),
      roadNm: pickString(row, ["road_nm", "ROAD_NM"]),
      roadSubTtl: pickString(row, ["road_sub_ttl", "ROAD_SUB_TTL"]),
      roadExpln: pickString(row, ["road_expln", "ROAD_EXPLN"]),
      roadDtlNm: pickString(row, ["road_dtl_nm", "ROAD_DTL_NM"]),
      reqHr: pickString(row, ["req_hr", "REQ_HR"]),
      roadLenKm: pickNumber(row, ["road_len", "ROAD_LEN"]),
      lvKorn: pickString(row, ["lv_korn", "LV_KORN"]),
      bgngPstn: pickString(row, ["bgng_pstn", "BGNG_PSTN"]),
      endPstn: pickString(row, ["end_pstn", "END_PSTN"]),
      seoulMapUrl: pickString(row, ["seoul_map_url", "SEOUL_MAP_URL"]),
      fileDownloadLink: pickString(row, ["file_dwnld_lnkg", "FILE_DWNLD_LNKG"]),
      stmpPstn1: pickNullableString(row, ["stmp_pstn_1", "STMP_PSTN_1"]),
      stmpPstn2: pickNullableString(row, ["stmp_pstn_2", "STMP_PSTN_2"]),
      stmpPstn3: pickNullableString(row, ["stmp_pstn_3", "STMP_PSTN_3"]),
    }))
    .filter((row) => row.roadNo > 0 && row.roadNm.length > 0);
}

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch Seoul course data (${response.status})`);
    }
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const sourceUrl = process.env.SEOUL_COURSE_INFO_URL;
  if (!sourceUrl) {
    throw new Error("Missing SEOUL_COURSE_INFO_URL env. Set the sheet open API URL first.");
  }

  const timeoutMs = Number(process.env.SEOUL_API_TIMEOUT_MS ?? 15000);
  const rawJson = await fetchJson(sourceUrl, Number.isFinite(timeoutMs) ? timeoutMs : 15000);
  const payload = rawJson as RawPayload;
  const rows = Array.isArray(payload.DATA) ? payload.DATA : Array.isArray(payload.data) ? payload.data : [];
  const normalizedRows = normalizeRows(rows);

  if (normalizedRows.length === 0) {
    throw new Error("No valid rows found in Seoul course payload.");
  }

  const rawSnapshot = {
    fetchedAt: new Date().toISOString(),
    sourceUrl,
    payload: rawJson,
  };
  const normalizedSnapshot = {
    fetchedAt: new Date().toISOString(),
    sourceUrl,
    count: normalizedRows.length,
    courses: normalizedRows,
  };

  fs.mkdirSync(path.dirname(rawOutputPath), { recursive: true });
  fs.mkdirSync(path.dirname(normalizedOutputPath), { recursive: true });
  fs.writeFileSync(rawOutputPath, JSON.stringify(rawSnapshot, null, 2), "utf8");
  fs.writeFileSync(normalizedOutputPath, JSON.stringify(normalizedSnapshot, null, 2), "utf8");

  console.log(`Synced ${normalizedRows.length} courses from Seoul Open API`);
  console.log(`- raw snapshot: ${rawOutputPath}`);
  console.log(`- normalized: ${normalizedOutputPath}`);
}

void main();
