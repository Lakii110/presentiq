@echo off
echo ================================================================================
echo TRAINING PROGRESS CHECKER
echo ================================================================================
echo.

echo Checking dataset preparation...
if exist "combined_dataset\metadata.csv" (
    echo [OK] Dataset prepared
    for /f %%i in ('powershell -command "^(Import-Csv combined_dataset\metadata.csv^).Count"') do echo     Total samples: %%i
) else (
    echo [PENDING] Dataset not prepared yet
)
echo.

echo Checking feature extraction...
if exist "combined_dataset\train_features.csv" (
    echo [OK] Train features extracted
    for /f %%i in ('powershell -command "^(Import-Csv combined_dataset\train_features.csv^).Count"') do echo     Train samples: %%i
) else (
    echo [IN PROGRESS] Train features being extracted...
)

if exist "combined_dataset\test_features.csv" (
    echo [OK] Test features extracted
    for /f %%i in ('powershell -command "^(Import-Csv combined_dataset\test_features.csv^).Count"') do echo     Test samples: %%i
) else (
    echo [PENDING] Test features not extracted yet
)
echo.

echo Checking model training...
if exist "backend\ml_models_combined\fluency_model.pkl" (
    echo [OK] Fluency model trained
) else (
    echo [PENDING] Fluency model not trained yet
)

if exist "backend\ml_models_combined\tone_model.pkl" (
    echo [OK] Tone model trained
) else (
    echo [PENDING] Tone model not trained yet
)

if exist "backend\ml_models_combined\training_report.json" (
    echo [OK] Training report available
    echo.
    echo ================================================================================
    echo TRAINING RESULTS
    echo ================================================================================
    type backend\ml_models_combined\training_report.json
) else (
    echo [PENDING] Training not complete yet
)

echo.
echo ================================================================================
echo Press any key to exit...
pause >nul
