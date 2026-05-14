"""
Quick evaluation of production models on combined dataset (SpeechOcean762 + L2-ARCTIC).
Shows real-world accuracy on diverse accents.
"""

import json
import pickle
import csv
from pathlib import Path
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, mean_absolute_error,
    mean_squared_error, r2_score
)

def load_csv(filepath):
    """Load CSV file into list of dicts"""
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

def classify_binary(scores, threshold=5.0):
    """Convert continuous scores to binary: Good (>=5) vs Poor (<5)"""
    return (scores >= threshold).astype(int)

def main():
    repo_root = Path(__file__).resolve().parent.parent
    models_dir = repo_root / "backend" / "ml_models_combined"
    dataset_dir = repo_root / "combined_dataset"
    
    print("=" * 70)
    print("PRODUCTION MODEL EVALUATION - Combined Dataset")
    print("=" * 70)
    
    # Load test data
    print("\n📊 Loading test data...")
    test_features_data = load_csv(dataset_dir / "test_features.csv")
    test_metadata_data = load_csv(dataset_dir / "test_metadata.csv")
    
    # Convert to numpy arrays - skip metadata columns
    metadata_cols = {'audio_path', 'speaker_id', 'text', 'fluency_score', 'prosodic_score', 'accuracy_score', 'dataset', 'native_language', 'split'}
    feature_cols = [col for col in test_features_data[0].keys() if col not in metadata_cols]
    X_test = np.array([[float(row[col]) for col in feature_cols] for row in test_features_data])
    
    y_fluency_true = np.array([float(row["fluency_score"]) for row in test_metadata_data])
    y_tone_true = np.array([float(row["prosodic_score"]) for row in test_metadata_data])
    datasets = [row["dataset"] for row in test_metadata_data]
    
    # Load models
    print("🤖 Loading trained models...")
    with open(models_dir / "fluency_model.pkl", "rb") as f:
        fluency_model = pickle.load(f)
    with open(models_dir / "tone_model.pkl", "rb") as f:
        tone_model = pickle.load(f)
    
    # Predictions
    print("🔮 Making predictions...")
    y_fluency_pred = fluency_model.predict(X_test)
    y_tone_pred = tone_model.predict(X_test)
    
    # Clip predictions to 0-10 range
    y_fluency_pred = np.clip(y_fluency_pred, 0, 10)
    y_tone_pred = np.clip(y_tone_pred, 0, 10)
    
    print(f"\n📈 Test Set Size: {len(X_test):,} samples")
    print(f"   Features: {X_test.shape[1]}")
    
    # Count datasets
    speechocean_count = sum(1 for d in datasets if d == "speechocean762")
    arctic_count = sum(1 for d in datasets if d == "l2arctic")
    print(f"\n   SpeechOcean762: {speechocean_count:,} samples")
    print(f"   L2-ARCTIC: {arctic_count:,} samples")
    
    # Evaluate both models
    for name, y_true, y_pred in [
        ("Fluency", y_fluency_true, y_fluency_pred),
        ("Prosodic/Tone", y_tone_true, y_tone_pred)
    ]:
        print(f"\n{'=' * 70}")
        print(f"{name} Model Results")
        print("=" * 70)
        
        # Regression metrics
        mae = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        r2 = r2_score(y_true, y_pred)
        
        print(f"\n📊 Regression Metrics (0-10 scale):")
        print(f"   MAE (Mean Absolute Error):  {mae:.4f}")
        print(f"   RMSE (Root Mean Squared):   {rmse:.4f}")
        print(f"   R² (Coefficient of Det.):   {r2:.4f}")
        
        # Binary classification at threshold 5.0
        y_true_binary = classify_binary(y_true, 5.0)
        y_pred_binary = classify_binary(y_pred, 5.0)
        
        acc = accuracy_score(y_true_binary, y_pred_binary)
        prec = precision_score(y_true_binary, y_pred_binary, zero_division=0)
        rec = recall_score(y_true_binary, y_pred_binary, zero_division=0)
        f1 = f1_score(y_true_binary, y_pred_binary, zero_division=0)
        
        print(f"\n🎯 Binary Classification (Good ≥5 vs Poor <5):")
        print(f"   Accuracy:   {acc*100:.2f}%")
        print(f"   Precision:  {prec:.4f}")
        print(f"   Recall:     {rec:.4f}")
        print(f"   F1-Score:   {f1:.4f}")
        
        # ROC-AUC
        if len(np.unique(y_true_binary)) > 1:
            try:
                roc = roc_auc_score(y_true_binary, y_pred)
                print(f"   ROC-AUC:    {roc:.4f}")
            except:
                print(f"   ROC-AUC:    N/A")
        
        # Confusion matrix
        tn, fp, fn, tp = confusion_matrix(y_true_binary, y_pred_binary, labels=[0, 1]).ravel()
        print(f"\n📋 Confusion Matrix:")
        print(f"   True Negatives (TN):  {tn:,}")
        print(f"   False Positives (FP): {fp:,}")
        print(f"   False Negatives (FN): {fn:,}")
        print(f"   True Positives (TP):  {tp:,}")
        
        # Per-dataset breakdown
        print(f"\n🌍 Per-Dataset Performance:")
        for dataset_name in ["speechocean762", "l2arctic"]:
            mask = np.array([d == dataset_name for d in datasets])
            if mask.sum() == 0:
                continue
            
            y_true_ds = y_true[mask]
            y_pred_ds = y_pred[mask]
            
            mae_ds = mean_absolute_error(y_true_ds, y_pred_ds)
            r2_ds = r2_score(y_true_ds, y_pred_ds)
            
            y_true_bin_ds = classify_binary(y_true_ds, 5.0)
            y_pred_bin_ds = classify_binary(y_pred_ds, 5.0)
            acc_ds = accuracy_score(y_true_bin_ds, y_pred_bin_ds)
            
            print(f"   {dataset_name:15s}: MAE={mae_ds:.4f}, R²={r2_ds:.4f}, Acc={acc_ds*100:.2f}%")
    
    print(f"\n{'=' * 70}")
    print("✅ Evaluation Complete!")
    print("=" * 70)
    
    # Save results
    results = {
        "test_samples": int(len(X_test)),
        "speechocean_samples": int(speechocean_count),
        "l2arctic_samples": int(arctic_count),
        "fluency": {
            "mae": float(mean_absolute_error(y_fluency_true, y_fluency_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y_fluency_true, y_fluency_pred))),
            "r2": float(r2_score(y_fluency_true, y_fluency_pred)),
            "accuracy": float(accuracy_score(classify_binary(y_fluency_true), classify_binary(y_fluency_pred)))
        },
        "tone": {
            "mae": float(mean_absolute_error(y_tone_true, y_tone_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y_tone_true, y_tone_pred))),
            "r2": float(r2_score(y_tone_true, y_tone_pred)),
            "accuracy": float(accuracy_score(classify_binary(y_tone_true), classify_binary(y_tone_pred)))
        }
    }
    
    output_file = repo_root / "backend" / "data" / "combined_evaluation_results.json"
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Results saved to: {output_file}")

if __name__ == "__main__":
    main()
