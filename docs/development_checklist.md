# 서울걷길 MVP 개발 체크리스트

기준 문서: `seoul_walking_path_prd_mvp.md`  
사용 방식: 각 단계 완료 시 체크박스 업데이트 + 관련 커밋 해시 기록

## 0. 진행 규칙
- [x] 기능 단위(feature)로 커밋/푸시
- [x] 각 단계 완료 후 체크박스 업데이트
- [x] 이슈/버그 발생 시 "메모" 섹션에 즉시 기록

## 1. UI 정합성 고정
- [x] S0~S13 화면 Figma 대비 1차 정합
- [x] 토큰(색/타입/간격) 최종 고정
- [x] 공통 컴포넌트 API 정리(Button/Input/Chip/Card/BottomSheet/TabBar)
- [x] UI freeze 커밋

## 2. 내비게이션 구조 확정
- [x] 온보딩 플로우(S0~S2)와 메인 플로우 분리
- [x] 탭/스택 구조 정리(홈/코스/기록/마이 + 트래킹 예외)
- [x] 뒤로가기/딥링크/전환 규칙 점검
- [x] 내비게이션 구조 커밋

## 3. 도메인 타입/상태관리 정리
- [x] Route/POI/WalkSession/Favorite 타입 고정
- [x] mock repository 계층 분리
- [x] 화면 상태와 도메인 상태 분리(store 정리)
- [x] 타입/스토어 정리 커밋

## 4. 코스 탐색 완성 (FR-1, FR-2)
- [x] 검색 기능
- [x] 필터 기능(거리/시간/지역/테마)
- [x] 정렬 기능
- [x] 코스 상세 + 즐겨찾기 동작 완성
- [x] 코스 탐색 기능 커밋

## 5. 트래킹 엔진 구현 (FR-3)
- [x] 시작/일시정지/재개/종료 상태머신
- [x] 시간/거리 계산
- [x] 노이즈 포인트 필터 1차
- [x] 백그라운드 기록 기본 지원
- [x] 트래킹 엔진 커밋

## 6. 지도 + POI 구현 (FR-4)
- [x] 코스 목록/상세 화면 구현(코스 메타데이터 기반)
- [x] 실시간 내 GPS 궤적 표시(사용자 위치 기반 트래킹)
- [x] POI 카테고리 토글
- [x] POI 카드 + 외부 길찾기 액션
- [ ] 공식 코스 라인 오버레이 + 이탈 판단(상업 이용 가능한 좌표 소스 확정 후)
- [x] 지도/POI 기능 커밋

## 7. 기록 저장/조회 완성 (FR-5)
- [x] 로컬 영속화(AsyncStorage 또는 SQLite)
- [x] 기록 목록/상세 연결
- [ ] 앱 재실행 후 복원 확인
- [x] 기록 저장 기능 커밋

## 8. 실패 케이스/안정성 (NFR)
- [x] 위치 권한 거부 UX
- [x] GPS 품질 저하 배너
- [x] 저장 실패 재시도 UX
- [x] 안정성 개선 커밋

## 9. 분석 이벤트 적용
- [x] view_home / view_route_list / view_route_detail
- [x] click_start_walk / walk_pause / walk_resume / walk_finish
- [x] poi_click / route_favorite_add/remove
- [x] permission_location_granted/denied
- [x] 이벤트 트래킹 커밋

## 10. 백엔드 준비 및 API 계약
- [x] OpenAPI 초안(Route/POI/Session/Favorite)
- [x] NestJS 서버 부트스트랩
- [x] 프론트 mock -> API 교체 계획 수립
- [x] API 계약/서버 초기화 커밋

## 11. Android 배포 준비
- [x] EAS build 설정
- [x] 앱 ID/서명/버전 전략 정리
- [ ] Play Console 내부 테스트 트랙 배포
- [x] 배포 가이드 문서화 커밋

## 12. PRD 누락 방지 항목(추가)
- [x] 위치/이동경로 개인정보 고지 화면 및 문구 반영
- [x] 기록 삭제 기능(개별/전체) 구현
- [x] 트래킹 모드(균형/정확) 설정 반영
- [x] 크래시/오류 모니터링(Sentry 등) 연동
- [x] KPI 이벤트 대시보드 확인 루틴 정의
- [x] DoD 테스트 코스 5개 시나리오 체크리스트 작성

## 13. 체크포인트 완주 방식 전환 (신규)
- [x] 완주 기준 확정: Attempt(도전) 단위로 모든 체크포인트 방문 시 완주
- [x] 재도전 정책 확정: 새 Attempt로 시작, 이전 Attempt 진행도는 누적 통계로만 보관
- [x] 체크 반경 기준 확정(예: 40m)
- [x] 체크 순서 강제 여부 확정(권장: 비강제)
- [x] `ROAD_DTL_NM` 파싱/정규화 규칙 정의(구분자/중복/공백/오탈자)
- [x] `BGNG_PSTN`·`END_PSTN` 기준 포인트 순서 보정 규칙 정의
- [x] 좌표 수집 파이프라인 설계(1회성 변환 + 수동 검수 + DB 저장)
- [x] DB 스키마 설계(`course_checkpoints`, `course_attempts`, `attempt_checkpoint_visits`)
- [ ] 체크포인트 진행도 API 계약 초안 작성
- [ ] 백엔드 판정 로직(반경 체크/중복 체크 방지/완주 계산) 구현
- [ ] 프론트 체크포인트 UI/진행도 연동 구현
- [ ] QA 시나리오(경계 반경/재도전/복원) 작성 및 검증

## 메모
- 지도 라이브러리 결정 보류: `react-native-maps` 우선 검토, 지도 작업(섹션 6) 시작 시 최종 결정.
- 비용/운영 조건: 무료 또는 무료구간 내 운용 가능한 옵션 우선.
- UI 정합성 진행 중: S4(코스 목록), S5(코스 상세) 1차 정합 패치 완료.
- UI 정합성 진행 중: S7(트래킹), S8(요약) 1차 정합 패치 완료.
- UI 정합성 진행 중: S9/S10/S11/S12/S13 1차 정합 패치 완료.
- 아키텍처 정리: `src/domain/types.ts`, `src/repositories/mock`, `src/hooks/useWalkingAppState.ts` 도입.
- 컴포넌트 API 정리: `TabBar`에 `renderIcon(active)` API 추가, 활성 상태 아이콘 분기 적용.
- 토큰 정리: 화면 코드 하드코딩 색상을 제거하고 `theme tokens` 기반으로 통일.
- 코스 탐색 고도화: `CourseListScreen` 검색/필터/정렬 상태를 실제 동작으로 연결.
- 트래킹 상태머신 도입: `src/domain/tracking.ts` + `useWalkingAppState`에서 실시간 메트릭 계산.
- 안정성 보강: `TopBanner` 공통 컴포넌트 도입, 트래킹 화면 GPS 저품질 경고 노출.
- 분석 이벤트 1차 연결: `src/analytics/tracker.ts` 기반으로 핵심 view/action 이벤트 추적.
- 분석 이벤트 확장: 코스 상세 `주요 포인트` 클릭 시 `poi_click` 이벤트 기록.
- 백그라운드 보정: 앱 복귀 시 누락된 경과 시간을 `AppState` 기반으로 추적값에 반영.
- 지도/POI 1차 구현: 코스 상세 POI 카테고리/길찾기 액션, 트래킹 화면 코스/트랙/현재 위치 시각화.
- 영속화 적용: `@react-native-async-storage/async-storage`로 기록/즐겨찾기 상태 저장 및 복원 연결.
- 안정성 보강(영속화): 저장 예외를 `try/catch` 처리해 저장 실패 시에도 앱 흐름이 중단되지 않도록 보호.
- 백엔드 1차: `backend/`에 NestJS 부트스트랩, `backend/openapi.seoul-walking-path-mvp.yaml` 초안, `docs/mock_to_api_migration_plan.md` 작성.
- Android 배포 준비: `eas.json` 추가, 앱 ID(`com.sik9252.seoulwalkingpath`)와 버전 전략, 내부테스트 배포 가이드 초안 문서화.
- 추가 항목 반영: 권한 화면에서 개인정보 고지 화면 진입, 기록 화면 개별/전체 삭제 기능 구현.
- 추가 항목 반영: 설정 화면에 트래킹 모드(균형/정확) 도입, 모드 값을 로컬 영속화.
- 운영 문서 추가: `docs/kpi_event_dashboard_routine.md`, `docs/dod_test_course_scenarios.md`.
- 모니터링 추가: `@sentry/react-native` 설치 및 `src/monitoring/sentry.ts` 초기화 연결.
- 경로 데이터 정책: 서울둘레길 코스정보(1유형)는 상업 활용 가능, 선형 위치정보/안내정보(4유형)는 상업/변경 제한.
- 좌표 소스 탐색 필요: 상업 이용 가능한 공식/대체 경로 좌표 확보 후 `공식 코스 라인 오버레이 + 이탈 판단` 단계 진행.
- 기획 전환: 코스 선형 오버레이/이탈판단 대신 체크포인트(ROAD_DTL_NM) 방문 기반 완주 방식 채택.
- 체크포인트 정책 확정: Attempt 단위 완주, 재도전 시 새 Attempt, 반경 40m, 순서 비강제.
- 정규화 규칙 문서화: `docs/checkpoint_normalization_rules.md` (파싱/canonical/순서보정/검수 플래그).
- 좌표 파이프라인 문서/스크립트 추가: `docs/checkpoint_coordinate_pipeline.md`, `backend/scripts/build-checkpoint-seed.ts`.
- DB 스키마 초안 추가: `docs/checkpoint_db_schema.md`, `backend/sql/checkpoint_schema.sql`.
