import React from "react";
import { Resource } from "../types/disease";

export default function ResourceList({ resources }: { resources: Resource[] }) {
  if (!resources || resources.length === 0) return null;

  return (
    <div>
      <h5 className="font-medium mb-2">Resources</h5>
      <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
        {resources.map((r, index) => (
          <li key={index}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
              {r.type}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
