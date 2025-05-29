# //backend/api_server.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib
import os
from fastapi.middleware.cors import CORSMiddleware
from typing import Literal
from typing import Optional


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
    raise RuntimeError(
        f"Pipeline file not found at {pipeline_path}. Please train the model first.")

pipeline = joblib.load(pipeline_path)

heart_model_path = "model/heart/heart_disease_model.pkl"
heart_scaler_path = "model/heart/scaler.pkl"
heart_features_path = "model/heart/feature_names.pkl"
if not os.path.exists(heart_model_path):
    raise RuntimeError(
        f"Heart disease model not found at {heart_model_path}. Please train the model first.")
if not os.path.exists(heart_scaler_path):
    raise RuntimeError(
        f"Heart disease scaler not found at {heart_scaler_path}. Please train the model first.")
if not os.path.exists(heart_features_path):
    raise RuntimeError(
        f"Heart disease feature list not found at {heart_features_path}. Please train the model first.")

model = joblib.load(heart_model_path)
scaler = joblib.load(heart_scaler_path)
feature_names = joblib.load(heart_features_path)


class DiabetesData(BaseModel):
    gender: str
    age: int
    hypertension: int
    heart_disease: int
    smoking_history: str
    bmi: float
    HbA1c_level: float
    blood_glucose_level: int


class HeartDiseaseData(BaseModel):
    age: int  # in days
    height: int  # in cm
    weight: float  # in kg
    gender: int  # categorical code
    ap_hi: int  # systolic
    ap_lo: int  # diastolic
    cholesterol: int  # 1, 2, 3
    gluc: int  # 1, 2, 3
    smoke: int  # binary
    alco: int  # binary
    active: int  # binary


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API server is running."}


@app.post("/diabetes-risk")
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


WEIGHTS = {
    'hpylori': 0.9,
    'atrophic_gastritis': 0.8,
    'peptic_ulcer': 0.5,
    'gastric_surgery': 0.7,
    'pernicious_anemia': 0.4,
    'family_history': 0.9,
    'age': 0.7,
    'gender': 0.4,
    'education': 0.6,
    'smoking': 0.6,
    'pack_years_smoking': 0.7,
    'low_veg_fruit': 0.7,
    'high_salt_intake': 0.8,
    'high_nitrate': 0.8
}


def map_binary(value): return 1 if value else 0


def map_family_history(level):
    return {
        'non-relative': 0,
        'second-degree': 0.5,
        'first-degree': 1
    }.get(level.lower(), 0)


def map_age(age):
    if 20 <= age <= 45:
        return 0.3
    elif 35 < age <= 65:
        return 0.7
    elif 55 < age <= 100:
        return 1.0
    return 0


def map_gender(gender): return 1 if gender.lower() == 'male' else 0


def map_education(level):
    return {
        'literacy': 0.25,
        'elementary': 0.5,
        'secondary': 0.75,
        'high educational': 1
    }.get(level.lower(), 0)


def map_pack_years(pack_years):
    return {
        'never': 0,
        'ex-smoker': 0.5,
        'current smoker': 1
    }.get(pack_years.lower(), 0)


def gastric_cancer_risk_score(data):
    score = 0
    score += WEIGHTS['hpylori'] * map_binary(data.hpylori)
    score += WEIGHTS['atrophic_gastritis'] * \
        map_binary(data.atrophic_gastritis)
    score += WEIGHTS['peptic_ulcer'] * map_binary(data.peptic_ulcer)
    score += WEIGHTS['gastric_surgery'] * map_binary(data.gastric_surgery)
    score += WEIGHTS['pernicious_anemia'] * map_binary(data.pernicious_anemia)
    score += WEIGHTS['family_history'] * \
        map_family_history(data.family_history)
    score += WEIGHTS['age'] * map_age(data.age)
    score += WEIGHTS['gender'] * map_gender(data.gender)
    score += WEIGHTS['education'] * map_education(data.education)
    score += WEIGHTS['smoking'] * map_binary(data.smoking)
    score += WEIGHTS['pack_years_smoking'] * \
        map_pack_years(data.pack_years_smoking)
    score += WEIGHTS['low_veg_fruit'] * map_binary(data.low_veg_fruit)
    score += WEIGHTS['high_salt_intake'] * map_binary(data.high_salt_intake)
    score += WEIGHTS['high_nitrate'] * map_binary(data.high_nitrate)

    max_score = sum(WEIGHTS.values())
    return (score / max_score) * 100


def risk_category(score):
    if score < 30:
        return "Low risk"
    elif score < 60:
        return "Moderate risk"
    else:
        return "High risk"


class GastricCancerData(BaseModel):
    hpylori: bool
    atrophic_gastritis: bool
    peptic_ulcer: bool
    gastric_surgery: bool
    pernicious_anemia: bool
    family_history: Literal['non-relative', 'second-degree', 'first-degree']
    age: int
    gender: Literal['male', 'female']
    education: Literal['literacy', 'elementary',
                       'secondary', 'high educational']
    smoking: bool
    pack_years_smoking: Literal['never', 'ex-smoker', 'current smoker']
    low_veg_fruit: bool
    high_salt_intake: bool
    high_nitrate: bool


@app.post("/gastric-cancer")
def assess_gastric_risk(data: GastricCancerData):
    try:
        score = gastric_cancer_risk_score(data)
        category = risk_category(score)
        return {
            "score_percentage": round(score, 1),
            "risk_category": category
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Risk calculation error: {e}")


@app.post("/heart-disease")
def predict_heart_disease(data: HeartDiseaseData):
    try:
        age_years = int(round(data.age / 365))
        bmi = data.weight / ((data.height / 100) ** 2)
        pulse_pressure = data.ap_hi - data.ap_lo

        input_dict = {
            "age": age_years,
            "height": data.height,
            "weight": data.weight,
            "gender": data.gender,
            "ap_hi": data.ap_hi,
            "ap_lo": data.ap_lo,
            "cholesterol": data.cholesterol,
            "gluc": data.gluc,
            "smoke": data.smoke,
            "alco": data.alco,
            "active": data.active
            # Include these only if they were used in training:
            # "bmi": bmi,
            # "pulse_pressure": pulse_pressure
        }

        input_df = pd.DataFrame([input_dict])
        input_df = input_df[feature_names]  # enforce order and columns

        input_scaled = scaler.transform(input_df)
        prediction = model.predict(input_scaled)[0]
        pred_proba = model.predict_proba(input_scaled)[0][1]

        return {
            "prediction": int(prediction),
            "probability_of_heart_disease": round(float(pred_proba), 4)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")
