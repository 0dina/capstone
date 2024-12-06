const ctx = document.getElementById("timeChart").getContext("2d");

let config = {
  type: "line",
  data: {
    labels: ["5분전", "4분전", "3분전", "2분전", "현재"],
    datasets: [
      {
        label: "온도",
        backgroundColor: "rgba(000, 153, 255, 1)",
        borderColor: "rgba(000, 153, 255, 1)",
        fill: false,
        data: [],
      },
      {
        label: "습도",
        backgroundColor: "rgba(153, 255, 102, 1)",
        borderColor: "rgba(153, 255, 102, 1)",
        fill: false,
        data: [],
      },
    ],
  },
  options: {
    maintainAspectRatio: false,
    title: {
      display: true,
      text: "온도 및 습도 변화",
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "값",
        },
      },
    },
  },
};

// 전역 차트 객체
let myChart = new Chart(ctx, config);

// 센서 데이터를 가져오는 함수
async function fetchData() {
  try {
    const response = await fetch("http://localhost:8080/api");
    const result = await response.json();
    const data = result.data;

    if (data && data.length > 0) {
      // HTML 요소 업데이트
      document.getElementById("temperature").textContent =
        data[data.length - 1].Temperature;
      document.getElementById("humidity").textContent =
        data[data.length - 1].Humidity;
      document.getElementById("pressure").textContent =
        data[data.length - 1].Pressure;
      document.getElementById("wind_speed").textContent =
        data[data.length - 1].WindSpeed;
      document.getElementById("wind_direction").textContent =
        data[data.length - 1].WindDirection;
      document.getElementById("rainfall").textContent =
        data[data.length - 1].Rainfall;
      document.getElementById("dust").textContent = data[data.length - 1].Dust;

      // 창문 상태 업데이트
      document.getElementById("window_status").textContent =
        data[data.length - 1].WindowState;

      // 차트 업데이트
      updateCharts(data);
    }
  } catch (error) {
    console.error("Error fetching sensor data:", error);
  }
}

// 창문을 열거나 닫는 함수
async function controlWindow(action) {
  try {
    const response = await fetch("/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: action }),
    });

    const result = await response.json();

    if (result.status === "success") {
      // 창문 상태 성공적으로 업데이트
      document.getElementById("window_status").textContent = result.message;
    } else {
      alert(result.message); // 예외 처리, 이미 창문이 열려있거나 닫혀있을 때
    }
  } catch (error) {
    console.error("Error controlling window:", error);
  }
}

// 차트 데이터를 업데이트하는 함수
function updateCharts(sensorData) {
  if (sensorData.length >= 5) {
    const recentData = sensorData.slice(-5); // 최신 5개 데이터
    config.data.datasets[0].data = recentData.map((item) => item.Temperature);
    config.data.datasets[1].data = recentData.map((item) => item.Humidity);

    // 기존 차트를 업데이트
    myChart.update();
  } else {
    console.error("Not enough data to update the chart");
  }
}

// 최초 데이터 가져오기
fetchData();
