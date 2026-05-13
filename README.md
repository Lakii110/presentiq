# 🎤 PresentIQ - Speech Pronunciation Assessment System

A web-based AI system for evaluating English pronunciation using machine learning and speech processing.

![GitHub repo size](https://img.shields.io/github/repo-size/Lakii110/presentiq)

---

## ⚠️ Important Notice

**This repository contains SOURCE CODE ONLY.**

To run the full application with speech assessment features, you need:
- ✅ Source code (included in this repo)
- ❌ Datasets (~8 GB - **NOT included**, see [Dataset Setup](#dataset-setup))
- ❌ Trained models (need to train after dataset setup)

**What works without datasets:**
- ✅ Frontend UI
- ✅ Backend API server
- ✅ User authentication
- ✅ Basic navigation

**What requires datasets:**
- ❌ Speech pronunciation assessment
- ❌ Model training
- ❌ Audio scoring features

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Dataset Setup](#dataset-setup)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Documentation](#documentation)

---

## ✨ Features

- Real-time pronunciation assessment
- Multiple scoring metrics (accuracy, fluency, completeness, prosody)
- User authentication system
- Progress tracking and history
- Support for multiple speech datasets
- ML-based scoring models

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14
- React
- TypeScript
- Tailwind CSS

**Backend:**
- Python (Flask/FastAPI)
- Machine Learning (scikit-learn, TensorFlow/PyTorch)
- Speech Processing (librosa, pydub)

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **Git**
- **FFmpeg** (for audio processing)

---

## 🚀 Quick Start (Without Datasets)

Want to see the UI and test the basic setup? Follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/Lakii110/presentiq.git
cd presentiq
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
cd ..
```

### 4. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your configuration
```

### 5. Run the Application

**Windows:**
```bash
start-both.bat
```

**Mac/Linux:**
```bash
./start-both.sh
```

**Or run separately:**
```bash
# Terminal 1 - Backend
cd backend
.venv\Scripts\activate
python run.py

# Terminal 2 - Frontend
npm run dev
```

### 6. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000

⚠️ **Note:** Speech assessment features won't work without datasets. See [Dataset Setup](#dataset-setup) below.

---

## 📊 Dataset Setup (Required for Full Functionality)

⚠️ **This repository does NOT include the training datasets (7.97 GB) due to GitHub size limitations.**

## 📊 Dataset Setup (Required for Full Functionality)

⚠️ **This repository does NOT include the training datasets (7.97 GB) due to GitHub size limitations.**

### Why Datasets Are Needed

Without datasets, you can:
- ✅ Run the application
- ✅ See the UI
- ✅ Test authentication

With datasets, you can:
- ✅ Train ML models
- ✅ Perform speech assessment
- ✅ Use all features

### How to Get Datasets

**Option 1: Download Public Datasets**

- **SpeechOcean762**: [Download here](https://www.openslr.org/101/)
- **L2-ARCTIC**: [Download here](https://psi.engr.tamu.edu/l2-arctic-corpus/)

**Option 2: Contact Project Author**

Request the pre-processed datasets and trained models.

**Option 3: Use Your Own Data**

Create the following folder structure:

```
dataset_speech/
├── train/
│   ├── audio/
│   └── scores.json
└── test/
    ├── audio/
    └── scores.json
```

📖 **Detailed instructions:** See [HOW_TO_RUN.md](./HOW_TO_RUN.md)

---

## ▶️ Running the Project

### Quick Run (Both Servers)

**Windows:**
```bash
start-both.bat
```

**PowerShell:**
```bash
.\start-both.ps1
```

This opens two terminals:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

### Run Separately

**Backend:**
```bash
cd backend
.venv\Scripts\activate
python run.py
```

**Frontend (in new terminal):**
```bash
npm run dev
```

---

## 📁 Project Structure

```
presentiq/
├── src/                    # Frontend source code
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   └── lib/              # Utilities
├── backend/               # Python backend
│   ├── app.py            # Main API server
│   ├── ml_models/        # ML models
│   └── utils/            # Helper functions
├── public/               # Static assets
├── archive/              # Dataset metadata
│   ├── train/           # Training metadata
│   └── test/            # Testing metadata
├── dataset_speech/       # Audio datasets (not in repo)
└── docs/                # Documentation
```

---

## 📚 Documentation

- **[HOW_TO_RUN.md](./HOW_TO_RUN.md)** - Complete setup and running instructions
- **[README.md](./README.md)** - Project overview (this file)

---

## 🎓 Academic Project

This is a final year project for [Your University Name]. 

**Note:** The full project with datasets is approximately 15.6 GB. Following industry best practices for ML projects, only the source code (~3.6 MB) is hosted on GitHub. Datasets must be downloaded separately.

---

## 🔧 Troubleshooting

### Common Issues

**1. Backend won't start:**
- Ensure Python virtual environment is activated
- Check all dependencies are installed: `pip install -r requirements.txt`

**2. Frontend errors:**
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Run `npm run dev`

**3. Dataset errors:**
- Ensure `dataset_speech/` folder exists
- Check dataset structure matches expected format
- See [DATASET_SETUP.md](./DATASET_SETUP.md)

---

## 📄 License

This project is for academic purposes.

---

## 👤 Author

**Lakii110**
- GitHub: [@Lakii110](https://github.com/Lakii110)

---

## 🙏 Acknowledgments

- SpeechOcean762 dataset
- L2-ARCTIC corpus
- [Add your university/supervisor]

---

**⭐ If you find this project useful, please give it a star!**
