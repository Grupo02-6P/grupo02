import React from 'react';

interface FilterTab {
  label: string;
  value: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex items-center gap-2 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            activeTab === tab.value
              ? 'text-[#4A90E2] border-b-2 border-[#4A90E2]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-2 text-xs text-gray-500">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
};
