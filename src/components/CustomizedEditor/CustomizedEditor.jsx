import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Sidebar from './Sidebar';
import PreviewArea from './PreviewArea';
import BottomBar from './BottomBar';
import Branding from './Branding';

const CustomizedEditor = () => {
  const { setExportHandler, setSaveHandler } = useOutletContext() || {};

  const [bookData, setBookData] = React.useState({
    name: "Name of the Book",
    pageCount: 0,
    pages: []
  });

  // Editor State
  const [activePanel, setActivePanel] = React.useState('Logo');
  const [logoSettings, setLogoSettings] = React.useState({
    src: '', // The visual image (Base64/URL)
    url: '', // The destination link
    type: 'Fit'
  });

  const [profileSettings, setProfileSettings] = React.useState({
    name: '',
    about: '',
    email: '',
    phone: '',
    socials: []
  });

  const [zoom, setZoom] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Auto-play logic
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentPage(prev => {
          if (prev >= (bookData.pageCount - 1)) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000); // 2 seconds per page
    }
    return () => clearInterval(interval);
  }, [isPlaying, bookData.pageCount]);

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(0, Math.min(page, bookData.pageCount - 1)));
  };

  useEffect(() => {
    // Attempt to load current book data from editor storage
    try {
      const savedData = localStorage.getItem('editor_autosave');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setBookData({
          name: parsed.pageName || "Untitled Book",
          pageCount: parsed.pages ? parsed.pages.length : 0,
          pages: parsed.pages || []
        });
      }
    } catch (e) {
      console.error("Failed to load book data", e);
    }
  }, []);

  useEffect(() => {
    // Register temporary handlers for the Navbar buttons
    if (setExportHandler) {
      setExportHandler(() => () => console.log("Export Customized Editor"));
    }
    if (setSaveHandler) {
      setSaveHandler(() => () => console.log("Save Customized Editor"));
    }
    
    // Cleanup handlers on unmount
    return () => {
      if (setExportHandler) setExportHandler(null);
      if (setSaveHandler) setSaveHandler(null);
    };
  }, [setExportHandler, setSaveHandler]);

  return (
    <div className="flex h-full w-full bg-[#EAEAF4]">
      <Sidebar 
        bookName={bookData.name} 
        pageCount={bookData.pageCount} 
        activePanel={activePanel}
        onSelectPanel={setActivePanel}
        onUpdateBookName={(newName) => setBookData(prev => ({ ...prev, name: newName }))}
      />

      {(activePanel === 'Logo' || activePanel === 'Profile') && (
        <Branding 
            activeTab={activePanel}
            logoSettings={logoSettings} 
            profileSettings={profileSettings}
            onUpdateLogo={setLogoSettings} 
            onUpdateProfile={setProfileSettings}
            onClose={() => setActivePanel(null)} 
        />
      )}

      {/* Main Content - Flex grow */}
      <div className={`flex-1 flex flex-col relative h-full min-w-0 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#DADBE8]' : ''}`}> 
        
        {/* Preview Area - Takes available space */}
        <PreviewArea 
            bookName={bookData.name} 
            pages={bookData.pages} 
            logoSettings={logoSettings}
            zoom={zoom}
            targetPage={currentPage}
            onPageChange={setCurrentPage}
        />

        {/* Bottom Control Bar - Fixed height */}
        <BottomBar 
            currentPage={currentPage}
            totalPages={bookData.pageCount}
            onPageChange={handlePageChange}
            zoom={zoom}
            onZoomChange={setZoom}
            isPlaying={isPlaying}
            onPlayToggle={() => setIsPlaying(!isPlaying)}
            isFullscreen={isFullscreen}
            onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
        />
      </div>
    </div>
  );
};

export default CustomizedEditor;
