# api_server.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import logging
import os

# Configure logging to show more details
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
origins = [
    "http://localhost:3000",  # Your Next.js frontend URL
    "http://127.0.0.1:3000",
    # Add your deployed frontend URL here when you deploy
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model and scaler globally when the app starts
model = None
scaler = None

@app.on_event("startup") # Use FastAPI's startup event for model loading
async def load_ml_models():
    global model, scaler
    try:
        model_path = "model/diabetes_model.pkl"
        scaler_path = "model/scaler.pkl"

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            model = joblib.load(model_path)
            scaler = joblib.load(scaler_path)
            logger.info(f"ML model loaded successfully from {model_path} and {scaler_path}")
        else:
            logger.error(f"Model or scaler file not found. Ensure '{model_path}' and '{scaler_path}' exist.")
            raise RuntimeError("ML model or scaler file not found. Server cannot start.")
    except Exception as e:
        logger.error(f"Error loading ML model at startup: {e}", exc_info=True)
        raise RuntimeError(f"Failed to load ML model: {e}")

class DiabetesData(BaseModel):
    gender: str
    age: float
    hypertension: int
    heart_disease: int
    smoking_history: str
    bmi: float
    HbA1c_level: float
    blood_glucose_level: float

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "FastAPI server is running and healthy."}

@app.post("/predict")
async def predict_diabetes(data: DiabetesData):
    logger.info(f"Received prediction request with data: {data.model_dump_json()}")

    if model is None or scaler is None:
        logger.error("Prediction requested but ML model or scaler is not loaded (should have failed at startup).")
        raise HTTPException(status_code=500, detail="ML prediction service not ready. Model or scaler failed to load during startup.")

    gender_map = {"Female": 0, "Male": 1, "Other": 2}
    smoking_history_map = {
        "never": 0, "No Info": 1, "current": 2,
        "former": 3, "ever": 4, "not current": 5
    }

    try:
        gender_encoded = gender_map.get(data.gender)
        smoking_history_encoded = smoking_history_map.get(data.smoking_history)

        if gender_encoded is None:
            logger.error(f"Invalid gender value: {data.gender}")
            raise HTTPException(status_code=422, detail=f"Invalid 'gender' value: {data.gender}. Must be one of {list(gender_map.keys())}")
        if smoking_history_encoded is None:
            logger.error(f"Invalid smoking_history value: {data.smoking_history}")
            raise HTTPException(status_code=422, detail=f"Invalid 'smoking_history' value: {data.smoking_history}. Must be one of {list(smoking_history_map.keys())}")

        # Construct features array with explicit types for robustness
        features = np.array([
            float(gender_encoded), # Ensure float type
            float(data.age),
            float(data.hypertension),
            float(data.heart_disease),
            float(smoking_history_encoded), # Ensure float type
            float(data.bmi),
            float(data.HbA1c_level),
            float(data.blood_glucose_level)
        ]).reshape(1, -1)

        logger.info(f"Features prepared for scaling (before reshape): {features.flatten()}")
        logger.info(f"Features array shape: {features.shape}")
        logger.info(f"Features array dtype: {features.dtype}")


        scaled_features = scaler.transform(features)
        logger.info(f"Features scaled: {scaled_features}")
        logger.info(f"Scaled features shape: {scaled_features.shape}")
        logger.info(f"Scaled features dtype: {scaled_features.dtype}")


        prediction_proba = model.predict_proba(scaled_features)[:, 1][0]
        prediction_class = (prediction_proba > 0.5).astype(int)

        category = "Low Risk"
        if prediction_proba >= 0.7:
            category = "High Risk"
        elif prediction_proba >= 0.4:
            category = "Medium Risk"

        logger.info(f"Prediction made: class={prediction_class}, probability={prediction_proba}, category={category}")

        return {
            "prediction": prediction_class.item(),
            "probability": prediction_proba.item(),
            "category": category,
        }

    except KeyError as e:
        logger.error(f"KeyError during feature mapping: {e}. Check categorical values.", exc_info=True)
        raise HTTPException(status_code=422, detail=f"Missing or invalid categorical value: {e}. Please ensure all string inputs match expected categories.")
    except ValueError as e:
        logger.error(f"ValueError during data processing or prediction: {e}", exc_info=True)
        raise HTTPException(status_code=422, detail=f"Data processing error: {e}. Ensure numerical inputs are valid.")
    except Exception as e:
        logger.error(f"Unhandled error during prediction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during prediction: {e}")
