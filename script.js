// Thiết lập báo lỗi ra màn hình để dễ theo dõi trên điện thoại
window.onerror = function(msg, url, line) {
    alert("Phát hiện lỗi: " + msg + "\nTại dòng: " + line);
    return true;
};

const KEY = 'ZJKb9h3uTUa2U3XEdlubQ7aRMqHPR9XZ';

// Danh sách các điểm nóng giao thông cửa ngõ TP.HCM
const LOCATIONS = [
    { name: "Bến xe Miền Tây", lat: 10.7410, lon: 106.6202 },
    { name: "Bến xe Miền Đông", lat: 10.8142, lon: 106.7118 },
    { name: "Vòng xoay An Lạc", lat: 10.7225, lon: 106.6062 },
    { name: "Nút giao An Phú", lat: 10.7853, lon: 106.7570 },
    { name: "Cầu Phú Mỹ", lat: 10.7465, lon: 106.7460 },
    { name: "Ngã tư Thủ Đức", lat: 10.8507, lon: 106.7721 },
    { name: "Cảng Cát Lái", lat: 10.7621, lon: 106.7844 },
    { name: "Trạm Chợ Đệm (CT Trung Lương)", lat: 10.6975, lon: 106.5750 },
    { name: "Ngã tư Hàng Xanh", lat: 10.8015, lon: 106.7115 }
];

// 1. Khởi tạo bản đồ tập trung vào trung tâm TP.HCM
var map = L.map('map', {
    center: [10.7769, 106.7009],
    zoom: 11,
    zoomControl: false // Ẩn nút +/- để giao diện sạch hơn trên mobile
});

// 2. Thêm lớp nền bản đồ Dark Mode chuyên nghiệp
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// 3. Thêm Lớp phủ Giao thông Toàn Thành phố (Flow Tiles)
var trafficUrl = 'https://a.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=' + KEY;
L.tileLayer(trafficUrl, {
    maxZoom: 22,
    tileSize: 256,
    opacity: 0.8
}).addTo(map);

var markers = {};

// 4. Hàm quét dữ liệu chi tiết từng điểm
async function monitorTraffic() {
    var dangerPoints = [];
    var listContainer = document.getElementById('location-list');
    var statusBox = document.getElementById('global-status');
    
    if (listContainer) listContainer.innerHTML = ''; 

    for (var i = 0; i < LOCATIONS.length; i++) {
        var loc = LOCATIONS[i];
        try {
            var apiUrl = 'https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=' + KEY + '&point=' + loc.lat + ',' + loc.lon;
            
            var res = await fetch(apiUrl);
            if (!res.ok) throw new Error("API Key hoặc kết nối có vấn đề");
            
            var data = await res.json();
            var flow = data.flowSegmentData;

            // Tính toán tỷ lệ thông thoáng
            var ratio = (flow.currentSpeed / flow.freeFlowSpeed) * 100;
            var isDanger = (ratio < 40); // Nếu tốc độ dưới 40% tốc độ chuẩn thì coi là kẹt

            if (isDanger) dangerPoints.push(loc.name);

            var color = isDanger ? '#ff5252' : '#00e676';
            
            // Vẽ marker lên bản đồ
            if (markers[loc.name]) map.removeLayer(markers[loc.name]);
            
            markers[loc.name] = L.circleMarker([loc.lat, loc.lon], {
                radius: 7, color: color, fillColor: color, fillOpacity: 0.8
            }).addTo(map).bindPopup('<b>' + loc.name + '</b><br>Tốc độ: ' + flow.currentSpeed + ' km/h');

            // Cập nhật danh sách bên dưới bản đồ
            if (listContainer) {
                var item = document.createElement('div');
                item.className = 'location-item';
                item.innerHTML = '<span><span class="dot ' + (isDanger ? 'bg-red' : 'bg-green') + '"></span>' + loc.name + '</span><b style="color: ' + color + '">' + ratio.toFixed(0) + '%</b>';
                listContainer.appendChild(item);
            }

        } catch (e) { 
            console.error("Lỗi quét điểm: " + loc.name);
        }
    }

    // Cập nhật trạng thái tổng quát
    if (statusBox) {
        statusBox.classList.remove('loading');
        if (dangerPoints.length > 0) {
            statusBox.innerText = 'CẢNH BÁO: ' + dangerPoints.length + ' ĐIỂM ĐANG KẸT XE';
            statusBox.style.color = '#ff5252';
        } else {
            statusBox.innerText = "GIAO THÔNG TOÀN THÀNH PHỐ ỔN ĐỊNH";
            statusBox.style.color = '#00e676';
        }
    }
}

// Chạy lần đầu và thiết lập lặp lại mỗi 2 phút
monitorTraffic();
setInterval(monitorTraffic, 120000);
            // Nối chuỗi API thủ công để đảm bảo an toàn
            var apiUrl = 'https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=' + KEY + '&point=' + loc.lat + ',' + loc.lon;
            
            var res = await fetch(apiUrl);
            var data = await res.json();
            var flow = data.flowSegmentData;

            var ratio = (flow.currentSpeed / flow.freeFlowSpeed) * 100;
            var delay = flow.currentDelay;
            var isDanger = (ratio < 35 && delay > 300);

            if (isDanger) dangerPoints.push(loc.name);

            var color = isDanger ? '#ff5252' : '#69f0ae';
            
            if (markers[loc.name]) map.removeLayer(markers[loc.name]);
            
            markers[loc.name] = L.circleMarker([loc.lat, loc.lon], {
                radius: 8, color: color, fillColor: color, fillOpacity: 0.9
            }).addTo(map).bindPopup('<b>' + loc.name + '</b><br>Tốc độ: ' + flow.currentSpeed + 'km/h');

            if (listContainer) {
                var item = document.createElement('div');
                item.className = 'location-item';
                item.innerHTML = '<span><span class="dot ' + (isDanger ? 'bg-red' : 'bg-green') + '"></span>' + loc.name + '</span><b style="color: ' + color + '">' + ratio.toFixed(0) + '%</b>';
                listContainer.appendChild(item);
            }

        } catch (e) { console.error("Lỗi quét điểm"); }
    }

    var statusBox = document.getElementById('global-status');
    if (statusBox) {
        if (dangerPoints.length > 0) {
            statusBox.innerText = 'CẢNH BÁO: ' + dangerPoints.join(', ') + ' ĐANG KẸT!';
            statusBox.style.color = '#ff5252';
        } else {
            statusBox.innerText = "GIAO THÔNG TOÀN THÀNH PHỐ ĐANG ỔN ĐỊNH";
            statusBox.style.color = '#69f0ae';
        }
    }
}

monitorTraffic();
setInterval(monitorTraffic, 120000);
            const res = await fetch(url);
            const data = await res.json();
            const flow = data.flowSegmentData;

            const ratio = (flow.currentSpeed / flow.freeFlowSpeed) * 100;
            const delay = flow.currentDelay;
            const isDanger = (ratio < 35 && delay > 300); // Ngưỡng cảnh báo

            if (isDanger) dangerPoints.push(loc.name);

            // Cập nhật Marker (Dùng vòng tròn nhỏ làm tâm điểm)
            const color = isDanger ? '#ff5252' : '#69f0ae';
            if (markers[loc.name]) map.removeLayer(markers[loc.name]);
            
            markers[loc.name] = L.circleMarker([loc.lat, loc.lon], {
                radius: 8, color: color, fillColor: color, fillOpacity: 0.9
            }).addTo(map).bindPopup(`<b>${loc.name}</b><br>Tốc độ: ${flow.currentSpeed}km/h`);

            // Thêm vào danh sách phía dưới
            const item = document.createElement('div');
            item.className = 'location-item';
            item.innerHTML = `
                <span><span class="dot ${isDanger ? 'bg-red' : 'bg-green'}"></span>${loc.name}</span>
                <b style="color: ${color}">${ratio.toFixed(0)}%</b>
            `;
            listContainer.appendChild(item);

        } catch (e) { console.error("Lỗi quét điểm"); }
    }

    // Cập nhật trạng thái tổng quát
    const statusBox = document.getElementById('global-status');
    if (dangerPoints.length > 0) {
        statusBox.innerText = `CẢNH BÁO: ${dangerPoints.join(', ')} ĐANG KẸT!`;
        statusBox.style.color = '#ff5252';
    } else {
        statusBox.innerText = "GIAO THÔNG TOÀN THÀNH PHỐ ĐANG ỔN ĐỊNH";
        statusBox.style.color = '#69f0ae';
    }
}

// Chạy ngay và lặp lại mỗi 2 phút
monitorTraffic();
setInterval(monitorTraffic, 120000);
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
