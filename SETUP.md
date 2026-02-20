# Installation & Setup Instructions

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.8+
- Node.js 16+ and npm
- Git (optional)

---

## **Backend Setup (Flask)**

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Flask Server

```bash
python app.py
```

The backend will start at: `http://localhost:5000`

You should see:
```
* Running on http://127.0.0.1:5000
```

---

## **Frontend Setup (React)**

### 1. Install Node Dependencies

```bash
cd frontend
npm install
```

### 2. Start React Development Server

```bash
npm start
```

The frontend will automatically open at: `http://localhost:3000`

---

## **Project Structure**

```
Pump/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   └── .env                # (optional) Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── App.css         # App styles
│   │   ├── index.js        # Entry point
│   │   └── index.css       # Global styles
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── package.json        # NPM dependencies
│   ├── tailwind.config.js  # Tailwind CSS config
│   └── postcss.config.js   # PostCSS config
├── test.csv                # Pump test data
├── requirements.txt        # Old streamlit requirements
└── app.py                  # Old Streamlit app (deprecated)
```

---

## **Features**

✅ **Interactive H-Q Curves** - Click on data points to select them  
✅ **Efficiency Color Mapping** - Points colored by efficiency percentage  
✅ **Professional UI** - Dark theme with Tailwind CSS  
✅ **Real-time Filters** - Pump, Stage, Test Type selection  
✅ **Speed Normalization** - Adjust rated speed with presets  
✅ **Data Table** - View all performance data points  
✅ **Responsive Design** - Works on desktop and tablets  

---

## **API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pumps` | GET | Get all pump types |
| `/api/stages/<pump>` | GET | Get stages for pump |
| `/api/test-types/<pump>/<stage>` | GET | Get test types |
| `/api/curve-data` | POST | Get H-Q curve with efficiency |
| `/api/rated-speeds/<pump>/<stage>` | GET | Get speed range |

---

## **Troubleshooting**

### CORS Errors?
Backend already has CORS enabled. Make sure backend runs on port 5000.

### "Cannot GET /"?
You're visiting the backend directly. Go to http://localhost:3000 for the frontend.

### Port Already in Use?
Change port in backend: `app.run(port=5001)`  
Change port in frontend: Set `PORT=3001 npm start`

### Data Not Loading?
1. Check CSV is in the root Pump folder
2. Verify backend is running (`http://localhost:5000/health`)
3. Check browser console for errors (F12)

---

## **Next Steps**

1. Move test.csv into the root Pump directory
2. Start backend first: `python backend/app.py`
3. Start frontend second: `npm start` (in frontend folder)
4. Select pump parameters and explore the curves!

Enjoy! 🎉
