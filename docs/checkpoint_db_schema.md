# 체크포인트 완주 기능 DB 스키마 초안

## 1) course_checkpoints
- 목적: 코스별 체크포인트 기준 좌표/순서 저장

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid(pk) | 체크포인트 ID |
| course_id | varchar | 코스 ID (`road-1` 등) |
| checkpoint_order | int | 코스 내 순서(1..N) |
| raw_name | varchar | 원본 지점명 |
| canonical_name | varchar | 정규화 이름 |
| lat | double precision | 위도 |
| lng | double precision | 경도 |
| confidence_score | double precision | 좌표 신뢰도(0~1) |
| needs_review | boolean | 검수 필요 여부 |
| source | varchar | `manual_fix` / `auto_geocode` |
| created_at | timestamptz | 생성시각 |
| updated_at | timestamptz | 수정시각 |

인덱스
- `idx_course_checkpoints_course_order(course_id, checkpoint_order)`
- `uniq_course_checkpoints_course_order(course_id, checkpoint_order)`

## 2) course_attempts
- 목적: 사용자의 코스 도전(세션) 상태 저장

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid(pk) | 도전 ID |
| user_id | varchar | 사용자 ID(익명 MVP는 device_id 가능) |
| course_id | varchar | 코스 ID |
| status | varchar | `in_progress` / `completed` / `abandoned` |
| started_at | timestamptz | 도전 시작 시각 |
| completed_at | timestamptz nullable | 완주시각 |
| total_checkpoints | int | 총 체크포인트 수 |
| visited_count | int | 방문한 체크포인트 수 |
| created_at | timestamptz | 생성시각 |
| updated_at | timestamptz | 수정시각 |

인덱스
- `idx_course_attempts_user_course(user_id, course_id)`
- `idx_course_attempts_user_status(user_id, status)`

## 3) attempt_checkpoint_visits
- 목적: 도전별 체크포인트 방문 이력(중복 방지)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid(pk) | 방문 ID |
| attempt_id | uuid(fk) | 도전 ID |
| checkpoint_id | uuid(fk) | 체크포인트 ID |
| visited_at | timestamptz | 방문 시각 |
| distance_m | double precision | 판정 시 거리(m) |
| lat | double precision | 방문 당시 위도 |
| lng | double precision | 방문 당시 경도 |
| created_at | timestamptz | 생성시각 |

인덱스/제약
- `uniq_attempt_checkpoint(attempt_id, checkpoint_id)` (중복 체크 방지)
- `idx_attempt_visits_attempt(attempt_id)`

## 4) 정책 반영
- 완주 판정: `visited_count == total_checkpoints`
- 재도전: 새 `course_attempts` row 생성
- 이전 attempt 진행도는 통계/이력으로 유지
