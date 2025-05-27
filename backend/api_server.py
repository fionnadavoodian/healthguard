from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline_path = "model/pipeline.pkl"

if not os.path.exists(pipeline_path):
    raise RuntimeError(f"Pipeline file not found at {pipeline_path}. Please train the model first.")

pipeline = joblib.load(pipeline_path)

class DiabetesData(BaseModel):
    gender: str
    age: int
    hypertension: int
    heart_disease: int
    smoking_history: str
    bmi: float
    HbA1c_level: float
    blood_glucose_level: int

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API server is running."}

@app.post("/predict")
def predict_diabetes(data: DiabetesData):
    input_df = pd.DataFrame([{
        "gender": data.gender,
        "age": data.age,
        "hypertension": data.hypertension,
        "heart_disease": data.heart_disease,
        "smoking_history": data.smoking_history,
        "bmi": data.bmi,
        "HbA1c_level": data.HbA1c_level,
        "blood_glucose_level": data.blood_glucose_level
    }])

    try:
        prediction = pipeline.predict(input_df)[0]
        probability = pipeline.predict_proba(input_df)[0][1]

        return {
            "prediction": int(prediction),
            "probability_of_diabetes": round(float(probability), 4)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")
