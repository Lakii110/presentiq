import os
from app.services.transcription import transcribe_audio

files = os.listdir("data/uploads")
print("Files:", files)
if files:
    f = "data/uploads/" + files[0]
    print("Testing:", f)
    segs, dur, meta = transcribe_audio(f)
    print(f"Duration: {dur:.1f}s, Segments: {len(segs)}")
    for s in segs[:5]:
        print(f"  {s['start']:.1f}-{s['end']:.1f}: {s['text'][:100]}")
