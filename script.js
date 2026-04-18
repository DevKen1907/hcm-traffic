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

// 1. Layer nền TomTom sáng
L.tileLayer(`https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${KEY}`).addTo(map);

// 2. Layer Traffic Flow
L.tileLayer(`https://{s}.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${KEY}`, { opacity: 0.6 }).addTo(map);

var markers = {};
var wazeLayer = L.layerGroup().addTo(map);

function focusOn(lat, lon, name) {
    map.setView([lat, lon], 16);
    if(markers[name]) markers[name].openPopup();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// HÀM ĐÃ SỬA THEO CÁCH 1 (Dùng AllOrigins Proxy)
async function fetchWazeIncidents() {
    const statusBox = document.getElementById('global-status');
    statusBox.innerText = "ĐANG QUÉT WAZE...";
    
    // Gốc URL Waze
    const wazeUrl = "https://www.waze.com/row-rtserver/web/TGeoRSS?left=106.5&right=106.9&bottom=10.6&top=10.9";
    // Bọc qua AllOrigins để bypass CORS
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(wazeUrl)}`;
    
    try {
        const res = await fetch(proxyUrl);
        const wrapper = await res.json();
        // AllOrigins bọc JSON trong trường .contents dưới dạng chuỗi (string)
        const data = JSON.parse(wrapper.contents); 
        
        wazeLayer.clearLayers();
        let count = 0;

        if (data.alerts && data.alerts.length > 0) {
            data.alerts.forEach(a => {
                if (a.type === "ACCIDENT" || a.type === "ROAD_CLOSED" || a.type === "JAM") {
                    count++;
                    const wIcon = L.divIcon({
                        html: `<div style="background:white; border-radius:50%; padding:3px; border:2px solid #33ccff; display:flex; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"><img src="https://www.waze.com/favicon.ico" width="16"></div>`,
                        className: '', iconSize: [24, 24]
                    });
                    L.marker([a.location.y, a.location.x], {icon: wIcon})
                     .addTo(wazeLayer)
                     .bindPopup(`<b>Waze: ${a.subtype || a.type}</b><br>${a.reportDescription || 'Không có mô tả'}<br><small>${new Date().toLocaleTimeString()}</small>`);
                }
            });
            alert(`Đã cập nhật ${count} sự cố từ Waze.`);
        } else {
            alert("Không có sự cố nào được ghi nhận từ Waze tại khu vực này.");
        }
    } catch (e) {
        console.error("Lỗi Fetch Waze:", e);
        alert("Không thể lấy dữ liệu Waze qua Proxy. Hãy thử lại sau hoặc kiểm tra kết nối mạng.");
    }
    monitorTraffic(); 
}

async function monitorTraffic() {
    const list = document.getElementById('location-list');
    const statusBox = document.getElementById('global-status');
    let danger = 0;
    if (list) list.innerHTML = '';

    for (let loc of LOCATIONS) {
        try {
            const res = await fetch(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${KEY}&point=${loc.lat},${loc.lon}`);
            const data = await res.json();
            const flow = data.flowSegmentData;
            const ratio = (flow.currentSpeed / flow.freeFlowSpeed) * 100;
            const isRed = ratio < 45;
            if(isRed) danger++;

            const color = isRed ? '#ff5252' : '#00e676';
            if(markers[loc.name]) map.removeLayer(markers[loc.name]);
            
            markers[loc.name] = L.circleMarker([loc.lat, loc.lon], { radius: 7, color: color, fillColor: color, fillOpacity: 0.8 })
                .addTo(map).bindPopup(`<b>${loc.name}</b><br>Tốc độ: ${flow.currentSpeed} km/h`);

            const div = document.createElement('div');
            div.className = 'location-item';
            div.onclick = () => focusOn(loc.lat, loc.lon, loc.name);
            div.innerHTML = `<span><span class="dot ${isRed?'bg-red':'bg-green'}"></span>${loc.name}</span><b style="color:${color}">${ratio.toFixed(0)}%</b>`;
            list.appendChild(div);
        } catch(e) {}
    }
    statusBox.innerText = danger > 0 ? `CẢNH BÁO: ${danger} ĐIỂM ÙN TẮC` : "GIAO THÔNG ỔN ĐỊNH";
    statusBox.style.color = danger > 0 ? '#ff5252' : '#00e676';
}

monitorTraffic();
setInterval(monitorTraffic, 120000);
