import * as fs from "node:fs";
import * as path from "node:path";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { AuthProviderLink, AuthUser, PlaceCard, PlaceItem, RefreshTokenSession, UserVisitItem } from "./models";

const DEMO_USER_ID = "demo-user";
const ACCESS_TOKEN_TTL_SECONDS = 60 * 30;
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 14;
const NICKNAME_COOLDOWN_DAYS = 7;
const NICKNAME_COOLDOWN_MS = NICKNAME_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

type TourPlaceSnapshot = {
  places: Array<{
    sourceId: string;
    areaCode?: string;
    region?: string;
    title: string;
    category: string;
    address: string;
    lat: number;
    lng: number;
    imageUrl?: string | null;
    rarity?: "common" | "rare" | "epic" | "legendary";
  }>;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const earthRadius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function normalizePlaceCategory(raw: string): string {
  if (raw.startsWith("A01")) return "자연";
  if (raw.startsWith("A02")) return "문화";
  if (raw.startsWith("A03")) return "레저";
  return "일반";
}

function inferRegionFromAddress(address: string): string {
  const value = address.trim();
  if (!value) return "기타";
  if (value.startsWith("서울")) return "서울";
  if (value.startsWith("부산")) return "부산";
  if (value.startsWith("대구")) return "대구";
  if (value.startsWith("인천")) return "인천";
  if (value.startsWith("광주")) return "광주";
  if (value.startsWith("대전")) return "대전";
  if (value.startsWith("울산")) return "울산";
  if (value.startsWith("세종")) return "세종";
  if (value.startsWith("경기")) return "경기";
  if (value.startsWith("강원")) return "강원";
  if (value.startsWith("충북")) return "충북";
  if (value.startsWith("충남")) return "충남";
  if (value.startsWith("경북")) return "경북";
  if (value.startsWith("경남")) return "경남";
  if (value.startsWith("전북")) return "전북";
  if (value.startsWith("전남")) return "전남";
  if (value.startsWith("제주")) return "제주";
  return "기타";
}

function rarityByIndex(index: number): "common" | "rare" | "epic" | "legendary" {
  if (index % 97 === 0) return "legendary";
  if (index % 17 === 0) return "epic";
  if (index % 5 === 0) return "rare";
  return "common";
}

function rarityPriority(rarity?: "common" | "rare" | "epic" | "legendary") {
  if (rarity === "legendary") return 4;
  if (rarity === "epic") return 3;
  if (rarity === "rare") return 2;
  return 1;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, digest] = stored.split(":");
  if (!salt || !digest) return false;
  const compared = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(compared, "hex"));
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function randomId(prefix: string) {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

const BANNED_NICKNAME_KEYWORDS = [
  "씨발",
  "시발",
  "병신",
  "개새",
  "좆",
  "fuck",
  "bitch",
  "sex",
  "porn",
  "도박",
  "카지노",
  "토토",
];

function normalizeNicknameForModeration(value: string) {
  return value.toLowerCase().replace(/[\s\-_.,/\\!@#$%^&*()+=[\]{}:;"'`~<>?|]/g, "");
}

function isInappropriateNickname(value: string) {
  const normalized = normalizeNicknameForModeration(value);
  if (!normalized) return true;
  if (BANNED_NICKNAME_KEYWORDS.some((keyword) => normalized.includes(keyword))) return true;
  if (/https?:\/\//i.test(value) || /www\./i.test(value)) return true;
  if (/010[-\s]?\d{3,4}[-\s]?\d{4}/.test(value)) return true;
  if (/(kakao|카카오|텔레그램|telegram|insta|instagram|line|wechat)/i.test(value)) return true;
  if (/(.)\1{5,}/.test(normalized)) return true;
  return false;
}

@Injectable()
export class MockStoreService {
  private places: PlaceItem[] = [];
  private cards: PlaceCard[] = [];
  private userPlaceVisits: UserVisitItem[] = [];
  private users: AuthUser[] = [];
  private authProviders: AuthProviderLink[] = [];
  private refreshSessions: RefreshTokenSession[] = [];
  private readonly jwtSecret = process.env.AUTH_JWT_SECRET ?? "dev-auth-secret";

  constructor() {
    this.bootstrapAuthData();
    this.bootstrapPlaceData();
    this.bootstrapDemoVisits();
  }

  private bootstrapAuthData() {
    const now = new Date().toISOString();
    this.users = [
      {
        id: DEMO_USER_ID,
        username: "demo",
        passwordHash: passwordHash("demo1234"),
        createdAt: now,
      },
    ];
  }

  private bootstrapPlaceData() {
    const backendRoot = path.resolve(__dirname, "../..");
    const placesPath = path.join(backendRoot, "data/generated/tour-places.normalized.json");
    if (!fs.existsSync(placesPath)) {
      this.places = [
        {
          id: "place-sample-1",
          sourceId: "sample-1",
          areaCode: "1",
          region: "서울",
          name: "경복궁",
          category: "문화",
          address: "서울 종로구 사직로 161",
          lat: 37.579617,
          lng: 126.977041,
        },
        {
          id: "place-sample-2",
          sourceId: "sample-2",
          areaCode: "1",
          region: "서울",
          name: "남산서울타워",
          category: "랜드마크",
          address: "서울 용산구 남산공원길 105",
          lat: 37.55117,
          lng: 126.988227,
        },
      ];
      this.cards = this.places.map((place, index) => ({
        cardId: `card-${place.id}`,
        placeId: place.id,
        title: `${place.name}`,
        rarity: rarityByIndex(index + 1),
      }));
      console.warn(`[mock-store] places file not found: ${placesPath}. fallback sample loaded.`);
      return;
    }

    try {
      const snapshot = JSON.parse(fs.readFileSync(placesPath, "utf8")) as TourPlaceSnapshot;
      const rows = Array.isArray(snapshot.places) ? snapshot.places : [];
      this.places = rows.map((row, index) => ({
        id: `place-${row.sourceId}`,
        sourceId: row.sourceId,
        areaCode: row.areaCode ?? "0",
        region: row.region ?? inferRegionFromAddress(row.address),
        name: row.title,
        category: normalizePlaceCategory(row.category),
        address: row.address,
        lat: row.lat,
        lng: row.lng,
        imageUrl: row.imageUrl ?? null,
      }));
      this.cards = this.places.map((place, index) => ({
        cardId: `card-${place.id}`,
        placeId: place.id,
        title: `${place.name}`,
        rarity: rows[index]?.rarity ?? rarityByIndex(index + 1),
        imageUrl: place.imageUrl ?? null,
      }));
      console.log(`[mock-store] loaded ${this.places.length} places from ${placesPath}`);
    } catch (error) {
      console.error("[mock-store] failed to load tour places, fallback sample", error);
    }
  }

  private bootstrapDemoVisits() {
    if (this.places.length === 0) return;

    const now = Date.now();
    const seedPlaces = this.places.slice(0, 4);
    this.userPlaceVisits = seedPlaces.map((place, index) => ({
      userId: DEMO_USER_ID,
      placeId: place.id,
      firstVisitedAt: new Date(now - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
      lat: place.lat,
      lng: place.lng,
    }));
  }

  private createAccessToken(userId: string) {
    const payload = {
      sub: userId,
      type: "access",
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS,
    };
    const headerEncoded = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payloadEncoded = toBase64Url(JSON.stringify(payload));
    const signature = createHmac("sha256", this.jwtSecret)
      .update(`${headerEncoded}.${payloadEncoded}`)
      .digest("base64url");
    return `${headerEncoded}.${payloadEncoded}.${signature}`;
  }

  private verifyAccessToken(token: string) {
    const [headerEncoded, payloadEncoded, signature] = token.split(".");
    if (!headerEncoded || !payloadEncoded || !signature) return null;
    const expected = createHmac("sha256", this.jwtSecret).update(`${headerEncoded}.${payloadEncoded}`).digest("base64url");
    if (expected !== signature) return null;
    try {
      const payload = JSON.parse(fromBase64Url(payloadEncoded)) as { sub?: string; exp?: number; type?: string };
      if (payload.type !== "access" || !payload.sub || !payload.exp) return null;
      if (payload.exp * 1000 < Date.now()) return null;
      return payload.sub;
    } catch {
      return null;
    }
  }

  private createRefreshTokenSession(userId: string) {
    const token = randomBytes(48).toString("base64url");
    const now = Date.now();
    const session: RefreshTokenSession = {
      id: randomId("rt"),
      userId,
      refreshTokenHash: sha256(token),
      expiresAt: new Date(now + REFRESH_TOKEN_TTL_SECONDS * 1000).toISOString(),
      createdAt: new Date(now).toISOString(),
    };
    this.refreshSessions.push(session);
    return { session, rawToken: token };
  }

  private buildAuthResponse(user: AuthUser, refreshToken: string) {
    return {
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
      },
      accessToken: this.createAccessToken(user.id),
      refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  signup(payload: { username: string; password: string }) {
    const username = payload.username.trim().toLowerCase();
    if (this.users.some((user) => user.username.toLowerCase() === username)) {
      return { ok: false as const, reason: "username_exists" };
    }
    const now = new Date().toISOString();
    const user: AuthUser = {
      id: randomId("user"),
        username,
        passwordHash: passwordHash(payload.password),
        nicknameChangeCount: 0,
        createdAt: now,
      };
    this.users.push(user);
    const { rawToken } = this.createRefreshTokenSession(user.id);
    return { ok: true as const, ...this.buildAuthResponse(user, rawToken) };
  }

  login(payload: { username: string; password: string }) {
    const username = payload.username.trim().toLowerCase();
    const user = this.users.find((item) => item.username.toLowerCase() === username);
    if (!user?.passwordHash) {
      return { ok: false as const, reason: "invalid_credentials" };
    }
    if (!verifyPassword(payload.password, user.passwordHash)) {
      return { ok: false as const, reason: "invalid_credentials" };
    }
    const { rawToken } = this.createRefreshTokenSession(user.id);
    return { ok: true as const, ...this.buildAuthResponse(user, rawToken) };
  }

  loginWithKakao(payload: { kakaoUserId: string; username?: string; nickname?: string }) {
    const providerUserId = payload.kakaoUserId.trim();
    const linked = this.authProviders.find((item) => item.provider === "kakao" && item.providerUserId === providerUserId);
    if (linked) {
      const user = this.users.find((item) => item.id === linked.userId);
      if (!user) {
        return { ok: false as const, reason: "user_not_found" };
      }
      if (!user.nickname && payload.nickname?.trim()) {
        user.nickname = payload.nickname.trim();
      }
      const { rawToken } = this.createRefreshTokenSession(user.id);
      return { ok: true as const, ...this.buildAuthResponse(user, rawToken) };
    }

    const now = new Date().toISOString();
    const usernameCandidate = payload.username?.trim().toLowerCase() || `kakao_${providerUserId}`;
    let user = this.users.find((item) => item.username.toLowerCase() === usernameCandidate);
    const username =
      user?.username ??
      (this.users.some((item) => item.username.toLowerCase() === usernameCandidate)
        ? `${usernameCandidate}_${providerUserId.slice(-4)}`
        : usernameCandidate);
    if (!user) {
      user = {
        id: randomId("user"),
        username,
        nickname: payload.nickname?.trim() || undefined,
        nicknameChangeCount: 0,
        createdAt: now,
      };
      this.users.push(user);
    }
    this.authProviders.push({
      id: randomId("provider"),
      userId: user.id,
      provider: "kakao",
      providerUserId,
      createdAt: now,
    });
    const { rawToken } = this.createRefreshTokenSession(user.id);
    return { ok: true as const, ...this.buildAuthResponse(user, rawToken) };
  }

  refresh(payload: { refreshToken: string }) {
    const tokenHash = sha256(payload.refreshToken);
    const found = this.refreshSessions.find((item) => item.refreshTokenHash === tokenHash && !item.revokedAt);
    if (!found) {
      return { ok: false as const, reason: "invalid_refresh_token" };
    }
    if (new Date(found.expiresAt).getTime() < Date.now()) {
      found.revokedAt = new Date().toISOString();
      return { ok: false as const, reason: "refresh_token_expired" };
    }
    found.revokedAt = new Date().toISOString();
    const user = this.users.find((item) => item.id === found.userId);
    if (!user) {
      return { ok: false as const, reason: "user_not_found" };
    }
    const { rawToken } = this.createRefreshTokenSession(user.id);
    return { ok: true as const, ...this.buildAuthResponse(user, rawToken) };
  }

  logout(payload: { refreshToken: string }) {
    const tokenHash = sha256(payload.refreshToken);
    const found = this.refreshSessions.find((item) => item.refreshTokenHash === tokenHash && !item.revokedAt);
    if (found) {
      found.revokedAt = new Date().toISOString();
    }
    return { ok: true as const };
  }

  getUserByAccessToken(token?: string) {
    if (!token) return null;
    const userId = this.verifyAccessToken(token);
    if (!userId) return null;
    const user = this.users.find((item) => item.id === userId);
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
    };
  }

  updateUserNickname(payload: { userId: string; nickname: string }) {
    const user = this.users.find((item) => item.id === payload.userId);
    if (!user) {
      return { ok: false as const, reason: "user_not_found" };
    }
    const nickname = payload.nickname.trim();
    if (isInappropriateNickname(nickname)) {
      return { ok: false as const, reason: "inappropriate_nickname" };
    }

    const changeCount = user.nicknameChangeCount ?? 0;
    const nowMs = Date.now();
    if (changeCount > 0 && user.nicknameUpdatedAt) {
      const lastChangedMs = new Date(user.nicknameUpdatedAt).getTime();
      if (Number.isFinite(lastChangedMs) && nowMs - lastChangedMs < NICKNAME_COOLDOWN_MS) {
        return {
          ok: false as const,
          reason: "nickname_cooldown",
          retryAt: new Date(lastChangedMs + NICKNAME_COOLDOWN_MS).toISOString(),
        };
      }
    }

    user.nickname = nickname;
    user.nicknameUpdatedAt = new Date(nowMs).toISOString();
    user.nicknameChangeCount = changeCount + 1;
    return {
      ok: true as const,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
      },
    };
  }

  getPlaces(params: {
    lat?: number;
    lng?: number;
    radius?: number;
    minLat?: number;
    maxLat?: number;
    minLng?: number;
    maxLng?: number;
    limit?: number;
    page: number;
    pageSize: number;
  }) {
    const { lat, lng, radius, minLat, maxLat, minLng, maxLng, limit, page, pageSize } = params;
    let rows = this.places;

    if (minLat !== undefined && maxLat !== undefined && minLng !== undefined && maxLng !== undefined) {
      rows = rows.filter(
        (place) => place.lat >= minLat && place.lat <= maxLat && place.lng >= minLng && place.lng <= maxLng,
      );
    }

    if (lat !== undefined && lng !== undefined) {
      const applyRadius = radius ?? 5000;
      rows = rows.filter((place) => distanceInMeters(lat, lng, place.lat, place.lng) <= applyRadius);
    }

    if (limit !== undefined) {
      const safeLimit = Math.min(500, Math.max(1, Math.floor(limit)));
      const items = rows.slice(0, safeLimit);
      return {
        items,
        page: 1,
        pageSize: safeLimit,
        total: rows.length,
        hasNext: rows.length > safeLimit,
      };
    }

    const safePage = Math.max(1, Math.floor(page));
    const safePageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
    const startIndex = (safePage - 1) * safePageSize;
    const items = rows.slice(startIndex, startIndex + safePageSize);
    const total = rows.length;

    return {
      items,
      page: safePage,
      pageSize: safePageSize,
      total,
      hasNext: startIndex + items.length < total,
    };
  }

  checkPlaceVisit(payload: { userId: string; lat: number; lng: number; radiusM: number; excludePlaceIds?: string[] }) {
    const { userId, lat, lng, radiusM, excludePlaceIds = [] } = payload;
    const excluded = new Set(excludePlaceIds);
    const collected = new Set(
      this.userPlaceVisits.filter((visit) => visit.userId === userId).map((visit) => visit.placeId),
    );
    const candidates = this.places
      .map((place) => ({
        place,
        distanceM: distanceInMeters(lat, lng, place.lat, place.lng),
        card: this.cards.find((item) => item.placeId === place.id) ?? null,
      }))
      .filter((row) => row.distanceM <= radiusM)
      .filter((row) => !excluded.has(row.place.id))
      .filter((row) => !collected.has(row.place.id))
      .sort((a, b) => {
        const distanceDiff = a.distanceM - b.distanceM;
        if (Math.abs(distanceDiff) > 0.1) return distanceDiff;
        const rarityDiff = rarityPriority(b.card?.rarity) - rarityPriority(a.card?.rarity);
        if (rarityDiff !== 0) return rarityDiff;
        return a.place.id.localeCompare(b.place.id);
      });
    const candidate = candidates[0];

    if (!candidate) {
      return {
        matched: false,
        collected: false,
        remainingCollectableCount: 0,
      };
    }

    const now = new Date().toISOString();
    this.userPlaceVisits.push({
      userId,
      placeId: candidate.place.id,
      firstVisitedAt: now,
      lat,
      lng,
    });
    const card = candidate.card;

    return {
      matched: true,
      collected: true,
      place: candidate.place,
      card,
      distanceM: Math.round(candidate.distanceM),
      collectedAt: now,
      remainingCollectableCount: Math.max(0, candidates.length - 1),
    };
  }

  getCardCatalog(params?: { page?: number; pageSize?: number; userId?: string; region?: string }) {
    const safePage = Math.max(1, Math.floor(params?.page ?? 1));
    const safePageSize = Math.min(100, Math.max(1, Math.floor(params?.pageSize ?? 20)));
    const userId = params?.userId ?? DEMO_USER_ID;
    const region = params?.region?.trim();
    const acquiredPlaceIds = new Set(
      this.userPlaceVisits.filter((visit) => visit.userId === userId).map((visit) => visit.placeId),
    );

    let rows = this.cards.map((card) => {
      const place = this.places.find((item) => item.id === card.placeId) ?? null;
      return {
        ...card,
        place,
        collected: acquiredPlaceIds.has(card.placeId),
      };
    });

    if (region) {
      rows = rows.filter((row) => row.place?.region === region);
    }

    const startIndex = (safePage - 1) * safePageSize;
    const items = rows.slice(startIndex, startIndex + safePageSize);
    return {
      items,
      page: safePage,
      pageSize: safePageSize,
      total: rows.length,
      hasNext: startIndex + items.length < rows.length,
    };
  }

  getMyCards(userId: string) {
    const acquiredPlaceIds = new Set(
      this.userPlaceVisits.filter((visit) => visit.userId === userId).map((visit) => visit.placeId),
    );
    return this.cards
      .filter((card) => acquiredPlaceIds.has(card.placeId))
      .map((card) => ({
        ...card,
        place: this.places.find((place) => place.id === card.placeId) ?? null,
      }));
  }
}
