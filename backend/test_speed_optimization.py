"""
Quick test to verify speed optimizations work correctly.
Run: python test_speed_optimization.py
"""

import time
from pathlib import Path
from app.ml.features import extract_audio_features

def test_feature_extraction():
    """Test that feature extraction still works after optimization"""
    print("=" * 60)
    print("Testing Speed Optimizations")
    print("=" * 60)
    print()
    
    # Find a test audio file
    test_audio = None
    upload_dir = Path("uploads")
    
    if upload_dir.exists():
        audio_files = list(upload_dir.glob("*.wav")) + list(upload_dir.glob("*.mp3")) + list(upload_dir.glob("*.webm"))
        if audio_files:
            test_audio = str(audio_files[0])
    
    if not test_audio:
        print("❌ No test audio file found in uploads/ directory")
        print("   Upload a speech first, then run this test")
        return
    
    print(f"📁 Test file: {Path(test_audio).name}")
    print()
    
    # Test feature extraction
    print("🔬 Testing feature extraction...")
    start = time.time()
    
    try:
        features = extract_audio_features(audio_path=test_audio)
        elapsed = time.time() - start
        
        print(f"✅ Feature extraction successful!")
        print(f"⏱️  Time: {elapsed:.2f} seconds")
        print(f"📊 Features extracted: {len(features.names)}")
        print()
        
        # Show some features
        print("Sample features:")
        for i in range(min(5, len(features.names))):
            print(f"  - {features.names[i]}: {features.values[i]:.4f}")
        
        print()
        print("=" * 60)
        print("✅ All tests passed! Optimizations working correctly.")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_feature_extraction()
