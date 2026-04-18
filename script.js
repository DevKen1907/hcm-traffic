const TOMTOM_KEY = 'ZJKb9h3uTUa2U3XEdlubQ7aRMqHPR9XZ';

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
    { name: "Nguyễn Văn Linh - Phạm Hùng", lat: 10.7265, lon: 106.6775 },
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

// 1. Layer nền TomTom
L.tileLayer(`https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`).addTo(map);

// 2. Layer Traffic Flow (Hiển thị các đường màu xanh/đỏ trên bản đồ)
L.tileLayer(`https://{s}.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`, { opacity: 0.7 }).addTo(map);

// --- PHẦN THÊM MỚI: Nạp ranh giới 168 phường xã ---
async function loadNewBoundaries() {
    try {
        // Thay 'data/hcm_wards_2026.json' bằng đường dẫn file bạn vừa export từ Mapshaper
        const response = await fetch('data/hcm_wards_2026.json');
        const geoData = await response.json();

        L.geoJSON(geoData, {
            style: {
                color: '#2c3e50', // Màu đường ranh giới (xám đậm)
                weight: 1,
                opacity: 0.5,
                fillColor: '#34495e',
                fillOpacity: 0.05 // Để mờ để không đè mất lớp traffic
            },
            onEachFeature: function (feature, layer) {
                // Hiển thị tên phường mới khi di chuột vào vùng ranh giới
                if (feature.properties && feature.properties.name) {
                    layer.bindTooltip(feature.properties.name, { sticky: true });
                }
            }
        }).addTo(map);
    } catch (error) {
        console.error("Không thể nạp dữ liệu ranh giới:", error);
    }
}
loadNewBoundaries();
// ------------------------------------------------

var markers = {};
var incidentLayer = L.layerGroup().addTo(map);

function focusOn(lat, lon, name) {
    map.setView([lat, lon], 16);
    if(markers[name]) markers[name].openPopup();
}

// Hàm lấy dữ liệu sự cố (Accidents/Road Closure) từ TomTom Incident API
async function fetchTomTomIncidents() {
    // Bounding Box của HCM
    const bbox = "106.3,10.5,107.0,11.1"; 
    const url = `https://api.tomtom.com/traffic/services/4/incidentDetails/s3/${bbox}/11/-1/json?key=${TOMTOM_KEY}&trafficModelID=-1`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        incidentLayer.clearLayers();

        if (data.tm && data.tm.poi) {
            data.tm.poi.forEach(incident => {
                // p: loại sự cố (1: Tai nạn, 2: Kẹt xe, 8: Đóng đường...)
                let iconHtml = '';
                if (incident.p === 1) iconHtml = '⚠️'; // Tai nạn
                if (incident.p === 8) iconHtml = '🚫'; // Đóng đường
                if (incident.p === 6) iconHtml = '🚧'; // Công trình

                if (iconHtml) {
                    const icon = L.divIcon({
                        html: `<div style="font-size: 20px;">${iconHtml}</div>`,
                        className: '', iconSize: [25, 25]
                    });
                    L.marker([incident.y, incident.x], {icon: icon})
                     .addTo(incidentLayer)
                     .bindPopup(`<b>Sự cố:</b> ${incident.d || 'Đang cập nhật'}`);
                }
            });
        }
    } catch (e) {
        console.error("Lỗi lấy sự cố TomTom", e);
    }
}

// Hàm giám sát tốc độ tại 31 điểm
async function updateTrafficData() {
    const list = document.getElementById('location-list');
    const statusBox = document.getElementById('global-status');
    statusBox.innerText = "ĐANG CẬP NHẬT DỮ LIỆU...";
    
    let dangerCount = 0;
    if (list) list.innerHTML = '';

    await fetchTomTomIncidents(); // Cập nhật sự cố trước

    const promises = LOCATIONS.map(async (loc) => {
        try {
            const res = await fetch(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM_KEY}&point=${loc.lat},${loc.lon}`);
            const data = await res.json();
            const flow = data.flowSegmentData;
            
            const ratio = (flow.currentSpeed / flow.freeFlowSpeed) * 100;
            const isCongested = ratio < 45;
            if(isCongested) dangerCount++;

            const color = isCongested ? '#d93025' : '#188038';
            
            if(markers[loc.name]) map.removeLayer(markers[loc.name]);
            markers[loc.name] = L.circleMarker([loc.lat, loc.lon], { 
                radius: 8, color: '#fff', weight: 2, fillColor: color, fillOpacity: 0.9 
            }).addTo(map).bindPopup(`<b>${loc.name}</b><br>Tốc độ: ${flow.currentSpeed} km/h`);

            const div = document.createElement('div');
            div.className = 'location-item';
            div.onclick = () => focusOn(loc.lat, loc.lon, loc.name);
            div.innerHTML = `
                <span><span class="dot ${isCongested?'bg-red':'bg-green'}"></span>${loc.name}</span>
                <b style="color:${color}">${ratio.toFixed(0)}%</b>
            `;
            return { element: div, congested: isCongested };
        } catch(e) { return null; }
    });

    const results = await Promise.all(promises);
    results.forEach(r => { if(r) list.appendChild(r.element); });

    statusBox.innerText = dangerCount > 0 ? `CẢNH BÁO: ${dangerCount} ĐIỂM ÙN TẮC` : "GIAO THÔNG ĐANG ỔN ĐỊNH";
    statusBox.style.color = dangerCount > 0 ? '#d93025' : '#188038';
}

updateTrafficData();
setInterval(updateTrafficData, 120000); // Tự động cập nhật mỗi 2 phút
