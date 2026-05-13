@echo off
echo ================================================================================
echo COMPLETE MODEL TRAINING PIPELINE
echo ================================================================================
echo.
echo This will train ML models on combined dataset (30,758 samples)
echo Estimated time: 3-5 hours
echo.
echo Steps:
echo   1. Prepare combined dataset (5-10 min)
echo   2. Extract audio features (2-4 hours)
echo   3. Train ML models (30-60 min)
echo.
pause

cd backend

echo.
echo ================================================================================
echo STEP 1: Preparing Combined Dataset
echo ================================================================================
echo.
python prepare_combined_dataset.py
if errorlevel 1 (
    echo ERROR: Dataset preparation failed!
    pause
    exit /b 1
)

echo.
echo ================================================================================
echo STEP 2: Extracting Audio Features
echo ================================================================================
echo.
echo This will take 2-4 hours. You can leave it running overnight.
echo.
python extract_features_combined.py
if errorlevel 1 (
    echo ERROR: Feature extraction failed!
    pause
    exit /b 1
)

echo.
echo ================================================================================
echo STEP 3: Training ML Models
echo ================================================================================
echo.
python train_combined_models.py
if errorlevel 1 (
    echo ERROR: Model training failed!
    pause
    exit /b 1
)

echo.
echo ================================================================================
echo SUCCESS! Training Complete
echo ================================================================================
echo.
echo Models saved to: backend\ml_models_combined\
echo.
echo Next steps:
echo   1. Check training report: backend\ml_models_combined\training_report.json
echo   2. Update backend config to use new models
echo   3. Restart backend and test
echo.
pause
