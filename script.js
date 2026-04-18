const KEY = 'ZJKb9h3uTUa2U3XEdlubQ7aRMqHPR9XZ';

const LOCATIONS = [
    { name: "Cầu Xáng (Trần Văn Giàu)", lat: 10.8175, lon: 106.5165 },
    { name: "Nguyễn Oanh - Phan Văn Trị", lat: 10.8268, lon: 106.6775 },
    { name: "Nguyễn Văn Bứa (Cầu Lớn)", lat: 10.8795, lon: 106.5512 },
    { name: "QL50 - Nguyễn Văn Linh", lat: 10.7222, lon: 106.6661 },
    { name: "Nguyễn Thái Sơn - Phạm Ngũ Lão", lat: 10.8188, lon: 106.6835 },
    { name: "Quốc lộ 51 (Phú Mỹ)", lat: 10.5901, lon: 107.0525 },
    { name: "Vòng xoay Lăng Cha Cả", lat: 10.8005, lon: 106.6632 },
    { name: "Nút giao Mỹ Thủy", lat: 10.7685, lon: 106.7765 },
    { name: "Vĩnh Lộc - Nguyễn Thị Tú", lat: 10.8125, lon: 106.5785 },
    { name: "Nguyễn Hữu Thọ - NVL", lat: 10.7305, lon: 106.7055 },
    { name: "Ngã tư Tây Hòa", lat: 10.8262, lon: 106.7565 },
    { name: "Phạm Văn Đồng - Phan Văn Trị", lat: 10.8182, lon: 106.6945 },
    { name: "Tôn Đức Thắng - Nguyễn Hữu Cảnh", lat: 10.7835, lon: 106.7065 },
    { name: "Cộng Hòa - Hoàng Hoa Thám", lat: 10.8035, lon: 106.6495 },
    { name: "Nguyễn Thị Định (Cát Lái)", lat: 10.7605, lon: 106.7865 },
    { name: "Nút giao An Phú", lat: 10.7915, lon: 106.7535 },
    { name: "Đường Nguyễn Tất Thành", lat: 10.7635, lon: 106.7085 },
    { name: "Dương Bá Trạc (Cầu Kênh Xáng)", lat: 10.7415, lon: 106.6905 },
    { name: "Trường Chinh (Âu Cơ - TKTQ)", lat: 10.8015, lon: 106.6395 },
    { name: "Đinh Bộ Lĩnh - Bạch Đằng", lat: 10.8025, lon: 106.7065 },
    { name: "Xô Viết Nghệ Tĩnh (Hàng Xanh)", lat: 10.8055, lon: 106.7115 },
    { name: "Nguyễn Văn Linh - Phạm Hùng", lat: 10.7265, lon: 106.6785 },
    { name: "Ngã tư Bốn xã", lat: 10.7725, lon: 106.6215 },
    { name: "Ngã tư Hàng Xanh", lat: 10.8015, lon: 106.7115 },
    { name: "Cầu Phú Cường", lat: 10.9655, lon: 106.6465 },
    { name: "Đường dẫn Cao tốc (Km4)", lat: 10.7985, lon: 106.7685 },
    { name: "Nguyễn Thị Định + Song hành", lat: 10.7935, lon: 106.7585 },
    { name: "Cầu Bình Điền", lat: 10.6865, lon: 106.5825 },
    { name: "Nút giao An Lạc (Tây Bắc)", lat: 10.7225, lon: 106.6065 },
    { name: "Nút giao An Lạc (Trung tâm)", lat: 10.7225, lon: 106.6065 },
    { name: "Cầu vượt Tân Vạn", lat: 10.8875, lon: 106.8285 }
];

var map = L.map('map', { center: [10.7769, 106.7009], zoom: 11, zoomControl: false });

L.tileLayer(`https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${KEY}`, {
    maxZoom: 22, attribution: '© TomTom'
}).addTo(map);

L.tileLayer(`https://{s}.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${KEY}`, {
    maxZoom: 22, tileSize: 256, opacity: 0.7
}).addTo(map);

var markers = {};

async function monitorTraffic() {
    const listContainer = document.getElementById('location-list');
    const statusBox = document.getElementById('global-status');
    let dangerCount = 0;
    if (listContainer) listContainer.innerHTML = ''; 

    for (let loc of LOCATIONS) {
        try {
            const apiUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${KEY}&point=${loc.lat},${loc.lon}`;
            const res = await fetch(apiUrl);
            const data = await res.json();
            const flow = data.flowSegmentData;

            const ratio = (flow.currentSpeed / flow.freeFlowSpeed) * 100;
            const isDanger = (ratio < 45); 
            if (isDanger) dangerCount++;

            const color = isDanger ? '#ff5252' : '#00e676';
            if (markers[loc.name]) map.removeLayer(markers[loc.name]);
            
            markers[loc.name] = L.circleMarker([loc.lat, loc.lon], {
                radius: 7, color: color, fillColor: color, fillOpacity: 0.8
            }).addTo(map).bindPopup(`<b>${loc.name}</b><br>Tốc độ: ${flow.currentSpeed} km/h`);

            if (listContainer) {
                const item = document.createElement('div');
                item.className = 'location-item';
                item.innerHTML = `<span><span class="dot ${isDanger ? 'bg-red' : 'bg-green'}"></span>${loc.name}</span><b style="color: ${color}">${ratio.toFixed(0)}%</b>`;
                listContainer.appendChild(item);
            }
        } catch (e) { console.error(loc.name); }
    }

    if (statusBox) {
        statusBox.classList.remove('loading');
        statusBox.innerText = dangerCount > 0 ? `PHÁT HIỆN ${dangerCount} ĐIỂM ĐANG ÙN TẮC` : "GIAO THÔNG 31 ĐIỂM ỔN ĐỊNH";
        statusBox.style.color = dangerCount > 0 ? '#ff5252' : '#00e676';
    }
}

monitorTraffic();
setInterval(monitorTraffic, 120000);
