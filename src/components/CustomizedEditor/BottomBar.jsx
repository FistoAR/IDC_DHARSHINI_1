import React from 'react';
import { Icon } from '@iconify/react';

const BottomBar = ({ 
    currentPage = 0, 
    totalPages = 1, 
    onPageChange, 
    zoom = 1, 
    onZoomChange, 
    isPlaying, 
    onPlayToggle,
    isFullscreen,
    onFullscreenToggle 
}) => {
  
  // Handlers
  const handleZoomOut = () => onZoomChange && onZoomChange(Math.max(0.5, zoom - 0.1));
  const handleZoomIn = () => onZoomChange && onZoomChange(Math.min(2, zoom + 0.1));
  
  const handlePageSeek = (e) => {
      const page = parseInt(e.target.value, 10);
      if (onPageChange) onPageChange(page);
  };

  const handleZoomSeek = (e) => {
      const val = parseFloat(e.target.value);
      if (onZoomChange) onZoomChange(val);
  };

  // Calculations for visual bars
  const zoomPercent = Math.min(100, Math.max(0, ((zoom - 0.5) / 1.5) * 100)); // 0.5 to 2.0 range
  const progressPercent = totalPages > 1 ? Math.min(100, Math.max(0, (currentPage / (totalPages - 1)) * 100)) : 0;

  return (
    <div className="bg-[#555AB9] h-14 px-6 flex items-center justify-between text-white shrink-0 shadow-inner z-20">
      {/* Left Controls */}
      <div className="flex items-center">
        <button className="p-1.5 hover:bg-white/10 rounded-sm transition-colors" title="Grid View">
          <Icon icon="fluent:grid-20-filled" width="20" height="20" />
        </button>
      </div>

      {/* Center Playback/Zoom Controls */}
      <div className="flex items-center gap-6 flex-1 justify-center pl-10">
        {/* Zoom Controls */}
        <div className="flex items-center gap-3 w-40">
          <button onClick={handleZoomOut} className="hover:text-gray-200 transition-colors">
             <Icon icon="fluent:zoom-out-20-regular" width="18" height="18" />
          </button>
          
          {/* Custom Slider for Zoom */}
          <div className="relative w-full h-1 bg-white/30 rounded-full cursor-pointer group">
             <div 
                className="absolute left-0 top-0 h-full bg-[#4F8BE8] rounded-full" 
                style={{ width: `${zoomPercent}%` }}
             ></div>
             <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow cursor-pointer opacity-100"
                style={{ left: `${zoomPercent}%`, transform: `translate(-50%, -50%)` }}
             ></div>
             
             {/* Interaction Layer */}
             <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={zoom} 
                onChange={handleZoomSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
          </div>
          
          <button onClick={handleZoomIn} className="hover:text-gray-200 transition-colors">
             <Icon icon="fluent:zoom-in-20-regular" width="18" height="18" />
          </button>
        </div>
        
        {/* Playback Controls */}
        <div className="flex items-center gap-4">
            <button className="hover:bg-white/10 p-1 rounded transition-colors"><Icon icon="fluent:text-bullet-list-20-filled" width="18" height="18" /></button>
            <button onClick={onPlayToggle} className="hover:text-gray-200 transition-colors" title={isPlaying ? "Pause" : "Play"}>
                <Icon icon={isPlaying ? "fluent:pause-20-filled" : "fluent:play-20-filled"} width="20" height="20" />
            </button>
        </div>
        
        {/* Progress Timeline */}
        <div className="w-56 h-1.5 bg-white/30 rounded-full relative cursor-pointer">
           <div 
                className="absolute left-0 top-0 h-full bg-[#4F8BE8] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
           ></div>
           <div 
                className="absolute top-1/2 -translate-y-1/2 w-8 h-1 bg-white rounded-full shadow cursor-pointer transition-all duration-300 ease-out"
                style={{ left: `${progressPercent}%`, transform: `translate(-50%, -50%)` }}
           ></div>

           {/* Interaction Layer */}
           <input 
                type="range" 
                min="0" 
                max={Math.max(1, totalPages - 1)} 
                step="1" 
                value={currentPage} 
                onChange={handlePageSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="hover:bg-white/10 p-1.5 rounded transition-colors" title="Book Mode">
             <Icon icon="fluent:book-20-filled" width="20" height="20" />
        </button>
        <button className="hover:bg-white/10 p-1.5 rounded transition-colors" title="Bookmarks">
             <Icon icon="fluent:bookmark-20-filled" width="20" height="20" />
        </button>
        <button className="hover:bg-white/10 p-1.5 rounded transition-colors" title="Audio">
             <Icon icon="fluent:music-note-2-20-filled" width="20" height="20" />
        </button>
        <button className="hover:bg-white/10 p-1.5 rounded transition-colors" title="Download">
             <Icon icon="fluent:arrow-download-20-filled" width="20" height="20" />
        </button>
        <button className="hover:bg-white/10 p-1.5 rounded transition-colors" title="Share">
             <Icon icon="fluent:share-20-filled" width="20" height="20" />
        </button>
        <button className="hover:bg-white/10 p-1.5 rounded transition-colors" title="More">
             <Icon icon="fluent:more-horizontal-20-filled" width="20" height="20" />
        </button>
        
        <div className="w-px h-5 bg-white/30 mx-1"></div>
        
        <button onClick={onFullscreenToggle} className={`hover:bg-white/10 p-1.5 rounded transition-colors ${isFullscreen ? 'bg-white/20' : ''}`} title="Fullscreen">
             <Icon icon={isFullscreen ? "fluent:full-screen-minimize-24-filled" : "fluent:full-screen-maximize-20-filled"} width="20" height="20" />
        </button>
      </div>
    </div>
  );
};

export default BottomBar;
