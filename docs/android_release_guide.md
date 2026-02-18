# 서울걷길 Android 배포 가이드 (Play Internal Test)

## 1) 사전 준비
- Expo 계정 로그인: `npx eas login`
- 프로젝트 연결: `npx eas init`
- Play Console 앱 생성 (앱 이름: 서울걷길)
- Google Service Account 키 생성 후 `credentials/google-service-account.json` 배치

## 2) 버전 전략
- 사용자 노출 버전: `app.json`의 `expo.version` (예: `1.0.0`)
- Android 내부 버전: `app.json`의 `expo.android.versionCode`
- `eas.json`의 production 빌드에서 `autoIncrement: versionCode` 적용

## 3) 빌드
```bash
npx eas build --platform android --profile production
```
- 결과물: `.aab`

## 4) 내부 테스트 트랙 제출
```bash
npx eas submit --platform android --profile production
```
- Play Console Internal testing 트랙으로 업로드

## 5) 릴리즈 체크포인트
- 권한 안내 문구 최신화 확인
- 크래시/오류 모니터링 연결 여부 확인
- 주요 플로우 회귀 테스트(S4~S13)
