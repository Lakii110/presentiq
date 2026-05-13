"""
Prepare Combined Dataset: SpeechOcean762 + L2-ARCTIC
Academic-standard data preparation pipeline
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

import pandas as pd
from tqdm import tqdm


def prepare_speechocean762(archive_dir: Path) -> pd.DataFrame:
    """
    Prepare SpeechOcean762 dataset.
    
    Returns DataFrame with columns:
    - audio_path: Path to audio file
    - speaker_id: Speaker identifier
    - text: Transcript
    - fluency_score: 0-10 scale
    - prosodic_score: 0-10 scale
    - accuracy_score: 0-10 scale
    - dataset: 'speechocean762'
    - native_language: 'Mandarin'
    """
    print("=" * 80)
    print("Preparing SpeechOcean762 Dataset")
    print("=" * 80)
    
    # Load scores
    scores_path = archive_dir / "resource" / "scores.json"
    scores = json.loads(scores_path.read_text(encoding="utf-8"))
    
    # Load train/test splits
    def read_wav_scp(path: Path) -> dict[str, str]:
        out = {}
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            utt, wav = line.split(maxsplit=1)
            out[utt] = wav.strip()
        return out
    
    train_wavs = read_wav_scp(archive_dir / "train" / "wav.scp")
    test_wavs = read_wav_scp(archive_dir / "test" / "wav.scp")
    
    # Combine
    all_wavs = {**train_wavs, **test_wavs}
    
    # Create DataFrame
    data = []
    for utt_id, wav_rel in tqdm(all_wavs.items(), desc="Processing SpeechOcean762"):
        if utt_id not in scores:
            continue
        
        audio_path = archive_dir / wav_rel
        if not audio_path.exists():
            continue
        
        score_data = scores[utt_id]
        
        # Extract speaker ID from utterance ID (e.g., "000010011" -> "SPEAKER0001")
        speaker_id = f"SPEAKER{utt_id[:4]}"
        
        data.append({
            "audio_path": str(audio_path.absolute()),
            "speaker_id": speaker_id,
            "text": score_data.get("text", ""),
            "fluency_score": float(score_data.get("fluency", 0)),
            "prosodic_score": float(score_data.get("prosodic", 0)),
            "accuracy_score": float(score_data.get("accuracy", 0)),
            "dataset": "speechocean762",
            "native_language": "Mandarin",
            "split": "train" if utt_id in train_wavs else "test"
        })
    
    df = pd.DataFrame(data)
    print(f"✓ Loaded {len(df)} samples from SpeechOcean762")
    print(f"  - Train: {len(df[df['split'] == 'train'])}")
    print(f"  - Test: {len(df[df['split'] == 'test'])}")
    print()
    
    return df


def prepare_l2arctic(l2arctic_dir: Path) -> pd.DataFrame:
    """
    Prepare L2-ARCTIC dataset.
    
    Returns DataFrame with same columns as SpeechOcean762.
    Note: L2-ARCTIC doesn't have fluency/prosodic scores,
    so we'll use pronunciation quality as proxy.
    """
    print("=" * 80)
    print("Preparing L2-ARCTIC Dataset")
    print("=" * 80)
    
    # Check if directory exists
    if not l2arctic_dir.exists():
        print(f"⚠️  Warning: L2-ARCTIC directory not found: {l2arctic_dir}")
        print("Skipping L2-ARCTIC dataset...")
        return pd.DataFrame()
    
    # Speaker metadata
    speaker_info = {
        "ABA": {"gender": "M", "native_language": "Arabic"},
        "SKA": {"gender": "F", "native_language": "Arabic"},
        "YBAA": {"gender": "M", "native_language": "Arabic"},
        "ZHAA": {"gender": "F", "native_language": "Arabic"},
        "BWC": {"gender": "M", "native_language": "Chinese"},
        "LXC": {"gender": "F", "native_language": "Chinese"},
        "NCC": {"gender": "F", "native_language": "Chinese"},
        "TXHC": {"gender": "M", "native_language": "Chinese"},
        "ASI": {"gender": "M", "native_language": "Hindi"},
        "RRBI": {"gender": "M", "native_language": "Hindi"},
        "SVBI": {"gender": "F", "native_language": "Hindi"},
        "TNI": {"gender": "F", "native_language": "Hindi"},
        "HJK": {"gender": "F", "native_language": "Korean"},
        "HKK": {"gender": "M", "native_language": "Korean"},
        "YDCK": {"gender": "F", "native_language": "Korean"},
        "YKWK": {"gender": "M", "native_language": "Korean"},
        "EBVS": {"gender": "M", "native_language": "Spanish"},
        "ERMS": {"gender": "M", "native_language": "Spanish"},
        "MBMPS": {"gender": "F", "native_language": "Spanish"},
        "NJS": {"gender": "F", "native_language": "Spanish"},
        "HQTV": {"gender": "M", "native_language": "Vietnamese"},
        "PNV": {"gender": "F", "native_language": "Vietnamese"},
        "THV": {"gender": "F", "native_language": "Vietnamese"},
        "TLV": {"gender": "M", "native_language": "Vietnamese"},
    }
    
    data = []
    
    # Process each speaker
    for speaker_id, info in tqdm(speaker_info.items(), desc="Processing L2-ARCTIC speakers"):
        # Try both possible directory structures
        speaker_dir = l2arctic_dir / speaker_id
        if not speaker_dir.exists():
            continue
        
        # Check for nested structure (speaker_id/speaker_id/)
        nested_dir = speaker_dir / speaker_id
        if nested_dir.exists():
            speaker_dir = nested_dir
        
        wav_dir = speaker_dir / "wav"
        transcript_dir = speaker_dir / "transcript"
        
        if not wav_dir.exists() or not transcript_dir.exists():
            continue
        
        # Process each audio file
        for wav_file in wav_dir.glob("*.wav"):
            transcript_file = transcript_dir / f"{wav_file.stem}.txt"
            
            if not transcript_file.exists():
                continue
            
            text = transcript_file.read_text(encoding="utf-8").strip()
            
            # For L2-ARCTIC, we don't have fluency/prosodic scores
            # We'll assign neutral scores (5.0) and let the model learn from features
            data.append({
                "audio_path": str(wav_file.absolute()),
                "speaker_id": speaker_id,
                "text": text,
                "fluency_score": 5.0,  # Neutral - model will learn from features
                "prosodic_score": 5.0,  # Neutral - model will learn from features
                "accuracy_score": 5.0,  # Neutral - model will learn from features
                "dataset": "l2arctic",
                "native_language": info["native_language"],
                "split": "train"  # We'll split later
            })
    
    df = pd.DataFrame(data)
    print(f"✓ Loaded {len(df)} samples from L2-ARCTIC")
    print(f"  - Languages: {df['native_language'].nunique()}")
    print(f"  - Speakers: {df['speaker_id'].nunique()}")
    print()
    
    return df


def create_stratified_split(df: pd.DataFrame, test_size: float = 0.15) -> pd.DataFrame:
    """
    Create stratified train/test split ensuring balanced representation.
    """
    print("=" * 80)
    print("Creating Stratified Train/Test Split")
    print("=" * 80)
    
    from sklearn.model_selection import train_test_split
    
    # For SpeechOcean762, keep existing split
    speechocean_df = df[df["dataset"] == "speechocean762"].copy()
    
    # For L2-ARCTIC, create new split stratified by native language
    l2arctic_df = df[df["dataset"] == "l2arctic"].copy()
    
    if len(l2arctic_df) > 0:
        if "native_language" in l2arctic_df.columns and l2arctic_df["native_language"].notna().all():
            # Stratified split by language
            train_idx, test_idx = train_test_split(
                l2arctic_df.index,
                test_size=test_size,
                stratify=l2arctic_df["native_language"],
                random_state=42
            )
        else:
            # Simple random split if no language info
            train_idx, test_idx = train_test_split(
                l2arctic_df.index,
                test_size=test_size,
                random_state=42
            )
        
        l2arctic_df.loc[train_idx, "split"] = "train"
        l2arctic_df.loc[test_idx, "split"] = "test"
    
    # Combine
    combined_df = pd.concat([speechocean_df, l2arctic_df], ignore_index=True)
    
    print(f"✓ Split created:")
    print(f"  - Total samples: {len(combined_df)}")
    print(f"  - Train: {len(combined_df[combined_df['split'] == 'train'])} ({len(combined_df[combined_df['split'] == 'train']) / len(combined_df) * 100:.1f}%)")
    print(f"  - Test: {len(combined_df[combined_df['split'] == 'test'])} ({len(combined_df[combined_df['split'] == 'test']) / len(combined_df) * 100:.1f}%)")
    print()
    
    # Show distribution by language (if column exists)
    if "native_language" in combined_df.columns:
        print("Distribution by Native Language:")
        for lang in combined_df["native_language"].unique():
            lang_df = combined_df[combined_df["native_language"] == lang]
            train_count = len(lang_df[lang_df["split"] == "train"])
            test_count = len(lang_df[lang_df["split"] == "test"])
            print(f"  - {lang:12s}: Train={train_count:5d}, Test={test_count:4d}")
        print()
    
    return combined_df


def main():
    """Main preparation pipeline."""
    print("\n")
    print("=" * 80)
    print("COMBINED DATASET PREPARATION PIPELINE")
    print("=" * 80)
    print()
    
    # Paths
    repo_root = Path(__file__).resolve().parent.parent
    archive_dir = repo_root / "archive"
    l2arctic_dir = repo_root / "dataset_speech"  # Fixed: underscore not space
    output_dir = repo_root / "combined_dataset"
    
    # Create output directory
    output_dir.mkdir(exist_ok=True)
    
    # Step 1: Prepare SpeechOcean762
    speechocean_df = prepare_speechocean762(archive_dir)
    
    # Step 2: Prepare L2-ARCTIC
    l2arctic_df = prepare_l2arctic(l2arctic_dir)
    
    # Step 3: Combine datasets
    print("=" * 80)
    print("Combining Datasets")
    print("=" * 80)
    combined_df = pd.concat([speechocean_df, l2arctic_df], ignore_index=True)
    print(f"✓ Combined dataset: {len(combined_df)} samples")
    print()
    
    # Step 4: Create stratified split
    combined_df = create_stratified_split(combined_df)
    
    # Step 5: Save metadata
    print("=" * 80)
    print("Saving Metadata")
    print("=" * 80)
    
    metadata_path = output_dir / "metadata.csv"
    combined_df.to_csv(metadata_path, index=False)
    print(f"✓ Saved metadata to: {metadata_path}")
    
    # Save train/test splits separately
    train_df = combined_df[combined_df["split"] == "train"]
    test_df = combined_df[combined_df["split"] == "test"]
    
    train_df.to_csv(output_dir / "train_metadata.csv", index=False)
    test_df.to_csv(output_dir / "test_metadata.csv", index=False)
    print(f"✓ Saved train metadata: {len(train_df)} samples")
    print(f"✓ Saved test metadata: {len(test_df)} samples")
    print()
    
    # Step 6: Generate summary statistics
    print("=" * 80)
    print("DATASET SUMMARY")
    print("=" * 80)
    print(f"Total Samples: {len(combined_df)}")
    print(f"Total Speakers: {combined_df['speaker_id'].nunique()}")
    print(f"Total Languages: {combined_df['native_language'].nunique()}")
    print()
    print("By Dataset:")
    print(f"  - SpeechOcean762: {len(speechocean_df)} samples")
    print(f"  - L2-ARCTIC: {len(l2arctic_df)} samples")
    print()
    print("By Split:")
    print(f"  - Train: {len(train_df)} samples ({len(train_df) / len(combined_df) * 100:.1f}%)")
    print(f"  - Test: {len(test_df)} samples ({len(test_df) / len(combined_df) * 100:.1f}%)")
    print()
    print("✅ Dataset preparation complete!")
    print()


if __name__ == "__main__":
    main()
