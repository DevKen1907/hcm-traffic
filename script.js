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
    { name: "Hàng Xanh", lat: 10.8015, lon: 106.7115 }
];

// 1. Khởi tạo bản đồ
var map = L.map('map').setView([10.7769, 106.7009], 11);

// Lớp nền bản đồ Dark Mode
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

// 2. Lớp phủ giao thông (Dùng dấu + để nối chuỗi thay vì dấu backtick để tránh lỗi)
var trafficUrl = 'https://{s}.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=' + KEY;
L.tileLayer(trafficUrl, {
   maxZoom: 22, tileSize: 256, opacity: 0.8
}).addTo(map);

var markers = {};

async function monitorTraffic() {
    var dangerPoints = [];
    var listContainer = document.getElementById('location-list');
    if (listContainer) listContainer.innerHTML = ''; 

    for (var i = 0; i < LOCATIONS.length; i++) {
        var loc = LOCATIONS[i];
        try {
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
