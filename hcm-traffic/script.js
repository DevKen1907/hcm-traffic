const KEY = 'ZJKb9h3uTUa2U3XEdlubQ7aRMqHPR9XZ';
const POINT = '10.8015,106.7115'; // Tọa độ Hàng Xanh

async function updateTraffic() {
    const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${KEY}&point=${POINT}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const flow = data.flowSegmentData;

        const speedRatio = (flow.currentSpeed / flow.freeFlowSpeed) * 100;
        const delay = flow.currentDelay;
        
        const statusDiv = document.getElementById('status');
        const jsonPre = document.getElementById('json-output');

        jsonPre.innerText = JSON.stringify(data, null, 2);

        // ĐIỀU KIỆN CỦA BẠN: Tốc độ < 30% và Delay > 300s
        if (speedRatio < 30 && delay > 300) {
            statusDiv.className = "status-card danger";
            statusDiv.innerHTML = `<h2>CẢNH BÁO TẮC ĐƯỜNG</h2>
                                 <p>Tốc độ: ${flow.currentSpeed}km/h (${speedRatio.toFixed(1)}%)</p>
                                 <p>Độ trễ: ${delay} giây (Quá 5 phút)</p>`;
        } else {
            statusDiv.className = "status-card safe";
            statusDiv.innerHTML = `<h2>GIAO THÔNG ỔN ĐỊNH</h2>
                                 <p>Tình trạng bình thường. Tốc độ: ${speedRatio.toFixed(1)}%</p>`;
        }
    } catch (e) { statusDiv.innerText = "Lỗi tải dữ liệu!"; }
}

updateTraffic();
setInterval(updateTraffic, 300000); // Tự động cập nhật mỗi 5 phút (300s)
