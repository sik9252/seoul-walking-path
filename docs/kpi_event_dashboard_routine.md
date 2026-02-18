# KPI 이벤트 대시보드 확인 루틴 (서울걷길 MVP)

## 목표
- 핵심 퍼널(탐색 → 시작 → 완료)의 이탈 구간을 빠르게 파악
- 즐겨찾기/POI 상호작용으로 콘텐츠 선호도 확인

## 확인 주기
- 주 2회: 화/금 오전
- 릴리즈 주간: 매일 1회

## 필수 지표
- `view_home`
- `view_route_list`
- `view_route_detail`
- `click_start_walk`
- `walk_pause`, `walk_resume`
- `walk_finish`
- `route_favorite_add`, `route_favorite_remove`
- `poi_click`
- `permission_location_granted`, `permission_location_denied`

## 점검 순서
1. `view_route_list -> click_start_walk` 전환율 확인
2. `click_start_walk -> walk_finish` 완료율 확인
3. `permission_location_denied` 급증 여부 확인
4. 인기 코스/POI 상위 10개 확인

## 경보 기준 (초기)
- 완료율 20%p 이상 하락
- 권한 거부율 15% 초과
- 특정 이벤트가 24시간 이상 0건

## 액션 템플릿
- 원인 가설
- 영향 범위
- 수정안
- 검증 계획(다음 3일)
