# 서울걷길 기술 스펙 (관광지 수집형 전환)

최종 업데이트: 2026-02-19

## 1) 제품 방향
- 앱 성격: 관광지 방문 수집 게임
- 핵심 루프: 위치 탐험 -> 반경 진입 판정 -> 카드 획득 -> 컬렉션 확장
- 정책: 동일 장소는 최초 1회만 수집, 재방문 시 추가 획득 없음

## 2) 프론트엔드
- Framework: React Native (Expo)
- Language: TypeScript
- 지도: MVP 1차는 리스트 중심(지도 뷰는 차기 단계에서 추가)
- 상태관리: React Hook 기반
- 저장소: AsyncStorage(로컬 UI 상태 캐시), 핵심 수집 데이터는 서버 기준

## 3) 백엔드
- Framework: NestJS
- Language: TypeScript
- DB: PostgreSQL(도입 예정)
- 배치: 관광지 원천 데이터 주 1회 동기화

## 4) 도메인 모델(목표)
- places
  - id, source_id, name, category, lat, lng, region, description, image_url
- place_cards
  - place_id, rarity, card_title, card_image_url
- user_place_visits
  - user_id, place_id, first_visited_at, last_position_lat, last_position_lng
- user_cards
  - user_id, card_id, acquired_at
- SQL 초안: `backend/sql/tour_collection_schema.sql`

## 5) API(목표)
- GET `/places?lat=&lng=&radius=&page=&pageSize=`
- POST `/visits/check` (현재 좌표 기반 방문 판정)
- GET `/cards/my`
- GET `/cards/catalog`

## 6) 방문 판정 규칙
- 입력: 사용자 현재 좌표(lat/lng), 타임스탬프
- 판정: 관광지 중심점으로부터 반경 `R` 미터 이내면 방문 성공
- 중복: `user_place_visits`에 이미 존재하면 성공 응답은 주되 신규 수집은 발생시키지 않음

## 7) 데이터 소스 전략
- 1차: 대한민국 관광지 공공 API(서울 우선)
- 원천 데이터 -> 정규화 -> DB 저장 -> 앱 서빙
- 앱은 공공 API를 직접 호출하지 않음

## 8) 배포
- Android 우선 배포
- 백엔드는 상시 접근 가능한 호스팅 필요(HTTPS)
- 환경변수: API 키/DB 접속정보/분석키를 시크릿으로 관리
