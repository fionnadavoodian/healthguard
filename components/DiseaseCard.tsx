import React, { useState } from "react";

interface DiseaseCardProps {
  title: string;
  imageSrc: string;
  description: string;
  className?: string;
}

export default function DiseaseCard({
  title,
  imageSrc,
  description,
  className = "",
}: DiseaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxPreviewLength = 150;

  const toggleExpansion = () => setIsExpanded(!isExpanded);

  return (
    <div className={`group relative max-w-md mx-auto isolate ${className}`}>
      {/* Floating image container */}
      <div className="absolute -top-12 left-6 right-6 h-56 overflow-hidden rounded-[1.75rem] shadow-2xl transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl z-20">
        <div className="relative h-full w-full">
          {/* Image with gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 z-10" />
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Decorative corner elements */}
          <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white/30 rounded-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-white/30 rounded-lg" />
        </div>
      </div>

      {/* Card content with glassmorphism effect */}
      <div className="relative pt-44 pb-8 px-6 bg-white/95 backdrop-blur-lg rounded-[1.75rem] shadow-xl transition-all duration-300 hover:shadow-2xl z-10">
        {/* Content area */}
        <div className="space-y-4">
          {/* Title with text shadow */}
          <h3 className="text-2xl font-bold text-gray-800 drop-shadow-sm">
            {title}
          </h3>

          {/* Collapsible description */}
          <div className="relative">
            <div
              className={`text-gray-600 transition-all duration-300 ${
                isExpanded ? "max-h-[500px]" : "max-h-24 overflow-hidden"
              }`}
            >
              {description}

              {/* Gradient fade when collapsed */}
              {!isExpanded && (
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/95 via-white/95" />
              )}
            </div>
          </div>

          {/* Animated Read More button */}
          <button
            onClick={toggleExpansion}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <span className={`${!isExpanded ? "animate-pulse" : ""}`}>
              {isExpanded ? "Show Less" : "Read More"}
            </span>
            <svg
              className={`w-5 h-5 transform transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
              />
            </svg>
          </button>
        </div>

        {/* Decorative border */}
        <div className="absolute inset-0 rounded-[1.75rem] border border-white/20 pointer-events-none" />
      </div>

      {/* Background shadow layer */}
      <div className="absolute inset-0 -bottom-4 bg-gray-100/50 rounded-[2rem] transform transition-transform duration-500 group-hover:translate-y-4 -z-10" />
    </div>
  );
}
