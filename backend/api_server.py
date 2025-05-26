# ml_scripts/api_server.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import uvicorn
import pandas as pd

app = FastAPI(
    title="HealthGuard ML Inference API",
    description="API for diabetes risk prediction using a trained ML model.",
    version="1.0.0"
)

# Define the input data structure expected by the API
class DiabetesInput(BaseModel):
    gender: str
    age: int
    hypertension: int
    heart_disease: int
    smoking_history: str
    bmi: float
    HbA1c_level: float
    blood_glucose_level: int

# Load the trained model
model_path = os.path.join(os.path.dirname(__file__), 'diabetes_model.joblib')
model = None
try:
    model = joblib.load(model_path)
    print(f"Model loaded successfully from {model_path}")
except FileNotFoundError:
    print(f"Error: Model file not found at {model_path}. Please run train_diabetes_model.py first.")
    # Exit or raise error if model is critical for server start
    exit(1)
except Exception as e:
    print(f"Error loading model: {e}")
    exit(1)


@app.get("/")
async def read_root():
    return {"message": "HealthGuard ML Inference API is running. Go to /docs for API documentation."}

@app.post("/predict_diabetes")
async def predict_diabetes(data: DiabetesInput):
    if model is None:
        raise HTTPException(status_code=500, detail="ML model not loaded.")

    # Convert input data to a pandas DataFrame
    # Ensure column order matches the training data's preprocessor expectations
    input_df = pd.DataFrame([data.dict()])

    # Define the expected columns for preprocessing (order matters!)
    # These must match the `numerical_features` and `categorical_features`
    # used in `train_diabetes_model.py` and the order in `ColumnTransformer`.
    expected_columns = [
        'age', 'bmi', 'HbA1c_level', 'blood_glucose_level', 'hypertension', 'heart_disease', # Numerical
        'gender', 'smoking_history' # Categorical
    ]

    # Reorder columns to match the training data's expected order
    # This is critical because ColumnTransformer relies on column position/name.
    try:
        processed_input = input_df[expected_columns]
        # Make prediction (the loaded model pipeline handles preprocessing internally)
        prediction_raw = model.predict(processed_input)[0]
        prediction_proba = model.predict_proba(processed_input)[0].tolist() # Probability for both classes

        # Assuming class 1 is 'diabetes' and class 0 is 'no diabetes'
        diabetes_proba = prediction_proba[1]

        category = "Low Risk"
        if diabetes_proba > 0.7:
            category = "High Risk"
        elif diabetes_proba > 0.4:
            category = "Medium Risk"

        return {
            "prediction": int(prediction_raw), # 0 or 1
            "probability": round(diabetes_proba, 4), # Probability of diabetes
            "category": category,
            "message": "Prediction successful"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed due to processing error: {e}")

# To run this server: uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
# --reload is for development, remove in production
# host 0.0.0.0 allows access from other machines/docker containers