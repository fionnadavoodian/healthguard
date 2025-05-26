// app/api/diabetes-predict/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/clients'; // Adjust this import based on your actual Supabase client initialization

// Define the URL of your Python ML Inference Server
// IMPORTANT: Ensure this matches the host/port where your FastAPI server is running
const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_BASE_URL || 'http://localhost:8000';

export async function POST(req: Request) {
  try {
    const supabase = createClient(); // Initialize Supabase client

    const {
      gender,
      age,
      hypertension,
      heart_disease,
      smoking_history,
      bmi,
      HbA1c_level,
      blood_glucose_level,
    } = await req.json();

    // Basic validation (more robust validation should be in lib/validators.ts)
    // Ensure inputs are numbers where expected, and non-empty strings
    if (
      typeof gender !== 'string' || !gender ||
      typeof age !== 'number' || isNaN(age) ||
      typeof hypertension !== 'number' || isNaN(hypertension) ||
      typeof heart_disease !== 'number' || isNaN(heart_disease) ||
      typeof smoking_history !== 'string' || !smoking_history ||
      typeof bmi !== 'number' || isNaN(bmi) ||
      typeof HbA1c_level !== 'number' || isNaN(HbA1c_level) ||
      typeof blood_glucose_level !== 'number' || isNaN(blood_glucose_level)
    ) {
      return NextResponse.json({ error: 'Invalid input data. Please provide all required fields with correct types.' }, { status: 400 });
    }

    // --- START: CALL TO PYTHON ML INFERENCE SERVER ---
    const mlApiResponse = await fetch(`${BACKEND_API_BASE_URL}/predict_diabetes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
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

    if (!mlApiResponse.ok) {
        const errorData = await mlApiResponse.json();
        console.error('ML API error response:', errorData);
        // Provide a more user-friendly error message based on common issues
        let errorMessage = 'ML prediction service error.';
        if (mlApiResponse.status === 422) { // Unprocessable Entity - likely validation error on ML server side
            errorMessage = 'Invalid data sent to ML service. Please check your inputs.';
        } else if (mlApiResponse.status === 500) {
            errorMessage = 'An error occurred in the ML prediction service.';
        }
        return NextResponse.json({ error: errorData.detail || errorMessage }, { status: mlApiResponse.status });
    }

    const mlPrediction = await mlApiResponse.json();
    // --- END: CALL TO PYTHON ML INFERENCE SERVER ---

    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }

    // Save assessment results to Supabase
    const { data: insertData, error: insertError } = await supabase
      .from('diabetes_assessments')
      .insert({
        user_id: user.id,
        gender,
        age,
        hypertension: Boolean(hypertension), // Convert 0/1 to boolean for Supabase
        heart_disease: Boolean(heart_disease), // Convert 0/1 to boolean for Supabase
        smoking_history,
        bmi,
        hba1c_level: HbA1c_level,
        blood_glucose_level,
        prediction_score: mlPrediction.probability, // Use probability from ML API
        prediction_category: mlPrediction.category, // Use category from ML API
      })
      .select();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save assessment result.' }, { status: 500 });
    }

    // Return the prediction data received from the ML server to the frontend
    return NextResponse.json({
        prediction: mlPrediction.prediction, // 0 or 1 (binary output)
        probability: mlPrediction.probability, // Risk score (e.g., 0.0-1.0)
        category: mlPrediction.category,       // Categorical risk (Low, Medium, High)
        message: "Prediction successful and saved."
    }, { status: 200 });

  } catch (error) {
    console.error('Error during diabetes prediction:', error);
    // Distinguish between network error and other errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return NextResponse.json({ error: 'Could not connect to ML prediction service. Please ensure it is running at ' + BACKEND_API_BASE_URL }, { status: 503 });
    }
    return NextResponse.json({ error: 'Internal server error during prediction.' }, { status: 500 });
  }
}