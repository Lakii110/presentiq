import os
from app.services.transcription import transcribe_audio

# Find the largest file (likely the 20-min speech)
files = [(f, os.path.getsize(f"data/uploads/{f}")) for f in os.listdir("data/uploads")]
files.sort(key=lambda x: x[1], reverse=True)
print("Files by size:")
for f, size in files[:5]:
    print(f"  {f}: {size/1024/1024:.1f} MB")

# Test the largest one
if files:
    fname = files[0][0]
    print(f"\nTesting largest: {fname}")
    segs, dur, meta = transcribe_audio(f"data/uploads/{fname}")
    print(f"Duration: {dur:.1f}s ({dur/60:.1f} min), Segments: {len(segs)}, Language: {meta.get('language')}")
    print("First 3 segments:")
    for s in segs[:3]:
        print(f"  {s['start']:.1f}-{s['end']:.1f}: {s['text'][:100]}")
    print("Last 3 segments:")
    for s in segs[-3:]:
        print(f"  {s['start']:.1f}-{s['end']:.1f}: {s['text'][:100]}")
