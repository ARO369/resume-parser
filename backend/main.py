from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import tempfile
from PyPDF2 import PdfReader
from parse import predict
from json_repair import repair_json
import re
from dotenv import load_dotenv

load_dotenv()  

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Resume Parser Backend is up and running!"}

def extract_email(text):
    match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    return match.group(0) if match else ""

def extract_phone(text):
    match = re.search(r"\+?\d[\d\s\-()]{8,}", text)
    return match.group(0) if match else ""

def extract_name(text):
    for line in text.split('\n'):
        if line.strip():
            return line.strip()
    return ""

# Resume upload route
@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Try reading PDF
        try:
            reader = PdfReader(tmp_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
        except Exception as pdf_error:
            os.remove(tmp_path)
            return JSONResponse(
                status_code=400,
                content={"error": "Unable to read PDF. Make sure it is a valid resume PDF."}
            )

        # Check if any meaningful text was extracted
        if not text.strip():
            os.remove(tmp_path)
            return JSONResponse(
                status_code=400,
                content={"error": "No readable text found in the resume."}
            )

        if len(text) > 6000:
            return JSONResponse(
                status_code=400,
                content={"error": "Resume too long to process."}
            )

        # Prompt for the LLM
        messages = [
            {
                "role": "system",
                "content": "Extract college information where the candidate has finished and the graduating year of his Bachelors/engineering based on the text extracted from the pdf file of a resume, pick only the latest college. Do not include any additional info. Return a JSON with fields: college, degree, graduating_year. If info is missing, return empty strings.",
            },
            {"role": "user", "content": f"here is the extracted text: {text}"},
        ]
        llm_response = predict(messages)
        clean_json = repair_json(llm_response["output"], return_objects=True)

        result = {
            "name": extract_name(text),
            "email": extract_email(text),
            "phone": extract_phone(text),
            "college": clean_json.get("college", ""),
            "degree": clean_json.get("degree", ""),
            "graduating_year": clean_json.get("graduating_year", "")
        }

        os.remove(tmp_path)
        return result

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"An error occurred: {str(e)}"}
        )
