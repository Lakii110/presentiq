"""
Train ML Models on Combined Dataset
Academic-standard training pipeline with proper evaluation
"""

from __future__ import annotations

import json
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from scipy.stats import pearsonr, spearmanr
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import cross_val_score

warnings.filterwarnings("ignore")


def load_data(features_path: Path) -> tuple[np.ndarray, np.ndarray, np.ndarray, list[str]]:
    """
    Load features and labels from CSV.
    
    Returns:
        X: Feature matrix
        y_fluency: Fluency scores
        y_tone: Tone/prosodic scores
        feature_names: List of feature names
    """
    print(f"Loading data from: {features_path.name}")
    df = pd.read_csv(features_path)
    
    # Metadata columns
    metadata_cols = [
        "audio_path", "speaker_id", "text", "fluency_score",
        "prosodic_score", "accuracy_score", "dataset", "native_language", "split"
    ]
    
    # Feature columns (everything else)
    feature_cols = [col for col in df.columns if col not in metadata_cols]
    
    # Extract features and labels
    X = df[feature_cols].values
    y_fluency = df["fluency_score"].values * 10  # Convert 0-10 to 0-100
    y_tone = df["prosodic_score"].values * 10    # Convert 0-10 to 0-100
    
    print(f"  - Samples: {len(X)}")
    print(f"  - Features: {len(feature_cols)}")
    print(f"  - Fluency range: [{y_fluency.min():.1f}, {y_fluency.max():.1f}]")
    print(f"  - Tone range: [{y_tone.min():.1f}, {y_tone.max():.1f}]")
    
    return X, y_fluency, y_tone, feature_cols


def train_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
    model_name: str
) -> tuple[RandomForestRegressor, dict]:
    """
    Train Random Forest model with cross-validation.
    
    Returns:
        model: Trained model
        metrics: Dictionary of evaluation metrics
    """
    print(f"\nTraining {model_name} Model")
    print("=" * 80)
    
    # Initialize model with best hyperparameters
    model = RandomForestRegressor(
        n_estimators=200,        # More trees = better performance
        max_depth=20,            # Prevent overfitting
        min_samples_split=5,     # Minimum samples to split
        min_samples_leaf=2,      # Minimum samples in leaf
        max_features="sqrt",     # Feature sampling
        random_state=42,
        n_jobs=-1,               # Use all CPU cores
        verbose=0
    )
    
    # Train model
    print("Training...")
    model.fit(X_train, y_train)
    print("✓ Training complete")
    
    # Cross-validation on training set
    print("\nCross-Validation (5-fold):")
    cv_scores = cross_val_score(
        model, X_train, y_train,
        cv=5,
        scoring="neg_mean_absolute_error",
        n_jobs=-1
    )
    cv_mae = -cv_scores.mean()
    cv_std = cv_scores.std()
    print(f"  - CV MAE: {cv_mae:.2f} ± {cv_std:.2f}")
    
    # Predictions
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    # Training metrics
    train_mae = mean_absolute_error(y_train, y_train_pred)
    train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
    train_r2 = r2_score(y_train, y_train_pred)
    train_pearson, _ = pearsonr(y_train, y_train_pred)
    train_spearman, _ = spearmanr(y_train, y_train_pred)
    
    # Test metrics
    test_mae = mean_absolute_error(y_test, y_test_pred)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
    test_r2 = r2_score(y_test, y_test_pred)
    test_pearson, _ = pearsonr(y_test, y_test_pred)
    test_spearman, _ = spearmanr(y_test, y_test_pred)
    
    # Print metrics
    print("\nTraining Set Performance:")
    print(f"  - MAE:  {train_mae:.2f}")
    print(f"  - RMSE: {train_rmse:.2f}")
    print(f"  - R²:   {train_r2:.3f}")
    print(f"  - Pearson r:  {train_pearson:.3f}")
    print(f"  - Spearman ρ: {train_spearman:.3f}")
    
    print("\nTest Set Performance:")
    print(f"  - MAE:  {test_mae:.2f}")
    print(f"  - RMSE: {test_rmse:.2f}")
    print(f"  - R²:   {test_r2:.3f}")
    print(f"  - Pearson r:  {test_pearson:.3f}")
    print(f"  - Spearman ρ: {test_spearman:.3f}")
    
    # Check for overfitting
    overfit_gap = train_mae - test_mae
    if abs(overfit_gap) > 5:
        print(f"\n⚠️  Warning: Possible overfitting (gap: {overfit_gap:.2f})")
    else:
        print(f"\n✓ Good generalization (gap: {overfit_gap:.2f})")
    
    # Collect metrics
    metrics = {
        "cv_mae": float(cv_mae),
        "cv_std": float(cv_std),
        "train_mae": float(train_mae),
        "train_rmse": float(train_rmse),
        "train_r2": float(train_r2),
        "train_pearson": float(train_pearson),
        "train_spearman": float(train_spearman),
        "test_mae": float(test_mae),
        "test_rmse": float(test_rmse),
        "test_r2": float(test_r2),
        "test_pearson": float(test_pearson),
        "test_spearman": float(test_spearman),
        "overfit_gap": float(overfit_gap)
    }
    
    return model, metrics


def analyze_feature_importance(
    model: RandomForestRegressor,
    feature_names: list[str],
    top_n: int = 20
) -> None:
    """Analyze and display feature importance."""
    print("\nFeature Importance Analysis:")
    print("=" * 80)
    
    # Get feature importances
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    # Display top N features
    print(f"Top {top_n} Most Important Features:")
    for i in range(min(top_n, len(feature_names))):
        idx = indices[i]
        print(f"  {i+1:2d}. {feature_names[idx]:30s} : {importances[idx]:.4f}")
    
    return {
        "feature_names": [feature_names[idx] for idx in indices[:top_n]],
        "importances": [float(importances[idx]) for idx in indices[:top_n]]
    }


def main():
    """Main training pipeline."""
    print("\n")
    print("=" * 80)
    print("MODEL TRAINING PIPELINE")
    print("=" * 80)
    print()
    
    # Paths
    repo_root = Path(__file__).resolve().parent.parent
    dataset_dir = repo_root / "combined_dataset"
    models_dir = repo_root / "backend" / "ml_models_combined"
    
    # Create models directory
    models_dir.mkdir(exist_ok=True)
    
    # Check if features exist
    train_features_path = dataset_dir / "train_features.csv"
    test_features_path = dataset_dir / "test_features.csv"
    
    if not train_features_path.exists() or not test_features_path.exists():
        print("❌ Error: Feature files not found!")
        print("Please run extract_features_combined.py first")
        return
    
    # Load data
    print("=" * 80)
    print("Loading Data")
    print("=" * 80)
    X_train, y_train_fluency, y_train_tone, feature_names = load_data(train_features_path)
    X_test, y_test_fluency, y_test_tone, _ = load_data(test_features_path)
    print()
    
    # Train Fluency Model
    fluency_model, fluency_metrics = train_model(
        X_train, y_train_fluency,
        X_test, y_test_fluency,
        "Fluency"
    )
    
    # Analyze feature importance for fluency
    fluency_importance = analyze_feature_importance(fluency_model, feature_names)
    
    # Train Tone Model
    tone_model, tone_metrics = train_model(
        X_train, y_train_tone,
        X_test, y_test_tone,
        "Tone"
    )
    
    # Analyze feature importance for tone
    tone_importance = analyze_feature_importance(tone_model, feature_names)
    
    # Save models
    print("\n" + "=" * 80)
    print("Saving Models")
    print("=" * 80)
    
    fluency_model_path = models_dir / "fluency_model.pkl"
    tone_model_path = models_dir / "tone_model.pkl"
    
    joblib.dump(fluency_model, fluency_model_path)
    joblib.dump(tone_model, tone_model_path)
    
    print(f"✓ Saved fluency model: {fluency_model_path}")
    print(f"✓ Saved tone model: {tone_model_path}")
    
    # Save feature schema
    feature_schema = {
        "feature_names": feature_names,
        "n_features": len(feature_names)
    }
    
    schema_path = models_dir / "feature_schema.json"
    schema_path.write_text(json.dumps(feature_schema, indent=2))
    print(f"✓ Saved feature schema: {schema_path}")
    
    # Save training report
    report = {
        "dataset": {
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "n_features": len(feature_names)
        },
        "fluency_model": {
            "metrics": fluency_metrics,
            "feature_importance": fluency_importance
        },
        "tone_model": {
            "metrics": tone_metrics,
            "feature_importance": tone_importance
        }
    }
    
    report_path = models_dir / "training_report.json"
    report_path.write_text(json.dumps(report, indent=2))
    print(f"✓ Saved training report: {report_path}")
    
    # Final summary
    print("\n" + "=" * 80)
    print("TRAINING SUMMARY")
    print("=" * 80)
    print(f"Dataset: {len(X_train)} train + {len(X_test)} test samples")
    print(f"Features: {len(feature_names)}")
    print()
    print("Fluency Model:")
    print(f"  - Test MAE: {fluency_metrics['test_mae']:.2f}")
    print(f"  - Test Pearson r: {fluency_metrics['test_pearson']:.3f}")
    print()
    print("Tone Model:")
    print(f"  - Test MAE: {tone_metrics['test_mae']:.2f}")
    print(f"  - Test Pearson r: {tone_metrics['test_pearson']:.3f}")
    print()
    print("✅ Training complete!")
    print()


if __name__ == "__main__":
    main()
