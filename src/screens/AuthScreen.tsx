import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Button } from "../components/ui";
import { getApiBaseUrl } from "../apis/gameApi";
import { loginWithKakaoCode, loginWithPassword, signupWithPassword } from "../apis/authApi";
import { AuthSession as StoredAuthSession } from "../storage/authSession";
import { colors, radius, spacing, typography } from "../theme/tokens";
import { Ionicons } from "@expo/vector-icons";

WebBrowser.maybeCompleteAuthSession();

type Props = {
  apiBaseUrl?: string;
  onAuthenticated: (session: StoredAuthSession) => void;
};

export function AuthScreen({ apiBaseUrl, onAuthenticated }: Props) {
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const baseUrl = apiBaseUrl ?? getApiBaseUrl();
  const kakaoRestApiKey = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

  const handleSubmit = React.useCallback(async () => {
    if (!baseUrl) {
      setError("API URL이 설정되지 않았습니다.");
      return;
    }
    if (!username.trim() || !password.trim()) {
      setError("아이디/비밀번호를 입력해주세요.");
      return;
    }
    if (mode === "signup" && !agreeTerms) {
      setError("약관 및 개인정보처리방침에 동의해주세요.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const result =
        mode === "signup"
          ? await signupWithPassword(baseUrl, {
              username,
              password,
            })
          : await loginWithPassword(baseUrl, { username, password });

      onAuthenticated({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : "";
      const fallback = mode === "signup" ? "회원가입에 실패했습니다. 아이디 중복 여부를 확인해주세요." : "로그인에 실패했습니다.";
      setError(reason || fallback);
    } finally {
      setIsSubmitting(false);
    }
  }, [agreeTerms, apiBaseUrl, baseUrl, mode, onAuthenticated, password, username]);

  const handleKakao = React.useCallback(async () => {
    if (!baseUrl) {
      setError("API URL이 설정되지 않았습니다.");
      return;
    }
    if (!kakaoRestApiKey) {
      setError("EXPO_PUBLIC_KAKAO_REST_API_KEY가 설정되지 않았습니다.");
      return;
    }

    const appRedirectUri = AuthSession.makeRedirectUri({
      scheme: "seoulwalkingpath",
      path: "oauth/kakao",
    });
    const kakaoRedirectUri =
      process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI ??
      (baseUrl ? `${baseUrl.replace(/\/$/, "")}/auth/kakao/callback` : undefined);
    if (!kakaoRedirectUri) {
      setError("카카오 리다이렉트 URI가 설정되지 않았습니다.");
      return;
    }

    const state = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const authUrl =
      "https://kauth.kakao.com/oauth/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: kakaoRestApiKey,
        redirect_uri: kakaoRedirectUri,
        state,
      }).toString();

    setError(null);
    setIsSubmitting(true);
    try {
      const authResult = await WebBrowser.openAuthSessionAsync(authUrl, appRedirectUri);
      if (authResult.type !== "success" || !authResult.url) {
        setError("카카오 로그인이 취소되었습니다.");
        return;
      }

      const callbackUrl = new URL(authResult.url);
      const error = callbackUrl.searchParams.get("error");
      const errorDescription = callbackUrl.searchParams.get("error_description");
      if (error) {
        setError(errorDescription ?? "카카오 로그인에 실패했습니다.");
        return;
      }
      const code = callbackUrl.searchParams.get("code");
      const returnedState = callbackUrl.searchParams.get("state");
      if (!code) {
        setError("인가코드를 가져오지 못했습니다.");
        return;
      }
      if (!returnedState || returnedState !== state) {
        setError("로그인 요청 검증(state)에 실패했습니다.");
        return;
      }

      const result = await loginWithKakaoCode(baseUrl, { code, redirectUri: kakaoRedirectUri });
      onAuthenticated({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : "";
      setError(reason || "카카오 로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }, [apiBaseUrl, baseUrl, kakaoRestApiKey, onAuthenticated]);

  return (
    <View style={authStyles.container}>
      {mode === "signup" ? (
        <View style={authStyles.signupHeader}>
          <Pressable style={authStyles.backButton} onPress={() => setMode("login")}>
            <Ionicons name="chevron-back" size={24} color={colors.base.text} />
          </Pressable>
          <Text style={authStyles.signupTitle}>
            <Text style={authStyles.signupTitleAccent}>나의 여정</Text>을{"\n"}
            <Text>시작해요</Text>
          </Text>
          <Text style={authStyles.signupBody}>계정을 만들고 스팟 수집을 시작하세요.</Text>
        </View>
      ) : (
        <View style={authStyles.loginHeader}>
          <View style={authStyles.logoBadge}>
            <Ionicons name="walk" size={30} color={colors.brand[600]} />
          </View>
          <Text style={authStyles.heroTitle}>서울걷길</Text>
          <Text style={authStyles.heroBody}>도시를 한 걸음씩 탐험해보세요.</Text>
        </View>
      )}

      <View style={authStyles.formWrap}>
        <View style={authStyles.inputGroup}>
          <Text style={authStyles.inputLabel}>아이디</Text>
          <View style={authStyles.inputRow}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="아이디를 입력하세요"
              value={username}
              onChangeText={setUsername}
              style={authStyles.inputInline}
              placeholderTextColor="#98A2B3"
            />
          </View>
        </View>

        <View style={authStyles.inputGroup}>
          <Text style={authStyles.inputLabel}>비밀번호</Text>
          <View style={authStyles.inputRow}>
            <TextInput
              autoCapitalize="none"
              secureTextEntry={!showPassword}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChangeText={setPassword}
              style={[authStyles.inputInline, { flex: 1 }]}
              placeholderTextColor="#98A2B3"
            />
            <Pressable onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#98A2B3" />
            </Pressable>
          </View>
        </View>

        {mode === "signup" ? (
          <Pressable style={authStyles.termsRow} onPress={() => setAgreeTerms((prev) => !prev)}>
            <View style={[authStyles.checkbox, agreeTerms && authStyles.checkboxActive]}>
              {agreeTerms ? <Ionicons name="checkmark" size={14} color={colors.base.surface} /> : null}
            </View>
            <Text style={authStyles.termsText}>
              약관 및 <Text style={authStyles.termsHighlight}>개인정보처리방침</Text>에 동의합니다.
            </Text>
          </Pressable>
        ) : null}

        {error ? <Text style={authStyles.error}>{error}</Text> : null}

        <Button
          label={isSubmitting ? "처리 중..." : mode === "signup" ? "회원가입하기" : "로그인"}
          onPress={() => void handleSubmit()}
          disabled={isSubmitting}
        />
        <View style={authStyles.dividerRow}>
          <View style={authStyles.dividerLine} />
        </View>
        <Pressable style={authStyles.kakaoButton} onPress={() => void handleKakao()} disabled={isSubmitting}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#181600" />
          <Text style={authStyles.kakaoButtonText}>
            {mode === "signup" ? "카카오로 회원가입" : "카카오로 계속하기"}
          </Text>
        </Pressable>

        {mode === "login" ? (
          <View style={authStyles.loginLinksRow}>
            <Pressable>
              <Text style={authStyles.inlineLink}>비밀번호 재설정</Text>
            </Pressable>
            <Pressable onPress={() => setMode("signup")}>
              <Text style={authStyles.inlineLink}>회원가입</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={authStyles.switchTextRow} onPress={() => setMode("login")}>
            <Text style={authStyles.switchText}>
              이미 계정이 있나요? <Text style={authStyles.termsHighlight}>로그인</Text>
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.x3,
    paddingBottom: spacing.x2,
    gap: spacing.lg,
    backgroundColor: "#ffffff",
  },
  loginHeader: {
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.x2,
  },
  signupHeader: {
    gap: spacing.sm,
  },
  logoBadge: {
    width: 74,
    height: 74,
    borderRadius: 22,
    backgroundColor: colors.base.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  signupTitle: {
    marginTop: spacing.sm,
    fontSize: typography.size.titleLg,
    lineHeight: typography.lineHeight.titleLg,
    fontWeight: typography.weight.bold,
    color: colors.base.text,
  },
  signupTitleAccent: {
    color: "#18D45E",
  },
  signupBody: {
    color: "#3D9465",
    fontSize: typography.size.bodySm,
    lineHeight: typography.lineHeight.bodySm,
  },
  heroTitle: {
    fontSize: typography.size.titleLg,
    fontWeight: typography.weight.bold,
    color: colors.base.text,
  },
  heroBody: {
    color: colors.base.textSubtle,
    fontSize: typography.size.bodySm,
    lineHeight: typography.lineHeight.bodySm,
  },
  formWrap: {
    gap: spacing.lg,
  },
  modeRow: {
    display: "none",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.base.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.base.text,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    color: "#2F8A57",
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.labelSm,
  },
  inputRow: {
    borderRadius: radius.sm,
    backgroundColor: colors.base.surface,
    borderWidth: 1,
    borderColor: "#E8ECEA",
    paddingHorizontal: spacing.md,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  inputInline: {
    flex: 1,
    color: colors.base.text,
    fontSize: typography.size.bodySm,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#C8D1CB",
    backgroundColor: colors.base.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    borderColor: colors.brand[600],
    backgroundColor: colors.brand[600],
  },
  termsText: {
    color: "#5E6A66",
    fontSize: typography.size.caption,
  },
  termsHighlight: {
    color: colors.brand[600],
    fontWeight: typography.weight.semibold,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DFE5E1",
  },
  dividerText: {
    color: "#99A3AF",
    fontSize: typography.size.bodySm,
  },
  kakaoButton: {
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: "#FEE500",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  kakaoButtonText: {
    color: "#181600",
    fontSize: typography.size.labelMd,
    lineHeight: typography.lineHeight.labelMd,
    fontWeight: typography.weight.semibold,
  },
  loginLinksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  inlineLink: {
    color: "#2F8A57",
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  switchTextRow: {
    marginTop: spacing.sm,
    alignItems: "center",
  },
  switchText: {
    color: "#697586",
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  error: {
    color: colors.semantic.error,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});
