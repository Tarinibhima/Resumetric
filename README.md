# Resumetric — AI-Powered Resume Analyzer

> We analyze. You optimize.

A production-grade resume analysis platform that evaluates resumes against job descriptions, calculates ATS scores, and provides keyword-based improvement suggestions.

---

## Architecture

```
resumetric/
├── client/          # React + Vite + Tailwind frontend
├── server/          # Node.js + Express backend (auth, API gateway)
├── ml-service/      # Python FastAPI NLP microservice
├── .env.example
└── README.md
```

---

## Prerequisites

- Node.js >= 18
- Python >= 3.10
- MongoDB (local or Atlas URI)

---

## Setup

### 1. Clone & configure environment

```bash
cp .env.example .env
# Fill in your values in .env
```

### 2. Start the ML microservice

```bash
cd ml-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --port 8000 --reload
```

### 3. Start the Node backend

```bash
cd server
npm install
npm run dev
```

### 4. Start the React frontend

```bash
cd client
npm install
npm run dev
```

The app will be at `http://localhost:5173`.

---

## Environment Variables

See `.env.example` for all required variables.

---

## Security Features

- JWT authentication with expiry
- bcrypt password hashing (cost factor 12)
- Rate limiting: 5 login attempts / 15 min
- Input sanitization with express-validator
- Helmet.js security headers
- CORS restricted to allowed origins
- No secrets in source code

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in, receive JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Analysis
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/analyze` | Upload resume + JD, get ATS score (protected) |

---

## License

MIT
