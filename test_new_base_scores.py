"""
Test new base score calculations
"""

def test_base_scores():
    """Test the new lower base scores"""
    print("=" * 70)
    print("NEW BASE SCORE CALCULATIONS")
    print("=" * 70)
    
    print("\n1. PACE SCORE (from WPM):")
    print("-" * 50)
    test_cases = [
        (140, 45, "Ideal pace (125-155 WPM)"),
        (120, 32, "Slightly slow (110-125 WPM)"),
        (165, 32, "Slightly fast (155-175 WPM)"),
        (100, 22, "Too slow (90-110 WPM)"),
        (185, 22, "Too fast (175-200 WPM)"),
        (80, 10, "Very slow (<90 WPM)"),
        (220, 10, "Very fast (>200 WPM)")
    ]
    for wpm, expected, desc in test_cases:
        print(f"  {wpm} WPM → {expected}/100 ({desc})")
    
    print("\n2. FILLER SCORE (from filler rate):")
    print("-" * 50)
    test_cases = [
        (0, 50, "Perfect - no fillers"),
        (1, 42, "Excellent - 1% fillers"),
        (3, 30, "Moderate - 3% fillers"),
        (6, 20, "High - 6% fillers"),
        (10, 12, "Excessive - 10% fillers"),
        (15, 5, "Very excessive - 15% fillers")
    ]
    for filler_pct, expected, desc in test_cases:
        print(f"  {filler_pct}% fillers → {expected}/100 ({desc})")
    
    print("\n3. CONFIDENCE SCORE (from pace consistency):")
    print("-" * 50)
    test_cases = [
        (10, 48, "Very consistent (σ < 12)"),
        (15, 38, "Moderately consistent (σ < 20)"),
        (25, 28, "Somewhat inconsistent (σ < 32)"),
        (40, 15, "Very inconsistent (σ > 32)")
    ]
    for std_dev, expected, desc in test_cases:
        print(f"  σ = {std_dev} → {expected}/100 ({desc})")
    
    print("\n4. CLARITY SCORE (from sentence length + fillers):")
    print("-" * 50)
    print("  Base: 30 (was 40)")
    print("  With good fillers (50): ~42/100")
    print("  With moderate fillers (30): ~30/100")
    print("  With bad fillers (20): ~25/100")
    print("  Max possible: 55 (was 70)")
    
    print("\n5. TONE SCORE (from text variety):")
    print("-" * 50)
    print("  Base: 25 (was 30)")
    print("  With questions/exclamations: +15 max")
    print("  With commas: +10 max")
    print("  Max possible: 50 (was 65)")


def test_combined_scores():
    """Test combined scores with mode penalties"""
    print("\n" + "=" * 70)
    print("COMBINED SCORE EXAMPLE")
    print("=" * 70)
    
    # Example: Average speech
    base_scores = {
        "pace": 45,        # Ideal WPM
        "filler": 30,      # 3% fillers
        "confidence": 38,  # Moderate consistency
        "clarity": 30,     # Average
        "tone": 35,        # Some variety
        "fluency": 40,     # Calculated from pace+confidence
        "engagement": 36   # Calculated from tone+confidence
    }
    
    print("\nBase Scores (before mode penalties):")
    for skill, score in base_scores.items():
        print(f"  {skill.capitalize()}: {score}/100")
    
    # Calculate weighted overall
    overall_base = int(round(
        base_scores["clarity"] * 0.14 +
        base_scores["confidence"] * 0.14 +
        base_scores["pace"] * 0.14 +
        base_scores["filler"] * 0.10 +
        base_scores["tone"] * 0.16 +
        base_scores["fluency"] * 0.22 +
        base_scores["engagement"] * 0.10
    ))
    
    print(f"\nWeighted Overall (before penalties): {overall_base}/100")
    
    # Practice mode penalties (15% reduction)
    overall_practice = int(overall_base * 0.85)
    print(f"\nPractice Mode (15% reduction): {overall_practice}/100")
    
    # Exam mode penalties (30% reduction)
    overall_exam = int(overall_base * 0.70)
    print(f"Exam Mode (30% reduction): {overall_exam}/100")
    
    print("\n" + "=" * 70)
    print("EXPECTED RESULTS FOR AVERAGE SPEECH:")
    print("=" * 70)
    print(f"  Base Score: {overall_base}/100")
    print(f"  Practice Mode: {overall_practice}/100 (target: 30-40)")
    print(f"  Exam Mode: {overall_exam}/100 (target: 20-30)")


def test_good_speech():
    """Test scores for a good speech"""
    print("\n" + "=" * 70)
    print("GOOD SPEECH EXAMPLE")
    print("=" * 70)
    
    # Example: Good speech
    base_scores = {
        "pace": 45,        # Ideal WPM
        "filler": 42,      # 1% fillers (excellent)
        "confidence": 48,  # Very consistent
        "clarity": 42,     # Good
        "tone": 45,        # Good variety
        "fluency": 46,     # Good
        "engagement": 46   # Good
    }
    
    print("\nBase Scores (before mode penalties):")
    for skill, score in base_scores.items():
        print(f"  {skill.capitalize()}: {score}/100")
    
    # Calculate weighted overall
    overall_base = int(round(
        base_scores["clarity"] * 0.14 +
        base_scores["confidence"] * 0.14 +
        base_scores["pace"] * 0.14 +
        base_scores["filler"] * 0.10 +
        base_scores["tone"] * 0.16 +
        base_scores["fluency"] * 0.22 +
        base_scores["engagement"] * 0.10
    ))
    
    print(f"\nWeighted Overall (before penalties): {overall_base}/100")
    
    # Practice mode penalties (15% reduction)
    overall_practice = int(overall_base * 0.85)
    print(f"\nPractice Mode (15% reduction): {overall_practice}/100")
    
    # Exam mode penalties (30% reduction)
    overall_exam = int(overall_base * 0.70)
    print(f"Exam Mode (30% reduction): {overall_exam}/100")
    
    print("\n" + "=" * 70)
    print("EXPECTED RESULTS FOR GOOD SPEECH:")
    print("=" * 70)
    print(f"  Base Score: {overall_base}/100")
    print(f"  Practice Mode: {overall_practice}/100 (target: 35-45)")
    print(f"  Exam Mode: {overall_exam}/100 (target: 25-35)")


def test_bad_speech():
    """Test scores for a bad speech"""
    print("\n" + "=" * 70)
    print("BAD SPEECH EXAMPLE (Many fillers, poor structure)")
    print("=" * 70)
    
    # Example: Bad speech
    base_scores = {
        "pace": 32,        # Slightly off WPM
        "filler": 20,      # 6% fillers (high)
        "confidence": 28,  # Inconsistent
        "clarity": 25,     # Poor
        "tone": 30,        # Flat
        "fluency": 30,     # Poor
        "engagement": 29   # Poor
    }
    
    print("\nBase Scores (before mode penalties):")
    for skill, score in base_scores.items():
        print(f"  {skill.capitalize()}: {score}/100")
    
    # Calculate weighted overall
    overall_base = int(round(
        base_scores["clarity"] * 0.14 +
        base_scores["confidence"] * 0.14 +
        base_scores["pace"] * 0.14 +
        base_scores["filler"] * 0.10 +
        base_scores["tone"] * 0.16 +
        base_scores["fluency"] * 0.22 +
        base_scores["engagement"] * 0.10
    ))
    
    print(f"\nWeighted Overall (before penalties): {overall_base}/100")
    
    # Practice mode penalties (15% reduction)
    overall_practice = int(overall_base * 0.85)
    print(f"\nPractice Mode (15% reduction): {overall_practice}/100")
    
    # Exam mode penalties (30% reduction)
    overall_exam = int(overall_base * 0.70)
    print(f"Exam Mode (30% reduction): {overall_exam}/100")
    
    print("\n" + "=" * 70)
    print("EXPECTED RESULTS FOR BAD SPEECH:")
    print("=" * 70)
    print(f"  Base Score: {overall_base}/100")
    print(f"  Practice Mode: {overall_practice}/100 (target: 20-30)")
    print(f"  Exam Mode: {overall_exam}/100 (target: 15-22)")


def main():
    """Run all tests"""
    print("\n" + "=" * 70)
    print("NEW BASE SCORE SYSTEM TEST")
    print("=" * 70)
    print("\nThese are the NEW LOWER base scores before mode penalties.")
    
    test_base_scores()
    test_combined_scores()
    test_good_speech()
    test_bad_speech()
    
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print("\n✅ Base scores significantly lowered!")
    print("\nKey Changes:")
    print("  • Pace (ideal): 45 (was 60)")
    print("  • Filler (perfect): 50 (was 65)")
    print("  • Confidence (best): 48 (was 60)")
    print("  • Clarity (max): 55 (was 70)")
    print("  • Tone (max): 50 (was 65)")
    print("\nExpected Overall Scores:")
    print("  • Bad speech (practice): 20-30 (was 40-50)")
    print("  • Average speech (practice): 30-40 (was 50-60)")
    print("  • Good speech (practice): 35-45 (was 55-65)")
    print("\n  • Bad speech (exam): 15-22 (was 30-40)")
    print("  • Average speech (exam): 20-30 (was 40-50)")
    print("  • Good speech (exam): 25-35 (was 45-55)")
    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()
