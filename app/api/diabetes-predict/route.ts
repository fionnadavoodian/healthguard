import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Import your Database type for type safety
import { Database } from "@/types/supabase";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

  const {
    gender,
    age,
    hypertension,
    heart_disease,
    smoking_history,
    bmi,
    HbA1c_level,
    blood_glucose_level,
  } = await request.json();

  // Get the current user's ID
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    // 1. Forward data to Python backend
    const pythonBackendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:8000/predict";
    const pythonResponse = await fetch(pythonBackendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gender,
        age,
        hypertension,
        heart_disease,
        smoking_history,
        bmi,
        HbA1c_level,
        blood_glucose_level,
      }),
    });

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      console.error("Python backend error response:", errorText);
      return NextResponse.json(
        { error: `Python backend error: ${pythonResponse.statusText}. Details: ${errorText.substring(0, 200)}...` },
        { status: pythonResponse.status }
      );
    }

    const predictionData = await pythonResponse.json();

    // Extract prediction values
    const predictionCategory = predictionData.category;
    const predictionScore = predictionData.probability;

    // 2. Save prediction and input data to Supabase
    const { data: savedAssessment, error: dbError } = await supabase
      .from("diabetes_assessments")
      .insert({
        user_id: user.id,
        gender,
        age,
        hypertension: !!hypertension, // Convert 0/1 to boolean
        heart_disease: !!heart_disease, // Convert 0/1 to boolean
        smoking_history,
        bmi,
        hba1c_level: HbA1c_level, // Correct column name
        blood_glucose_level,
        prediction_category: predictionCategory,
        prediction_score: predictionScore,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error saving assessment to DB:", dbError);
      return NextResponse.json(
        { error: "Failed to save assessment to database." },
        { status: 500 }
      );
    }

    // 3. Return the prediction result to the frontend
    return NextResponse.json({
      prediction: predictionData.prediction, // Assuming this is the raw 0/1 prediction
      probability: predictionScore,
      category: predictionCategory,
    });
  } catch (error: any) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
