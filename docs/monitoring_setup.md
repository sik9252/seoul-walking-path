# Sentry 연동 메모

## 환경변수
프로젝트 루트 `.env`에 아래 값을 설정합니다.

```bash
EXPO_PUBLIC_SENTRY_DSN=https://<key>@sentry.io/<project-id>
```

## 적용 파일
- `src/monitoring/sentry.ts`
- `App.tsx` (앱 시작 시 `initSentry()` 호출)

## 확인 방법
1. 앱 실행 후 의도적으로 테스트 에러를 발생시켜 이벤트 전송 여부 확인
2. Sentry 프로젝트에서 issue 수집 확인
