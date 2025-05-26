import joblib
import os
import sys

model_path = "model/diabetes_model.pkl"
scaler_path = "model/scaler.pkl"

print(f"Attempting to load model from: {os.path.abspath(model_path)}")
print(f"Attempting to load scaler from: {os.path.abspath(scaler_path)}")

try:
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        print("SUCCESS: Model and scaler loaded successfully!")
        print(f"Model type: {type(model)}")
        print(f"Scaler type: {type(scaler)}")
except FileNotFoundError:
        print("ERROR: Model or scaler file not found. Please ensure they exist in the 'model/' directory.")
        sys.exit(1)
except Exception as e:
        print(f"CRITICAL ERROR: Failed to load model or scaler: {e}")
        import traceback
        traceback.print_exc() # Print full traceback
        sys.exit(1)

print("Independent model loading test complete.")