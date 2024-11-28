import React, { useState } from 'react';

export const Tabs = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="w-full h-full flex flex-col">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 
                        ${activeTab === index
                            ? 'border-blue-500 text-blue-500'
                            : 'border-transparent text-gray-500 hover:text-blue-500 hover:border-blue-500'} 
                        focus:outline-none`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tabs Content */}
            <div className="mt-4 flex-grow">
                {tabs[activeTab]?.content || (
                    <p className="text-gray-500">No content available.</p>
                )}
            </div>
        </div>
    );
}; 

export default Tabs;
