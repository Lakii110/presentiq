# Academic Guide: Training a Speech Assessment Dataset (A to Z)

## Overview
This guide provides the complete academic methodology for manually creating, annotating, and training a speech assessment dataset for pronunciation and fluency evaluation.

---

## Phase 1: Research & Planning (Weeks 1-2)

### Step 1.1: Literature Review
**Objective:** Understand existing research and methodologies

**Actions:**
1. **Review Academic Papers:**
   - Search Google Scholar, IEEE Xplore, ACL Anthology
   - Keywords: "speech assessment", "pronunciation evaluation", "L2 speech", "CEFR scoring"
   - Focus on: TOEFL, IELTS, Duolingo speech scoring systems
   
2. **Study Existing Datasets:**
   - **LibriSpeech**: Native English speech corpus
   - **TIMIT**: Phonetic speech corpus
   - **L2-ARCTIC**: Non-native English speech
   - **EF-Cambridge Open Language Database**: Proficiency-labeled speech
   
3. **Identify Assessment Criteria:**
   - Fluency (speech rate, pauses, hesitations)
   - Pronunciation (phoneme accuracy, stress, intonation)
   - Grammar (sentence structure, complexity)
   - Vocabulary (lexical diversity, appropriateness)
   - Coherence (logical flow, topic relevance)

**Deliverable:** Literature review document (10-15 pages) with references

### Step 1.2: Define Research Questions
**Examples:**
- RQ1: What acoustic features best predict speech fluency scores?
- RQ2: How do filler words correlate with proficiency levels?
- RQ3: Can ML models accurately predict CEFR levels from speech?

### Step 1.3: Design Annotation Schema
**Create scoring rubric based on:**
- **CEFR Framework** (A1, A2, B1, B2, C1, C2)
- **IELTS Speaking Band** (1-9 scale)
- **Custom Metrics:**
  - Fluency: 0-100
  - Pronunciation: 0-100
  - Grammar: 0-100
  - Vocabulary: 0-100
  - Coherence: 0-100

**Deliverable:** Annotation guidelines document (20-30 pages)

---

## Phase 2: Data Collection (Weeks 3-8)

### Step 2.1: Participant Recruitment
**Sample Size:** Minimum 100-500 speakers for academic validity

**Recruitment Strategy:**
1. **Demographics to collect:**
   - Age, gender, native language
   - English proficiency level (self-reported + tested)
   - Education level
   - Years of English study
   
2. **Recruitment channels:**
   - University language centers
   - Online language learning platforms
   - Social media (language learning groups)
   - Paid participant platforms (Prolific, MTurk)

3. **Ethical Considerations:**
   - IRB approval (Institutional Review Board)
   - Informed consent forms
   - Data privacy compliance (GDPR, COPPA)
   - Compensation ($10-20 per 30-minute session)

**Deliverable:** IRB approval, consent forms, participant database

### Step 2.2: Recording Setup
**Equipment Requirements:**
- **Microphone:** USB condenser mic (Blue Yeti, Audio-Technica AT2020)
- **Recording software:** Audacity, Adobe Audition, Praat
- **Format:** WAV, 16kHz or 44.1kHz, 16-bit, mono
- **Environment:** Quiet room, minimal background noise (<40dB)

**Recording Protocol:**
1. **Warm-up** (5 minutes): Casual conversation
2. **Structured tasks** (20 minutes):
   - Read-aloud passage (2-3 minutes)
   - Picture description (3-5 minutes)
   - Opinion question (5-7 minutes)
   - Role-play scenario (5-7 minutes)
3. **Metadata collection:** Speaker ID, task type, timestamp

**Deliverable:** 100-500 audio files with metadata

### Step 2.3: Data Organization
**Directory Structure:**
```
dataset/
├── audio/
│   ├── speaker_001/
│   │   ├── task1_readaloud.wav
│   │   ├── task2_description.wav
│   │   └── task3_opinion.wav
│   ├── speaker_002/
│   └── ...
├── metadata/
│   ├── speakers.csv
│   └── recordings.csv
└── annotations/
    └── (to be created in Phase 3)
```

**Deliverable:** Organized dataset with metadata files

---

## Phase 3: Annotation & Labeling (Weeks 9-16)

### Step 3.1: Recruit Expert Annotators
**Qualifications:**
- TESOL/TEFL certified teachers
- IELTS/TOEFL examiners
- Linguistics graduate students
- Minimum 3-5 years teaching experience

**Number of annotators:** 3-5 (for inter-rater reliability)

### Step 3.2: Annotator Training
**Training Process (2-3 days):**
1. **Day 1:** Review annotation guidelines
2. **Day 2:** Practice on 20 sample recordings
3. **Day 3:** Calibration session (discuss disagreements)

**Measure inter-rater reliability:**
- **Cohen's Kappa** (κ > 0.60 acceptable, κ > 0.75 excellent)
- **Intraclass Correlation** (ICC > 0.70)
- **Pearson Correlation** (r > 0.80)

### Step 3.3: Annotation Process
**For each audio file, annotators score:**

1. **Holistic Scores:**
   - Overall proficiency: 0-100
   - CEFR level: A1, A2, B1, B2, C1, C2
   - IELTS band: 1.0-9.0

2. **Analytic Scores:**
   - Fluency: 0-100
   - Pronunciation: 0-100
   - Grammar: 0-100
   - Vocabulary: 0-100
   - Coherence: 0-100

3. **Detailed Annotations:**
   - Filler words: count and timestamps
   - Pauses: duration and location
   - Pronunciation errors: phoneme-level
   - Grammar errors: type and severity
   - Hesitations: timestamps

**Annotation Tools:**
- **Praat**: Phonetic analysis
- **ELAN**: Time-aligned annotations
- **Custom web interface**: For scoring forms

**Deliverable:** Annotated dataset with scores and detailed labels

### Step 3.4: Quality Control
**Steps:**
1. **Calculate inter-rater reliability** for each metric
2. **Resolve disagreements:**
   - If scores differ by >15 points, third annotator reviews
   - Consensus meeting for difficult cases
3. **Final scores:** Average of all annotators (or median)

**Deliverable:** Quality control report with reliability statistics

---

## Phase 4: Feature Extraction (Weeks 17-20)

### Step 4.1: Acoustic Feature Extraction
**Use libraries:** Librosa (Python), Praat, OpenSMILE

**Features to extract:**

1. **Prosodic Features:**
   - Fundamental frequency (F0): mean, std, range, contour
   - Intensity/Energy: mean, std, dynamic range
   - Speech rate: syllables per second, words per minute
   - Pause statistics: count, duration, ratio

2. **Spectral Features:**
   - MFCCs (Mel-Frequency Cepstral Coefficients): 13-40 coefficients
   - Spectral centroid, rolloff, flux
   - Zero-crossing rate
   - Chroma features

3. **Voice Quality:**
   - Jitter (pitch perturbation)
   - Shimmer (amplitude perturbation)
   - Harmonics-to-Noise Ratio (HNR)

4. **Temporal Features:**
   - Speaking time vs. total time
   - Articulation rate
   - Phonation time ratio

**Code Example:**
```python
import librosa
import numpy as np

def extract_features(audio_path):
    y, sr = librosa.load(audio_path, sr=16000)
    
    # Prosodic
    f0 = librosa.yin(y, fmin=75, fmax=300)
    energy = librosa.feature.rms(y=y)
    
    # Spectral
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    
    # Aggregate statistics
    features = {
        'f0_mean': np.nanmean(f0),
        'f0_std': np.nanstd(f0),
        'energy_mean': np.mean(energy),
        'mfcc_mean': np.mean(mfccs, axis=1),
        # ... more features
    }
    return features
```

**Deliverable:** Feature matrix (N samples × M features)

### Step 4.2: Linguistic Feature Extraction
**Use ASR + NLP:**

1. **Transcription:**
   - Use Whisper, Google Speech-to-Text, or manual transcription
   - Word Error Rate (WER) < 10% for quality

2. **Linguistic Features:**
   - Word count, unique words, lexical diversity (TTR)
   - Sentence length: mean, std
   - Part-of-speech distribution
   - Syntactic complexity (parse tree depth)
   - Filler word count and rate
   - Grammar error count (using LanguageTool)

**Deliverable:** Combined feature matrix (acoustic + linguistic)

---

## Phase 5: Data Preprocessing (Weeks 21-22)

### Step 5.1: Data Cleaning
**Actions:**
1. **Remove outliers:**
   - Audio files with SNR < 10dB
   - Recordings < 30 seconds or > 10 minutes
   - Annotator disagreement > 25 points

2. **Handle missing data:**
   - Imputation (mean/median) for <5% missing
   - Remove samples with >10% missing features

3. **Normalize features:**
   - Z-score normalization: (x - μ) / σ
   - Min-max scaling: (x - min) / (max - min)

### Step 5.2: Train/Validation/Test Split
**Standard split:**
- **Training set:** 70% (for model learning)
- **Validation set:** 15% (for hyperparameter tuning)
- **Test set:** 15% (for final evaluation)

**Stratification:** Ensure balanced distribution of:
- Proficiency levels (CEFR)
- Native languages
- Gender
- Age groups

**Deliverable:** Split datasets with balanced distributions

---

## Phase 6: Model Development (Weeks 23-30)

### Step 6.1: Baseline Models
**Start with simple models:**

1. **Linear Regression:**
   ```python
   from sklearn.linear_model import LinearRegression
   model = LinearRegression()
   model.fit(X_train, y_train)
   ```

2. **Random Forest:**
   ```python
   from sklearn.ensemble import RandomForestRegressor
   model = RandomForestRegressor(n_estimators=100)
   model.fit(X_train, y_train)
   ```

3. **Support Vector Regression (SVR):**
   ```python
   from sklearn.svm import SVR
   model = SVR(kernel='rbf')
   model.fit(X_train, y_train)
   ```

**Evaluation Metrics:**
- **Regression:** MAE, RMSE, R², Pearson correlation
- **Classification:** Accuracy, F1-score, Cohen's Kappa

### Step 6.2: Advanced Models
**Deep Learning Approaches:**

1. **CNN for Spectrograms:**
   ```python
   import tensorflow as tf
   
   model = tf.keras.Sequential([
       tf.keras.layers.Conv2D(32, (3,3), activation='relu'),
       tf.keras.layers.MaxPooling2D((2,2)),
       tf.keras.layers.Conv2D(64, (3,3), activation='relu'),
       tf.keras.layers.GlobalAveragePooling2D(),
       tf.keras.layers.Dense(128, activation='relu'),
       tf.keras.layers.Dense(1)  # Regression output
   ])
   ```

2. **LSTM for Sequential Features:**
   ```python
   model = tf.keras.Sequential([
       tf.keras.layers.LSTM(128, return_sequences=True),
       tf.keras.layers.LSTM(64),
       tf.keras.layers.Dense(1)
   ])
   ```

3. **Transformer Models:**
   - Fine-tune Wav2Vec2, HuBERT, or Whisper
   - Use pre-trained embeddings + classification head

### Step 6.3: Hyperparameter Tuning
**Methods:**
- **Grid Search:** Exhaustive search over parameter grid
- **Random Search:** Random sampling of parameters
- **Bayesian Optimization:** Efficient search using Gaussian processes

**Example:**
```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [10, 20, 30],
    'min_samples_split': [2, 5, 10]
}

grid_search = GridSearchCV(
    RandomForestRegressor(),
    param_grid,
    cv=5,
    scoring='neg_mean_absolute_error'
)
grid_search.fit(X_train, y_train)
```

**Deliverable:** Trained models with optimized hyperparameters

---

## Phase 7: Evaluation & Validation (Weeks 31-34)

### Step 7.1: Model Evaluation
**Metrics to report:**

1. **Regression Metrics:**
   - Mean Absolute Error (MAE)
   - Root Mean Squared Error (RMSE)
   - R² Score
   - Pearson Correlation (r)
   - Spearman Correlation (ρ)

2. **Classification Metrics (for CEFR):**
   - Accuracy
   - Precision, Recall, F1-score (per class)
   - Confusion Matrix
   - Cohen's Kappa

3. **Agreement with Human Raters:**
   - Pearson r > 0.70 (acceptable)
   - Pearson r > 0.85 (excellent)

### Step 7.2: Error Analysis
**Analyze model failures:**
1. **Identify patterns:**
   - Which proficiency levels have highest error?
   - Which native languages are problematic?
   - Which features are most important?

2. **Feature Importance:**
   ```python
   importances = model.feature_importances_
   indices = np.argsort(importances)[::-1]
   
   for i in range(10):
       print(f"{feature_names[indices[i]]}: {importances[indices[i]]}")
   ```

3. **Qualitative Analysis:**
   - Listen to misclassified samples
   - Identify systematic errors

### Step 7.3: Cross-Validation
**K-Fold Cross-Validation (k=5 or 10):**
```python
from sklearn.model_selection import cross_val_score

scores = cross_val_score(
    model, X, y,
    cv=10,
    scoring='neg_mean_absolute_error'
)
print(f"MAE: {-scores.mean():.2f} (+/- {scores.std():.2f})")
```

**Deliverable:** Evaluation report with metrics and error analysis

---

## Phase 8: Documentation & Publication (Weeks 35-40)

### Step 8.1: Dataset Documentation
**Create README with:**
1. **Dataset Description:**
   - Number of speakers, recordings, total duration
   - Demographics distribution
   - Task types and prompts

2. **Annotation Schema:**
   - Scoring rubrics
   - Inter-rater reliability statistics

3. **File Formats:**
   - Audio format specifications
   - Metadata CSV structure
   - Annotation file formats

4. **Usage Instructions:**
   - How to load data
   - Example code snippets
   - Citation information

### Step 8.2: Code Repository
**GitHub Repository Structure:**
```
speech-assessment-dataset/
├── README.md
├── LICENSE
├── requirements.txt
├── data/
│   ├── audio/ (or download links)
│   ├── metadata/
│   └── annotations/
├── scripts/
│   ├── feature_extraction.py
│   ├── train_model.py
│   └── evaluate.py
├── notebooks/
│   ├── exploratory_analysis.ipynb
│   └── model_comparison.ipynb
└── models/
    └── trained_models/
```

### Step 8.3: Academic Paper
**Paper Structure (IEEE/ACL format):**

1. **Abstract** (150-250 words)
2. **Introduction**
   - Motivation and research gap
   - Research questions
   - Contributions

3. **Related Work**
   - Existing datasets
   - Speech assessment methods
   - ML approaches

4. **Dataset Creation**
   - Data collection methodology
   - Annotation process
   - Quality control

5. **Feature Extraction**
   - Acoustic features
   - Linguistic features

6. **Experiments**
   - Baseline models
   - Advanced models
   - Hyperparameter tuning

7. **Results**
   - Quantitative results (tables)
   - Qualitative analysis
   - Comparison with human raters

8. **Discussion**
   - Findings interpretation
   - Limitations
   - Future work

9. **Conclusion**
10. **References** (30-50 papers)

**Target Venues:**
- **Conferences:** Interspeech, ICASSP, ACL, EMNLP, SLaTE
- **Journals:** Speech Communication, Computer Speech & Language, Language Learning & Technology

### Step 8.4: Dataset Release
**Platforms:**
- **Zenodo:** DOI for dataset citation
- **Hugging Face Datasets:** Easy access for ML community
- **GitHub:** Code and documentation
- **Institutional Repository:** Long-term preservation

**License:**
- **CC BY 4.0:** Attribution required
- **CC BY-NC 4.0:** Non-commercial use only
- **Custom license:** If needed for privacy

**Deliverable:** Published paper + public dataset

---

## Phase 9: Maintenance & Updates (Ongoing)

### Step 9.1: Community Engagement
**Actions:**
1. Respond to GitHub issues
2. Accept pull requests for improvements
3. Maintain documentation
4. Provide support to users

### Step 9.2: Dataset Versioning
**When to release new version:**
- Additional speakers/recordings
- Improved annotations
- Bug fixes in metadata
- New features extracted

**Version naming:** v1.0, v1.1, v2.0 (semantic versioning)

### Step 9.3: Impact Tracking
**Monitor:**
- Citations (Google Scholar)
- Downloads (Zenodo, Hugging Face)
- GitHub stars/forks
- Derived works

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| 1. Research & Planning | 2 weeks | Literature review, annotation schema |
| 2. Data Collection | 6 weeks | Audio recordings, metadata |
| 3. Annotation | 8 weeks | Scored dataset, quality report |
| 4. Feature Extraction | 4 weeks | Feature matrix |
| 5. Preprocessing | 2 weeks | Clean, split dataset |
| 6. Model Development | 8 weeks | Trained models |
| 7. Evaluation | 4 weeks | Evaluation report |
| 8. Documentation | 6 weeks | Paper, dataset release |
| 9. Maintenance | Ongoing | Updates, support |
| **Total** | **40 weeks (~10 months)** | Published dataset + paper |

---

## Budget Estimate

| Item | Cost (USD) |
|------|------------|
| Participant compensation (200 speakers × $15) | $3,000 |
| Annotator fees (3 annotators × 200 hours × $25/hr) | $15,000 |
| Recording equipment | $500 |
| Cloud computing (GPU training) | $1,000 |
| Conference publication fees | $500 |
| Miscellaneous | $1,000 |
| **Total** | **$21,000** |

---

## Key Academic Standards

### 1. Reproducibility
- Provide all code and scripts
- Document random seeds
- Specify library versions
- Share preprocessed features

### 2. Ethical Considerations
- IRB approval
- Informed consent
- Data anonymization
- Privacy protection

### 3. Statistical Rigor
- Report confidence intervals
- Multiple evaluation metrics
- Significance testing (t-tests, ANOVA)
- Effect sizes (Cohen's d)

### 4. Transparency
- Report all experiments (including failures)
- Acknowledge limitations
- Disclose conflicts of interest
- Share negative results

---

## Recommended Tools & Libraries

### Audio Processing
- **Librosa** (Python): Audio analysis
- **Praat**: Phonetic analysis
- **OpenSMILE**: Feature extraction
- **SoX**: Audio manipulation

### Machine Learning
- **scikit-learn**: Classical ML
- **TensorFlow/PyTorch**: Deep learning
- **Hugging Face Transformers**: Pre-trained models
- **XGBoost/LightGBM**: Gradient boosting

### Annotation
- **ELAN**: Time-aligned annotations
- **Praat**: Phonetic transcription
- **Label Studio**: Custom annotation interface

### Data Management
- **Pandas**: Data manipulation
- **DVC**: Data version control
- **MLflow**: Experiment tracking

---

## References & Further Reading

### Key Papers
1. Malfrère et al. (2007). "Automatic Scoring of Non-Native Spontaneous Speech"
2. Zechner et al. (2009). "Automatic Scoring of Non-Native Spontaneous Speech in Tests of Spoken English"
3. Chen et al. (2018). "Automatic Assessment of Non-Native Learner Essays"
4. Baevski et al. (2020). "wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations"

### Datasets
1. **L2-ARCTIC**: Non-native English speech corpus
2. **EF-Cambridge**: Proficiency-labeled learner corpus
3. **TOEFL11**: Non-native English writing corpus
4. **LibriSpeech**: Native English speech corpus

### Books
1. "Speech and Language Processing" - Jurafsky & Martin
2. "Automatic Speech Recognition" - Yu & Deng
3. "The Handbook of Language Assessment" - Kunnan

---

## Conclusion

Training a speech assessment dataset is a rigorous, multi-month process requiring:
- **Domain expertise** (linguistics, speech science)
- **Technical skills** (ML, signal processing)
- **Project management** (coordination, quality control)
- **Academic rigor** (reproducibility, ethics)

Following this guide ensures your dataset meets academic standards and contributes meaningfully to the research community.

**Good luck with your research!** 🎓🔬
