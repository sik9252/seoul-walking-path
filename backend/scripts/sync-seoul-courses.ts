import * as fs from "node:fs";
import * as path from "node:path";
import { loadEnvFile } from "../src/common/load-env";

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
  [key: string]: unknown;
};

const rootDir = path.resolve(__dirname, "..");
const rawOutputPath = path.join(rootDir, "data/raw/seoul-course-info.json");
const normalizedOutputPath = path.join(rootDir, "data/generated/seoul-courses.normalized.json");
const DEFAULT_PAGE_SIZE = 1000;

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

function parseServiceUrl(sourceUrl: string) {
  const parsed = new URL(sourceUrl);
  const segments = parsed.pathname.split("/").filter((item) => item.length > 0);
  if (segments.length < 5) {
    throw new Error("Invalid SEOUL_COURSE_INFO_URL format.");
  }

  const [key, type, service, start, end, ...rest] = segments;
  const startIndex = Number(start);
  const endIndex = Number(end);
  const tail = rest.length > 0 ? `/${rest.join("/")}` : "";

  return {
    origin: parsed.origin,
    key,
    type,
    service,
    startIndex: Number.isFinite(startIndex) ? startIndex : 1,
    endIndex: Number.isFinite(endIndex) ? endIndex : DEFAULT_PAGE_SIZE,
    tail,
  };
}

function buildServiceUrl(
  base: ReturnType<typeof parseServiceUrl>,
  startIndex: number,
  endIndex: number,
) {
  return `${base.origin}/${base.key}/${base.type}/${base.service}/${startIndex}/${endIndex}${base.tail}`;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function extractRowsAndTotal(payload: unknown, serviceName?: string): { rows: unknown[]; totalCount: number | null } {
  if (!payload || typeof payload !== "object") return { rows: [], totalCount: null };
  const obj = payload as RawPayload;

  if (Array.isArray(obj.DATA)) return { rows: obj.DATA, totalCount: toNumber((obj as Record<string, unknown>).list_total_count) };
  if (Array.isArray(obj.data)) return { rows: obj.data, totalCount: toNumber((obj as Record<string, unknown>).list_total_count) };

  const serviceKeyCandidates = serviceName
    ? [serviceName, serviceName.toLowerCase(), serviceName.toUpperCase()]
    : [];

  for (const key of serviceKeyCandidates) {
    const candidate = (obj as Record<string, unknown>)[key];
    if (!candidate || typeof candidate !== "object") continue;
    const nested = candidate as Record<string, unknown>;
    const row = nested.row;
    if (Array.isArray(row)) {
      return { rows: row, totalCount: toNumber(nested.list_total_count) };
    }
  }

  for (const value of Object.values(obj)) {
    if (!value || typeof value !== "object") continue;
    const nested = value as Record<string, unknown>;
    const row = nested.row;
    if (Array.isArray(row)) {
      return { rows: row, totalCount: toNumber(nested.list_total_count) };
    }
  }

  return { rows: [], totalCount: null };
}

async function main() {
  loadEnvFile();
  const sourceUrl = process.env.SEOUL_COURSE_INFO_URL;
  if (!sourceUrl) {
    throw new Error("Missing SEOUL_COURSE_INFO_URL env. Set the sheet open API URL first.");
  }

  const timeoutMs = Number(process.env.SEOUL_API_TIMEOUT_MS ?? 15000);
  const safeTimeout = Number.isFinite(timeoutMs) ? timeoutMs : 15000;
  const base = parseServiceUrl(sourceUrl);
  const pageSize = Math.max(1, base.endIndex - base.startIndex + 1);

  let start = base.startIndex;
  let end = base.endIndex;
  let totalCount: number | null = null;
  const allRows: unknown[] = [];
  const rawPages: unknown[] = [];

  while (true) {
    const pageUrl = buildServiceUrl(base, start, end);
    const pageJson = await fetchJson(pageUrl, safeTimeout);
    rawPages.push(pageJson);

    const { rows, totalCount: extractedTotal } = extractRowsAndTotal(pageJson, base.service);
    if (totalCount === null && extractedTotal !== null) {
      totalCount = extractedTotal;
    }
    allRows.push(...rows);

    if (rows.length === 0) break;
    if (totalCount !== null && allRows.length >= totalCount) break;
    if (rows.length < pageSize) break;

    start = end + 1;
    end = start + pageSize - 1;
  }

  const normalizedRows = normalizeRows(allRows);

  if (normalizedRows.length === 0) {
    throw new Error("No valid rows found in Seoul course payload.");
  }

  const rawSnapshot = {
    fetchedAt: new Date().toISOString(),
    sourceUrl,
    totalCount,
    pageSize,
    pages: rawPages.length,
    payload: rawPages,
  };
  const normalizedSnapshot = {
    fetchedAt: new Date().toISOString(),
    sourceUrl,
    totalCount,
    count: normalizedRows.length,
    courses: normalizedRows,
  };

  fs.mkdirSync(path.dirname(rawOutputPath), { recursive: true });
  fs.mkdirSync(path.dirname(normalizedOutputPath), { recursive: true });
  fs.writeFileSync(rawOutputPath, JSON.stringify(rawSnapshot, null, 2), "utf8");
  fs.writeFileSync(normalizedOutputPath, JSON.stringify(normalizedSnapshot, null, 2), "utf8");

  console.log(`Synced ${normalizedRows.length} courses from Seoul Open API (list_total_count=${totalCount ?? "unknown"})`);
  console.log(`- raw snapshot: ${rawOutputPath}`);
  console.log(`- normalized: ${normalizedOutputPath}`);
}

void main();
