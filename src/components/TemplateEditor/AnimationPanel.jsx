import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronDown,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  ChevronUp
} from 'lucide-react';

const ANIMATIONS = [
  { id: 'none', label: 'None' },
  { id: 'fade-in', label: 'Fade In' },
  { id: 'fade-out', label: 'Fade Out' },
  { id: 'zoom-in', label: 'Zoom In' },
  { id: 'zoom-out', label: 'Zoom Out' },
  { id: 'slide-up', label: 'Slide Up' },
  { id: 'slide-down', label: 'Slide Down' },
  { id: 'slide-left', label: 'Slide Left' },
  { id: 'slide-right', label: 'Slide Right' },
  { id: 'bounce', label: 'Bounce' },
];

const EASING_OPTIONS = [
  'Linear',
  'Smooth',
  'Ease In',
  'Ease Out',
  'Ease In & Out',
  'Bounce'
];

const AnimationPanel = ({ selectedElement, onUpdate, isOpen: externalIsOpen, onToggle }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const [mainType, setMainType] = useState('While Open & Close');
  const [actionType, setActionType] = useState('Click');
  const [showMainTypeSelector, setShowMainTypeSelector] = useState(null); // 'context' or 'action'
  const [showEasingSelector, setShowEasingSelector] = useState(null); // 'open' or 'close'
  const [useSeparate, setUseSeparate] = useState(false);

  const [showAnimGrid, setShowAnimGrid] = useState({ open: false, close: false });

  // States for animation settings
  const [openSettings, setOpenSettings] = useState({
    type: 'fade-in',
    delay: 0,
    duration: 1,
    speed: 1,
    easing: 'Linear',
    everyVisit: true,
    fadeAtStart: true,
    fadeAtStartEnd: true
  });

  const [closeSettings, setCloseSettings] = useState({
    type: 'fade-in',
    delay: 0,
    duration: 1,
    speed: 1,
    easing: 'Linear',
    everyVisit: true,
    fadeAtEnd: true
  });

  // Sync with element data
  useEffect(() => {
    if (selectedElement) {
      setMainType(selectedElement.getAttribute('data-animation-trigger') || 'While Open & Close');
      setActionType(selectedElement.getAttribute('data-animation-action') || 'Click');
      const isSep = selectedElement.getAttribute('data-animation-separate') === 'true';
      setUseSeparate(isSep);
      
      const loadSettings = (prefix) => ({
        type: selectedElement.getAttribute(`data-animation-${prefix}-type`) || 'fade-in',
        delay: parseFloat(selectedElement.getAttribute(`data-animation-${prefix}-delay`)) || 0,
        duration: parseFloat(selectedElement.getAttribute(`data-animation-${prefix}-duration`)) || 1,
        speed: parseFloat(selectedElement.getAttribute(`data-animation-${prefix}-speed`)) || 1,
        easing: selectedElement.getAttribute(`data-animation-${prefix}-easing`) || 'Linear',
        everyVisit: selectedElement.getAttribute(`data-animation-${prefix}-every-visit`) !== 'false',
        fadeAtStart: selectedElement.getAttribute(`data-animation-${prefix}-fade-start`) !== 'false',
        fadeAtEnd: selectedElement.getAttribute(`data-animation-${prefix}-fade-end`) !== 'false',
        fadeAtStartEnd: selectedElement.getAttribute(`data-animation-${prefix}-fade-start-end`) !== 'false'
      });

      setOpenSettings(loadSettings('open'));
      setCloseSettings(loadSettings('close'));
    }
  }, [selectedElement]);

  const updateAttribute = (attr, value) => {
    if (!selectedElement) return;
    selectedElement.setAttribute(attr, value);
    if (onUpdate) onUpdate();
  };

  const updateSetting = (section, key, value) => {
    const setter = section === 'open' ? setOpenSettings : setCloseSettings;
    setter(prev => ({ ...prev, [key]: value }));
    updateAttribute(`data-animation-${section}-${key.toLowerCase().replace(/([A-Z])/g, '-$1')}`, value);
  };

  const handleMainTypeChange = (type) => {
    setMainType(type);
    updateAttribute('data-animation-trigger', type);
    setShowMainTypeSelector(null);
  };

  const handleActionTypeChange = (type) => {
    setActionType(type);
    updateAttribute('data-animation-action', type);
    setShowMainTypeSelector(null);
  };

  const toggleSeparate = () => {
    const next = !useSeparate;
    setUseSeparate(next);
    updateAttribute('data-animation-separate', next);
  };

  if (!selectedElement) return null;

  const Stepper = ({ label, value, onChange, unit = '' }) => (
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-medium text-gray-800">{label} :</span>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onChange(Math.max(0, parseFloat((value - 0.1).toFixed(1))))}
          className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="w-16 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-[13px] font-medium text-gray-800 bg-white shadow-sm">
          {value}{unit}
        </div>
        <button 
          onClick={() => onChange(parseFloat((value + 0.1).toFixed(1)))}
          className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  const AnimationSection = ({ 
    settings, 
    title, 
    sectionKey,
    onUpdateSetting, 
    showGrid, 
    onToggleGrid, 
    isClose = false 
  }) => {
    const [key, setKey] = useState(0);

    useEffect(() => {
      setKey(prev => prev + 1);
    }, [settings.type]);

    return (
      <div className="space-y-5">
        {title && (
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-bold text-gray-900 whitespace-nowrap">{title}</span>
            <div className="h-[1px] w-full bg-gray-100" />
          </div>
        )}
        
        <div className="flex gap-4 items-start">
          {/* Preview Card */}
          <div className="relative shrink-0">
            <div className="w-[100px] flex flex-col border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <div 
                className="relative h-[100px] flex items-center justify-center bg-gray-50/50 group/preview cursor-pointer"
                onClick={() => setKey(prev => prev + 1)}
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleGrid();
                  }}
                  className="absolute top-1.5 right-1.5 p-1 bg-white rounded-md shadow-sm border border-gray-100 text-gray-400 hover:text-indigo-600 transition-all z-10"
                >
                  <ArrowRightLeft size={14} className={`transition-transform duration-300 ${showGrid ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dynamic Preview Bars */}
                <div 
                  key={key}
                  className="flex items-end gap-1.5 h-10"
                  style={{ animation: settings.type !== 'none' ? `${settings.type} 1.5s infinite` : 'none' }}
                >
                  <div className="w-2 h-6 bg-gray-200/80 rounded-[2px]" />
                  <div className="w-2 h-10 bg-gray-300/90 rounded-[2px]" />
                  <div className="w-2 h-8 bg-gray-400/100 rounded-[2px]" />
                </div>
              </div>
              <div 
                className="py-2 text-center border-t border-gray-100 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={onToggleGrid}
              >
                <span className="text-[11px] font-medium text-gray-400">
                  {ANIMATIONS.find(a => a.id === settings.type)?.label || 'None'}
                </span>
              </div>
            </div>

            {showGrid && (
              <div className="absolute top-0 left-0 w-full h-full bg-white z-20 grid grid-cols-2 gap-1 p-1 rounded-2xl border border-gray-200 shadow-xl overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
                {ANIMATIONS.map(anim => (
                  <button
                    key={anim.id}
                    onClick={() => {
                      onUpdateSetting('type', anim.id);
                      onToggleGrid();
                    }}
                    className={`text-[9px] font-bold p-1 min-h-[30px] rounded-md border transition-all ${settings.type === anim.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'}`}
                  >
                    {anim.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Steppers */}
          <div className="flex-1 space-y-2.5">
            <Stepper label="Fix Delay" value={settings.delay} onChange={(v) => onUpdateSetting('delay', v)} unit="s" />
            <Stepper label="Fix Duration" value={settings.duration} onChange={(v) => onUpdateSetting('duration', v)} unit="s" />
            <Stepper label="Fix Speed" value={settings.speed} onChange={(v) => onUpdateSetting('speed', v)} />
          </div>
        </div>

        {/* Custom Easing Dropdown */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-800 leading-none">Select the Easing Effects :</span>
          <div className="relative">
            <button 
              onClick={() => setShowEasingSelector(showEasingSelector === sectionKey ? null : sectionKey)}
              className="flex items-center justify-between px-3 py-3 bg-gray-50/50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors group min-w-[124px]"
            >
               <span className="text-xs font-medium text-gray-600">{settings.easing}</span>
               <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showEasingSelector === sectionKey ? 'rotate-180' : ''}`} />
            </button>
            
            {showEasingSelector === sectionKey && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1 overflow-visible animate-in zoom-in-95 duration-200">
                {EASING_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      onUpdateSetting('easing', opt);
                      setShowEasingSelector(null);
                    }}
                    className="w-full text-center overflow-visible px-4 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-1">
          <button 
            onClick={() => onUpdateSetting('everyVisit', !settings.everyVisit)}
            className="flex items-center gap-3 w-full overflow-visible text-left group"
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${settings.everyVisit ? 'border-indigo-600 bg-white ring-4 ring-indigo-50' : 'border-gray-300'}`}>
              <div className={`w-2.5 h-2.5 rounded-full transition-all ${settings.everyVisit ? 'bg-indigo-600' : 'bg-transparent'}`} />
            </div>
            <span className="text-[13px] font-medium text-gray-500 group-hover:text-gray-800 transition-colors">Animate in Every Visit</span>
          </button>

          {!useSeparate ? (
            <button 
              onClick={() => onUpdateSetting('fadeAtStartEnd', !settings.fadeAtStartEnd)}
              className="flex items-center gap-3 w-full text-left group"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${settings.fadeAtStartEnd ? 'border-indigo-600 bg-white ring-4 ring-indigo-50' : 'border-gray-300'}`}>
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${settings.fadeAtStartEnd ? 'bg-indigo-600' : 'bg-transparent'}`} />
              </div>
              <span className="text-[13px] font-medium text-gray-500 group-hover:text-gray-800 transition-colors">Fade at Starting & Ending</span>
            </button>
          ) : isClose ? (
            <button 
              onClick={() => onUpdateSetting('fadeAtEnd', !settings.fadeAtEnd)}
              className="flex items-center gap-3 w-full text-left group"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${settings.fadeAtEnd ? 'border-indigo-600 bg-white ring-4 ring-indigo-50' : 'border-gray-300'}`}>
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${settings.fadeAtEnd ? 'bg-indigo-600' : 'bg-transparent'}`} />
              </div>
              <span className="text-[13px] font-medium text-gray-500 group-hover:text-gray-800 transition-colors">Fade at Ending</span>
            </button>
          ) : (
            <button 
              onClick={() => onUpdateSetting('fadeAtStart', !settings.fadeAtStart)}
              className="flex items-center gap-3 w-full text-left group"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${settings.fadeAtStart ? 'border-indigo-600 bg-white ring-4 ring-indigo-50' : 'border-gray-300'}`}>
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${settings.fadeAtStart ? 'bg-indigo-600' : 'bg-transparent'}`} />
              </div>
              <span className="text-[13px] font-medium text-gray-500 group-hover:text-gray-800 transition-colors">Fade at Starting</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-sm font-sans select-none">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        
        @keyframes fade-in { 0% { opacity: 0; } 70%, 100% { opacity: 1; } }
        @keyframes fade-out { 0% { opacity: 1; } 70%, 100% { opacity: 0; } }
        @keyframes zoom-in { 0% { transform: scale(0.5); opacity: 0; } 70%, 100% { transform: scale(1); opacity: 1; } }
        @keyframes zoom-out { 0% { transform: scale(1); opacity: 1; } 70%, 100% { transform: scale(0.5); opacity: 0; } }
        @keyframes slide-up { 0% { transform: translateY(20px); opacity: 0; } 70%, 100% { transform: translateY(0); opacity: 1; } }
        @keyframes slide-down { 0% { transform: translateY(-20px); opacity: 0; } 70%, 100% { transform: translateY(0); opacity: 1; } }
        @keyframes slide-left { 0% { transform: translateX(20px); opacity: 0; } 70%, 100% { transform: translateX(0); opacity: 1; } }
        @keyframes slide-right { 0% { transform: translateX(-20px); opacity: 0; } 70%, 100% { transform: translateX(0); opacity: 1; } }
        @keyframes bounce {
          0%, 14%, 35%, 56%, 70% {transform: translateY(0);}
          28% {transform: translateY(-10px);}
          42% {transform: translateY(-5px);}
          70%, 100% {transform: translateY(0);}
        }
      `}</style>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-4">
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={onToggle || (() => setInternalIsOpen(!internalIsOpen))}
        >
          <div className="flex items-center gap-3">
            <Sparkles size={16} className="text-gray-600" />
            <span className="font-medium text-gray-700 text-sm">Animation</span>
          </div>
          {isOpen ? <ChevronUp size={18} className="text-gray-400" strokeWidth={3} /> : <ChevronDown size={18} className="text-gray-400" strokeWidth={3} />}
        </div>

        {isOpen && (
          <div className="p-5 pt-0 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            
            {/* Dual Trigger Dropdowns */}
            <div className="flex gap-4">
              {/* Dropdown 1: Context/State */}
              <div className="flex-1 relative">
                <button 
                  onClick={() => setShowMainTypeSelector(showMainTypeSelector === 'context' ? null : 'context')}
                  className="w-full h-10 flex items-center justify-between px-2 bg-gray-50/50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                   <span className="text-xs font-medium text-gray-600">{mainType}</span>
                   <ArrowRightLeft size={12} className="text-gray-400 group-hover:rotate-180 transition-transform duration-500" />
                </button>
                {showMainTypeSelector === 'context' && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1 overflow-hidden animate-in zoom-in-95 duration-200">
                    {['While Open & Close', 'On Page'].map(type => (
                      <button
                        key={type}
                        onClick={() => handleMainTypeChange(type)}
                        className="w-full text-center px-4 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 2: Action/Event */}
              <div className="flex-1 relative">
                <button 
                  onClick={() => setShowMainTypeSelector(showMainTypeSelector === 'action' ? null : 'action')}
                  className="w-full h-10 flex items-center justify-between px-3 bg-gray-50/50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                   <span className="text-xs font-medium text-gray-600">{actionType}</span>
                   <ArrowRightLeft size={12} className="text-gray-400 group-hover:rotate-180 transition-transform duration-500" />
                </button>
                {showMainTypeSelector === 'action' && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1 overflow-hidden animate-in zoom-in-95 duration-200">
                    {['Click', 'Hover', 'Always'].map(type => (
                      <button
                        key={type}
                        onClick={() => handleActionTypeChange(type)}
                        className="w-full text-center px-4 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Separate Animation Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Use Separate Animation For Open & Close</span>
              <div 
                onClick={toggleSeparate}
                className={`relative w-11 h-5.5 rounded-full transition-colors cursor-pointer ${useSeparate ? 'bg-indigo-600/90 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-all duration-300 ${useSeparate ? 'left-6' : 'left-0.5'}`} />
              </div>
            </div>

            {/* Animation Sections */}
            {useSeparate ? (
              <div className="space-y-8">
                <AnimationSection 
                  title="While Open" 
                  sectionKey="open"
                  settings={openSettings} 
                  onUpdateSetting={(k, v) => updateSetting('open', k, v)}
                  showGrid={showAnimGrid.open}
                  onToggleGrid={() => setShowAnimGrid(prev => ({ ...prev, open: !prev.open }))}
                />
                <AnimationSection 
                  title="While Close" 
                  sectionKey="close"
                  settings={closeSettings} 
                  onUpdateSetting={(k, v) => updateSetting('close', k, v)}
                  showGrid={showAnimGrid.close}
                  onToggleGrid={() => setShowAnimGrid(prev => ({ ...prev, close: !prev.close }))}
                  isClose={true}
                />
              </div>
            ) : (
              <AnimationSection 
                sectionKey="open"
                settings={openSettings} 
                onUpdateSetting={(k, v) => updateSetting('open', k, v)}
                showGrid={showAnimGrid.open}
                onToggleGrid={() => setShowAnimGrid(prev => ({ ...prev, open: !prev.open }))}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimationPanel;
