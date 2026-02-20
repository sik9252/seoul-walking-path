# 서울걷길 Backend (NestJS)

## 실행
```bash
cd backend
npm install
npm run start:dev
```

- API base URL: `http://localhost:4000/api`
- Swagger UI: `http://localhost:4000/docs`

## 관광지 데이터 동기화
```bash
cd backend
npm run sync:tour-places
```

- 기본값은 전국(`TOUR_API_AREA_CODES=ALL`) 순회 수집입니다.
- 특정 지역만 수집하려면 `TOUR_API_AREA_CODES=1,6,39` 형태로 설정하세요.

## 현재 범위 (MVP 초안)
- `GET /api/health`
- `GET /api/places`
- `POST /api/visits/check`
- `GET /api/cards/catalog`
- `GET /api/cards/my`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/kakao`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/session`
