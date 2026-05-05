from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import speech_recognition as sr
from pydub import AudioSegment
import os
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recognizer = sr.Recognizer()

@app.get("/")
def home():
    return {"message": "Speech To Text API Running"}

@app.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form(...)
):
    try:
        # ✅ Get file extension dynamically
        file_ext = file.filename.split(".")[-1]

        unique_id = str(uuid.uuid4())
        input_file = f"temp_{unique_id}.{file_ext}"
        wav_file = f"temp_{unique_id}.wav"

        # Save uploaded file
        with open(input_file, "wb") as f:
            f.write(await file.read())

        # Convert ANY format → WAV
        audio = AudioSegment.from_file(input_file)
        audio.export(wav_file, format="wav")

        # Speech Recognition
        with sr.AudioFile(wav_file) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language=language)

        return {
            "success": True,
            "transcript": text
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

    finally:
        # Cleanup files
        if os.path.exists(input_file):
            os.remove(input_file)
        if os.path.exists(wav_file):
            os.remove(wav_file)