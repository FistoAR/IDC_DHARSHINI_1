// HTMLTemplateEditor.jsx - Enhanced HTML Template editing with zoom and element selection
import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Type, Image as ImageIcon } from 'lucide-react';

const HTMLTemplateEditor = forwardRef(({
  templateHTML,
  onTemplateChange,
  pages,
  currentPage,
  onPageChange,
  zoom = 100,
  onElementSelect
}, ref) => {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedElement, setSelectedElement] = useState(null);

  // Initialize iframe with template content
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      
      // CRITICAL FIX: Validate if content actually changed to prevent re-renders that kill selection/focus
      if (doc.documentElement && doc.documentElement.outerHTML === templateHTML) {
        return;
      }

      // Write the full HTML template with styles
      doc.open();
      doc.write(templateHTML);
      doc.close();

      // Add editing capabilities
      setTimeout(() => {
        setupEditableElements(doc);
      }, 100);
    }
  }, [templateHTML, currentPage]);

  // Deselect all elements
  const deselectAll = useCallback(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
    
    // Clear outlines
    const images = doc.querySelectorAll('img');
    images.forEach(i => i.style.outline = 'none');
    
    const textElements = doc.querySelectorAll('[data-editable="true"]');
    textElements.forEach(el => el.style.outline = 'none');

    setSelectedElement(null);
    if (onElementSelect) {
      onElementSelect(null, null);
    }
  }, [onElementSelect]);

  // Setup editable elements in the iframe
  const setupEditableElements = (doc) => {
    if (!doc.body) return;

    // Remove previous event listeners by recreating elements
    const allEditableElements = doc.querySelectorAll('[data-editable="true"]');
    allEditableElements.forEach(el => {
      el.removeAttribute('data-editable');
    });

    // Make text elements editable
    const textElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, li, td, th, label, div');
    textElements.forEach(el => {
      // Skip if it's a container element with children
      if (el.children.length > 0 && el.tagName === 'DIV') return;
      
      el.style.cursor = 'text';
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('data-editable', 'true');
      el.style.outline = 'none';
      
      el.addEventListener('focus', (e) => {
        // Remove selection from other elements
        textElements.forEach(other => {
          if (other !== el) {
            other.style.outline = 'none';
          }
        });
        
        el.style.outline = '2px solid #6366f1';
        el.style.outlineOffset = '2px';
        setSelectedElement(el);
        if (onElementSelect) {
          onElementSelect(el, 'text');
        }
      });
      
      // Don't remove selection on blur - only when clicking outside
      el.addEventListener('blur', () => {
        // Don't remove outline - keep it selected
        saveToHistory();
      });

      el.addEventListener('input', () => {
        if (onTemplateChange) {
          const html = doc.documentElement.outerHTML;
          onTemplateChange(html);
        }
      });
    });

    // Make images clickable for replacement
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      img.style.cursor = 'pointer';
      img.setAttribute('data-editable', 'true');
      
      const handleImageClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Remove previous selections
        images.forEach(i => {
          i.style.outline = 'none';
        });
        textElements.forEach(t => {
          t.style.outline = 'none';
        });
        
        img.style.outline = '2px dashed #6366f1';
        img.style.outlineOffset = '2px';
        
        setSelectedElement(img);
        if (onElementSelect) {
          onElementSelect(img, 'image');
        }
      };
      
      img.addEventListener('click', handleImageClick);
      
      img.addEventListener('mouseenter', () => {
        if (selectedElement !== img) {
          img.style.outline = '2px dashed rgba(99, 102, 241, 0.3)';
          img.style.outlineOffset = '2px';
        }
      });
      
      img.addEventListener('mouseleave', () => {
        if (selectedElement !== img) {
          img.style.outline = 'none';
        }
      });
    });

    // Click outside to deselect - but ONLY outside the base area
    // Click outside to deselect - but ONLY outside the base area
    doc.addEventListener('click', (e) => {
      const isEditableElement = e.target.closest('[data-editable="true"]');
      
      // If clicking on an editable element, do nothing (handled by its own listener)
      if (isEditableElement) return;

      // If clicking elsewhere in the document (empty space), deselect
      deselectAll();
    });

    // Add custom styles to iframe
    const style = doc.createElement('style');
    style.textContent = `
      *:focus {
        outline: 2px solid #6366f1 !important;
        outline-offset: 2px !important;
      }
      img:hover {
        opacity: 0.95;
      }
      [contenteditable]:hover {
        background-color: rgba(99, 102, 241, 0.05);
      }
      [contenteditable]:focus {
        background-color: rgba(99, 102, 241, 0.08);
      }
    `;
    
    // Remove existing custom styles
    const existingStyle = doc.getElementById('editor-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    style.id = 'editor-styles';
    doc.head.appendChild(style);
  };

  // Save current state to history
  const saveToHistory = useCallback(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    const html = doc.documentElement.outerHTML;
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(html);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
    
    if (onTemplateChange) {
      onTemplateChange(html);
    }
  }, [historyIndex, onTemplateChange]);

  // Calculate scaled dimensions
  const scale = zoom / 100;
  const scaledWidth = 595 * scale;
  const scaledHeight = 842 * scale;

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    deselectAll
  }));

  return (
    <div 
        ref={containerRef} 
        className="h-full flex flex-col bg-gray-100"
        onClick={(e) => {
            // Check if click is directly on the container or the flex wrapper (gray area)
            // ensuring we don't catch clicks that bubbled from the iframe (though iframe clicks don't bubble this way usually)
            if (e.target === containerRef.current || e.target.closest('.flex-1')) {
                deselectAll();
            }
        }}
    >
      {/* Template Preview Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8">
        <div 
          className="bg-white shadow-2xl"
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            flexShrink: 0,
            transition: 'transform 0.2s ease'
          }}
        >
          <iframe
            ref={iframeRef}
            title="Template Editor"
            style={{
              width: '595px',
              height: '842px',
              border: 'none',
              display: 'block',
              transform: `scale(${scale})`,
              transformOrigin: 'top left'
            }}
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>


    </div>
  );
});

export default HTMLTemplateEditor;
