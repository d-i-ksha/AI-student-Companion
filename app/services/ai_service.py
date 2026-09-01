import os

from dotenv import load_dotenv
from google import genai


load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY is not set")


client = genai.Client(api_key=API_KEY)


def generate_summary(text: str) -> str:
    prompt = f"""
You are an AI study assistant.

Summarize the following study material for a college student.

Requirements:
- Give a clear overall summary.
- Identify the most important concepts.
- Use simple language.
- Use headings and bullet points where useful.
- Do not invent information that is not present in the provided material.

STUDY MATERIAL:

{text}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text