# OEM Pump Performance Analyzer - Backend Deployment Guide

## Current Issue

The GitHub Pages frontend is trying to connect to `http://localhost:5000`, which doesn't exist when running on GitHub Pages. You have two solutions:

## Solution 1: Local Development (Quick & Easy)

This is perfect for testing everything locally:

### Terminal 1 - Start Backend:
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Backend runs on `http://localhost:5000`

### Terminal 2 - Start Frontend:
```bash
cd frontend
npm start
```
Frontend runs on `http://localhost:3000`

✅ **Everything works perfectly locally!**

---

## Solution 2: Deploy Backend to Cloud (Production)

To make GitHub Pages work, deploy your Flask backend to a cloud service:

### Option A: Heroku (Easiest)

1. **Create Heroku Account**: https://www.heroku.com/

2. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   heroku login
   ```

3. **Create Heroku App**:
   ```bash
   cd backend
   heroku create pump-analyzer-api
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

5. **Get Your URL**:
   ```bash
   heroku info pump-analyzer-api
   ```
   Your backend URL will be: `https://pump-analyzer-api.herokuapp.com`

6. **Update Frontend** - Edit `frontend/.env.production`:
   ```
   REACT_APP_API_URL=https://pump-analyzer-api.herokuapp.com/api
   ```

7. **Redeploy Frontend**:
   ```bash
   cd frontend
   npm run deploy
   ```

### Option B: Railway (Modern Alternative)

1. **Create Railway Account**: https://railway.app/

2. **Connect your GitHub repo**: 
   - Login with GitHub
   - Select your repository
   - Railway auto-deploys on push

3. **Set Environment**:
   - Set `FLASK_ENV=production`
   - Railway gives you a URL: `https://your-app.railway.app`

4. **Update Frontend**:
   ```bash
   REACT_APP_API_URL=https://your-app.railway.app/api
   ```

5. **Redeploy**:
   ```bash
   npm run deploy
   ```

### Option C: Render (Free Tier Available)

1. **Create Render Account**: https://render.com/

2. **Create Web Service**:
   - Connect GitHub
   - Select backend folder
   - Runtime: Python 3.10

3. **Get your URL**: `https://your-service.onrender.com`

4. **Update Frontend** - `.env.production`:
   ```
   REACT_APP_API_URL=https://your-service.onrender.com/api
   ```

5. **Redeploy**:
   ```bash
   npm run deploy
   ```

---

## Testing Your Setup

### Local Test:
```bash
# Terminal 1
cd backend && python app.py

# Terminal 2
cd frontend && npm start

# Visit: http://localhost:3000
```

### GitHub Pages Test (with deployed backend):
1. Update `.env.production` with backend URL
2. Run `cd frontend && npm run deploy`
3. Visit: https://witchertech.github.io/pump-performance/
4. Should load app and fetch pump data

---

## Recommended Approach

**For Development**: Use Solution 1 (local)
- Fastest iteration
- No deployment needed
- Perfect for testing

**For Production**: Use Solution 2 (deployed)
- Public GitHub Pages works
- Backend accessible from anywhere
- Others can use your live app

---

## Environment Variables

The React app now supports `REACT_APP_API_URL`:

```javascript
// App.js - automatically detects environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

- **Local Dev**: Uses `http://localhost:5000/api`
- **Production**: Uses `REACT_APP_API_URL` from `.env.production`

---

## Quick Checklist

- [ ] Test locally with both backend and frontend running
- [ ] Choose deployment option (Heroku/Railway/Render)
- [ ] Deploy backend to cloud service
- [ ] Get backend URL
- [ ] Update `frontend/.env.production` with backend URL
- [ ] Run `npm run deploy` in frontend folder
- [ ] Test GitHub Pages with deployed backend

---

## Troubleshooting

**"Failed to load pumps"**
- Backend not running
- Check backend URL in `.env.production`
- Ensure CORS is enabled in Flask

**"Network Error"**
- Backend URL is wrong
- Backend service is down
- CORS not properly configured

**Check Backend Health**:
```bash
curl https://your-backend-url/health
# Should return: {"status":"ok"}
```

---

Need help with any of these steps? Let me know!
