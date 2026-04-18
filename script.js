const KEY = 'ZJKb9h3uTUa2U3XEdlubQ7aRMqHPR9XZ';
const PROXY_URL = "https://script.google.com/macros/s/AKfycbzSf24pxd2YZC8b6D2hzLFOfJ5OGj3CU2uEoAlToVn7mjfkCwR9ZZVFc5lyFtEAejZe/exec";

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

// Khởi tạo bản đồ Leaflet
var map = L.map('map', { center: [10.7769, 106.7009], zoom: 11, zoomControl: false });

// Layer nền TomTom và Layer Traffic Flow
L.tileLayer(`https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${KEY}`).addTo(map);
L.tileLayer(`https://{s}.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${KEY}`, { opacity: 0.6 }).addTo(map);

var markers = {};
var wazeLayer = L.layerGroup().addTo(map);

// Hàm Zoom đến vị trí điểm nóng
function focusOn(lat, lon, name) {
    map.setView([lat, lon], 16);
    if(markers[name]) markers[name].openPopup();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Hàm lấy dữ liệu Waze qua Apps Script Proxy cá nhân của bạn
async function fetchWazeIncidents() {
    const statusBox = document.getElementById('global-status');
    const originalText = statusBox.innerText;
    statusBox.innerText = "ĐANG QUÉT WAZE...";
    
    try {
        // Sử dụng link Apps Script bạn cung cấp
        const res = await fetch(PROXY_URL);
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        wazeLayer.clearLayers();
        let count = 0;

        if (data.alerts && data.alerts.length > 0) {
            data.alerts.forEach(a => {
                // Lọc sự cố: Tai nạn, Đóng đường, hoặc Kẹt xe nặng
                if (a.type === "ACCIDENT" || a.type === "ROAD_CLOSED" || a.type === "JAM") {
                    count++;
                    const wIcon = L.divIcon({
                        html: `<div style="background:white; border-radius:50%; padding:3px; border:2px solid #33ccff; display:flex; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><img src="https://www.waze.com/favicon.ico" width="18"></div>`,
                        className: '', iconSize: [26, 26]
                    });
                    
                    L.marker([a.location.y, a.location.x], {icon: wIcon})
                     .addTo(wazeLayer)
                     .bindPopup(`<b>Waze: ${a.subtype || a.type}</b><br>${a.reportDescription || 'Không có mô tả chi tiết'}<br><small>Cập nhật: ${new Date().toLocaleTimeString()}</small>`);
                }
            });
            alert(`Đã tìm thấy ${count} báo cáo sự cố từ Waze.`);
        } else {
            alert("Khu vực hiện tại không có báo cáo sự cố nào từ Waze.");
        }
    } catch (e) {
        console.error("Lỗi kết nối Waze Proxy:", e);
        alert("Không thể kết nối tới dữ liệu Waze. Hãy đảm bảo bạn đã 'Deploy' Apps Script ở chế độ 'Anyone'.");
    }
    statusBox.innerText = originalText;
}

// Hàm giám sát thông thoáng các điểm nóng (Dữ liệu TomTom)
async function monitorTraffic() {
    const list = document.getElementById('location-list');
    const statusBox = document.getElementById('global-status');
    let danger = 0;
    if (list) list.innerHTML = '';

    // Dùng Promise.all để load dữ liệu nhanh hơn thay vì đợi từng cái
    const promises = LOCATIONS.map(async (loc) => {
        try {
            const res = await fetch(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${KEY}&point=${loc.lat},${loc.lon}`);
            const data = await res.json();
            const flow = data.flowSegmentData;
            
            // Tính tỷ lệ phần trăm thông thoáng
            const ratio = (flow.currentSpeed / flow.freeFlowSpeed) * 100;
            const isRed = ratio < 45;
            if(isRed) danger++;

            const color = isRed ? '#ff5252' : '#00e676';
            
            // Cập nhật marker trên bản đồ
            if(markers[loc.name]) map.removeLayer(markers[loc.name]);
            markers[loc.name] = L.circleMarker([loc.lat, loc.lon], { radius: 7, color: color, fillColor: color, fillOpacity: 0.8 })
                .addTo(map).bindPopup(`<b>${loc.name}</b><br>Tốc độ hiện tại: ${flow.currentSpeed} km/h`);

            // Tạo item trong danh sách bên dưới
            const div = document.createElement('div');
            div.className = 'location-item';
            div.onclick = () => focusOn(loc.lat, loc.lon, loc.name);
            div.innerHTML = `<span><span class="dot ${isRed?'bg-red':'bg-green'}"></span>${loc.name}</span><b style="color:${color}">${ratio.toFixed(0)}%</b>`;
            return { element: div, isRed: isRed };
        } catch(e) { 
            return null; 
        }
    });

    const results = await Promise.all(promises);
    results.forEach(res => {
        if(res) list.appendChild(res.element);
    });

    statusBox.innerText = danger > 0 ? `CẢNH BÁO: ${danger} ĐIỂM ÙN TẮC` : "GIAO THÔNG ỔN ĐỊNH";
    statusBox.style.color = danger > 0 ? '#ff5252' : '#00e676';
}

// Khởi chạy lần đầu và thiết lập tự động cập nhật mỗi 2 phút
monitorTraffic();
setInterval(monitorTraffic, 120000);
