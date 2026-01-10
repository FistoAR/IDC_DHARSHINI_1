// TemplateModal.jsx - HTML Template Selection
import React, { useState, useMemo } from 'react';
import { Search, X, Plus, FileText } from 'lucide-react';

// Import HTML templates as URLs
import TemplateHTML1 from "../../assets/Templates/template.html?url";

const TemplateModal = ({ showTemplateModal, setShowTemplateModal, clearCanvas, loadHTMLTemplate }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // HTML Template data - only HTML templates now
  const templates = [
    { 
      id: 1, 
      name: 'Business Report', 
      category: 'Business', 
      src: TemplateHTML1, 
      type: 'html',
      description: 'Professional A4 business report template'
    },
    // Add more HTML templates here as template2.html, template3.html, etc.
  ];

  const categories = [
    'All', 'Business', 'Report', 'Presentation', 'Marketing', 'Portfolio',
  ];

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => 
      (activeTab === 'All' || t.category === activeTab) &&
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTab, searchQuery]);

  // Load HTML template
  const handleLoadTemplate = async (template) => {
    if (template.type === 'html') {
      await loadHTMLTemplate(template.src);
    }
    setShowTemplateModal(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
      onClick={() => setShowTemplateModal(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Choose a Template</h2>
            <p className="text-sm text-gray-500 mt-1">Select an HTML template to start editing</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowTemplateModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-5 py-3 flex gap-2 overflow-x-auto border-b border-gray-100 flex-shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${activeTab === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
          <div className="grid grid-cols-4 gap-5">
            {/* Blank Template */}
            <div
              onClick={() => {
                clearCanvas();
                setShowTemplateModal(false);
              }}
              className="group bg-white rounded-xl overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:border-indigo-500 hover:shadow-lg transition-all"
            >
              <div className="aspect-[1/1.414] flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Plus size={40} className="mx-auto text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  <p className="mt-2 text-sm text-gray-400 group-hover:text-indigo-600 font-medium">Blank Page</p>
                </div>
              </div>
            </div>

            {/* Template Cards */}
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleLoadTemplate(template)}
                className="group bg-white rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="aspect-[1/1.414] bg-gradient-to-br from-indigo-50 to-blue-50 relative overflow-hidden flex items-center justify-center">
                  {/* Template Preview Placeholder */}
                  <div className="text-center p-4">
                    <FileText size={48} className="mx-auto text-indigo-300 mb-2" />
                    <span className="text-xs text-indigo-400 font-medium">HTML Template</span>
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg">
                      Use Template
                    </span>
                  </div>

                  {/* HTML Badge */}
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                    HTML
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-gray-800 text-sm truncate">{template.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{template.description}</p>
                </div>
              </div>
            ))}

            {/* No Results */}
            {filteredTemplates.length === 0 && searchQuery && (
              <div className="col-span-4 py-12 text-center text-gray-400">
                <Search size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">No templates found</p>
                <p className="text-sm mt-1">Try adjusting your search or category</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-5 py-3 bg-gray-100 border-t border-gray-200 flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">
            💡 Click on any text to edit • Click on images to replace them
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;