# New Features Guide

## What's New

### 1. **Multi-Pump Comparison** 🔄
Compare multiple pumps side-by-side on the same graph with color-coded curves.

**How to use:**
- Click "Compare Pumps" button in the header
- Add multiple pump configurations using "+ Add Pump"
- Each pump gets a unique color
- Click "Compare" to see all curves overlaid

### 2. **Higher Head Priority** ⬆️
When multiple head values exist for the same flow rate, the system automatically selects the higher head value.

**Implementation:**
- Data is sorted by flow and head (descending)
- Duplicates are removed, keeping the highest head
- Ensures optimal performance curves

### 3. **Automatic Efficiency Calculation** 🔢
Missing efficiency values are now calculated automatically using hydraulic power formula.

**Formula:**
```
Efficiency (%) = (ρ × g × Q × H) / (P × 1000) × 100

Where:
- ρ = 1000 kg/m³ (water density)
- g = 9.81 m/s² (gravity)
- Q = Flow rate (L/s)
- H = Head (m)
- P = Power input (kW)
```

### 4. **New Dataset Support** 📊
Backend now supports `.xlsb` files (Excel Binary format) with automatic fallback to CSV.

**File priority:**
1. `test2.xlsb` (new dataset)
2. `test.csv` (fallback)

## Setup Instructions

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## New API Endpoints

### POST /api/compare-curves
Compare multiple pump curves at once.

**Request:**
```json
{
  "pumps": [
    {
      "pump_type": "RN 80",
      "stage": "6 CHRS",
      "test_type": "SP"
    },
    {
      "pump_type": "RN 100",
      "stage": "4 CHRS",
      "test_type": "DP"
    }
  ],
  "rated_speed": 3000
}
```

**Response:**
```json
{
  "curves": [
    {
      "pump_type": "RN 80",
      "stage": "6 CHRS",
      "test_type": "SP",
      "label": "RN 80 - 6 CHRS - SP",
      "data_points": [...]
    }
  ],
  "rated_speed": 3000
}
```

## UI Improvements

### Single Pump Mode
- Clean, focused interface
- Point selection with detailed view
- Efficiency color mapping

### Compare Mode
- Add/remove pumps dynamically
- Color-coded configurations
- Unified speed control
- Side-by-side curve visualization

## Next Steps

1. **Add your new dataset**: Place `test2.xlsb` in the root folder
2. **Test the backend**: Run `python backend/app.py`
3. **Test the frontend**: Run `npm start` in frontend folder
4. **Try comparison**: Switch to "Compare Pumps" mode and add multiple pumps

## Technical Notes

- **Higher head logic**: Applied in both single and compare modes
- **Efficiency calculation**: Only runs when efficiency is missing or ≤ 0
- **Data validation**: Invalid values (negative flow/head) are filtered out
- **Performance**: Optimized for large datasets with efficient sorting

## Troubleshooting

**"Failed to load data"**
- Ensure `test2.xlsb` or `test.csv` exists in root folder
- Check file permissions

**"Efficiency values seem wrong"**
- Verify power input data exists
- Check that flow and head values are valid

**"Comparison not showing"**
- Ensure all pump configs are complete
- Click "Compare" button after configuration

---

**Ready to test!** 🚀
