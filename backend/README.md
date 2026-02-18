# 서울걷길 Backend (NestJS)

## 실행
```bash
cd backend
npm install
npm run start:dev
```

- API base URL: `http://localhost:4000/api`
- Swagger UI: `http://localhost:4000/docs`

## 현재 범위 (MVP 초안)
- `GET /api/routes`
- `GET /api/routes/:routeId`
- `GET /api/pois`
- `GET /api/sessions`
- `POST /api/sessions`
- `GET /api/favorites`
- `POST /api/favorites/:routeId/toggle`
