import React from "react";
import type { SidebarProps } from "../../types/Sidebar";

export const Sidebar: React.FC<SidebarProps> = ({ 
  title,
  description,
  sections,
  selected, 
  onSelect,
  className = "",
  width = "md"
}) => {
  const widthClasses = {
    sm: "w-56",
    md: "w-72", 
    lg: "w-80"
  };

  return (
    <aside className={`${widthClasses[width]} bg-white shadow-lg border-r border-gray-200 p-6 ${className}`}>
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">{title}</h2>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <nav className="space-y-2">
        {sections.map((section) => (
          <button
            key={section.key}
            disabled={section.disabled}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              selected === section.key 
                ? "bg-blue-600 text-white shadow-md transform scale-[1.02]" 
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm disabled:hover:bg-transparent disabled:hover:text-gray-700"
            }`}
            onClick={() => !section.disabled && onSelect(section.key)}
          >
            <div className="flex items-center">
              {section.icon ? (
                <span className={`mr-3 ${selected === section.key ? "text-white" : "text-gray-400"}`}>
                  {section.icon}
                </span>
              ) : (
                <span className={`w-2 h-2 rounded-full mr-3 ${
                  selected === section.key ? "bg-white" : "bg-gray-400"
                }`}></span>
              )}
              {section.label}
            </div>
          </button>
        ))}
      </nav>
    </aside>
  );
};
