let map;
async function loadData() {
  const response = await fetch(
    'https://script.google.com/macros/s/AKfycbwwf3YhD9khvlQthsR1Db7zw_WMYiiagCmWxcKwNzXqMiw6E837QPJr5doke8lmYTrZ/exec'
  );
  const locations = await response.json();
  console.log("Loaded locations:", locations);
  map = L.map("map").setView([34.92, 133.96], 13); // 初期表示
  // ベースマップ（標準地図）
  const baseMapStd = L.tileLayer(
    "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
    });
  // ベースマップ（航空写真）
  const baseMapAerial = L.tileLayer(
    "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg", {
      attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
    });
  // 初期マップとして「標準地図」を表示
  baseMapStd.addTo(map);
  // ベースマップ切り替えコントロール
  const baseMaps = {
    "白地図": baseMapStd,
    "航空写真": baseMapAerial
  };
  L.control.layers(baseMaps).addTo(map);

  // 🔥 火災用のカスタムアイコン
  const fireIcon = L.icon({
    iconUrl: "../images/fire.png", // ← ここをカスタム画像のURLに変更
    iconSize: [32, 32], // アイコンのサイズ
    iconAnchor: [16, 32], // アンカーの位置
    popupAnchor: [0, -32] // ポップアップの位置調整
  });
  const waterTankIcon = L.icon({
    iconUrl: "../images/water.png", // ← ここをカスタム画像のURLに変更
    iconSize: [32, 32], // アイコンのサイズ
    iconAnchor: [16, 32], // アンカーの位置
    popupAnchor: [0, -32] // ポップアップの位置調整
  });
  const hydrantIcon = L.icon({
    iconUrl: "../images/hydrant.png", // ← ここをカスタム画像のURLに変更
    iconSize: [32, 32], // アイコンのサイズ
    iconAnchor: [16, 32], // アンカーの位置
    popupAnchor: [0, -32] // ポップアップの位置調整
  });
  // 火災マーカーを追加
  if (Array.isArray(locations) && locations.length > 0) {
    locations.forEach(loc => {
      if (!isNaN(loc.lat) && !isNaN(loc.lng)) {
        if (loc.key === "防火水槽") {
          L.marker([loc.lat, loc.lng], {
              icon: waterTankIcon
            })
            .addTo(map)
            .bindPopup(loc.key)
            .openPopup();
        } else if (loc.key.includes("消火栓")) {
          L.marker([loc.lat, loc.lng], {
              icon: hydrantIcon
            })
            .addTo(map)
            .bindPopup(loc.key)
            .openPopup();
        } else {
          L.marker([loc.lat, loc.lng], {
              icon: fireIcon
            })
            .addTo(map)
            .bindPopup(loc.key)
            .openPopup();
        }
      } else {
        console.warn("Invalid location:", loc);
      }
    });
  } else {
    console.error("locations is not a valid array:", locations);
  }
  // 大字界表示
  // GeoJSONのスタイル
  const geoJsonStyle = {
    "color": "#fa7aab",
    "weight": 2,
    "opacity": 0.9,
  };
  // GeoJSONの内容を取得
  fetch(`./data/ooazakai.geojson`)
    .then((response) => response.json())
    .then((data) => {
      // GeoJSONのレイヤー
      L.geoJSON(data, {
        style: geoJsonStyle,
      }).addTo(map);
    });
}
window.onload = loadData;

// 現在地ボタンの機能
function locateUser() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      map.setView([lat, lng], 14); // 現在地に移動＆ズーム
      L.marker([lat, lng]).addTo(map)
        .bindPopup("あなたの現在地")
        .openPopup();
    }, (error) => {
      alert("現在地を取得できませんでした。");
      console.error(error);
    }
  );
}
