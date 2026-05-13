@echo off
echo ================================================================================
echo AUTOMATIC TRAINING MONITOR
echo ================================================================================
echo.
echo This script will wait for feature extraction to complete,
echo then automatically start model training.
echo.
echo Press Ctrl+C to cancel at any time.
echo.

:CHECK_LOOP
echo Checking if feature extraction is complete...

if not exist "combined_dataset\train_features.csv" (
    echo [WAITING] Train features not ready yet...
    timeout /t 60 /nobreak >nul
    goto CHECK_LOOP
)

if not exist "combined_dataset\test_features.csv" (
    echo [WAITING] Test features not ready yet...
    timeout /t 60 /nobreak >nul
    goto CHECK_LOOP
)

echo.
echo ================================================================================
echo FEATURE EXTRACTION COMPLETE!
echo ================================================================================
echo.
echo Starting model training now...
echo.

python backend/train_combined_models.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================================
    echo SUCCESS! TRAINING COMPLETE!
    echo ================================================================================
    echo.
    echo Models saved to: backend\ml_models_combined\
    echo.
    echo Next step: Update backend\app\config.py to use new models
    echo.
) else (
    echo.
    echo ================================================================================
    echo ERROR: Training failed!
    echo ================================================================================
    echo.
)

pause
