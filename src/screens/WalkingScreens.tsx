import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Course, WalkRecord } from "../mocks/walkingData";
import { Button, Card, Chip, Input } from "../components/ui";
import { colors, radius, spacing, typography } from "../theme/tokens";

type HeaderProps = {
  title: string;
  leftLabel?: string;
  rightLabel?: string;
  onPressLeft?: () => void;
  onPressRight?: () => void;
};

function Header({ title, leftLabel, rightLabel, onPressLeft, onPressRight }: HeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onPressLeft} style={styles.headerSide}>
        <Text style={styles.headerSideText}>{leftLabel ?? ""}</Text>
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <Pressable onPress={onPressRight} style={styles.headerSide}>
        <Text style={styles.headerSideText}>{rightLabel ?? ""}</Text>
      </Pressable>
    </View>
  );
}

type S4Props = {
  courses: Course[];
  favoritesOnly: boolean;
  onToggleFavoritesOnly: (value: boolean) => void;
  onToggleFavorite: (courseId: string) => void;
  onOpenCourse: (course: Course) => void;
};

export function S4CourseListScreen({
  courses,
  favoritesOnly,
  onToggleFavoritesOnly,
  onToggleFavorite,
  onOpenCourse,
}: S4Props) {
  const [query, setQuery] = React.useState("");
  const filtered = courses.filter((course) => {
    const passFavorite = !favoritesOnly || course.isFavorite;
    const passQuery = !query.trim() || course.name.includes(query) || course.district.includes(query);
    return passFavorite && passQuery;
  });

  return (
    <View style={styles.screen}>
      <Header title="코스 목록" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.segment}>
          <Pressable
            onPress={() => onToggleFavoritesOnly(false)}
            style={[styles.segmentBtn, !favoritesOnly && styles.segmentBtnActive]}
          >
            <Text style={styles.segmentText}>전체</Text>
          </Pressable>
          <Pressable
            onPress={() => onToggleFavoritesOnly(true)}
            style={[styles.segmentBtn, favoritesOnly && styles.segmentBtnActive]}
          >
            <Text style={styles.segmentText}>저장됨</Text>
          </Pressable>
        </View>

        <Input value={query} onChangeText={setQuery} placeholder="산책로, 코스, 지역 검색" />
        <View style={styles.chipsRow}>
          <Chip label="필터" selected />
          <Chip label="난이도: 쉬움" />
          <Chip label="거리: 5km 미만" />
        </View>

        {favoritesOnly && filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>저장된 코스가 없어요</Text>
            <Text style={styles.emptyBody}>마음에 드는 코스를 하트로 저장해보세요.</Text>
            <Button label="코스 탐색하기" onPress={() => onToggleFavoritesOnly(false)} />
          </View>
        ) : (
          filtered.map((course) => (
            <Card key={course.id} style={styles.routeCard} padded={false}>
              <Pressable onPress={() => onOpenCourse(course)} style={styles.routePressable}>
                <View style={styles.routeThumb} />
                <View style={styles.routeMeta}>
                  <View style={styles.routeTopRow}>
                    <Text style={styles.routeTitle}>{course.name}</Text>
                    <Pressable onPress={() => onToggleFavorite(course.id)}>
                      <Text style={styles.favoriteIcon}>{course.isFavorite ? "♥" : "♡"}</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.routeSubtitle}>{course.subtitle}</Text>
                  <Text style={styles.routeInfo}>
                    {course.distanceKm}km · {course.durationMin}분 · {course.difficulty}
                  </Text>
                  <Text style={styles.routeInfo}>
                    {course.district} · ★ {course.rating} ({course.reviewCount})
                  </Text>
                </View>
              </Pressable>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

type S5Props = {
  course: Course;
  onBack: () => void;
  onStart: () => void;
  onReport: () => void;
  onToggleFavorite: () => void;
};

export function S5CourseDetailScreen({ course, onBack, onStart, onReport, onToggleFavorite }: S5Props) {
  return (
    <View style={styles.screen}>
      <Header title="코스 상세" leftLabel="←" rightLabel="공유" onPressLeft={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mapBox}>
          <Text style={styles.mapPlaceholder}>Map Preview</Text>
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.detailTitle}>{course.name}</Text>
          <Pressable onPress={onToggleFavorite}>
            <Text style={styles.favoriteIcon}>{course.isFavorite ? "♥" : "♡"}</Text>
          </Pressable>
        </View>
        <Text style={styles.detailSub}>{course.district}</Text>
        <Text style={styles.detailSub}>★ {course.rating} ({course.reviewCount})</Text>

        <View style={styles.metricRow}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>소요시간</Text>
            <Text style={styles.metricValue}>{course.durationMin}분</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>거리</Text>
            <Text style={styles.metricValue}>{course.distanceKm}km</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>난이도</Text>
            <Text style={styles.metricValue}>{course.difficulty}</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>코스 소개</Text>
        <Text style={styles.bodyText}>{course.description}</Text>

        <Text style={styles.sectionTitle}>주요 포인트</Text>
        {course.points.map((point) => (
          <View key={point.title} style={styles.pointRow}>
            <Text style={styles.pointTitle}>{point.title}</Text>
            <Text style={styles.pointDetail}>{point.detail}</Text>
          </View>
        ))}

        <Button label="문제 제보" variant="ghost" onPress={onReport} style={styles.reportBtn} />
      </ScrollView>

      <View style={styles.bottomCta}>
        <Button label="산책 시작하기" onPress={onStart} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

type S6Props = { onBack: () => void; onStart: () => void };
export function S6PreStartCheckScreen({ onBack, onStart }: S6Props) {
  const [shoeChecked, setShoeChecked] = React.useState(true);
  const [waterChecked, setWaterChecked] = React.useState(true);
  const [batteryChecked, setBatteryChecked] = React.useState(false);

  return (
    <View style={styles.screen}>
      <Header title="출발 전 체크리스트" leftLabel="←" onPressLeft={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Text style={styles.checkItem}>✅ 현재 날씨 맑음</Text>
          <Text style={styles.checkSub}>기온 21°C · 미세먼지 좋음</Text>
        </Card>
        <Card>
          <Text style={styles.checkItem}>✅ GPS 신호 양호</Text>
          <Text style={styles.checkSub}>위치 정확도 높음</Text>
        </Card>

        <Text style={styles.sectionTitle}>준비물 확인</Text>
        <Pressable onPress={() => setShoeChecked((v) => !v)}>
          <Text style={styles.checkItem}>{shoeChecked ? "☑" : "☐"} 편안한 운동화 착용</Text>
        </Pressable>
        <Pressable onPress={() => setWaterChecked((v) => !v)}>
          <Text style={styles.checkItem}>{waterChecked ? "☑" : "☐"} 충분한 식수 준비</Text>
        </Pressable>
        <Pressable onPress={() => setBatteryChecked((v) => !v)}>
          <Text style={styles.checkItem}>{batteryChecked ? "☑" : "☐"} 보조 배터리(권장)</Text>
        </Pressable>

        <View style={styles.warnBox}>
          <Text style={styles.warnTitle}>배터리 잔량 확인</Text>
          <Text style={styles.warnText}>현재 배터리 45%로 장시간 트래킹 시 부족할 수 있어요.</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomDual}>
        <Button label="나중에 하기" variant="secondary" onPress={onBack} style={{ flex: 1 }} />
        <Button label="산책 시작하기" onPress={onStart} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

type S7Props = {
  courseName: string;
  elapsedText: string;
  distanceText: string;
  steps: number;
  kcal: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onFinish: () => void;
  onBack: () => void;
};

export function S7TrackingScreen({
  courseName,
  elapsedText,
  distanceText,
  steps,
  kcal,
  isPaused,
  onTogglePause,
  onFinish,
  onBack,
}: S7Props) {
  return (
    <View style={styles.screen}>
      <Header title={courseName} leftLabel="←" rightLabel="⋯" onPressLeft={onBack} />
      <View style={styles.trackingMap}>
        <Text style={styles.mapPlaceholder}>Live Map</Text>
      </View>
      <View style={styles.hud}>
        <View style={styles.hudTop}>
          <Text style={styles.recordingTag}>RECORDING</Text>
          <Text style={styles.hudTime}>{elapsedText}</Text>
        </View>
        <Text style={styles.hudTitle}>오후 산책 중</Text>
        <View style={styles.hudMetricRow}>
          <View style={styles.hudMetric}>
            <Text style={styles.metricValue}>{distanceText}</Text>
            <Text style={styles.metricLabel}>거리</Text>
          </View>
          <View style={styles.hudMetric}>
            <Text style={styles.metricValue}>{steps.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>걸음</Text>
          </View>
          <View style={styles.hudMetric}>
            <Text style={styles.metricValue}>{kcal}kcal</Text>
            <Text style={styles.metricLabel}>소모량</Text>
          </View>
        </View>
        <View style={styles.bottomDual}>
          <Button
            label={isPaused ? "재개" : "일시정지"}
            variant="secondary"
            onPress={onTogglePause}
            style={{ flex: 1 }}
          />
          <Button label="종료하기" onPress={onFinish} style={{ flex: 1 }} />
        </View>
      </View>
    </View>
  );
}

type S8Props = { onConfirm: () => void; onBack: () => void };
export function S8SummaryScreen({ onConfirm, onBack }: S8Props) {
  const [mood, setMood] = React.useState(2);
  return (
    <View style={styles.screen}>
      <Header title="산책 완료" leftLabel="✕" rightLabel="공유" onPressLeft={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.detailSub}>2023년 10월 24일 (화) 오전 10:30</Text>
        <Text style={styles.detailTitle}>남산 둘레길 아침 산책</Text>
        <View style={styles.mapBox} />
        <View style={styles.summaryGrid}>
          <View><Text style={styles.metricLabel}>총 거리</Text><Text style={styles.summaryValue}>4.2km</Text></View>
          <View><Text style={styles.metricLabel}>시간</Text><Text style={styles.summaryValue}>58분</Text></View>
          <View><Text style={styles.metricLabel}>칼로리</Text><Text style={styles.summaryValue}>245kcal</Text></View>
          <View><Text style={styles.metricLabel}>평균 페이스</Text><Text style={styles.summaryValue}>13'20"</Text></View>
        </View>
        <Text style={styles.sectionTitle}>오늘 산책은 어땠나요?</Text>
        <View style={styles.moodRow}>
          {["😫", "😐", "😊", "🥰"].map((icon, index) => (
            <Pressable
              key={icon}
              onPress={() => setMood(index)}
              style={[styles.moodBtn, mood === index && styles.moodBtnActive]}
            >
              <Text style={styles.moodText}>{icon}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={styles.bottomCta}>
        <Button label="확인" onPress={onConfirm} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

type S9Props = { records: WalkRecord[]; onOpenRecord: (record: WalkRecord) => void };
export function S9RecordListScreen({ records, onOpenRecord }: S9Props) {
  return (
    <View style={styles.screen}>
      <Header title="나의 기록" rightLabel="달력" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.weekCard}>
          <Text style={styles.metricLabel}>이번 주 활동</Text>
          <Text style={styles.weekDistance}>28.4 km</Text>
        </Card>
        <View style={styles.chipsRow}>
          <Chip label="전체" selected />
          <Chip label="산책" />
          <Chip label="트레킹" />
          <Chip label="등산" />
        </View>
        {records.map((record) => (
          <Card key={record.id}>
            <Pressable onPress={() => onOpenRecord(record)}>
              <Text style={styles.routeTitle}>{record.title}</Text>
              <Text style={styles.routeInfo}>{record.startedAt}</Text>
              <Text style={styles.routeInfo}>
                {record.distanceKm}km · {record.durationText}
              </Text>
            </Pressable>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

type S10Props = { record: WalkRecord; onBack: () => void };
export function S10RecordDetailScreen({ record, onBack }: S10Props) {
  return (
    <View style={styles.screen}>
      <Header title="기록 상세" leftLabel="←" rightLabel="⋮" onPressLeft={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mapBox} />
        <Text style={styles.detailTitle}>{record.title}</Text>
        <Text style={styles.detailSub}>{record.startedAt}</Text>
        <View style={styles.summaryGrid}>
          <View><Text style={styles.metricLabel}>총 거리</Text><Text style={styles.summaryValue}>{record.distanceKm}km</Text></View>
          <View><Text style={styles.metricLabel}>소요 시간</Text><Text style={styles.summaryValue}>{record.durationText}</Text></View>
          <View><Text style={styles.metricLabel}>평균 페이스</Text><Text style={styles.summaryValue}>{record.paceText}</Text></View>
          <View><Text style={styles.metricLabel}>시작 시간</Text><Text style={styles.summaryValue}>09:30 AM</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}

export function S11SettingsScreen() {
  const [voice, setVoice] = React.useState(true);
  return (
    <View style={styles.screen}>
      <Header title="설정" leftLabel="←" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileWrap}>
          <View style={styles.avatar} />
          <Text style={styles.detailTitle}>김서울</Text>
          <Text style={styles.detailSub}>seoul_walker@email.com</Text>
        </View>

        <View style={styles.metricRow}>
          <Card style={styles.metricCard}><Text style={styles.metricLabel}>총 거리</Text><Text style={styles.metricValue}>124km</Text></Card>
          <Card style={styles.metricCard}><Text style={styles.metricLabel}>완주 코스</Text><Text style={styles.metricValue}>15개</Text></Card>
        </View>

        <Text style={styles.sectionTitle}>계정</Text>
        {["내 정보 수정", "알림 설정", "개인정보 및 보안"].map((label) => (
          <View key={label} style={styles.settingRow}><Text style={styles.bodyText}>{label}</Text><Text>›</Text></View>
        ))}

        <Text style={styles.sectionTitle}>앱 설정</Text>
        <View style={styles.settingRow}>
          <Text style={styles.bodyText}>음성 안내</Text>
          <Switch value={voice} onValueChange={setVoice} trackColor={{ true: colors.brand[600] }} />
        </View>

        <Text style={styles.sectionTitle}>지원</Text>
        {["도움말", "앱 정보"].map((label) => (
          <View key={label} style={styles.settingRow}><Text style={styles.bodyText}>{label}</Text><Text>›</Text></View>
        ))}
      </ScrollView>
    </View>
  );
}

type S13Props = { onBack: () => void };
export function S13ReportScreen({ onBack }: S13Props) {
  const [reason, setReason] = React.useState("길이 막혔어요");
  const [detail, setDetail] = React.useState("");
  const reasons = ["길이 막혔어요", "정보가 틀려요", "시설물이 없어요", "기타"];
  return (
    <View style={styles.screen}>
      <Header title="문제 신고" leftLabel="←" onPressLeft={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.bodyText}>트레킹 중 발견한 문제나 잘못된 정보를 알려주세요.</Text>
        <Card style={{ padding: 0 }}>
          {reasons.map((item) => (
            <Pressable key={item} style={styles.radioRow} onPress={() => setReason(item)}>
              <Text style={styles.bodyText}>{item}</Text>
              <Text style={{ color: reason === item ? colors.brand[600] : colors.base.textSubtle }}>
                {reason === item ? "●" : "○"}
              </Text>
            </Pressable>
          ))}
        </Card>
        <TextInput
          placeholder="상세 내용 (선택)"
          placeholderTextColor={colors.base.textSubtle}
          value={detail}
          onChangeText={setDetail}
          multiline
          style={styles.reportInput}
        />
      </ScrollView>
      <View style={styles.bottomCta}>
        <Button label="제출하기" onPress={onBack} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerSide: { width: 48 },
  headerSideText: { fontSize: typography.size.labelLg, color: colors.base.text },
  headerTitle: {
    color: colors.base.text,
    fontSize: typography.size.titleMd,
    lineHeight: typography.lineHeight.titleMd,
    fontWeight: typography.weight.bold,
  },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  segment: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.base.border,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  segmentBtn: { flex: 1, paddingVertical: spacing.md, alignItems: "center", backgroundColor: colors.base.surface },
  segmentBtnActive: { backgroundColor: colors.base.subtle },
  segmentText: { color: colors.base.text, fontWeight: typography.weight.semibold },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  routeCard: { borderRadius: radius.lg, overflow: "hidden" },
  routePressable: { flexDirection: "row", gap: spacing.md, padding: spacing.md },
  routeThumb: { width: 96, height: 96, borderRadius: radius.md, backgroundColor: colors.base.subtle },
  routeMeta: { flex: 1, gap: 4 },
  routeTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  routeTitle: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
    flex: 1,
  },
  favoriteIcon: { color: colors.brand[600], fontSize: 22 },
  routeSubtitle: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  routeInfo: { color: colors.base.textSubtle, fontSize: typography.size.caption },
  emptyWrap: { paddingTop: 80, gap: spacing.md, alignItems: "center" },
  emptyTitle: {
    color: colors.base.text,
    fontSize: typography.size.titleSm,
    fontWeight: typography.weight.bold,
  },
  emptyBody: { color: colors.base.textSubtle, fontSize: typography.size.bodyMd },
  mapBox: {
    height: 220,
    borderRadius: radius.xl,
    backgroundColor: colors.base.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  mapPlaceholder: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailTitle: {
    color: colors.base.text,
    fontSize: typography.size.titleLg,
    lineHeight: typography.lineHeight.titleLg,
    fontWeight: typography.weight.bold,
  },
  detailSub: { color: colors.base.textSubtle, fontSize: typography.size.bodyMd },
  metricRow: { flexDirection: "row", gap: spacing.sm },
  metricCard: { flex: 1, alignItems: "center" },
  metricLabel: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  metricValue: {
    color: colors.base.text,
    fontSize: typography.size.titleSm,
    lineHeight: typography.lineHeight.titleSm,
    fontWeight: typography.weight.bold,
  },
  sectionTitle: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
    marginTop: spacing.sm,
  },
  bodyText: {
    color: colors.base.textSubtle,
    fontSize: typography.size.bodyMd,
    lineHeight: typography.lineHeight.bodyMd,
  },
  pointRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.base.border },
  pointTitle: { color: colors.base.text, fontWeight: typography.weight.bold },
  pointDetail: { color: colors.base.textSubtle, marginTop: 2 },
  reportBtn: { alignSelf: "flex-start", paddingHorizontal: 0, minHeight: 40 },
  bottomCta: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
  bottomDual: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.lg,
  },
  checkItem: { color: colors.base.text, fontSize: typography.size.labelLg, marginBottom: spacing.sm },
  checkSub: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  warnBox: {
    marginTop: spacing.md,
    backgroundColor: "#FDE8E8",
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  warnTitle: { color: colors.semantic.error, fontWeight: typography.weight.bold, marginBottom: 4 },
  warnText: { color: "#7F1D1D" },
  trackingMap: { flex: 1, backgroundColor: colors.base.subtle, alignItems: "center", justifyContent: "center" },
  hud: {
    backgroundColor: colors.base.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  hudTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  recordingTag: {
    backgroundColor: colors.accent.lime100,
    color: colors.base.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },
  hudTime: {
    color: colors.brand[600],
    fontSize: 38,
    fontWeight: typography.weight.medium,
    lineHeight: 44,
  },
  hudTitle: {
    color: colors.base.text,
    fontSize: typography.size.titleMd,
    fontWeight: typography.weight.bold,
  },
  hudMetricRow: { flexDirection: "row", justifyContent: "space-between" },
  hudMetric: { alignItems: "center", flex: 1 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", rowGap: spacing.lg, columnGap: spacing.x4 },
  summaryValue: {
    color: colors.base.text,
    fontSize: 40,
    fontWeight: typography.weight.bold,
    lineHeight: 44,
  },
  moodRow: { flexDirection: "row", gap: spacing.sm },
  moodBtn: {
    flex: 1,
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.base.border,
    alignItems: "center",
    justifyContent: "center",
  },
  moodBtnActive: { backgroundColor: colors.brand[200], borderColor: colors.brand[600] },
  moodText: { fontSize: 22 },
  weekCard: { backgroundColor: colors.base.subtle },
  weekDistance: { marginTop: spacing.xs, color: colors.brand[700], fontSize: 36, fontWeight: typography.weight.bold },
  profileWrap: { alignItems: "center", gap: spacing.sm },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.base.subtleAlt },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.base.border,
  },
  radioRow: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.base.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reportInput: {
    minHeight: 160,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.base.border,
    padding: spacing.lg,
    color: colors.base.text,
    textAlignVertical: "top",
  },
});
