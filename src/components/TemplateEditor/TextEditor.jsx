// TextEditor.jsx - Context-sensitive text editing panel
import React from 'react';
import {
  Type, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, ChevronDown
} from 'lucide-react';

const fontFamilies = [
  'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
  'Helvetica', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'
];

const fontWeights = [
  { label: 'Thin', value: '100' },
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semi Bold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Extra Bold', value: '800' },
];

const TextEditor = ({ selectedElement, onUpdate }) => {
  if (!selectedElement) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        <Type className="mx-auto mb-2" size={32} />
        <p>Click on text to edit</p>
      </div>
    );
  }

  const getCurrentStyle = (property) => {
    if (!selectedElement) return '';
    return window.getComputedStyle(selectedElement)[property] || '';
  };

  const updateStyle = (property, value) => {
    if (!selectedElement) return;
    selectedElement.style[property] = value;
    if (onUpdate) onUpdate();
  };

  const updateTextContent = (text) => {
    if (!selectedElement) return;
    selectedElement.textContent = text;
    if (onUpdate) onUpdate();
  };

  const toggleStyle = (property, value1, value2) => {
    const current = getCurrentStyle(property);
    const newValue = current === value1 ? value2 : value1;
    updateStyle(property, newValue);
  };

  return (
    <div className="space-y-4">
      {/* Text Content */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
          <Type size={14} />
          Text
        </label>
        <textarea
          value={selectedElement?.textContent || ''}
          onChange={(e) => updateTextContent(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows="3"
          placeholder="Enter text..."
        />
      </div>

      {/* Typography Section */}
      <div className="space-y-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">Typography</span>
        </div>

        {/* Font Family */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-600">Font Family</label>
          <select
            value={getCurrentStyle('fontFamily').replace(/['"]/g, '').split(',')[0] || 'Poppins'}
            onChange={(e) => updateStyle('fontFamily', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {fontFamilies.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        {/* Font Size and Weight */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-600">Size</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={parseInt(getCurrentStyle('fontSize')) || 24}
                onChange={(e) => updateStyle('fontSize', e.target.value + 'px')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                min="8"
                max="144"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-600">Weight</label>
            <select
              value={getCurrentStyle('fontWeight') || '400'}
              onChange={(e) => updateStyle('fontWeight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {fontWeights.map(weight => (
                <option key={weight.value} value={weight.value}>{weight.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Alignment */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-600">Alignment</label>
          <div className="flex gap-1">
            {[
              { icon: AlignLeft, value: 'left' },
              { icon: AlignCenter, value: 'center' },
              { icon: AlignRight, value: 'right' },
              { icon: AlignJustify, value: 'justify' }
            ].map(({ icon: Icon, value }) => (
              <button
                key={value}
                onClick={() => updateStyle('textAlign', value)}
                className={`flex-1 p-2 rounded border transition-colors ${
                  getCurrentStyle('textAlign') === value
                    ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} className="mx-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Text Style Buttons */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-600">Style</label>
          <div className="flex gap-1">
            <button
              onClick={() => toggleStyle('fontWeight', '700', '400')}
              className={`flex-1 p-2 rounded border transition-colors flex items-center justify-center gap-1 ${
                getCurrentStyle('fontWeight') === '700' || getCurrentStyle('fontWeight') === 'bold'
                  ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => toggleStyle('fontStyle', 'italic', 'normal')}
              className={`flex-1 p-2 rounded border transition-colors flex items-center justify-center gap-1 ${
                getCurrentStyle('fontStyle') === 'italic'
                  ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => toggleStyle('textDecoration', 'underline', 'none')}
              className={`flex-1 p-2 rounded border transition-colors flex items-center justify-center gap-1 ${
                getCurrentStyle('textDecoration').includes('underline')
                  ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
              title="Underline"
            >
              <Underline size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Color Section */}
      <div className="space-y-3 pt-3 border-t border-gray-200">
        <span className="text-xs font-semibold text-gray-700">Color</span>
        
        <div className="space-y-1.5">
          <label className="text-xs text-gray-600">Fill</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={getCurrentStyle('color') || '#000000'}
              onChange={(e) => updateStyle('color', e.target.value)}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={getCurrentStyle('color') || '#000000'}
              onChange={(e) => updateStyle('color', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="#000000"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-gray-600">Opacity</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              value={parseFloat(getCurrentStyle('opacity') || '1') * 100}
              onChange={(e) => updateStyle('opacity', e.target.value / 100)}
              className="flex-1 accent-indigo-600"
            />
            <span className="text-xs text-gray-600 w-12 text-right">
              {Math.round(parseFloat(getCurrentStyle('opacity') || '1') * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-3 pt-3 border-t border-gray-200">
        <span className="text-xs font-semibold text-gray-700">Spacing</span>
        
        <div className="space-y-1.5">
          <label className="text-xs text-gray-600">Line Height</label>
          <input
            type="number"
            value={parseFloat(getCurrentStyle('lineHeight')) || 1.2}
            onChange={(e) => updateStyle('lineHeight', e.target.value)}
            step="0.1"
            min="0.5"
            max="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-gray-600">Letter Spacing</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={parseFloat(getCurrentStyle('letterSpacing')) || 0}
              onChange={(e) => updateStyle('letterSpacing', e.target.value + 'px')}
              step="0.5"
              min="-5"
              max="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500">px</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
