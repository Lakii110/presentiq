"""
Enhanced Analysis Pipeline with Complete Speech Evaluation
Flow: Audio → Whisper → Grammar → Pause → Emotion → Filler → Metrics → LLM → Scoring → Report
"""
from __future__ import annotations
import re
from pathlib import Path
from typing import Any
from statistics import mean, pstdev

from app.services.transcription import transcribe_audio
from app.ml.scorer import predict_scores


class GrammarAnalyzer:
    """Analyzes grammar errors and sentence structure."""
    
    def analyze(self, transcript: str, segments: list[dict]) -> dict[str, Any]:
        """Detect grammar issues."""
        sentences = [s.strip() for s in re.split(r'[.!?]+', transcript) if s.strip()]
        
        issues = []
        incomplete_sentences = 0
        repeated_words = 0
        missing_articles = 0
        
        # Check incomplete sentences
        for sent in sentences:
            words = sent.split()
            if len(words) < 3:
                incomplete_sentences += 1
        
        # Check repeated words
        words = transcript.lower().split()
        for i in range(len(words) - 1):
            if words[i] == words[i+1] and len(words[i]) > 3:
                repeated_words += 1
        
        # Check article usage
        articles = len(re.findall(r'\b(a|an|the)\b', transcript.lower()))
        total_words = len(words)
        article_ratio = articles / max(total_words, 1)
        
        if article_ratio < 0.03 and total_words > 50:
            missing_articles = 1
        
        # Calculate grammar score - START LOWER FOR STRICTER SCORING
        grammar_score = 50  # Changed from 85 to 50
        if incomplete_sentences > len(sentences) * 0.3:
            grammar_score -= 30  # Increased penalty from 25 to 30
            issues.append(f"{incomplete_sentences} incomplete sentences detected")
        elif incomplete_sentences > len(sentences) * 0.15:
            grammar_score -= 20  # Increased penalty from 15 to 20
            issues.append(f"{incomplete_sentences} incomplete sentences")
        
        if repeated_words > 5:
            grammar_score -= 20  # Increased penalty from 15 to 20
            issues.append(f"{repeated_words} repeated word sequences")
        elif repeated_words > 2:
            grammar_score -= 12  # Increased penalty from 8 to 12
        
        if missing_articles:
            grammar_score -= 15  # Increased penalty from 10 to 15
            issues.append("Missing articles (a, an, the)")
        
        return {
            "grammar_score": max(20, min(100, grammar_score)),
            "incomplete_sentences": incomplete_sentences,
            "repeated_words": repeated_words,
            "article_ratio": round(article_ratio, 3),
            "issues": issues,
            "total_sentences": len(sentences),
            "avg_sentence_length": round(mean([len(s.split()) for s in sentences]), 1) if sentences else 0
        }


class PauseDetector:
    """Detects and analyzes pauses in speech."""
    
    def detect(self, segments: list[dict]) -> dict[str, Any]:
        """Analyze pause patterns."""
        pauses = []
        total_pause_time = 0
        
        for i in range(len(segments) - 1):
            current_end = float(segments[i].get('end', 0))
            next_start = float(segments[i+1].get('start', 0))
            gap = next_start - current_end
            
            if gap > 0.5:  # Pause threshold
                pause_type = "strategic" if 0.5 <= gap < 2.0 else "long" if gap < 4.0 else "awkward"
                pauses.append({
                    "start": round(current_end, 2),
                    "end": round(next_start, 2),
                    "duration": round(gap, 2),
                    "type": pause_type
                })
                total_pause_time += gap
        
        # Calculate pause metrics
        strategic_pauses = len([p for p in pauses if p["type"] == "strategic"])
        long_pauses = len([p for p in pauses if p["type"] == "long"])
        awkward_pauses = len([p for p in pauses if p["type"] == "awkward"])
        
        # Pause score - START LOWER FOR STRICTER SCORING
        pause_score = 50  # Changed from 75 to 50
        if awkward_pauses > 3:
            pause_score -= 25  # Increased penalty from 20 to 25
        elif awkward_pauses > 1:
            pause_score -= 15  # Increased penalty from 10 to 15
        
        if long_pauses > 5:
            pause_score -= 20  # Increased penalty from 15 to 20
        
        if strategic_pauses < 2 and len(segments) > 10:
            pause_score -= 15  # Increased penalty from 10 to 15
        
        return {
            "pause_score": max(30, min(100, pause_score)),
            "total_pauses": len(pauses),
            "strategic_pauses": strategic_pauses,
            "long_pauses": long_pauses,
            "awkward_pauses": awkward_pauses,
            "total_pause_time": round(total_pause_time, 2),
            "pauses": pauses[:20],  # Limit to first 20
            "issues": [
                f"{awkward_pauses} awkward pauses (>4 seconds)" if awkward_pauses > 0 else None,
                f"{long_pauses} long pauses (2-4 seconds)" if long_pauses > 3 else None,
                "Insufficient strategic pauses" if strategic_pauses < 2 and len(segments) > 10 else None
            ]
        }


class EmotionDetector:
    """Detects emotional tone and engagement from text."""
    
    def detect(self, transcript: str, segments: list[dict]) -> dict[str, Any]:
        """Analyze emotional delivery."""
        # Emotion indicators
        questions = transcript.count('?')
        exclamations = transcript.count('!')
        commas = transcript.count(',')
        words = len(transcript.split())
        
        # Positive/negative word detection
        positive_words = ['great', 'excellent', 'wonderful', 'amazing', 'fantastic', 'good', 'best']
        negative_words = ['bad', 'terrible', 'awful', 'worst', 'poor', 'difficult', 'problem']
        
        positive_count = sum(transcript.lower().count(word) for word in positive_words)
        negative_count = sum(transcript.lower().count(word) for word in negative_words)
        
        # Calculate emotion score - LOWER SCORES FOR STRICTER EVALUATION
        variety_score = (questions * 3 + exclamations * 2 + commas * 0.5) / max(words / 50, 1)
        
        if variety_score > 8:
            emotion_score = 60  # Changed from 80 to 60
            emotion_level = "high"
        elif variety_score > 5:
            emotion_score = 48  # Changed from 68 to 48
            emotion_level = "moderate"
        elif variety_score > 3:
            emotion_score = 35  # Changed from 55 to 35
            emotion_level = "low"
        else:
            emotion_score = 25  # Changed from 40 to 25
            emotion_level = "very_low"
        
        # Adjust for positive/negative balance
        if positive_count > negative_count * 2:
            emotion_score += 5
            tone = "positive"
        elif negative_count > positive_count * 2:
            tone = "negative"
        else:
            tone = "neutral"
        
        return {
            "emotion_score": max(30, min(100, emotion_score)),
            "emotion_level": emotion_level,
            "tone": tone,
            "questions": questions,
            "exclamations": exclamations,
            "positive_words": positive_count,
            "negative_words": negative_count,
            "variety_indicators": round(variety_score, 2),
            "issues": [
                "Monotone delivery - no vocal variety indicators" if emotion_level == "very_low" else None,
                "Low emotional engagement" if emotion_level == "low" else None
            ]
        }



class FillerDetector:
    """Detects filler words and hesitations."""
    
    FILLER_PATTERNS = [
        r"\bum\b", r"\buh\b", r"\blike\b", r"\byou know\b",
        r"\bso basically\b", r"\bkind of\b", r"\bsort of\b",
        r"\bactually\b", r"\bbasically\b", r"\byeah\b", r"\bwell\b",
        r"\bi mean\b", r"\byou see\b", r"\bright\b"
    ]
    
    def detect(self, transcript: str) -> dict[str, Any]:
        """Detect and count filler words."""
        text_lower = transcript.lower()
        
        filler_details = {}
        total_fillers = 0
        
        for pattern in self.FILLER_PATTERNS:
            matches = re.findall(pattern, text_lower, flags=re.IGNORECASE)
            count = len(matches)
            if count > 0:
                filler_word = pattern.replace(r'\b', '').replace('\\', '')
                filler_details[filler_word] = count
                total_fillers += count
        
        words = len(transcript.split())
        filler_rate = (total_fillers / max(words, 1)) * 100
        
        # Calculate filler score - MUCH STRICTER PENALTIES
        if filler_rate == 0:
            filler_score = 70  # Changed from 95 to 70
        elif filler_rate <= 1:
            filler_score = 60  # Changed from 85 to 60
        elif filler_rate <= 3:
            filler_score = 45  # Changed from 70 to 45
        elif filler_rate <= 6:
            filler_score = 30  # Changed from 55 to 30
        elif filler_rate <= 10:
            filler_score = 20  # Changed from 40 to 20
        else:
            filler_score = max(10, int(20 - (filler_rate - 10) * 2))  # Changed from 20/40 to 10/20
        
        # Identify issues
        issues = []
        if filler_rate > 10:
            issues.append(f"Excessive filler words: {total_fillers} instances ({filler_rate:.1f}%)")
        elif filler_rate > 5:
            issues.append(f"High filler word usage: {total_fillers} instances ({filler_rate:.1f}%)")
        elif filler_rate > 2:
            issues.append(f"Moderate filler words: {total_fillers} instances")
        
        # Most used fillers
        top_fillers = sorted(filler_details.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "filler_score": filler_score,
            "total_fillers": total_fillers,
            "filler_rate": round(filler_rate, 2),
            "filler_details": filler_details,
            "top_fillers": [{"word": w, "count": c} for w, c in top_fillers],
            "issues": issues
        }


class SpeechMetricsEngine:
    """Calculates comprehensive speech metrics."""
    
    def calculate(self, transcript: str, segments: list[dict], duration_sec: float) -> dict[str, Any]:
        """Calculate all speech metrics."""
        words = len(re.findall(r"\b[\w']+\b", transcript))
        
        # Speaking rate
        wpm_per_segment = []
        for seg in segments:
            text = str(seg.get("text", ""))
            start = float(seg.get("start", 0))
            end = float(seg.get("end", 0))
            dur = max(end - start, 0.4)
            wc = max(len(text.split()), 1)
            wpm = wc / (dur / 60.0)
            wpm_per_segment.append(wpm)
        
        avg_wpm = mean(wpm_per_segment) if wpm_per_segment else 0
        wpm_std = pstdev(wpm_per_segment) if len(wpm_per_segment) > 1 else 0
        
        # Pace score - LOWER BASE SCORES
        if 130 <= avg_wpm <= 160:
            pace_score = 65  # Changed from 90 to 65
        elif 120 <= avg_wpm < 130 or 160 < avg_wpm <= 170:
            pace_score = 50  # Changed from 75 to 50
        elif 100 <= avg_wpm < 120 or 170 < avg_wpm <= 185:
            pace_score = 35  # Changed from 60 to 35
        else:
            pace_score = 20  # Changed from 40 to 20
        
        # Consistency score - LOWER BASE SCORES
        if wpm_std < 15:
            consistency_score = 60  # Changed from 85 to 60
        elif wpm_std < 25:
            consistency_score = 45  # Changed from 70 to 45
        elif wpm_std < 40:
            consistency_score = 30  # Changed from 55 to 30
        else:
            consistency_score = 20  # Changed from 35 to 20
        
        # Vocabulary diversity
        word_list = re.findall(r"\b[\w']+\b", transcript.lower())
        unique_words = len(set(word_list))
        ttr = unique_words / max(words, 1)  # Type-Token Ratio
        
        if ttr > 0.70:
            vocabulary_score = 65  # Changed from 90 to 65
        elif ttr > 0.60:
            vocabulary_score = 53  # Changed from 78 to 53
        elif ttr > 0.50:
            vocabulary_score = 40  # Changed from 65 to 40
        elif ttr > 0.40:
            vocabulary_score = 28  # Changed from 50 to 28
        else:
            vocabulary_score = 20  # Changed from 35 to 20
        
        return {
            "total_words": words,
            "unique_words": unique_words,
            "lexical_diversity": round(ttr, 3),
            "average_wpm": round(avg_wpm, 1),
            "wpm_std_dev": round(wpm_std, 1),
            "min_wpm": round(min(wpm_per_segment), 1) if wpm_per_segment else 0,
            "max_wpm": round(max(wpm_per_segment), 1) if wpm_per_segment else 0,
            "duration_seconds": round(duration_sec, 1),
            "pace_score": pace_score,
            "consistency_score": consistency_score,
            "vocabulary_score": vocabulary_score,
            "wpm_segments": [round(w, 1) for w in wpm_per_segment]
        }


class LLMEvaluationPrompt:
    """Generates evaluation prompt for LLM-based assessment."""
    
    def generate_prompt(
        self,
        transcript: str,
        grammar_analysis: dict,
        pause_analysis: dict,
        emotion_analysis: dict,
        filler_analysis: dict,
        metrics: dict
    ) -> str:
        """Generate comprehensive evaluation prompt."""
        
        prompt = f"""You are a world-class AI speech and presentation coach trained to evaluate public speaking, IELTS speaking, business presentations, academic speeches, and communication skills at international standards.

Your task is to STRICTLY analyze the user's speech transcript and speech metrics.

You must behave like a harsh but fair professional evaluator.
DO NOT give generic motivational feedback.
DO NOT be overly positive.
DO NOT ignore mistakes.

SPEECH TRANSCRIPT:
{transcript}

SPEECH METRICS:
- Total Words: {metrics['total_words']}
- Unique Words: {metrics['unique_words']}
- Lexical Diversity: {metrics['lexical_diversity']}
- Average WPM: {metrics['average_wpm']}
- WPM Consistency (σ): {metrics['wpm_std_dev']}
- Duration: {metrics['duration_seconds']} seconds

GRAMMAR ANALYSIS:
- Grammar Score: {grammar_analysis['grammar_score']}/100
- Incomplete Sentences: {grammar_analysis['incomplete_sentences']}
- Repeated Words: {grammar_analysis['repeated_words']}
- Average Sentence Length: {grammar_analysis['avg_sentence_length']} words
- Issues: {', '.join(grammar_analysis['issues']) if grammar_analysis['issues'] else 'None'}

PAUSE ANALYSIS:
- Pause Score: {pause_analysis['pause_score']}/100
- Total Pauses: {pause_analysis['total_pauses']}
- Strategic Pauses: {pause_analysis['strategic_pauses']}
- Long Pauses: {pause_analysis['long_pauses']}
- Awkward Pauses: {pause_analysis['awkward_pauses']}

EMOTION & ENGAGEMENT:
- Emotion Score: {emotion_analysis['emotion_score']}/100
- Emotion Level: {emotion_analysis['emotion_level']}
- Tone: {emotion_analysis['tone']}
- Questions: {emotion_analysis['questions']}
- Exclamations: {emotion_analysis['exclamations']}

FILLER WORDS:
- Filler Score: {filler_analysis['filler_score']}/100
- Total Fillers: {filler_analysis['total_fillers']}
- Filler Rate: {filler_analysis['filler_rate']}%
- Top Fillers: {', '.join([f"{f['word']} ({f['count']}x)" for f in filler_analysis['top_fillers']])}

EVALUATION CRITERIA:
1. Fluency (flow, hesitations, natural delivery)
2. Pronunciation (clarity, enunciation)
3. Grammar (sentence structure, errors)
4. Vocabulary (variety, sophistication, repetition)
5. Confidence (consistency, pace control)
6. Engagement (vocal variety, emotional delivery)
7. Speaking pace (ideal: 130-160 WPM)
8. Filler words (should be <2%)
9. Clarity (sentence structure, coherence)
10. Professionalism (overall presentation quality)

STRICT SCORING SCALE:
9-10 (90-100): Expert/native/professional speaker
7-8 (70-89): Strong communicator
5-6 (50-69): Average speaker
3-4 (30-49): Weak speaker
0-2 (0-29): Very poor communication

IMPORTANT RULES:
- Never give high scores easily
- If grammar has many mistakes: score below 60
- If filler words are excessive (>5%): reduce fluency score significantly
- If structure is weak: reduce engagement score
- If pronunciation confidence is low: reduce pronunciation score
- Be harsh but fair - identify ALL issues

Provide your evaluation in the following format:
1. Overall Assessment (2-3 sentences, harsh but fair)
2. Detected Issues (list all problems)
3. Strengths (only if score 75+)
4. Detailed Feedback (for each criterion)
5. Improvement Plan (specific, actionable steps)
6. CEFR Level (A1/A2/B1/B2/C1/C2)
7. IELTS Estimated Band (1.0-9.0)
"""
        return prompt



class StrictFinalScoring:
    """Applies strict final scoring based on all analyses."""
    
    def calculate_final_scores(
        self,
        grammar_analysis: dict,
        pause_analysis: dict,
        emotion_analysis: dict,
        filler_analysis: dict,
        metrics: dict,
        ml_fluency: int | None = None,
        ml_tone: int | None = None
    ) -> dict[str, Any]:
        """Calculate strict final scores."""
        
        # Base scores from analyses
        grammar_score = grammar_analysis['grammar_score']
        pause_score = pause_analysis['pause_score']
        emotion_score = emotion_analysis['emotion_score']
        filler_score = filler_analysis['filler_score']
        pace_score = metrics['pace_score']
        consistency_score = metrics['consistency_score']
        vocabulary_score = metrics['vocabulary_score']
        
        # Fluency (ML or calculated)
        if ml_fluency is not None:
            fluency_score = ml_fluency
        else:
            fluency_score = int(round(
                pace_score * 0.35 +
                consistency_score * 0.30 +
                filler_score * 0.35
            ))
        
        # Penalize fluency for excessive fillers - STRICTER CAPS
        if filler_analysis['filler_rate'] > 10:
            fluency_score = min(fluency_score, 25)  # Changed from 45 to 25
        elif filler_analysis['filler_rate'] > 6:
            fluency_score = min(fluency_score, 40)  # Changed from 60 to 40
        elif filler_analysis['filler_rate'] > 3:
            fluency_score = min(fluency_score, 55)  # Changed from 75 to 55
        
        # Pronunciation (proxy from consistency and clarity)
        pronunciation_score = int(round(
            consistency_score * 0.50 +
            grammar_score * 0.30 +
            vocabulary_score * 0.20
        ))
        
        # Confidence (from consistency and pace)
        confidence_score = int(round(
            consistency_score * 0.60 +
            pause_score * 0.40
        ))
        
        # Engagement (ML or calculated)
        if ml_tone is not None:
            engagement_score = ml_tone
        else:
            engagement_score = int(round(
                emotion_score * 0.70 +
                vocabulary_score * 0.30
            ))
        
        # Overall score (weighted average)
        overall_score = int(round(
            fluency_score * 0.22 +
            pronunciation_score * 0.15 +
            grammar_score * 0.20 +
            vocabulary_score * 0.15 +
            confidence_score * 0.13 +
            engagement_score * 0.15
        ))
        
        # Apply strict penalties - MUCH STRICTER CAPS
        if grammar_analysis['incomplete_sentences'] > 5:
            overall_score = min(overall_score, 35)  # Changed from 55 to 35
        
        if filler_analysis['filler_rate'] > 8:
            overall_score = min(overall_score, 30)  # Changed from 50 to 30
        
        if pause_analysis['awkward_pauses'] > 5:
            overall_score -= 15  # Increased penalty from 10 to 15
        
        # Additional strict penalties for poor quality
        if grammar_analysis['incomplete_sentences'] > 10:
            overall_score = min(overall_score, 25)  # NEW: Cap at 25 for very poor grammar
        
        if filler_analysis['filler_rate'] > 15:
            overall_score = min(overall_score, 20)  # NEW: Cap at 20 for excessive fillers
        
        # Estimate CEFR and IELTS
        cefr_level = self._estimate_cefr(overall_score, grammar_score, vocabulary_score)
        ielts_band = self._estimate_ielts(overall_score)
        
        return {
            "overall_score": max(0, min(100, overall_score)),
            "fluency_score": max(0, min(100, fluency_score)),
            "pronunciation_score": max(0, min(100, pronunciation_score)),
            "grammar_score": max(0, min(100, grammar_score)),
            "vocabulary_score": max(0, min(100, vocabulary_score)),
            "confidence_score": max(0, min(100, confidence_score)),
            "engagement_score": max(0, min(100, engagement_score)),
            "cefr_level": cefr_level,
            "ielts_estimated_band": ielts_band
        }
    
    def _estimate_cefr(self, overall: int, grammar: int, vocabulary: int) -> str:
        """Estimate CEFR level."""
        weighted = (overall * 0.4 + grammar * 0.3 + vocabulary * 0.3)
        
        if weighted >= 90:
            return "C2"
        elif weighted >= 80:
            return "C1"
        elif weighted >= 70:
            return "B2"
        elif weighted >= 60:
            return "B1"
        elif weighted >= 45:
            return "A2"
        else:
            return "A1"
    
    def _estimate_ielts(self, overall: int) -> float:
        """Estimate IELTS band."""
        if overall >= 92:
            return 9.0
        elif overall >= 88:
            return 8.5
        elif overall >= 83:
            return 8.0
        elif overall >= 78:
            return 7.5
        elif overall >= 73:
            return 7.0
        elif overall >= 68:
            return 6.5
        elif overall >= 63:
            return 6.0
        elif overall >= 58:
            return 5.5
        elif overall >= 53:
            return 5.0
        elif overall >= 48:
            return 4.5
        elif overall >= 43:
            return 4.0
        else:
            return max(1.0, overall / 10)


class PersonalizedCoachingReport:
    """Generates personalized coaching report."""
    
    def generate(
        self,
        transcript: str,
        scores: dict,
        grammar_analysis: dict,
        pause_analysis: dict,
        emotion_analysis: dict,
        filler_analysis: dict,
        metrics: dict
    ) -> dict[str, Any]:
        """Generate comprehensive coaching report."""
        
        # Collect all issues
        all_issues = []
        all_issues.extend(grammar_analysis.get('issues', []))
        all_issues.extend([i for i in pause_analysis.get('issues', []) if i])
        all_issues.extend([i for i in emotion_analysis.get('issues', []) if i])
        all_issues.extend(filler_analysis.get('issues', []))
        
        # Add metric-based issues
        if metrics['average_wpm'] > 180:
            all_issues.append(f"Speaking too fast: {metrics['average_wpm']} WPM (ideal: 130-160)")
        elif metrics['average_wpm'] < 100:
            all_issues.append(f"Speaking too slowly: {metrics['average_wpm']} WPM (ideal: 130-160)")
        
        if metrics['lexical_diversity'] < 0.40:
            all_issues.append(f"Weak vocabulary variety: TTR = {metrics['lexical_diversity']}")
        
        # Identify strengths
        strengths = []
        if scores['fluency_score'] >= 75:
            strengths.append(f"Good fluency: {scores['fluency_score']}/100")
        if scores['grammar_score'] >= 75:
            strengths.append(f"Strong grammar: {scores['grammar_score']}/100")
        if scores['vocabulary_score'] >= 75:
            strengths.append(f"Rich vocabulary: {scores['vocabulary_score']}/100")
        if filler_analysis['filler_rate'] < 2:
            strengths.append(f"Excellent filler control: {filler_analysis['filler_rate']}%")
        
        # Generate improvement plan
        improvement_plan = self._create_improvement_plan(
            scores, all_issues, filler_analysis, metrics
        )
        
        # Professional review
        professional_review = self._generate_review(
            scores['overall_score'], all_issues, strengths, metrics['duration_seconds']
        )
        
        return {
            "detected_issues": all_issues[:15],
            "strengths": strengths if strengths else ["No significant strengths - requires comprehensive improvement"],
            "improvement_plan": improvement_plan,
            "professional_coach_review": professional_review,
            "detailed_analysis": {
                "grammar": self._grammar_feedback(scores['grammar_score'], grammar_analysis),
                "fluency": self._fluency_feedback(scores['fluency_score'], filler_analysis),
                "vocabulary": self._vocabulary_feedback(scores['vocabulary_score'], metrics),
                "engagement": self._engagement_feedback(scores['engagement_score'], emotion_analysis),
                "confidence": self._confidence_feedback(scores['confidence_score'], metrics),
                "pronunciation": self._pronunciation_feedback(scores['pronunciation_score'])
            }
        }
    
    def _create_improvement_plan(self, scores: dict, issues: list, filler_analysis: dict, metrics: dict) -> list[str]:
        """Create actionable improvement plan."""
        plan = []
        
        if filler_analysis['filler_rate'] > 5:
            plan.append("PRIORITY 1: Eliminate filler words. Practice 5-min speeches daily. Count fillers. Reduce by 50% weekly.")
        
        if metrics['average_wpm'] > 170 or metrics['average_wpm'] < 110:
            plan.append(f"PRIORITY 2: Fix pace ({metrics['average_wpm']} WPM). Practice with metronome at 140 WPM.")
        
        if scores['grammar_score'] < 65:
            plan.append("PRIORITY 3: Improve grammar. Study basic rules 30 min daily. Get native speaker feedback.")
        
        if scores['vocabulary_score'] < 65:
            plan.append("PRIORITY 4: Expand vocabulary. Learn 10 new words daily. Use flashcards and synonyms.")
        
        if scores['engagement_score'] < 65:
            plan.append("PRIORITY 5: Add vocal variety. Practice emphasizing key words. Vary pitch and volume.")
        
        if scores['overall_score'] < 50:
            plan.append("CRITICAL: Overall below standard. Consider professional speech coach. Practice 30 min daily minimum.")
        
        return plan[:8]
    
    def _generate_review(self, overall: int, issues: list, strengths: list, duration: float) -> str:
        """Generate professional review."""
        duration_min = round(duration / 60, 1)
        
        if overall >= 85:
            return f"ASSESSMENT: Excellent. Score: {overall}/100. Duration: {duration_min}min. Professional-level speaking. Minimal errors. Ready for high-stakes presentations."
        elif overall >= 75:
            return f"ASSESSMENT: Good. Score: {overall}/100. Duration: {duration_min}min. Solid foundation with minor refinements needed. Suitable for most professional contexts."
        elif overall >= 65:
            return f"ASSESSMENT: Acceptable. Score: {overall}/100. Duration: {duration_min}min. Basic competence but significant weaknesses. Requires focused improvement."
        elif overall >= 50:
            return f"ASSESSMENT: Below standard. Score: {overall}/100. Duration: {duration_min}min. Multiple issues detected. Not ready for professional presentations. Intensive training required."
        else:
            return f"ASSESSMENT: Poor. Score: {overall}/100. Duration: {duration_min}min. Fundamental deficiencies. Requires comprehensive remediation. Estimated 6-12 months practice needed."
    
    def _grammar_feedback(self, score: int, analysis: dict) -> str:
        if score >= 85:
            return f"Grammar excellent ({score}/100). Minimal errors. Maintain this level."
        elif score >= 70:
            return f"Grammar good ({score}/100) with some errors. Review sentence structure."
        else:
            return f"Grammar weak ({score}/100). {analysis['incomplete_sentences']} incomplete sentences. Study basic grammar rules."
    
    def _fluency_feedback(self, score: int, filler_analysis: dict) -> str:
        rate = filler_analysis['filler_rate']
        if score >= 80:
            return f"Fluency strong ({score}/100). Natural flow. Filler rate: {rate}%."
        elif score >= 65:
            return f"Fluency acceptable ({score}/100). Filler rate {rate}% disrupts flow. Replace with pauses."
        else:
            return f"Fluency weak ({score}/100). Excessive fillers ({rate}%). Requires intensive practice."
    
    def _vocabulary_feedback(self, score: int, metrics: dict) -> str:
        ttr = metrics['lexical_diversity']
        if score >= 80:
            return f"Vocabulary strong ({score}/100). Good variety (TTR: {ttr})."
        elif score >= 65:
            return f"Vocabulary acceptable ({score}/100) but limited (TTR: {ttr}). Reduce repetition."
        else:
            return f"Vocabulary weak ({score}/100). Significant repetition (TTR: {ttr}). Expand through reading."
    
    def _engagement_feedback(self, score: int, emotion_analysis: dict) -> str:
        level = emotion_analysis['emotion_level']
        if score >= 80:
            return f"Engagement strong ({score}/100). Good vocal variety."
        elif score >= 65:
            return f"Engagement moderate ({score}/100). Some variety but could be more dynamic."
        else:
            return f"Engagement weak ({score}/100). {level.replace('_', ' ').title()} delivery. Practice vocal exercises."
    
    def _confidence_feedback(self, score: int, metrics: dict) -> str:
        wpm = metrics['average_wpm']
        if score >= 80:
            return f"Confidence strong ({score}/100). Steady delivery at {wpm} WPM."
        elif score >= 65:
            return f"Confidence moderate ({score}/100). Some hesitation at {wpm} WPM."
        else:
            return f"Confidence low ({score}/100). Significant uncertainty at {wpm} WPM."
    
    def _pronunciation_feedback(self, score: int) -> str:
        if score >= 80:
            return f"Pronunciation clear ({score}/100). Easily understood."
        elif score >= 65:
            return f"Pronunciation acceptable ({score}/100). Could be clearer."
        else:
            return f"Pronunciation needs work ({score}/100). Practice phonetic exercises."



def run_enhanced_analysis(
    audio_path: str,
    duration_sec: float,
    ml_fluency: int | None = None,
    ml_tone: int | None = None,
    use_llm: bool = True
) -> dict[str, Any]:
    """
    Run complete enhanced analysis pipeline.
    
    Flow: Audio → Whisper → Grammar → Pause → Emotion → Filler → Metrics → LLM → Scoring → Report
    
    IMPORTANT: LLM evaluation is the PRIMARY intelligence source.
    ML scores are SUPPORTING DATA only.
    
    Args:
        audio_path: Path to audio file
        duration_sec: Audio duration in seconds
        ml_fluency: Optional ML-predicted fluency score (SUPPORTING DATA)
        ml_tone: Optional ML-predicted tone score (SUPPORTING DATA)
        use_llm: If True, generate LLM evaluation prompt (recommended)
    
    Returns:
        Comprehensive analysis with all components
    """
    
    # Step 1: Whisper Large-v3 Transcription
    print("Step 1: Transcribing with Whisper Large-v3...")
    transcription_result = transcribe_audio(audio_path)
    transcript = transcription_result["text"]
    segments = transcription_result["segments"]
    language = transcription_result.get("language")
    
    # Step 2: Grammar Analysis
    print("Step 2: Analyzing grammar...")
    grammar_analyzer = GrammarAnalyzer()
    grammar_analysis = grammar_analyzer.analyze(transcript, segments)
    
    # Step 3: Pause Detection
    print("Step 3: Detecting pauses...")
    pause_detector = PauseDetector()
    pause_analysis = pause_detector.detect(segments)
    
    # Step 4: Emotion Detection
    print("Step 4: Detecting emotion...")
    emotion_detector = EmotionDetector()
    emotion_analysis = emotion_detector.detect(transcript, segments)
    
    # Step 5: Filler Detection
    print("Step 5: Detecting filler words...")
    filler_detector = FillerDetector()
    filler_analysis = filler_detector.detect(transcript)
    
    # Step 6: Speech Metrics Engine
    print("Step 6: Calculating speech metrics...")
    metrics_engine = SpeechMetricsEngine()
    metrics = metrics_engine.calculate(transcript, segments, duration_sec)
    
    # Step 7: LLM Evaluation Prompt (PRIMARY INTELLIGENCE SOURCE)
    print("Step 7: Generating LLM evaluation prompt...")
    llm_prompt = None
    if use_llm:
        from app.services.llm_evaluator import generate_llm_evaluation_prompt
        llm_prompt = generate_llm_evaluation_prompt(
            transcript=transcript,
            segments=segments,
            duration_sec=duration_sec,
            speech_metrics=metrics,
            grammar_analysis=grammar_analysis,
            pause_analysis=pause_analysis,
            emotion_analysis=emotion_analysis,
            filler_analysis=filler_analysis,
            ml_fluency=ml_fluency,  # SUPPORTING DATA
            ml_tone=ml_tone  # SUPPORTING DATA
        )
    
    # Step 8: Fallback Scoring (if LLM not available)
    print("Step 8: Calculating fallback scores...")
    scorer = StrictFinalScoring()
    fallback_scores = scorer.calculate_final_scores(
        grammar_analysis, pause_analysis, emotion_analysis,
        filler_analysis, metrics, ml_fluency, ml_tone
    )
    
    # Step 9: Fallback Coaching Report
    print("Step 9: Generating fallback coaching report...")
    report_generator = PersonalizedCoachingReport()
    fallback_report = report_generator.generate(
        transcript, fallback_scores, grammar_analysis,
        pause_analysis, emotion_analysis, filler_analysis, metrics
    )
    
    # Combine all results
    result = {
        "transcript": transcript,
        "language": language,
        "duration_seconds": duration_sec,
        
        # Detailed analyses (for LLM to use)
        "grammar_analysis": grammar_analysis,
        "pause_analysis": pause_analysis,
        "emotion_analysis": emotion_analysis,
        "filler_analysis": filler_analysis,
        "speech_metrics": metrics,
        
        # ML predictions (SUPPORTING DATA ONLY)
        "ml_predictions": {
            "fluency": ml_fluency,
            "tone": ml_tone,
            "note": "These are ML regression predictions. Use as SUPPORTING DATA only."
        },
        
        # LLM evaluation prompt (PRIMARY INTELLIGENCE)
        "llm_evaluation_prompt": llm_prompt,
        "llm_note": "Send this prompt to language model for evaluation",
        
        # Fallback scores (if LLM not available)
        "fallback_scores": fallback_scores,
        "fallback_report": fallback_report,
        "fallback_note": "These are rule-based scores. LLM evaluation is recommended for better results.",
        
        # Segments for timeline
        "segments": segments,
        
        # Usage instructions
        "usage_instructions": {
            "recommended": "Send llm_evaluation_prompt to language model for best results",
            "fallback": "Use fallback_scores and fallback_report if LLM not available",
            "ml_role": "ML predictions are SUPPORTING DATA, not final scores"
        }
    }
    
    return result
