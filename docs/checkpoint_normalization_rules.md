# 체크포인트 정규화 규칙 (ROAD_DTL_NM 기반)

## 1) 원본 필드
- `ROAD_DTL_NM`: 세부 코스명(문자열)
- `BGNG_PSTN`: 시작 위치
- `END_PSTN`: 종료 위치

## 2) 파싱 규칙
1. 구분자: 기본 `,` 로 split
2. trim: 각 항목 앞뒤 공백 제거
3. 공백 정규화: 연속 공백을 1칸으로
4. 빈 문자열 제거
5. 중복 제거: 동일 텍스트는 첫 항목만 유지

## 3) canonical 이름 규칙
- 원문 보존 필드: `raw_name`
- 정규화 필드: `canonical_name`
- 정규화 처리
  - 괄호 내용 제거(예: `(구 당고개역)`)
  - HTML 태그 제거(`<br />`)
  - 특수문자 변형 통일(`·`, `ㆍ` 등)
- 동의어 사전(`alias_map`) 적용
  - 예: `불암산역(구 당고개역)` -> `불암산역`

## 4) 순서 보정 규칙
1. 파싱된 리스트에서 시작점/종료점 후보 위치 탐색
2. `BGNG_PSTN`이 뒤쪽, `END_PSTN`이 앞쪽이면 reverse 적용
3. reverse 후에도 시작/종료 매칭이 모호하면 `manual_review=true`

## 5) 품질 플래그
- `needs_review`: 좌표 매칭 실패/낮은 신뢰도/순서 모호
- `confidence_score`: 0~1
- `source`: `auto_geocode` | `manual_fix`

## 6) 결과 스키마(예시)
- `course_id`
- `checkpoint_order`
- `raw_name`
- `canonical_name`
- `lat`
- `lng`
- `confidence_score`
- `needs_review`
