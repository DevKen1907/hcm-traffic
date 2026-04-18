const KEY = 'ZJKb9h3uTUa2U3XEdlubQ7aRMqHPR9XZ';

// Danh sách các điểm cửa ngõ và nút giao thông chính bạn yêu cầu
const LOCATIONS = [
    { name: "Bến xe Miền Tây", lat: 10.7410, lon: 106.6202 },
    { name: "Bến xe Miền Đông (Cũ)", lat: 10.8142, lon: 106.7118 },
    { name: "Vòng xoay An Lạc", lat: 10.7225, lon: 106.6062 },
    { name: "Cao tốc Long Thành (Nút giao An Phú)", lat: 10.7853, lon: 106.7570 },
    { name: "Quốc lộ 51 (Nút giao QL1)", lat: 10.9322, lon: 106.8778 },
    { name: "Quốc lộ 1 (Đoạn Bình Chánh)", lat: 10.6865, lon: 106.5912 },
    { name: "Xa lộ Hà Nội (Cầu Rạch Chiếc)", lat: 10.8039, lon: 106.7410 },
    { name: "Ngã tư Thủ Đức", lat: 10.8507, lon: 106.7721 },
    { name: "Cầu Phú Mỹ", lat: 10.7465, lon: 106.7460 },
    { name: "Cảng Cát Lái", lat: 10.7621, lon: 106.7844 },
    { name: "Tỉnh lộ 8 (Củ Chi)", lat: 10.9702, lon: 106.4915 },
    { name: "Đường Võ Trần Chí", lat: 10.7062, lon: 106.5815 },
    { name: "Trạm thu phí Chợ Đệm", lat: 10.6975, lon: 106.5750 },
    { name: "Hàng Xanh", lat: 10.8015, lon: 106.7115 }
];

// Giữ nguyên phần code khởi tạo map và hàm checkAllLocations bên dưới
const map = L.map('map').setView([10.785, 106.695], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let markers = {};

async function checkAllLocations() {
    const listContainer = document.getElementById('location-list');
    listContainer.innerHTML = ''; // Reset danh sách
    let dangerCount = 0;

    for (let loc of LOCATIONS) {
        const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${KEY}&point=${loc.lat},${loc.lon}`;
        
        try {
            const res = await fetch(url);
            const data = await res.json();
            const flow = data.flowSegmentData;

            const ratio = (flow.currentSpeed / flow.freeFlowSpeed) * 100;
            const delay = flow.currentDelay;
            const isDanger = (ratio < 30 && delay > 300);

            if (isDanger) dangerCount++;

            // Vẽ/Cập nhật marker trên bản đồ
            const color = isDanger ? 'red' : '#2e7d32';
            if (markers[loc.name]) map.removeLayer(markers[loc.name]);
            
            markers[loc.name] = L.circle([loc.lat, loc.lon], {
                color: color, fillColor: color, fillOpacity: 0.6, radius: 300
            }).addTo(map).bindPopup(`${loc.name}: ${ratio.toFixed(1)}% speed`);

            // Thêm vào danh sách hiển thị phía dưới
            const item = document.createElement('div');
            item.className = 'location-item';
            item.innerHTML = `
                <span><span class="dot ${isDanger ? 'bg-red' : 'bg-green'}"></span>${loc.name}</span>
                <span class="status-text" style="color: ${isDanger ? '#ff5252' : '#69f0ae'}">
                    ${flow.currentSpeed}km/h (${ratio.toFixed(0)}%)
                </span>
            `;
            listContainer.appendChild(item);

        } catch (e) { console.error(`Lỗi tại ${loc.name}`); }
    }

    document.getElementById('global-status').innerText = 
        dangerCount > 0 ? `PHÁT HIỆN ${dangerCount} ĐIỂM TẮC NGHẼN!` : "TẤT CẢ CÁC ĐIỂM ĐỀU ỔN ĐỊNH";
    document.getElementById('global-status').style.color = dangerCount > 0 ? '#ff5252' : '#69f0ae';
}

checkAllLocations();
setInterval(checkAllLocations, 180000); // Cập nhật mỗi 3 phút
