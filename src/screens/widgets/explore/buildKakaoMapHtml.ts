type MapCenter = {
  latitude: number;
  longitude: number;
};

export function buildKakaoMapHtml(params: { kakaoJavascriptKey: string; initialCenter: MapCenter }) {
  const { kakaoJavascriptKey, initialCenter } = params;
  const initialCenterJson = JSON.stringify(initialCenter);
  const userMarkerSize = 12;
  const userHeadingHalfWidth = 5;
  const userHeadingHeight = 10;
  const userHeadingOffset = 15;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
      :root {
        --user-marker-size: ${userMarkerSize}px;
        --user-heading-half-width: ${userHeadingHalfWidth}px;
        --user-heading-height: ${userHeadingHeight}px;
        --user-heading-offset: ${userHeadingOffset}px;
      }
      html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #f6f7f4; }
      .spot-marker {
        width: 34px;
        height: 34px;
        border-radius: 17px;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        background: #e8efe3;
        padding: 0;
      }
      .spot-marker img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .spot-marker-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #dce5d5;
      }
      .spot-marker-fallback svg {
        width: 18px;
        height: 18px;
        stroke: #43473e;
        fill: none;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .user-marker {
        width: var(--user-marker-size);
        height: var(--user-marker-size);
        border-radius: 50%;
        border: 2px solid #ffffff;
        background: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25), 0 2px 8px rgba(0, 0, 0, 0.22);
        position: relative;
      }
      .user-heading {
        position: absolute;
        top: calc(var(--user-heading-offset) * -1);
        left: 50%;
        width: 0;
        height: 0;
        margin-left: calc(var(--user-heading-half-width) * -1);
        border-left: var(--user-heading-half-width) solid transparent;
        border-right: var(--user-heading-half-width) solid transparent;
        border-bottom: var(--user-heading-height) solid #1d4ed8;
        transform-origin: 50% calc(var(--user-heading-offset) + 7px);
      }
      .user-heading.idle {
        opacity: 0.8;
      }
      .cluster-marker {
        min-width: 34px;
        height: 34px;
        padding: 0 8px;
        border-radius: 17px;
        border: 2px solid #ffffff;
        background: #2e561a;
        color: #ffffff;
        font-weight: 700;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
    </style>
    <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoJavascriptKey}&autoload=false"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      (function () {
        let places = [];
        let userLocation = null;
        let userOverlay = null;

        function postMessage(payload) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          }
        }

        function createDisplayItems(rawPlaces, level, centerLat, centerLng) {
          if (!rawPlaces || rawPlaces.length === 0) return [];

          if (rawPlaces.length <= 20) {
            return rawPlaces
              .map((place) => ({
                type: "single",
                place,
                score:
                  Math.abs(place.lat - centerLat) +
                  Math.abs(place.lng - centerLng),
              }))
              .sort((a, b) => a.score - b.score)
              .slice(0, 120)
              .map((item) => ({ type: item.type, place: item.place }));
          }

          function clusterCellByLevel(targetLevel) {
            if (targetLevel >= 11) return 0.1;
            if (targetLevel >= 9) return 0.06;
            if (targetLevel >= 7) return 0.03;
            if (targetLevel >= 6) return 0.01;
            if (targetLevel >= 5) return 0.005;
            if (targetLevel >= 4) return 0.003;
            
            return 0.001;
          }

          function buildGroupedDisplay(cellSize) {
            const grouped = new Map();
            rawPlaces.forEach((place) => {
              const key = [
                Math.floor(place.lat / cellSize),
                Math.floor(place.lng / cellSize),
              ].join("_");
              const existing = grouped.get(key);
              if (existing) {
                existing.items.push(place);
                return;
              }
              grouped.set(key, { items: [place] });
            });

            const items = [];
            grouped.forEach((group) => {
              if (group.items.length === 1) {
                items.push({ type: "single", place: group.items[0] });
                return;
              }

              const lat =
                group.items.reduce((sum, item) => sum + item.lat, 0) / group.items.length;
              const lng =
                group.items.reduce((sum, item) => sum + item.lng, 0) / group.items.length;
              items.push({
                type: "cluster",
                count: group.items.length,
                lat,
                lng,
              });
            });

            return items;
          }

          let clusterCell = clusterCellByLevel(level);
          let display = buildGroupedDisplay(clusterCell);

          // If still too dense, increase cluster strength progressively.
          while (display.length > 120 && clusterCell < 0.25) {
            clusterCell = clusterCell * 1.6;
            display = buildGroupedDisplay(clusterCell);
          }

          display.sort((a, b) => {
            const aLat = a.type === "single" ? a.place.lat : a.lat;
            const aLng = a.type === "single" ? a.place.lng : a.lng;
            const bLat = b.type === "single" ? b.place.lat : b.lat;
            const bLng = b.type === "single" ? b.place.lng : b.lng;
            const aScore = Math.abs(aLat - centerLat) + Math.abs(aLng - centerLng);
            const bScore = Math.abs(bLat - centerLat) + Math.abs(bLng - centerLng);
            return aScore - bScore;
          });

          return display.slice(0, 120);
        }

        function init() {
          const initialCenter = ${initialCenterJson};
          const mapContainer = document.getElementById("map");
          const map = new kakao.maps.Map(mapContainer, {
            center: new kakao.maps.LatLng(initialCenter.latitude, initialCenter.longitude),
            level: 3,
          });

          const overlays = [];

          function clearOverlays() {
            overlays.forEach((overlay) => overlay.setMap(null));
            overlays.length = 0;
          }

          function emitViewport() {
            const bounds = map.getBounds();
            const southWest = bounds.getSouthWest();
            const northEast = bounds.getNorthEast();
            const centerPoint = map.getCenter();
            postMessage({
              type: "viewportChanged",
              viewport: {
                minLat: southWest.getLat(),
                minLng: southWest.getLng(),
                maxLat: northEast.getLat(),
                maxLng: northEast.getLng(),
                level: map.getLevel(),
                centerLat: centerPoint.getLat(),
                centerLng: centerPoint.getLng(),
              },
            });
          }

          function renderPlaces() {
            clearOverlays();
            const centerPoint = map.getCenter();
            const displayItems = createDisplayItems(
              places,
              map.getLevel(),
              centerPoint.getLat(),
              centerPoint.getLng(),
            );

            displayItems.forEach(function (item) {
              if (item.type === "cluster") {
                const cluster = document.createElement("button");
                cluster.className = "cluster-marker";
                cluster.type = "button";
                cluster.textContent = String(item.count);
                cluster.addEventListener("click", function () {
                  map.setLevel(Math.max(1, map.getLevel() - 2), {
                    anchor: new kakao.maps.LatLng(item.lat, item.lng),
                  });
                });
                const clusterOverlay = new kakao.maps.CustomOverlay({
                  position: new kakao.maps.LatLng(item.lat, item.lng),
                  content: cluster,
                  yAnchor: 0.5,
                  zIndex: 4,
                });
                clusterOverlay.setMap(map);
                overlays.push(clusterOverlay);
                return;
              }

              const place = item.place;
              const position = new kakao.maps.LatLng(place.lat, place.lng);
              const button = document.createElement("button");
              button.className = "spot-marker";
              button.type = "button";
              button.ariaLabel = place.name;

              const fallback = document.createElement("div");
              fallback.className = "spot-marker-fallback";
              fallback.innerHTML =
                '<svg viewBox="0 0 24 24" aria-hidden="true">' +
                '<rect x="3.5" y="5.5" width="17" height="13" rx="2"></rect>' +
                '<circle cx="9" cy="10" r="1.5"></circle>' +
                '<path d="M6.5 16.5l4.3-4.3a1.1 1.1 0 0 1 1.6 0l2.1 2.1"></path>' +
                '<path d="M13.8 14.4l1.8-1.8a1.1 1.1 0 0 1 1.6 0l1.3 1.3"></path>' +
                "</svg>";

              if (place.imageUrl) {
                const image = document.createElement("img");
                image.src = place.imageUrl;
                image.alt = place.name;
                image.onerror = function () {
                  button.innerHTML = "";
                  button.appendChild(fallback);
                };
                button.appendChild(image);
              } else {
                button.appendChild(fallback);
              }

              button.addEventListener("click", function () {
                postMessage({ type: "markerPress", placeId: place.id });
              });

              const overlay = new kakao.maps.CustomOverlay({
                position,
                content: button,
                yAnchor: 1,
                zIndex: 3,
              });
              overlay.setMap(map);
              overlays.push(overlay);
            });
          }

          function renderUserLocation() {
            if (userOverlay) {
              userOverlay.setMap(null);
              userOverlay = null;
            }

            if (!userLocation || !userLocation.latitude || !userLocation.longitude) return;
            const heading = typeof userLocation.heading === "number" ? userLocation.heading : null;

            const userMarker = document.createElement("div");
            userMarker.className = "user-marker";

            const headingArrow = document.createElement("div");
            headingArrow.className = heading === null ? "user-heading idle" : "user-heading";
            headingArrow.style.transform = "rotate(" + (heading === null ? 0 : heading) + "deg)";
            userMarker.appendChild(headingArrow);

            userOverlay = new kakao.maps.CustomOverlay({
              position: new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude),
              content: userMarker,
              yAnchor: 0.5,
              zIndex: 6,
            });

            userOverlay.setMap(map);
          }

          window.__zoomMap = function (delta) {
            const currentLevel = map.getLevel();
            const nextLevel = Math.min(14, Math.max(1, currentLevel + delta));
            map.setLevel(nextLevel);
          };

          window.__setPlaces = function (nextPlaces) {
            if (!Array.isArray(nextPlaces)) return;
            places = nextPlaces;
            renderPlaces();
          };

          window.__setUserLocation = function (nextUserLocation) {
            userLocation = nextUserLocation || null;
            renderUserLocation();
          };

          window.__moveTo = function (lat, lng) {
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
            map.setCenter(new kakao.maps.LatLng(lat, lng));
          };

          renderPlaces();
          renderUserLocation();
          emitViewport();

          kakao.maps.event.addListener(map, "idle", function () {
            renderPlaces();
            emitViewport();
          });
        }

        kakao.maps.load(init);
      })();
    </script>
  </body>
</html>`;
}
