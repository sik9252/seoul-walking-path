# 관광지 데이터 소스 및 비용 메모 (MVP)

최종 업데이트: 2026-02-19

## 1) 데이터 소스
- 1차 소스: 한국관광공사 TourAPI (대한민국 관광정보)
- 적용 범위: 서울(AreaCode=1) 우선
- 앱 사용 방식: 앱 직접 호출 금지, 백엔드 배치 동기화 후 API 서빙

## 2) 환경변수
- `TOUR_API_SERVICE_KEY` : 공공데이터포털에서 발급받은 인증키
- `TOUR_API_BASE_URL` : 기본값 `https://apis.data.go.kr/B551011/KorService2/areaBasedList2`
- `TOUR_API_AREA_CODE` : 기본값 `1` (서울)
- `TOUR_API_PAGE_SIZE` : 기본값 `100`

## 3) 비용 리스크
- TourAPI 자체는 공공 API라 일반적으로 직접 과금보다 호출 한도/정책 제한 리스크가 큼
- 운영 비용이 커지는 지점:
  - 백엔드 호스팅(슬립 해제, 트래픽 증가)
  - PostgreSQL 관리형 DB
  - 지도/외부 지오코딩 API 추가 사용량
- 현재 MVP 구조(일 1회 동기화 + 서버 서빙)는 비용 최소화에 유리

## 4) 운영 원칙
- 일 1회 배치 동기화
- 실패 시 재시도 및 알림(Webhook)
- 원천 응답(raw) + 정규화 결과 모두 보관
