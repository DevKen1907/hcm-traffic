// Cấu hình API Key TomTom
const KEY = 'ZJKb9h3uTUa2U3XEdlubQ7aRMqHPR9XZ';

// Danh sách các điểm cần giám sát
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

// 1. Khởi tạo bản đồ Leaflet
var map = L.map('map', {
    center: [10.7769, 106.7009],
    zoom: 11,
    zoomControl: false // Ẩn nút +/- cho gọn trên mobile
});

// 2. Thêm lớp nền bản đồ TomTom (Kiểu sáng - Basic Main)
L.tileLayer(`https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${KEY}`, {
    maxZoom: 22,
    attribution: '© TomTom'
}).addTo(map);

// 3. Thêm lớp dữ liệu Giao thông TomTom (Traffic Flow)
L.tileLayer(`https://{s}.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${KEY}`, {
    maxZoom: 22,
    tileSize: 256,
    opacity: 0.7
}).addTo(map);

var markers = {};

// 4. Hàm quét và cập nhật dữ liệu giao thông
async function monitorTraffic() {
    const listContainer = document.getElementById('location-list');
    const statusBox = document.getElementById('global-status');
    let dangerPoints = [];
    
    // Xóa danh sách hiển thị cũ
    if (listContainer) listContainer.innerHTML = ''; 

    for (let loc of LOCATIONS) {
        try {
            // URL lấy dữ liệu lưu lượng giao thông tại điểm cụ thể
            const apiUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${KEY}&point=${loc.lat},${loc.lon}`;
            
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error("API Key hoặc kết nối gặp lỗi");
            
            const data = await res.json();
            const flow = data.flowSegmentData;

            // Tính toán % thông thoáng (Tốc độ thực tế / Tốc độ chuẩn)
            const ratio = (flow.currentSpeed / flow.freeFlowSpeed) * 100;
            const isDanger = (ratio < 40); // Ngưỡng cảnh báo nếu tốc độ giảm dưới 40%

            if (isDanger) dangerPoints.push(loc.name);
            const color = isDanger ? '#ff5252' : '#00e676';
            
            // Cập nhật Marker trên bản đồ
            if (markers[loc.name]) map.removeLayer(markers[loc.name]);
            
            markers[loc.name] = L.circleMarker([loc.lat, loc.lon], {
                radius: 8, 
                color: color, 
                fillColor: color, 
                fillOpacity: 0.8
            }).addTo(map).bindPopup(`<b>${loc.name}</b><br>Tốc độ: ${flow.currentSpeed} km/h`);

            // Cập nhật danh sách chi tiết bên dưới bản đồ
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
            console.error(`Lỗi cập nhật tại: ${loc.name}`);
        }
    }

    // Cập nhật dòng trạng thái tổng quát ở Header
    if (statusBox) {
        statusBox.classList.remove('loading');
        if (dangerPoints.length > 0) {
            statusBox.innerText = `CẢNH BÁO: ${dangerPoints.length} ĐIỂM ĐANG TẮC NGHẼN`;
            statusBox.style.color = '#ff5252';
        } else {
            statusBox.innerText = "GIAO THÔNG TOÀN THÀNH PHỐ ỔN ĐỊNH";
            statusBox.style.color = '#00e676';
        }
    }
}

// Chạy khởi tạo lần đầu
monitorTraffic();

// Thiết lập tự động cập nhật sau mỗi 2 phút
setInterval(monitorTraffic, 120000);
