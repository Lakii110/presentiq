@echo off
echo ================================================================================
echo MEDIUM TRAINING - Sampled Dataset (1 hour total)
echo ================================================================================
echo.
echo This uses 10,000 samples (sampled from both datasets)
echo Balanced between speed and performance
echo.
echo Estimated time: 1 hour
echo Performance: Pearson r = 0.75-0.80
echo.
pause

cd backend

echo.
echo Preparing sampled dataset...
echo.
python prepare_sampled_dataset.py

echo.
echo Extracting features...
echo.
python extract_features_sampled.py

echo.
echo Training models...
echo.
python train_sampled_models.py

echo.
echo ================================================================================
echo SUCCESS! Training Complete
echo ================================================================================
echo.
pause
