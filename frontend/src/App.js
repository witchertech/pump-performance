import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [pumps, setPumps] = useState([]);
  const [stages, setStages] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [ratedSpeeds, setRatedSpeeds] = useState({});

  const [selectedPump, setSelectedPump] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedTestType, setSelectedTestType] = useState('');
  const [ratedSpeed, setRatedSpeed] = useState(3000);

  const [curveData, setCurveData] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load pumps on mount
  useEffect(() => {
    fetchPumps();
  }, []);

  // Load stages when pump changes
  useEffect(() => {
    if (selectedPump) {
      fetchStages(selectedPump);
      setSelectedStage('');
      setSelectedTestType('');
      setCurveData(null);
    }
  }, [selectedPump]);

  // Load test types and rated speeds when stage changes
  useEffect(() => {
    if (selectedPump && selectedStage) {
      fetchTestTypes(selectedPump, selectedStage);
      fetchRatedSpeeds(selectedPump, selectedStage);
      setSelectedTestType('');
      setCurveData(null);
    }
  }, [selectedStage]);

  // Fetch curve data when all filters are selected
  useEffect(() => {
    if (selectedPump && selectedStage && selectedTestType) {
      fetchCurveData();
    }
  }, [selectedPump, selectedStage, selectedTestType, ratedSpeed]);

  const fetchPumps = async () => {
    try {
      const res = await axios.get(`${API_URL}/pumps`);
      setPumps(res.data.pumps);
      if (res.data.pumps.length > 0) {
        setSelectedPump(res.data.pumps[0]);
      }
    } catch (err) {
      setError('Failed to load pumps');
      console.error(err);
    }
  };

  const fetchStages = async (pump) => {
    try {
      const res = await axios.get(`${API_URL}/stages/${pump}`);
      setStages(res.data.stages);
    } catch (err) {
      setError('Failed to load stages');
      console.error(err);
    }
  };

  const fetchTestTypes = async (pump, stage) => {
    try {
      const res = await axios.get(`${API_URL}/test-types/${pump}/${stage}`);
      setTestTypes(res.data.test_types);
    } catch (err) {
      setError('Failed to load test types');
      console.error(err);
    }
  };

  const fetchRatedSpeeds = async (pump, stage) => {
    try {
      const res = await axios.get(`${API_URL}/rated-speeds/${pump}/${stage}`);
      setRatedSpeeds(res.data);
      setRatedSpeed(res.data.avg_speed);
    } catch (err) {
      console.error('Failed to load rated speeds', err);
    }
  };

  const fetchCurveData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/curve-data`, {
        pump_type: selectedPump,
        stage: selectedStage,
        test_type: selectedTestType,
        rated_speed: ratedSpeed
      });
      setCurveData(res.data);
      setSelectedPoint(null);
    } catch (err) {
      setError('Failed to load curve data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlotClick = (data) => {
    console.log('Chart clicked:', data);
    
    if (data.points && data.points.length > 0) {
      const point = data.points[0];
      console.log('Point data:', point);
      
      const dataPoint = curveData.data_points[point.pointNumber];
      console.log('Full data point:', dataPoint);
      
      const newSelectedPoint = {
        flow: point.x,
        head: point.y,
        efficiency: point.customdata ? point.customdata[0] : 0,
        index: point.pointNumber,
        impeller_dia: dataPoint?.impeller_dia,
        all_data: dataPoint?.all_data
      };
      
      console.log('Setting selected point:', newSelectedPoint);
      setSelectedPoint(newSelectedPoint);
      
      // Position modal near the click
      if (data.event) {
        setModalPosition({ 
          x: data.event.clientX || 400, 
          y: data.event.clientY || 200 
        });
      } else {
        setModalPosition({ x: 400, y: 200 });
      }
      
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            OEM Pump Performance Analyzer
          </h1>
          <p className="text-blue-200">Interactive H-Q Curves with Efficiency Analysis</p>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6 border border-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <div className="control-panel sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Configuration</h2>

              {/* Pump Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pump Type
                </label>
                <select
                  value={selectedPump}
                  onChange={(e) => setSelectedPump(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {pumps.map((pump) => (
                    <option key={pump} value={pump}>
                      {pump}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stages
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Stage</option>
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Test Type
                </label>
                <select
                  value={selectedTestType}
                  onChange={(e) => setSelectedTestType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Test Type</option>
                  {testTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rated Speed */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rated Speed (RPM)
                </label>
                <input
                  type="number"
                  value={ratedSpeed}
                  onChange={(e) => setRatedSpeed(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {ratedSpeeds.common_speeds && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ratedSpeeds.common_speeds.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setRatedSpeed(speed)}
                        className={`px-3 py-1 rounded text-sm font-medium transition ${
                          ratedSpeed === speed
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {speed}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Point Info */}
              {selectedPoint && (
                <div className="space-y-4">
                  <div className="stat-card">
                    <h3 className="font-bold text-gray-900 mb-3">Selected Point</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Flow:</strong> {selectedPoint.flow ? selectedPoint.flow.toFixed(2) : 'N/A'} L/s</p>
                      <p><strong>Head:</strong> {selectedPoint.head ? selectedPoint.head.toFixed(2) : 'N/A'} m</p>
                      <p><strong>Efficiency:</strong> {selectedPoint.efficiency ? selectedPoint.efficiency.toFixed(2) : 'N/A'}%</p>
                      {selectedPoint.impeller_dia && (
                        <p><strong>Impeller Dia:</strong> {selectedPoint.impeller_dia.toFixed(2)} mm</p>
                      )}
                    </div>
                  </div>

                  {/* All Dataset Parameters */}
                  {selectedPoint.all_data && (
                    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 max-h-96 overflow-y-auto">
                      <h3 className="font-bold text-gray-900 mb-4 sticky top-0 bg-white py-2 border-b">Full Dataset Entry</h3>
                      <div className="space-y-4">
                        {/* Pump Configuration */}
                        <div>
                          <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Pump Configuration</h4>
                          <div className="space-y-1 text-xs bg-blue-50 p-2 rounded">
                            {['PumpType', 'Stages', 'Pump_Detail_Impeller_Dia_1st_Stage', 'Pump_Detail_MOC'].map(key => (
                              selectedPoint.all_data[key] !== null && (
                                <div key={key} className="flex justify-between">
                                  <span className="font-medium text-gray-600">{key}:</span>
                                  <span className="text-gray-800">{selectedPoint.all_data[key]}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>

                        {/* Test Information */}
                        <div>
                          <h4 className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Test Information</h4>
                          <div className="space-y-1 text-xs bg-green-50 p-2 rounded">
                            {['TestNo', 'Test_Type_ID', 'Testpoint', 'Speed'].map(key => (
                              selectedPoint.all_data[key] !== null && (
                                <div key={key} className="flex justify-between">
                                  <span className="font-medium text-gray-600">{key}:</span>
                                  <span className="text-gray-800">{selectedPoint.all_data[key]}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>

                        {/* Performance Data */}
                        <div>
                          <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">Performance Data</h4>
                          <div className="space-y-1 text-xs bg-purple-50 p-2 rounded">
                            {['Flow', 'Total_Head', 'Pump_Efficiency', 'Pump_Input', 'Pump_Output'].map(key => (
                              selectedPoint.all_data[key] !== null && (
                                <div key={key} className="flex justify-between">
                                  <span className="font-medium text-gray-600">{key}:</span>
                                  <span className="text-gray-800">{selectedPoint.all_data[key]}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>

                        {/* Pressure Data */}
                        <div>
                          <h4 className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-2">Pressure Data</h4>
                          <div className="space-y-1 text-xs bg-orange-50 p-2 rounded">
                            {['Suction_Pr', 'hs', 'Discharge_Pr', 'hd', 'Vel_Head'].map(key => (
                              selectedPoint.all_data[key] !== null && (
                                <div key={key} className="flex justify-between">
                                  <span className="font-medium text-gray-600">{key}:</span>
                                  <span className="text-gray-800">{selectedPoint.all_data[key]}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>

                        {/* Electrical Data */}
                        <div>
                          <h4 className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">Electrical Data</h4>
                          <div className="space-y-1 text-xs bg-red-50 p-2 rounded">
                            {['voltage', 'P_Current', 'CT_ratio', 'Power_Reading', 'Motor_Input', 'Motor_Efficiency'].map(key => (
                              selectedPoint.all_data[key] !== null && (
                                <div key={key} className="flex justify-between">
                                  <span className="font-medium text-gray-600">{key}:</span>
                                  <span className="text-gray-800">{selectedPoint.all_data[key]}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>

                        {/* Metadata */}
                        <div>
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Metadata</h4>
                          <div className="space-y-1 text-xs bg-gray-50 p-2 rounded">
                            {['MNP_So_No', 'User_ID', 'Recent_updated'].map(key => (
                              selectedPoint.all_data[key] !== null && (
                                <div key={key} className="flex justify-between">
                                  <span className="font-medium text-gray-600">{key}:</span>
                                  <span className="text-gray-800">{selectedPoint.all_data[key]}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chart Area */}
          <div className="lg:col-span-3">
            {loading && (
              <div className="chart-container flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600">Loading curve data...</p>
                </div>
              </div>
            )}

            {!loading && curveData && (
              <div className="chart-container">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    H-Q Performance Curve
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {curveData.pump_type} • {curveData.stage} • {curveData.test_type} •{' '}
                    {curveData.rated_speed} RPM
                  </p>
                </div>

                <PumpCurveChart
                  dataPoints={curveData.data_points}
                  onPointClick={handlePlotClick}
                  selectedPoint={selectedPoint}
                />

                {/* Data Table */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Data</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Flow (L/s)
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Head (m)
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Efficiency (%)
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Power (kW)
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Impeller Dia (mm)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {curveData.data_points.map((point, idx) => (
                          <tr
                            key={idx}
                            className={`${
                              selectedPoint?.index === idx
                                ? 'bg-blue-100 border-l-4 border-blue-500'
                                : 'hover:bg-gray-50'
                            } cursor-pointer transition`}
                            onClick={() =>
                              setSelectedPoint({
                                flow: point.flow,
                                head: point.head,
                                efficiency: point.efficiency,
                                index: idx,
                                impeller_dia: point.impeller_dia,
                                all_data: point.all_data
                              })
                            }
                          >
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {point.flow.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {point.head.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {point.efficiency.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {point.power.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {point.impeller_dia ? point.impeller_dia.toFixed(2) : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {!loading && !curveData && !error && (
              <div className="chart-container flex items-center justify-center h-96 border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">
                    Select pump parameters to display curve
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Point Modal */}
      <DataPointModal
        selectedPoint={selectedPoint}
        modalPosition={modalPosition}
        showModal={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

function PumpCurveChart({ dataPoints, onPointClick, selectedPoint }) {
  if (!dataPoints || dataPoints.length === 0) return null;

  const trace = {
    x: dataPoints.map((p) => p.flow),
    y: dataPoints.map((p) => p.head),
    mode: 'lines+markers',
    type: 'scatter',
    name: 'H-Q Curve',
    line: {
      color: '#3b82f6',
      width: 3,
      shape: 'spline'
    },
    marker: {
      size: 8,
      color: dataPoints.map((p) => p.efficiency),
      colorscale: 'Viridis',
      showscale: true,
      colorbar: {
        title: 'Efficiency %',
        thickness: 20,
        len: 0.7
      },
      customdata: dataPoints.map((p) => [p.efficiency, p.impeller_dia]),
      hovertemplate:
        '<b>Performance Point</b><br>Flow: %{x:.2f} L/s<br>Head: %{y:.2f} m<br>Efficiency: %{customdata[0]:.1f}%<br>Impeller Dia: %{customdata[1]:.1f} mm<extra></extra>'
    }
  };

  // Add selected point trace
  const traces = [trace];
  if (selectedPoint && selectedPoint.flow !== undefined && selectedPoint.head !== undefined) {
    console.log('Adding selected point trace:', selectedPoint);
    traces.push({
      x: [selectedPoint.flow],
      y: [selectedPoint.head],
      mode: 'markers',
      name: 'Selected Point',
      marker: {
        size: 15,
        color: '#ef4444',
        symbol: 'star',
        line: {
          color: '#fff',
          width: 2
        }
      },
      hoverinfo: 'skip'
    });
  }

  const layout = {
    title: {
      text: '',
      font: { size: 20, color: '#1f2937', family: 'Arial, sans-serif' }
    },
    xaxis: {
      title: 'Flow Rate (L/s)',
      titlefont: { size: 14, color: '#374151' },
      tickfont: { size: 12, color: '#6b7280' },
      gridcolor: '#e5e7eb',
      zeroline: false,
      showgrid: true
    },
    yaxis: {
      title: 'Total Head (m)',
      titlefont: { size: 14, color: '#374151' },
      tickfont: { size: 12, color: '#6b7280' },
      gridcolor: '#e5e7eb',
      zeroline: false,
      showgrid: true
    },
    hovermode: 'closest',
    plot_bgcolor: '#f9fafb',
    paper_bgcolor: '#ffffff',
    margin: { l: 80, r: 80, t: 40, b: 80 },
    font: { family: 'Arial, sans-serif', color: '#374151' },
    showlegend: true,
    legend: {
      x: 0.02,
      y: 0.98,
      bgcolor: 'rgba(255, 255, 255, 0.9)',
      bordercolor: '#d1d5db',
      borderwidth: 1
    }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d']
  };

  return (
    <Plot
      data={traces}
      layout={layout}
      config={config}
      onClick={onPointClick}
      style={{ width: '100%', height: '500px' }}
    />
  );
}

// Data Point Modal Component
function DataPointModal({ selectedPoint, modalPosition, showModal, onClose }) {
  if (!showModal || !selectedPoint) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40"
      />
      
      {/* Modal */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 max-w-sm max-h-96 overflow-hidden flex flex-col"
        style={{
          left: `${modalPosition.x + 20}px`,
          top: `${modalPosition.y - 50}px`,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="font-bold text-lg">Performance Data</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 p-1 rounded transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-xs text-gray-600 font-semibold">Flow</p>
              <p className="text-lg font-bold text-blue-600">
                {selectedPoint.flow ? selectedPoint.flow.toFixed(2) : 'N/A'}
              </p>
              <p className="text-xs text-gray-500">L/s</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-xs text-gray-600 font-semibold">Head</p>
              <p className="text-lg font-bold text-green-600">
                {selectedPoint.head ? selectedPoint.head.toFixed(2) : 'N/A'}
              </p>
              <p className="text-xs text-gray-500">m</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <p className="text-xs text-gray-600 font-semibold">Efficiency</p>
              <p className="text-lg font-bold text-purple-600">
                {selectedPoint.efficiency ? selectedPoint.efficiency.toFixed(2) : 'N/A'}
              </p>
              <p className="text-xs text-gray-500">%</p>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <p className="text-xs text-gray-600 font-semibold">Impeller Dia</p>
              <p className="text-lg font-bold text-orange-600">
                {selectedPoint.impeller_dia ? selectedPoint.impeller_dia.toFixed(1) : 'N/A'}
              </p>
              <p className="text-xs text-gray-500">mm</p>
            </div>
          </div>

          {/* Additional Info */}
          {selectedPoint.all_data && (
            <div className="border-t pt-3 space-y-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Quick Info</h3>
              <div className="space-y-1 text-xs">
                {selectedPoint.all_data.Speed && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="font-semibold text-gray-800">{selectedPoint.all_data.Speed} RPM</span>
                  </div>
                )}
                {selectedPoint.all_data.Pump_Input && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Power:</span>
                    <span className="font-semibold text-gray-800">{parseFloat(selectedPoint.all_data.Pump_Input).toFixed(2)} kW</span>
                  </div>
                )}
                {selectedPoint.all_data.Testpoint && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Test Point:</span>
                    <span className="font-semibold text-gray-800">#{selectedPoint.all_data.Testpoint}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-3 border-t text-xs text-center text-gray-600">
          Scroll for more data • Click outside to close
        </div>
      </div>
    </>
  );
}

export default App;
