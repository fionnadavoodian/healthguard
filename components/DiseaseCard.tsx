import React from "react";
import Card from "./Card";
import ResourceList from "./ResourceList";
import { Disease } from "../app/types/disease";

export function DiseaseCard({ disease }: { disease: Disease }) {
  return (
    <Card className="relative pt-24">
      <div className="absolute inset-x-0 top-0 h-48">
        <img
          src={disease.banner || "/default.jpg"}
          alt={disease.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30" />
        <h3 className="absolute bottom-4 left-6 text-2xl font-bold text-white">
          {disease.title}
        </h3>
      </div>
      <p className="text-gray-700 mb-4">{disease.description}</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
        {Object.entries(disease.performance).map(([key, value]) =>
          typeof value === "string" ? (
            <li key={key} className="flex justify-between">
              <span className="capitalize">
                {key.replace(/([A-Z])/g, " $1")}:
              </span>
              <span className="font-semibold">{value}</span>
            </li>
          ) : null
        )}
      </ul>
      <ResourceList resources={disease.resources} />
    </Card>
  );
}
