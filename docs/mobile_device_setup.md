# 실기기(모바일) 연결 개발 가이드

## 1) 백엔드 실행 (LAN 접근 허용)
```bash
cd backend
npm run start:dev
```

- 서버는 `0.0.0.0:4000`으로 바인딩되어 같은 Wi-Fi의 기기에서 접근 가능합니다.

## 2) 프론트 `.env` 확인
루트 `.env`의 공통 API 주소를 노트북 Wi-Fi IP로 설정합니다.

```env
EXPO_PUBLIC_API_BASE_URL=http://<노트북_WiFi_IP>:4000/api
```

예시:
```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.136:4000/api
```

## 3) Android 실기기
1. 개발자 옵션 + USB 디버깅 ON
2. USB 연결 후:
```bash
adb devices
npx expo run:android
```

## 4) iOS 실기기
1. iPhone USB 연결 + Xcode 서명 설정
2. 실행:
```bash
npx expo run:ios --device
```

## 5) 변경 반영
- `.env` 변경 시 앱 재빌드/재실행 필요
- 실기기와 노트북이 같은 네트워크여야 함
