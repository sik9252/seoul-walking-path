# 체크포인트 완주 방식 QA (1차)

검증일: 2026-02-18

## 자동 검증
- 스크립트: `backend/scripts/verify-checkpoint-flow.ts`
- 실행 명령: `cd backend && npx ts-node scripts/verify-checkpoint-flow.ts`
- 결과: `checkpoint flow verification passed`

검증 내용
1. Attempt 생성 시 체크포인트 개수 로딩 확인
2. 체크포인트 좌표 반경 판정으로 방문 처리 확인
3. 모든 체크포인트 방문 시 `completed` 전환 확인
4. 일부만 방문 후 종료 시 `abandoned` 전환 확인

## 수동 검증 체크리스트
- [ ] 반경 경계값(39m/40m/41m) 실제 디바이스 테스트
- [ ] 재도전 시 새 Attempt 생성 및 이전 진행도 보존 확인
- [ ] 앱 재시작 후 Attempt 복원 정책 확인
- [ ] GPS 저정확도 환경에서 오탐률 점검

## 비고
- 현재 자동 검증은 백엔드 인메모리 로직 기준이며, 실제 GPS 노이즈 환경 수동 검증은 별도 필요.
