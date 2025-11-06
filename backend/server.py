from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import AIagent
from elevenlabs.client import ElevenLabs
from elevenlabs.play import play
import re
import json
import os
import base64

app = FastAPI()
agent = AIagent()
elevenlabs = ElevenLabs(
  api_key=os.getenv("ELEVENLABS_API_KEY"),
)


# ✅ Allow frontend to access backend (important for local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # use ["http://localhost:5173"] for stricter security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




# Define data model for reservation
class Reservation(BaseModel):
    fromCity: str
    toCity: str
    travelDate: str
    selectedTrain: str
    passengers: list

# Example route for reservation form submission
@app.post("/reserve")
def make_reservation(data: Reservation):
    return {"message": f"Reservation received for {len(data.passengers)} passengers from {data.fromCity} to {data.toCity}"}

# Example route for chatbot message
class ChatMessage(BaseModel):
    message: str
@app.post("/userMessageforAI")
def chat_endpoint(msg: ChatMessage):
    try:
        response = agent.get_response(msg.message)
        print("Raw AI response:", response)

        # Extract JSON inside ```json ... ``` if present
        if isinstance(response, str):
            # remove markdown code block markers
            match = re.search(r"```json\s*(.*?)\s*```", response, re.DOTALL)
            if match:
                json_str = match.group(1)
            else:
                json_str = response.strip()

            try:
                response_dict = json.loads(json_str)
            except json.JSONDecodeError:
                # fallback if not valid JSON
                response_dict = {"fillForm": False, "message": response}

        else:
            response_dict = response

        
        audio = elevenlabs.text_to_speech.convert(
            text=response_dict["message"],
            voice_id="JBFqnCBsd6RMkjVDRZzb",
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
            )
        audio_bytes = b"".join(audio)

        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

        response_dict["audio"] = audio_b64
        # print("✅ Parsed Response:", response_dict, f"\nType of response : {type(response_dict)}")
        return response_dict

    except Exception as e:
        print("Error:", e)
        return {"fillForm": False, "message": "Error occurred"}

    
