import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Button } from "../components/ui";
import { AuthSession } from "../storage/authSession";
import { colors, radius, spacing, typography } from "../theme/tokens";

type Props = {
  authSession: AuthSession | null;
  locationEnabled: boolean;
  autoLoginEnabled: boolean;
  onRefreshLocation: () => void;
  onToggleAutoLogin: (enabled: boolean) => void;
  onReplayTutorial: () => void;
  onLogout: () => void;
  onRequireAuth: () => void;
  onSaveNickname: (nickname: string) => Promise<string | void>;
};

export function SettingsScreen({
  authSession,
  locationEnabled,
  autoLoginEnabled,
  onRefreshLocation,
  onToggleAutoLogin,
  onReplayTutorial,
  onLogout,
  onRequireAuth,
  onSaveNickname,
}: Props) {
  const initialNickname = authSession?.user.nickname ?? "";
  const [nickname, setNickname] = React.useState(initialNickname);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setNickname(authSession?.user.nickname ?? "");
    setMessage(null);
  }, [authSession?.user.nickname, authSession?.user.id]);

  const displayName = authSession?.user.nickname?.trim() || authSession?.user.username || "게스트";

  const handleSaveNickname = React.useCallback(async () => {
    if (!authSession) {
      onRequireAuth();
      return;
    }
    if (!nickname.trim()) {
      setMessage("닉네임을 입력해주세요.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const error = await onSaveNickname(nickname.trim());
      if (error) {
        setMessage(error);
        return;
      }
      setMessage("닉네임이 저장되었습니다.");
    } finally {
      setSaving(false);
    }
  }, [authSession, nickname, onRequireAuth, onSaveNickname]);

  return (
    <View style={settingsStyles.container}>
      <View style={settingsStyles.headerRow}>
        <Text style={settingsStyles.headerTitle}>마이페이지</Text>
        <Pressable style={settingsStyles.iconBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.base.text} />
        </Pressable>
      </View>

      <View style={settingsStyles.profileBlock}>
        <View style={settingsStyles.avatarWrap}>
          <View style={settingsStyles.avatar}>
            <Ionicons name="person" size={34} color="#7C685B" />
          </View>
          <Pressable style={settingsStyles.cameraBadge}>
            <Ionicons name="camera-outline" size={14} color={colors.base.surface} />
          </Pressable>
        </View>
        <Text style={settingsStyles.profileName}>{displayName}</Text>
        <Text style={settingsStyles.profileSub}>@{authSession?.user.username ?? "로그인 필요"}</Text>
      </View>

      <View style={settingsStyles.nicknameRow}>
        <TextInput
          value={nickname}
          onChangeText={setNickname}
          placeholder="닉네임 설정 (2~20자)"
          placeholderTextColor={colors.base.textSubtle}
          style={settingsStyles.nicknameInput}
          editable={Boolean(authSession)}
        />
        <Button
          label={saving ? "저장 중..." : "저장"}
          onPress={() => void handleSaveNickname()}
          disabled={!authSession || saving}
          style={settingsStyles.saveBtn}
          labelStyle={settingsStyles.saveBtnLabel}
        />
      </View>
      {message ? <Text style={settingsStyles.messageText}>{message}</Text> : null}

      <Text style={settingsStyles.sectionLabel}>시스템</Text>
      <View style={settingsStyles.sectionCard}>
        <Pressable style={settingsStyles.row} onPress={onRefreshLocation}>
          <View style={settingsStyles.rowLeft}>
            <Ionicons name="location-outline" size={20} color={colors.base.text} />
            <Text style={settingsStyles.rowText}>위치 권한 설정</Text>
          </View>
          <Switch value={locationEnabled} onValueChange={onRefreshLocation} />
        </Pressable>

        <View style={settingsStyles.row}>
          <View style={settingsStyles.rowLeft}>
            <Ionicons name="key-outline" size={20} color={colors.base.text} />
            <Text style={settingsStyles.rowText}>자동 로그인</Text>
          </View>
          <Switch
            value={autoLoginEnabled}
            onValueChange={onToggleAutoLogin}
            disabled={!authSession}
          />
        </View>

        <View style={settingsStyles.row}>
          <View style={settingsStyles.rowLeft}>
            <Ionicons name="book-outline" size={20} color={colors.base.text} />
            <Text style={settingsStyles.rowText}>튜토리얼</Text>
          </View>
          <Pressable style={settingsStyles.pillBtn} onPress={onReplayTutorial}>
            <Text style={settingsStyles.pillBtnText}>다시 보기</Text>
          </Pressable>
        </View>
      </View>

      <Text style={settingsStyles.sectionLabel}>계정</Text>
      <View style={settingsStyles.sectionCard}>
        {authSession ? (
          <Pressable style={settingsStyles.row} onPress={onLogout}>
            <View style={settingsStyles.rowLeft}>
              <Ionicons name="log-out-outline" size={20} color={colors.base.text} />
              <Text style={settingsStyles.rowText}>로그아웃</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.base.textSubtle} />
          </Pressable>
        ) : (
          <Pressable style={settingsStyles.row} onPress={onRequireAuth}>
            <View style={settingsStyles.rowLeft}>
              <Ionicons name="log-in-outline" size={20} color={colors.base.text} />
              <Text style={settingsStyles.rowText}>로그인 / 가입</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.base.textSubtle} />
          </Pressable>
        )}
      </View>

      <Text style={settingsStyles.sectionLabel}>정보</Text>
      <View style={settingsStyles.sectionCard}>
        <View style={settingsStyles.row}>
          <View style={settingsStyles.rowLeft}>
            <Ionicons name="information-circle-outline" size={20} color={colors.base.text} />
            <Text style={settingsStyles.rowText}>앱 버전</Text>
          </View>
          <Text style={settingsStyles.versionText}>v1.0.0</Text>
        </View>
      </View>
    </View>
  );
}

const settingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.background,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: typography.size.titleMd,
    fontWeight: typography.weight.bold,
    color: colors.base.text,
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  profileBlock: {
    alignItems: "center",
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#E9D2BD",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand[700],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.base.surface,
  },
  profileName: {
    marginTop: spacing.sm,
    fontSize: typography.size.titleSm,
    fontWeight: typography.weight.bold,
    color: colors.base.text,
  },
  profileSub: {
    fontSize: typography.size.bodySm,
    color: colors.base.textSubtle,
  },
  nicknameRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  nicknameInput: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.base.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.base.text,
    backgroundColor: colors.base.surface,
  },
  messageText: {
    marginTop: spacing.xs,
    fontSize: typography.size.caption,
    color: colors.base.textSubtle,
  },
  saveBtn: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  saveBtnLabel: {
    fontSize: typography.size.bodySm,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.brand[700],
    fontSize: typography.size.labelMd,
    fontWeight: typography.weight.semibold,
  },
  sectionCard: {
    borderRadius: 24,
    backgroundColor: colors.base.surface,
    borderWidth: 1,
    borderColor: colors.base.border,
    overflow: "hidden",
  },
  row: {
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  rowText: {
    fontSize: typography.size.bodyMd,
    color: colors.base.text,
  },
  pillBtn: {
    backgroundColor: colors.brand[700],
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillBtnText: {
    color: colors.base.surface,
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.caption,
  },
  versionText: {
    color: colors.base.textSubtle,
    fontSize: typography.size.bodySm,
    fontWeight: typography.weight.semibold,
  },
});
