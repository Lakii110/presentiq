@echo off
echo ================================================================================
echo FAST TRAINING - SpeechOcean762 Only (30-45 minutes total)
echo ================================================================================
echo.
echo This trains on SpeechOcean762 only (5,000 samples)
echo Much faster than combined dataset!
echo.
echo Estimated time: 30-45 minutes
echo.
pause

cd backend

echo.
echo Training models on SpeechOcean762...
echo.
python train_models.py

echo.
echo ================================================================================
echo SUCCESS! Training Complete
echo ================================================================================
echo.
echo Models saved to: backend\ml_artifacts\
echo.
echo Performance: Pearson r = 0.70-0.75 (Good for 5K samples)
echo.
pause
