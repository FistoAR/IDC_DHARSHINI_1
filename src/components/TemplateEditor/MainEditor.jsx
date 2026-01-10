// MainEditor.jsx - Updated Prop Passing for Double Page & Preview
import React, { useState, useCallback, useRef, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import TopToolbar from './TopToolbar';
import TemplateModal from './TemplateModal';
import HTMLTemplateEditor from './HTMLTemplateEditor';
import FlipbookPreview from './FlipbookPreview';
import RightSidebar from './RightSidebar';
import useZoom from '../../hooks/useZoom';
import useDeviceDetection from '../../hooks/useDeviceDetection';
import useThumbnail from '../../hooks/useThumbnail';
import useHistory from '../../hooks/useHistory';

const MainEditor = () => {
  // ==================== REFS ====================
  const editorContainerRef = useRef(null);
  const htmlEditorRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  
  // ==================== HOOKS ====================
  const deviceInfo = useDeviceDetection();
  const { zoom, zoomIn, zoomOut, setZoomLevel, fitToScreen } = useZoom(100, editorContainerRef);
  const { generateThumbnail, getThumbnail } = useThumbnail();
  const { canUndo, canRedo, undo, redo, saveToHistory } = useHistory();

  // ==================== STATE ====================
  const [showTemplateModal, setShowTemplateModal] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  
  // Template state
  const [templateHTML, setTemplateHTML] = useState('');
  const [pages, setPages] = useState([{ 
    id: 1, 
    name: 'Page 1', 
    html: '',
    thumbnail: null 
  }]);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Editor state
  const [pageName, setPageName] = useState("Untitled Document");
  const [isEditingPageName, setIsEditingPageName] = useState(false);
  const [isDoublePage, setIsDoublePage] = useState(false);
  
  // Panning State
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  // Element selection state
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedElementType, setSelectedElementType] = useState(null);

  // ==================== HISTORY TRACKING ====================
  useEffect(() => {
    saveToHistory({ pages, currentPage, pageName });
  }, [pages, currentPage, pageName, saveToHistory]);

  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      setPages(previousState.pages);
      setCurrentPage(previousState.currentPage);
      setPageName(previousState.pageName);
      setTemplateHTML(previousState.pages[previousState.currentPage]?.html || '');
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
        setPages(nextState.pages);
        setCurrentPage(nextState.currentPage);
        setPageName(nextState.pageName);
        setTemplateHTML(nextState.pages[nextState.currentPage]?.html || '');
    }
  }, [redo]);

  // ==================== PANNING LOGIC ====================
  useEffect(() => {
    const handleKeyDown = (e) => {
        const isInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
        if (e.code === 'Space' && !e.repeat && !isInput && !isEditingPageName) {
            e.preventDefault(); 
            setIsSpacePressed(true);
        }
    };
    const handleKeyUp = (e) => {
        if (e.code === 'Space') {
            setIsSpacePressed(false);
            setIsPanning(false);
            isDraggingRef.current = false;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isEditingPageName]);

  const handleMouseDown = (e) => {
    if (isSpacePressed) {
        setIsPanning(true);
        isDraggingRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        e.preventDefault(); 
    }
  };

  const handleMouseMove = (e) => {
    if (isDraggingRef.current && isPanning) {
        const dx = e.clientX - lastMousePosRef.current.x;
        const dy = e.clientY - lastMousePosRef.current.y;
        setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };


  // ==================== TEMPLATE LOADING ====================
  const loadHTMLTemplate = useCallback(async (templatePath) => {
    try {
      const response = await fetch(templatePath);
      const html = await response.text();
      setTemplateHTML(html);
      setPages(prev => {
        const updated = [...prev];
        updated[currentPage] = { ...updated[currentPage], html: html };
        return updated;
      });
      setTimeout(() => generateThumbnail(html, pages[currentPage].id), 500);
    } catch (error) {
      console.error('Failed to load:', error);
      alert('Failed to load template');
    }
  }, [currentPage, generateThumbnail, pages]);

  // ==================== PAGE MANAGEMENT ====================
  const switchToPage = useCallback((index) => {
    setPages(prev => {
        const updated = [...prev];
        if (updated[currentPage]) updated[currentPage] = { ...updated[currentPage], html: templateHTML };
        return updated;
    });
    setCurrentPage(index);
    setTemplateHTML(pages[index]?.html || '');
    setSelectedElement(null);
    setSelectedElementType(null);
    setPanOffset({ x: 0, y: 0 }); 
  }, [currentPage, templateHTML, pages]);

  const addNewPage = useCallback((index = null) => {
    const targetIndex = index !== null ? index + 1 : pages.length;
    const newPage = { id: Date.now(), name: `Page ${pages.length + 1}`, html: '', thumbnail: null };
    setPages(prev => {
        const newPages = [...prev];
        newPages.splice(targetIndex, 0, newPage);
        return newPages;
    });
    setCurrentPage(targetIndex);
    setTemplateHTML('');
  }, [pages.length]);

  const duplicatePage = useCallback((index) => {
    const sourceIndex = index !== null ? index : currentPage;
    const sourcePage = pages[sourceIndex];
    if (!sourcePage) return;
    const newPage = { id: Date.now(), name: `${sourcePage.name} (Copy)`, html: sourcePage.html, thumbnail: sourcePage.thumbnail };
    setPages(prev => {
        const newPages = [...prev];
        newPages.splice(sourceIndex + 1, 0, newPage);
        return newPages;
    });
    setCurrentPage(sourceIndex + 1);
    setTemplateHTML(sourcePage.html);
  }, [pages, currentPage]);

  const clearPage = useCallback((index) => {
      if (confirm('Clear this page content?')) {
           const blankHTML = '';
           setPages(prev => {
              const newPages = [...prev];
              newPages[index] = { ...newPages[index], html: blankHTML, thumbnail: null };
              return newPages;
           });
           if (index === currentPage) setTemplateHTML(blankHTML);
      }
  }, [currentPage]);

  const deletePage = useCallback((index) => {
    if (pages.length <= 1) { alert('Cannot delete the last page'); return; }
    if (confirm('Delete this page?')) {
      const targetIndex = index ?? currentPage;
      const newPages = pages.filter((_, i) => i !== targetIndex);
      setPages(newPages);
      if (targetIndex === currentPage) {
        const newIndex = Math.max(0, targetIndex - 1);
        setCurrentPage(newIndex);
        setTemplateHTML(newPages[newIndex]?.html || '');
      } else if (targetIndex < currentPage) {
        setCurrentPage(prev => prev - 1);
      }
    }
  }, [pages, currentPage]);

  // ==================== TEMPLATE EDITING ====================
  const handleTemplateChange = useCallback((newHTML) => {
    setTemplateHTML(newHTML);
    setPages(prev => {
      const updated = [...prev];
      updated[currentPage] = { ...updated[currentPage], html: newHTML };
      return updated;
    });
    generateThumbnail(newHTML, pages[currentPage].id, 2000);
  }, [currentPage, generateThumbnail, pages]);

  const handleElementSelect = useCallback((element, type) => {
    setSelectedElement(element);
    setSelectedElementType(type);
  }, []);

  const handleElementUpdate = useCallback(() => {
    if (selectedElement) {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        const doc = iframe.contentDocument;
        handleTemplateChange(doc.documentElement.outerHTML);
      }
    }
  }, [selectedElement, handleTemplateChange]);

  const openPreview = useCallback(() => {
    setPages(pages.map((page, idx) => idx === currentPage ? { ...page, html: templateHTML } : page));
    setShowPreview(true);
  }, [pages, currentPage, templateHTML]);

  const closePreview = useCallback(() => setShowPreview(false), []);

  const renamePage = useCallback((pageId, newName) => {
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, name: newName } : p));
  }, []);

  return (
    <div 
        className="flex bg-gray-50 font-sans text-gray-700 overflow-hidden" 
        style={{ height: 'calc(100vh - 8vh)', marginTop: '0' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
      <LeftSidebar
        pages={pages.map((page, idx) => ({ ...page, thumbnail: getThumbnail(page.id) }))}
        currentPage={currentPage}
        switchToPage={switchToPage}
        addNewPage={() => addNewPage(null)}
        insertPageAfter={addNewPage}
        deletePage={deletePage}
        duplicatePage={duplicatePage}
        clearPage={clearPage}
        renamePage={renamePage}
        onOpenTemplateModal={() => setShowTemplateModal(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 border-r border-gray-200">
        <TopToolbar
          pageName={pageName}
          isEditingPageName={isEditingPageName}
          setPageName={setPageName}
          setIsEditingPageName={setIsEditingPageName}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          zoom={zoom}
          handleZoom={setZoomLevel}
        />

        <div className="flex-1 flex overflow-hidden relative">
          <div 
            ref={editorContainerRef} 
            className={`flex-1 overflow-hidden relative bg-gray-100 flex items-center justify-center p-8 
                ${isSpacePressed ? 'cursor-grab' : ''} ${isPanning ? 'cursor-grabbing' : ''}`}
            onMouseDown={handleMouseDown}
            onClick={(e) => {
                // If clicking directly on the background area, deselect
                if (e.target === editorContainerRef.current) {
                    if (htmlEditorRef.current) {
                        htmlEditorRef.current.deselectAll();
                    }
                }
            }}
          >
            <div style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)`, transition: isPanning ? 'none' : 'transform 0.2s ease-out' }}>
                <HTMLTemplateEditor
                    ref={htmlEditorRef}
                    templateHTML={templateHTML}
                    onTemplateChange={handleTemplateChange}
                    pages={pages}
                    currentPage={currentPage}
                    onPageChange={switchToPage}
                    zoom={zoom}
                    onElementSelect={handleElementSelect}
                />
            </div>

            {/* Page Indicator (Fixed Corner) */}
            {pages && pages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-white/90 text-gray-600 border border-gray-200 text-xs font-medium px-3 py-1.5 rounded-md shadow-sm backdrop-blur-sm z-10 pointer-events-none select-none">
                    Page {currentPage + 1} / {pages.length}
                </div>
            )}
          </div>
        </div>
      </main>

      <RightSidebar
        selectedElement={selectedElement}
        selectedElementType={selectedElementType}
        onUpdate={handleElementUpdate}
        isDoublePage={isDoublePage}
        setIsDoublePage={setIsDoublePage}
        openPreview={openPreview}
      />

      {showTemplateModal && (
        <TemplateModal showTemplateModal={showTemplateModal} setShowTemplateModal={setShowTemplateModal} clearCanvas={() => clearPage(currentPage)} loadHTMLTemplate={loadHTMLTemplate} />
      )}

      {showPreview && (
        <FlipbookPreview pages={pages.map(p => p.html).filter(html => html)} pageName={pageName} onClose={closePreview} isMobile={deviceInfo.isMobile} />
      )}
    </div>
  );
};

export default MainEditor;