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
          {/* Theme color for the title (it's already white, but let's make it explicit for consistency if theme changes) */}
          <h3 className="text-2xl font-bold text-gray-200 dark:text-white leading-tight">
            {disease.title}
          </h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-6 flex flex-col justify-between">
        {/* Description */}
        <div>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
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
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Theme color for Performance heading */}
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Performance:
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {Object.entries(disease.performance).map(([key, value]) =>
              typeof value === "string" ? (
                <li key={key} className="flex justify-between items-baseline">
                  {/* Theme colors for performance labels */}
                  <span className="capitalize text-gray-500 dark:text-gray-400">
                    {key.replace(/([A-Z])/g, " $1")}:
                  </span>
                  {/* Theme colors for performance values */}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
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
