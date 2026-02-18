# 서울걷길 배포/지도 비용 추정 (2026-02-18 기준)

## 1) 스토어 등록 비용 (필수)
- Google Play Console: `USD 25` (1회성 등록비)
- Apple Developer Program: `USD 99/년` (iOS 앱 배포 시 필요)

## 2) 빌드/배포 파이프라인 비용 (Expo EAS)
- Expo Free 플랜: `USD 0`
- Free 플랜 포함: 월 `Android 15회 + iOS 15회` 빌드(저우선순위)
- 제출 자동화(EAS Submit): Free 포함

## 3) 지도 라이브러리/지도 렌더링 비용
- `react-native-maps` 라이브러리 자체: 오픈소스(MIT), 라이브러리 사용료 `USD 0`
- Android(Google Maps SDK) 기본 지도 렌더링: Google Maps Platform 가격표에서 Maps SDK는 무료 사용 구간으로 표기됨
- iOS(Apple Maps provider) 기본 지도 렌더링: 별도 Google Maps 호출 없이 운용 가능

## 4) 서울걷길 기준 권장(무료 우선)
- 1차(Android Play 내부 테스트/출시):
  - 고정비: `USD 25`(최초 1회)
  - 월 운영비: `USD 0` 목표(Expo Free + 기본 지도 렌더링)
- 2차(iOS 배포 시작 시):
  - 추가 고정비: `USD 99/년`

## 5) 비용 상승 트리거(주의)
- Google Places/Geocoding/Routes 같은 별도 Maps API를 대량 호출하면 과금 가능
- Expo 빌드 대기시간/월 빌드 횟수 한계로 유료 플랜 전환 시 월 구독비 발생

## 출처
- Google Play Console 등록비: https://support.google.com/googleplay/android-developer/answer/6112435
- Apple Developer Program: https://developer.apple.com/programs/
- Expo 가격 정책: https://expo.dev/pricing
- Google Maps Platform 가격표: https://developers.google.com/maps/billing-and-pricing/pricing
- react-native-maps 라이선스(MIT): https://github.com/react-native-maps/react-native-maps
