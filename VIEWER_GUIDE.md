# 🎯 Quick Viewer's Guide

**Welcome!** You're viewing the OEM Pump Performance Analyzer project.

## 📂 Project Structure

```
├── backend/           ← Flask API (Python)
├── frontend/          ← React UI (JavaScript)
├── test.csv           ← Sample pump data
├── README.md          ← Project overview
├── SETUP.md           ← Installation guide
└── GITHUB_DEPLOYMENT.md ← How to deploy
```

## 🚀 Want to Run This Locally?

See [SETUP.md](SETUP.md) for complete installation steps.

**Quick version:**

```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
python app.py

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

Open http://localhost:3000

## ✨ Features

- **Interactive H-Q Curves** - Click points to explore
- **Color-Coded Efficiency** - Points colored by performance
- **Full Data Inspection** - Click to see all 35+ parameters
- **Professional UI** - Modern dark theme
- **Responsive Design** - Works on desktop & tablet

## 📊 The Data

`test.csv` contains pump test data with:
- Flow rates and head values
- Efficiency measurements
- Speed and power data
- Impeller diameters
- Pressure measurements
- Test metadata

## 🔧 Tech Stack

**Backend:**
- Flask (Python web framework)
- Pandas (Data processing)
- NumPy/SciPy (Calculations)

**Frontend:**
- React 18
- Plotly.js (Interactive charts)
- Tailwind CSS (Styling)
- Axios (HTTP requests)

## 📝 API Endpoints

Backend runs on `http://localhost:5000`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pumps` | GET | List pump types |
| `/api/stages/{pump}` | GET | Get stages for pump |
| `/api/test-types/{pump}/{stage}` | GET | Get test types |
| `/api/curve-data` | POST | Get H-Q curve data |
| `/api/rated-speeds/{pump}/{stage}` | GET | Get speed range |

## 🎨 UI Components

- **Left Panel** - Configuration and data inspection
- **Chart Area** - Interactive H-Q curve visualization
- **Data Table** - All performance points in table format
- **Full Dataset View** - Organized by category when point selected

## 🔍 How to Use

1. **Select Pump Type** - Choose from dropdown
2. **Select Stages** - Pick number of stages
3. **Select Test Type** - SP or DP
4. **Adjust Speed** - Use presets or manual input
5. **Click Points** - See all data for that test point
6. **Scroll Data** - View organized parameters

## 📦 Customization

To modify:
- **UI Colors**: Edit `frontend/src/index.css` or Tailwind config
- **Data Processing**: Modify `backend/app.py` endpoints
- **Chart Style**: Update `PumpCurveChart()` function in `frontend/src/App.js`

## 🐛 Common Issues

**"Cannot connect to backend"**
- Make sure Flask is running on port 5000
- Check no other app is using that port

**"Data not loading"**
- Verify `test.csv` is in root folder
- Check CSV encoding (UTF-8)
- Look at browser console (F12) for errors

**"Slow performance"**
- Large datasets (13K+ rows) may take time to load
- Try filtering to specific pump type first

## 📚 Learn More

- [Setup Guide](SETUP.md) - Installation & configuration
- [GitHub Deployment](GITHUB_DEPLOYMENT.md) - How to deploy
- [Flask Docs](https://flask.palletsprojects.com/)
- [React Docs](https://react.dev/)
- [Plotly.js](https://plotly.com/javascript/)

## 👥 Contributing

This is a **read-only** repo for viewing. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Owner will review and merge if approved.

## 📧 Questions?

Contact the repo owner for questions about:
- Data source and accuracy
- Feature requests
- Bug reports
- Usage guidance

---

**Happy analyzing!** 🎉
