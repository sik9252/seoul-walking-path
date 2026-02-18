# 체크포인트 진행도 API 계약 초안

## 엔드포인트
1. `GET /routes/{routeId}/checkpoints`
- 코스 체크포인트 목록 조회

2. `POST /attempts`
- 새 도전(Attempt) 시작
- 요청: `userId`, `routeId`
- 응답: 진행도 객체

3. `GET /attempts/{attemptId}`
- 진행도 조회

4. `POST /attempts/{attemptId}/location`
- 위치 샘플 업로드
- 서버가 반경 40m 기준으로 신규 체크포인트 방문 판정
- 응답: `newlyVisitedCheckpointIds`, `progress`

5. `POST /attempts/{attemptId}/complete`
- 도전 종료 처리
- 모든 체크포인트 방문 시 `completed`, 아니면 `abandoned`

## 판정 규칙
- 반경: 40m
- 순서 강제: 없음
- 중복 체크: 불가 (`attemptId + checkpointId` unique)

## 상태 모델
- `in_progress`: 도전 진행 중
- `completed`: 모든 체크포인트 방문
- `abandoned`: 중도 종료
