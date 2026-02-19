import React from "react";
import { ActivityIndicator, ScrollView, Text } from "react-native";
import { Card } from "../../../components/ui";
import { colors } from "../../../theme/tokens";
import { gameStyles as styles } from "../styles";
import { MyCard } from "../types";

type Props = {
  cards: MyCard[];
  loading: boolean;
  isError: boolean;
};

export function CollectionList({ cards, loading, isError }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>컬렉션</Text>
      <Text style={styles.description}>획득한 관광지 카드를 모아보세요.</Text>

      {loading ? <ActivityIndicator color={colors.brand[600]} /> : null}
      {isError ? <Text style={styles.errorText}>카드 목록을 불러오지 못했습니다.</Text> : null}
      {!loading && cards.length === 0 ? <Text style={styles.cardBody}>아직 획득한 카드가 없어요.</Text> : null}

      {cards.map((card) => (
        <Card key={card.cardId}>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardBody}>{card.rarity.toUpperCase()} · {card.place?.name ?? "알 수 없는 장소"}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}
