import * as fs from "node:fs";
import * as path from "node:path";
import { loadEnvFile } from "../src/common/load-env";

type TourApiItem = {
  contentid?: string | number;
  contenttypeid?: string | number;
  title?: string;
  addr1?: string;
  addr2?: string;
  mapx?: string | number;
  mapy?: string | number;
  firstimage?: string;
  firstimage2?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
};

type TourApiResponse = {
  response?: {
    header?: {
      resultCode?: string;
      resultMsg?: string;
    };
    body?: {
      pageNo?: number;
      numOfRows?: number;
      totalCount?: number;
      items?: {
        item?: TourApiItem[] | TourApiItem;
      };
    };
  };
};

type PlaceRow = {
  sourceId: string;
  title: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl: string | null;
};

const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "data/generated/tour-places.normalized.json");

function toNumber(input: string | number | undefined): number | null {
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input === "string") {
    const parsed = Number(input);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function extractItems(payload: TourApiResponse): TourApiItem[] {
  const raw = payload.response?.body?.items?.item;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function normalizeItems(items: TourApiItem[]): PlaceRow[] {
  return items
    .map((item) => {
      const lat = toNumber(item.mapy);
      const lng = toNumber(item.mapx);
      if (lat === null || lng === null) return null;
      const sourceId = item.contentid ? String(item.contentid) : "";
      const title = (item.title ?? "").trim();
      if (!sourceId || !title) return null;
      return {
        sourceId,
        title,
        category: item.cat3 ?? item.cat2 ?? item.cat1 ?? "ETC",
        address: [item.addr1, item.addr2].filter(Boolean).join(" ").trim(),
        lat,
        lng,
        imageUrl: item.firstimage || item.firstimage2 || null,
      } satisfies PlaceRow;
    })
    .filter((item): item is PlaceRow => !!item);
}

function normalizeServiceKey(raw: string): string {
  const trimmed = raw.trim();
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

async function fetchPage(baseUrl: string, params: URLSearchParams, pageNo: number): Promise<TourApiResponse> {
  params.set("pageNo", String(pageNo));
  const response = await fetch(`${baseUrl}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Tour API request failed (${response.status})`);
  }
  return (await response.json()) as TourApiResponse;
}

async function main() {
  loadEnvFile();
  const rawServiceKey = process.env.TOUR_API_SERVICE_KEY;
  const serviceKey = rawServiceKey ? normalizeServiceKey(rawServiceKey) : "";
  if (!serviceKey) {
    throw new Error("Missing TOUR_API_SERVICE_KEY in env");
  }

  const baseUrl =
    process.env.TOUR_API_BASE_URL ?? "https://apis.data.go.kr/B551011/KorService2/areaBasedList2";
  const areaCode = process.env.TOUR_API_AREA_CODE ?? "1";
  const numOfRows = Math.max(1, Number(process.env.TOUR_API_PAGE_SIZE ?? "100"));
  const timeoutMs = Math.max(5000, Number(process.env.TOUR_API_TIMEOUT_MS ?? "15000"));

  const params = new URLSearchParams({
    serviceKey,
    MobileOS: "ETC",
    MobileApp: "SeoulWalkgil",
    _type: "json",
    areaCode,
    numOfRows: String(numOfRows),
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const allItems: TourApiItem[] = [];

  try {
    let page = 1;
    let totalCount = 0;

    while (true) {
      const pageResponse = await fetchPage(baseUrl, params, page);
      const resultCode = pageResponse.response?.header?.resultCode;
      if (resultCode && resultCode !== "0000") {
        const message = pageResponse.response?.header?.resultMsg ?? "unknown";
        throw new Error(`Tour API error ${resultCode}: ${message}`);
      }

      const pageItems = extractItems(pageResponse);
      allItems.push(...pageItems);
      totalCount = pageResponse.response?.body?.totalCount ?? totalCount;

      if (pageItems.length === 0) break;
      if (totalCount > 0 && allItems.length >= totalCount) break;
      if (pageItems.length < numOfRows) break;

      page += 1;
    }

    const normalized = normalizeItems(allItems);
    const dedup = new Map<string, PlaceRow>();
    normalized.forEach((row) => dedup.set(row.sourceId, row));
    const places = [...dedup.values()];

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          fetchedAt: new Date().toISOString(),
          totalCount,
          count: places.length,
          areaCode,
          places,
        },
        null,
        2,
      ),
      "utf8",
    );

    console.log(`Synced tour places: total=${totalCount}, normalized=${places.length}`);
    console.log(`Output: ${outputPath}`);
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}

void main();
