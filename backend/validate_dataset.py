"""
Dataset Validation Script for PresentIQ

Validates the SpeechOcean762 dataset before training:
- Audio file quality checks
- Label validation
- Feature extraction validation
- Train/test split analysis
- Generates detailed validation report
"""

from __future__ import annotations

import json
import warnings
from dataclasses import dataclass
from pathlib import Path

import librosa
import numpy as np
from sklearn.model_selection import KFold

from app.ml.features import extract_audio_features

warnings.filterwarnings("ignore")


@dataclass
class AudioStats:
    """Statistics for a single audio file."""
    utt_id: str
    duration: float
    sample_rate: int
    is_valid: bool
    error: str | None = None


@dataclass
class ValidationReport:
    """Complete validation report."""
    total_samples: int
    valid_samples: int
    invalid_samples: int
    audio_issues: list[str]
    label_issues: list[str]
    feature_issues: list[str]
    train_samples: int
    test_samples: int
    fluency_stats: dict
    prosodic_stats: dict


def validate_audio_file(audio_path: Path) -> AudioStats:
    """Validate a single audio file."""
    try:
        # Load audio
        y, sr = librosa.load(str(audio_path), sr=None, duration=None)
        duration = librosa.get_duration(y=y, sr=sr)
        
        # Check duration
        if duration < 0.5:
            return AudioStats(
                utt_id=audio_path.stem,
                duration=duration,
                sample_rate=sr,
                is_valid=False,
                error="Audio too short (<0.5s)"
            )
        
        if duration > 300:
            return AudioStats(
                utt_id=audio_path.stem,
                duration=duration,
                sample_rate=sr,
                is_valid=False,
                error="Audio too long (>300s)"
            )
        
        # Check if audio is mostly silence
        rms = librosa.feature.rms(y=y)[0]
        if np.mean(rms) < 0.001:
            return AudioStats(
                utt_id=audio_path.stem,
                duration=duration,
                sample_rate=sr,
                is_valid=False,
                error="Audio is mostly silence"
            )
        
        return AudioStats(
            utt_id=audio_path.stem,
            duration=duration,
            sample_rate=sr,
            is_valid=True
        )
    
    except Exception as e:
        return AudioStats(
            utt_id=audio_path.stem if audio_path else "unknown",
            duration=0.0,
            sample_rate=0,
            is_valid=False,
            error=f"Failed to load: {str(e)}"
        )


def validate_labels(scores: dict[str, dict]) -> tuple[list[str], dict, dict]:
    """Validate ground truth labels."""
    issues = []
    fluency_scores = []
    prosodic_scores = []
    
    for utt_id, item in scores.items():
        # Check fluency score
        flu = item.get("fluency")
        if flu is None:
            issues.append(f"{utt_id}: Missing fluency score")
        elif not (0 <= flu <= 10):
            issues.append(f"{utt_id}: Fluency score out of range: {flu}")
        else:
            fluency_scores.append(flu)
        
        # Check prosodic score
        pro = item.get("prosodic")
        if pro is None:
            issues.append(f"{utt_id}: Missing prosodic score")
        elif not (0 <= pro <= 10):
            issues.append(f"{utt_id}: Prosodic score out of range: {pro}")
        else:
            prosodic_scores.append(pro)
    
    fluency_stats = {
        "mean": float(np.mean(fluency_scores)) if fluency_scores else 0.0,
        "std": float(np.std(fluency_scores)) if fluency_scores else 0.0,
        "min": float(np.min(fluency_scores)) if fluency_scores else 0.0,
        "max": float(np.max(fluency_scores)) if fluency_scores else 0.0,
        "count": len(fluency_scores)
    }
    
    prosodic_stats = {
        "mean": float(np.mean(prosodic_scores)) if prosodic_scores else 0.0,
        "std": float(np.std(prosodic_scores)) if prosodic_scores else 0.0,
        "min": float(np.min(prosodic_scores)) if prosodic_scores else 0.0,
        "max": float(np.max(prosodic_scores)) if prosodic_scores else 0.0,
        "count": len(prosodic_scores)
    }
    
    return issues, fluency_stats, prosodic_stats


def validate_features(audio_path: Path) -> tuple[bool, str | None]:
    """Validate feature extraction for a single file."""
    try:
        vec = extract_audio_features(audio_path=str(audio_path))
        
        # Check for NaN or Inf
        if np.any(np.isnan(vec.values)):
            return False, "Features contain NaN"
        
        if np.any(np.isinf(vec.values)):
            return False, "Features contain Inf"
        
        # Check feature count
        if len(vec.values) == 0:
            return False, "No features extracted"
        
        return True, None
    
    except Exception as e:
        return False, f"Feature extraction failed: {str(e)}"


def main() -> None:
    """Run complete dataset validation."""
    print("=" * 80)
    print("PresentIQ Dataset Validation")
    print("=" * 80)
    print()
    
    # Setup paths
    repo_root = Path(__file__).resolve().parent.parent
    archive = repo_root / "archive"
    scores_path = archive / "resource" / "scores.json"
    
    # Load scores
    print("Loading ground truth labels...")
    scores = json.loads(scores_path.read_text(encoding="utf-8"))
    print(f"✓ Loaded {len(scores)} labeled samples")
    print()
    
    # Validate labels
    print("Validating labels...")
    label_issues, fluency_stats, prosodic_stats = validate_labels(scores)
    if label_issues:
        print(f"⚠ Found {len(label_issues)} label issues:")
        for issue in label_issues[:10]:  # Show first 10
            print(f"  - {issue}")
        if len(label_issues) > 10:
            print(f"  ... and {len(label_issues) - 10} more")
    else:
        print("✓ All labels valid")
    print()
    
    # Label statistics
    print("Label Statistics:")
    print(f"  Fluency:  mean={fluency_stats['mean']:.2f} std={fluency_stats['std']:.2f} "
          f"range=[{fluency_stats['min']:.1f}, {fluency_stats['max']:.1f}]")
    print(f"  Prosodic: mean={prosodic_stats['mean']:.2f} std={prosodic_stats['std']:.2f} "
          f"range=[{prosodic_stats['min']:.1f}, {prosodic_stats['max']:.1f}]")
    print()
    
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
    
    train_wavs = read_wav_scp(archive / "train" / "wav.scp")
    test_wavs = read_wav_scp(archive / "test" / "wav.scp")
    
    print(f"Dataset Split:")
    print(f"  Train: {len(train_wavs)} samples")
    print(f"  Test:  {len(test_wavs)} samples")
    print(f"  Total: {len(train_wavs) + len(test_wavs)} samples")
    print()
    
    # Validate audio files
    print("Validating audio files...")
    audio_issues = []
    valid_count = 0
    invalid_count = 0
    
    all_wavs = {**train_wavs, **test_wavs}
    sample_size = min(100, len(all_wavs))  # Validate first 100 for speed
    
    for i, (utt_id, wav_rel) in enumerate(list(all_wavs.items())[:sample_size], 1):
        audio_path = archive / wav_rel
        
        if not audio_path.exists():
            audio_issues.append(f"{utt_id}: File not found")
            invalid_count += 1
            continue
        
        stats = validate_audio_file(audio_path)
        
        if not stats.is_valid:
            audio_issues.append(f"{utt_id}: {stats.error}")
            invalid_count += 1
        else:
            valid_count += 1
        
        if i % 20 == 0:
            print(f"  Validated {i}/{sample_size} files...")
    
    print(f"✓ Validated {sample_size} audio files")
    print(f"  Valid: {valid_count}")
    print(f"  Invalid: {invalid_count}")
    
    if audio_issues:
        print(f"⚠ Found {len(audio_issues)} audio issues:")
        for issue in audio_issues[:10]:
            print(f"  - {issue}")
        if len(audio_issues) > 10:
            print(f"  ... and {len(audio_issues) - 10} more")
    print()
    
    # Validate features
    print("Validating feature extraction...")
    feature_issues = []
    feature_sample_size = min(20, len(all_wavs))
    
    for i, (utt_id, wav_rel) in enumerate(list(all_wavs.items())[:feature_sample_size], 1):
        audio_path = archive / wav_rel
        
        if not audio_path.exists():
            continue
        
        is_valid, error = validate_features(audio_path)
        
        if not is_valid:
            feature_issues.append(f"{utt_id}: {error}")
        
        if i % 5 == 0:
            print(f"  Validated {i}/{feature_sample_size} feature extractions...")
    
    if feature_issues:
        print(f"⚠ Found {len(feature_issues)} feature issues:")
        for issue in feature_issues:
            print(f"  - {issue}")
    else:
        print("✓ All feature extractions valid")
    print()
    
    # Summary
    print("=" * 80)
    print("Validation Summary")
    print("=" * 80)
    print(f"Total Samples:     {len(all_wavs)}")
    print(f"Train Samples:     {len(train_wavs)}")
    print(f"Test Samples:      {len(test_wavs)}")
    print(f"Labeled Samples:   {len(scores)}")
    print()
    print(f"Label Issues:      {len(label_issues)}")
    print(f"Audio Issues:      {len(audio_issues)} (from {sample_size} validated)")
    print(f"Feature Issues:    {len(feature_issues)} (from {feature_sample_size} validated)")
    print()
    
    if len(label_issues) == 0 and len(audio_issues) == 0 and len(feature_issues) == 0:
        print("✅ Dataset validation PASSED - Ready for training!")
    else:
        print("⚠️  Dataset validation found issues - Review before training")
    print()


if __name__ == "__main__":
    main()
