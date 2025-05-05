import React from "react";
import DiseaseCard from "./DiseaseCard";

const InfoDisease = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-6">
      <DiseaseCard
        title="Gastric Cancer Risk"
        imageSrc="gastricCancer.svg"
        description="A Mamdani fuzzy expert system with 67 rules in MATLAB that models clinical factors to classify individuals into low, moderate, high, or very high risk; achieved 92.1% sensitivity and 83.1% specificity."
      />
      <DiseaseCard
        title="Diabetes Risk"
        imageSrc="diabetes.svg"
        description="An interpretable fuzzy rule–based model combining cosine amplitude classifiers, with 76 expert‑derived rules applied to a public dataset, achieving 96.47% accuracy in early diabetes diagnosis."
      />
      <DiseaseCard
        title="Heart Disease Risk"
        imageSrc="../heartDisease.svg"
        description="A web‑based fuzzy expert system using Mamdani inference over clinician‑validated IF‑THEN rules on key cardiovascular inputs, providing accurate prognosis in a cost‑effective, accessible format."
      />
    </div>
  );
};

export default InfoDisease;
