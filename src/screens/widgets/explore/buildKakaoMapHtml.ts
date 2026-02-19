import { PlaceItem } from "../../../types/gameTypes";

type MapCenter = {
  latitude: number;
  longitude: number;
};

type UserLocation = {
  latitude: number;
  longitude: number;
  heading?: number | null;
} | null;

export function buildKakaoMapHtml(params: {
  kakaoJavascriptKey: string;
  markerPlaces: PlaceItem[];
  userLocation: UserLocation;
  mapCenter: MapCenter;
}) {
  const { kakaoJavascriptKey, markerPlaces, userLocation, mapCenter } = params;

  const placesJson = JSON.stringify(
    markerPlaces.map((place) => ({
      id: place.id,
      name: place.name,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      imageUrl: place.imageUrl ?? null,
    })),
  );
  const userLocationJson = JSON.stringify(userLocation);
  const centerJson = JSON.stringify(mapCenter);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
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
      .user-marker {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        background: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25), 0 2px 8px rgba(0, 0, 0, 0.22);
        position: relative;
      }
      .user-heading {
        position: absolute;
        top: -15px;
        left: 50%;
        width: 0;
        height: 0;
        margin-left: -6px;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 11px solid #1d4ed8;
        transform-origin: 50% 21px;
      }
      .user-heading.idle {
        opacity: 0.8;
      }
    </style>
    <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoJavascriptKey}&autoload=false"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      (function () {
        const places = ${placesJson};
        const userLocation = ${userLocationJson};
        const center = ${centerJson};

        function postMessage(payload) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          }
        }

        function init() {
          const mapContainer = document.getElementById("map");
          const map = new kakao.maps.Map(mapContainer, {
            center: new kakao.maps.LatLng(center.latitude, center.longitude),
            level: 7,
          });
          window.__zoomMap = function (delta) {
            const currentLevel = map.getLevel();
            const nextLevel = Math.min(14, Math.max(1, currentLevel + delta));
            map.setLevel(nextLevel);
          };

          if (userLocation && userLocation.latitude && userLocation.longitude) {
            const heading = typeof userLocation.heading === "number" ? userLocation.heading : null;

            const userMarker = document.createElement("div");
            userMarker.className = "user-marker";

            const headingArrow = document.createElement("div");
            headingArrow.className = heading === null ? "user-heading idle" : "user-heading";
            headingArrow.style.transform = "rotate(" + (heading === null ? 0 : heading) + "deg)";
            userMarker.appendChild(headingArrow);

            const userOverlay = new kakao.maps.CustomOverlay({
              position: new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude),
              content: userMarker,
              yAnchor: 0.5,
              zIndex: 6,
            });
            userOverlay.setMap(map);
          }

          places.forEach(function (place) {
            const position = new kakao.maps.LatLng(place.lat, place.lng);

            if (place.imageUrl) {
              const button = document.createElement("button");
              button.className = "spot-marker";
              button.type = "button";
              button.ariaLabel = place.name;

              const image = document.createElement("img");
              image.src = place.imageUrl;
              image.alt = place.name;
              image.onerror = function () {
                button.style.background = "#dce5d5";
                button.innerHTML = "";
              };
              button.appendChild(image);

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
              return;
            }

            const marker = new kakao.maps.Marker({ map, position });
            kakao.maps.event.addListener(marker, "click", function () {
              postMessage({ type: "markerPress", placeId: place.id });
            });
          });
        }

        kakao.maps.load(init);
      })();
    </script>
  </body>
</html>`;
}
