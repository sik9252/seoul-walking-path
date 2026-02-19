import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { checkVisit, DEMO_USER_ID, fetchMyCards, fetchPlacesPage, PAGE_SIZE } from "../apis/gameApi";

export function usePlacesQuery(apiBaseUrl?: string) {
  return useInfiniteQuery({
    queryKey: ["places", apiBaseUrl, PAGE_SIZE],
    enabled: Boolean(apiBaseUrl),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPlacesPage(apiBaseUrl as string, pageParam),
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
  });
}

export function useMyCardsQuery(apiBaseUrl?: string) {
  return useQuery({
    queryKey: ["cards", "my", apiBaseUrl, DEMO_USER_ID],
    enabled: Boolean(apiBaseUrl),
    queryFn: () => fetchMyCards(apiBaseUrl as string),
  });
}

export function useVisitMutation(apiBaseUrl?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => checkVisit(apiBaseUrl as string),
    onSuccess: (payload) => {
      if (!payload.matched) {
        Alert.alert("방문 실패", "반경 내 관광지가 없어요.");
        return;
      }
      if (payload.collected) {
        Alert.alert("카드 획득", `${payload.place?.name ?? "관광지"} 카드를 획득했어요.`);
      } else {
        Alert.alert("이미 수집됨", `${payload.place?.name ?? "관광지"}는 이미 수집한 장소예요.`);
      }
      void queryClient.invalidateQueries({ queryKey: ["cards", "my", apiBaseUrl, DEMO_USER_ID] });
    },
    onError: (error) => {
      console.warn("[app] checkVisit failed", error);
      Alert.alert("오류", "방문 판정 중 문제가 발생했어요.");
    },
  });
}
