from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(
    title="VeriTrust AI Service",
    version="1.0.0",
)


class AnalysisRequest(BaseModel):
    file_url: str
    file_type: str


@app.get("/")
def root():
    return {
        "success": True,
        "service": "VeriTrust-AI",
        "status": "running",
    }


@app.post("/analyze")
def analyze(request: AnalysisRequest):
    return {
        "success": True,
        "message": "AI analysis service is working",
        "file_url": request.file_url,
        "file_type": request.file_type,
    }