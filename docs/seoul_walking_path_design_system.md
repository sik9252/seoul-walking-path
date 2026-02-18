# 서울걷길 MVP 디자인 시스템 v1 (React Native)

기준 문서: `seoul_walking_path_mvp_wireframes.md`  
Figma 반영 범위(2026-02-17):  
- MCP: S0(84:3706), S1(84:2480), S2(84:2551), S3(84:2606)  
- 이미지 제공: S4, S5, S6, S7, S8, S9, S10, S11, S12(empty/filled), S13  
메인 브랜드 컬러: `#386A20`

## 1) Design Principles

- 한 손 조작 우선: 핵심 액션은 하단 집중
- 지도 맥락 우선: 지도 가림 최소화, 정보는 Bottom Sheet로 제공
- 즉시 가독성: 걷는 중 숫자/상태를 1초 내 읽히도록 구성
- 실패 케이스 친화: 권한/GPS/저장 실패 상태를 명확히 안내

## 2) Foundation Tokens

### 2.1 Color

```text
base.background #FFFFFF   <- 앱 기본 배경(개발 기준)
base.surface    #FFFFFF
base.subtle     #E0E5D9
base.subtleAlt  #DDE5D8
base.border     #E5E7EB
base.text       #1A1C18
base.textSubtle #43473E

brand.50   #F3F8F0
brand.100  #D9EBCF
brand.200  #BEDDAE
brand.300  #A3CF8C
brand.400  #7FB55D
brand.500  #5B9A3D
brand.600  #386A20   <- Main Brand
brand.700  #2E561A
brand.800  #244314
brand.900  #1A300E

neutral.0   #FFFFFF
neutral.50  #F8F9F7
neutral.100 #F1F3EF
neutral.200 #E3E7DF
neutral.300 #CDD5C9
neutral.400 #9CA89A
neutral.500 #6F7A6D
neutral.600 #4D564C
neutral.700 #323931
neutral.800 #1F241F
neutral.900 #111411

semantic.success #2E7D32
semantic.warning #B26A00
semantic.error   #C62828
semantic.info    #1565C0

accent.lime.100 #B7F397   <- 스플래시 로고 배경/배지/강조
```

상태/역할 컬러:

- 배경: `base.background`
- 기본 텍스트: `base.text`
- 보조 텍스트: `base.textSubtle`
- 경계선: `base.border`
- Primary 액션: `brand.600`
- Primary pressed: `brand.700`
- Destructive 액션: `semantic.error`
- 맵 코스 라인: `brand.600`
- 실제 이동 트랙: `#1F8B4C`

### 2.2 Typography

```text
font.family.base: Noto Sans KR (fallback: Pretendard, System)

display.lg: 32 / 40 / 700
title.lg:   24 / 30 / 700
title.md:   20 / 28 / 700
title.sm:   18 / 27 / 700
body.lg:    16 / 24 / 500
body.md:    15 / 22 / 500
body.sm:    14 / 20 / 400
label.lg:   16 / 22 / 600
label.md:   14 / 20 / 600
label.sm:   12 / 16 / 600
caption:    12 / 16 / 500
```

### 2.3 Spacing / Radius / Elevation

```text
spacing: 4, 8, 12, 16, 20, 24, 32, 40
radius.sm: 8
radius.md: 12
radius.lg: 16
radius.xl: 24
radius.pill: 999

elevation.1: y=1 blur=2  opacity=0.05
elevation.2: y=4 blur=6  opacity=0.10
elevation.3: y=8 blur=20 opacity=0.16
```

터치 목표:

- 최소 터치 영역 높이: `44`
- 주요 CTA 높이: `56` (Figma S1/S2 실측)
- 트래킹 핵심 버튼 높이: `56`

## 3) Core Components (MVP)

### 3.1 Button

- `PrimaryButton`: 배경 `brand.600`, 텍스트 흰색, 높이 56
- `SecondaryButton`: 배경 흰색, 테두리 `brand.600`, 텍스트 `brand.700`
- `DestructiveButton`: 배경 `semantic.error`, 텍스트 흰색
- Disabled: 배경 `neutral.200`, 텍스트 `neutral.400`
- 아이콘+텍스트 버튼 기본 gap: 8

### 3.2 Input / Search

- 높이 48, 라운드 999, 배경 흰색, 테두리 `base.border`
- Focus: 테두리 `brand.600` + 1dp
- Placeholder: `neutral.400`

### 3.3 Chip

- `FilterChip`: 선택 시 dark 배경(`base.text`) + 밝은 텍스트(`base.background`)
- `TagChip`: 정보 태그 전용, `neutral.100` 배경
- 최소 높이 32, 좌우 패딩 12
- 라운드 12 (S4 실측)

### 3.4 Card

- 기본 카드: 흰색 배경, 라운드 16~24, 경계선 `base.border`, elevation.1
- `RouteCard`, `RouteListItem`, `RecordCard`, `POICard` 공통 베이스 사용
- `RouteListItem`(S4/S12 filled): 썸네일 96x96, 카드 라운드 16
- `RecordCard`(S9): 좌측 아이콘 타일 64x64, 우측 시간 배지 포함

### 3.5 TopBanner / Toast

- `TopBanner`: 상태별 좌측 아이콘 + 메시지 + 선택 CTA
- `Toast`: 하단 플로팅, 2.5초 자동 닫힘, 성공/오류 변형 제공

### 3.6 Map UI

- FAB(센터링): 48x48, 원형, 흰색 배경, 아이콘 `brand.700`
- Zoom Control: 수직 스택 2버튼, 각 40x40
- Bottom Sheet:
  - 접힘 높이 96~120
  - 확장 높이 최대 70%
  - 상단 핸들 포함

### 3.7 Tracking HUD

- 핵심 수치 3개: 시간 / 거리 / 페이스
- 큰 숫자(Title.sm), 단위(Label.sm)
- 하단 액션: `일시정지(Primary)` + `종료(Destructive)`
- 기록 상태 배지: `RECORDING` 라벨 사용(brand tint)

### 3.8 Bottom Tab (Figma S3 반영)

- 높이: 64 + 상단 border 1
- 기본 배경: `base.background`
- 활성 탭: 라벨 `brand.600`, 아이콘 배경 `accent.lime.100`
- 비활성 탭: 라벨 `base.textSubtle`

## 4) Screen Composition Mapping

### S0 Splash

- 중앙 로고 + 로딩
- 배경 `base.background`

### S1 Onboarding

- 페이지형 레이아웃, 하단 CTA 고정
- 헤드라인 `title.lg`, 본문 `body.md`

### S2 Permission

- 설명 카드 + Primary/Secondary CTA
- 거부 상태 카드 변형 사용

### S3 Home

- AppBar + 위치 스트립 + 퀵 필터 + 가로 `RouteCard`
- 검색 입력은 pill 형태(높이 48, 좌측 아이콘 고정)
- 필터 칩은 12 radius, 활성은 dark 배경/밝은 텍스트

### S4 Routes

- 검색 인풋 + 필터 요약 바 + `RouteListItem` 리스트
- 정렬/필터는 Bottom Sheet
- 리스트 카드 상단 이미지 비율은 약 16:9 유지

### S5 Route Detail

- 상단 `MapPreview` + 메타 블록 + 시설 요약 + 하단 CTA
- 지도 위 우측 FAB 2개(센터링/레이어), 하단 고정 CTA + 북마크 보조 버튼

### S6 Pre-Start Checks

- 상태별 단일 포커스 카드(권한/백그라운드/시작점 이격)
- 하단 2버튼: `나중에`(outline) + `산책 시작하기`(primary)
- 경고 박스(저배터리)는 error tinted surface 사용

### S7 Tracking

- 지도 전체 + 상단 미니 상태바 + 하단 `TrackingHUD`
- 트래킹 중 바텀탭 숨김
- 하단 시트 내부 메트릭 3분할(거리/걸음/소모량)

### S8 Walk Summary

- 지도 스냅샷 + 통계 카드 + 메모 입력 + 저장/삭제 CTA
- 감정 선택 세그먼트(4개) 포함

### S9 Records

- 주간 요약 스트립 + 날짜 그룹 `RecordCard`
- 상단 필터 탭(`전체/산책/트레킹/등산`) 포함

### S10 Record Detail

- 지도 + 통계 + 연결 코스 진입 CTA
- AppBar 우측 overflow(⋮) 메뉴 배치

### S11 My/Settings

- 설정 섹션 리스트(트래킹/데이터/지원)
- 프로필 카드 + 핵심 통계 2칸(총 거리/완주 코스)

### S12 Favorites

- S12는 별도 상태 화면으로 유지
- `empty`: 일러스트 + 안내문 + `코스 탐색하기`
- `filled`: 저장 코스 리스트(`RouteListItem` 재사용)

### S13 Report Issue (P2)

- 라디오 + 텍스트 입력 + 제출 CTA
- 라디오 row height 56, 제출 버튼은 하단 고정

## 5) React Native Theme Token Shape (초안)

```ts
export const theme = {
  color: {
    base: {
      background: '#FDFDF5',
      surface: '#FFFFFF',
      subtle: '#E0E5D9',
      subtleAlt: '#DDE5D8',
      border: '#E5E7EB',
      text: '#1A1C18',
      textSubtle: '#43473E',
    },
    brand: {
      50: '#F3F8F0',
      100: '#D9EBCF',
      200: '#BEDDAE',
      300: '#A3CF8C',
      400: '#7FB55D',
      500: '#5B9A3D',
      600: '#386A20',
      700: '#2E561A',
      800: '#244314',
      900: '#1A300E',
    },
    accent: {
      lime100: '#B7F397',
    },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32 },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 },
};
```

## 7) Figma Sync Notes

1. MCP 호출 한도 문제로 S0~S3는 MCP 기준, S4~S13은 사용자 제공 이미지 기준으로 확정함.  
2. `S4 - 코스 목록` 링크는 node가 `S3`와 동일(`84:2606`)이었으나, 이미지 기준으로 보정 완료.  
3. 현재 토큰/컴포넌트는 MVP 화면 구현 가능한 수준으로 고정됨. 남은 차이는 개발 단계에서 디바이스별 safe-area만 조정.

## 6) First Build Order (UI 기준)

1. 토큰(`color`, `typography`, `spacing`, `radius`, `shadow`) 구현  
2. 공통 컴포넌트(Button/Input/Chip/Card/Banner/Toast) 구현  
3. 지도 관련 공통 컴포넌트(MapPreview/BottomSheet/POI/TrackingHUD) 구현  
4. 화면 구현: `S3 -> S4 -> S5 -> S7 -> S8 -> S9` 우선  
5. 실패 케이스(권한/GPS/저장 실패) 상태 화면 추가
