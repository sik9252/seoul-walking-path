# 서울걷길 Mock -> API 전환 계획

## 1) API 클라이언트 계층 추가
- `src/repositories/api` 추가
- `fetch` 기반 공통 클라이언트(`apiClient.ts`) 작성
- 에러 타입 공통화 (network/server/validation)

## 2) 엔드포인트 교체 우선순위
1. Route/POI 조회 (`GET /routes`, `GET /routes/:id`, `GET /pois`)
2. Favorite 토글/목록 (`POST /favorites/:routeId/toggle`, `GET /favorites`)
3. Session 저장/조회 (`POST /sessions`, `GET /sessions`)

## 3) 점진 전환 방식
- 단계별 feature flag(`USE_REMOTE_API`) 도입
- 초기에는 mock fallback 유지
- API 성공 시 원격 데이터 우선 사용

## 4) 검증 체크포인트
- 코스 목록/상세 데이터 정합성
- 즐겨찾기 토글 일관성
- 산책 종료 후 저장 -> 기록 목록 즉시 반영
- 앱 재실행 후 로컬/원격 동기화 동작

## 5) 배포 전 조건
- API base URL 환경변수 분리(dev/prod)
- OpenAPI 계약 고정 후 프론트 타입 생성 자동화 검토
- 실패 시 fallback UX(재시도/오프라인 안내) 확정
