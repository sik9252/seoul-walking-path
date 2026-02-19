import React from "react";
import { Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewMessageEvent } from "react-native-webview";
import { gameStyles as styles } from "../../../styles/gameStyles";

type ExploreMapViewProps = {
  mapRef: React.RefObject<WebView | null>;
  kakaoJavascriptKey?: string;
  mapHtml: string;
  onMessage: (event: WebViewMessageEvent) => void;
  onLoadEnd?: () => void;
};

export function ExploreMapView({
  mapRef,
  kakaoJavascriptKey,
  mapHtml,
  onMessage,
  onLoadEnd,
}: ExploreMapViewProps) {
  if (!kakaoJavascriptKey) {
    return (
      <View style={styles.imageFallback}>
        <Text style={styles.errorText}>EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY가 필요합니다.</Text>
      </View>
    );
  }

  return (
    <WebView
      ref={mapRef}
      style={styles.mapFull}
      source={{ html: mapHtml }}
      onMessage={onMessage}
      onLoadEnd={onLoadEnd}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={["*"]}
    />
  );
}
