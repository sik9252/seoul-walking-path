import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CATALOG_PAGE_SIZE,
  checkVisitWithUser,
  CheckVisitRequest,
  fetchCardCatalogPage,
  fetchMyCards,
  fetchPlacesPage,
  PAGE_SIZE,
} from "../apis/gameApi";

export function usePlacesQuery(apiBaseUrl?: string) {
  return useInfiniteQuery({
    queryKey: ["places", apiBaseUrl, PAGE_SIZE],
    enabled: Boolean(apiBaseUrl),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPlacesPage(apiBaseUrl as string, pageParam),
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
  });
}

export function useMyCardsQuery(apiBaseUrl?: string, userId?: string) {
  return useQuery({
    queryKey: ["cards", "my", apiBaseUrl, userId],
    enabled: Boolean(apiBaseUrl && userId),
    queryFn: () => fetchMyCards(apiBaseUrl as string, userId as string),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useCardCatalogQuery(apiBaseUrl?: string, userId?: string, region?: string) {
  return useInfiniteQuery({
    queryKey: ["cards", "catalog", apiBaseUrl, userId, region ?? "all", CATALOG_PAGE_SIZE],
    enabled: Boolean(apiBaseUrl && userId),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchCardCatalogPage(apiBaseUrl as string, pageParam, userId as string, region),
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
  });
}

export type VisitDialogPayload = {
  title: string;
  message: string;
};

export function useVisitMutation(
  apiBaseUrl?: string,
  userId?: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<CheckVisitRequest, "userId">) =>
      checkVisitWithUser(apiBaseUrl as string, {
        userId: userId as string,
        ...payload,
      }),
    onSuccess: async (payload) => {
      if (!payload.collected) return;
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["cards", "my", apiBaseUrl, userId],
          refetchType: "active",
        }),
        queryClient.invalidateQueries({
          queryKey: ["cards", "catalog", apiBaseUrl],
          refetchType: "all",
        }),
      ]);
    },
  });
}
