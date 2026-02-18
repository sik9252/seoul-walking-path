# 공식 코스 라인/이탈판단용 좌표 소스 탐색

업데이트: 2026-02-18

## 결론 요약
- 현재 확인된 서울 데이터 중
  - `서울둘레길 코스정보(OA-22438)`는 코스 메타데이터 중심이며 좌표 선형이 없음
  - `서울시 둘레길 선형 위치정보(WGS84, OA-11986)`와 `서울둘레길 안내정보(OA-22402)`는 4유형(상업 이용 금지/변경 금지)
- 따라서 **상업 서비스 기준의 "공식 코스 라인 오버레이 + 이탈 판단"은 현 상태로 바로 확정하기 어려움**

## 확인한 공식 데이터/정책
1. 서울 열린데이터광장 이용약관/정책
- 링크: https://data.seoul.go.kr/etc/accessTerms.do

2. 서울둘레길 코스정보 (OA-22438)
- 링크: https://data.seoul.go.kr/dataList/OA-22438/S/1/datasetView.do
- 코스명/거리/난이도/시작·종료 지점 등 메타데이터 중심

3. 서울시 둘레길 선형 위치정보 WGS84 (OA-11986)
- 링크: https://data.seoul.go.kr/dataList/OA-11986/S/1/datasetView.do
- 지도 선형 구현에 필요한 좌표 계열 데이터
- 다만 상업 사용 제약 여부 확인 필요(4유형 표기 사례)

4. 서울둘레길 안내정보 (OA-22402)
- 링크: https://data.seoul.go.kr/dataList/OA-22402/S/1/datasetView.do
- 안내 정보 중심
- 다만 상업 사용 제약 여부 확인 필요(4유형 표기 사례)

5. 서울시 저작권 정책
- 링크: https://www.seoul.go.kr/helper/copyright.do

## 대체 소스 후보(상업 사용 가능성 중심)
### A. OSM(OpenStreetMap) 기반 직접 구축
- 장점
  - 상업 이용 가능(ODbL 준수 전제)
  - 전 세계 공통 포맷/도구(Overpass 등) 사용 가능
- 주의
  - ODbL 준수(출처표시, 파생 DB 공유 의무 검토) 필요
  - 기본 타일 서버 직접 대량 사용 금지(운영 시 자체 타일/외부 상용 타일 고려)
- 참고
  - OSM Copyright/License: https://www.openstreetmap.org/copyright
  - Overpass API: https://wiki.openstreetmap.org/wiki/Overpass_API
  - OSMF Tile usage policy: https://operations.osmfoundation.org/policies/tiles/

### B. 1st-party 경로 데이터 구축(직접 수집)
- 방식
  - 초기 코스별 기준 GPX/GeoJSON을 직접 제작/검수
  - 앱 트래킹 데이터로 지속 보정
- 장점
  - 라이선스 리스크 최소
  - 서비스 목적에 맞춘 품질 제어 가능
- 단점
  - 초기 인력/검수 비용 발생

### C. 서울시/운영기관 사전 허가 후 선형 데이터 사용
- 방식
  - OA-11986/OA-22402 담당 부서에 상업 이용 허가/범위 문의
- 장점
  - 공식 코스 정합성 확보
- 단점
  - 협의 리드타임/조건 불확실

## 권장 실행 순서
1. 단기(즉시)
- 코스 목록/상세 + 사용자 GPS 트랙 기능을 유지
- 코스 라인 오버레이/이탈 판단은 feature flag로 보류

2. 중기(2~4주)
- OSM 기반 PoC 3개 코스 생성(GeoJSON)
- 이탈 판단 알고리즘(최근접 거리 기반) 정확도 테스트

3. 의사결정
- OSM 라이선스 준수 운영안 채택 또는
- 서울시 공식 선형 데이터 상업 이용 허가 획득 후 전환

## 현재 프로젝트 적용 상태
- 구현 완료
  - 코스 목록/상세 화면 (메타데이터 기반)
  - 실시간 내 GPS 궤적 표시 (사용자 위치 기반)
- 보류
  - 공식 코스 라인 오버레이 + 이탈 판단
