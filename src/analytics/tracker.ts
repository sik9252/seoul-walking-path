type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

type AnalyticsEventName =
  | "view_home"
  | "view_route_list"
  | "view_route_detail"
  | "click_start_walk"
  | "walk_pause"
  | "walk_resume"
  | "walk_finish"
  | "poi_click"
  | "route_favorite_add"
  | "route_favorite_remove"
  | "permission_location_granted"
  | "permission_location_denied";

type AnalyticsEvent = {
  name: AnalyticsEventName;
  payload?: AnalyticsPayload;
  at: string;
};

const eventQueue: AnalyticsEvent[] = [];

export function trackEvent(name: AnalyticsEventName, payload?: AnalyticsPayload) {
  const event: AnalyticsEvent = {
    name,
    payload,
    at: new Date().toISOString(),
  };
  eventQueue.push(event);
  // MVP 단계에서는 콘솔 로그로 이벤트 포인트 검증
  console.log("[analytics]", event);
}

export function getTrackedEvents() {
  return eventQueue;
}
