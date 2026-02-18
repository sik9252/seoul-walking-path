# 서울걷길 MVP 개발 체크리스트

기준 문서: `seoul_walking_path_prd_mvp.md`  
사용 방식: 각 단계 완료 시 체크박스 업데이트 + 관련 커밋 해시 기록

## 0. 진행 규칙
- [x] 기능 단위(feature)로 커밋/푸시
- [x] 각 단계 완료 후 체크박스 업데이트
- [x] 이슈/버그 발생 시 "메모" 섹션에 즉시 기록

## 1. UI 정합성 고정
- [x] S0~S13 화면 Figma 대비 1차 정합
- [ ] 토큰(색/타입/간격) 최종 고정
- [x] 공통 컴포넌트 API 정리(Button/Input/Chip/Card/BottomSheet/TabBar)
- [ ] UI freeze 커밋

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
- [ ] 검색 기능
- [ ] 필터 기능(거리/시간/지역/테마)
- [ ] 정렬 기능
- [ ] 코스 상세 + 즐겨찾기 동작 완성
- [ ] 코스 탐색 기능 커밋

## 5. 트래킹 엔진 구현 (FR-3)
- [ ] 시작/일시정지/재개/종료 상태머신
- [ ] 시간/거리 계산
- [ ] 노이즈 포인트 필터 1차
- [ ] 백그라운드 기록 기본 지원
- [ ] 트래킹 엔진 커밋

## 6. 지도 + POI 구현 (FR-4)
- [ ] 코스 라인/내 위치/트랙 표시
- [ ] POI 카테고리 토글
- [ ] POI 카드 + 외부 길찾기 액션
- [ ] 지도/POI 기능 커밋

## 7. 기록 저장/조회 완성 (FR-5)
- [ ] 로컬 영속화(AsyncStorage 또는 SQLite)
- [ ] 기록 목록/상세 연결
- [ ] 앱 재실행 후 복원 확인
- [ ] 기록 저장 기능 커밋

## 8. 실패 케이스/안정성 (NFR)
- [ ] 위치 권한 거부 UX
- [ ] GPS 품질 저하 배너
- [ ] 저장 실패 재시도 UX
- [ ] 안정성 개선 커밋

## 9. 분석 이벤트 적용
- [ ] view_home / view_route_list / view_route_detail
- [ ] click_start_walk / walk_pause / walk_resume / walk_finish
- [ ] poi_click / route_favorite_add/remove
- [ ] permission_location_granted/denied
- [ ] 이벤트 트래킹 커밋

## 10. 백엔드 준비 및 API 계약
- [ ] OpenAPI 초안(Route/POI/Session/Favorite)
- [ ] NestJS 서버 부트스트랩
- [ ] 프론트 mock -> API 교체 계획 수립
- [ ] API 계약/서버 초기화 커밋

## 11. Android 배포 준비
- [ ] EAS build 설정
- [ ] 앱 ID/서명/버전 전략 정리
- [ ] Play Console 내부 테스트 트랙 배포
- [ ] 배포 가이드 문서화 커밋

## 12. PRD 누락 방지 항목(추가)
- [ ] 위치/이동경로 개인정보 고지 화면 및 문구 반영
- [ ] 기록 삭제 기능(개별/전체) 구현
- [ ] 트래킹 모드(균형/정확) 설정 반영
- [ ] 크래시/오류 모니터링(Sentry 등) 연동
- [ ] KPI 이벤트 대시보드 확인 루틴 정의
- [ ] DoD 테스트 코스 5개 시나리오 체크리스트 작성

## 메모
- 지도 라이브러리 결정 보류: `react-native-maps` 우선 검토, 지도 작업(섹션 6) 시작 시 최종 결정.
- 비용/운영 조건: 무료 또는 무료구간 내 운용 가능한 옵션 우선.
- UI 정합성 진행 중: S4(코스 목록), S5(코스 상세) 1차 정합 패치 완료.
- UI 정합성 진행 중: S7(트래킹), S8(요약) 1차 정합 패치 완료.
- UI 정합성 진행 중: S9/S10/S11/S12/S13 1차 정합 패치 완료.
- 아키텍처 정리: `src/domain/types.ts`, `src/repositories/mock`, `src/hooks/useWalkingAppState.ts` 도입.
- 컴포넌트 API 정리: `TabBar`에 `renderIcon(active)` API 추가, 활성 상태 아이콘 분기 적용.
