import { NextRequest, NextResponse } from "next/server";

console.log("Node.js Version in route.ts:", process.version);

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("Route.ts: Received data from frontend:", data);

    let backendEndpoint: string;
    let probabilityKey: string;
    let predictionKey: string | null; // Null for cases where category is directly provided

    // Determine which assessment type it is based on unique fields
    // Assuming 'hpylori' is unique to Gastric Cancer
    const isGastricAssessment = data.hpylori !== undefined;
    // Assuming 'ap_hi' is unique to Cardiovascular Disease
    const isCardioAssessment = data.ap_hi !== undefined;
    // If neither, assume it's Diabetes (based on the original structure)

    if (isGastricAssessment) {
      backendEndpoint = "http://localhost:8000/gastric-cancer";
      probabilityKey = "score_percentage"; // Key for probability/score in gastric response
      predictionKey = null; // Gastric backend directly provides 'risk_category'
    } else if (isCardioAssessment) {
      backendEndpoint = "http://localhost:8000/heart-disease"; // New endpoint for CVD
      probabilityKey = "probability_of_heart_disease"; // Key for probability in cardio response
      predictionKey = "prediction"; // Key for binary prediction in cardio response
    } else {
      // Default to Diabetes if not gastric or cardio
      backendEndpoint = "http://localhost:8000/diabetes-risk"; // Corrected direct call to FastAPI
      probabilityKey = "probability_of_diabetes"; // Key for probability in diabetes response
      predictionKey = "prediction"; // Key for binary prediction in diabetes response
    }

    console.log(`Route.ts: Calling backend endpoint: ${backendEndpoint}`);

    const backendResponse = await fetch(backendEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const text = await backendResponse.text();
    console.log(`Route.ts: Raw response text from backend (${backendEndpoint}):`, text);

    if (!backendResponse.ok) {
      console.error(`Backend error (${backendEndpoint}):`, text);
      return NextResponse.json(
        { error: `FastAPI error from ${backendEndpoint}`, detail: text },
        { status: backendResponse.status }
      );
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch (err) {
      console.error(`Route.ts: Failed to parse JSON from ${backendEndpoint}:`, err);
      return NextResponse.json(
        { error: `FastAPI response from ${backendEndpoint} was not valid JSON.`, text },
        { status: 500 }
      );
    }

    console.log(`Route.ts: Parsed response from backend (${backendEndpoint}):`, result);

    // Construct the response based on the assessment type
    if (isGastricAssessment) {
      // Gastric cancer response directly uses risk_category from backend
      return NextResponse.json({
        ...result, // Should contain risk_category and score_percentage
        message: "Gastric cancer risk assessment successful.",
      });
    } else {
      // For Diabetes and Cardiovascular Disease, derive category based on prediction and probability
      const prediction = result[predictionKey as string]; // Cast to string as it's not null here
      const probability = result[probabilityKey];
      let category = "Low Risk"; // Default

      if (prediction === 1) {
        category = "High Risk";
      } else if (probability >= 0.5) { // Threshold for Medium Risk
        category = "Medium Risk";
      }

      return NextResponse.json({
        prediction,
        [probabilityKey]: probability, // Dynamically set the probability key (e.g., probability_of_diabetes or probability_of_heart_disease)
        category,
        message: "Prediction successful.",
      });
    }

  } catch (error: any) {
    console.error("Route.ts: Internal server error:", error);
    return NextResponse.json(
      { error: "Internal server error", detail: error.message },
      { status: 500 }
    );
  }
}
