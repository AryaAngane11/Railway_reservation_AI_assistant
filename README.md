# 🚆 Railway Reservation AI Assistant

An AI-powered railway booking assistant with FastAPI backend, GeminiAi model and React frontend.

## 🧠 Features
- Conversational AI for ticket booking
- Auto-filling railway form
- Text-to-speech using ElevenLabs
- React + Tailwind UI

## ⚙️ Setup

### Start Backend server  ###

cd backend
python -m venv .venv
.venv\Scripts\activate   # or source .venv/bin/activate
pip install -r requirements.txt
(Create your .env file with required API keys)
uvicorn server:app --reload



### Frontend ###
cd frontend
npm install
npm run dev


