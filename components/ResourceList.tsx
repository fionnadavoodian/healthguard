import React from "react";

interface Resource {
  type: string;
  url: string;
}

interface ResourceListProps {
  resources?: Resource[]; // make optional
}

const ResourceList = ({ resources = [] }: ResourceListProps) => {
  const getResourceDetails = (type: string) => {
    switch (type) {
      case "PMC":
        return { icon: "🧬", label: "PubMed Central (Full Text)" };
      case "PubMed":
        return { icon: "📖", label: "PubMed Abstract" };
      case "OALib":
        return { icon: "📚", label: "Open Access Library Entry" };
      case "ResearchGate":
        return { icon: "🔬", label: "ResearchGate Article" };
      case "PLOS":
        return { icon: "📰", label: "PLOS ONE Journal Article" };
      case "MDPI":
        return { icon: "📘", label: "MDPI Journal Article" };
      default:
        return { icon: "🌐", label: "External Academic Resource" };
    }
  };

  if (resources.length === 0) {
    return null; // or a placeholder message
  }

  return (
    <div className="mt-6 pt-4 border-t border-gray-100">
      <h3 className="text-sm font-semibold text-gray-600 mb-3">
        Academic Resources
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {resources.map((resource, idx) => {
          const { icon, label } = getResourceDetails(resource.type);
          return (
            <a
              key={idx}
              href={resource.url}
              className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {resource.type}
                </p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceList;
