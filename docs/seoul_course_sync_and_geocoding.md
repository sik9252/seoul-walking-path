# 서울둘레길 동기화/지오코딩 운영안

## 목표
- 앱에서 서울 Open API를 직접 호출하지 않고, 백엔드가 일 1회 동기화한 데이터를 DB에서 서빙한다.
- 체크포인트 좌표는 Kakao Local API로 1회성 배치 생성 후 DB에 저장하고, 이후 변경분만 갱신한다.

## 권장 플로우
1. 서울 코스정보 동기화 (`일 1회`)
2. `ROAD_DTL_NM` 파싱 + `BGNG_PSTN`, `END_PSTN` 포함 체크포인트 생성
3. Kakao Local로 좌표 해석
4. 저신뢰/미해결 건 수동 검수
5. DB upsert 후 앱 API에서 조회

## 스크립트
- 서울 코스정보 동기화
  - `cd backend && SEOUL_COURSE_INFO_URL="<sheet-open-api-url>" npm run sync:seoul-courses`
  - 출력:
    - `backend/data/raw/seoul-course-info.json`
    - `backend/data/generated/seoul-courses.normalized.json`
- 체크포인트 좌표 지오코딩(Kakao)
  - `cd backend && KAKAO_REST_API_KEY="<kakao-rest-key>" npm run geocode:checkpoints:kakao`
  - 출력:
    - `backend/data/generated/course-checkpoints.geocoded.json`
- DB upsert SQL 생성
  - `cd backend && npm run build:checkpoint-upsert-sql`
  - 입력:
    - `backend/data/generated/course-checkpoints.geocoded.json`
  - 출력:
    - `backend/data/generated/course-checkpoints.upsert.sql`
- 일일 파이프라인 실행(오케스트레이션)
  - `cd backend && npm run sync:daily`
  - 내부 실행 순서:
    1. `sync:seoul-courses`
    2. `geocode:checkpoints:kakao`
    3. `build:checkpoint-upsert-sql`

## 자동 스케줄
- GitHub Actions: `.github/workflows/daily-course-sync.yml`
- 실행 시각: 매일 KST 01:00 (`cron: 0 16 * * *`, UTC 기준)
- 수동 실행: `workflow_dispatch`
- 실패 알림: `SYNC_FAILURE_WEBHOOK_URL` 환경변수 설정 시 웹훅 POST

필요한 GitHub Secrets
- `SEOUL_COURSE_INFO_URL`
- `KAKAO_REST_API_KEY`
- `SYNC_FAILURE_WEBHOOK_URL` (선택)

## 비용 메모
- 운영 기준으로는 초기 전체 지오코딩 1회 + 이후 일 1회 증분 호출이면 호출량이 매우 작아 무료 쿼터 내 운용 가능성이 높다.
- 단, 무료 쿼터/정책은 변경될 수 있으므로 월 1회 점검한다.

## 주의사항
- Kakao REST API 키는 서버 환경변수로만 주입하고 Git에 커밋하지 않는다.
- 지오코딩 결과는 오차가 있을 수 있으므로 `confidenceScore`, `needsReview` 기반 검수 단계가 필요하다.
