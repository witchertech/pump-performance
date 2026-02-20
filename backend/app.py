from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from scipy.interpolate import griddata, make_interp_spline
import os
import json

app = Flask(__name__)
CORS(app)

DATA_FILE = "../test.csv"

# ===============================
# LOAD DATA WITH SMART ENCODING
# ===============================

def load_data():
    encodings_to_try = ["utf-8", "latin1", "ISO-8859-1", "cp1252"]
    df = None
    for enc in encodings_to_try:
        try:
            df = pd.read_csv(DATA_FILE, encoding=enc)
            break
        except:
            continue
    
    if df is None:
        raise Exception("Unable to read test.csv with common encodings")
    
    df.columns = df.columns.str.strip()
    return df

df = load_data()

# ===============================
# API ENDPOINTS
# ===============================

def parse_impeller_dia(value):
    """Parse impeller diameter, handling formats like '250/250' or '250'"""
    if pd.isna(value):
        return None
    try:
        value_str = str(value).strip()
        # If it contains '/', take the first value
        if '/' in value_str:
            value_str = value_str.split('/')[0]
        return float(value_str)
    except (ValueError, AttributeError):
        return None

@app.route('/api/pumps', methods=['GET'])
def get_pumps():
    """Get available pump types"""
    pump_list = df["PumpType"].dropna().unique().tolist()
    return jsonify({"pumps": sorted(pump_list)})

@app.route('/api/stages/<pump_type>', methods=['GET'])
def get_stages(pump_type):
    """Get available stages for a pump"""
    stages = df[df["PumpType"] == pump_type]["Stages"].dropna().unique().tolist()
    return jsonify({"stages": sorted(stages)})

@app.route('/api/test-types/<pump_type>/<stage>', methods=['GET'])
def get_test_types(pump_type, stage):
    """Get available test types"""
    test_types = df[
        (df["PumpType"] == pump_type) & 
        (df["Stages"] == stage)
    ]["Test_Type_ID"].dropna().unique().tolist()
    return jsonify({"test_types": sorted(test_types)})

@app.route('/api/curve-data', methods=['POST'])
def get_curve_data():
    """Get H-Q curve data with efficiency contours"""
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    pump_type = data.get("pump_type")
    stage = data.get("stage")
    test_type = data.get("test_type")
    rated_speed = data.get("rated_speed", 3000)
    
    # Filter data
    filtered = df[
        (df["PumpType"] == pump_type) &
        (df["Stages"] == stage) &
        (df["Test_Type_ID"] == test_type)
    ].copy()
    
    if filtered.empty:
        return jsonify({"error": "No data found"}), 400
    
    # Normalize based on rated speed
    filtered["Norm_Flow"] = filtered["Flow"] * (rated_speed / filtered["Speed"])
    filtered["Norm_Head"] = filtered["Total_Head"] * (rated_speed / filtered["Speed"])**2
    
    # Remove invalid values
    filtered = filtered.dropna(subset=["Norm_Flow", "Norm_Head", "Pump_Efficiency"])
    filtered = filtered[filtered["Norm_Flow"] >= 0]
    filtered = filtered[filtered["Norm_Head"] >= 0]
    filtered = filtered[filtered["Pump_Efficiency"] >= 0]
    
    # Prepare response data
    data_points = []
    for idx, (_, row) in enumerate(filtered.iterrows()):
        # Include all row data for detailed view
        all_data = {}
        for col in filtered.columns:
            val = row[col]
            if pd.isna(val):
                all_data[col] = None
            elif isinstance(val, (np.integer, np.floating)):
                all_data[col] = float(val)
            else:
                all_data[col] = str(val)
        
        data_points.append({
            "flow": float(row["Norm_Flow"]),
            "head": float(row["Norm_Head"]),
            "efficiency": float(row["Pump_Efficiency"]),
            "speed": float(row["Speed"]),
            "power": float(row["Pump_Input"]) if pd.notna(row["Pump_Input"]) else 0,
            "pump_type": row["PumpType"],
            "testpoint": int(row["Testpoint"]) if pd.notna(row["Testpoint"]) else 0,
            "impeller_dia": parse_impeller_dia(row["Pump_Detail_Impeller_Dia_1st_Stage"]),
            "all_data": all_data,
            "row_index": idx
        })
    
    # Sort by flow for line plotting
    data_points.sort(key=lambda x: x["flow"])
    
    # Calculate efficiency contour lines
    contours = calculate_efficiency_contours(filtered)
    
    return jsonify({
        "data_points": data_points,
        "contours": contours,
        "pump_type": pump_type,
        "stage": stage,
        "test_type": test_type,
        "rated_speed": rated_speed
    })

def calculate_efficiency_contours(filtered):
    """Calculate efficiency iso-lines"""
    if filtered.empty or len(filtered) < 3:
        return []
    
    x = filtered["Norm_Flow"].values
    y = filtered["Norm_Head"].values
    z = filtered["Pump_Efficiency"].values
    
    # Create grid
    xi = np.linspace(x.min(), x.max(), 100)
    yi = np.linspace(y.min(), y.max(), 100)
    xi, yi = np.meshgrid(xi, yi)
    
    try:
        # Interpolate
        zi = griddata((x, y), z, (xi, yi), method='cubic')
        
        # Get contour levels
        levels = np.linspace(z.min(), z.max(), 8)
        
        contours = []
        for level in levels:
            # Create contour data
            contours.append({
                "level": float(level),
                "label": f"{level:.1f}%"
            })
        
        return contours
    except:
        return []

@app.route('/api/rated-speeds/<pump_type>/<stage>', methods=['GET'])
def get_rated_speeds(pump_type, stage):
    """Get speed range for normalization"""
    filtered = df[(df["PumpType"] == pump_type) & (df["Stages"] == stage)]
    speeds = filtered["Speed"].dropna().values
    
    if len(speeds) == 0:
        return jsonify({"error": "No speed data"}), 400
    
    return jsonify({
        "min_speed": float(speeds.min()),
        "max_speed": float(speeds.max()),
        "avg_speed": float(speeds.mean()),
        "common_speeds": [1450, 1470, 2900, 2950, 3000, 3600]
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
