import os
from pathlib import Path
from PyPDF2 import PdfFileReader
from groq import Groq
from json_repair import repair_json
from dotenv import load_dotenv
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def predict(messages):
    """
    Sends a prompt to the Groq LLM and returns the model's response as a string.
    """
    completion = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=messages,
        temperature=0,
        max_tokens=2048,
        top_p=0,
        stream=True,
        stop=None,
    )

    output = ""
    for chunk in completion:
        output += chunk.choices[0].delta.content or ""
    return {"output": output}


def parse_resume(pdf_path: str) -> dict:
    """
    Parses a resume PDF, extracts text, sends it to Groq LLM, and returns extracted fields as a JSON dictionary.
    
    Args:
        pdf_path (str): Path to the PDF resume file.
    
    Returns:
        dict: Extracted fields (college, degree, graduating_year)
    """
    try:
        reader = PdfFileReader(open(pdf_path, "rb"))
        text = ""
        for page in reader.pages:
            text += page.extract_text()

        if len(text) > 6000:
            return {"error": "Resume is too large. Max token limit exceeded."}

        if not text.strip():
            return {"error": "No text extracted from the PDF."}

        messages = [
            {
                "role": "system",
                "content": (
                    "Extract college information where the candidate has finished and the graduating year of his "
                    "Bachelors/Engineering based on the text extracted from the PDF file of a resume. "
                    "Pick only the latest college. Do not include any additional info in the response. "
                    "Just return a JSON object with the fields: 'college', 'degree', 'graduating_year'. "
                    "If the college name is not present in the text, return an empty string."
                ),
            },
            {"role": "user", "content": f"Here is the extracted text: {text}"},
        ]

        response = predict(messages)
        clean_json = repair_json(response["output"], return_objects=True)

        return {
            "college": clean_json.get("college", ""),
            "degree": clean_json.get("degree", ""),
            "graduating_year": clean_json.get("graduating_year", "")
        }

    except Exception as e:
        return {"error": str(e)}
