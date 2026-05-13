"""
LLM-Powered Speech Evaluation System
The REAL intelligence comes from LLM prompt engineering, not just ML regression.
ML models provide supporting data, but LLM makes the final evaluation.
"""
from __future__ import annotations
import json
from typing import Any


class LLMSpeechEvaluator:
    """
    LLM-powered speech evaluator using advanced prompt engineering.
    ML scores are used as SUPPORTING DATA only.
    """
    
    def generate_evaluation_prompt(
        self,
        transcript: str,
        segments: list[dict],
        duration_sec: float,
        speech_metrics: dict,
        grammar_analysis: dict,
        pause_analysis: dict,
        emotion_analysis: dict,
        filler_analysis: dict,
        ml_fluency: int | None = None,
        ml_tone: int | None = None
    ) -> str:
        """
        Generate comprehensive LLM evaluation prompt.
        This is where the REAL intelligence happens.
        """
        
        # Calculate additional metrics
        words = speech_metrics['total_words']
        unique_words = speech_metrics['unique_words']
        avg_wpm = speech_metrics['average_wpm']
        wpm_std = speech_metrics['wpm_std_dev']
        
        prompt = f"""You are a world-class AI speech and presentation coach trained to evaluate public speaking, IELTS speaking, business presentations, academic speeches, and communication skills at international standards.

Your task is to STRICTLY analyze the user's speech transcript and comprehensive speech metrics.

You must behave like a harsh but fair professional evaluator.
DO NOT give generic motivational feedback.
DO NOT be overly positive.
DO NOT ignore mistakes.

You must deeply analyze:
1. Fluency (flow, hesitations, natural delivery)
2. Pronunciation (clarity, enunciation, word stress)
3. Grammar (sentence structure, verb tenses, articles)
4. Vocabulary (variety, sophistication, repetition)
5. Confidence (consistency, pace control, assertiveness)
6. Speaking pace (ideal: 130-160 WPM)
7. Filler words (should be <2%)
8. Clarity (sentence structure, coherence)
9. Emotional delivery (engagement, vocal variety)
10. Engagement (audience connection, energy)
11. Presentation structure (introduction, body, conclusion)
12. Professionalism (overall quality)
13. Natural speaking ability (not robotic)
14. Communication effectiveness (message delivery)

═══════════════════════════════════════════════════════════════
SPEECH TRANSCRIPT ({words} words, {duration_sec:.1f} seconds):
═══════════════════════════════════════════════════════════════

{transcript}

═══════════════════════════════════════════════════════════════
COMPREHENSIVE SPEECH METRICS:
═══════════════════════════════════════════════════════════════

BASIC METRICS:
- Total Words: {words}
- Unique Words: {unique_words}
- Lexical Diversity (TTR): {speech_metrics['lexical_diversity']:.3f}
- Duration: {duration_sec:.1f} seconds ({duration_sec/60:.1f} minutes)

SPEAKING PACE:
- Average WPM: {avg_wpm:.1f} (ideal: 130-160 WPM)
- WPM Standard Deviation: {wpm_std:.1f} (consistency measure)
- Min WPM: {speech_metrics['min_wpm']:.1f}
- Max WPM: {speech_metrics['max_wpm']:.1f}
- Pace Assessment: {"TOO FAST" if avg_wpm > 180 else "TOO SLOW" if avg_wpm < 100 else "SLIGHTLY FAST" if avg_wpm > 160 else "SLIGHTLY SLOW" if avg_wpm < 130 else "OPTIMAL"}

GRAMMAR ANALYSIS:
- Grammar Score: {grammar_analysis['grammar_score']}/100
- Total Sentences: {grammar_analysis['total_sentences']}
- Incomplete Sentences: {grammar_analysis['incomplete_sentences']}
- Repeated Word Sequences: {grammar_analysis['repeated_words']}
- Article Usage Ratio: {grammar_analysis['article_ratio']:.3f} (should be ~0.05-0.08)
- Average Sentence Length: {grammar_analysis['avg_sentence_length']:.1f} words (ideal: 15-20)
- Grammar Issues: {', '.join(grammar_analysis['issues']) if grammar_analysis['issues'] else 'None detected'}

PAUSE ANALYSIS:
- Pause Score: {pause_analysis['pause_score']}/100
- Total Pauses: {pause_analysis['total_pauses']}
- Strategic Pauses (0.5-2s): {pause_analysis['strategic_pauses']} {"✓ GOOD" if pause_analysis['strategic_pauses'] >= 3 else "✗ TOO FEW"}
- Long Pauses (2-4s): {pause_analysis['long_pauses']} {"✗ TOO MANY" if pause_analysis['long_pauses'] > 5 else "✓ OK"}
- Awkward Pauses (>4s): {pause_analysis['awkward_pauses']} {"✗ CRITICAL ISSUE" if pause_analysis['awkward_pauses'] > 3 else "✗ NEEDS WORK" if pause_analysis['awkward_pauses'] > 0 else "✓ EXCELLENT"}
- Total Pause Time: {pause_analysis['total_pause_time']:.1f} seconds

EMOTION & ENGAGEMENT:
- Emotion Score: {emotion_analysis['emotion_score']}/100
- Emotion Level: {emotion_analysis['emotion_level'].upper().replace('_', ' ')}
- Overall Tone: {emotion_analysis['tone'].upper()}
- Questions Used: {emotion_analysis['questions']} {"✓ GOOD VARIETY" if emotion_analysis['questions'] >= 2 else "✗ TOO FEW"}
- Exclamations Used: {emotion_analysis['exclamations']} {"✓ SHOWS ENERGY" if emotion_analysis['exclamations'] >= 1 else "✗ FLAT DELIVERY"}
- Positive Words: {emotion_analysis['positive_words']}
- Negative Words: {emotion_analysis['negative_words']}
- Variety Indicators: {emotion_analysis['variety_indicators']:.2f}

FILLER WORD ANALYSIS:
- Filler Score: {filler_analysis['filler_score']}/100
- Total Filler Words: {filler_analysis['total_fillers']}
- Filler Rate: {filler_analysis['filler_rate']:.2f}% {"✗ EXCESSIVE (>10%)" if filler_analysis['filler_rate'] > 10 else "✗ HIGH (>5%)" if filler_analysis['filler_rate'] > 5 else "⚠ MODERATE (>2%)" if filler_analysis['filler_rate'] > 2 else "✓ EXCELLENT (<2%)"}
- Top Filler Words: {', '.join([f"{f['word']} ({f['count']}x)" for f in filler_analysis['top_fillers'][:5]])}
- Filler Issues: {', '.join(filler_analysis['issues']) if filler_analysis['issues'] else 'None'}

ML MODEL PREDICTIONS (SUPPORTING DATA ONLY):
- ML Fluency Prediction: {ml_fluency if ml_fluency else "N/A"}/100
- ML Tone Prediction: {ml_tone if ml_tone else "N/A"}/100
Note: These are ML regression predictions. Use them as SUPPORTING DATA, not final scores.

═══════════════════════════════════════════════════════════════
EVALUATION INSTRUCTIONS:
═══════════════════════════════════════════════════════════════

You must detect:
- Repeated words (indicates poor vocabulary)
- Weak vocabulary (basic words like "good", "bad", "thing", "stuff")
- Grammar errors (missing articles, wrong tenses, incomplete sentences)
- Robotic speaking (monotone, no variation)
- Monotone delivery (no pitch variation, flat)
- Awkward pauses (>4 seconds, disrupts flow)
- Poor transitions (jumping between topics)
- Unclear ideas (confusing message)
- Lack of confidence (hesitations, uncertainty)
- Overuse of filler words (um, uh, like, you know)
- Weak introduction (no clear opening)
- Weak conclusion (no clear closing)

STRICT SCORING SCALE:
9-10 (90-100): Expert/native/professional speaker - RARE
7-8 (70-89): Strong communicator - UNCOMMON
5-6 (50-69): Average speaker - COMMON
3-4 (30-49): Weak speaker - NEEDS WORK
0-2 (0-29): Very poor communication - CRITICAL

IMPORTANT RULES:
✗ Never give high scores easily
✗ If grammar has many mistakes (>5 incomplete sentences): score below 60
✗ If filler words are excessive (>5%): reduce fluency score significantly
✗ If structure is weak (no clear intro/conclusion): reduce engagement score
✗ If pronunciation confidence is low (high WPM variance): reduce pronunciation score
✗ If monotone delivery (no questions/exclamations): reduce engagement score
✗ If vocabulary is repetitive (TTR < 0.40): reduce vocabulary score
✗ If pace is wrong (<100 or >180 WPM): reduce fluency and confidence scores

═══════════════════════════════════════════════════════════════
REQUIRED JSON OUTPUT FORMAT:
═══════════════════════════════════════════════════════════════

You MUST return ONLY valid JSON in this exact format:

{{
  "overall_score": <number 0-100>,
  "fluency_score": <number 0-100>,
  "pronunciation_score": <number 0-100>,
  "grammar_score": <number 0-100>,
  "vocabulary_score": <number 0-100>,
  "confidence_score": <number 0-100>,
  "engagement_score": <number 0-100>,
  
  "detected_issues": [
    "Issue 1 with specific details",
    "Issue 2 with specific details",
    "Issue 3 with specific details"
  ],
  
  "strengths": [
    "Strength 1 (only if score 75+)",
    "Strength 2 (only if score 75+)"
  ],
  
  "advanced_feedback": {{
    "fluency": "Detailed fluency analysis with specific examples from transcript",
    "pronunciation": "Detailed pronunciation analysis",
    "grammar": "Detailed grammar analysis with specific errors found",
    "vocabulary": "Detailed vocabulary analysis with repetition examples",
    "confidence": "Detailed confidence analysis based on pace consistency",
    "engagement": "Detailed engagement analysis with vocal variety assessment"
  }},
  
  "improvement_plan": [
    "PRIORITY 1: Most critical issue with specific action",
    "PRIORITY 2: Second critical issue with specific action",
    "PRIORITY 3: Third issue with specific action"
  ],
  
  "professional_coach_review": "2-3 sentence harsh but fair professional assessment. Start with 'ASSESSMENT:' Include overall score, duration, key issues, and recommendation.",
  
  "cefr_level": "A1|A2|B1|B2|C1|C2",
  "ielts_estimated_band": <number 1.0-9.0>
}}

CRITICAL: Return ONLY the JSON object. No markdown, no code blocks, no explanations.
Start your response with {{ and end with }}

Begin your evaluation now:"""
        
        return prompt
    
    def parse_llm_response(self, llm_response: str) -> dict[str, Any]:
        """
        Parse LLM JSON response.
        Handles various response formats.
        """
        # Remove markdown code blocks if present
        response = llm_response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    pass
            
            # Return error structure
            return {
                "error": f"Failed to parse LLM response: {str(e)}",
                "raw_response": response[:500]
            }
    
    def validate_evaluation(self, evaluation: dict) -> dict[str, Any]:
        """
        Validate and sanitize LLM evaluation.
        Ensures all required fields are present.
        """
        required_fields = [
            "overall_score", "fluency_score", "pronunciation_score",
            "grammar_score", "vocabulary_score", "confidence_score",
            "engagement_score", "detected_issues", "strengths",
            "advanced_feedback", "improvement_plan",
            "professional_coach_review", "cefr_level", "ielts_estimated_band"
        ]
        
        # Check for errors
        if "error" in evaluation:
            return evaluation
        
        # Validate required fields
        for field in required_fields:
            if field not in evaluation:
                evaluation[field] = self._get_default_value(field)
        
        # Validate score ranges
        score_fields = [
            "overall_score", "fluency_score", "pronunciation_score",
            "grammar_score", "vocabulary_score", "confidence_score",
            "engagement_score"
        ]
        
        for field in score_fields:
            if not isinstance(evaluation[field], (int, float)):
                evaluation[field] = 50
            evaluation[field] = max(0, min(100, int(evaluation[field])))
        
        # Validate IELTS band
        if not isinstance(evaluation["ielts_estimated_band"], (int, float)):
            evaluation["ielts_estimated_band"] = 5.0
        evaluation["ielts_estimated_band"] = max(1.0, min(9.0, float(evaluation["ielts_estimated_band"])))
        
        # Validate CEFR level
        valid_cefr = ["A1", "A2", "B1", "B2", "C1", "C2"]
        if evaluation["cefr_level"] not in valid_cefr:
            evaluation["cefr_level"] = "B1"
        
        return evaluation
    
    def _get_default_value(self, field: str) -> Any:
        """Get default value for missing field."""
        if field.endswith("_score"):
            return 50
        elif field in ["detected_issues", "strengths", "improvement_plan"]:
            return []
        elif field == "advanced_feedback":
            return {
                "fluency": "Analysis not available",
                "pronunciation": "Analysis not available",
                "grammar": "Analysis not available",
                "vocabulary": "Analysis not available",
                "confidence": "Analysis not available",
                "engagement": "Analysis not available"
            }
        elif field == "professional_coach_review":
            return "ASSESSMENT: Evaluation incomplete."
        elif field == "cefr_level":
            return "B1"
        elif field == "ielts_estimated_band":
            return 5.0
        return None


# Convenience function for easy import
def generate_llm_evaluation_prompt(
    transcript: str,
    segments: list[dict],
    duration_sec: float,
    speech_metrics: dict,
    grammar_analysis: dict,
    pause_analysis: dict,
    emotion_analysis: dict,
    filler_analysis: dict,
    ml_fluency: int | None = None,
    ml_tone: int | None = None
) -> str:
    """
    Generate LLM evaluation prompt.
    This is where the REAL intelligence happens - not in ML regression.
    """
    evaluator = LLMSpeechEvaluator()
    return evaluator.generate_evaluation_prompt(
        transcript=transcript,
        segments=segments,
        duration_sec=duration_sec,
        speech_metrics=speech_metrics,
        grammar_analysis=grammar_analysis,
        pause_analysis=pause_analysis,
        emotion_analysis=emotion_analysis,
        filler_analysis=filler_analysis,
        ml_fluency=ml_fluency,
        ml_tone=ml_tone
    )
