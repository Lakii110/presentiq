"""
Test transcription directly to see what Whisper produces
"""
from faster_whisper import WhisperModel

# Test with the uploaded audio
audio_path = "data/uploads/31.mp3"

print("=" * 80)
print("Testing Whisper Transcription")
print("=" * 80)
print(f"Audio file: {audio_path}")
print()

# Try different model sizes
for model_size in ["small", "medium"]:
    print(f"\n{'='*80}")
    print(f"Model: {model_size}")
    print(f"{'='*80}")
    
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    
    # Transcribe without VAD
    segments, info = model.transcribe(
        audio_path,
        beam_size=5,
        best_of=5,
        temperature=[0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
        vad_filter=False,
        word_timestamps=True,
        language="en",
    )
    
    print(f"Duration: {info.duration:.2f}s")
    print(f"Language: {info.language} (probability: {info.language_probability:.2f})")
    print()
    print("Segments:")
    
    for i, segment in enumerate(segments, 1):
        print(f"  {i}. [{segment.start:.2f}s - {segment.end:.2f}s]")
        print(f"     Text: '{segment.text.strip()}'")
        if segment.words:
            print(f"     Words: {len(segment.words)}")
            for word in segment.words:
                print(f"       - [{word.start:.2f}s] '{word.word}'")
        print()
