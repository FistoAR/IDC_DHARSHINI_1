// FlipbookPreview.jsx - Teal Theme with Bottom Control Bar (Image 2 Match)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  Maximize2, Minimize2, Download, Grid, Share2, Search, Play, Pause,
  Volume2, Menu
} from 'lucide-react';
import logo from '../../assets/logo/Fisto_logo.png'; // Assuming path

const FlipbookPreview = ({ pages, pageName = "Bestomech Flipbook .pdf", onClose, isMobile = false }) => {
  const flipbookRef = useRef(null);
  const containerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const totalPages = pages.length;

  // Initialize Turn.js
  useEffect(() => {
    if (!flipbookRef.current || !window.$ || !window.$.fn.turn || isInitialized) return;

    const $flipbook = window.$(flipbookRef.current);
    
    // Calculate dimensions based on viewport
    const viewportHeight = window.innerHeight - 160; // Adjusted for bars
    const pageHeight = Math.min(viewportHeight, 650);
    const pageWidth = pageHeight / 1.414; // A4 ratio

    const displayMode = isMobile ? 'single' : 'double';
    const flipbookWidth = isMobile ? pageWidth : pageWidth * 2;

    $flipbook.turn({
      width: flipbookWidth,
      height: pageHeight,
      autoCenter: true,
      display: displayMode,
      acceleration: true,
      gradients: true,
      elevation: 50,
      when: {
        turning: (event, page) => {
          setCurrentPage(page);
        },
        turned: (event, page) => {
          setCurrentPage(page);
        }
      }
    });

    setIsInitialized(true);

    return () => {
      if ($flipbook.turn) {
          try { $flipbook.turn('destroy'); } catch(e){}
      }
    };
  }, [pages, isMobile]);

  // Navigation functions
  const goToPage = useCallback((page) => {
    if (flipbookRef.current && window.$) {
      window.$(flipbookRef.current).turn('page', page);
    }
  }, []);

  const nextPage = useCallback(() => {
    if (flipbookRef.current && window.$) {
      window.$(flipbookRef.current).turn('next');
    }
  }, []);

  const prevPage = useCallback(() => {
    if (flipbookRef.current && window.$) {
      window.$(flipbookRef.current).turn('previous');
    }
  }, []);

  // Play / Autoplay Logic (Mock)
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        if (currentPage < totalPages) {
          nextPage();
        } else {
          setIsPlaying(false);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentPage, totalPages, nextPage]);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(2, prev + 0.25));
  const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev - 0.25));

  // Fullscreen
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Download current page
  const downloadPage = useCallback(() => {
    // Logic remains same as established previously
    alert("Download page logic here (using html2canvas)");
  }, []);

  // Calculate page dimensions for rendering
  const viewportHeight = window.innerHeight - 160;
  const pageHeight = Math.min(viewportHeight, 650) * zoom;
  const pageWidth = pageHeight / 1.414;
  const flipbookWidth = isMobile ? pageWidth : pageWidth * 2;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-[#4CB5AE] z-[100] flex flex-col overflow-hidden font-poppins"
    >
      {/* Top Bar - Transparent/Minimal */}
      <div className="flex items-center justify-between p-4 flex-shrink-0 z-20">
         {/* Logo Left */}
        <div className="flex items-center gap-4">
            <div className="bg-transparent">
                 {/* Placeholder for FIST-O Logo if img not loaded */}
                <img 
                    src={logo} 
                    alt="FIST-O Logo" 
                    className="h-12 w-auto object-contain"
                />
            </div>
        </div>

        {/* Title Center */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4">
            <h1 className="text-lg text-gray-800 font-medium">
                {pageName}
            </h1>
        </div>

        {/* Right - Close/Exit */}
        <div>
             {/* Perhaps nothing here, as controls are at bottom? Or standard close */}
             {/* If user wants EXACT matching image 2, there are NO top-right controls visible in the screenshot except maybe implicit browser chrome. But we need a close button if this is a modal. */}
             {/* The image shows a full screen app view. I'll add a subtle close X for usability */}
             <button onClick={onClose} className="text-gray-700 hover:text-black">
                 <X size={24} />
             </button>
        </div>
      </div>


      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative items-center justify-center">
        
        {/* Navigation Arrows */}
        <button 
            onClick={prevPage} 
            className="absolute left-8 z-10 p-3 bg-black/20 hover:bg-black/40 text-white rounded-lg transition-colors"
        >
            <ChevronLeft size={24} />
        </button>

        <button 
            onClick={nextPage} 
            className="absolute right-8 z-10 p-3 bg-black/20 hover:bg-black/40 text-white rounded-lg transition-colors"
        >
            <ChevronRight size={24} />
        </button>

        {/* Flipbook Container */}
        <div 
            className="flipbook-container shadow-2xl"
            style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center'
            }}
        >
            <div 
              ref={flipbookRef}
              className="flipbook"
              style={{ width: flipbookWidth, height: pageHeight }}
            >
              {pages.map((pageHTML, idx) => (
                <div 
                  key={idx}
                  className="page bg-white shadow-lg"
                  style={{ width: pageWidth, height: pageHeight, overflow: 'hidden' }}
                >
                  <iframe
                    srcDoc={pageHTML}
                    title={`Page ${idx + 1}`}
                    style={{
                      width: '595px',
                      height: '842px',
                      border: 'none',
                      transform: `scale(${pageHeight / 842})`,
                      transformOrigin: 'top left',
                      pointerEvents: 'none'
                    }}
                  />
                  {/* Page gradient overlay for realism */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
                </div>
              ))}
            </div>
        </div>
      </div>


      {/* Bottom Control Bar - Dark Gray */}
      <div className="bg-[#2F3740] h-14 flex items-center px-4 justify-between text-gray-300 flex-shrink-0 z-30">
        
        {/* Left Group: Menu, Thumbnails */}
        <div className="flex items-center gap-1">
             <button className="p-2 hover:text-white hover:bg-white/10 rounded" title="Table of Contents">
                <Menu size={20} />
             </button>
             <button 
                className={`p-2 hover:text-white hover:bg-white/10 rounded ${showThumbnails ? 'text-white' : ''}`}
                onClick={() => setShowThumbnails(!showThumbnails)}
                title="Thumbnails"
             >
                <Grid size={20} />
             </button>
        </div>

        {/* Center Group: Play, Progress, Sound, Search, Zoom */}
        <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl">
             <button 
                className="p-2 hover:text-white"
                onClick={() => setIsPlaying(!isPlaying)}
             >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
             </button>

             {/* Progress Bar Mockup */}
             <div className="flex items-center gap-3 flex-1">
                <span className="text-xs w-8 text-right">{currentPage}</span>
                <div className="h-1 flex-1 bg-gray-600 rounded-full relative cursor-pointer">
                    <div 
                        className="absolute left-0 top-0 bottom-0 bg-indigo-500 rounded-full"
                        style={{ width: `${(currentPage / totalPages) * 100}%` }}
                    />
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow cursor-pointer hover:scale-110 transition-transform"
                        style={{ left: `${(currentPage / totalPages) * 100}%` }}
                    />
                </div>
                <span className="text-xs w-8">{totalPages}</span>
             </div>

             <button className="p-2 hover:text-white">
                <Volume2 size={20} />
             </button>
             <button className="p-2 hover:text-white">
                <Search size={20} />
             </button>
             
             {/* Zoom Slider Mockup */}
             <div className="flex items-center gap-2">
                 <button onClick={handleZoomOut} disabled={zoom <= 0.5} className="hover:text-white disabled:opacity-30">
                    <ZoomOut size={16} />
                 </button>
                 <div className="w-16 h-1 bg-gray-600 rounded-full relative">
                     <div 
                        className="absolute left-0 top-0 bottom-0 bg-blue-400 rounded-full" 
                        style={{ width: `${(zoom - 0.5) / 1.5 * 100}%` }} 
                     />
                 </div>
                 <button onClick={handleZoomIn} disabled={zoom >= 2} className="hover:text-white disabled:opacity-30">
                    <ZoomIn size={16} />
                 </button>
             </div>
        </div>

        {/* Right Group: Share, Download, Fullscreen */}
        <div className="flex items-center gap-2">
             <button className="p-2 hover:text-white hover:bg-white/10 rounded">
                <Share2 size={20} />
             </button>
             <button onClick={downloadPage} className="p-2 hover:text-white hover:bg-white/10 rounded">
                <Download size={20} />
             </button>
             <button onClick={toggleFullscreen} className="p-2 hover:text-white hover:bg-white/10 rounded">
                 {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
             </button>
        </div>
      </div>

       {/* Styles for Turn.js enhancements */}
      <style jsx global>{`
        .flipbook .page {
           box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
        }
        .flipbook .turn-page {
           background-color: #f8fafc;
        }
        .flipbook .shadow {
            box-shadow: -20px 0 50px rgba(0,0,0,0.5) !important;
        }
      `}</style>

    </div>
  );
};

export default FlipbookPreview;