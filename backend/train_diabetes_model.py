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
    try:
        df = pd.read_csv(data_path)
    except FileNotFoundError:
        print(f"Error: Dataset not found at {data_path}. Please ensure the CSV file is in the correct directory.")
        return

    # Define features (X) and target (y)
    X = df.drop('diabetes', axis=1)
    y = df['diabetes']

    categorical_features = ['gender', 'smoking_history']
    numerical_features = ['age', 'bmi', 'HbA1c_level', 'blood_glucose_level', 'hypertension', 'heart_disease']

    numerical_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numerical_transformer, numerical_features),
            ('cat', categorical_transformer, categorical_features)
        ],
        remainder='passthrough'
    )

    model_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', LogisticRegression(random_state=42, solver='liblinear'))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("Training model pipeline...")
    model_pipeline.fit(X_train, y_train)
    print("Training complete.")

    y_pred = model_pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy:.4f}")
    print("Classification report:")
    print(classification_report(y_test, y_pred))

    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    pipeline_path = os.path.join(model_dir, 'pipeline.pkl')
    joblib.dump(model_pipeline, pipeline_path)
    print(f"Pipeline saved to {pipeline_path}")

if __name__ == "__main__":
    train_and_save_model()
