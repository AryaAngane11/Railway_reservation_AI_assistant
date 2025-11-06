import os
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import Optional, Literal
import json
load_dotenv()

class PassengerInfo(BaseModel):
    """Details for each passenger"""
    name: str = Field(..., description="Name of the passenger")
    age: int = Field(..., description="Age of the passenger")
    gender: str = Field(..., description="Gender of the passenger (Male/Female/Other)")


class FormFields(BaseModel):
    """Form fields for railway reservation"""
    startDestination: Optional[str] = Field(None, description="Starting city or station name")
    endDestination: Optional[str] = Field(None, description="Ending city or station name")
    dateOfJourney: Optional[str] = Field(None, description="Date of journey in YYYY-MM-DD format")
    trainName: Optional[Literal[
        "Rajdhani Express",
        "Duronto Express",
        "Shatabdi Express",
        "Garib Rath Express",
        "Vande Bharat Express"
    ]] = Field(None, description="Train name selected from available options")
    numberOfPassengers: Optional[int] = Field(None, description="Total number of passengers")
    passengers: Optional[list[PassengerInfo]] = Field(
        None, description="List of passengers with their details"
    )


class AgentResponse(BaseModel):
     """Structured AI agent response format"""
     fillForm: bool = Field(description="True is frontend form should be autofilled or False if just message is to be displayed")
     message: str = Field(description="Message that is to be shown to user")
     formFields: Optional[FormFields] = Field(
          None,
          description="Form data for railway reservation booking"
     )


class AIagent:
    """AI agent class"""
    def __init__(self):
        self.client = OpenAI(
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            api_key=os.getenv("API_KEY")
        )
        self.SYSTEM_PROMPT = f"""
            You are a helpful AI Railway Booking Assistant.

            Your job is to:
            1. Help the user fill out a railway reservation form step by step using the structure defined in the FormFields schema below.
            2. If the user only asks a question (not form-related), set "fillForm": false.
            3. If the user provides or confirms booking details, set "fillForm": true and include all known fields in "formFields".
            4. Ask for missing form fields politely and incrementally if required (e.g., ask for train name or travel date).

            ### Important:
            - You MUST return a valid JSON object — not Markdown or text.
            - Do NOT include code fences (```json or ```).
            - Do NOT include explanations, comments, or extra text.
            - Your entire reply MUST be a single valid JSON object following AgentResponse exactly.
            ### FormFields Schema
            {FormFields.model_json_schema()}

            ### AgentResponse Schema
            {AgentResponse.model_json_schema()}

            ### Important:
            - Always return **only JSON** (no natural language outside JSON).
            - Never include comments or explanations outside JSON.
            - Use exact field names from the schema.

        
            **Example repsonse:**
            {{
            "fillForm": true,
            "message": "I've filled in the form based on your details.",
            "formFields": {{
                "startDestination": "Mumbai",
                "endDestination": "Delhi",
                "dateOfJourney": "2025-11-06",
                "trainName": "Rajdhani Express",
                "numberOfPassengers": 2,
                "passengers": [
                {{
                    "name": "Arya Angane",
                    "age": 22,
                    "gender": "Male"
                }},
                {{
                    "name": "Riya Sharma",
                    "age": 21,
                    "gender": "Female"
                }}
                ]
            }}
            }}
"""

            
        
        self.messages = [
              {"role": "system", "content": self.SYSTEM_PROMPT},
        ]

    def get_response(self, user_input: str) -> dict:
        if not user_input.strip():
            return {"fillForm": False, "message": "Please enter a valid query"}

        try:
            self.messages.append({"role": "user", "content": user_input})
            response = self.client.chat.completions.create(
                model="gemini-2.5-flash",
                messages=self.messages
            )

            ai_output = response.choices[0].message.content
            self.messages.append({"role": "assistant", "content": ai_output})

            # Try parsing JSON (since we instructed the model to return JSON)
            try:
                parsed_output = json.loads(ai_output)
                return parsed_output
            except json.JSONDecodeError:
                # fallback in case model doesn't strictly return JSON
                return {"fillForm": False, "message": ai_output}

        except Exception as e:
            print("AI error", e)
            return {"fillForm": False, "message": "Sorry, I couldn't process your query"}


# agent = AIagent()


# while(True):
#     query = input("👤 : ")
#     reponse = agent.get_response(query)
#     print(reponse)
#     print("\n\n🤖 : ",reponse.message)