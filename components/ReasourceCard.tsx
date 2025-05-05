import React from "react";
import ResourceList from "./ResourceList";

interface Performance {
  sensitivity?: string;
  specificity?: string;
  kappaAgreement?: string;
  accuracy?: string;
  dataset?: string;
}

interface Resource {
  type: string;
  url: string;
}

interface Disease {
  id: number;
  title: string;
  description: string;
  performance: Performance;
  resources: Resource[];
}

interface ResourceCardProps {
  disease: Disease;
}

const ResourceCard = ({ disease }: ResourceCardProps) => {
  const { title, description, performance, resources } = disease;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-700 mb-4">{description}</p>
      <div className="text-sm text-gray-600 mb-4">
        {performance.accuracy && (
          <p>
            <strong>Accuracy:</strong> {performance.accuracy}
          </p>
        )}
        {performance.sensitivity && (
          <p>
            <strong>Sensitivity:</strong> {performance.sensitivity}
          </p>
        )}
        {performance.specificity && (
          <p>
            <strong>Specificity:</strong> {performance.specificity}
          </p>
        )}
        {performance.kappaAgreement && (
          <p>
            <strong>Kappa Agreement:</strong> {performance.kappaAgreement}
          </p>
        )}
        {performance.dataset && (
          <p>
            <strong>Dataset:</strong> {performance.dataset}
          </p>
        )}
      </div>
      <ResourceList resources={resources} />
    </div>
  );
};

export default ResourceCard;
