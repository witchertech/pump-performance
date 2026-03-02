import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function App() {
  const [pumps, setPumps] = useState([]);
  const [mode, setMode] = useState('single'); // 'single' or 'compare'
  
  // Single mode state
  const [singleConfig, setSingleConfig] = useState({
    pump: '', stage: '', testType: '', ratedSpeed: 3000
  });
  const [stages, setStages] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [curveData, setCurveData] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  // Compare mode state
  const [compareConfigs, setCompareConfigs] = useState([
    { id: 1, pump: '', stage: '', testType: '', stages: [], testTypes: [] }
  ]);
  const [compareData, setCompareData] = useState(null);
  const [compareSpeed, setCompareSpeed] = useState(3000);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPumps();
  }, []);

  useEffect(() => {
    if (mode === 'single' && singleConfig.pump) {
      fetchStages(singleConfig.pump);
    }
  }, [singleConfig.pump, mode]);

  useEffect(() => {
    if (mode === 'single' && singleConfig.pump && singleConfig.stage) {
      fetchTestTypes(singleConfig.pump, singleConfig.stage);
    }
  }, [singleConfig.stage, mode]);

  useEffect(() => {
    if (mode === 'single' && singleConfig.pump && singleConfig.stage && singleConfig.testType) {
      fetchSingleCurve();
    }
  }, [singleConfig.pump, singleConfig.stage, singleConfig.testType, singleConfig.ratedSpeed, mode]);

  const fetchPumps = async () => {
    try {
      const res = await axios.get(`${API_URL}/pumps`);
      setPumps(res.data.pumps);
    } catch (err) {
      setError('Failed to load pumps');
    }
  };

  const fetchStages = async (pump) => {
    try {
      const res = await axios.get(`${API_URL}/stages/${pump}`);
      setStages(res.data.stages);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTestTypes = async (pump, stage) => {
    try {
      const res = await axios.get(`${API_URL}/test-types/${pump}/${stage}`);
      setTestTypes(res.data.test_types);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSingleCurve = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/curve-data`, {
        pump_type: singleConfig.pump,
        stage: singleConfig.stage,
        test_type: singleConfig.testType,
        rated_speed: singleConfig.ratedSpeed
      });
      setCurveData(res.data);
      setSelectedPoint(null);
    } catch (err) {
      setError('Failed to load curve');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompareStages = async (pump, configId) => {
    try {
      const res = await axios.get(`${API_URL}/stages/${pump}`);
      setCompareConfigs(prev => prev.map(c => 
        c.id === configId ? { ...c, stages: res.data.stages, stage: '', testType: '', testTypes: [] } : c
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompareTestTypes = async (pump, stage, configId) => {
    try {
      const res = await axios.get(`${API_URL}/test-types/${pump}/${stage}`);
      setCompareConfigs(prev => prev.map(c => 
        c.id === configId ? { ...c, testTypes: res.data.test_types, testType: '' } : c
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompareCurves = async () => {
    const validConfigs = compareConfigs.filter(c => c.pump && c.stage && c.testType);
    if (validConfigs.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/compare-curves`, {
        pumps: validConfigs.map(c => ({
          pump_type: c.pump,
          stage: c.stage,
          test_type: c.testType
        })),
        rated_speed: compareSpeed
      });
      setCompareData(res.data);
    } catch (err) {
      setError('Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  const addCompareConfig = () => {
    setCompareConfigs([...compareConfigs, {
      id: Date.now(),
      pump: '',
      stage: '',
      testType: '',
      stages: [],
      testTypes: []
    }]);
  };

  const removeCompareConfig = (id) => {
    setCompareConfigs(compareConfigs.filter(c => c.id !== id));
  };

  const updateCompareConfig = (id, field, value) => {
    setCompareConfigs(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: value };
        if (field === 'pump' && value) {
          fetchCompareStages(value, id);
        }
        if (field === 'stage' && value && c.pump) {
          fetchCompareTestTypes(c.pump, value, id);
        }
        return updated;
      }
      return c;
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              OEM Pump Performance Analyzer
            </h1>
            <p className="text-blue-200">Interactive H-Q Curves with Multi-Pump Comparison</p>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex gap-2 bg-white/10 p-1 rounded-lg">
            <button
              onClick={() => setMode('single')}
              className={`px-6 py-2 rounded-md font-medium transition ${
                mode === 'single'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Single Pump
            </button>
            <button
              onClick={() => setMode('compare')}
              className={`px-6 py-2 rounded-md font-medium transition ${
                mode === 'compare'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Compare Pumps
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {mode === 'single' ? (
          <SinglePumpView
            pumps={pumps}
            stages={stages}
            testTypes={testTypes}
            config={singleConfig}
            setConfig={setSingleConfig}
            curveData={curveData}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
            loading={loading}
          />
        ) : (
          <ComparePumpsView
            pumps={pumps}
            configs={compareConfigs}
            updateConfig={updateCompareConfig}
            addConfig={addCompareConfig}
            removeConfig={removeCompareConfig}
            compareData={compareData}
            compareSpeed={compareSpeed}
            setCompareSpeed={setCompareSpeed}
            fetchCompareCurves={fetchCompareCurves}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

function SinglePumpView({ pumps, stages, testTypes, config, setConfig, curveData, selectedPoint, setSelectedPoint, loading }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <div className="control-panel sticky top-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pump Type</label>
              <select
                value={config.pump}
                onChange={(e) => setConfig({ ...config, pump: e.target.value, stage: '', testType: '' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Pump</option>
                {pumps.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stages</label>
              <select
                value={config.stage}
                onChange={(e) => setConfig({ ...config, stage: e.target.value, testType: '' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Stage</option>
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Test Type</label>
              <select
                value={config.testType}
                onChange={(e) => setConfig({ ...config, testType: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Test Type</option>
                {testTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rated Speed (RPM)</label>
              <input
                type="number"
                value={config.ratedSpeed}
                onChange={(e) => setConfig({ ...config, ratedSpeed: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {[1450, 1470, 2900, 2950, 3000].map(speed => (
                  <button
                    key={speed}
                    onClick={() => setConfig({ ...config, ratedSpeed: speed })}
                    className={`px-3 py-1 rounded text-sm transition ${
                      config.ratedSpeed === speed ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>

            {selectedPoint && (
              <div className="stat-card mt-6">
                <h3 className="font-bold text-gray-900 mb-3">Selected Point</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Flow:</strong> {selectedPoint.flow?.toFixed(2)} L/s</p>
                  <p><strong>Head:</strong> {selectedPoint.head?.toFixed(2)} m</p>
                  <p><strong>Efficiency:</strong> {selectedPoint.efficiency?.toFixed(2)}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-3">
        {loading ? (
          <div className="chart-container flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        ) : curveData ? (
          <div className="chart-container">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">H-Q Performance Curve</h2>
            <SingleCurveChart
              dataPoints={curveData.data_points}
              selectedPoint={selectedPoint}
              setSelectedPoint={setSelectedPoint}
            />
          </div>
        ) : (
          <div className="chart-container flex items-center justify-center h-96">
            <p className="text-gray-500">Select pump parameters to display curve</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ComparePumpsView({ pumps, configs, updateConfig, addConfig, removeConfig, compareData, compareSpeed, setCompareSpeed, fetchCompareCurves, loading }) {
  return (
    <div className="space-y-6">
      {/* Comparison Controls */}
      <div className="control-panel">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Pump Configurations</h2>
          <button
            onClick={addConfig}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
          >
            + Add Pump
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {configs.map((config, idx) => (
            <div key={config.id} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border-l-4" style={{ borderColor: COLORS[idx % COLORS.length] }}>
              <div className="flex-1 grid grid-cols-3 gap-3">
                <select
                  value={config.pump}
                  onChange={(e) => updateConfig(config.id, 'pump', e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="">Select Pump</option>
                  {pumps.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <select
                  value={config.stage}
                  onChange={(e) => updateConfig(config.id, 'stage', e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  disabled={!config.pump}
                >
                  <option value="">Select Stage</option>
                  {config.stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                  value={config.testType}
                  onChange={(e) => updateConfig(config.id, 'testType', e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  disabled={!config.stage}
                >
                  <option value="">Select Test Type</option>
                  {config.testTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {configs.length > 1 && (
                <button
                  onClick={() => removeConfig(config.id)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rated Speed (RPM)</label>
            <input
              type="number"
              value={compareSpeed}
              onChange={(e) => setCompareSpeed(parseInt(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            onClick={fetchCompareCurves}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Compare'}
          </button>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="chart-container">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading comparison...</p>
            </div>
          </div>
        ) : compareData ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pump Comparison</h2>
            <ComparisonChart curves={compareData.curves} />
          </>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">Configure pumps and click Compare</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SingleCurveChart({ dataPoints, selectedPoint, setSelectedPoint }) {
  const trace = {
    x: dataPoints.map(p => p.flow),
    y: dataPoints.map(p => p.head),
    mode: 'lines+markers',
    type: 'scatter',
    name: 'H-Q Curve',
    line: { color: '#3b82f6', width: 3, shape: 'spline' },
    marker: {
      size: 8,
      color: dataPoints.map(p => p.efficiency),
      colorscale: 'Viridis',
      showscale: true,
      colorbar: { title: 'Efficiency %', thickness: 20, len: 0.7 }
    }
  };

  const traces = [trace];
  if (selectedPoint) {
    traces.push({
      x: [selectedPoint.flow],
      y: [selectedPoint.head],
      mode: 'markers',
      name: 'Selected',
      marker: { size: 15, color: '#ef4444', symbol: 'star', line: { color: '#fff', width: 2 } }
    });
  }

  return (
    <Plot
      data={traces}
      layout={{
        xaxis: { title: 'Flow Rate (L/s)', gridcolor: '#e5e7eb' },
        yaxis: { title: 'Total Head (m)', gridcolor: '#e5e7eb' },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff',
        margin: { l: 80, r: 80, t: 40, b: 80 },
        hovermode: 'closest'
      }}
      config={{ responsive: true, displaylogo: false }}
      onClick={(data) => {
        if (data.points?.[0]) {
          const pt = dataPoints[data.points[0].pointNumber];
          setSelectedPoint(pt);
        }
      }}
      style={{ width: '100%', height: '500px' }}
    />
  );
}

function ComparisonChart({ curves }) {
  const traces = curves.map((curve, idx) => ({
    x: curve.data_points.map(p => p.flow),
    y: curve.data_points.map(p => p.head),
    mode: 'lines+markers',
    type: 'scatter',
    name: curve.label,
    line: { color: COLORS[idx % COLORS.length], width: 3, shape: 'spline' },
    marker: { size: 6, color: COLORS[idx % COLORS.length] }
  }));

  return (
    <Plot
      data={traces}
      layout={{
        xaxis: { title: 'Flow Rate (L/s)', gridcolor: '#e5e7eb' },
        yaxis: { title: 'Total Head (m)', gridcolor: '#e5e7eb' },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff',
        margin: { l: 80, r: 80, t: 40, b: 80 },
        hovermode: 'closest',
        showlegend: true,
        legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.9)', bordercolor: '#d1d5db', borderwidth: 1 }
      }}
      config={{ responsive: true, displaylogo: false }}
      style={{ width: '100%', height: '600px' }}
    />
  );
}

export default App;
