TRACK_ID=PS02

# ClaimLens AI

ClaimLens AI is an evidence review assistant for motor insurance claims. It combines deterministic document checks, local policy retrieval, and Gemini-based reasoning to help investigators review claim files.

## Purpose

Motor insurance claim files can contain missing documents, inconsistent dates or damage descriptions, and policy questions that are difficult to review manually. ClaimLens AI organizes the available evidence, identifies review findings, retrieves relevant policy clauses, and provides an evidence-grounded recommendation for human review.

## Implemented Capabilities

- Motor insurance claim evidence review
- Deterministic completeness checks
- Deterministic consistency and contradiction detection
- Policy clause retrieval using local RAG and local policy embeddings
- Gemini-based evidence-grounded reasoning
- Deterministic claim metadata extraction from claim documents
- Recommendations: `APPROVE`, `REJECT`, `REQUEST INFORMATION`, and `ESCALATE TO INVESTIGATOR`
- Human investigator remains the final decision-maker

## Architecture

```text
Claim Markdown documents + local policy
	-> Python document loader
	-> deterministic rules and contradiction detection
	-> local policy embedding retrieval
	-> Gemini evidence-grounded reasoning
	-> ClaimReview JSON response
	-> static Vite frontend dashboard
```

The Python application serves both the API and the already-built frontend. The frontend uses relative API URLs and hash-based routing, so no separate frontend server is required at runtime.

## Requirements

- Python 3.11
- A Gemini API key available as the `GEMINI_API_KEY` environment variable

## Fresh-Clone Setup

From the repository root:

```powershell
pip install -r requirements.txt
$env:GEMINI_API_KEY="your-key"
python app.py
```

Open [http://localhost:8000/](http://localhost:8000/) in a browser.

On Linux or macOS, configure the equivalent `GEMINI_API_KEY` environment variable in the shell before running `python app.py`.

The Gemini API key must never be committed to Git. Use an environment variable or another local secret-management mechanism. Do not place a real key in source files, `.env.example`, or documentation.

## Runtime Architecture

`frontend/dist` is already built and served by `app.py`. The evaluator does not need to run npm, start a second terminal, or run a frontend development server.

The policy retrieval layer uses local policy embeddings and local RAG. No hosted vector database or additional backend service is required.

## API Endpoints

- `GET /api/health`
- `GET /api/claims`
- `GET /api/claims/<claim_id>/review`

Example claim IDs:

- `CLM-001`
- `CLM-002`
- `CLM-003`

## Demonstration Scenarios

- `CLM-001`: Normal, internally consistent claim suitable for approval consideration.
- `CLM-002`: Contradictory evidence requiring escalation to an investigator.
- `CLM-003`: Incomplete and late-reported claim requiring additional information.

Recommendations assist the investigator; they do not replace the investigator's final decision.

## Project Status

The application is implemented and runnable locally with `python app.py` after installing the listed Python dependencies and configuring `GEMINI_API_KEY`.