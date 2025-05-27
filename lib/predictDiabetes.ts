// lib/predictDiabetes.ts

type DiabetesPayload = {
  gender: string;
  age: number;
  hypertension: number;
  heart_disease: number;
  smoking_history: string;
  bmi: number;
  HbA1c_level: number;
  blood_glucose_level: number;
};

export async function predictDiabetes(payload: DiabetesPayload) {
  try {
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Prediction failed.");
    }

    return result;
  } catch (error: any) {
    console.error("Error in predictDiabetes:", error.message);
    throw new Error(error.message || "Something went wrong.");
  }
}
