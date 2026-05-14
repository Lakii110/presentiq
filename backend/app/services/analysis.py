from __future__ import annotations

import re
from statistics import mean, pstdev
from typing import Any

# Aligned with frontend SpeechAnalysis.tsx highlighting
DEFAULT_FILLERS = [
    r"\bum\b",
    r"\buh\b",
    r"\blike\b",
    r"\byou know\b",
    r"\bso basically\b",
    r"\bkind of\b",
    r"\bsort of\b",
    r"\bactually\b",
    r"\bbasically\b",
]


def _word_count(text: str) -> int:
    return len(re.findall(r"\b[\w']+\b", text.lower()))


def _count_fillers(text: str) -> int:
    t = text.lower()
    total = 0
    for pat in DEFAULT_FILLERS:
        total += len(re.findall(pat, t, flags=re.IGNORECASE))
    return total


def _filler_word_list() -> list[str]:
    return ["um", "uh", "like", "you know", "so basically", "kind of", "sort of", "actually", "basically"]


def _generate_practice_filler_insight(filler_skill: int, fillers: int, words: int, filler_rate_pct: float) -> dict[str, str]:
    """Friendly, encouraging feedback for practice mode"""
    if filler_skill >= 85:
        return {
            "type": "strength",
            "text": f"Excellent work! 🎉 You only used {fillers} filler word{'s' if fillers != 1 else ''} in {words} words ({filler_rate_pct}% rate). This is well below average! Your pauses sound intentional and confident. Keep up this great habit!",
        }
    elif filler_skill >= 70:
        return {
            "type": "weakness",
            "text": f"You used {fillers} filler word{'s' if fillers != 1 else ''} in {words} words ({filler_rate_pct}% rate). Don't worry—this is common! Try this: when you feel 'um' or 'like' coming, pause for 1 second instead. Silence sounds more confident than fillers. Practice this daily and you'll see improvement!",
        }
    else:
        return {
            "type": "weakness",
            "text": f"You used {fillers} fillers in {words} words ({filler_rate_pct}% rate). Let's work on this together! Here's a simple exercise: record yourself for 5 minutes daily and count your fillers. Each week, try to reduce them by half. You've got this! 💪",
        }


def _generate_exam_filler_insight(filler_skill: int, fillers: int, words: int, filler_rate_pct: float) -> dict[str, str]:
    """Strict, formal examiner-style feedback"""
    if filler_skill >= 85:
        return {
            "type": "strength",
            "text": f"Filler word control: Excellent. {fillers} instances detected in {words} words ({filler_rate_pct}% rate). Demonstrates professional speech habits.",
        }
    elif filler_skill >= 70:
        return {
            "type": "weakness",
            "text": f"Filler word usage: Moderate concern. {fillers} instances in {words} words ({filler_rate_pct}% rate). Undermines professional credibility. Requires improvement.",
        }
    else:
        return {
            "type": "weakness",
            "text": f"Filler word usage: Significant issue. {fillers} instances in {words} words ({filler_rate_pct}% rate). Severely impacts presentation quality. Immediate remediation required.",
        }


def _generate_practice_pacing_insight(pacing: int, avg_wpm: int) -> dict[str, str]:
    """Friendly pacing feedback for practice mode"""
    if pacing >= 85:
        return {
            "type": "strength",
            "text": f"Perfect pacing! 🎯 You're speaking at {int(avg_wpm)} words per minute—right in the sweet spot of 130-160 WPM. Your audience can easily follow along without feeling rushed or bored. This is exactly where you want to be!",
        }
    elif pacing >= 70:
        return {
            "type": "suggestion",
            "text": f"Your pace of {int(avg_wpm)} WPM is pretty good! Here's a tip to make it even better: try slowing down by 10-15% when introducing new concepts. Pause for 2 seconds after important points—it gives your audience time to absorb the information. You're almost there!",
        }
    else:
        if avg_wpm > 170:
            advice = "You're speaking too quickly—slow down and breathe! Mark your script with pause indicators and practice reading aloud at a deliberate pace."
        else:
            advice = "You're speaking too slowly—try to maintain more energy and momentum. Practice with a timer to build up your natural pace."
        return {
            "type": "weakness",
            "text": f"Your pacing of {int(avg_wpm)} WPM needs adjustment. {advice} With practice, you'll find your rhythm!",
        }


def _generate_exam_pacing_insight(pacing: int, avg_wpm: int) -> dict[str, str]:
    """Strict pacing feedback for exam mode"""
    if pacing >= 85:
        return {
            "type": "strength",
            "text": f"Pacing: Optimal. {int(avg_wpm)} WPM falls within acceptable range (130-160 WPM). Demonstrates effective speech control.",
        }
    elif pacing >= 70:
        return {
            "type": "suggestion",
            "text": f"Pacing: Acceptable with reservations. {int(avg_wpm)} WPM. Requires refinement for professional contexts. Recommend strategic pausing after key points.",
        }
    else:
        return {
            "type": "weakness",
            "text": f"Pacing: Unsatisfactory. {int(avg_wpm)} WPM. {'Excessively rapid delivery impairs comprehension.' if avg_wpm > 170 else 'Insufficient momentum reduces audience engagement.'} Significant improvement required.",
        }


def _generate_practice_clarity_insight(clarity: int) -> dict[str, str]:
    """Friendly clarity feedback"""
    if clarity >= 82:
        return {
            "type": "strength",
            "text": f"Your clarity is fantastic! 🌟 Scoring {clarity}%, your sentences are well-structured and easy to follow. You're communicating ideas in a way that anyone can understand. Keep using short, punchy sentences—they work great in spoken delivery!",
        }
    elif clarity >= 65:
        return {
            "type": "weakness",
            "text": f"Your clarity scored {clarity}%—there's room to improve! Some sentences might be too long or complex. Try the 'one idea per sentence' rule: if a sentence has more than 20 words, split it. Your audience will thank you for making it easier to follow!",
        }
    else:
        return {
            "type": "weakness",
            "text": f"Let's work on clarity (scored {clarity}%). Long, complex sentences are hard to follow when spoken. Here's what to do: rewrite your key points as simple, direct statements. Practice reading them aloud—if you get confused, your audience will too. Simplify and you'll shine!",
        }


def _generate_exam_clarity_insight(clarity: int) -> dict[str, str]:
    """Strict clarity feedback"""
    if clarity >= 82:
        return {
            "type": "strength",
            "text": f"Clarity: Strong. {clarity}%. Sentence structure demonstrates effective communication principles. Maintains audience comprehension.",
        }
    elif clarity >= 65:
        return {
            "type": "weakness",
            "text": f"Clarity: Below standard. {clarity}%. Sentence complexity impedes understanding. Requires structural simplification.",
        }
    else:
        return {
            "type": "weakness",
            "text": f"Clarity: Poor. {clarity}%. Speech structure significantly impairs message delivery. Fundamental revision necessary.",
        }


def _generate_practice_confidence_insight(confidence: int) -> dict[str, str]:
    """Friendly confidence feedback"""
    if confidence >= 82:
        return {
            "type": "strength",
            "text": f"You sound confident! 💪 Scoring {confidence}%, your delivery was steady and assured throughout. Your consistent rhythm signals authority to your audience. This is the energy to maintain—you're doing great!",
        }
    elif confidence >= 65:
        return {
            "type": "suggestion",
            "text": f"Your confidence scored {confidence}%—you're getting there! Your delivery had some energy variations. Here's a tip: try recording yourself standing up—posture directly affects vocal confidence. Aim for a steady, even rhythm. You've got the potential!",
        }
    else:
        return {
            "type": "weakness",
            "text": f"Let's boost that confidence (scored {confidence}%)! Your delivery showed significant variation in energy. This often happens when we're nervous. Try this: practice your opening 30 seconds until it feels completely natural. A strong start builds momentum for everything else. You can do this!",
        }


def _generate_exam_confidence_insight(confidence: int) -> dict[str, str]:
    """Strict confidence feedback"""
    if confidence >= 82:
        return {
            "type": "strength",
            "text": f"Confidence: Satisfactory. {confidence}%. Delivery demonstrates consistent vocal control and professional presence.",
        }
    elif confidence >= 65:
        return {
            "type": "suggestion",
            "text": f"Confidence: Marginal. {confidence}%. Inconsistent delivery energy suggests inadequate preparation. Requires practice.",
        }
    else:
        return {
            "type": "weakness",
            "text": f"Confidence: Unsatisfactory. {confidence}%. Significant variation in delivery indicates poor command of material. Extensive preparation required.",
        }


def _generate_practice_tone_insight(tone: int) -> dict[str, str]:
    """Friendly tone feedback"""
    if tone >= 78:
        return {
            "type": "strength",
            "text": f"Great vocal variety! 🎵 Scoring {tone}%, you're using pitch and emphasis effectively to keep listeners engaged. Varying your tone shows what's important and prevents monotony. This is a key skill—keep it up!",
        }
    else:
        return {
            "type": "suggestion",
            "text": f"Your tone variation scored {tone}%—let's add more energy! Your delivery might sound flat in places. Try this: emphasize 2-3 key words per sentence by raising your pitch slightly. Reading poetry or dramatic text aloud is a fun way to develop vocal range. Give it a try!",
        }


def _generate_exam_tone_insight(tone: int) -> dict[str, str]:
    """Strict tone feedback"""
    if tone >= 78:
        return {
            "type": "strength",
            "text": f"Tone variation: Adequate. {tone}%. Demonstrates appropriate vocal modulation for professional presentation.",
        }
    else:
        return {
            "type": "suggestion",
            "text": f"Tone variation: Insufficient. {tone}%. Monotone delivery reduces audience engagement. Vocal modulation training recommended.",
        }


def _segment_wpm(seg: dict[str, float | str], duration_floor: float = 0.4) -> float:
    text = str(seg["text"])
    start = float(seg["start"])
    end = float(seg["end"])
    dur = max(end - start, duration_floor)
    wc = max(_word_count(text), 1)
    return wc / (dur / 60.0)


def _pace_score_from_wpm(wpm: float) -> int:
    """VERY STRICT pacing — ideal band 125-155 WPM, heavy penalties outside."""
    if wpm <= 0:
        return 15  # Changed from 20 to 15
    if 125 <= wpm <= 155:
        return 45  # Changed from 60 to 45 - even ideal pace gets lower score
    if 110 <= wpm < 125 or 155 < wpm <= 175:
        return 32  # Changed from 45 to 32
    if 90 <= wpm < 110 or 175 < wpm <= 200:
        return 22  # Changed from 30 to 22
    if wpm < 90:
        return max(10, int(15 + (wpm / 90) * 10))  # Changed from 15/20/15 to 10/15/10
    return max(10, int(22 - min((wpm - 200) / 4, 12)))  # Changed from 15/30/15 to 10/22/12


def _filler_score(filler_count: int, words: int) -> int:
    """VERY STRICT filler scoring — even perfect speech doesn't get high scores."""
    if words <= 0:
        return 25  # Changed from 30 to 25
    rate = filler_count / words
    if rate == 0:
        return 50  # Changed from 65 to 50 - even perfect gets only 50
    if rate <= 0.01:
        return 42  # Changed from 55 to 42
    if rate <= 0.03:
        return 30  # Changed from 40 to 30
    if rate <= 0.06:
        return 20  # Changed from 28 to 20
    if rate <= 0.10:
        return 12  # Changed from 18 to 12
    return max(5, int(12 - rate * 150))  # Changed from 10/18 to 5/12


def _clarity_score(avg_sentence_len: float, filler_score: int) -> int:
    """VERY STRICT clarity — starts at 30, earns up based on sentence length and filler control."""
    base = 30  # Changed from 40 to 30
    if avg_sentence_len > 30:
        base -= 18  # Increased penalty from 22 to 18 (but base is lower)
    elif avg_sentence_len > 24:
        base -= 12  # Increased penalty from 14 to 12
    elif avg_sentence_len > 18:
        base -= 6  # Keep at 6
    # Filler score drags clarity down significantly
    base = int(base * 0.45 + filler_score * 0.55)
    return max(12, min(55, base))  # Changed max from 70 to 55


def _confidence_score(wpm_values: list[float], duration_sec: float = 0) -> int:
    """VERY STRICT confidence — penalises very short speeches and high variance."""
    # Very short speech penalty — can't assess confidence from <30 seconds
    if duration_sec < 30:
        return max(15, int(15 + (duration_sec / 30) * 12))  # Changed from 20/20/15 to 15/15/12
    if len(wpm_values) < 3:
        return 28  # Changed from 35 to 28
    sd = pstdev(wpm_values)
    if sd < 12:
        return 48  # Changed from 60 to 48
    if sd < 20:
        return 38  # Changed from 48 to 38
    if sd < 32:
        return 28  # Changed from 35 to 28
    return max(15, int(28 - (sd - 32) * 0.8))  # Changed from 20/35 to 15/28


def _tone_proxy_score(text: str) -> int:
    """VERY STRICT tone — starts at 30, earns up with variety cues."""
    n = max(len(text), 1)
    q = text.count("?") + text.count("!")
    # Commas indicate natural pauses and rhythm
    commas = text.count(",")
    ratio_q = q / (n / 80.0)
    ratio_c = commas / (n / 60.0)
    score = 25 + min(int(ratio_q * 6), 15) + min(int(ratio_c * 2), 10)  # Changed from 30/8/20/3/15 to 25/6/15/2/10
    return max(20, min(50, score))  # Changed from 25/65 to 20/50


def _eye_contact_proxy(overall: int) -> int:
    """Audio-only: cannot measure eye contact; soft proxy for UI continuity."""
    return max(25, min(50, overall - 12))  # Changed from 30/65/-10 to 25/50/-12


def _timeline_from_segments(segments: list[dict[str, float | str]]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    prev_end = 0.0
    for i, seg in enumerate(segments):
        start = float(seg["start"])
        end = float(seg["end"])
        text = str(seg["text"])
        pause_before = start - prev_end
        fillers_here = _count_fillers(text)
        wpm = _segment_wpm(seg)

        if pause_before >= 1.2 and i > 0:
            out.append(
                {
                    "start": round(prev_end, 2),
                    "end": round(start, 2),
                    "type": "pause",
                    "label": "Strategic pause" if pause_before < 2.5 else "Long pause",
                }
            )

        if fillers_here >= 2 or (fillers_here == 1 and _word_count(text) < 12):
            seg_type = "filler"
            label = "Filler words detected"
        elif wpm > 195:
            seg_type = "fast"
            label = "Fast pacing"
        elif wpm < 85 and _word_count(text) > 6:
            seg_type = "slow"
            label = "Slow pacing"
        else:
            seg_type = "strong"
            label = "Clear delivery"

        out.append({"start": round(start, 2), "end": round(end, 2), "type": seg_type, "label": label})
        prev_end = end
    return out


def _sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p for p in parts if p]


def build_analysis_payload(
    segments: list[dict[str, float | str]],
    duration_sec: float,
    whisper_model: str,
    language: str | None,
    mode: str = "practice",
    ml_fluency: int | None = None,
    ml_tone: int | None = None,
    ml_engagement: int | None = None,
) -> dict[str, Any]:
    full_text = " ".join(str(s["text"]) for s in segments).strip()
    words = _word_count(full_text)
    fillers = _count_fillers(full_text)
    wpm_global = (words / (duration_sec / 60.0)) if duration_sec > 0.5 else float(words)

    wpm_per_seg = [_segment_wpm(s) for s in segments] if segments else [wpm_global]
    pacing = _pace_score_from_wpm(float(mean(wpm_per_seg)) if wpm_per_seg else wpm_global)
    filler_skill = _filler_score(fillers, max(words, 1))

    sents = _sentences(full_text)
    avg_len = mean(len(s.split()) for s in sents) if sents else words
    clarity = _clarity_score(float(avg_len), filler_skill)
    confidence = _confidence_score(wpm_per_seg, duration_sec)
    tone = int(ml_tone) if ml_tone is not None else _tone_proxy_score(full_text)
    fluency = int(ml_fluency) if ml_fluency is not None else int(round((pacing * 0.55 + confidence * 0.45)))
    engagement = int(ml_engagement) if ml_engagement is not None else int(round((tone * 0.6 + confidence * 0.4)))

    # Weighted overall — ML fluency/tone where available, plus delivery skills
    overall = int(round(
        clarity * 0.14 +
        confidence * 0.14 +
        pacing * 0.14 +
        filler_skill * 0.10 +
        tone * 0.16 +
        fluency * 0.22 +
        engagement * 0.10
    ))
    
    # MODE-SPECIFIC PENALTIES
    # PRACTICE MODE: Moderate penalties (12-18% reduction)
    # EXAM MODE: VERY STRICT penalties (25-35% reduction)
    if mode == "exam":
        # Exam mode is VERY STRICT - reduce all scores significantly
        overall = int(overall * 0.70)  # 30% reduction
        clarity = int(clarity * 0.75)  # 25% reduction
        confidence = int(confidence * 0.72)  # 28% reduction
        pacing = int(pacing * 0.75)  # 25% reduction
        filler_skill = int(filler_skill * 0.65)  # 35% reduction (fillers are critical in exams)
        tone = int(tone * 0.75)  # 25% reduction
        fluency = int(fluency * 0.70)  # 30% reduction
        engagement = int(engagement * 0.75)  # 25% reduction
    else:
        # Practice mode: Moderate penalties (12-18% reduction)
        overall = int(overall * 0.85)  # 15% reduction
        clarity = int(clarity * 0.88)  # 12% reduction
        confidence = int(confidence * 0.85)  # 15% reduction
        pacing = int(pacing * 0.88)  # 12% reduction
        filler_skill = int(filler_skill * 0.82)  # 18% reduction
        tone = int(tone * 0.88)  # 12% reduction
        fluency = int(fluency * 0.85)  # 15% reduction
        engagement = int(engagement * 0.88)  # 12% reduction

    skills = [
        {
            "skill": "Clarity",
            "value": clarity,
            "tip": "Shorten long sentences and define acronyms once."
            if clarity < 75
            else "Good structure — keep one idea per sentence.",
        },
        {
            "skill": "Confidence",
            "value": confidence,
            "tip": "Practice steady pacing between points to sound more assured."
            if confidence < 75
            else "Nice steady rhythm across segments.",
        },
        {
            "skill": "Pacing",
            "value": pacing,
            "tip": "Aim for ~130–160 WPM and pause briefly after key claims."
            if pacing < 75
            else "Pacing sits in a comfortable range.",
        },
        {
            "skill": "Filler Words",
            "value": filler_skill,
            "tip": "Replace fillers with a 1-second silent pause."
            if filler_skill < 80
            else "Very few filler words detected.",
        },
        {
            "skill": "Tone",
            "value": tone,
            "tip": "Use short rhetorical questions or emphasis words to vary energy."
            if tone < 75
            else "Good variation in sentence energy.",
        },
        {
            "skill": "Fluency",
            "value": fluency,
            "tip": "Reduce long pauses and keep transitions smooth."
            if fluency < 75
            else "Nice flow and continuity across the session.",
        },
        {
            "skill": "Engagement",
            "value": engagement,
            "tip": "Add vocal variety by changing pitch and stressing key words."
            if engagement < 75
            else "Good vocal variety and listener-friendly energy.",
        },
    ]

    timeline = _timeline_from_segments(segments)
    transcript = [
        {
            "timeline_idx": i,
            "text": str(s["text"]),
            "start": round(float(s["start"]), 2),
            "end": round(float(s["end"]), 2),
        }
        for i, s in enumerate(segments)
    ]

    insights: list[dict[str, str]] = []

    # Generate mode-specific insights
    is_practice = mode == "practice"
    
    # ── Filler words insight ──
    filler_rate_pct = round((fillers / max(words, 1)) * 100, 1)
    if is_practice:
        insights.append(_generate_practice_filler_insight(filler_skill, fillers, words, filler_rate_pct))
    else:
        insights.append(_generate_exam_filler_insight(filler_skill, fillers, words, filler_rate_pct))

    # ── Pacing insight ──
    avg_wpm = round(float(mean(wpm_per_seg)) if wpm_per_seg else wpm_global, 0)
    if is_practice:
        insights.append(_generate_practice_pacing_insight(pacing, avg_wpm))
    else:
        insights.append(_generate_exam_pacing_insight(pacing, avg_wpm))

    # ── Clarity insight ──
    if is_practice:
        insights.append(_generate_practice_clarity_insight(clarity))
    else:
        insights.append(_generate_exam_clarity_insight(clarity))

    # ── Confidence insight ──
    if is_practice:
        insights.append(_generate_practice_confidence_insight(confidence))
    else:
        insights.append(_generate_exam_confidence_insight(confidence))

    # ── Tone insight ──
    if is_practice:
        insights.append(_generate_practice_tone_insight(tone))
    else:
        insights.append(_generate_exam_tone_insight(tone))

    # ── Overall coaching suggestion (Practice mode only) ──
    if is_practice:
        weakest = min(skills, key=lambda s: s["value"])
        insights.append({
            "type": "suggestion",
            "text": f"Your biggest growth opportunity is {weakest['skill']} ({weakest['value']}%). {weakest['tip']} Focus your next 3 practice sessions specifically on this skill—targeted practice compounds faster than general practice. You're making progress! 🚀",
        })
    else:
        # Exam mode: Brief overall assessment
        weakest = min(skills, key=lambda s: s["value"])
        insights.append({
            "type": "suggestion",
            "text": f"Primary deficiency: {weakest['skill']} ({weakest['value']}%). Requires focused remediation.",
        })

    summary = _build_summary(overall, skills, fillers, max(words, 1), duration_sec, mode)

    return {
        "overall_score": max(0, min(100, overall)),
        "total_duration_sec": round(float(duration_sec), 2),
        "skills": skills,
        "timeline_segments": timeline,
        "transcript_segments": transcript,
        "insights": insights[:6],
        "filler_words": _filler_word_list(),
        "language": language,
        "whisper_model": whisper_model,
        "summary": summary,
    }


def _build_summary(
    overall: int,
    skills: list[dict],
    fillers: int,
    words: int,
    duration_sec: float,
    mode: str = "practice",
) -> str:
    sorted_skills = sorted(skills, key=lambda s: s["value"], reverse=True)
    top = sorted_skills[0] if sorted_skills else None
    weak = sorted_skills[-1] if sorted_skills else None
    duration_min = round(duration_sec / 60, 1)
    filler_rate = round((fillers / max(words, 1)) * 100, 1)

    if mode == "practice":
        # Natural, conversational feedback like a friendly professor
        
        # Opening based on overall performance
        if overall >= 85:
            opening = f"I really enjoyed listening to your {duration_min} minute presentation! You scored {overall} out of 100, which shows you've developed some excellent speaking habits. "
        elif overall >= 75:
            opening = f"Nice work on your {duration_min} minute speech! You earned {overall} out of 100, and I can see you're making solid progress. "
        elif overall >= 65:
            opening = f"Thanks for sharing your {duration_min} minute presentation with me. You scored {overall} out of 100, which is a good foundation to build on. "
        elif overall >= 50:
            opening = f"I appreciate you practicing with this {duration_min} minute speech. You got {overall} out of 100, and there's definitely room to grow here. "
        else:
            opening = f"Thank you for working through this {duration_min} minute practice session. You scored {overall} out of 100. Don't worry, everyone starts somewhere, and the fact that you're practicing means you're already improving! "

        # Strength recognition
        if top and top["value"] >= 80:
            strength = f"What really stood out to me was your {top['skill'].lower()}, which scored {top['value']}%. That's genuinely impressive and something you should feel confident about. "
        elif top and top["value"] >= 70:
            strength = f"I noticed your {top['skill'].lower()} was your strongest area at {top['value']}%. You're doing well there, so keep that up. "
        elif top and top["value"] >= 60:
            strength = f"Your best area was {top['skill'].lower()} at {top['value']}%. It's not perfect yet, but it's heading in the right direction. "
        else:
            strength = ""

        # Constructive feedback on weakness
        if weak and weak["value"] < 50:
            weakness = f"Now, let's talk about {weak['skill'].lower()}, which came in at {weak['value']}%. This needs some attention. {weak['tip']} I'd suggest focusing your next few practice sessions specifically on this. "
        elif weak and weak["value"] < 65:
            weakness = f"The area that needs the most work is {weak['skill'].lower()} at {weak['value']}%. {weak['tip']} Try dedicating some time to this in your next practice. "
        elif weak and weak["value"] < 75:
            weakness = f"If I had to pick one thing to improve, it would be {weak['skill'].lower()} at {weak['value']}%. {weak['tip']} "
        else:
            weakness = ""

        # Specific filler word feedback if relevant
        if fillers > 0 and filler_rate > 5:
            filler_feedback = f"I also noticed you used {fillers} filler words throughout your speech, which works out to about {filler_rate}% of what you said. That's pretty common when we're nervous or thinking on our feet. Try replacing those 'ums' and 'likes' with a brief pause instead. Silence actually sounds more confident than fillers. "
        elif fillers > 0 and filler_rate > 3:
            filler_feedback = f"You had {fillers} filler words in there, which is about {filler_rate}% of your speech. Not bad, but there's room to clean that up. When you feel an 'um' coming, just pause for a second instead. "
        elif fillers > 0:
            filler_feedback = f"You only used {fillers} filler words, which is excellent control! "
        else:
            filler_feedback = ""

        # Encouraging closing
        if overall >= 85:
            closing = "You're doing really well. Keep practicing regularly, and you'll maintain this high level of performance."
        elif overall >= 75:
            closing = "You're on the right track. With consistent practice, you'll see steady improvement."
        elif overall >= 65:
            closing = "Keep at it! Regular practice is what makes the difference, and you're building good habits."
        elif overall >= 50:
            closing = "Don't get discouraged. Every great speaker started where you are now. The key is to keep practicing and focus on one skill at a time."
        else:
            closing = "Remember, improvement comes from consistent practice. Pick one area to work on, practice it for a week, then move to the next. You've got this!"

        return f"{opening}{strength}{weakness}{filler_feedback}{closing}".strip()
    
    else:
        # Exam mode: Brief, direct feedback (same as photo but without colons)
        
        # Performance level
        if overall >= 85:
            perf = f"Performance is excellent. "
        elif overall >= 75:
            perf = f"Performance is good. "
        elif overall >= 65:
            perf = f"Performance is satisfactory. "
        else:
            perf = f"Performance is below standard. "
        
        # Score and duration
        score_info = f"Score is {overall} out of 100. Duration is {duration_min} minutes. "
        
        # Strongest area
        if top:
            strength = f"Strongest competency is {top['skill']} at {top['value']}%. "
        else:
            strength = ""
        
        # Weakness
        if weak and weak["value"] < 75:
            weakness = f"Primary deficiency is {weak['skill']} at {weak['value']}%. "
        else:
            weakness = ""
        
        # Remediation note
        if overall < 75 or (weak and weak["value"] < 70):
            remedy = "Remediation required."
        else:
            remedy = "Continue practicing to maintain standards."
        
        return f"{perf}{score_info}{strength}{weakness}{remedy}".strip()
