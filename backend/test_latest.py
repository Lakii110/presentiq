import os
from app.services.transcription import transcribe_audio

# Test the most recent upload
path = "data/uploads/24.mp3"
size_mb = os.path.getsize(path) / 1024 / 1024
print(f"File: {path}, Size: {size_mb:.2f} MB")

segs, dur, meta = transcribe_audio(path)
print(f"Duration: {dur:.1f}s ({dur/60:.1f} min)")
print(f"Segments: {len(segs)}")
print(f"Language: {meta.get('language')}")
total_words = sum(len(s['text'].split()) for s in segs)
print(f"Total words: {total_words}")
print("\nAll segments:")
for s in segs:
    print(f"  {s['start']:.1f}-{s['end']:.1f}s: {s['text']}")
