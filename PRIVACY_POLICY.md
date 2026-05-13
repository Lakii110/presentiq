# Privacy Policy

**Last Updated:** May 13, 2026

## Introduction

PresentIQ ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our pronunciation assessment application.

## Information We Collect

### Personal Information
- **Email Address:** Used for account creation and authentication
- **Display Name:** Used to personalize your experience
- **Password:** Stored securely using Argon2 hashing

### Usage Data
- **Audio Recordings:** Your pronunciation practice recordings
- **Transcripts:** Text transcriptions of your audio
- **Assessment Scores:** Accuracy, fluency, completeness, and prosody scores
- **Session Data:** Timestamps, duration, and practice history

### Technical Data
- **IP Address:** For security and rate limiting
- **Request Logs:** For monitoring and debugging
- **Browser Information:** For compatibility

## How We Use Your Information

We use your information to:
- Provide pronunciation assessment services
- Track your progress over time
- Improve our machine learning models
- Ensure security and prevent abuse
- Communicate important updates
- Comply with legal obligations

## Data Storage and Security

### Security Measures
- Passwords hashed with Argon2
- HTTPS encryption for data in transit
- Rate limiting to prevent brute force attacks
- Regular security audits
- Secure database backups

### Data Retention
- **Account Data:** Retained until you delete your account
- **Practice Sessions:** Retained until you delete them or your account
- **Logs:** Retained for 30 days

## Your Rights (GDPR Compliance)

You have the right to:

### 1. Access Your Data
Request a copy of all your personal data:
```
GET /gdpr/export-my-data
```

### 2. Delete Your Data
Request deletion of your account and all associated data:
```
DELETE /gdpr/delete-my-account
```

### 3. Data Portability
Export your data in JSON format for use elsewhere

### 4. Object to Processing
Contact us to object to specific data processing activities

### 5. Rectification
Update your personal information in your account settings

## Data Sharing

We **DO NOT**:
- Sell your personal data
- Share your data with third parties for marketing
- Use your data for purposes other than stated

We **MAY** share data:
- When required by law
- To protect our rights and safety
- With your explicit consent

## Cookies and Tracking

We use:
- **Authentication Tokens:** To keep you logged in (JWT tokens)
- **Local Storage:** To store preferences (theme, language)

We do NOT use:
- Third-party tracking cookies
- Advertising cookies
- Analytics cookies (unless you opt-in)

## Children's Privacy

Our service is not intended for users under 13 years of age. We do not knowingly collect data from children under 13.

## International Data Transfers

Your data may be processed in countries other than your own. We ensure appropriate safeguards are in place.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of significant changes via:
- Email notification
- In-app notification
- Updated "Last Updated" date

## Contact Us

For privacy-related questions or requests:

**Email:** privacy@presentiq.com  
**Data Protection Officer:** dpo@presentiq.com

## Your Consent

By using PresentIQ, you consent to this Privacy Policy.

## Specific Rights by Region

### European Union (GDPR)
- Right to access, rectification, erasure
- Right to data portability
- Right to object to processing
- Right to lodge a complaint with supervisory authority

### California (CCPA)
- Right to know what data is collected
- Right to delete personal information
- Right to opt-out of data sales (we don't sell data)
- Right to non-discrimination

### United Kingdom (UK GDPR)
- Same rights as EU GDPR
- Contact: ICO (Information Commissioner's Office)

## Data Breach Notification

In the event of a data breach, we will:
- Notify affected users within 72 hours
- Report to relevant authorities as required
- Take immediate action to secure systems

## Third-Party Services

We use:
- **Faster Whisper:** For speech-to-text (runs locally, no data sent)
- **scikit-learn:** For ML scoring (runs locally, no data sent)

We do NOT use third-party analytics or advertising services.

## Automated Decision Making

Our ML models make automated assessments of your pronunciation. You can:
- Request human review of scores
- Contest automated decisions
- Understand how scores are calculated

## Data Minimization

We only collect data necessary for:
- Providing the service
- Improving accuracy
- Ensuring security

We do NOT collect:
- Social media profiles
- Location data (beyond IP for security)
- Biometric data (beyond voice for assessment)
- Financial information

---

**Questions?** Contact us at privacy@presentiq.com

**Complaints?** You have the right to lodge a complaint with your local data protection authority.
