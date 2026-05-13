"""
Extract Features from Combined Dataset
Academic-standard feature extraction pipeline
"""

from __future__ import annotations

import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from tqdm import tqdm

from app.ml.features import extract_audio_features

warnings.filterwarnings("ignore")


def extract_features_for_dataset(metadata_path: Path, output_path: Path) -> None:
    """
    Extract audio features for all samples in metadata.
    
    Args:
        metadata_path: Path to metadata CSV
        output_path: Path to save features
    """
    print(f"\nExtracting features from: {metadata_path.name}")
    print("=" * 80)
    
    # Load metadata
    df = pd.read_csv(metadata_path)
    print(f"Loaded {len(df)} samples")
    
    # Extract features
    features_list = []
    feature_names = None
    failed_count = 0
    
    for idx, row in tqdm(df.iterrows(), total=len(df), desc="Extracting features"):
        audio_path = row["audio_path"]
        
        try:
            # Extract features
            vec = extract_audio_features(audio_path=audio_path)
            
            # Store feature names (first iteration only)
            if feature_names is None:
                feature_names = vec.names
            
            # Check for invalid values
            if np.any(np.isnan(vec.values)) or np.any(np.isinf(vec.values)):
                print(f"Warning: Invalid features for {audio_path}")
                failed_count += 1
                features_list.append(None)
                continue
            
            features_list.append(vec.values)
            
        except Exception as e:
            print(f"Error extracting features from {audio_path}: {e}")
            failed_count += 1
            features_list.append(None)
    
    # Remove failed samples
    valid_indices = [i for i, f in enumerate(features_list) if f is not None]
    df_valid = df.iloc[valid_indices].reset_index(drop=True)
    features_valid = [features_list[i] for i in valid_indices]
    
    print(f"\n✓ Successfully extracted features from {len(features_valid)} samples")
    print(f"✗ Failed: {failed_count} samples")
    
    # Create features DataFrame
    features_array = np.array(features_valid)
    features_df = pd.DataFrame(features_array, columns=feature_names)
    
    # Combine with metadata
    combined_df = pd.concat([df_valid.reset_index(drop=True), features_df], axis=1)
    
    # Save
    combined_df.to_csv(output_path, index=False)
    print(f"✓ Saved features to: {output_path}")
    print(f"  - Shape: {features_array.shape}")
    print(f"  - Features: {len(feature_names)}")
    print()


def main():
    """Main feature extraction pipeline."""
    print("\n")
    print("=" * 80)
    print("FEATURE EXTRACTION PIPELINE")
    print("=" * 80)
    
    # Paths
    repo_root = Path(__file__).resolve().parent.parent
    dataset_dir = repo_root / "combined_dataset"
    
    if not dataset_dir.exists():
        print("❌ Error: combined_dataset directory not found!")
        print("Please run prepare_combined_dataset.py first")
        return
    
    # Extract features for train set
    train_metadata = dataset_dir / "train_metadata.csv"
    train_features = dataset_dir / "train_features.csv"
    
    if train_metadata.exists():
        extract_features_for_dataset(train_metadata, train_features)
    else:
        print(f"❌ Train metadata not found: {train_metadata}")
    
    # Extract features for test set
    test_metadata = dataset_dir / "test_metadata.csv"
    test_features = dataset_dir / "test_features.csv"
    
    if test_metadata.exists():
        extract_features_for_dataset(test_metadata, test_features)
    else:
        print(f"❌ Test metadata not found: {test_metadata}")
    
    print("=" * 80)
    print("✅ Feature extraction complete!")
    print("=" * 80)
    print()


if __name__ == "__main__":
    main()
