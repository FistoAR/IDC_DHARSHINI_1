import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronDown, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRightLeft,
  Image as ImageIcon,
  MoreVertical,
  Replace,
  Upload,
  Plus,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { Icon } from '@iconify/react';

const DraggableSpan = ({ label, value, onChange, min = 0, max = 100, className }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startValRef = useRef(0);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => {
      const dx = e.clientX - startXRef.current;
      const newVal = Math.max(min, Math.min(max, startValRef.current + Math.round(dx)));
      onChange(newVal);
    };
    const handleUp = () => { setIsDragging(false); document.body.style.cursor = ''; };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    document.body.style.cursor = 'ew-resize';
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); document.body.style.cursor = ''; };
  }, [isDragging, onChange, min, max]);

  const onMouseDown = (e) => {
    e.preventDefault(); setIsDragging(true);
    startXRef.current = e.clientX; startValRef.current = Number(value);
  };

  return (
    <span className={`${className} cursor-ew-resize select-none`} onMouseDown={onMouseDown}>{label}</span>
  );
};

const Toggle = ({ active, onClick }) => (
  <button 
    onClick={onClick}
    className={`relative w-10 h-[22px] transition-colors duration-200 ease-in-out rounded-full focus:outline-none ${active ? 'bg-[#6366f1]' : 'bg-gray-200'}`}
  >
    <div className={`absolute left-0.5 top-0.5 bg-white w-[18px] h-[18px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${active ? 'translate-x-[18px]' : 'translate-x-0'}`} />
  </button>
);

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-2 py-1 mt-2">
    <span className="text-[12px] font-bold text-gray-900 whitespace-nowrap">{title}</span>
    <div className="h-[1px] flex-1 bg-gray-200" />
  </div>
);

const SlideshowProperties = ({ selectedElement, onUpdate, isOpen, onToggle, opacity, setPreviewSrc }) => {
  const [showEffectDropdown, setShowEffectDropdown] = useState(false);
  const [showFitDropdown, setShowFitDropdown] = useState(false);
  const [openContextMenu, setOpenContextMenu] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  
  // Slideshow specific states
  const [slideshowSettings, setSlideshowSettings] = useState({
    autoPlay: true,
    speed: 2,
    infiniteLoop: false,
    showArrows: true,
    showDots: true,
    imageFitType: 'Fill All',
    transitionEffect: 'Fade',
    dragToSlide: false,
    dotColor: '#000000',
    dotOpacity: 100
  });
  const [slideshowImages, setSlideshowImages] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Ref to prevent persistence for one cycle during hydration
  const shouldSkipPersistence = useRef(false);

  // Hydrate Slideshow State from DOM
  useEffect(() => {
    if (selectedElement) {
      if (selectedElement.dataset.slideshow) {
        try {
          const savedData = JSON.parse(selectedElement.dataset.slideshow);
          if (savedData) {
            shouldSkipPersistence.current = true;
            setSlideshowSettings(prev => ({ ...prev, ...savedData.settings }));
            setSlideshowImages(savedData.images || []);
            setActiveSlideIndex(0);
          }
        } catch (e) {
          console.error("Failed to parse slideshow data", e);
        }
      } else if (slideshowImages.length === 0) {
        // Initialize with core image if new slideshow
        const currentSrc = selectedElement.getAttribute('src') || selectedElement.src;
        if (currentSrc) {
          setSlideshowImages([{ id: Date.now(), url: currentSrc, name: 'Main Image' }]);
          setActiveSlideIndex(0);
        }
      }
    }
  }, [selectedElement]);

  // Persist Slideshow Slides & Settings to DOM
  useEffect(() => {
    if (shouldSkipPersistence.current) {
      shouldSkipPersistence.current = false;
      return;
    }

    if (selectedElement) {
      if (slideshowImages.length > 0) {
        const dataToSave = {
          settings: slideshowSettings,
          images: slideshowImages
        };
        selectedElement.setAttribute('data-slideshow', JSON.stringify(dataToSave));
        selectedElement.setAttribute('data-is-slideshow', 'true');
        if (onUpdate) onUpdate();
      }
    }
  }, [slideshowSettings, slideshowImages, selectedElement, onUpdate]);

  // Auto Play Effect
  useEffect(() => {
    let interval;
    if (slideshowSettings.autoPlay && slideshowImages.length > 1) {
      interval = setInterval(() => {
        setActiveSlideIndex((prev) => {
          const next = prev + 1;
          if (next >= slideshowImages.length) {
            return slideshowSettings.infiniteLoop ? 0 : prev;
          }
          return next;
        });
      }, slideshowSettings.speed * 1000);
    }
    return () => clearInterval(interval);
  }, [slideshowSettings.autoPlay, slideshowSettings.speed, slideshowSettings.infiniteLoop, slideshowImages.length]);

  // Sync Template Image Src with Active Slide and Apply Effects
  useEffect(() => {
    if (slideshowImages[activeSlideIndex] && selectedElement) {
      const activeImg = slideshowImages[activeSlideIndex];
      const currentSrc = selectedElement.getAttribute('src');

      if (currentSrc !== activeImg.url) {
        const effect = slideshowSettings.transitionEffect;
        const baseOpacity = (opacity / 100).toString();

        const finishTransition = () => {
          selectedElement.src = activeImg.url;
          selectedElement.removeAttribute('data-original-src');
          if (setPreviewSrc) setPreviewSrc(activeImg.url);
          
          setTimeout(() => {
             selectedElement.style.transition = '';
             selectedElement.style.transform = '';
             selectedElement.style.opacity = baseOpacity;
             selectedElement.style.filter = ''; 
          }, 50);
        };

        if (effect === 'Fade') {
            selectedElement.style.transition = 'opacity 0.4s ease-in-out';
            selectedElement.style.opacity = '0.2';
            setTimeout(() => {
                finishTransition();
                requestAnimationFrame(() => { selectedElement.style.opacity = baseOpacity; });
            }, 400);
        } else if (effect === 'Slide' || effect === 'Push') {
            selectedElement.style.transition = 'transform 0.4s ease-in, opacity 0.4s ease-in';
            selectedElement.style.transform = 'translateX(-30%)';
            selectedElement.style.opacity = '0';
            setTimeout(() => {
                selectedElement.src = activeImg.url;
                if (setPreviewSrc) setPreviewSrc(activeImg.url);
                selectedElement.style.transition = 'none';
                selectedElement.style.transform = 'translateX(30%)';
                void selectedElement.offsetWidth;
                selectedElement.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
                selectedElement.style.transform = 'translateX(0)';
                selectedElement.style.opacity = baseOpacity;
                setTimeout(() => {
                    selectedElement.style.transition = '';
                    selectedElement.style.transform = '';
                }, 400);
            }, 400);
        } else if (effect === 'Flip') {
            selectedElement.style.transition = 'transform 0.5s ease-in-out';
            selectedElement.style.transform = 'rotateY(90deg)';
            setTimeout(() => {
                selectedElement.src = activeImg.url;
                if (setPreviewSrc) setPreviewSrc(activeImg.url);
                selectedElement.style.transition = 'none';
                selectedElement.style.transform = 'rotateY(-90deg)';
                void selectedElement.offsetWidth;
                selectedElement.style.transition = 'transform 0.5s ease-in-out';
                selectedElement.style.transform = 'rotateY(0deg)';
                setTimeout(() => {
                    selectedElement.style.transition = '';
                    selectedElement.style.transform = '';
                }, 500);
            }, 500);
        } else if (effect === 'Reveal' || effect === 'Zoom') {
            selectedElement.style.transition = 'transform 0.4s ease-in, opacity 0.4s ease';
            selectedElement.style.transform = 'scale(0.8)';
            selectedElement.style.opacity = '0.5';
            setTimeout(() => {
                selectedElement.src = activeImg.url;
                if (setPreviewSrc) setPreviewSrc(activeImg.url);
                selectedElement.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease';
                selectedElement.style.transform = 'scale(1)';
                selectedElement.style.opacity = baseOpacity;
                setTimeout(() => {
                    selectedElement.style.transition = '';
                    selectedElement.style.transform = '';
                }, 400);
            }, 400);
        } else {
            finishTransition();
        }
      }
    }
  }, [slideshowImages, activeSlideIndex, selectedElement, slideshowSettings.transitionEffect, opacity, setPreviewSrc]);

  // Inject Slideshow Controls
  useEffect(() => {
    if (!selectedElement || !selectedElement.parentElement) return;

    const doc = selectedElement.ownerDocument;
    const parent = selectedElement.parentElement;
    
    if (window.getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    let overlay = parent.querySelector('.slideshow-overlay-controls');
    if (!overlay) {
      overlay = doc.createElement('div');
      overlay.className = 'slideshow-overlay-controls';
      overlay.style.cssText = `position: absolute; inset: 0; z-index: 10; pointer-events: none; display: flex; flex-direction: column; justify-content: space-between;`;
      parent.appendChild(overlay);
    }
    overlay.innerHTML = '';

    if (!slideshowSettings.autoPlay && slideshowSettings.showArrows && slideshowImages.length > 1) {
      const createArrow = (direction) => {
        const isLeft = direction === 'left';
        const canGoBack = slideshowSettings.infiniteLoop || activeSlideIndex > 0;
        const canGoNext = slideshowSettings.infiniteLoop || activeSlideIndex < slideshowImages.length - 1;
        if (isLeft && !canGoBack) return null;
        if (!isLeft && !canGoNext) return null;

        const btn = doc.createElement('div');
        btn.style.cssText = `position: absolute; top: 50%; ${isLeft ? 'left: 10px;' : 'right: 10px;'} transform: translateY(-50%); width: 32px; height: 32px; background: rgba(255, 255, 255, 0.8); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; pointer-events: auto; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: background 0.2s; z-index: 20;`;
        btn.innerHTML = isLeft ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>` : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>`;
        btn.onclick = (e) => {
          e.stopPropagation(); e.preventDefault();
          setActiveSlideIndex(prev => isLeft ? (prev === 0 ? slideshowImages.length - 1 : prev - 1) : (prev === slideshowImages.length - 1 ? 0 : prev + 1));
        };
        return btn;
      };
      const left = createArrow('left'); if (left) overlay.appendChild(left);
      const right = createArrow('right'); if (right) overlay.appendChild(right);
    }

    if (slideshowSettings.showDots && slideshowImages.length > 1) {
      const dotsContainer = doc.createElement('div');
      dotsContainer.style.cssText = `position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; pointer-events: auto; padding: 4px 8px; background: rgba(0,0,0,0.1); border-radius: 12px; backdrop-filter: blur(2px);`;
      slideshowImages.forEach((_, idx) => {
        const dot = doc.createElement('div');
        const isActive = idx === activeSlideIndex;
        dot.style.cssText = `width: 8px; height: 8px; border-radius: 50%; cursor: pointer; transition: all 0.2s; background-color: ${isActive ? slideshowSettings.dotColor : 'rgba(255,255,255,0.5)'}; opacity: ${isActive ? 1 : (slideshowSettings.dotOpacity / 100)}; transform: ${isActive ? 'scale(1.2)' : 'scale(1)'}; box-shadow: 0 1px 2px rgba(0,0,0,0.1);`;
        dot.onclick = (e) => { e.stopPropagation(); e.preventDefault(); setActiveSlideIndex(idx); };
        dotsContainer.appendChild(dot);
      });
      overlay.appendChild(dotsContainer);
    }

    if (!slideshowSettings.autoPlay && slideshowSettings.dragToSlide && slideshowImages.length > 1) {
      const dragLayer = doc.createElement('div');
      dragLayer.style.cssText = `position: absolute; inset: 0; z-index: 5; cursor: grab; pointer-events: auto;`;
      dragLayer.onmousedown = (e) => {
        e.stopPropagation();
        const startX = e.clientX;
        let isDragging = false;
        const move = (mv) => { if (Math.abs(mv.clientX - startX) > 10) isDragging = true; };
        const up = (upE) => {
          if (isDragging) {
            const diff = upE.clientX - startX;
            if (Math.abs(diff) > 50) {
              if (diff > 0) setActiveSlideIndex(prev => prev === 0 ? (slideshowSettings.infiniteLoop ? slideshowImages.length - 1 : 0) : prev - 1);
              else setActiveSlideIndex(prev => prev === slideshowImages.length - 1 ? (slideshowSettings.infiniteLoop ? 0 : prev) : prev + 1);
            }
          }
          doc.removeEventListener('mousemove', move); doc.removeEventListener('mouseup', up);
        };
        doc.addEventListener('mousemove', move); doc.addEventListener('mouseup', up);
      };
      overlay.insertBefore(dragLayer, overlay.firstChild);
    }

    return () => { if (overlay) overlay.remove(); };
  }, [slideshowSettings, slideshowImages, activeSlideIndex, selectedElement]);

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (slideshowImages.length === 4) {
      const file = files[0];
      if (!file || !file.type.startsWith('image/')) return;
      const newImage = { id: Date.now(), url: URL.createObjectURL(file), name: file.name };
      setSlideshowImages(prev => {
        const updated = [...prev];
        updated[activeSlideIndex] = newImage;
        return updated;
      });
    } else {
      const remainingSlots = 4 - slideshowImages.length;
      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      const newImages = filesToUpload.filter(file => file.type.startsWith('image/')).map((file, idx) => ({
        id: Date.now() + idx, url: URL.createObjectURL(file), name: file.name
      }));
      if (newImages.length > 0) setSlideshowImages(prev => [...prev, ...newImages]);
    }
    e.target.value = '';
  };

  const handleModalFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const imageUrl = URL.createObjectURL(file);
    const newImage = { id: Date.now(), name: file.name, url: imageUrl };
    setUploadedImages(prev => [newImage, ...prev]);
    if (selectedElement) {
        selectedElement.src = imageUrl;
        if (setPreviewSrc) setPreviewSrc(imageUrl);
        if (onUpdate) onUpdate({ shouldRefresh: true });
    }
    e.target.value = '';
  };

  const updateSetting = (key, value) => {
    setSlideshowSettings({ ...slideshowSettings, [key]: value });
  };

  const effects = ['Linear', 'Fade', 'Slide', 'Push', 'Flip', 'Reveal'];

  return (
    <div className="space-y-4">
      {/* Slideshow Image Management UI (Moved from ImageEditor) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Slideshow Images (Max 4):</span>
            <div className="relative">
                <button 
                  onClick={() => setShowFitDropdown(!showFitDropdown)}
                  className="flex items-center justify-between w-[90px] px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg hover:border-indigo-400 transition-all text-[10px] font-bold text-gray-700 shadow-sm"
                >
                  <span>{slideshowSettings.imageFitType || 'Fill All'}</span>
                  <ChevronDown size={12} className={`text-gray-400 transition-transform ${showFitDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showFitDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-[90px] bg-white border border-gray-100 rounded-lg shadow-xl z-[100] py-1 overflow-hidden">
                    {['Fit All', 'Fill All'].map(type => (
                      <button 
                        key={type}
                        onClick={() => {
                          updateSetting('imageFitType', type);
                          setShowFitDropdown(false);
                        }}
                        className="w-full text-center px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 w-full py-1">
             <div className="w-[70px] h-[70px] rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 flex items-center justify-center overflow-hidden p-1.5">
               {slideshowImages[activeSlideIndex] ? (
                 <img src={slideshowImages[activeSlideIndex].url} className="w-full h-full object-cover rounded-xl" alt="" />
               ) : (
                 <ImageIcon size={24} className="text-gray-300" />
               )}
             </div>
             <Replace size={16} className="text-gray-300" />
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="flex-1 h-[70px] border-2 border-dashed border-gray-100 bg-gray-50/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all group"
             >
               <Upload size={20} className="text-gray-400 group-hover:text-indigo-500 mb-1" />
               <p className="text-[10px] text-gray-500 font-medium">Upload Image</p>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" multiple={slideshowImages.length < 4} className="hidden" />
          </div>

          <div className="grid grid-cols-4 gap-2 px-1">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="relative group">
                <div 
                  onClick={() => {
                    setActiveSlideIndex(i);
                    if (slideshowImages[i]) setOpenContextMenu(openContextMenu === i ? null : i);
                  }}
                  className={`aspect-square w-full rounded-xl cursor-pointer border-2 transition-all ${activeSlideIndex === i ? 'border-indigo-500 shadow-md transform scale-105' : 'border-gray-100'}`}
                >
                  {slideshowImages[i] ? (
                    <img src={slideshowImages[i].url} className="w-full h-full object-cover rounded-[10px]" alt="" />
                  ) : (
                    <div className="w-full h-full bg-gray-50/50 flex items-center justify-center rounded-[10px]">
                      <span className="text-[10px] font-bold text-gray-300">{i+1}</span>
                    </div>
                  )}
                </div>
                {openContextMenu === i && (
                  <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-100 rounded-lg shadow-xl z-[110] overflow-hidden">
                    <button 
                      onClick={() => { setShowGallery(true); setOpenContextMenu(null); }}
                      className="w-full px-2 py-1.5 text-[10px] font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"
                    >
                      <ImageIcon size={12} /> Gallery
                    </button>
                    <button 
                      onClick={() => { setSlideshowImages(prev => prev.filter((_, idx) => idx !== i)); setOpenContextMenu(null); }}
                      className="w-full px-2 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-1.5"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
      </div>

      {/* Properties Accordion */}
      <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
        <button 
          onClick={onToggle} 
          className="w-full flex items-center justify-between px-4 py-3.5 text-[13px] font-bold text-gray-800"
        >
          <span>Slideshow Properties</span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="relative px-6 pb-5 pt-5 border-t border-gray-100">
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            {/* Mode Toggle */}
            <div className="flex justify-start pt-1">
              <button 
                onClick={() => updateSetting('autoPlay', !slideshowSettings.autoPlay)}
                className="flex items-center gap-3 px-3 py-2 bg-[#F3F4F6] rounded-lg hover:bg-gray-200 transition-colors group"
              >
                <span className="text-[12px] font-medium text-gray-600">
                  {slideshowSettings.autoPlay ? 'Auto Slide Mode' : 'Manual Slide Mode'}
                </span>
                <Icon icon="ph:ArrowRightLeftp" className="text-gray-900 group-hover:text-indigo-600 transition-colors" width="16" />
              </button>
            </div>

            {/* Slide Effect */}
            <div className="space-y-3">
              <SectionHeader title="Slide Effect" />
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-gray-600">Select Slide Effects :</span>
                <div className="relative">
                  <button 
                    onClick={() => setShowEffectDropdown(!showEffectDropdown)}
                    className="flex items-center justify-between w-[120px] px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-indigo-300 transition-all"
                  >
                    <span className="text-[13px] font-bold text-gray-700">{slideshowSettings.transitionEffect || 'Fade'}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${showEffectDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showEffectDropdown && (
                    <>
                      <div className="fixed inset-0 z-[90]" onClick={() => setShowEffectDropdown(false)} />
                      <div className="absolute right-0 top-full mt-2 w-full min-w-[120px] bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-[100] py-1 animate-in fade-in zoom-in-95 duration-150">
                        {effects.map((eff) => (
                          <button 
                            key={eff} 
                            onClick={() => {
                              updateSetting('transitionEffect', eff);
                              setShowEffectDropdown(false);
                            }} 
                            className="w-full px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors text-center"
                          >
                            {eff}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="space-y-4">
              <SectionHeader title="Navigation Controls" />
              
              {slideshowSettings.autoPlay && (
                <div className="flex items-center justify-between px-0 animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="text-[12px] font-medium text-gray-700 whitespace-nowrap">Auto Slide Duration</span>
                  <div className="flex-1 mx-4 h-[1px] border-t border-gray-100 border-dashed" />
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => updateSetting('speed', Math.max(1, slideshowSettings.speed - 1))}
                      className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="w-12 h-8 border border-gray-200 rounded-lg text-[13px] font-bold text-gray-700 bg-white shadow-sm overflow-hidden">
                      <DraggableSpan 
                        label={`${slideshowSettings.speed}s`}
                        value={slideshowSettings.speed}
                        onChange={(v) => updateSetting('speed', v)}
                        min={1}
                        max={20}
                        className="w-full h-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                      />
                    </div>
                    <button 
                      onClick={() => updateSetting('speed', Math.min(20, slideshowSettings.speed + 1))}
                      className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {!slideshowSettings.autoPlay && (
                <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[12px] font-medium text-gray-700">Drag to Slide</span>
                    <div className="flex-1 mx-4 h-[1px] border-t border-gray-100 border-dashed" />
                    <Toggle active={slideshowSettings.dragToSlide} onClick={() => updateSetting('dragToSlide', !slideshowSettings.dragToSlide)} />
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <span className="text-[12px] font-medium text-gray-700">Navigation Buttons</span>
                    <div className="flex-1 mx-4 h-[1px] border-t border-gray-100 border-dashed" />
                    <Toggle active={slideshowSettings.showArrows} onClick={() => updateSetting('showArrows', !slideshowSettings.showArrows)} />
                  </div>
                </div>
              )}
            </div>

            {/* Other Controls */}
            <div className="space-y-3">
              <SectionHeader title="Other Controls" />
              
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-gray-600">Pagination Dots</span>
                <div className="flex items-center gap-3 flex-1 px-4">
                  <div className="h-[1px] w-full border-t border-gray-100 border-dashed" />
                </div>
                <Toggle active={slideshowSettings.showDots} onClick={() => updateSetting('showDots', !slideshowSettings.showDots)} />
              </div>

              {slideshowSettings.showDots && (
                <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="text-[13px] font-medium text-gray-600">Dot Color :</span>
                  <div className="flex items-center gap-2">
                    <div className="relative group/color">
                      <div 
                        className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm cursor-pointer overflow-hidden"
                        style={{ backgroundColor: slideshowSettings.dotColor }}
                      >
                        <input 
                          type="color" 
                          value={slideshowSettings.dotColor}
                          onChange={(e) => updateSetting('dotColor', e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm gap-2">
                      <input 
                        type="text" 
                        value={slideshowSettings.dotColor.toUpperCase()}
                        onChange={(e) => updateSetting('dotColor', e.target.value)}
                        className="w-16 text-[12px] font-bold text-gray-700 outline-none"
                      />
                      <div className="w-[1px] h-3 bg-gray-200" />
                      <DraggableSpan 
                        label={`${slideshowSettings.dotOpacity}%`}
                        value={slideshowSettings.dotOpacity}
                        onChange={(v) => updateSetting('dotOpacity', v)}
                        className="text-[11px] font-bold text-gray-500 w-8 text-right"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-gray-600">Infinity Loop Mode</span>
                <div className="flex items-center gap-3 flex-1 px-4">
                  <div className="h-[1px] w-full border-t border-gray-100 border-dashed" />
                </div>
                <Toggle active={slideshowSettings.infiniteLoop} onClick={() => updateSetting('infiniteLoop', !slideshowSettings.infiniteLoop)} />
              </div>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Internal Gallery Modal For Slideshow Image Slots */}
      {showGallery && (
          <div className="fixed z-[1000] bg-white border border-gray-100 rounded-[12px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ width: '320px', height: '540px', top: '55%', left: '80%', transform: 'translate(-50%, -50%)' }}>
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100"><h2 className="text-mg font-bold text-gray-900">Image Gallery</h2><button onClick={() => setShowGallery(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"><X size={18} className="text-gray-400" /></button></div>
          <div className=" px-4 py-2"><h3 className="text-[13px] font-bold text-gray-900 mb-1">Upload your Image</h3><p className="text-[11px] text-gray-400 mb-4"><span>You Can Reuse The File Which Is Uploaded In Gallery</span><span className="text-red-500">*</span></p><div 
            onClick={() => galleryInputRef.current?.click()} 
            className="w-full h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-all cursor-pointer group mb-2"
          ><p className="text-[13px] text-gray-500 font-normal mb-3">Drag & Drop or <span className="text-blue-600 font-semibold">Upload</span></p><Upload size={28} className="text-gray-300 mb-2" strokeWidth={1.5} /><p className="text-[11px] text-gray-400 text-center">Supported File : <span className="font-medium">JPG, PNG</span></p></div><input type="file" ref={galleryInputRef} onChange={handleModalFileUpload} accept="image/*" className="hidden" /></div>
          <div className="custom-scrollbar overflow-y-auto max-h-[250px] px-4 py-2 flex-1"><h3 className="text-[13px] font-bold text-gray-900 mb-1">Uploaded Images</h3>{uploadedImages.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">{uploadedImages.map((img, index) => (
              <div key={img.id || index} className="group cursor-pointer flex flex-col items-center" onClick={() => {
                  setSlideshowImages(prev => {
                    const updated = [...prev];
                    updated[activeSlideIndex] = { id: img.id, url: img.url, name: img.name };
                    return updated;
                  });
              }}>
                <div className={`aspect-square w-full rounded-lg overflow-hidden border-2 transition-all hover:border-indigo-400 border-gray-100`}><img src={img.url} className="w-full h-full object-cover" alt="" /></div>
              </div>
            ))}</div>
          ) : (
            <div className="text-center py-8 text-gray-400"><p className="text-sm">No uploaded images yet</p></div>
          )}</div>
          <div className="p-3 border-t flex justify-end gap-2 bg-white mt-auto"><button onClick={() => setShowGallery(false)} className="flex-1 h-8 border border-gray-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-gray-50"><X size={12} /> Close</button><button onClick={() => setShowGallery(false)} className="flex-1 h-8 bg-black text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-zinc-800"><Check size={12} /> Done</button></div>
        </div>
      )}
    </div>
  );
};

export default SlideshowProperties;
