import React, { useState } from "react";
import Card from "./Card";
import ResourceList from "./ResourceList";
import { Disease } from "../types/disease";
import { Button } from "@/components/Button"; // Assuming you have a Button component

// Removed isValidUrl as it's not needed for local/relative image paths

export function DiseaseCard({ disease }: { disease: Disease }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxDescriptionLength = 120; // Adjusted for a tighter card appearance

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const shouldTruncate = disease.description.length > maxDescriptionLength;

  return (
    <Card className="relative flex flex-col h-full overflow-hidden">
      {/* Image and Title Section */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        <img
          src={disease.banner ? disease.banner : "/placeholder-image.jpg"}
          alt={disease.title}
          className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent flex items-end p-4">
          <h3 className="text-2xl font-bold text-blue-600 dark:text-gray-200 leading-tight">
            {disease.title}
          </h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-6 flex flex-col justify-between">
        {/* Description */}
        <div>
          <p className="text-gray-900 dark:text-gray-700 text-sm leading-relaxed mb-3">
            {shouldTruncate && !isExpanded
              ? `${disease.description.substring(0, maxDescriptionLength).trim()}...`
              : disease.description}
          </p>
          {shouldTruncate && (
            <Button
              onClick={toggleExpand}
              variant="ghost"
              size="sm"
              className="text-blue-600 dark:text-blue-400 hover:underline px-0 py-0 h-auto font-medium"
            >
              {isExpanded ? "Show Less" : "Read More"}
            </Button>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Performance Metrics
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {Object.entries(disease.performance).map(([key, value]) =>
              typeof value === "string" ? (
                <li key={key} className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                    :
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {value}
                  </span>
                </li>
              ) : null
            )}
          </ul>
        </div>

        {/* Resources */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* ResourceList should ideally handle its own dark/light mode */}
          <ResourceList resources={disease.resources} />
        </div>
      </div>
    </Card>
  );
}
