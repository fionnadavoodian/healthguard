import { useState } from "react";

interface TeamCardProps {
  name: string;
  affiliation: string;
  image: string;
  initials: string;
}

export default function TeamCard({ name, affiliation, image, initials }: TeamCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative group">
      <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
        {!imgError ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full rounded-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="text-2xl font-bold text-gray-600">
            {initials}
          </div>
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{name}</h3>
      <p className="text-sm text-gray-600">{affiliation}</p>
    </div>
  );
}