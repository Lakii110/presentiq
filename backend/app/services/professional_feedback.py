"""
Professional-grade speech evaluation system.
Implements strict international standards for speech assessment.
"""
from __future__ import annotations
import re
import json
from typing import Any
from statistics import mean, pstdev


class ProfessionalSpeechEvaluator:
    """
    World-class AI speech coach trained to evaluate at international standards.
    Strict, harsh but fair evaluation following IELTS/CEFR/professional standards.
    """
    
    def __init__(self):
        self.filler_patterns = [
            r"\bum\b", r"\buh\b", r"\blike\b", r"\byou know\b",
            r"\bso basically\b", r"\bkind of\b", r"\bsort of\b",
            r"\bactually\b", r"\bbasically\b", r"\byeah\b", r"\bwell\b"
        ]
    
    def evaluate_speech(
        self,
        transcript: str,
        segments: list[dict],
        duration_sec: float,
        ml_fluency: int | None = None,
        ml_tone: int | None = None,
    ) -> dict[str, Any]:
        """
        Strict professional evaluation of speech.
        Returns JSON with harsh but fair assessment.
        """
        # Extract metrics
        words = self._count_words(transcript)
        fillers = self._count_fillers(transcript)
        wpm_values = [self._segment_wpm(s) for s in segments]
        avg_wpm = mean(wpm_values) if wpm_values else 0
        
        # Calculate strict scores
        fluency_score = self._evaluate_fluency(ml_fluency, wpm_values, fillers, words)
        pronunciation_score = self._evaluate_pronunciation(transcript, duration_sec)
        grammar_score = self._evaluate_grammar(transcript, segments)
        vocabulary_score = self._evaluate_vocabulary(transcript, words)
        confidence_score = self._evaluate_confidence(wpm_values, duration_sec)
        engagement_score = self._evaluate_engagement(ml_tone, transcript, wpm_values)
        
        # Overall score (weighted average)
        overall_score = int(round(
            fluency_score * 0.20 +
            pronunciation_score * 0.15 +
            grammar_score * 0.20 +
            vocabulary_score * 0.15 +
            confidence_score * 0.15 +
            engagement_score * 0.15
        ))
        
        # Detect issues
        detected_issues = self._detect_issues(
            transcript, fillers, words, avg_wpm, wpm_values, segments
        )
        
        # Identify strengths (strict criteria)
        strengths = self._identify_strengths(
            fluency_score, pronunciation_score, grammar_score,
            vocabulary_score, confidence_score, engagement_score
        )
        
        # Generate advanced feedback
        advanced_feedback = self._generate_advanced_feedback(
            fluency_score, pronunciation_score, grammar_score,
            vocabulary_score, confidence_score, engagement_score,
            transcript, fillers, words, avg_wpm
        )
        
        # Create improvement plan
        improvement_plan = self._create_improvement_plan(detected_issues, overall_score)
        
        # Professional coach review
        professional_review = self._generate_professional_review(
            overall_score, detected_issues, strengths, duration_sec
        )
        
        # Estimate CEFR and IELTS
        cefr_level = self._estimate_cefr(overall_score, grammar_score, vocabulary_score)
        ielts_band = self._estimate_ielts(overall_score)
        
        return {
            "overall_score": overall_score,
            "fluency_score": fluency_score,
            "pronunciation_score": pronunciation_score,
            "grammar_score": grammar_score,
            "vocabulary_score": vocabulary_score,
            "confidence_score": confidence_score,
            "engagement_score": engagement_score,
            "detected_issues": detected_issues,
            "strengths": strengths,
            "advanced_feedback": advanced_feedback,
            "improvement_plan": improvement_plan,
            "professional_coach_review": professional_review,
            "cefr_level": cefr_level,
            "ielts_estimated_band": ielts_band,
            "metrics": {
                "total_words": words,
                "filler_count": fillers,
                "filler_rate": round((fillers / max(words, 1)) * 100, 2),
                "average_wpm": round(avg_wpm, 1),
                "duration_seconds": round(duration_sec, 1),
                "pace_consistency": round(pstdev(wpm_values), 1) if len(wpm_values) > 1 else 0
            }
        }
    
    def _count_words(self, text: str) -> int:
        return len(re.findall(r"\b[\w']+\b", text.lower()))
    
    def _count_fillers(self, text: str) -> int:
        t = text.lower()
        total = 0
        for pat in self.filler_patterns:
            total += len(re.findall(pat, t, flags=re.IGNORECASE))
        return total
    
    def _segment_wpm(self, seg: dict) -> float:
        text = str(seg.get("text", ""))
        start = float(seg.get("start", 0))
        end = float(seg.get("end", 0))
        dur = max(end - start, 0.4)
        wc = max(self._count_words(text), 1)
        return wc / (dur / 60.0)
    
    def _evaluate_fluency(
        self, ml_fluency: int | None, wpm_values: list[float],
        fillers: int, words: int
    ) -> int:
        """Strict fluency evaluation. High filler rate = low score."""
        if ml_fluency is not None:
            base = ml_fluency
        else:
            # Calculate from pace consistency - LOWER BASE SCORES
            if len(wpm_values) > 1:
                consistency = pstdev(wpm_values)
                if consistency < 15:
                    base = 55  # Changed from 75 to 55
                elif consistency < 25:
                    base = 45  # Changed from 65 to 45
                elif consistency < 40:
                    base = 30  # Changed from 50 to 30
                else:
                    base = 20  # Changed from 35 to 20
            else:
                base = 40  # Changed from 60 to 40
        
        # Penalize heavily for fillers - STRICTER CAPS
        filler_rate = fillers / max(words, 1)
        if filler_rate > 0.10:  # >10% fillers
            base = min(base, 25)  # Changed from 40 to 25
        elif filler_rate > 0.06:  # >6% fillers
            base = min(base, 40)  # Changed from 55 to 40
        elif filler_rate > 0.03:  # >3% fillers
            base = min(base, 55)  # Changed from 70 to 55
        
        return max(0, min(100, base))
    
    def _evaluate_pronunciation(self, transcript: str, duration_sec: float) -> int:
        """
        Pronunciation scoring (audio-only limitation).
        Based on speech length, clarity indicators, and confidence.
        """
        # Longer speeches with clear structure suggest better pronunciation - LOWER BASE SCORES
        if duration_sec < 30:
            base = 30  # Changed from 50 to 30
        elif duration_sec < 60:
            base = 40  # Changed from 60 to 40
        elif duration_sec < 120:
            base = 50  # Changed from 70 to 50
        else:
            base = 55  # Changed from 75 to 55
        
        # Check for clarity indicators
        words = self._count_words(transcript)
        if words < 50:
            base -= 20  # Increased penalty from 15 to 20
        
        # Penalize if too many short segments (suggests hesitation)
        sentences = re.split(r'[.!?]+', transcript)
        avg_sentence_words = mean([self._count_words(s) for s in sentences if s.strip()])
        if avg_sentence_words < 5:
            base -= 15  # Increased penalty from 10 to 15
        
        return max(15, min(70, base))  # Changed max from 85 to 70
    
    def _evaluate_grammar(self, transcript: str, segments: list[dict]) -> int:
        """
        Strict grammar evaluation.
        Detects common errors, incomplete sentences, poor structure.
        """
        base = 45  # Changed from 70 to 45 - Start lower for stricter scoring
        
        # Check for incomplete sentences
        sentences = [s.strip() for s in re.split(r'[.!?]+', transcript) if s.strip()]
        incomplete_count = 0
        for sent in sentences:
            words = sent.split()
            if len(words) < 3:  # Too short to be complete
                incomplete_count += 1
        
        if incomplete_count > len(sentences) * 0.3:  # >30% incomplete
            base -= 30  # Increased penalty from 25 to 30
        elif incomplete_count > len(sentences) * 0.15:  # >15% incomplete
            base -= 20  # Increased penalty from 15 to 20
        
        # Check for repeated words (suggests poor grammar control)
        words = transcript.lower().split()
        repeated_sequences = 0
        for i in range(len(words) - 1):
            if words[i] == words[i+1] and len(words[i]) > 3:
                repeated_sequences += 1
        
        if repeated_sequences > 5:
            base -= 20  # Increased penalty from 15 to 20
        elif repeated_sequences > 2:
            base -= 12  # Increased penalty from 8 to 12
        
        # Check for basic grammar patterns
        # Lack of articles, prepositions suggests weak grammar
        articles = len(re.findall(r'\b(a|an|the)\b', transcript.lower()))
        prepositions = len(re.findall(r'\b(in|on|at|to|for|with|by|from)\b', transcript.lower()))
        total_words = self._count_words(transcript)
        
        if total_words > 50:
            article_ratio = articles / total_words
            prep_ratio = prepositions / total_words
            
            if article_ratio < 0.03:  # Very few articles
                base -= 15  # Increased penalty from 10 to 15
            if prep_ratio < 0.04:  # Very few prepositions
                base -= 15  # Increased penalty from 10 to 15
        
        return max(10, min(80, base))  # Changed max from 95 to 80
    
    def _evaluate_vocabulary(self, transcript: str, words: int) -> int:
        """
        Strict vocabulary evaluation.
        Checks for variety, sophistication, repetition.
        """
        if words < 50:
            return 30  # Changed from 45 to 30 - Too short to assess vocabulary
        
        word_list = re.findall(r"\b[\w']+\b", transcript.lower())
        unique_words = len(set(word_list))
        
        # Lexical diversity (Type-Token Ratio) - LOWER BASE SCORES
        ttr = unique_words / max(words, 1)
        
        if ttr > 0.70:
            base = 60  # Changed from 85 to 60
        elif ttr > 0.60:
            base = 50  # Changed from 75 to 50
        elif ttr > 0.50:
            base = 40  # Changed from 65 to 40
        elif ttr > 0.40:
            base = 30  # Changed from 50 to 30
        else:
            base = 20  # Changed from 35 to 20
        
        # Check for basic vs advanced vocabulary
        basic_words = ['good', 'bad', 'nice', 'thing', 'stuff', 'get', 'make', 'do']
        basic_count = sum(word_list.count(w) for w in basic_words)
        
        if basic_count > words * 0.15:  # >15% basic words
            base -= 20  # Increased penalty from 15 to 20
        elif basic_count > words * 0.10:  # >10% basic words
            base -= 12  # Increased penalty from 8 to 12
        
        # Check for filler phrases that indicate weak vocabulary
        weak_phrases = ['you know', 'kind of', 'sort of', 'like', 'basically']
        weak_count = sum(transcript.lower().count(phrase) for phrase in weak_phrases)
        
        if weak_count > 10:
            base -= 25  # Increased penalty from 20 to 25
        elif weak_count > 5:
            base -= 15  # Increased penalty from 10 to 15
        
        return max(15, min(75, base))  # Changed max from 95 to 75
    
    def _evaluate_confidence(self, wpm_values: list[float], duration_sec: float) -> int:
        """
        Strict confidence evaluation.
        High variance = low confidence. Very short speech = cannot assess.
        """
        if duration_sec < 30:
            return 25  # Changed from 40 to 25 - Too short to assess confidence
        
        if len(wpm_values) < 3:
            return 35  # Changed from 50 to 35 - Not enough data
        
        # Calculate pace consistency
        std_dev = pstdev(wpm_values)
        avg_wpm = mean(wpm_values)
        
        # Coefficient of variation (normalized std dev)
        cv = (std_dev / avg_wpm) if avg_wpm > 0 else 1.0
        
        # LOWER BASE SCORES FOR STRICTER EVALUATION
        if cv < 0.15:  # Very consistent
            base = 60  # Changed from 80 to 60
        elif cv < 0.25:  # Moderately consistent
            base = 48  # Changed from 68 to 48
        elif cv < 0.35:  # Somewhat inconsistent
            base = 32  # Changed from 52 to 32
        else:  # Very inconsistent
            base = 20  # Changed from 35 to 20
        
        # Penalize extreme pacing
        if avg_wpm > 200 or avg_wpm < 80:
            base -= 20  # Increased penalty from 15 to 20
        
        return max(15, min(75, base))  # Changed max from 90 to 75
    
    def _evaluate_engagement(
        self, ml_tone: int | None, transcript: str, wpm_values: list[float]
    ) -> int:
        """
        Strict engagement evaluation.
        Monotone, flat delivery = low score.
        """
        if ml_tone is not None:
            base = ml_tone
        else:
            # Proxy from text features - LOWER BASE SCORES
            questions = transcript.count('?')
            exclamations = transcript.count('!')
            commas = transcript.count(',')
            words = self._count_words(transcript)
            
            # Variety indicators
            variety_score = (questions * 3 + exclamations * 2 + commas * 0.5) / max(words / 50, 1)
            
            if variety_score > 8:
                base = 55  # Changed from 75 to 55
            elif variety_score > 5:
                base = 45  # Changed from 65 to 45
            elif variety_score > 3:
                base = 35  # Changed from 55 to 35
            else:
                base = 25  # Changed from 40 to 25 - Monotone
        
        # Penalize if pace is too consistent (suggests monotone)
        if len(wpm_values) > 3:
            std_dev = pstdev(wpm_values)
            if std_dev < 10:  # Too consistent = monotone
                base -= 15  # Increased penalty from 10 to 15
        
        return max(20, min(70, base))  # Changed max from 90 to 70
    
    def _detect_issues(
        self, transcript: str, fillers: int, words: int,
        avg_wpm: float, wpm_values: list[float], segments: list[dict]
    ) -> list[str]:
        """Detect specific issues in speech."""
        issues = []
        
        # Filler words
        filler_rate = (fillers / max(words, 1)) * 100
        if filler_rate > 10:
            issues.append(f"Excessive filler words: {fillers} instances ({filler_rate:.1f}% of speech)")
        elif filler_rate > 5:
            issues.append(f"High filler word usage: {fillers} instances ({filler_rate:.1f}%)")
        elif filler_rate > 2:
            issues.append(f"Moderate filler words: {fillers} instances detected")
        
        # Speaking pace
        if avg_wpm > 180:
            issues.append(f"Speaking too fast: {avg_wpm:.0f} WPM (ideal: 130-160 WPM)")
        elif avg_wpm < 100:
            issues.append(f"Speaking too slowly: {avg_wpm:.0f} WPM (ideal: 130-160 WPM)")
        elif avg_wpm > 165 or avg_wpm < 120:
            issues.append(f"Pace slightly off: {avg_wpm:.0f} WPM (ideal: 130-160 WPM)")
        
        # Pace consistency
        if len(wpm_values) > 2:
            std_dev = pstdev(wpm_values)
            if std_dev > 40:
                issues.append(f"Inconsistent pacing: high variation (σ={std_dev:.1f})")
            elif std_dev > 30:
                issues.append(f"Moderate pace inconsistency detected")
        
        # Vocabulary repetition
        word_list = re.findall(r"\b[\w']+\b", transcript.lower())
        unique_words = len(set(word_list))
        ttr = unique_words / max(words, 1)
        
        if ttr < 0.40:
            issues.append(f"Weak vocabulary variety: only {unique_words} unique words from {words} total")
        elif ttr < 0.50:
            issues.append(f"Limited vocabulary range: {ttr:.1%} lexical diversity")
        
        # Repeated words
        word_counts = {}
        for word in word_list:
            if len(word) > 4:  # Only count substantial words
                word_counts[word] = word_counts.get(word, 0) + 1
        
        overused = [w for w, c in word_counts.items() if c > max(5, words / 50)]
        if overused:
            issues.append(f"Repeated words: {', '.join(overused[:3])}")
        
        # Sentence structure
        sentences = [s.strip() for s in re.split(r'[.!?]+', transcript) if s.strip()]
        if sentences:
            avg_sentence_len = mean([self._count_words(s) for s in sentences])
            if avg_sentence_len > 25:
                issues.append(f"Sentences too long: average {avg_sentence_len:.1f} words (ideal: 15-20)")
            elif avg_sentence_len < 6:
                issues.append(f"Sentences too short/choppy: average {avg_sentence_len:.1f} words")
        
        # Grammar indicators
        articles = len(re.findall(r'\b(a|an|the)\b', transcript.lower()))
        if words > 50 and (articles / words) < 0.03:
            issues.append("Missing articles suggests grammar weakness")
        
        # Monotone indicators
        questions = transcript.count('?')
        exclamations = transcript.count('!')
        if words > 100 and questions == 0 and exclamations == 0:
            issues.append("Monotone delivery: no vocal variety indicators")
        
        # Awkward pauses
        long_pauses = 0
        for i in range(len(segments) - 1):
            gap = segments[i+1].get('start', 0) - segments[i].get('end', 0)
            if gap > 3.0:
                long_pauses += 1
        
        if long_pauses > 3:
            issues.append(f"Awkward pauses: {long_pauses} long gaps detected")
        
        # Weak introduction/conclusion
        if len(transcript) > 100:
            first_30 = transcript[:min(100, len(transcript))]
            last_30 = transcript[-min(100, len(transcript)):]
            
            if self._count_words(first_30) < 10:
                issues.append("Weak introduction: insufficient opening content")
            if self._count_words(last_30) < 10:
                issues.append("Weak conclusion: insufficient closing content")
        
        return issues[:15]  # Limit to top 15 issues
    
    def _identify_strengths(
        self, fluency: int, pronunciation: int, grammar: int,
        vocabulary: int, confidence: int, engagement: int
    ) -> list[str]:
        """Identify strengths (strict criteria - must score 75+)."""
        strengths = []
        
        if fluency >= 80:
            strengths.append(f"Strong fluency: {fluency}/100 - smooth, natural delivery")
        elif fluency >= 75:
            strengths.append(f"Good fluency: {fluency}/100 - generally smooth flow")
        
        if pronunciation >= 80:
            strengths.append(f"Clear pronunciation: {pronunciation}/100 - easily understood")
        elif pronunciation >= 75:
            strengths.append(f"Acceptable pronunciation: {pronunciation}/100")
        
        if grammar >= 85:
            strengths.append(f"Excellent grammar: {grammar}/100 - minimal errors")
        elif grammar >= 75:
            strengths.append(f"Good grammar: {grammar}/100 - few errors")
        
        if vocabulary >= 80:
            strengths.append(f"Rich vocabulary: {vocabulary}/100 - good variety")
        elif vocabulary >= 75:
            strengths.append(f"Adequate vocabulary: {vocabulary}/100")
        
        if confidence >= 80:
            strengths.append(f"Confident delivery: {confidence}/100 - consistent pace")
        elif confidence >= 75:
            strengths.append(f"Reasonable confidence: {confidence}/100")
        
        if engagement >= 80:
            strengths.append(f"Engaging delivery: {engagement}/100 - good vocal variety")
        elif engagement >= 75:
            strengths.append(f"Moderate engagement: {engagement}/100")
        
        if not strengths:
            strengths.append("No significant strengths identified - requires comprehensive improvement")
        
        return strengths[:8]  # Limit to top 8
    
    def _generate_advanced_feedback(
        self, fluency: int, pronunciation: int, grammar: int,
        vocabulary: int, confidence: int, engagement: int,
        transcript: str, fillers: int, words: int, avg_wpm: float
    ) -> dict[str, str]:
        """Generate detailed feedback for each category."""
        return {
            "fluency": self._fluency_feedback(fluency, fillers, words),
            "pronunciation": self._pronunciation_feedback(pronunciation, transcript),
            "grammar": self._grammar_feedback(grammar, transcript),
            "vocabulary": self._vocabulary_feedback(vocabulary, transcript, words),
            "confidence": self._confidence_feedback(confidence, avg_wpm),
            "engagement": self._engagement_feedback(engagement, transcript)
        }
    
    def _fluency_feedback(self, score: int, fillers: int, words: int) -> str:
        filler_rate = (fillers / max(words, 1)) * 100
        
        if score >= 80:
            return f"Fluency is strong ({score}/100). Speech flows naturally with minimal hesitation. Filler rate: {filler_rate:.1f}%. Maintain this standard."
        elif score >= 65:
            return f"Fluency is acceptable ({score}/100) but needs improvement. Filler rate of {filler_rate:.1f}% disrupts flow. Practice eliminating 'um', 'uh', 'like'. Replace with brief pauses."
        elif score >= 50:
            return f"Fluency is weak ({score}/100). Excessive fillers ({filler_rate:.1f}%) and hesitations disrupt communication. Requires intensive practice. Record yourself daily and count fillers. Reduce by 50% each week."
        else:
            return f"Fluency is very poor ({score}/100). Speech is severely disrupted by fillers ({filler_rate:.1f}%) and hesitations. Fundamental fluency training required. Consider working with a speech coach."
    
    def _pronunciation_feedback(self, score: int, transcript: str) -> str:
        if score >= 80:
            return f"Pronunciation appears clear ({score}/100). Speech is easily understood. Continue practicing challenging sounds."
        elif score >= 65:
            return f"Pronunciation is acceptable ({score}/100) but could be clearer. Focus on enunciation and word stress. Practice with native speaker recordings."
        elif score >= 50:
            return f"Pronunciation needs significant work ({score}/100). Clarity is compromised. Practice phonetic exercises daily. Use pronunciation apps or work with a tutor."
        else:
            return f"Pronunciation is poor ({score}/100). Comprehension is difficult. Requires systematic pronunciation training. Consider intensive phonetics course."
    
    def _grammar_feedback(self, score: int, transcript: str) -> str:
        if score >= 85:
            return f"Grammar is excellent ({score}/100). Minimal errors detected. Sentence structure is sound. Maintain this level."
        elif score >= 70:
            return f"Grammar is good ({score}/100) with some errors. Review sentence structure and verb tenses. Practice complex sentences."
        elif score >= 55:
            return f"Grammar is weak ({score}/100). Multiple errors detected. Study basic grammar rules. Practice writing and speaking with feedback."
        else:
            return f"Grammar is very poor ({score}/100). Fundamental errors throughout. Requires comprehensive grammar study. Consider formal English course."
    
    def _vocabulary_feedback(self, score: int, transcript: str, words: int) -> str:
        word_list = re.findall(r"\b[\w']+\b", transcript.lower())
        unique = len(set(word_list))
        ttr = unique / max(words, 1)
        
        if score >= 80:
            return f"Vocabulary is strong ({score}/100). Good variety and range. {unique} unique words from {words} total (TTR: {ttr:.2f}). Continue expanding academic/professional vocabulary."
        elif score >= 65:
            return f"Vocabulary is acceptable ({score}/100) but limited. {unique} unique words from {words} total (TTR: {ttr:.2f}). Reduce repetition. Learn 10 new words daily. Use synonyms."
        elif score >= 50:
            return f"Vocabulary is weak ({score}/100). Significant repetition detected. {unique} unique words from {words} total (TTR: {ttr:.2f}). Expand vocabulary through reading. Use vocabulary apps. Practice paraphrasing."
        else:
            return f"Vocabulary is very poor ({score}/100). Extremely limited range. {unique} unique words from {words} total (TTR: {ttr:.2f}). Requires systematic vocabulary building. Study word families and collocations."
    
    def _confidence_feedback(self, score: int, avg_wpm: float) -> str:
        if score >= 80:
            return f"Confidence is strong ({score}/100). Delivery is steady and assured. Pace: {avg_wpm:.0f} WPM. Maintain this consistency."
        elif score >= 65:
            return f"Confidence is moderate ({score}/100). Some hesitation detected. Pace: {avg_wpm:.0f} WPM. Practice more to build confidence. Record yourself regularly."
        elif score >= 50:
            return f"Confidence is low ({score}/100). Significant hesitation and uncertainty. Pace: {avg_wpm:.0f} WPM. Requires extensive practice. Start with prepared speeches. Build gradually."
        else:
            return f"Confidence is very low ({score}/100). Delivery shows extreme uncertainty. Pace: {avg_wpm:.0f} WPM. Fundamental confidence building needed. Practice in low-pressure environments first."
    
    def _engagement_feedback(self, score: int, transcript: str) -> str:
        if score >= 80:
            return f"Engagement is strong ({score}/100). Good vocal variety and energy. Maintains listener interest. Continue using emphasis and intonation."
        elif score >= 65:
            return f"Engagement is moderate ({score}/100). Some vocal variety but could be more dynamic. Practice varying pitch and volume. Use rhetorical questions."
        elif score >= 50:
            return f"Engagement is weak ({score}/100). Delivery is somewhat monotone. Practice vocal exercises. Record and compare with engaging speakers. Add emotional expression."
        else:
            return f"Engagement is very poor ({score}/100). Monotone delivery fails to maintain interest. Requires vocal training. Practice reading dramatically. Work on intonation patterns."
    
    def _create_improvement_plan(self, issues: list[str], overall: int) -> list[str]:
        """Create actionable improvement plan based on detected issues."""
        plan = []
        
        # Prioritize based on severity
        if any('filler' in issue.lower() for issue in issues):
            plan.append("PRIORITY 1: Eliminate filler words. Practice 5-minute speeches daily. Count fillers. Reduce by 50% each week. Replace with 1-second pauses.")
        
        if any('pace' in issue.lower() or 'fast' in issue.lower() or 'slow' in issue.lower() for issue in issues):
            plan.append("PRIORITY 2: Fix speaking pace. Practice with metronome at 140 WPM. Record and measure. Aim for 130-160 WPM consistently.")
        
        if any('grammar' in issue.lower() for issue in issues):
            plan.append("PRIORITY 3: Improve grammar. Study basic grammar rules 30 min daily. Practice writing sentences. Get feedback from native speakers.")
        
        if any('vocabulary' in issue.lower() or 'repeated' in issue.lower() for issue in issues):
            plan.append("PRIORITY 4: Expand vocabulary. Learn 10 new words daily. Use flashcards. Practice using synonyms. Read academic/professional texts.")
        
        if any('monotone' in issue.lower() or 'engagement' in issue.lower() for issue in issues):
            plan.append("PRIORITY 5: Add vocal variety. Practice emphasizing key words. Vary pitch and volume. Record and compare with engaging speakers.")
        
        if any('confidence' in issue.lower() or 'inconsistent' in issue.lower() for issue in issues):
            plan.append("PRIORITY 6: Build confidence. Practice prepared speeches 10 times before recording. Start with 2-minute talks. Gradually increase length.")
        
        # General recommendations based on overall score
        if overall < 50:
            plan.append("CRITICAL: Overall performance is below standard. Consider hiring a professional speech coach. Practice 30 minutes daily minimum.")
        elif overall < 65:
            plan.append("IMPORTANT: Significant improvement needed. Practice 20 minutes daily. Join Toastmasters or similar speaking group.")
        elif overall < 75:
            plan.append("RECOMMENDED: Good foundation but needs refinement. Practice 15 minutes daily. Focus on weak areas identified above.")
        
        if not plan:
            plan.append("Continue practicing regularly to maintain current level. Focus on advanced techniques like storytelling and persuasion.")
        
        return plan[:8]  # Limit to 8 steps
    
    def _generate_professional_review(
        self, overall: int, issues: list[str], strengths: list[str], duration: float
    ) -> str:
        """Generate harsh but fair professional coach review."""
        duration_min = round(duration / 60, 1)
        
        if overall >= 85:
            opening = f"ASSESSMENT: Excellent performance. Score: {overall}/100. Duration: {duration_min} minutes."
            body = "This is professional-level speaking. Minimal errors detected. Delivery demonstrates strong command of language and presentation skills."
            closing = "Recommendation: Ready for professional presentations. Continue refining advanced techniques."
        
        elif overall >= 75:
            opening = f"ASSESSMENT: Good performance. Score: {overall}/100. Duration: {duration_min} minutes."
            body = "Solid foundation with room for improvement. Communication is generally effective but lacks polish in some areas."
            closing = "Recommendation: Suitable for most professional contexts with minor refinements. Address identified weaknesses."
        
        elif overall >= 65:
            opening = f"ASSESSMENT: Acceptable performance. Score: {overall}/100. Duration: {duration_min} minutes."
            body = "Basic competence demonstrated but significant weaknesses present. Communication is functional but not professional-grade."
            closing = "Recommendation: Requires focused improvement before high-stakes presentations. Practice intensively on weak areas."
        
        elif overall >= 50:
            opening = f"ASSESSMENT: Below standard. Score: {overall}/100. Duration: {duration_min} minutes."
            body = "Multiple significant issues detected. Communication effectiveness is compromised. Not ready for professional presentations."
            closing = "Recommendation: Intensive training required. Consider professional coaching. Practice daily for 3-6 months minimum."
        
        else:
            opening = f"ASSESSMENT: Poor performance. Score: {overall}/100. Duration: {duration_min} minutes."
            body = "Fundamental deficiencies throughout. Communication is severely impaired. Requires comprehensive remediation."
            closing = "Recommendation: Not suitable for any professional presentation. Requires systematic training from basics. Estimated 6-12 months intensive practice needed."
        
        # Add specific issues
        if issues:
            issue_summary = f" Key issues: {len(issues)} major problems identified including {issues[0].lower()}"
            if len(issues) > 1:
                issue_summary += f" and {issues[1].lower()}"
            body += issue_summary + "."
        
        return f"{opening} {body} {closing}"
    
    def _estimate_cefr(self, overall: int, grammar: int, vocabulary: int) -> str:
        """Estimate CEFR level (A1-C2) based on performance."""
        # Weighted score emphasizing grammar and vocabulary
        weighted = (overall * 0.4 + grammar * 0.3 + vocabulary * 0.3)
        
        if weighted >= 90:
            return "C2"  # Mastery
        elif weighted >= 80:
            return "C1"  # Advanced
        elif weighted >= 70:
            return "B2"  # Upper Intermediate
        elif weighted >= 60:
            return "B1"  # Intermediate
        elif weighted >= 45:
            return "A2"  # Elementary
        else:
            return "A1"  # Beginner
    
    def _estimate_ielts(self, overall: int) -> float:
        """Estimate IELTS Speaking band (0-9) based on overall performance."""
        # IELTS is harsh - 90+ = Band 8, 80+ = Band 7, etc.
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
        elif overall >= 38:
            return 3.5
        elif overall >= 33:
            return 3.0
        elif overall >= 28:
            return 2.5
        elif overall >= 23:
            return 2.0
        elif overall >= 18:
            return 1.5
        else:
            return 1.0


# Convenience function for easy import
def generate_professional_feedback(
    transcript: str,
    segments: list[dict],
    duration_sec: float,
    ml_fluency: int | None = None,
    ml_tone: int | None = None,
) -> dict[str, Any]:
    """
    Generate professional-grade speech evaluation.
    
    Args:
        transcript: Full speech transcript
        segments: List of speech segments with timing
        duration_sec: Total speech duration in seconds
        ml_fluency: Optional ML-predicted fluency score
        ml_tone: Optional ML-predicted tone score
    
    Returns:
        Comprehensive evaluation dict with strict scoring
    """
    evaluator = ProfessionalSpeechEvaluator()
    return evaluator.evaluate_speech(
        transcript=transcript,
        segments=segments,
        duration_sec=duration_sec,
        ml_fluency=ml_fluency,
        ml_tone=ml_tone
    )
