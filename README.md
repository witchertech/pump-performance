# OEM Pump Performance Analyzer

A professional, production-grade application for analyzing and visualizing OEM pump performance curves with interactive H-Q diagrams.

## Features

🎯 **Interactive Charts**
- Click on data points to select and highlight them
- Hover tooltips showing exact values
- Smooth spline curves for professional appearance
- Color-coded by efficiency percentage

📊 **Data Analysis**
- Real-time H-Q curve generation
- Efficiency iso-lines visualization
- Speed normalization with custom rated speeds
- Performance data tables

🎨 **Professional UI**
- Modern dark theme with gradient background
- Responsive design (desktop, tablet)
- Tailwind CSS styling
- Smooth animations and transitions

🔧 **Technical Stack**
- **Backend**: Flask + Python (pandas, scipy, numpy)
- **Frontend**: React 18 + Plotly.js
- **Styling**: Tailwind CSS
- **API**: RESTful with CORS

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Backend runs at `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs at `http://localhost:3000`

## Project Structure

```
├── backend/                 # Flask API server
│   ├── app.py             # Main application
│   └── requirements.txt    # Dependencies
├── frontend/              # React application
│   ├── src/
│   │   ├── App.js        # Main component
│   │   ├── index.js      # Entry point
│   │   └── index.css     # Styles
│   ├── public/
│   │   └── index.html
│   └── package.json
├── test.csv              # Pump performance data
└── SETUP.md             # Detailed setup guide
```

## API Reference

### GET /api/pumps
Get all available pump types

### GET /api/stages/{pump_type}
Get available stages for a pump

### GET /api/test-types/{pump_type}/{stage}
Get available test types

### POST /api/curve-data
Get H-Q curve data with efficiency information

**Body:**
```json
{
  "pump_type": "RN 80",
  "stage": "6 CHRS",
  "test_type": "SP",
  "rated_speed": 3000
}
```

### GET /api/rated-speeds/{pump_type}/{stage}
Get speed range and common speed presets

## Usage

1. **Select Pump**: Choose pump type from dropdown
2. **Select Stage**: Choose number of stages
3. **Select Test Type**: Choose SP or DP
4. **Adjust Speed**: Set rated speed (use presets or manual)
5. **Analyze**: Click data points to select and view details
6. **Export**: Performance table available for reference

## Key Features Explained

### Interactive Point Selection
- Click on any point in the curve to select it
- Selected point highlighted with red star
- Point details shown in control panel

### Efficiency Color Mapping
- Data points colored from blue (low efficiency) to yellow (high efficiency)
- Color scale shown on right side of chart
- Matches professional pump curve standards

### Speed Normalization
- Data normalized to rated speed using affinity laws
- Flow: Q_norm = Q × (N_rated / N_actual)
- Head: H_norm = H × (N_rated / N_actual)²

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment

### GitHub
Want to share your project? See [GITHUB_DEPLOYMENT.md](GITHUB_DEPLOYMENT.md) for:
- How to push to GitHub
- How to share read-only access
- How to host on GitHub Pages

### Docker (Coming Soon)
Will add Docker support for easy deployment.

## Performance

- Handles large datasets (13,000+ rows)
- Smooth interactions with 1000+ data points
- Real-time filtering and calculations

## Future Enhancements

- [ ] Export curves as PDF/PNG
- [ ] Efficiency iso-line overlays
- [ ] Multiple pump comparison
- [ ] Power/NPSH curves
- [ ] Data import from multiple sources
- [ ] Custom theming

## Troubleshooting

**CORS errors?** - Backend has CORS enabled. Ensure it runs on port 5000.

**Port conflicts?** - Change ports in app.py or set PORT env variable

**Data not loading?** - Check CSV is in root folder and backend is running

**Slow performance?** - Frontend caches data. Check network tab for API calls.

## License

This project is for educational and commercial use.

---

Built with ❤️ for pump performance analysis
