// app/api/predict/route.ts
import { NextRequest, NextResponse } from "next/server";


console.log("Node.js Version in route.ts:", process.version);

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("Route.ts: Received data from frontend:", data);

  
    const isGastricAssessment =
      data.hpylori !== undefined &&
      data.family_history !== undefined &&
      data.education !== undefined &&
      data.pack_years_smoking !== undefined;

    if (isGastricAssessment) {
      // 🧪 Handle Gastric Cancer Assessment
      const gastricResponse = await fetch("http://localhost:8000/gastric-cancer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const text = await gastricResponse.text();
      console.log("Route.ts: Gastric response raw text:", text);

      if (!gastricResponse.ok) {
        console.error("Backend error (gastric):", text);
        return NextResponse.json(
          { error: "FastAPI gastric-cancer error", detail: text },
          { status: 500 }
        );
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse JSON (gastric):", err);
        return NextResponse.json(
          { error: "Invalid JSON from FastAPI", text },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ...result,
        message: "Gastric cancer risk assessment successful.",
      });
    }

    const response = await fetch("/api/diabetes-risk", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});

    console.log("Route.ts: Response status from FastAPI:", response.status);

    const text = await response.text();
    console.log("Route.ts: Raw response text from FastAPI:", text);

    if (!response.ok) {
      console.error("Backend error:", text);
      return NextResponse.json(
        { error: "FastAPI error", detail: text },
        { status: 500 }
      );
    }

    let result;
    try {
      result = JSON.parse(text); // ✅ فقط از text پارس می‌کنی
    } catch (err) {
      console.error("Route.ts: Failed to parse JSON:", err);
      return NextResponse.json(
        { error: "FastAPI response was not valid JSON.", text },
        { status: 500 }
      );
    }

    console.log("Route.ts: Parsed response from FastAPI:", result);

    const prediction = result.prediction;
    const probability = result.probability_of_diabetes;
    let category = "Low Risk";

    if (prediction === 1) {
      category = "High Risk";
    } else if (probability >= 0.5) {
      category = "Medium Risk";
    }

    return NextResponse.json({
      prediction,
      probability_of_diabetes: probability,
      category,
      message: "Prediction successful.",
    });

  } catch (error: any) {
    console.error("Route.ts: Internal error:", error);
    return NextResponse.json(
      { error: "Internal server error", detail: error.message },
      { status: 500 }
    );
  }
}
