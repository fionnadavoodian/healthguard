import React, { useState } from "react";
import Card from "./Card";
import { motion } from "framer-motion";

export function AuthorCard({
  name,
  affiliation,
  image,
  initials,
}: {
  name: string;
  affiliation: string;
  image: string;
  initials: string;
}) {
  const [error, setError] = useState(false);

  return (
    <Card className="text-center py-6">
      {/* Removed overflow-hidden from this div to allow image overlap */}
      <div className="relative flex flex-col items-center p-6 bg-white border rounded-xl shadow-md w-64 h-80">
        {/* Circle Image or Initials */}
        <div className="relative">
          {!error ? (
            <motion.img
              src={image}
              alt={name}
              className="block w-28 h-28 rounded-full border-4 border-white shadow-lg mx-auto mb-4" // Use block, mx-auto, mb-4 for default flow
              onError={() => setError(true)}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            />
          ) : (
            <div className="w-28 h-28 flex items-center justify-center rounded-full  text-blackbg-gray-200 text-xl font-bold text-gray-600 shadow-lg mx-auto">
              {initials}
            </div>
          )}
        </div>
        {/* Card Content */}
        <div className="pt-16">
          <h4 className="text-lg font-semibold text-gray-800">{name}</h4>
          <p className="text-sm text-gray-500">{affiliation}</p>
        </div>
      </div>
    </Card>
  );
}
