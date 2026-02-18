# 서울걷길 기술 스택 / 스펙 정리

최종 업데이트: 2026-02-18

## 1) 프론트엔드 (모바일 앱)

- Framework: React Native (Expo)
- Expo SDK: `~54.0.33`
- React: `19.1.0`
- React Native: `0.81.5`
- Language: TypeScript `~5.9.2`
- 상태 관리: React Hook 기반 로컬 상태 (`useWalkingAppState`)
- 로컬 영속화: `@react-native-async-storage/async-storage` `2.2.0`
- 아이콘: `@expo/vector-icons` `^15.0.3`
- Safe Area: `react-native-safe-area-context` `~5.6.0`
- 에러 모니터링 SDK: `@sentry/react-native` `^8.0.0`

## 2) 백엔드

- Framework: NestJS
- Node runtime: Node.js (Nest 실행 환경)
- Language: TypeScript `^5.9.2`
- 주요 패키지
  - `@nestjs/common` `^11.1.6`
  - `@nestjs/core` `^11.1.6`
  - `@nestjs/platform-express` `^11.1.6`
  - `@nestjs/swagger` `^11.2.0`
  - `class-validator`, `class-transformer`
- API 문서: Swagger UI + OpenAPI 초안
  - OpenAPI 파일: `backend/openapi.seoul-walking-path-mvp.yaml`

## 3) 데이터 저장 구조 (현재)

- 프론트 로컬 저장: AsyncStorage
  - 기록 목록
  - 즐겨찾기 코스 ID
  - 트래킹 모드(균형/정확)
- 백엔드 저장: 인메모리 Mock Store
  - 서버 재시작 시 초기화
- 운영용 외부 DB: **아직 미연동**

## 4) 인프라 / 배포

- 모바일 빌드: EAS Build (`eas.json` 설정)
- Android 배포 대상: Google Play Console (Internal track 우선)
- 백엔드 배포: **미확정 (필수 결정 필요)**
  - 후보: Render / Railway / Fly.io / Google Cloud Run
  - 요구사항: 24시간 API 가용성, HTTPS, 환경변수/시크릿 관리, 일일 배치 실행 가능
- 운영 DB: **미연동**
  - 목표: PostgreSQL (Supabase/Neon/Cloud SQL 등 중 선택)
- 앱 식별자
  - Android package: `com.beank.seoulwalkingpath`
  - iOS bundleIdentifier: `com.beank.seoulwalkingpath`

## 5) 모니터링 / 분석

- 크래시 모니터링: Sentry SDK 초기화 연결 완료
  - DSN 환경변수: `EXPO_PUBLIC_SENTRY_DSN`
- 분석 이벤트: 커스텀 tracker(`src/analytics/tracker.ts`)로 MVP 이벤트 기록

## 6) 디자인 시스템 / UI

- 디자인 기준: Figma 와이어프레임 + 토큰 기반 구현
- 토큰 파일: `src/theme/tokens.ts`
  - Color / Typography / Spacing / Radius / Shadow
- 공통 UI 컴포넌트: Button, Input, Chip, Card, BottomSheet, TabBar

## 7) 개발 도구

- IDE: VSCode
- 버전관리: Git + GitHub
- 패키지 매니저: npm

## 8) 비용 관점 (현재 상태)

- 현재 코드 기준 필수 유료 인프라: 없음
- 즉시 비용이 발생하는 항목: 없음 (로컬/인메모리 중심)
- 추후 비용 가능 항목
  - 백엔드 호스팅(무료 티어 초과/슬립 해제 시)
  - 운영 DB 도입 시 (예: PostgreSQL managed)
  - Sentry 유료 플랜 확장 시
  - Play Store 배포 계정/운영 비용
