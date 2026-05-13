# 📊 Dataset Setup Instructions

## ⚠️ Important Notice

This repository does **NOT** include the training datasets due to GitHub's size limitations.

**Total dataset size:** ~8.6 GB
- `dataset_speech/` → 7.97 GB
- `archive/` → 0.67 GB

---

## 📥 How to Set Up Datasets

### Option 1: Download from Original Sources

If you're using public datasets like:
- **SpeechOcean762** - [Download Link](https://www.openslr.org/101/)
- **L2-ARCTIC** - [Download Link](https://psi.engr.tamu.edu/l2-arctic-corpus/)
- Other speech datasets

### Option 2: Request from Project Author

Contact the project author to get:
- Pre-processed datasets
- Trained models
- Complete archive folder

### Option 3: Use Your Own Data

Follow the data structure in the project:

```
dataset_speech/
├── train/
│   ├── audio/
│   ├── text
│   └── scores.json
└── test/
    ├── audio/
    ├── text
    └── scores.json

archive/
├── WAVE/
│   ├── SPEAKER0001/
│   ├── SPEAKER0003/
│   └── ...
├── train/
└── test/
```

---

## 🛠️ Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Create Dataset Folders

```bash
mkdir dataset_speech
mkdir archive
```

### 3. Download and Extract Datasets

Place your datasets in the appropriate folders:
- Audio files → `dataset_speech/` or `archive/WAVE/`
- Metadata → `archive/train/` and `archive/test/`

### 4. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 5. Verify Setup

Check that these folders exist and contain data:
- `dataset_speech/train/`
- `dataset_speech/test/`
- `archive/WAVE/`

---

## 📁 Expected Folder Structure After Setup

```
your-project/
├── dataset_speech/          # ← You need to add this
│   ├── train/
│   └── test/
├── archive/                 # ← You need to add this
│   ├── WAVE/
│   ├── train/
│   └── test/
├── backend/                 # ✅ Already in repo
├── src/                     # ✅ Already in repo
├── public/                  # ✅ Already in repo
└── ...
```

---

## 🎯 Quick Start After Dataset Setup

```bash
# Start backend
cd backend
.venv\Scripts\activate
python app.py

# Start frontend (in new terminal)
npm run dev
```

---

## ❓ FAQ

**Q: Why aren't datasets included?**
A: GitHub has a 100 MB file size limit and recommends repositories under 5 GB. Audio datasets are typically 5-10 GB.

**Q: Where can I get the exact datasets used?**
A: Contact the project author or check the documentation in `DATASET_TRAINING_GUIDE.md`.

**Q: Can I use different datasets?**
A: Yes, but you may need to adjust the data preprocessing scripts.

**Q: Do I need all datasets to run the project?**
A: For basic functionality, you need at least one dataset. For full training, use all datasets mentioned in the training guides.

---

## 📞 Support

If you need help setting up datasets:
1. Check `DATASET_TRAINING_GUIDE.md`
2. Check `HOW_TO_RUN.md`
3. Contact the project author

---

**Note:** This is standard practice for ML/AI projects. Most research projects host datasets separately due to size constraints.
