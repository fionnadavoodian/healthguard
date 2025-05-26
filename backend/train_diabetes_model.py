import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

def train_and_save_model(data_path='diabetes_prediction_dataset.csv', model_dir='model'):
    """
    Trains a Logistic Regression model for diabetes prediction, saves it, and prints evaluation metrics.
    """
    try:
        df = pd.read_csv(data_path)
    except FileNotFoundError:
        print(f"Error: Dataset not found at {data_path}. Please ensure the CSV file is in the correct directory.")
        return

    # Define features (X) and target (y)
    X = df.drop('diabetes', axis=1)
    y = df['diabetes']

    # Identify categorical and numerical columns
    categorical_features = ['gender', 'smoking_history']
    numerical_features = ['age', 'bmi', 'HbA1c_level', 'blood_glucose_level', 'hypertension', 'heart_disease']

    # Create preprocessing pipelines for numerical and categorical features
    numerical_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')

    # Create a preprocessor using ColumnTransformer
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numerical_transformer, numerical_features),
            ('cat', categorical_transformer, categorical_features)
        ],
        remainder='passthrough' # Keep other columns (if any)
    )

    # Create a pipeline with preprocessing and a Logistic Regression model
    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', LogisticRegression(random_state=42, solver='liblinear'))
    ])

    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # Train the entire pipeline
    print("Training model pipeline...")
    model_pipeline.fit(X_train, y_train)
    print("Model pipeline training complete.")

    # Evaluate the model
    y_pred = model_pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)

    print(f"\nModel Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(report)

    # Ensure the model directory exists
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
        print(f"Created directory: {model_dir}")

    # Extract and save the preprocessor (which acts as the scaler for the API)
    # The preprocessor is a ColumnTransformer, which itself has a .transform method
    scaler_path = os.path.join(model_dir, 'scaler.pkl')
    joblib.dump(model_pipeline.named_steps['preprocessor'], scaler_path)
    print(f"Preprocessor (scaler) saved to {scaler_path}")

    # Extract and save the classifier (the actual Logistic Regression model)
    model_path = os.path.join(model_dir, 'diabetes_model.pkl')
    joblib.dump(model_pipeline.named_steps['classifier'], model_path)
    print(f"Classifier (model) saved to {model_path}")

if __name__ == "__main__":
    train_and_save_model()
