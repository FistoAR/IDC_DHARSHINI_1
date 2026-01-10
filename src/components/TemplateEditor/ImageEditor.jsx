import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Replace,
  ChevronUp,
  ChevronDown,
  Link as LinkIcon,
  Link2Off,
  Edit3,
  X,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Pipette,
  MousePointerClick,
  Sparkles,
  Repeat,
  ArrowLeft,
  Filter,
  Search
} from 'lucide-react';

const ImageEditor = ({ selectedElement, onUpdate }) => {
  const fileInputRef = useRef(null);

  /* ---------------- STATE MANAGEMENT ---------------- */
  const [isMainPanelOpen, setIsMainPanelOpen] = useState(true);
  const [isInteractionsOpen, setIsInteractionsOpen] = useState(true);
  const [isAnimationsOpen, setIsAnimationsOpen] = useState(false);
  
  const [openSubSection, setOpenSubSection] = useState(null);
  const [isRadiusLinked, setIsRadiusLinked] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [activeTab, setActiveTab] = useState('gallery');
  
  const [galleryView, setGalleryView] = useState('template');
  const [tempSelectedImage, setTempSelectedImage] = useState(null);

  const [imageType, setImageType] = useState('Fit');
  const [opacity, setOpacity] = useState(100);
  const [interactionType, setInteractionType] = useState("none");

  const [filters, setFilters] = useState({
    exposure: 100,
    contrast: 100,
    saturation: 100,
    temperature: 0,
    tint: 0,
    highlights: 100,
    shadows: 100
  });

  const [radius, setRadius] = useState({ tl: 12, tr: 12, br: 12, bl: 12 });
  
  const [activeEffects, setActiveEffects] = useState(['Drop Shadow']);
  const [effectSettings, setEffectSettings] = useState({
    'Drop Shadow': { color: '#000000', opacity: 35, x: 60, y: 60, blur: 60, spread: 60 },
    'Inner Shadow': { color: '#000000', opacity: 35, x: 60, y: 60, blur: 60, spread: 60 },
    'Blur': { blur: 60, spread: 60 }
  });

  /* ---------------- ASSETS ---------------- */
  const galleryImages = [
    { name: 'Sea Port 1', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
    { name: 'Sea Port 2', url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
    { name: 'Sea Port 3', url: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda' },
    { name: 'Cutting Machine', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158' },
    { name: 'Latte Machine', url: 'https://images.unsplash.com/photo-1559550851-125028424075' },
    { name: 'Operator', url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837' }
  ];

  const [uploadedImages, setUploadedImages] = useState([
    { name: 'Study Materials', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6' },
    { name: 'Digital Education', url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8' },
    { name: 'Classroom', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7' }
  ]);

  /* ---------------- WORKING MODELS ---------------- */
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const imageUrl = URL.createObjectURL(file);

  const newImageData = {
    id: Date.now(),          // ✅ unique id (important for selection & replace)
    name: file.name,
    url: imageUrl,
  };

  // ✅ Add to gallery using SPREAD OPERATOR (newest first)
  setUploadedImages((prev) => [newImageData, ...prev]);

  // ✅ Reset input so same file can be uploaded again
  e.target.value = '';
};
const handleReplaceImage = () => {
  if (!selectedImage) return;
  setTemplateImage(selectedImage);
};

  const applyVisuals = () => {
    if (!selectedElement) return;

    let filterString = `brightness(${filters.exposure}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.tint}deg) sepia(${filters.temperature > 0 ? filters.temperature : 0}%)`;
    
    const highlightEffect = (filters.highlights - 100) / 5;
    const shadowEffect = (filters.shadows - 100) / 5;
    filterString += ` brightness(${100 + highlightEffect}%) contrast(${100 + shadowEffect}%)`;

    if (activeEffects.includes('Blur')) {
      filterString += ` blur(${effectSettings['Blur'].blur / 10}px)`;
    }
    
    selectedElement.style.filter = filterString;
    selectedElement.style.opacity = opacity / 100;
    selectedElement.style.objectFit = imageType.toLowerCase();

    let shadowString = "";
    if (activeEffects.includes('Drop Shadow')) {
      const s = effectSettings['Drop Shadow'];
      shadowString += `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px rgba(0,0,0,${s.opacity/100})`;
    }
    if (activeEffects.includes('Inner Shadow')) {
      const s = effectSettings['Inner Shadow'];
      if(shadowString) shadowString += ", ";
      shadowString += `inset ${s.x}px ${s.y}px ${s.blur}px ${s.spread}px rgba(0,0,0,${s.opacity/100})`;
    }
    selectedElement.style.boxShadow = shadowString;
    if (onUpdate) onUpdate();
  };

  useEffect(() => { applyVisuals(); }, [filters, activeEffects, effectSettings, opacity, imageType]);

  const updateRadius = (corner, value) => {
    const val = Math.max(0, Number(value) || 0);
    const next = isRadiusLinked ? { tl: val, tr: val, br: val, bl: val } : { ...radius, [corner]: val };
    setRadius(next);
    selectedElement.style.borderRadius = `${next.tl}px ${next.tr}px ${next.br}px ${next.bl}px`;
    if (onUpdate) onUpdate();
  };

  const updateEffectSetting = (effect, key, value) => {
    setEffectSettings(prev => ({
      ...prev,
      [effect]: { ...prev[effect], [key]: value }
    }));
  };

  /* ---------------- UI SUB-COMPONENTS ---------------- */
  const RadiusBox = ({ corner, value, radiusStyle }) => (
    <div className="relative flex items-center bg-white border border-gray-200 rounded-lg p-1 w-24 h-10 shadow-sm">
      <div className={`w-3 h-3 border-t-2 border-l-2 border-gray-800 absolute left-2 top-2 ${radiusStyle}`} />
      <div className="flex items-center justify-between w-full ml-5 mr-1">
        <button onClick={() => updateRadius(corner, value - 1)} className="text-gray-300 hover:text-black"><ChevronLeft size={14}/></button>
        <input type="number" value={value} onChange={(e) => updateRadius(corner, e.target.value)} className="w-8 text-center text-xs font-bold outline-none bg-transparent" />
        <button onClick={() => updateRadius(corner, value + 1)} className="text-gray-300 hover:text-black"><ChevronRight size={14}/></button>
      </div>
    </div>
  );

  const EffectControlRow = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-gray-700">{label} :</span>
      <div className="flex items-center border border-gray-200 rounded-lg px-1 py-1 w-16">
        <button onClick={() => onChange(value - 1)} className="text-gray-400"><ChevronLeft size={12} /></button>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full text-center text-xs font-bold outline-none" />
        <button onClick={() => onChange(value + 1)} className="text-gray-400"><ChevronRight size={12} /></button>
      </div>
    </div>
  );

  if (!selectedElement) return null;

  return (
    <div className="relative flex flex-col gap-4 w-full max-w-sm">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        input[type='range'] {
          -webkit-appearance: none;
          width: 100%;
          background: transparent;
        }
        input[type='range']::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 2px;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #6366f1;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          margin-top: -5px;
          cursor: pointer;
        }
      `}</style>

      {/* MAIN PROPERTIES PANEL */}
      <div className="bg-white border border-gray-100 rounded-[20px] shadow-xl overflow-hidden relative font-sans">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        <label
  htmlFor="galleryUpload"
  className="px-3 py-2 border rounded-lg text-sm cursor-pointer"
>
  Upload Image
</label>

        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 border border-gray-200 rounded-lg"><Edit3 size={16} className="text-gray-600" /></div>
            <span className="font-bold text-gray-700 text-sm">Image</span>
          </div>
          <button onClick={() => setIsMainPanelOpen(!isMainPanelOpen)} className="p-1 hover:bg-gray-50 rounded-full transition-colors">
            <ChevronUp size={18} className={`text-gray-400 transition-transform duration-200 ${isMainPanelOpen ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {isMainPanelOpen && (
          <div className="p-5 space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-800 whitespace-nowrap">Upload your Image</span>
                    <div className="h-[1px] w-full bg-gray-100" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-500">Select the Image type :</span>
                  <div className="relative">
                    <select value={imageType} onChange={(e) => setImageType(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded-lg px-2 py-1 text-[11px] font-bold text-gray-700 outline-none focus:ring-1 focus:ring-indigo-500 w-20 text-center">
                      <option>Fit</option><option>Fill</option><option>Cover</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0">
                    <img src={selectedElement.src} className="w-full h-full object-cover" alt="preview" />
                  </div>
                  <Replace size={18} className="text-gray-300 shrink-0" />
                  <div onClick={() => { setShowGallery(true); setActiveTab('uploaded'); }} className="flex-1 h-20 border-2 border-dashed border-indigo-100 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50/50 transition-colors bg-white">
                    <Upload size={18} className="text-indigo-500 mb-1" />
                    <p className="text-[10px] text-gray-400 font-medium text-center">Drag & Drop or <span className="font-bold text-indigo-600 underline">Upload</span></p>
                  </div>
                </div>

                <div onClick={() => { setShowGallery(true); setGalleryView('template'); }} className="relative h-28 rounded-2xl overflow-hidden cursor-pointer group shadow-sm border border-gray-100">
                  <img src={galleryImages[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="gallery" />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm bg-black/40 backdrop-blur-[1px]">
                    <ImageIcon size={18} className="mr-2" /> Image Gallery
                  </div>
                </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2"><span className="text-[11px] font-bold text-gray-800">Opacity</span><div className="h-[1px] w-full bg-gray-100" /></div>
              <div className="flex items-center gap-3 px-1">
                <input type="range" min="0" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${opacity}%, #f3f4f6 ${opacity}%, #f3f4f6 100%)` }} />
                <span className="text-[11px] font-bold text-gray-700 w-8">{opacity}%</span>
              </div>
            </div>

            <div className="space-y-3">
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                  <button onClick={() => setOpenSubSection(openSubSection === 'adjustments' ? null : 'adjustments')} className="w-full flex items-center justify-between px-4 py-3.5 text-[13px] font-bold text-gray-800">
                    <span>Adjustments</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${openSubSection === 'adjustments' ? 'rotate-180' : ''}`} />
                  </button>
                  {openSubSection === 'adjustments' && (
                    <div className="px-5 pb-5 space-y-5 animate-in slide-in-from-top-2">
                      {[
                        ['Exposure', 'exposure', 0, 200],
                        ['Contrast', 'contrast', 0, 200],
                        ['Saturation', 'saturation', 0, 200],
                        ['Temperature', 'temperature', -100, 100],
                        ['Tint', 'tint', -180, 180],
                        ['Highlights', 'highlights', 0, 200],
                        ['Shadows', 'shadows', 0, 200],
                      ].map(([label, key, min, max]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{label}</span>
                            <span className="text-[11px] font-bold text-gray-900">{filters[key]}</span>
                          </div>
                          <input type="range" min={min} max={max} value={filters[key]} onChange={(e) => setFilters((f) => ({ ...f, [key]: +e.target.value }))} style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((filters[key] - min) / (max - min)) * 100}%, #f3f4f6 ${((filters[key] - min) / (max - min)) * 100}%, #f3f4f6 100%)` }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                  <button onClick={() => setOpenSubSection(openSubSection === 'radius' ? null : 'radius')} className="w-full flex items-center justify-between px-4 py-3.5 text-[13px] font-bold text-gray-800">
                    <span>Corner Radius</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${openSubSection === 'radius' ? 'rotate-180' : ''}`} />
                  </button>
                  {openSubSection === 'radius' && (
                    <div className="relative px-6 py-6 border-t border-gray-50">
                      <div className="grid grid-cols-2 gap-x-10 gap-y-5 justify-items-center">
                        <RadiusBox corner="tl" value={radius.tl} radiusStyle="rounded-tl-[4px]" />
                        <RadiusBox corner="tr" value={radius.tr} radiusStyle="rounded-tr-[4px]" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white p-1 rounded-full shadow-sm">
                          <button onClick={() => setIsRadiusLinked(!isRadiusLinked)} className={`p-1.5 rounded-full transition ${isRadiusLinked ? 'bg-indigo-50 text-indigo-600' : 'text-gray-300 hover:text-gray-500'}`}>
                            {isRadiusLinked ? <LinkIcon size={18} /> : <Link2Off size={18} />}
                          </button>
                        </div>
                        <RadiusBox corner="bl" value={radius.bl} radiusStyle="rounded-bl-[4px]" />
                        <RadiusBox corner="br" value={radius.br} radiusStyle="rounded-br-[4px]" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                  <button onClick={() => setOpenSubSection(openSubSection === 'effect' ? null : 'effect')} className="w-full flex items-center justify-between px-4 py-3.5 text-[13px] font-bold text-gray-800">
                    <span>Effect</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${openSubSection === 'effect' ? 'rotate-180' : ''}`} />
                  </button>
                  {openSubSection === 'effect' && (
                    <div className="p-4 pt-0 space-y-3 bg-white border-t border-gray-50">
                      {['Drop Shadow', 'Inner Shadow', 'Blur'].map((eff) => (
                        <div key={eff} className="space-y-1.5">
                          <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                            <span className="text-[12px] font-bold text-gray-700">{eff}</span>
                            <button onClick={() => setActiveEffects(prev => prev.includes(eff) ? prev.filter(e => e !== eff) : [...prev, eff])}>
                              {activeEffects.includes(eff) ? <Trash2 size={15} className="text-red-400" /> : <Plus size={15} className="text-gray-400" />}
                            </button>
                          </div>
                          {activeEffects.includes(eff) && (
                            <div className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm space-y-4">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{eff} Settings</span>
                                <div className="h-[1px] flex-1 bg-gray-50" />
                              </div>
                              {eff.includes('Shadow') && (
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-black border border-gray-100 flex items-center justify-center text-[9px] text-white font-bold">{effectSettings[eff].opacity}%</div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] text-gray-400 font-bold mb-0.5">Code</span>
                                      <div className="flex items-center border border-gray-200 rounded-md px-1.5 py-1 bg-white">
                                        <span className="text-[10px] font-bold mr-1">{effectSettings[eff].color}</span>
                                        <Pipette size={10} className="text-gray-400" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex justify-between mb-1">
                                        <span className="text-[9px] text-gray-400 font-bold uppercase">Opacity</span>
                                        <span className="text-[10px] font-bold text-gray-700">{effectSettings[eff].opacity}%</span>
                                      </div>
                                      <input type="range" min="0" max="100" value={effectSettings[eff].opacity} onChange={(e) => updateEffectSetting(eff, 'opacity', e.target.value)} className="h-1" />
                                  </div>
                                </div>
                              )}
                              <div className="grid grid-cols-1 gap-2">
                                {eff.includes('Shadow') && (
                                  <>
                                    <EffectControlRow label="X Axis" value={effectSettings[eff].x} onChange={(v) => updateEffectSetting(eff, 'x', v)} />
                                    <EffectControlRow label="Y Axis" value={effectSettings[eff].y} onChange={(v) => updateEffectSetting(eff, 'y', v)} />
                                  </>
                                )}
                                <EffectControlRow label="Blur %" value={effectSettings[eff].blur} onChange={(v) => updateEffectSetting(eff, 'blur', v)} />
                                <EffectControlRow label="Spread" value={effectSettings[eff].spread} onChange={(v) => updateEffectSetting(eff, 'spread', v)} />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            </div>
          </div>
        )}
      </div>

<div className="bg-white border border-gray-100 rounded-[20px] shadow-lg overflow-hidden font-sans">
  <div
    className="p-4 space-y-6 cursor-pointer"
    onClick={() => setIsInteractionsOpen(!isInteractionsOpen)}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-1.5 border border-gray-200 rounded-lg">
          <MousePointerClick size={16} className="text-gray-600" />
        </div>
        <span className="font-bold text-gray-700 text-sm">
          Interaction
        </span>
      </div>
      <ChevronUp
        size={18}
        className={`text-gray-400 transition-transform duration-200 ${
          isInteractionsOpen ? '' : 'rotate-180'
        }`}
      />
    </div>

    {isInteractionsOpen && (
      <>
        <div className="relative inline-block">
          <select
            value={interactionType}
            onChange={(e) => setInteractionType(e.target.value)}
            className="appearance-none px-3 py-1.5 pr-8 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="none">None</option>
            <option value="zoom">Zoom</option>
            <option value="download">Download</option>
            <option value="popup">Pop-Up</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-medium text-gray-700">
            Text
          </div>
          <div className="flex-1 mx-4 border-t border-dashed border-gray-400 relative">
            <span className="absolute right-[-2px] top-[-6px] text-gray-400 text-xs">
              →
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
            ?
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-500 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            Highlight the Component
          </span>
        </div>
      </>
    )}
  </div>
</div>

      <div className="bg-white border border-gray-100 rounded-[20px] shadow-lg overflow-hidden font-sans">
        <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsAnimationsOpen(!isAnimationsOpen)}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 border border-gray-200 rounded-lg"><Sparkles size={16} className="text-gray-600" /></div>
            <span className="font-bold text-gray-700 text-sm">Animation</span>
          </div>
          <ChevronUp size={18} className={`text-gray-400 transition-transform duration-200 ${isAnimationsOpen ? '' : 'rotate-180'}`} />
        </div>
      </div>

      {/* FIXED GALLERY MODAL */}
      {showGallery && (
        <div 
          className="fixed z-[10000] bg-white border border-gray-100 rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            width: '300px', 
            height: '600px',
            top: '50%',
            left: '65%',
            transform: 'translate(-1%, -40%)'
          }}
        >
          {galleryView === 'template' ? (
            <>
              <div className="flex border-b border-gray-100 px-6 pt-5 bg-white">
                <button onClick={() => setActiveTab('gallery')} className={`flex-1 pb-4 text-[13px] font-bold transition-all ${activeTab === 'gallery' ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}>Image Gallery</button>
                <button onClick={() => setActiveTab('uploaded')} className={`flex-1 pb-4 text-[13px] font-bold transition-all ${activeTab === 'uploaded' ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}>Uploaded</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activeTab === 'uploaded' && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-indigo-100 rounded-2xl flex flex-col items-center justify-center bg-indigo-50/30 hover:bg-indigo-50 transition-all cursor-pointer group mb-6"
                  >
                    <Upload size={20} className="text-indigo-500 mb-2" />
                    <p className="text-[10px] text-gray-400 font-medium">Click to <span className="text-indigo-600 font-bold">Upload</span></p>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[12px] font-bold text-gray-800">
                    {activeTab === 'gallery' ? 'Collection' : 'Recently Uploaded'}
                  </h3>
                  <div className="p-1.5 hover:bg-gray-100 rounded-md border border-gray-100 text-gray-400 cursor-pointer"><Search size={14} /></div>
                </div>

              <div className="grid grid-cols-3 gap-3">
  {(activeTab === 'gallery' ? galleryImages : uploadedImages).map((img) => (
    <div
      key={img.id} // ✅ use stable id (NOT index)
      className="group cursor-pointer"
      onClick={() => {
        setTempSelectedImage(img);     // ✅ select image
        setGalleryView('properties');  // keep your flow
      }}
    >
      <div
        className={`aspect-square rounded-[18px] overflow-hidden border transition-all shadow-sm
          ${
            tempSelectedImage?.id === img.id
              ? 'border-indigo-500 ring-2 ring-indigo-500'
              : 'border-gray-100 group-hover:ring-2 group-hover:ring-indigo-500'
          }`}
      >
        <img
          src={img.url}
          alt={img.name}
          className="w-full h-full object-cover"
        />
      </div>

      <p className="text-[9px] text-gray-400 mt-1.5 font-bold truncate text-center uppercase tracking-tight">
        {img.name}
      </p>
    </div>
  ))}
</div>

              </div>

              <div className="p-4 border-t border-gray-50 flex gap-2 bg-white">
  {/* CLOSE */}
  <button
    onClick={() => setShowGallery(false)}
    className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-xl text-[11px] font-bold text-gray-500 hover:bg-gray-50 transition-colors"
  >
    <X size={14} />
    Close
  </button>

  {/* REPLACE */}
  <button
    disabled={!tempSelectedImage}
    onClick={() => {
      if (!tempSelectedImage) return;

      // ✅ replace template image ONLY from gallery selection
      selectedElement.src = tempSelectedImage.url;

      if (onUpdate) onUpdate();
    }}
    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-bold shadow-md transition-colors
      ${
        tempSelectedImage
          ? 'bg-black text-white hover:bg-gray-900'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
      }`}
  >
    <Replace size={14} />
    Replace
  </button>
</div>

            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-5 border-b border-gray-50">
                <button onClick={() => setGalleryView('template')} className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"><ArrowLeft size={16} className="text-gray-600" /></button>
                <span className="font-bold text-gray-700 text-sm">Properties</span>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <div className="w-full aspect-square rounded-[24px] overflow-hidden shadow-lg border border-gray-100 bg-gray-50">
                  <img src={tempSelectedImage?.url} className="w-full h-full object-cover" alt="Selected preview" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Information</span>
                     <div className="h-[1px] flex-1 bg-gray-100" />
                  </div>
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
                      <div className="flex justify-between items-center text-[11px]"><span className="text-gray-400 font-medium">Name</span><span className="font-bold text-gray-700 truncate ml-4">{tempSelectedImage?.name}</span></div>
                      <div className="flex justify-between items-center text-[11px]"><span className="text-gray-400 font-medium">Format</span><span className="font-bold text-gray-700 uppercase">JPEG</span></div>
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-gray-50 flex gap-3 bg-white">
                <button onClick={() => setGalleryView('template')} className="flex-1 py-3 border border-gray-100 rounded-xl text-[11px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                <button
                  onClick={() => { 
                    selectedElement.src = tempSelectedImage.url; 
                    setGalleryView('template'); // Returns to list view but keeps modal open
                    if (onUpdate) onUpdate(); 
                  }}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[11px] font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                >Confirm</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageEditor;