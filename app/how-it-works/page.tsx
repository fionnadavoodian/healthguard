// app/how-it-works/page.tsx
import React from "react";

const HowItWorksPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">How It Works</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          🩺 Diabetes Risk Assessment
        </h2>
        <p className="mb-2">
          This assessment uses a machine learning model trained on the{" "}
          <a
            href="https://www.kaggle.com/datasets/iammustafatz/diabetes-prediction-dataset"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Diabetes Prediction Dataset
          </a>{" "}
          from Kaggle.
        </p>
        <p className="mb-2"> </p>
        The model uses key features like:
        <ul className="list-disc list-inside ml-4">
          <li>Gender</li>
          <li>Age</li>
          <li>Smoking History</li>
          <li>BMI</li>
          <li>HbA1c Level</li>
          <li>Blood Glucose Level</li>
          <li>Hypertension and Heart Disease status</li>
        </ul>
        <p className="mb-2">
          A logistic regression model is trained with preprocessing using
          scaling and one-hot encoding. The output includes a prediction (0 or
          1) and the probability of having diabetes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          ❤️ Heart Disease Risk Prediction
        </h2>
        <p className="mb-2">
          This tool predicts cardiovascular disease using data from the{" "}
          <a
            href="https://www.kaggle.com/datasets/sulianova/cardiovascular-disease-dataset"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cardiovascular Disease Dataset
          </a>{" "}
          on Kaggle.
        </p>
        <p className="mb-2">Features used:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Age (in days)</li>
          <li>Gender</li>
          <li>Height and Weight</li>
          <li>Systolic & Diastolic blood pressure</li>
          <li>Cholesterol and Glucose levels</li>
          <li>Smoking, Alcohol, and Physical Activity status</li>
        </ul>
        <p className="mb-2">
          A deep learning model is trained using TensorFlow with dropout layers
          and early stopping. Output includes the binary prediction and
          probability of heart disease.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          🧪 Gastric Cancer Risk Estimation
        </h2>
        <p className="mb-2">
          This tool estimates the risk of developing gastric cancer based on a
          weighted risk factor model derived from medical research, specifically
          a paper from{" "}
          <a
            href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5869226/"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            the National Library of Medicine
          </a>
          .
        </p>
        <p className="mb-2">
          Factors include:
          <ul className="list-disc list-inside ml-4">
            <li>H. Pylori infection</li>
            <li>Atrophic Gastritis</li>
            <li>Gastric Surgery or Peptic Ulcer history</li>
            <li>Family History (first/second-degree)</li>
            <li>Age, Gender, Education Level</li>
            <li>Smoking status and Pack Years</li>
            <li>Dietary risks: low fruit/veg, high salt, nitrate intake</li>
          </ul>
        </p>
        <p className="mb-2">
          A weighted score is calculated, normalized to a percentage, and
          categorized as Low, Moderate, or High risk.
        </p>
      </section>

      <footer className="mt-10 text-sm text-gray-500">
        📊 All models are based on open-source datasets and research.
        Predictions are for educational purposes only and should not replace
        professional medical advice.
      </footer>
    </div>
  );
};

export default HowItWorksPage;
