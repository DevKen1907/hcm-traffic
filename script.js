// Cấu hình
const KEY = 'ZJKb9h3uTUa2U3XEdlubQ7aRMqHPR9XZ';
const LOCATIONS = [
    { name: "Bến xe Miền Tây", lat: 10.7410, lon: 106.6202 },
    { name: "Bến xe Miền Đông", lat: 10.8142, lon: 106.7118 },
    { name: "Vòng xoay An Lạc", lat: 10.7225, lon: 106.6062 },
    { name: "Nút giao An Phú", lat: 10.7853, lon: 106.7570 },
    { name: "Cầu Phú Mỹ", lat: 10.7465, lon: 106.7460 },
    { name: "Ngã tư Thủ Đức", lat: 10.8507, lon: 106.7721 },
    { name: "Cảng Cát Lái", lat: 10.7621, lon: 106.7844 },
    { name: "Trạm Chợ Đệm", lat: 10.6975, lon: 106.5750 },
    { name: "Ngã tư Hàng Xanh", lat: 10.8015, lon: 106.7115 }
];

// 1. Khởi tạo bản đồ
var map = L.map('map', {
    center: [10.7769, 106.7009],
    zoom: 11,
    zoomControl: false
});

// 2. Layer Dark Mode
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// 3. Layer Traffic Flow
L.tileLayer('https://a.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=' + KEY, {
    maxZoom: 22,
    tileSize: 256,
    opacity: 0.8
}).addTo(map);

var markers = {};

// 4. Hàm quét dữ liệu
async function monitorTraffic() {
    const listContainer = document.getElementById('location-list');
    const statusBox = document.getElementById('global-status');
    let dangerPoints = [];

    // Tạm xóa danh sách cũ để cập nhật
    if (listContainer) listContainer.innerHTML = '';

    for (let loc of LOCATIONS) {
        try {
            const apiUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${KEY}&point=${loc.lat},${loc.lon}`;
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error("API Error");
            
            const data = await res.json();
            const flow = data.flowSegmentData;

            // Tính tỷ lệ: Tốc độ hiện tại / Tốc độ tối đa
            const ratio = (flow.currentSpeed / flow.freeFlowSpeed) * 100;
            const isDanger = ratio < 40; // Dưới 40% là kẹt

            if (isDanger) dangerPoints.push(loc.name);
            const color = isDanger ? '#ff5252' : '#00e676';

            // Cập nhật Marker
            if (markers[loc.name]) map.removeLayer(markers[loc.name]);
            markers[loc.name] = L.circleMarker([loc.lat, loc.lon], {
                radius: 8, color: color, fillColor: color, fillOpacity: 0.8
            }).addTo(map).bindPopup(`<b>${loc.name}</b><br>Tốc độ: ${flow.currentSpeed} km/h`);

            // Thêm vào danh sách UI
            if (listContainer) {
                const item = document.createElement('div');
                item.className = 'location-item';
                item.innerHTML = `
                    <span><span class="dot ${isDanger ? 'bg-red' : 'bg-green'}"></span>${loc.name}</span>
                    <b style="color: ${color}">${ratio.toFixed(0)}%</b>
                `;
                listContainer.appendChild(item);
            }
        } catch (e) {
            console.error("Lỗi tại: " + loc.name);
        }
    }

    // Cập nhật Header status
    if (statusBox) {
        statusBox.classList.remove('loading');
        if (dangerPoints.length > 0) {
            statusBox.innerText = `CẢNH BÁO: ${dangerPoints.length} ĐIỂM ĐANG KẸT`;
            statusBox.style.color = '#ff5252';
        } else {
            statusBox.innerText = "GIAO THÔNG ĐANG ỔN ĐỊNH";
            statusBox.style.color = '#00e676';
        }
    }
}

// Chạy khởi động
monitorTraffic();
// Cập nhật sau mỗi 2 phút (TomTom Traffic cập nhật khá nhanh)
setInterval(monitorTraffic, 120000);
