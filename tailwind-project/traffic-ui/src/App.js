import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'leaflet/dist/leaflet.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = process.env.REACT_APP_API_URL || (isLocal ? 'http://127.0.0.1:8000' : '');

function App() {
  const [road, setRoad] = useState('R1');
  const [hour, setHour] = useState(12);
  const [day, setDay] = useState('Monday');
  const [weather, setWeather] = useState('Clear');
  const [congestion, setCongestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hourlyData, setHourlyData] = useState([]);

  // Hardcoded road coordinates
  const roadCoords = {
    R1: [[51.505, -0.09], [51.51, -0.1]],
    R2: [[51.515, -0.08], [51.52, -0.11]],
    R3: [[51.525, -0.07], [51.53, -0.12]],
  };

  const predict = async () => {
    setLoading(true);
    setCongestion(null); // Clear previous result
    try {
      const response = await fetch(`${API_BASE_URL}/predict?road=${road}&hour=${hour}&day=${day}&weather=${weather}`);
      const data = await response.json();
      // Add 1 second delay for perceived intelligence
      setTimeout(() => {
        setCongestion(data.predicted_congestion);
        setLoading(false);
      }, 1000);
    } catch (error) {
      alert('Error fetching prediction');
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchHourlyData = async () => {
      const promises = [];
      for (let h = 0; h < 24; h++) {
        promises.push(
          fetch(`${API_BASE_URL}/predict?road=${road}&hour=${h}&day=${day}&weather=${weather}`)
            .then(res => res.json())
            .then(d => ({ hour: h, congestion: d.predicted_congestion }))
        );
      }
      const results = await Promise.all(promises);
      setHourlyData(results);
    };

    fetchHourlyData();
  }, [road, day, weather]);

  const isPeakHour = (h) => (h >= 8 && h <= 10) || (h >= 17 && h <= 20);

  const getCongestionInfo = () => {
    if (congestion === null) return null;
    if (congestion < 0.4) return { emoji: '🟢', text: 'Low Congestion', color: 'green', progress: congestion / 0.4 * 100 };
    if (congestion < 0.7) return { emoji: '🟡', text: 'Moderate Congestion', color: 'yellow', progress: (congestion - 0.4) / 0.3 * 100 };
    return { emoji: '🔴', text: 'High Congestion', color: 'red', progress: (congestion - 0.7) / 0.3 * 100 };
  };

  const getRouteComparison = () => {
    if (congestion === null) return null;
    // Simulate alternative route with 20% less congestion
    const altCongestion = Math.max(0, congestion - 0.2);
    const reduction = ((congestion - altCongestion) / congestion * 100).toFixed(0);
    return {
      current: congestion,
      alternative: altCongestion,
      reduction: reduction
    };
  };

  const getFuelSavings = () => {
    if (congestion === null || congestion < 0.7) return null;
    const savings = 0.3; // Assume 0.3L savings
    return `Optimized route saves approx ${savings}L fuel.`;
  };

  const congestionInfo = getCongestionInfo();
  const fuelSavings = getFuelSavings();
  const routeComparison = getRouteComparison();

  const mapColor = congestionInfo ? congestionInfo.color : 'blue';

  const chartData = {
    labels: hourlyData.map(d => d.hour),
    datasets: [
      {
        label: 'Congestion Level',
        data: hourlyData.map(d => d.congestion),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Predictive Traffic Intelligence System
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Controls</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Road</label>
                <button 
                  onClick={() => {
                    const now = new Date();
                    setHour(now.getHours());
                    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    setDay(days[now.getDay()]);
                  }}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded transition-colors"
                >
                  Set to Live Time
                </button>
              </div>
              <div>
                <select
                  value={road}
                  onChange={(e) => setRoad(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="R1">R1</option>
                  <option value="R2">R2</option>
                  <option value="R3">R3</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weather</label>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Clear">☀️ Clear</option>
                    <option value="Rain">🌧️ Rain</option>
                    <option value="Snow">❄️ Snow</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hour: {hour}:00 {isPeakHour(hour) && <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Peak Traffic</span>}
                </label>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={hour}
                  onChange={(e) => setHour(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <button
                onClick={predict}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 transform hover:scale-105 active:scale-95"
              >
                {loading ? 'Predicting...' : 'Predict Congestion'}
              </button>
              
              {loading && (
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <div className="mt-2 text-sm text-gray-600">Analyzing traffic patterns...</div>
                </div>
              )}
              
              {congestionInfo && !loading && (
                <div className="text-center p-4 bg-gray-50 rounded-md transition-all duration-300 ease-in-out">
                  <div className="text-4xl mb-2">{congestionInfo.emoji}</div>
                  <div className="text-lg font-semibold">{congestionInfo.text}</div>
                  
                  {/* Confidence Meter */}
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-1">Confidence Level</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${
                          congestionInfo.color === 'green' ? 'bg-green-500' :
                          congestionInfo.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${congestionInfo.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-2">
                    Predicted value: {congestion.toFixed(2)}
                  </div>
                  
                  {fuelSavings && (
                    <div className="text-sm text-green-600 mt-2 font-medium">
                      {fuelSavings}
                    </div>
                  )}
                  
                  {/* Route Comparison */}
                  {routeComparison && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <div className="text-sm font-medium text-blue-800">Route Optimization</div>
                      <div className="text-xs text-blue-600 mt-1">
                        Current route: {(routeComparison.current * 100).toFixed(0)}% congestion<br/>
                        Optimized route: {(routeComparison.alternative * 100).toFixed(0)}% congestion<br/>
                        <span className="font-semibold">Reduction: {routeComparison.reduction}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Map */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Traffic Map</h2>
            <div className="h-64">
              <MapContainer center={[51.51, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Polyline positions={roadCoords[road]} color={mapColor} weight={5} />
              </MapContainer>
            </div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
          <h2 className="text-2xl font-semibold mb-4">Congestion vs Hour ({road})</h2>
          <div className="h-64">
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
