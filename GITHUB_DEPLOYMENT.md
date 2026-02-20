# 🚀 GitHub Deployment & Sharing Guide

## Step 1: Initialize Git Repository

```bash
cd d:\TY25-26\SEM 6\Wilo\Pump
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 2: Add Files to Git

```bash
git add .
git commit -m "Initial commit: Pump Performance Analyzer"
```

## Step 3: Create Repository on GitHub

1. Go to https://github.com/new
2. **Repository name:** `pump-performance-analyzer`
3. **Description:** "Interactive H-Q curves with efficiency analysis"
4. **Visibility:** Choose `Public` (if you want it visible) or `Private` (if you want restricted access)
5. **Don't initialize** with README (we have one)
6. Click **Create repository**

## Step 4: Connect Local Repo to GitHub

Copy the commands from GitHub and run:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pump-performance-analyzer.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 5: Share Read-Only Access

### Option A: Public Repository (Anyone can view)
- Repository is already public
- Anyone with the link can view: `https://github.com/YOUR_USERNAME/pump-performance-analyzer`
- They can't modify unless they fork

### Option B: Private Repository (Only invited collaborators)
1. Go to repository settings
2. Click **Collaborators** (left sidebar)
3. Click **Add people**
4. Enter GitHub username of person to invite
5. Select permission level: **Read** (view only)

### Option C: Share as Read-Only Link
Share this format: `https://github.com/YOUR_USERNAME/pump-performance-analyzer`

People can:
- ✅ View all code
- ✅ Download (clone/fork)
- ✅ Browse files
- ❌ Can't push changes (unless they're collaborators)

## Step 6: File Structure for GitHub

Your repository will look like:
```
pump-performance-analyzer/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── .env (if needed)
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── node_modules/ (ignored)
├── test.csv
├── README.md
├── SETUP.md
├── .gitignore
└── .github/
    └── workflows/ (optional: CI/CD)
```

## Step 7: Update .gitignore (Already Done!)

Your `.gitignore` already excludes:
- `node_modules/` - NPM dependencies
- `__pycache__/` - Python cache
- `.env` - Environment variables
- `build/` & `dist/` - Build outputs

## Sharing Instructions

**To share with someone:**

1. **If Public:** Send them the link
   ```
   https://github.com/YOUR_USERNAME/pump-performance-analyzer
   ```

2. **If Private:** 
   - Go to Settings → Collaborators
   - Add their GitHub username
   - Grant "Read" permission only

3. **They can view code by:**
   - Visiting the GitHub page (web)
   - Cloning: `git clone <repo-url>`
   - Downloading as ZIP: Click **Code** → **Download ZIP**

## Important Files for GitHub

Make sure these are in root:
- ✅ `README.md` - Project overview
- ✅ `SETUP.md` - Installation guide
- ✅ `test.csv` - Sample data
- ✅ `.gitignore` - Exclude unnecessary files

## Collaborator Permissions Levels

| Permission | View Code | Download | Pull Request | Push | Settings |
|------------|-----------|----------|-------------|------|----------|
| **Read** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Triage** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Write** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Maintain** | ✅ | ✅ | ✅ | ✅ | ✅ |

## Protecting Main Branch (Optional)

1. Go to **Settings** → **Branches**
2. Add protection rule for `main`
3. Require pull request reviews
4. Prevent direct pushes

## Useful GitHub Commands

```bash
# Check remote
git remote -v

# Push changes
git add .
git commit -m "Description"
git push origin main

# Pull latest
git pull origin main

# View branches
git branch -a
```

## Security Notes

⚠️ **Never commit:**
- `.env` files with secrets
- API keys or passwords
- Private database credentials
- Sensitive configuration

Use environment variables instead!

## GitHub Pages (Optional: Host Frontend)

If you want to host the React app on GitHub Pages:

1. In `frontend/package.json`, add:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/pump-performance-analyzer"
   ```

2. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Add scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

Your frontend will be live at: `https://YOUR_USERNAME.github.io/pump-performance-analyzer`

---

**Need help?** Check GitHub's official docs: https://docs.github.com
