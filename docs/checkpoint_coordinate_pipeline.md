# 체크포인트 좌표 수집 파이프라인 설계

## 목적
- `ROAD_DTL_NM` 문자열 기반 체크포인트를 좌표(lat/lng)로 1회성 변환
- 변환 결과를 DB seed 형태로 저장
- 런타임에는 외부 지오코딩 API 호출 없이 DB 데이터만 사용

## 입력 데이터
- 서울둘레길 코스정보 API 응답(JSON)
- 필수 필드
  - `road_no`
  - `road_nm`
  - `bgng_pstn`
  - `end_pstn`
  - `road_dtl_nm`

## 처리 단계
1. Raw 수집
- `backend/data/raw/seoul-course-info.json` 저장

2. 파싱/정규화
- `road_dtl_nm` split(`,`) 후 trim
- 중복/빈 값 제거
- `bgng_pstn`·`end_pstn` 기준 순서 보정(reverse 가능)

3. 좌표 매핑
- 1차: 자동 매칭 결과 주입(`lat`,`lng`,`confidence_score`)
- 2차: 검수 파일에서 수동 보정(`needs_review=false`)

4. 산출물
- `backend/data/generated/course-checkpoints.seed.json`
- DB seed 적재

## 운영 규칙
- 상업 서비스 환경에서는 외부 API 실시간 호출 금지
- 좌표 데이터 갱신은 수동 배치(필요 시)로만 수행
- `needs_review=true` 항목은 운영 반영 금지

## 품질 기준
- `confidence_score >= 0.85` 또는 수동 검수 완료
- 각 코스 시작/종료 포인트가 첫/마지막 순서로 배치
- checkpoint_order 연속성 보장
