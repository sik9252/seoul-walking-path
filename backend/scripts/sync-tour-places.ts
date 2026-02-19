import * as fs from "node:fs";
import * as path from "node:path";
import { loadEnvFile } from "../src/common/load-env";

type TourApiItem = {
  contentid?: string | number;
  contenttypeid?: string | number;
  areacode?: string | number;
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
  areaCode: string;
  region: string;
  title: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl: string | null;
};

const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "data/generated/tour-places.normalized.json");

const REGION_BY_AREA_CODE: Record<string, string> = {
  "1": "서울",
  "2": "인천",
  "3": "대전",
  "4": "대구",
  "5": "광주",
  "6": "부산",
  "7": "울산",
  "8": "세종",
  "31": "경기",
  "32": "강원",
  "33": "충북",
  "34": "충남",
  "35": "경북",
  "36": "경남",
  "37": "전북",
  "38": "전남",
  "39": "제주",
};

const DEFAULT_AREA_CODES = Object.keys(REGION_BY_AREA_CODE);

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

function normalizeItems(items: TourApiItem[], fallbackAreaCode: string): PlaceRow[] {
  return items
    .map((item) => {
      const lat = toNumber(item.mapy);
      const lng = toNumber(item.mapx);
      if (lat === null || lng === null) return null;
      const areaCode = item.areacode ? String(item.areacode) : fallbackAreaCode;
      const region = REGION_BY_AREA_CODE[areaCode] ?? "기타";
      const sourceId = item.contentid ? String(item.contentid) : "";
      const title = (item.title ?? "").trim();
      if (!sourceId || !title) return null;
      return {
        sourceId,
        areaCode,
        region,
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

function encodeServiceKey(raw: string): string {
  return encodeURIComponent(raw.trim());
}

async function fetchPage(baseUrl: string, params: URLSearchParams, serviceKeyEncoded: string, pageNo: number): Promise<TourApiResponse> {
  params.set("pageNo", String(pageNo));
  const response = await fetch(`${baseUrl}?serviceKey=${serviceKeyEncoded}&${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Tour API request failed (${response.status})`);
  }
  return (await response.json()) as TourApiResponse;
}

async function main() {
  loadEnvFile();
  const rawServiceKey = process.env.TOUR_API_SERVICE_KEY;
  const serviceKeyEncoded = rawServiceKey ? encodeServiceKey(rawServiceKey) : "";
  if (!serviceKeyEncoded) {
    throw new Error("Missing TOUR_API_SERVICE_KEY in env");
  }

  const baseUrl =
    process.env.TOUR_API_BASE_URL ?? "https://apis.data.go.kr/B551011/KorService2/areaBasedList2";
  const rawAreaCodes = process.env.TOUR_API_AREA_CODES ?? process.env.TOUR_API_AREA_CODE ?? "ALL";
  const areaCodes =
    rawAreaCodes.trim().toUpperCase() === "ALL"
      ? DEFAULT_AREA_CODES
      : rawAreaCodes
          .split(",")
          .map((code) => code.trim())
          .filter(Boolean);
  if (areaCodes.length === 0) {
    throw new Error("No area codes configured. Set TOUR_API_AREA_CODES or TOUR_API_AREA_CODE.");
  }
  const numOfRows = Math.max(1, Number(process.env.TOUR_API_PAGE_SIZE ?? "100"));
  const timeoutMs = Math.max(5000, Number(process.env.TOUR_API_TIMEOUT_MS ?? "15000"));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const allItems: TourApiItem[] = [];
  const totalByAreaCode: Record<string, number> = {};

  try {
    for (const areaCode of areaCodes) {
      const params = new URLSearchParams({
        MobileOS: "ETC",
        MobileApp: "SeoulWalkgil",
        _type: "json",
        areaCode,
        numOfRows: String(numOfRows),
      });

      let page = 1;
      let areaTotalCount = 0;

      while (true) {
        const pageResponse = await fetchPage(baseUrl, params, serviceKeyEncoded, page);
        const resultCode = pageResponse.response?.header?.resultCode;
        if (resultCode && resultCode !== "0000") {
          const message = pageResponse.response?.header?.resultMsg ?? "unknown";
          throw new Error(`Tour API error ${resultCode}: ${message}`);
        }

        const pageItems = extractItems(pageResponse).map((item) => ({
          ...item,
          areacode: item.areacode ?? areaCode,
        }));
        allItems.push(...pageItems);
        areaTotalCount = pageResponse.response?.body?.totalCount ?? areaTotalCount;

        if (pageItems.length === 0) break;
        if (areaTotalCount > 0 && page * numOfRows >= areaTotalCount) break;
        if (pageItems.length < numOfRows) break;

        page += 1;
      }
      totalByAreaCode[areaCode] = areaTotalCount;
      console.log(`Fetched areaCode=${areaCode} (${REGION_BY_AREA_CODE[areaCode] ?? "기타"}) total=${areaTotalCount}`);
    }

    const normalized = allItems.flatMap((item) => normalizeItems([item], item.areacode ? String(item.areacode) : "0"));
    const dedup = new Map<string, PlaceRow>();
    normalized.forEach((row) => dedup.set(row.sourceId, row));
    const places = [...dedup.values()];
    const totalCount = Object.values(totalByAreaCode).reduce((acc, value) => acc + value, 0);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          fetchedAt: new Date().toISOString(),
          totalCount,
          count: places.length,
          areaCodes,
          totalByAreaCode,
          places,
        },
        null,
        2,
      ),
      "utf8",
    );

    console.log(`Synced tour places: total=${totalCount}, normalized=${places.length}, areaCodes=${areaCodes.join(",")}`);
    console.log(`Output: ${outputPath}`);
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}

void main();
