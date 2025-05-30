# heartdisease.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb
import joblib
import os


def load_data():
    df = pd.read_csv("cardio_train.csv", sep=';')

    if 'id' in df.columns:
        df.drop(columns=['id'], inplace=True)

    df['age'] = (df['age'] / 365).round().astype(int)
    return df


def preprocess_data(df):
    X = df.drop('cardio', axis=1)
    y = df['cardio']

    feature_names = X.columns.tolist()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = pd.DataFrame(
        scaler.fit_transform(X_train), columns=feature_names)
    X_test_scaled = pd.DataFrame(
        scaler.transform(X_test), columns=feature_names)

    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, feature_names


def train_model(X_train, y_train):
    model = xgb.XGBClassifier(
        n_estimators=300,
        learning_rate=0.03,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        gamma=1,
        reg_alpha=0.1,
        reg_lambda=1,
        random_state=42,
        n_jobs=-1,
        eval_metric='logloss'
    )
    model.fit(X_train, y_train)
    return model


def evaluate_model(model, X_test, y_test):
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)
    print(f"Accuracy: {accuracy:.4f}")
    print("Classification Report:")
    print(report)


def save_model(model, scaler, feature_names):
    model_dir = "./model/heart"
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(model, os.path.join(model_dir, 'heart_disease_model.pkl'))
    joblib.dump(scaler, os.path.join(model_dir, 'scaler.pkl'))
    joblib.dump(feature_names, os.path.join(model_dir, 'feature_names.pkl'))
    print("Model, scaler, and feature names saved.")


if __name__ == "__main__":
    df = load_data()
    X_train, X_test, y_train, y_test, scaler, feature_names = preprocess_data(
        df)
    model = train_model(X_train, y_train)
    evaluate_model(model, X_test, y_test)
    save_model(model, scaler, feature_names)
