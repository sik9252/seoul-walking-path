import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../components/ui";
import { getApiBaseUrl } from "../apis/gameApi";
import { loginWithKakaoCode, loginWithPassword, signupWithPassword } from "../apis/authApi";
import { AuthSession } from "../storage/authSession";
import { colors, radius, spacing, typography } from "../theme/tokens";

type Props = {
  apiBaseUrl?: string;
  onAuthenticated: (session: AuthSession) => void;
  onContinueGuest: () => void;
};

export function AuthScreen({ apiBaseUrl, onAuthenticated, onContinueGuest }: Props) {
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const baseUrl = apiBaseUrl ?? getApiBaseUrl();

  const handleSubmit = React.useCallback(async () => {
    if (!baseUrl) {
      setError("API URL이 설정되지 않았습니다.");
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError("이메일/비밀번호를 입력해주세요.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const result =
        mode === "signup"
          ? await signupWithPassword(baseUrl, {
              email,
              password,
              displayName: displayName.trim() || undefined,
            })
          : await loginWithPassword(baseUrl, { email, password });

      onAuthenticated({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch {
      setError(mode === "signup" ? "회원가입에 실패했습니다." : "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }, [apiBaseUrl, baseUrl, displayName, email, mode, onAuthenticated, password]);

  const handleKakao = React.useCallback(async () => {
    if (!baseUrl) {
      setError("API URL이 설정되지 않았습니다.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await loginWithKakaoCode(baseUrl, { code: `dev-${Date.now()}` });
      onAuthenticated({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch {
      setError("카카오 로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }, [apiBaseUrl, baseUrl, onAuthenticated]);

  return (
    <View style={authStyles.container}>
      <Text style={authStyles.title}>로그인 / 가입</Text>
      <Text style={authStyles.body}>수집 진행도 저장을 위해 로그인이 필요합니다.</Text>

      <View style={authStyles.modeRow}>
        <Pressable style={[authStyles.modeBtn, mode === "login" && authStyles.modeBtnActive]} onPress={() => setMode("login")}>
          <Text style={[authStyles.modeText, mode === "login" && authStyles.modeTextActive]}>로그인</Text>
        </Pressable>
        <Pressable style={[authStyles.modeBtn, mode === "signup" && authStyles.modeBtnActive]} onPress={() => setMode("signup")}>
          <Text style={[authStyles.modeText, mode === "signup" && authStyles.modeTextActive]}>회원가입</Text>
        </Pressable>
      </View>

      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        style={authStyles.input}
      />
      <TextInput
        autoCapitalize="none"
        secureTextEntry
        placeholder="비밀번호(6자 이상)"
        value={password}
        onChangeText={setPassword}
        style={authStyles.input}
      />
      {mode === "signup" ? (
        <TextInput
          autoCapitalize="none"
          placeholder="닉네임(선택)"
          value={displayName}
          onChangeText={setDisplayName}
          style={authStyles.input}
        />
      ) : null}

      {error ? <Text style={authStyles.error}>{error}</Text> : null}

      <Button label={isSubmitting ? "처리 중..." : mode === "signup" ? "가입하고 시작" : "로그인"} onPress={() => void handleSubmit()} disabled={isSubmitting} />
      <Button label="카카오 로그인" variant="secondary" onPress={() => void handleKakao()} disabled={isSubmitting} />
      <Button label="게스트로 둘러보기" variant="secondary" onPress={onContinueGuest} disabled={isSubmitting} />
    </View>
  );
}

const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.x3,
    gap: spacing.md,
    backgroundColor: colors.base.background,
  },
  title: {
    fontSize: typography.size.titleLg,
    fontWeight: typography.weight.bold,
    color: colors.base.text,
  },
  body: {
    color: colors.base.textSubtle,
    fontSize: typography.size.bodySm,
  },
  modeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modeBtn: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.base.border,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  modeBtnActive: {
    backgroundColor: colors.brand[50],
    borderColor: colors.brand[100],
  },
  modeText: {
    color: colors.base.textSubtle,
    fontWeight: typography.weight.medium,
  },
  modeTextActive: {
    color: colors.brand[700],
    fontWeight: typography.weight.bold,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.base.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.base.text,
  },
  error: {
    color: colors.semantic.error,
    fontSize: typography.size.bodySm,
  },
});
