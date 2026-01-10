// // TemplateEditor.jsx - Part 1 of 3
// import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
// import { fabric } from 'fabric';
// import { SVG } from '@svgdotjs/svg.js';
// import opentype from 'opentype.js';
// import { 
//   ChevronDown, 
//   ChevronRight, 
//   Type, 
//   AlignLeft, 
//   AlignCenter, 
//   AlignRight, 
//   AlignJustify, 
//   Bold, 
//   Italic, 
//   Underline, 
//   Strikethrough,
//   Plus,
//   Copy,
//   Trash2,
//   X,
//   Search,
//   Filter,
//   Eye,
//   RotateCw,
//   Maximize,
//   ZoomIn,
//   ZoomOut,
//   Minus,
//   Square,
//   Circle,
//   Triangle,
//   Image as ImageIcon,
//   Download,
//   Undo,
//   Redo,
//   MousePointer2,
//   Link,
//   ChevronUp,
//   ExternalLink,
//   Grid,
//   Magnet,
//   Move,
//   Layers,
//   RefreshCw
// } from 'lucide-react';
// import Business from "../assets/Templates/template_7.svg";
// import Business1 from "../assets/Templates/template_6.svg";
// import Business2 from "../assets/Templates/template_15.svg";

// // ==================== A4 DIMENSIONS & CONSTANTS ====================
// const A4_WIDTH_MM = 210;
// const A4_HEIGHT_MM = 297;
// const MM_TO_PX = 3.7795275591; // 1mm = 3.7795275591px at 96 DPI
// const A4_WIDTH_PX = Math.round(A4_WIDTH_MM * MM_TO_PX); // 794px
// const A4_HEIGHT_PX = Math.round(A4_HEIGHT_MM * MM_TO_PX); // 1123px

// // Canvas dimensions (optimized for performance while maintaining A4 ratio)
// const CANVAS_WIDTH = 595;
// const CANVAS_HEIGHT = 842;
// const A4_RATIO = A4_WIDTH_MM / A4_HEIGHT_MM;

// // Snapping threshold
// const SNAP_THRESHOLD = 10;
// const DEFAULT_GRID_SIZE = 20;

// // ==================== FONT CACHE FOR OPENTYPE ====================
// const fontCache = new Map();

// // Standard web-safe fonts with fallback paths
// const FONT_PATHS = {
//   'Arial': 'https://fonts.cdnfonts.com/s/29107/ARIAL.woff',
//   'Times New Roman': 'https://fonts.cdnfonts.com/s/56213/times.woff',
//   'Georgia': 'https://fonts.cdnfonts.com/s/14903/Georgia.woff',
//   'Verdana': 'https://fonts.cdnfonts.com/s/19107/Verdana.woff',
//   'Helvetica': 'https://fonts.cdnfonts.com/s/29136/Helvetica.woff',
//   'Courier New': 'https://fonts.cdnfonts.com/s/25426/CourierPrime-Regular.woff',
// };

// // ==================== FONT FAMILIES & WEIGHTS ====================
// const fontFamilies = [
//   'Arial', 
//   'Times New Roman', 
//   'Courier New', 
//   'Georgia', 
//   'Verdana', 
//   'Helvetica',
//   'Impact',
//   'Comic Sans MS',
//   'Trebuchet MS',
//   'Arial Black',
//   'Franklin Gothic Demi',
//   'Roboto',
//   'Open Sans',
//   'Lato',
//   'Montserrat',
// ];

// const fontWeights = [
//   { label: 'Thin', value: 100 },
//   { label: 'Light', value: 300 },
//   { label: 'Regular', value: 400 },
//   { label: 'Medium', value: 500 },
//   { label: 'Semi Bold', value: 600 },
//   { label: 'Bold', value: 700 },
//   { label: 'Extra Bold', value: 800 },
// ];

// const mockTemplates = [
//   { id: 1, name: 'Business Card', category: 'Product', src: Business },
//   { id: 2, name: 'Business Card', category: 'Product', src: Business1 },
//   { id: 3, name: 'Business Card', category: 'Product', src: Business2},
// ];

// const categories = [
//   'All', 
//   'Product', 
//   'Timeline', 
//   'Image', 
//   'Mission & Vision', 
//   'Tables', 
//   'Product Comparison', 
// ];

// // ==================== UTILITY FUNCTIONS ====================

// /**
//  * Load font using opentype.js with caching
//  */
// const loadFont = async (fontFamily) => {
//   if (fontCache.has(fontFamily)) {
//     return fontCache.get(fontFamily);
//   }

//   const fontPath = FONT_PATHS[fontFamily];
//   if (!fontPath) {
//     console.warn(`Font path not found for: ${fontFamily}`);
//     return null;
//   }

//   try {
//     const font = await opentype.load(fontPath);
//     fontCache.set(fontFamily, font);
//     return font;
//   } catch (error) {
//     console.error(`Failed to load font: ${fontFamily}`, error);
//     return null;
//   }
// };

// /**
//  * Parse SVG string to DOM element
//  */
// const parseSVGString = (svgString) => {
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(svgString, 'image/svg+xml');
//   const errorNode = doc.querySelector('parsererror');
//   if (errorNode) {
//     throw new Error('Invalid SVG');
//   }
//   return doc.documentElement;
// };

// /**
//  * Get computed text metrics using opentype.js
//  */
// const getTextMetrics = async (text, fontFamily, fontSize, fontWeight) => {
//   const font = await loadFont(fontFamily);
//   if (!font) {
//     // Fallback to approximate metrics
//     return {
//       width: text.length * fontSize * 0.6,
//       height: fontSize * 1.2,
//       ascender: fontSize * 0.8,
//       descender: fontSize * 0.2,
//     };
//   }

//   const path = font.getPath(text, 0, 0, fontSize);
//   const bbox = path.getBoundingBox();
  
//   return {
//     width: bbox.x2 - bbox.x1,
//     height: bbox.y2 - bbox.y1,
//     ascender: font.ascender / font.unitsPerEm * fontSize,
//     descender: Math.abs(font.descender / font.unitsPerEm * fontSize),
//   };
// };

// /**
//  * Convert color to hex format
//  */
// const colorToHex = (color) => {
//   if (!color || color === 'none' || color === 'transparent') return '';
//   if (color.startsWith('#')) return color;
//   if (color.startsWith('rgb')) {
//     const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
//     if (match) {
//       const r = parseInt(match[1]).toString(16).padStart(2, '0');
//       const g = parseInt(match[2]).toString(16).padStart(2, '0');
//       const b = parseInt(match[3]).toString(16).padStart(2, '0');
//       return `#${r}${g}${b}`;
//     }
//   }
//   return color;
// };

// /**
//  * Deep clone object
//  */
// const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// /**
//  * Debounce function
//  */
// const debounce = (func, wait) => {
//   let timeout;
//   return (...args) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func.apply(this, args), wait);
//   };
// };

// /**
//  * Calculate optimal zoom to fit canvas in container
//  */
// const calculateOptimalZoom = (containerWidth, containerHeight, canvasWidth, canvasHeight, padding = 80) => {
//   const availableWidth = containerWidth - padding;
//   const availableHeight = containerHeight - padding;
  
//   const scaleX = availableWidth / canvasWidth;
//   const scaleY = availableHeight / canvasHeight;
  
//   return Math.min(scaleX, scaleY, 1.5) * 100;
// };

// // ==================== MAIN COMPONENT ====================
// const TemplateEditor = () => {
//   // ==================== REFS ====================
//   const canvasRef = useRef(null);
//   const fabricCanvasRef = useRef(null);
//   const canvasContainerRef = useRef(null);
//   const wrapperRef = useRef(null);
//   const historyRef = useRef({ 
//     undoStack: [], 
//     redoStack: [], 
//     isPerforming: false 
//   });
//   const guidelinesRef = useRef([]);
//   const svgParserRef = useRef(null);
//   const resizeObserverRef = useRef(null);
//   const saveTimeoutRef = useRef(null);

//   // ==================== UI STATES ====================
//   const [showTemplateModal, setShowTemplateModal] = useState(true);
//   const [activeTab, setActiveTab] = useState('All');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [rightSidebarOpen, setRightSidebarOpen] = useState({
//     dimension: true,
//     text: true,
//     typography: true,
//     color: true,
//     interaction: false,
//     animation: false,
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [loadingMessage, setLoadingMessage] = useState('');

//   // ==================== EDITOR STATES ====================
//   const [activeObject, setActiveObject] = useState(null);
//   const [pages, setPages] = useState([{ 
//     id: 1, 
//     name: 'Page 1', 
//     canvasJSON: null, 
//     thumbnail: null,
//     svgData: null 
//   }]);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [zoom, setZoom] = useState(100);
//   const [autoZoom, setAutoZoom] = useState(true);
//   const [isDoublePage, setIsDoublePage] = useState(false);
//   const [pageName, setPageName] = useState("Untitled Document");
//   const [isEditingPageName, setIsEditingPageName] = useState(false);
//   const [rotation, setRotation] = useState(0);
//   const [canUndo, setCanUndo] = useState(false);
//   const [canRedo, setCanRedo] = useState(false);
//   const [showGrid, setShowGrid] = useState(false);
//   const [snapToGrid, setSnapToGrid] = useState(true);
//   const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
//   const [snapToObjects, setSnapToObjects] = useState(true);

//   // ==================== OBJECT PROPERTIES STATE ====================
//   const [properties, setProperties] = useState({
//     text: '',
//     fontFamily: 'Arial',
//     fontSize: 24,
//     fontWeight: 400,
//     fontStyle: 'normal',
//     underline: false,
//     linethrough: false,
//     textAlign: 'left',
//     fill: '#000000',
//     fillOpacity: 100,
//     stroke: '',
//     strokeWidth: 0,
//     strokeOpacity: 100,
//     strokeDashArray: false,
//     charSpacing: 0,
//     lineHeight: 1.2,
//     angle: 0,
//     scaleX: 1,
//     scaleY: 1,
//     left: 0,
//     top: 0,
//     width: 0,
//     height: 0,
//     skewX: 0,
//     skewY: 0,
//     flipX: false,
//     flipY: false,
//   });

//   // ==================== MEMOIZED VALUES ====================
//   const filteredTemplates = useMemo(() => {
//     return mockTemplates.filter(t => 
//       (activeTab === 'All' || t.category === activeTab) &&
//       t.name.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [activeTab, searchQuery]);

//   const isTextObject = useMemo(() => {
//     return activeObject && 
//       (activeObject.type === 'i-text' || 
//        activeObject.type === 'text' || 
//        activeObject.type === 'textbox');
//   }, [activeObject]);

//   // ==================== CALCULATE AUTO ZOOM ====================
//   const calculateAutoZoom = useCallback(() => {
//     if (!wrapperRef.current) return 100;
    
//     const container = wrapperRef.current;
//     const containerWidth = container.clientWidth;
//     const containerHeight = container.clientHeight;
    
//     const optimalZoom = calculateOptimalZoom(
//       containerWidth, 
//       containerHeight, 
//       CANVAS_WIDTH, 
//       CANVAS_HEIGHT,
//       120 // padding for toolbar and margins
//     );
    
//     return Math.max(25, Math.min(150, Math.round(optimalZoom)));
//   }, []);

//   // ==================== ZOOM HANDLER ====================
//   const handleZoom = useCallback((newZoom, centerPoint = null) => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     const zoomValue = Math.max(25, Math.min(200, newZoom));
//     const scale = zoomValue / 100;
    
//     if (centerPoint) {
//       // Zoom to specific point
//       canvas.zoomToPoint(centerPoint, scale);
//     } else {
//       canvas.setZoom(scale);
//     }
    
//     canvas.setWidth(CANVAS_WIDTH * scale);
//     canvas.setHeight(CANVAS_HEIGHT * scale);
//     canvas.renderAll();
    
//     setZoom(zoomValue);
//     if (newZoom !== calculateAutoZoom()) {
//       setAutoZoom(false);
//     }
//   }, [calculateAutoZoom]);

//   // ==================== FIT TO SCREEN ====================
//   const fitToScreen = useCallback(() => {
//     const newZoom = calculateAutoZoom();
//     setZoom(newZoom);
//     setAutoZoom(true);
//     handleZoom(newZoom);
//   }, [calculateAutoZoom, handleZoom]);

//   // ==================== RESET PROPERTIES ====================
//   const resetProperties = useCallback(() => {
//     setProperties({
//       text: '',
//       fontFamily: 'Arial',
//       fontSize: 24,
//       fontWeight: 400,
//       fontStyle: 'normal',
//       underline: false,
//       linethrough: false,
//       textAlign: 'left',
//       fill: '#000000',
//       fillOpacity: 100,
//       stroke: '',
//       strokeWidth: 0,
//       strokeOpacity: 100,
//       strokeDashArray: false,
//       charSpacing: 0,
//       lineHeight: 1.2,
//       angle: 0,
//       scaleX: 1,
//       scaleY: 1,
//       left: 0,
//       top: 0,
//       width: 0,
//       height: 0,
//       skewX: 0,
//       skewY: 0,
//       flipX: false,
//       flipY: false,
//     });
//   }, []);

//   // ==================== UPDATE PROPERTIES FROM OBJECT ====================
//   const updatePropertiesFromObject = useCallback((obj) => {
//     if (!obj) {
//       const canvas = fabricCanvasRef.current;
//       obj = canvas?.getActiveObject();
//     }
//     if (!obj || obj.isGrid || obj.excludeFromExport) return;

//     const boundingRect = obj.getBoundingRect(true);
    
//     setProperties({
//       text: obj.text || '',
//       fontFamily: obj.fontFamily || 'Arial',
//       fontSize: Math.round(obj.fontSize || 24),
//       fontWeight: obj.fontWeight || 400,
//       fontStyle: obj.fontStyle || 'normal',
//       underline: obj.underline || false,
//       linethrough: obj.linethrough || false,
//       textAlign: obj.textAlign || 'left',
//       fill: colorToHex(typeof obj.fill === 'string' ? obj.fill : '#000000'),
//       fillOpacity: Math.round((obj.opacity || 1) * 100),
//       stroke: colorToHex(obj.stroke || ''),
//       strokeWidth: obj.strokeWidth || 0,
//       strokeOpacity: 100,
//       strokeDashArray: Array.isArray(obj.strokeDashArray) && obj.strokeDashArray.length > 0,
//       charSpacing: obj.charSpacing || 0,
//       lineHeight: obj.lineHeight || 1.2,
//       angle: Math.round(obj.angle || 0),
//       scaleX: Number((obj.scaleX || 1).toFixed(3)),
//       scaleY: Number((obj.scaleY || 1).toFixed(3)),
//       left: Math.round(obj.left || 0),
//       top: Math.round(obj.top || 0),
//       width: Math.round(boundingRect.width),
//       height: Math.round(boundingRect.height),
//       skewX: obj.skewX || 0,
//       skewY: obj.skewY || 0,
//       flipX: obj.flipX || false,
//       flipY: obj.flipY || false,
//     });
//   }, []);

//   // ==================== DRAW GRID ====================
//   const drawGrid = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     // Remove existing grid lines
//     const existingGrid = canvas.getObjects().filter(obj => obj.isGrid);
//     existingGrid.forEach(obj => canvas.remove(obj));

//     if (!showGrid) {
//       canvas.renderAll();
//       return;
//     }

//     const gridColor = '#e5e7eb';
//     const majorGridColor = '#cbd5e1';
//     const majorGridInterval = gridSize * 5;

//     // Draw vertical lines
//     for (let i = gridSize; i < CANVAS_WIDTH; i += gridSize) {
//       const isMajor = i % majorGridInterval === 0;
//       const line = new fabric.Line([i, 0, i, CANVAS_HEIGHT], {
//         stroke: isMajor ? majorGridColor : gridColor,
//         strokeWidth: isMajor ? 0.8 : 0.5,
//         selectable: false,
//         evented: false,
//         isGrid: true,
//         excludeFromExport: true,
//         hoverCursor: 'default',
//       });
//       canvas.add(line);
//       canvas.sendToBack(line);
//     }

//     // Draw horizontal lines
//     for (let i = gridSize; i < CANVAS_HEIGHT; i += gridSize) {
//       const isMajor = i % majorGridInterval === 0;
//       const line = new fabric.Line([0, i, CANVAS_WIDTH, i], {
//         stroke: isMajor ? majorGridColor : gridColor,
//         strokeWidth: isMajor ? 0.8 : 0.5,
//         selectable: false,
//         evented: false,
//         isGrid: true,
//         excludeFromExport: true,
//         hoverCursor: 'default',
//       });
//       canvas.add(line);
//       canvas.sendToBack(line);
//     }

//     canvas.renderAll();
//   }, [showGrid, gridSize]);

//   // ==================== CLEAR GUIDELINES ====================
//   const clearGuidelines = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     guidelinesRef.current.forEach(line => {
//       canvas.remove(line);
//     });
//     guidelinesRef.current = [];
//   }, []);

//   // ==================== CREATE GUIDELINE ====================
//   const createGuideline = useCallback((points, orientation) => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return null;

//     const line = new fabric.Line(points, {
//       stroke: '#6366f1',
//       strokeWidth: 1,
//       strokeDashArray: [5, 5],
//       selectable: false,
//       evented: false,
//       excludeFromExport: true,
//       isGuideline: true,
//     });

//     guidelinesRef.current.push(line);
//     canvas.add(line);
//     canvas.bringToFront(line);
    
//     return line;
//   }, []);

//   // ==================== SNAP VALUE TO GRID ====================
//   const snapToGridValue = useCallback((value) => {
//     if (!snapToGrid) return value;
//     return Math.round(value / gridSize) * gridSize;
//   }, [snapToGrid, gridSize]);

//   // ==================== CANVAS INITIALIZATION ====================
//   useEffect(() => {
//     if (!canvasRef.current || fabricCanvasRef.current) return;

//     // Initialize Fabric canvas
//     const canvas = new fabric.Canvas(canvasRef.current, {
//       width: CANVAS_WIDTH,
//       height: CANVAS_HEIGHT,
//       backgroundColor: '#ffffff',
//       preserveObjectStacking: true,
//       selection: true,
//       renderOnAddRemove: true,
//       centeredScaling: false,
//       centeredRotation: true,
//       enableRetinaScaling: true,
//       imageSmoothingEnabled: true,
//       stopContextMenu: true,
//       fireRightClick: true,
//     });

//     // ==================== CUSTOM SELECTION STYLE ====================
//     fabric.Object.prototype.set({
//       transparentCorners: false,
//       cornerColor: '#ffffff',
//       cornerStrokeColor: '#6366f1',
//       borderColor: '#6366f1',
//       cornerSize: 10,
//       padding: 6,
//       cornerStyle: 'circle',
//       borderDashArray: [4, 4],
//       rotatingPointOffset: 25,
//       borderScaleFactor: 1.5,
//     });

//     // Custom rotation control
//     fabric.Object.prototype.controls.mtr = new fabric.Control({
//       x: 0,
//       y: -0.5,
//       offsetY: -25,
//       cursorStyle: 'crosshair',
//       actionHandler: fabric.controlsUtils.rotationWithSnapping,
//       actionName: 'rotate',
//       render: (ctx, left, top, styleOverride, fabricObject) => {
//         const size = 20;
//         ctx.save();
//         ctx.translate(left, top);
        
//         // Outer circle
//         ctx.beginPath();
//         ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
//         ctx.fillStyle = '#6366f1';
//         ctx.fill();
        
//         // Inner circle
//         ctx.beginPath();
//         ctx.arc(0, 0, size / 2 - 3, 0, 2 * Math.PI);
//         ctx.strokeStyle = '#ffffff';
//         ctx.lineWidth = 2;
//         ctx.stroke();
        
//         // Rotation arrow icon
//         ctx.beginPath();
//         ctx.strokeStyle = '#ffffff';
//         ctx.lineWidth = 1.5;
//         ctx.arc(0, 0, 4, 0, 1.5 * Math.PI);
//         ctx.stroke();
        
//         // Arrow head
//         ctx.beginPath();
//         ctx.moveTo(-2, -4);
//         ctx.lineTo(0, -7);
//         ctx.lineTo(2, -4);
//         ctx.stroke();
        
//         ctx.restore();
//       },
//       cornerSize: 20,
//     });

//     // ==================== EVENT HANDLERS ====================
//     const handleSelection = (e) => {
//       const obj = e.selected?.[0];
//       if (obj && !obj.isGrid && !obj.excludeFromExport) {
//         setActiveObject(obj);
//         updatePropertiesFromObject(obj);
//       }
//     };

//     const handleSelectionCleared = () => {
//       setActiveObject(null);
//       resetProperties();
//       clearGuidelines();
//     };

//     const handleObjectModified = (e) => {
//       const obj = e.target;
//       if (obj && !obj.isGrid) {
//         updatePropertiesFromObject(obj);
//         // Defer history save to avoid performance issues
//         if (saveTimeoutRef.current) {
//           clearTimeout(saveTimeoutRef.current);
//         }
//         saveTimeoutRef.current = setTimeout(() => {
//           saveToHistory();
//         }, 100);
//       }
//     };

//     const handleObjectMoving = (e) => {
//       const obj = e.target;
//       if (!obj || obj.isGrid) return;

//       clearGuidelines();

//       const objBound = obj.getBoundingRect(true);
//       const objCenter = {
//         x: objBound.left + objBound.width / 2,
//         y: objBound.top + objBound.height / 2
//       };

//       // Canvas center
//       const canvasCenterX = CANVAS_WIDTH / 2;
//       const canvasCenterY = CANVAS_HEIGHT / 2;

//       let snappedX = false;
//       let snappedY = false;

//       // Snap to canvas center X
//       if (Math.abs(objCenter.x - canvasCenterX) < SNAP_THRESHOLD) {
//         obj.set('left', canvasCenterX - (objBound.width / 2) + (obj.left - objBound.left));
//         createGuideline([canvasCenterX, 0, canvasCenterX, CANVAS_HEIGHT], 'vertical');
//         snappedX = true;
//       }

//       // Snap to canvas center Y
//       if (Math.abs(objCenter.y - canvasCenterY) < SNAP_THRESHOLD) {
//         obj.set('top', canvasCenterY - (objBound.height / 2) + (obj.top - objBound.top));
//         createGuideline([0, canvasCenterY, CANVAS_WIDTH, canvasCenterY], 'horizontal');
//         snappedY = true;
//       }

//       // Snap to canvas edges
//       if (!snappedX) {
//         if (Math.abs(objBound.left) < SNAP_THRESHOLD) {
//           obj.set('left', obj.left - objBound.left);
//           createGuideline([0, 0, 0, CANVAS_HEIGHT], 'vertical');
//         } else if (Math.abs(objBound.left + objBound.width - CANVAS_WIDTH) < SNAP_THRESHOLD) {
//           obj.set('left', CANVAS_WIDTH - objBound.width + (obj.left - objBound.left));
//           createGuideline([CANVAS_WIDTH, 0, CANVAS_WIDTH, CANVAS_HEIGHT], 'vertical');
//         }
//       }

//       if (!snappedY) {
//         if (Math.abs(objBound.top) < SNAP_THRESHOLD) {
//           obj.set('top', obj.top - objBound.top);
//           createGuideline([0, 0, CANVAS_WIDTH, 0], 'horizontal');
//         } else if (Math.abs(objBound.top + objBound.height - CANVAS_HEIGHT) < SNAP_THRESHOLD) {
//           obj.set('top', CANVAS_HEIGHT - objBound.height + (obj.top - objBound.top));
//           createGuideline([0, CANVAS_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT], 'horizontal');
//         }
//       }

//       // Snap to other objects
//       if (snapToObjects) {
//         canvas.getObjects().forEach(other => {
//           if (other === obj || other.isGrid || other.excludeFromExport || other.isGuideline) return;

//           const otherBound = other.getBoundingRect(true);
//           const otherCenter = {
//             x: otherBound.left + otherBound.width / 2,
//             y: otherBound.top + otherBound.height / 2
//           };

//           // Align centers
//           if (Math.abs(objCenter.x - otherCenter.x) < SNAP_THRESHOLD) {
//             obj.set('left', otherCenter.x - (objBound.width / 2) + (obj.left - objBound.left));
//             createGuideline([otherCenter.x, 0, otherCenter.x, CANVAS_HEIGHT], 'vertical');
//           }
//           if (Math.abs(objCenter.y - otherCenter.y) < SNAP_THRESHOLD) {
//             obj.set('top', otherCenter.y - (objBound.height / 2) + (obj.top - objBound.top));
//             createGuideline([0, otherCenter.y, CANVAS_WIDTH, otherCenter.y], 'horizontal');
//           }

//           // Align edges
//           if (Math.abs(objBound.left - otherBound.left) < SNAP_THRESHOLD) {
//             obj.set('left', otherBound.left + (obj.left - objBound.left));
//             createGuideline([otherBound.left, 0, otherBound.left, CANVAS_HEIGHT], 'vertical');
//           }
//           if (Math.abs(objBound.left - (otherBound.left + otherBound.width)) < SNAP_THRESHOLD) {
//             obj.set('left', otherBound.left + otherBound.width + (obj.left - objBound.left));
//             createGuideline([otherBound.left + otherBound.width, 0, otherBound.left + otherBound.width, CANVAS_HEIGHT], 'vertical');
//           }
//         });
//       }

//       // Grid snapping
//       if (snapToGrid) {
//         obj.set({
//           left: snapToGridValue(obj.left),
//           top: snapToGridValue(obj.top),
//         });
//       }

//       obj.setCoords();

//       // Update position display
//       setProperties(prev => ({
//         ...prev,
//         left: Math.round(obj.left || 0),
//         top: Math.round(obj.top || 0),
//       }));
//     };

//     const handleObjectScaling = (e) => {
//       const obj = e.target;
//       if (obj) {
//         updatePropertiesFromObject(obj);
//       }
//     };

//     const handleObjectRotating = (e) => {
//       const obj = e.target;
//       if (obj) {
//         // Snap to 45-degree increments when shift is held
//         if (e.e?.shiftKey) {
//           const angle = Math.round(obj.angle / 45) * 45;
//           obj.set('angle', angle);
//         }
//         setProperties(prev => ({
//           ...prev,
//           angle: Math.round(obj.angle || 0),
//         }));
//       }
//     };

//     const handleTextChanged = (e) => {
//       const obj = e.target;
//       if (obj) {
//         setProperties(prev => ({ ...prev, text: obj.text || '' }));
//       }
//     };

//     const handleMouseUp = () => {
//       clearGuidelines();
//     };

//     const handleMouseWheel = (opt) => {
//       const e = opt.e;
//       if (e.ctrlKey || e.metaKey) {
//         e.preventDefault();
//         e.stopPropagation();
        
//         const delta = e.deltaY > 0 ? -5 : 5;
//         const newZoom = Math.max(25, Math.min(200, zoom + delta));
        
//         const point = new fabric.Point(e.offsetX, e.offsetY);
//         handleZoom(newZoom, point);
//       }
//     };

//     // Register event listeners
//     canvas.on('selection:created', handleSelection);
//     canvas.on('selection:updated', handleSelection);
//     canvas.on('selection:cleared', handleSelectionCleared);
//     canvas.on('object:modified', handleObjectModified);
//     canvas.on('object:moving', handleObjectMoving);
//     canvas.on('object:scaling', handleObjectScaling);
//     canvas.on('object:rotating', handleObjectRotating);
//     canvas.on('text:changed', handleTextChanged);
//     canvas.on('mouse:up', handleMouseUp);
//     canvas.on('mouse:wheel', handleMouseWheel);

//     fabricCanvasRef.current = canvas;

//     // Initial history save
//     setTimeout(() => {
//       if (fabricCanvasRef.current) {
//         saveToHistory();
//       }
//     }, 100);

//     // Cleanup
//     return () => {
//       if (fabricCanvasRef.current) {
//         fabricCanvasRef.current.dispose();
//         fabricCanvasRef.current = null;
//       }
//       if (resizeObserverRef.current) {
//         resizeObserverRef.current.disconnect();
//       }
//       if (saveTimeoutRef.current) {
//         clearTimeout(saveTimeoutRef.current);
//       }
//     };
//   }, []); // Empty dependency array - only run once

//   // ==================== HISTORY FUNCTIONS (declared early for use in init) ====================
//   const saveToHistory = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas || historyRef.current.isPerforming) return;

//     // Get canvas JSON excluding grid and guidelines
//     const json = canvas.toJSON(['selectable', 'evented', 'id', 'name', 'isGrid', 'excludeFromExport']);
//     json.objects = json.objects.filter(obj => !obj.isGrid && !obj.excludeFromExport);

//     const jsonString = JSON.stringify(json);
    
//     // Avoid duplicate saves
//     const lastState = historyRef.current.undoStack[historyRef.current.undoStack.length - 1];
//     if (lastState === jsonString) return;

//     historyRef.current.undoStack.push(jsonString);
//     historyRef.current.redoStack = []; // Clear redo stack on new action

//     // Limit history size
//     if (historyRef.current.undoStack.length > 50) {
//       historyRef.current.undoStack.shift();
//     }

//     setCanUndo(historyRef.current.undoStack.length > 1);
//     setCanRedo(false);
//   }, []);

//   // ==================== RESIZE OBSERVER FOR AUTO-ZOOM ====================
//   useEffect(() => {
//     if (!wrapperRef.current) return;

//     const handleResize = debounce(() => {
//       if (autoZoom) {
//         const newZoom = calculateAutoZoom();
//         setZoom(newZoom);
//         handleZoom(newZoom);
//       }
//     }, 100);

//     resizeObserverRef.current = new ResizeObserver(handleResize);
//     resizeObserverRef.current.observe(wrapperRef.current);

//     // Initial fit
//     handleResize();

//     return () => {
//       if (resizeObserverRef.current) {
//         resizeObserverRef.current.disconnect();
//       }
//     };
//   }, [autoZoom, calculateAutoZoom, handleZoom]);

//   // ==================== UPDATE GRID WHEN SETTINGS CHANGE ====================
//   useEffect(() => {
//     drawGrid();
//   }, [showGrid, gridSize, drawGrid]);

//   // TemplateEditor.jsx - Part 2 of 3
// // SVG Template Loading, History Management, Object Creation, Page Management

// // ==================== CONTINUE FROM PART 1 ====================
// // Add these functions inside the TemplateEditor component, after the useEffect hooks

//   // ==================== HISTORY MANAGEMENT ====================
//   const undo = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     const { undoStack, redoStack } = historyRef.current;
    
//     if (!canvas || undoStack.length <= 1) return;

//     historyRef.current.isPerforming = true;

//     // Move current state to redo stack
//     const currentState = undoStack.pop();
//     redoStack.push(currentState);

//     // Get previous state
//     const previousState = undoStack[undoStack.length - 1];

//     canvas.loadFromJSON(JSON.parse(previousState), () => {
//       canvas.renderAll();
//       drawGrid();
      
//       historyRef.current.isPerforming = false;
//       setCanUndo(undoStack.length > 1);
//       setCanRedo(true);

//       // Update selection
//       const activeObj = canvas.getActiveObject();
//       if (activeObj) {
//         setActiveObject(activeObj);
//         updatePropertiesFromObject(activeObj);
//       } else {
//         setActiveObject(null);
//         resetProperties();
//       }
//     });
//   }, [drawGrid, updatePropertiesFromObject, resetProperties]);

//   const redo = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     const { undoStack, redoStack } = historyRef.current;
    
//     if (!canvas || redoStack.length === 0) return;

//     historyRef.current.isPerforming = true;

//     // Get next state from redo stack
//     const nextState = redoStack.pop();
//     undoStack.push(nextState);

//     canvas.loadFromJSON(JSON.parse(nextState), () => {
//       canvas.renderAll();
//       drawGrid();
      
//       historyRef.current.isPerforming = false;
//       setCanUndo(true);
//       setCanRedo(redoStack.length > 0);

//       // Update selection
//       const activeObj = canvas.getActiveObject();
//       if (activeObj) {
//         setActiveObject(activeObj);
//         updatePropertiesFromObject(activeObj);
//       } else {
//         setActiveObject(null);
//         resetProperties();
//       }
//     });
//   }, [drawGrid, updatePropertiesFromObject, resetProperties]);

//   // ==================== SVG PARSER USING SVG.JS ====================
//   const parseSVGWithSVGJS = useCallback(async (svgString) => {
//     try {
//       // Create a temporary container
//       const container = document.createElement('div');
//       container.style.position = 'absolute';
//       container.style.visibility = 'hidden';
//       container.style.left = '-9999px';
//       document.body.appendChild(container);

//       // Parse SVG using SVG.js
//       const draw = SVG().addTo(container).svg(svgString);
//       const svgElement = draw.node;
      
//       // Get viewBox and dimensions
//       const viewBox = svgElement.viewBox?.baseVal;
//       const svgWidth = viewBox?.width || parseFloat(svgElement.getAttribute('width')) || CANVAS_WIDTH;
//       const svgHeight = viewBox?.height || parseFloat(svgElement.getAttribute('height')) || CANVAS_HEIGHT;

//       // Extract all elements with their computed styles
//       const elements = [];
      
//       const processElement = async (element, parentTransform = '') => {
//         const tagName = element.tagName?.toLowerCase();
//         if (!tagName || tagName === 'defs' || tagName === 'style') return;

//         const computedStyle = window.getComputedStyle(element);
//         const transform = element.getAttribute('transform') || '';
//         const combinedTransform = parentTransform + ' ' + transform;

//         // Get bounding box for positioning
//         let bbox = null;
//         try {
//           if (element.getBBox) {
//             bbox = element.getBBox();
//           }
//         } catch (e) {
//           // Some elements may not have getBBox
//         }

//         const elementData = {
//           type: tagName,
//           transform: combinedTransform.trim(),
//           bbox,
//           attributes: {},
//           style: {},
//           children: [],
//         };

//         // Copy attributes
//         Array.from(element.attributes || []).forEach(attr => {
//           elementData.attributes[attr.name] = attr.value;
//         });

//         // Copy computed styles
//         ['fill', 'stroke', 'strokeWidth', 'opacity', 'fontSize', 'fontFamily', 'fontWeight', 'fontStyle', 'textAnchor'].forEach(prop => {
//           const cssValue = computedStyle.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
//           if (cssValue) {
//             elementData.style[prop] = cssValue;
//           }
//         });

//         // Handle text elements specially
//         if (tagName === 'text' || tagName === 'tspan') {
//           elementData.textContent = element.textContent;
          
//           // Get precise text positioning
//           const x = parseFloat(element.getAttribute('x')) || 0;
//           const y = parseFloat(element.getAttribute('y')) || 0;
//           const dx = parseFloat(element.getAttribute('dx')) || 0;
//           const dy = parseFloat(element.getAttribute('dy')) || 0;
          
//           elementData.position = { x: x + dx, y: y + dy };
          
//           // Get font metrics using OpenType.js
//           const fontFamily = elementData.style.fontFamily || elementData.attributes['font-family'] || 'Arial';
//           const fontSize = parseFloat(elementData.style.fontSize || elementData.attributes['font-size']) || 16;
//           const fontWeight = elementData.style.fontWeight || elementData.attributes['font-weight'] || 'normal';
          
//           try {
//             const metrics = await getTextMetrics(
//               elementData.textContent,
//               fontFamily.replace(/['"]/g, '').split(',')[0].trim(),
//               fontSize,
//               fontWeight
//             );
//             elementData.metrics = metrics;
//           } catch (e) {
//             console.warn('Failed to get text metrics:', e);
//           }
//         }

//         // Process children
//         for (const child of element.children || []) {
//           await processElement(child, combinedTransform);
//         }

//         elements.push(elementData);
//       };

//       // Process all direct children of SVG
//       for (const child of svgElement.children) {
//         await processElement(child);
//       }

//       // Cleanup
//       document.body.removeChild(container);

//       return {
//         width: svgWidth,
//         height: svgHeight,
//         viewBox,
//         elements,
//         originalSVG: svgString,
//       };
//     } catch (error) {
//       console.error('SVG parsing error:', error);
//       throw error;
//     }
//   }, []);

//   // ==================== ENHANCED SVG TEMPLATE LOADING ====================
//   const loadTemplate = useCallback(async (template) => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     setIsLoading(true);
//     setLoadingMessage('Loading template...');

//     try {
//       // Clear existing objects (keep grid)
//       canvas.getObjects().forEach(obj => {
//         if (!obj.isGrid) canvas.remove(obj);
//       });
//       canvas.setBackgroundColor('#ffffff', () => canvas.renderAll());

//       // Fetch SVG content
//       let svgString;
//       if (template.src.startsWith('data:image/svg+xml;base64,')) {
//         const base64Content = template.src.replace('data:image/svg+xml;base64,', '');
//         svgString = decodeURIComponent(escape(atob(base64Content)));
//       } else if (template.src.startsWith('data:image/svg+xml,')) {
//         svgString = decodeURIComponent(template.src.replace('data:image/svg+xml,', ''));
//       } else {
//         // Fetch from URL
//         const response = await fetch(template.src);
//         svgString = await response.text();
//       }

//       setLoadingMessage('Parsing SVG structure...');

//       // Calculate scale to fit canvas
//       const tempDiv = document.createElement('div');
//       tempDiv.innerHTML = svgString;
//       const svgEl = tempDiv.querySelector('svg');
      
//       let svgWidth = CANVAS_WIDTH;
//       let svgHeight = CANVAS_HEIGHT;
      
//       if (svgEl) {
//         const viewBox = svgEl.getAttribute('viewBox');
//         if (viewBox) {
//           const parts = viewBox.split(/\s+|,/).map(parseFloat);
//           if (parts.length === 4) {
//             svgWidth = parts[2];
//             svgHeight = parts[3];
//           }
//         } else {
//           svgWidth = parseFloat(svgEl.getAttribute('width')) || CANVAS_WIDTH;
//           svgHeight = parseFloat(svgEl.getAttribute('height')) || CANVAS_HEIGHT;
//         }
//       }

//       const scaleX = CANVAS_WIDTH / svgWidth;
//       const scaleY = CANVAS_HEIGHT / svgHeight;
//       const scale = Math.min(scaleX, scaleY);

//       const offsetX = (CANVAS_WIDTH - svgWidth * scale) / 2;
//       const offsetY = (CANVAS_HEIGHT - svgHeight * scale) / 2;

//       setLoadingMessage('Loading fonts and processing text...');

//       // Use Fabric's SVG loading with enhanced text handling
//       await new Promise((resolve, reject) => {
//         fabric.loadSVGFromString(svgString, async (objects, options) => {
//           if (!objects || objects.length === 0) {
//             reject(new Error('No objects found in SVG'));
//             return;
//           }

//           setLoadingMessage('Processing elements...');

//           // Process each object
//           for (let i = 0; i < objects.length; i++) {
//             let obj = objects[i];
//             if (!obj) continue;

//             // Calculate new position
//             const originalLeft = obj.left || 0;
//             const originalTop = obj.top || 0;
            
//             const newLeft = originalLeft * scale + offsetX;
//             const newTop = originalTop * scale + offsetY;

//             // Handle text objects with OpenType.js for accurate positioning
//             if (obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox') {
//               const text = obj.text || '';
//               const fontFamily = (obj.fontFamily || 'Arial').replace(/['"]/g, '').split(',')[0].trim();
//               const fontSize = (obj.fontSize || 16) * scale;
//               const fontWeight = obj.fontWeight || 'normal';

//               setLoadingMessage(`Processing text: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"...`);

//               // Try to load the font for accurate metrics
//               let metrics = null;
//               try {
//                 metrics = await getTextMetrics(text, fontFamily, fontSize, fontWeight);
//               } catch (e) {
//                 console.warn(`Could not get metrics for font ${fontFamily}:`, e);
//               }

//               // Create IText for editability
//               const iText = new fabric.IText(text, {
//                 left: newLeft,
//                 top: newTop,
//                 fontFamily: fontFamily,
//                 fontSize: fontSize,
//                 fontWeight: fontWeight,
//                 fontStyle: obj.fontStyle || 'normal',
//                 fill: obj.fill || '#000000',
//                 stroke: obj.stroke || null,
//                 strokeWidth: (obj.strokeWidth || 0) * scale,
//                 angle: obj.angle || 0,
//                 scaleX: 1,
//                 scaleY: 1,
//                 originX: obj.originX || 'left',
//                 originY: obj.originY || 'top',
//                 textAlign: obj.textAlign || 'left',
//                 lineHeight: obj.lineHeight || 1.16,
//                 charSpacing: obj.charSpacing || 0,
//                 underline: obj.underline || false,
//                 linethrough: obj.linethrough || false,
//                 selectable: true,
//                 evented: true,
//                 id: `text_${Date.now()}_${i}`,
//               });

//               // Adjust position based on text-anchor if present
//               const textAnchor = obj.textAnchor || 'start';
//               if (metrics && textAnchor !== 'start') {
//                 if (textAnchor === 'middle') {
//                   iText.set('left', newLeft - metrics.width / 2);
//                 } else if (textAnchor === 'end') {
//                   iText.set('left', newLeft - metrics.width);
//                 }
//               }

//               // Adjust vertical position based on dominant-baseline
//               if (metrics) {
//                 // SVG text y position is typically at the baseline
//                 // Fabric.js positions from top, so adjust
//                 iText.set('top', newTop - metrics.ascender);
//               }

//               canvas.add(iText);
//             } else if (obj.type === 'image') {
//               // Handle images
//               if (obj._element || obj.src) {
//                 obj.set({
//                   left: newLeft,
//                   top: newTop,
//                   scaleX: (obj.scaleX || 1) * scale,
//                   scaleY: (obj.scaleY || 1) * scale,
//                   selectable: true,
//                   evented: true,
//                   id: `image_${Date.now()}_${i}`,
//                 });
//                 canvas.add(obj);
//               }
//             } else {
//               // Handle shapes and paths
//               obj.set({
//                 left: newLeft,
//                 top: newTop,
//                 scaleX: (obj.scaleX || 1) * scale,
//                 scaleY: (obj.scaleY || 1) * scale,
//                 selectable: true,
//                 evented: true,
//                 id: `obj_${Date.now()}_${i}`,
//               });
//               canvas.add(obj);
//             }
//           }

//           canvas.renderAll();
//           resolve();
//         }, (element, object) => {
//           // Reviver function - can modify objects during loading
//           if (!object) return null;
          
//           // Preserve original SVG attributes
//           if (element) {
//             object._svgElement = {
//               tagName: element.tagName,
//               attributes: Array.from(element.attributes || []).reduce((acc, attr) => {
//                 acc[attr.name] = attr.value;
//                 return acc;
//               }, {})
//             };
//           }
          
//           return object;
//         }, {
//           crossOrigin: 'anonymous',
//         });
//       });

//       setLoadingMessage('Finalizing...');

//       // Redraw grid on top
//       drawGrid();

//       // Save to history
//       saveToHistory();
      
//       // Update page thumbnail
//       updatePageThumbnail(currentPage);

//       setShowTemplateModal(false);
//       setIsLoading(false);
//       setLoadingMessage('');

//     } catch (error) {
//       console.error('Error loading template:', error);
//       setIsLoading(false);
//       setLoadingMessage('');
//       alert('Failed to load template. Please try again.');
//     }
//   }, [drawGrid, saveToHistory, currentPage]);

//   // ==================== UPDATE PROPERTY ====================
//   const updateProperty = useCallback((key, value) => {
//     const canvas = fabricCanvasRef.current;
//     const obj = canvas?.getActiveObject();
//     if (!obj || obj.isGrid) return;

//     // Handle special properties
//     switch (key) {
//       case 'fillOpacity':
//         obj.set('opacity', value / 100);
//         break;
        
//       case 'strokeDashArray':
//         obj.set('strokeDashArray', value ? [5, 5] : null);
//         break;
        
//       case 'width': {
//         const currentWidth = obj.width * obj.scaleX;
//         if (currentWidth !== value && obj.width) {
//           const newScaleX = value / obj.width;
//           obj.set('scaleX', newScaleX);
//         }
//         break;
//       }
      
//       case 'height': {
//         const currentHeight = obj.height * obj.scaleY;
//         if (currentHeight !== value && obj.height) {
//           const newScaleY = value / obj.height;
//           obj.set('scaleY', newScaleY);
//         }
//         break;
//       }
      
//       case 'fontWeight':
//         // Convert string to number if needed
//         obj.set('fontWeight', typeof value === 'string' ? parseInt(value) || 400 : value);
//         break;
        
//       case 'fontSize':
//         obj.set('fontSize', Math.max(1, Math.min(500, value)));
//         break;
        
//       case 'angle':
//         obj.set('angle', ((value % 360) + 360) % 360);
//         break;
        
//       default:
//         obj.set(key, value);
//     }

//     obj.setCoords();
//     setProperties(prev => ({ ...prev, [key]: value }));
//     canvas.renderAll();
    
//     // Debounced history save
//     if (saveTimeoutRef.current) {
//       clearTimeout(saveTimeoutRef.current);
//     }
//     saveTimeoutRef.current = setTimeout(() => {
//       saveToHistory();
//     }, 300);
//   }, [saveToHistory]);

//   // ==================== OBJECT CREATION ====================
//   const addText = useCallback((textContent = 'Double click to edit') => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     const text = new fabric.IText(textContent, {
//       left: CANVAS_WIDTH / 2,
//       top: CANVAS_HEIGHT / 2,
//       fontFamily: 'Arial',
//       fontSize: 32,
//       fontWeight: 400,
//       fill: '#000000',
//       originX: 'center',
//       originY: 'center',
//       selectable: true,
//       evented: true,
//       id: `text_${Date.now()}`,
//     });

//     canvas.add(text);
//     canvas.setActiveObject(text);
//     canvas.renderAll();
    
//     setActiveObject(text);
//     updatePropertiesFromObject(text);
//     saveToHistory();
//   }, [saveToHistory, updatePropertiesFromObject]);

//   const addShape = useCallback((shapeType) => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     const commonProps = {
//       left: CANVAS_WIDTH / 2,
//       top: CANVAS_HEIGHT / 2,
//       fill: '#6366f1',
//       stroke: '#4f46e5',
//       strokeWidth: 2,
//       originX: 'center',
//       originY: 'center',
//       selectable: true,
//       evented: true,
//       id: `shape_${Date.now()}`,
//     };

//     let shape;

//     switch (shapeType) {
//       case 'rect':
//         shape = new fabric.Rect({
//           ...commonProps,
//           width: 150,
//           height: 100,
//           rx: 8,
//           ry: 8,
//         });
//         break;

//       case 'circle':
//         shape = new fabric.Circle({
//           ...commonProps,
//           radius: 60,
//         });
//         break;

//       case 'triangle':
//         shape = new fabric.Triangle({
//           ...commonProps,
//           width: 120,
//           height: 100,
//         });
//         break;

//       case 'line':
//         shape = new fabric.Line([0, 0, 200, 0], {
//           ...commonProps,
//           fill: null,
//           stroke: '#6366f1',
//           strokeWidth: 3,
//           originX: 'left',
//           originY: 'center',
//         });
//         break;

//       case 'ellipse':
//         shape = new fabric.Ellipse({
//           ...commonProps,
//           rx: 80,
//           ry: 50,
//         });
//         break;

//       case 'polygon':
//         // Pentagon
//         const points = [];
//         const sides = 5;
//         const radius = 60;
//         for (let i = 0; i < sides; i++) {
//           const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
//           points.push({
//             x: radius * Math.cos(angle),
//             y: radius * Math.sin(angle)
//           });
//         }
//         shape = new fabric.Polygon(points, {
//           ...commonProps,
//         });
//         break;

//       default:
//         return;
//     }

//     canvas.add(shape);
//     canvas.setActiveObject(shape);
//     canvas.renderAll();
    
//     setActiveObject(shape);
//     updatePropertiesFromObject(shape);
//     saveToHistory();
//   }, [saveToHistory, updatePropertiesFromObject]);

//   const addImage = useCallback((e) => {
//     const file = e.target?.files?.[0];
//     if (!file) return;

//     setIsLoading(true);
//     setLoadingMessage('Loading image...');

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const imgData = event.target?.result;
      
//       fabric.Image.fromURL(imgData, (img) => {
//         const canvas = fabricCanvasRef.current;
//         if (!canvas || !img) {
//           setIsLoading(false);
//           return;
//         }

//         // Calculate scale to fit within 70% of canvas
//         const maxWidth = CANVAS_WIDTH * 0.7;
//         const maxHeight = CANVAS_HEIGHT * 0.7;
//         const scale = Math.min(
//           maxWidth / (img.width || 1),
//           maxHeight / (img.height || 1),
//           1
//         );

//         img.set({
//           left: CANVAS_WIDTH / 2,
//           top: CANVAS_HEIGHT / 2,
//           scaleX: scale,
//           scaleY: scale,
//           originX: 'center',
//           originY: 'center',
//           selectable: true,
//           evented: true,
//           id: `image_${Date.now()}`,
//         });

//         canvas.add(img);
//         canvas.setActiveObject(img);
//         canvas.renderAll();
        
//         setActiveObject(img);
//         updatePropertiesFromObject(img);
//         saveToHistory();
//         setIsLoading(false);
//         setLoadingMessage('');
//       }, { crossOrigin: 'anonymous' });
//     };

//     reader.onerror = () => {
//       setIsLoading(false);
//       alert('Failed to load image');
//     };

//     reader.readAsDataURL(file);
    
//     // Reset input
//     if (e.target) {
//       e.target.value = '';
//     }
//   }, [saveToHistory, updatePropertiesFromObject]);

//   // ==================== OBJECT MANIPULATION ====================
//   const deleteSelected = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     const obj = canvas?.getActiveObject();
//     if (!obj) return;

//     if (obj.type === 'activeSelection') {
//       // Multiple objects selected
//       obj.forEachObject((o) => {
//         if (!o.isGrid && !o.excludeFromExport) {
//           canvas.remove(o);
//         }
//       });
//     } else if (!obj.isGrid && !obj.excludeFromExport) {
//       canvas.remove(obj);
//     }

//     canvas.discardActiveObject();
//     canvas.renderAll();
    
//     setActiveObject(null);
//     resetProperties();
//     saveToHistory();
//   }, [saveToHistory, resetProperties]);

//   const duplicateSelected = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     const obj = canvas?.getActiveObject();
//     if (!obj || obj.isGrid) return;

//     obj.clone((cloned) => {
//       cloned.set({
//         left: (obj.left || 0) + 20,
//         top: (obj.top || 0) + 20,
//         id: `${obj.id || 'obj'}_copy_${Date.now()}`,
//         evented: true,
//         selectable: true,
//       });

//       if (cloned.type === 'activeSelection') {
//         cloned.canvas = canvas;
//         cloned.forEachObject((o) => {
//           canvas.add(o);
//         });
//         cloned.setCoords();
//       } else {
//         canvas.add(cloned);
//       }

//       canvas.setActiveObject(cloned);
//       canvas.renderAll();
      
//       setActiveObject(cloned);
//       updatePropertiesFromObject(cloned);
//       saveToHistory();
//     });
//   }, [saveToHistory, updatePropertiesFromObject]);

//   const clearCanvas = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     // Remove all non-grid objects
//     canvas.getObjects().forEach(obj => {
//       if (!obj.isGrid) {
//         canvas.remove(obj);
//       }
//     });

//     canvas.setBackgroundColor('#ffffff', () => {
//       canvas.renderAll();
//     });

//     setActiveObject(null);
//     resetProperties();
//     saveToHistory();
//     updatePageThumbnail(currentPage);
//   }, [saveToHistory, resetProperties, currentPage]);

//   // ==================== ALIGNMENT ====================
//   const alignObject = useCallback((alignment) => {
//     const canvas = fabricCanvasRef.current;
//     const obj = canvas?.getActiveObject();
//     if (!obj || obj.isGrid) return;

//     const bound = obj.getBoundingRect(true);

//     switch (alignment) {
//       case 'left':
//         obj.set('left', obj.left - bound.left);
//         break;
//       case 'center':
//         obj.set('left', CANVAS_WIDTH / 2 - (bound.width / 2) + (obj.left - bound.left));
//         break;
//       case 'right':
//         obj.set('left', CANVAS_WIDTH - bound.width + (obj.left - bound.left));
//         break;
//       case 'top':
//         obj.set('top', obj.top - bound.top);
//         break;
//       case 'middle':
//         obj.set('top', CANVAS_HEIGHT / 2 - (bound.height / 2) + (obj.top - bound.top));
//         break;
//       case 'bottom':
//         obj.set('top', CANVAS_HEIGHT - bound.height + (obj.top - bound.top));
//         break;
//     }

//     obj.setCoords();
//     canvas.renderAll();
//     updatePropertiesFromObject(obj);
//     saveToHistory();
//   }, [saveToHistory, updatePropertiesFromObject]);

//   const setTextAlign = useCallback((align) => {
//     updateProperty('textAlign', align);
//   }, [updateProperty]);

//   // ==================== LAYER CONTROLS ====================
//   const bringForward = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     const obj = canvas?.getActiveObject();
//     if (!obj || obj.isGrid) return;
    
//     canvas.bringForward(obj);
//     canvas.renderAll();
//     saveToHistory();
//   }, [saveToHistory]);

//   const sendBackward = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     const obj = canvas?.getActiveObject();
//     if (!obj || obj.isGrid) return;
    
//     canvas.sendBackwards(obj);
    
//     // Ensure grid stays at back
//     const gridObjects = canvas.getObjects().filter(o => o.isGrid);
//     gridObjects.forEach(g => canvas.sendToBack(g));
    
//     canvas.renderAll();
//     saveToHistory();
//   }, [saveToHistory]);

//   const bringToFront = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     const obj = canvas?.getActiveObject();
//     if (!obj || obj.isGrid) return;
    
//     canvas.bringToFront(obj);
//     canvas.renderAll();
//     saveToHistory();
//   }, [saveToHistory]);

//   const sendToBack = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     const obj = canvas?.getActiveObject();
//     if (!obj || obj.isGrid) return;
    
//     canvas.sendToBack(obj);
    
//     // Ensure grid stays at very back
//     const gridObjects = canvas.getObjects().filter(o => o.isGrid);
//     gridObjects.forEach(g => canvas.sendToBack(g));
    
//     canvas.renderAll();
//     saveToHistory();
//   }, [saveToHistory]);

//   // ==================== CANVAS ROTATION ====================
//   const handleCanvasRotation = useCallback((newRotation) => {
//     setRotation(((newRotation % 360) + 360) % 360);
//   }, []);

//   // ==================== PAGE THUMBNAIL ====================
//   const updatePageThumbnail = useCallback((pageIndex) => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     // Temporarily hide grid and guidelines
//     const hiddenObjects = canvas.getObjects().filter(obj => obj.isGrid || obj.excludeFromExport || obj.isGuideline);
//     hiddenObjects.forEach(obj => obj.set('visible', false));
    
//     // Store current zoom
//     const currentZoom = canvas.getZoom();
//     canvas.setZoom(1);
//     canvas.setWidth(CANVAS_WIDTH);
//     canvas.setHeight(CANVAS_HEIGHT);
//     canvas.renderAll();

//     const thumbnail = canvas.toDataURL({
//       format: 'png',
//       quality: 0.5,
//       multiplier: 0.15,
//     });

//     // Restore
//     canvas.setZoom(currentZoom);
//     canvas.setWidth(CANVAS_WIDTH * currentZoom);
//     canvas.setHeight(CANVAS_HEIGHT * currentZoom);
//     hiddenObjects.forEach(obj => obj.set('visible', true));
//     canvas.renderAll();

//     setPages(prev => {
//       const updated = [...prev];
//       if (updated[pageIndex]) {
//         updated[pageIndex] = {
//           ...updated[pageIndex],
//           thumbnail
//         };
//       }
//       return updated;
//     });
//   }, []);

//   // ==================== PAGE MANAGEMENT ====================
//   const saveCurrentPage = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return null;

//     // Get canvas JSON excluding grid and guidelines
//     const json = canvas.toJSON(['selectable', 'evented', 'id', 'name']);
//     json.objects = json.objects.filter(obj => !obj.isGrid && !obj.excludeFromExport && !obj.isGuideline);

//     // Generate thumbnail
//     const hiddenObjects = canvas.getObjects().filter(obj => obj.isGrid || obj.excludeFromExport || obj.isGuideline);
//     hiddenObjects.forEach(obj => obj.set('visible', false));
    
//     const currentZoom = canvas.getZoom();
//     canvas.setZoom(1);
//     canvas.setWidth(CANVAS_WIDTH);
//     canvas.setHeight(CANVAS_HEIGHT);
//     canvas.renderAll();

//     const thumbnail = canvas.toDataURL({
//       format: 'png',
//       quality: 0.5,
//       multiplier: 0.15,
//     });

//     canvas.setZoom(currentZoom);
//     canvas.setWidth(CANVAS_WIDTH * currentZoom);
//     canvas.setHeight(CANVAS_HEIGHT * currentZoom);
//     hiddenObjects.forEach(obj => obj.set('visible', true));
//     canvas.renderAll();

//     // Update pages state
//     setPages(prev => {
//       const updated = [...prev];
//       if (updated[currentPage]) {
//         updated[currentPage] = {
//           ...updated[currentPage],
//           canvasJSON: json,
//           thumbnail
//         };
//       }
//       return updated;
//     });

//     return json;
//   }, [currentPage]);

//   const switchToPage = useCallback((pageIndex) => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas || pageIndex === currentPage || pageIndex < 0 || pageIndex >= pages.length) return;

//     // Save current page first
//     saveCurrentPage();

//     // Clear non-grid objects
//     canvas.getObjects().forEach(obj => {
//       if (!obj.isGrid) {
//         canvas.remove(obj);
//       }
//     });

//     // Load target page
//     const targetPage = pages[pageIndex];

//     if (targetPage?.canvasJSON) {
//       canvas.loadFromJSON(targetPage.canvasJSON, () => {
//         canvas.renderAll();
//         drawGrid();
        
//         // Reset history for new page
//         historyRef.current = {
//           undoStack: [JSON.stringify(targetPage.canvasJSON)],
//           redoStack: [],
//           isPerforming: false
//         };
//         setCanUndo(false);
//         setCanRedo(false);
//       });
//     } else {
//       canvas.setBackgroundColor('#ffffff', () => {
//         canvas.renderAll();
//         drawGrid();
//       });
      
//       historyRef.current = {
//         undoStack: [JSON.stringify(canvas.toJSON())],
//         redoStack: [],
//         isPerforming: false
//       };
//       setCanUndo(false);
//       setCanRedo(false);
//     }

//     setCurrentPage(pageIndex);
//     setActiveObject(null);
//     resetProperties();
//     clearGuidelines();
//   }, [currentPage, pages, saveCurrentPage, drawGrid, resetProperties, clearGuidelines]);

//   const addNewPage = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     // Save current page
//     saveCurrentPage();

//     const newPage = {
//       id: Date.now(),
//       name: `Page ${pages.length + 1}`,
//       canvasJSON: null,
//       thumbnail: null,
//       svgData: null
//     };

//     setPages(prev => [...prev, newPage]);

//     // Clear canvas for new page
//     canvas.getObjects().forEach(obj => {
//       if (!obj.isGrid) {
//         canvas.remove(obj);
//       }
//     });
//     canvas.setBackgroundColor('#ffffff', () => {
//       canvas.renderAll();
//       drawGrid();
//     });

//     const newPageIndex = pages.length;
//     setCurrentPage(newPageIndex);
//     setActiveObject(null);
//     resetProperties();
//     clearGuidelines();

//     // Reset history for new page
//     historyRef.current = {
//       undoStack: [JSON.stringify(canvas.toJSON())],
//       redoStack: [],
//       isPerforming: false
//     };
//     setCanUndo(false);
//     setCanRedo(false);
//   }, [pages, saveCurrentPage, drawGrid, resetProperties, clearGuidelines]);

//   const deletePage = useCallback((pageIndex) => {
//     if (pages.length <= 1) {
//       alert('Cannot delete the last page');
//       return;
//     }

//     const newPages = pages.filter((_, idx) => idx !== pageIndex);
//     setPages(newPages);

//     if (pageIndex === currentPage) {
//       const newCurrentPage = Math.max(0, pageIndex - 1);
      
//       const canvas = fabricCanvasRef.current;
//       if (canvas) {
//         canvas.getObjects().forEach(obj => {
//           if (!obj.isGrid) canvas.remove(obj);
//         });

//         if (newPages[newCurrentPage]?.canvasJSON) {
//           canvas.loadFromJSON(newPages[newCurrentPage].canvasJSON, () => {
//             canvas.renderAll();
//             drawGrid();
//           });
//         } else {
//           canvas.setBackgroundColor('#ffffff', () => {
//             canvas.renderAll();
//             drawGrid();
//           });
//         }
//       }
      
//       setCurrentPage(newCurrentPage);
//     } else if (pageIndex < currentPage) {
//       setCurrentPage(prev => prev - 1);
//     }

//     setActiveObject(null);
//     resetProperties();
//   }, [pages, currentPage, drawGrid, resetProperties]);

//   const duplicatePage = useCallback(() => {
//     const json = saveCurrentPage();

//     const duplicatedPage = {
//       id: Date.now(),
//       name: `${pages[currentPage]?.name || 'Page'} (Copy)`,
//       canvasJSON: json,
//       thumbnail: pages[currentPage]?.thumbnail,
//       svgData: null
//     };

//     setPages(prev => [...prev, duplicatedPage]);
//   }, [pages, currentPage, saveCurrentPage]);

//   const renamePage = useCallback((pageIndex, newName) => {
//     setPages(prev => {
//       const updated = [...prev];
//       if (updated[pageIndex]) {
//         updated[pageIndex] = {
//           ...updated[pageIndex],
//           name: newName
//         };
//       }
//       return updated;
//     });
//   }, []);

//   // ==================== EXPORT FUNCTIONS ====================
//   const exportCanvas = useCallback((format = 'png') => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     // Hide grid and guidelines
//     const hiddenObjects = canvas.getObjects().filter(obj => obj.isGrid || obj.excludeFromExport || obj.isGuideline);
//     hiddenObjects.forEach(obj => obj.set('visible', false));

//     // Reset zoom
//     const currentZoom = canvas.getZoom();
//     canvas.setZoom(1);
//     canvas.setWidth(CANVAS_WIDTH);
//     canvas.setHeight(CANVAS_HEIGHT);
//     canvas.renderAll();

//     const dataURL = canvas.toDataURL({
//       format: format === 'jpg' ? 'jpeg' : format,
//       quality: 1,
//       multiplier: 2, // 2x resolution for better quality
//     });

//     // Restore
//     canvas.setZoom(currentZoom);
//     canvas.setWidth(CANVAS_WIDTH * currentZoom);
//     canvas.setHeight(CANVAS_HEIGHT * currentZoom);
//     hiddenObjects.forEach(obj => obj.set('visible', true));
//     canvas.renderAll();

//     // Download
//     const link = document.createElement('a');
//     link.download = `${pageName.replace(/\s+/g, '_')}_page${currentPage + 1}.${format}`;
//     link.href = dataURL;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   }, [pageName, currentPage]);

//   const exportAllPages = useCallback(async (format = 'png') => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     setIsLoading(true);
//     setLoadingMessage('Exporting pages...');

//     // Save current page
//     const currentJSON = saveCurrentPage();

//     const exports = [];

//     for (let i = 0; i < pages.length; i++) {
//       setLoadingMessage(`Exporting page ${i + 1} of ${pages.length}...`);

//       // Load page if not current
//       if (i !== currentPage && pages[i]?.canvasJSON) {
//         await new Promise((resolve) => {
//           canvas.loadFromJSON(pages[i].canvasJSON, () => {
//             canvas.renderAll();
//             resolve();
//           });
//         });
//       }

//       // Hide grid
//       const hiddenObjects = canvas.getObjects().filter(obj => obj.isGrid || obj.excludeFromExport);
//       hiddenObjects.forEach(obj => obj.set('visible', false));

//       const currentZoom = canvas.getZoom();
//       canvas.setZoom(1);
//       canvas.setWidth(CANVAS_WIDTH);
//       canvas.setHeight(CANVAS_HEIGHT);
//       canvas.renderAll();

//       exports.push({
//         name: `${pageName.replace(/\s+/g, '_')}_page${i + 1}.${format}`,
//         data: canvas.toDataURL({
//           format: format === 'jpg' ? 'jpeg' : format,
//           quality: 1,
//           multiplier: 2,
//         })
//       });

//       canvas.setZoom(currentZoom);
//       canvas.setWidth(CANVAS_WIDTH * currentZoom);
//       canvas.setHeight(CANVAS_HEIGHT * currentZoom);
//       hiddenObjects.forEach(obj => obj.set('visible', true));
//     }

//     // Restore current page
//     if (currentJSON) {
//       canvas.loadFromJSON(currentJSON, () => {
//         canvas.renderAll();
//         drawGrid();
//       });
//     }

//     // Download all
//     exports.forEach((exp, idx) => {
//       setTimeout(() => {
//         const link = document.createElement('a');
//         link.download = exp.name;
//         link.href = exp.data;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//       }, idx * 200);
//     });

//     setIsLoading(false);
//     setLoadingMessage('');
//   }, [pages, currentPage, pageName, saveCurrentPage, drawGrid]);

//   // ==================== PREVIEW FUNCTION ====================
//   const openPreview = useCallback(async () => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     setIsLoading(true);
//     setLoadingMessage('Preparing preview...');

//     // Save current page
//     saveCurrentPage();

//     // Store current state
//     const currentZoom = canvas.getZoom();
//     const currentCanvasJSON = canvas.toJSON(['selectable', 'evented', 'id', 'name']);
//     currentCanvasJSON.objects = currentCanvasJSON.objects.filter(obj => !obj.isGrid && !obj.excludeFromExport);

//     // Hide grid
//     const gridObjects = canvas.getObjects().filter(obj => obj.isGrid || obj.excludeFromExport);
//     gridObjects.forEach(obj => obj.set('visible', false));

//     canvas.setZoom(1);
//     canvas.setWidth(CANVAS_WIDTH);
//     canvas.setHeight(CANVAS_HEIGHT);
//     canvas.renderAll();

//     // Generate all page images
//     const pageImages = [];

//     for (let i = 0; i < pages.length; i++) {
//       setLoadingMessage(`Rendering page ${i + 1} of ${pages.length}...`);

//       if (i === currentPage) {
//         pageImages.push(canvas.toDataURL({
//           format: 'png',
//           quality: 1,
//           multiplier: 1.5,
//         }));
//       } else if (pages[i]?.canvasJSON) {
//         await new Promise((resolve) => {
//           canvas.loadFromJSON(pages[i].canvasJSON, () => {
//             canvas.renderAll();
//             pageImages.push(canvas.toDataURL({
//               format: 'png',
//               quality: 1,
//               multiplier: 1.5,
//             }));
//             resolve();
//           });
//         });
//       } else {
//         // Empty page
//         canvas.clear();
//         canvas.setBackgroundColor('#ffffff', () => canvas.renderAll());
//         pageImages.push(canvas.toDataURL({
//           format: 'png',
//           quality: 1,
//           multiplier: 1.5,
//         }));
//       }
//     }

//     // Restore current page
//     canvas.loadFromJSON(currentCanvasJSON, () => {
//       canvas.setZoom(currentZoom);
//       canvas.setWidth(CANVAS_WIDTH * currentZoom);
//       canvas.setHeight(CANVAS_HEIGHT * currentZoom);
//       gridObjects.forEach(obj => obj.set('visible', true));
//       canvas.renderAll();
//       drawGrid();
//     });

//     setIsLoading(false);
//     setLoadingMessage('');

//     // Open flipbook preview
//     openFlipbookPreview(pageImages);
//   }, [pages, currentPage, saveCurrentPage, drawGrid, pageName]);

//   // ==================== FLIPBOOK PREVIEW (with drag support) ====================
//   const openFlipbookPreview = useCallback((pageImages) => {
//   const totalPages = pageImages.length;

//   const previewHTML = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
//   <title>${pageName} - Flipbook Preview</title>
//   <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"><\/script>
//   <script src="https://cdnjs.cloudflare.com/ajax/libs/turn.js/3/turn.min.js"><\/script>
//   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
//   <style>
//     * { 
//       margin: 0; 
//       padding: 0; 
//       box-sizing: border-box; 
//     }
    
//     html, body { 
//       width: 100%; 
//       height: 100%; 
//       overflow: hidden; 
//     }
    
//     body {
//       background: linear-gradient(135deg, #0c1222 0%, #1a1f35 50%, #252b45 100%);
//       display: flex; 
//       flex-direction: column;
//       font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//       user-select: none;
//       -webkit-user-select: none;
//     }
    
//     /* ========== HEADER ========== */
//     .header {
//       height: 64px;
//       background: rgba(0, 0, 0, 0.5);
//       backdrop-filter: blur(20px);
//       -webkit-backdrop-filter: blur(20px);
//       display: flex;
//       align-items: center;
//       justify-content: space-between;
//       padding: 0 24px;
//       border-bottom: 1px solid rgba(255, 255, 255, 0.08);
//       flex-shrink: 0;
//       z-index: 100;
//     }
    
//     .header-left {
//       display: flex;
//       align-items: center;
//       gap: 16px;
//     }
    
//     .logo {
//       width: 40px;
//       height: 40px;
//       background: linear-gradient(135deg, #6366f1, #8b5cf6);
//       border-radius: 10px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       font-size: 20px;
//     }
    
//     .header-title h1 {
//       font-size: 18px;
//       font-weight: 600;
//       color: white;
//       max-width: 300px;
//       overflow: hidden;
//       text-overflow: ellipsis;
//       white-space: nowrap;
//     }
    
//     .header-title .meta {
//       display: flex;
//       align-items: center;
//       gap: 8px;
//       margin-top: 2px;
//     }
    
//     .badge {
//       background: rgba(99, 102, 241, 0.2);
//       color: #a5b4fc;
//       padding: 3px 10px;
//       border-radius: 20px;
//       font-size: 11px;
//       font-weight: 500;
//     }
    
//     .header-center {
//       display: flex;
//       align-items: center;
//       gap: 8px;
//     }
    
//     .header-right {
//       display: flex;
//       gap: 8px;
//       align-items: center;
//     }
    
//     /* ========== BUTTONS ========== */
//     .btn {
//       background: rgba(255, 255, 255, 0.08);
//       border: 1px solid rgba(255, 255, 255, 0.12);
//       color: white;
//       padding: 10px 18px;
//       border-radius: 10px;
//       cursor: pointer;
//       font-size: 13px;
//       font-weight: 500;
//       display: flex;
//       align-items: center;
//       gap: 8px;
//       transition: all 0.2s ease;
//       font-family: inherit;
//     }
    
//     .btn:hover {
//       background: rgba(255, 255, 255, 0.15);
//       border-color: rgba(255, 255, 255, 0.2);
//       transform: translateY(-1px);
//     }
    
//     .btn:active {
//       transform: translateY(0);
//     }
    
//     .btn-icon {
//       padding: 10px;
//       border-radius: 10px;
//     }
    
//     .btn-primary {
//       background: linear-gradient(135deg, #6366f1, #8b5cf6);
//       border: none;
//     }
    
//     .btn-primary:hover {
//       background: linear-gradient(135deg, #4f46e5, #7c3aed);
//       box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
//     }
    
//     .btn-danger {
//       background: rgba(239, 68, 68, 0.15);
//       border-color: rgba(239, 68, 68, 0.3);
//       color: #fca5a5;
//     }
    
//     .btn-danger:hover {
//       background: rgba(239, 68, 68, 0.3);
//     }
    
//     /* ========== ZOOM CONTROLS ========== */
//     .zoom-controls {
//       display: flex;
//       align-items: center;
//       gap: 4px;
//       background: rgba(0, 0, 0, 0.3);
//       padding: 4px;
//       border-radius: 10px;
//       border: 1px solid rgba(255, 255, 255, 0.08);
//     }
    
//     .zoom-controls button {
//       background: none;
//       border: none;
//       color: white;
//       width: 32px;
//       height: 32px;
//       border-radius: 8px;
//       cursor: pointer;
//       font-size: 16px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       transition: all 0.2s;
//     }
    
//     .zoom-controls button:hover {
//       background: rgba(255, 255, 255, 0.1);
//     }
    
//     .zoom-level {
//       color: rgba(255, 255, 255, 0.9);
//       font-size: 12px;
//       font-weight: 600;
//       min-width: 48px;
//       text-align: center;
//       padding: 0 4px;
//     }
    
//     .divider {
//       width: 1px;
//       height: 20px;
//       background: rgba(255, 255, 255, 0.15);
//       margin: 0 4px;
//     }
    
//     /* ========== MAIN CONTENT ========== */
//     .main-content {
//       flex: 1;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       position: relative;
//       overflow: hidden;
//       padding: 20px;
//     }
    
//     /* Book shadow on surface */
//     .main-content::after {
//       content: '';
//       position: absolute;
//       bottom: 80px;
//       left: 50%;
//       transform: translateX(-50%);
//       width: 70%;
//       max-width: 800px;
//       height: 60px;
//       background: radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%);
//       pointer-events: none;
//       z-index: 0;
//     }
    
//     .flipbook-container {
//       position: relative;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       z-index: 1;
//     }
    
//     .flipbook-wrapper {
//       position: relative;
//       transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//       transform-origin: center center;
//     }
    
//     /* ========== FLIPBOOK ========== */
//     #flipbook {
//       background: transparent;
//     }
    
//     #flipbook .page {
//       background: white;
//       background-size: cover;
//       background-position: center;
//       overflow: hidden;
//     }
    
//     #flipbook .page-wrapper {
//       perspective: 2000px;
//     }
    
//     #flipbook .page img {
//       width: 100%;
//       height: 100%;
//       object-fit: contain;
//       display: block;
//       pointer-events: none;
//       -webkit-user-drag: none;
//       background: white;
//     }
    
//     /* Hard cover effect for first and last pages */
//     #flipbook .page.p1,
//     #flipbook .page:last-child {
//       background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
//     }
    
//     /* Page shadows and depth */
//     #flipbook .turn-page-wrapper {
//       box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);
//     }
    
//     .turn-page {
//       background: white;
//     }
    
//     /* Gradient overlays for realism */
//     #flipbook .page::before {
//       content: '';
//       position: absolute;
//       top: 0;
//       left: 0;
//       right: 0;
//       bottom: 0;
//       pointer-events: none;
//       z-index: 10;
//     }
    
//     #flipbook .odd::before {
//       background: linear-gradient(to right, 
//         rgba(0,0,0,0.15) 0%, 
//         rgba(0,0,0,0.05) 5%, 
//         transparent 10%,
//         transparent 90%,
//         rgba(0,0,0,0.02) 100%
//       );
//     }
    
//     #flipbook .even::before {
//       background: linear-gradient(to left, 
//         rgba(0,0,0,0.15) 0%, 
//         rgba(0,0,0,0.05) 5%, 
//         transparent 10%,
//         transparent 90%,
//         rgba(0,0,0,0.02) 100%
//       );
//     }
    
//     /* ========== NAVIGATION ARROWS ========== */
//     .nav-arrow {
//       position: absolute;
//       top: 50%;
//       transform: translateY(-50%);
//       width: 56px;
//       height: 56px;
//       border-radius: 50%;
//       background: rgba(255, 255, 255, 0.1);
//       backdrop-filter: blur(10px);
//       border: 1px solid rgba(255, 255, 255, 0.15);
//       color: white;
//       cursor: pointer;
//       font-size: 24px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       transition: all 0.3s ease;
//       z-index: 50;
//     }
    
//     .nav-arrow:hover:not(:disabled) {
//       background: rgba(255, 255, 255, 0.2);
//       transform: translateY(-50%) scale(1.1);
//       box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
//     }
    
//     .nav-arrow:active:not(:disabled) {
//       transform: translateY(-50%) scale(0.95);
//     }
    
//     .nav-arrow:disabled {
//       opacity: 0.3;
//       cursor: not-allowed;
//     }
    
//     .nav-arrow.left {
//       left: 30px;
//     }
    
//     .nav-arrow.right {
//       right: 30px;
//     }
    
//     /* ========== FOOTER ========== */
//     .footer {
//       height: 72px;
//       background: rgba(0, 0, 0, 0.5);
//       backdrop-filter: blur(20px);
//       -webkit-backdrop-filter: blur(20px);
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       gap: 16px;
//       border-top: 1px solid rgba(255, 255, 255, 0.08);
//       flex-shrink: 0;
//       padding: 0 20px;
//     }
    
//     .footer-nav {
//       display: flex;
//       align-items: center;
//       gap: 12px;
//     }
    
//     .nav-btn {
//       width: 44px;
//       height: 44px;
//       border-radius: 12px;
//       background: rgba(255, 255, 255, 0.08);
//       border: 1px solid rgba(255, 255, 255, 0.12);
//       color: white;
//       cursor: pointer;
//       font-size: 16px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       transition: all 0.2s ease;
//     }
    
//     .nav-btn:hover:not(:disabled) {
//       background: rgba(255, 255, 255, 0.15);
//       transform: translateY(-2px);
//     }
    
//     .nav-btn:disabled {
//       opacity: 0.3;
//       cursor: not-allowed;
//     }
    
//     .page-indicator {
//       background: rgba(0, 0, 0, 0.4);
//       padding: 10px 20px;
//       border-radius: 25px;
//       color: white;
//       font-size: 14px;
//       display: flex;
//       align-items: center;
//       gap: 8px;
//       border: 1px solid rgba(255, 255, 255, 0.08);
//     }
    
//     .page-indicator strong {
//       color: #a5b4fc;
//       font-size: 16px;
//       font-weight: 600;
//     }
    
//     .page-input {
//       width: 45px;
//       background: rgba(255, 255, 255, 0.1);
//       border: 1px solid rgba(255, 255, 255, 0.2);
//       color: #a5b4fc;
//       font-size: 16px;
//       font-weight: 600;
//       text-align: center;
//       border-radius: 6px;
//       padding: 4px;
//       font-family: inherit;
//     }
    
//     .page-input:focus {
//       outline: none;
//       border-color: #6366f1;
//       background: rgba(99, 102, 241, 0.2);
//     }
    
//     /* ========== SLIDER ========== */
//     .slider-container {
//       display: flex;
//       align-items: center;
//       gap: 12px;
//       background: rgba(0, 0, 0, 0.3);
//       padding: 8px 16px;
//       border-radius: 25px;
//       border: 1px solid rgba(255, 255, 255, 0.08);
//     }
    
//     .page-slider {
//       width: 180px;
//       height: 6px;
//       -webkit-appearance: none;
//       appearance: none;
//       background: rgba(255, 255, 255, 0.15);
//       border-radius: 3px;
//       outline: none;
//       cursor: pointer;
//     }
    
//     .page-slider::-webkit-slider-thumb {
//       -webkit-appearance: none;
//       appearance: none;
//       width: 18px;
//       height: 18px;
//       background: linear-gradient(135deg, #6366f1, #8b5cf6);
//       border-radius: 50%;
//       cursor: pointer;
//       box-shadow: 0 2px 8px rgba(99, 102, 241, 0.5);
//       transition: transform 0.2s;
//     }
    
//     .page-slider::-webkit-slider-thumb:hover {
//       transform: scale(1.2);
//     }
    
//     .page-slider::-moz-range-thumb {
//       width: 18px;
//       height: 18px;
//       background: linear-gradient(135deg, #6366f1, #8b5cf6);
//       border-radius: 50%;
//       cursor: pointer;
//       border: none;
//       box-shadow: 0 2px 8px rgba(99, 102, 241, 0.5);
//     }
    
//     /* ========== THUMBNAILS PANEL ========== */
//     .thumbnails-toggle {
//       position: fixed;
//       left: 0;
//       top: 50%;
//       transform: translateY(-50%);
//       background: rgba(0, 0, 0, 0.5);
//       backdrop-filter: blur(10px);
//       padding: 12px 8px 12px 12px;
//       border-radius: 0 12px 12px 0;
//       cursor: pointer;
//       color: white;
//       font-size: 18px;
//       transition: all 0.3s;
//       z-index: 60;
//       border: 1px solid rgba(255, 255, 255, 0.1);
//       border-left: none;
//     }
    
//     .thumbnails-toggle:hover {
//       background: rgba(0, 0, 0, 0.7);
//       padding-right: 12px;
//     }
    
//     .thumbnails-panel {
//       position: fixed;
//       left: -280px;
//       top: 64px;
//       bottom: 72px;
//       width: 280px;
//       background: rgba(0, 0, 0, 0.8);
//       backdrop-filter: blur(20px);
//       border-right: 1px solid rgba(255, 255, 255, 0.1);
//       z-index: 55;
//       transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//       overflow: hidden;
//       display: flex;
//       flex-direction: column;
//     }
    
//     .thumbnails-panel.open {
//       left: 0;
//     }
    
//     .thumbnails-header {
//       padding: 16px;
//       border-bottom: 1px solid rgba(255, 255, 255, 0.1);
//       display: flex;
//       align-items: center;
//       justify-content: space-between;
//     }
    
//     .thumbnails-header h3 {
//       color: white;
//       font-size: 14px;
//       font-weight: 600;
//     }
    
//     .thumbnails-close {
//       background: none;
//       border: none;
//       color: rgba(255, 255, 255, 0.6);
//       cursor: pointer;
//       font-size: 20px;
//       padding: 4px;
//     }
    
//     .thumbnails-close:hover {
//       color: white;
//     }
    
//     .thumbnails-list {
//       flex: 1;
//       overflow-y: auto;
//       padding: 12px;
//       display: grid;
//       grid-template-columns: repeat(2, 1fr);
//       gap: 12px;
//     }
    
//     .thumbnail {
//       aspect-ratio: ${CANVAS_WIDTH} / ${CANVAS_HEIGHT};
//       background: rgba(255, 255, 255, 0.05);
//       border-radius: 8px;
//       overflow: hidden;
//       cursor: pointer;
//       border: 2px solid transparent;
//       transition: all 0.2s;
//       position: relative;
//     }
    
//     .thumbnail:hover {
//       border-color: rgba(99, 102, 241, 0.5);
//       transform: scale(1.02);
//     }
    
//     .thumbnail.active {
//       border-color: #6366f1;
//       box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
//     }
    
//     .thumbnail img {
//       width: 100%;
//       height: 100%;
//       object-fit: cover;
//     }
    
//     .thumbnail-number {
//       position: absolute;
//       bottom: 4px;
//       right: 4px;
//       background: rgba(0, 0, 0, 0.8);
//       color: white;
//       font-size: 10px;
//       padding: 2px 6px;
//       border-radius: 4px;
//     }
    
//     /* ========== INSTRUCTIONS ========== */
//     .instructions {
//       position: absolute;
//       bottom: 90px;
//       left: 50%;
//       transform: translateX(-50%);
//       background: rgba(0, 0, 0, 0.8);
//       backdrop-filter: blur(10px);
//       color: rgba(255, 255, 255, 0.9);
//       padding: 12px 20px;
//       border-radius: 25px;
//       font-size: 13px;
//       pointer-events: none;
//       opacity: 1;
//       transition: opacity 0.5s ease;
//       border: 1px solid rgba(255, 255, 255, 0.1);
//       display: flex;
//       align-items: center;
//       gap: 16px;
//       z-index: 40;
//     }
    
//     .instructions span {
//       display: flex;
//       align-items: center;
//       gap: 6px;
//     }
    
//     .instructions .divider {
//       height: 16px;
//       width: 1px;
//       background: rgba(255, 255, 255, 0.2);
//     }
    
//     .hide-instructions .instructions {
//       opacity: 0;
//     }
    
//     /* ========== LOADING ========== */
//     .loading {
//       position: fixed;
//       inset: 0;
//       background: rgba(15, 23, 42, 0.95);
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       justify-content: center;
//       z-index: 1000;
//       gap: 24px;
//     }
    
//     .loading-book {
//       width: 80px;
//       height: 60px;
//       position: relative;
//     }
    
//     .loading-book .page {
//       position: absolute;
//       width: 30px;
//       height: 50px;
//       background: linear-gradient(135deg, #6366f1, #8b5cf6);
//       border-radius: 0 4px 4px 0;
//       transform-origin: left center;
//       animation: flipPage 1.5s ease-in-out infinite;
//     }
    
//     .loading-book .page:nth-child(1) { animation-delay: 0s; }
//     .loading-book .page:nth-child(2) { animation-delay: 0.1s; }
//     .loading-book .page:nth-child(3) { animation-delay: 0.2s; }
    
//     @keyframes flipPage {
//       0%, 100% { transform: rotateY(0deg); }
//       50% { transform: rotateY(-180deg); }
//     }
    
//     .loading-text {
//       color: rgba(255, 255, 255, 0.8);
//       font-size: 14px;
//     }
    
//     .loading-progress {
//       width: 200px;
//       height: 4px;
//       background: rgba(255, 255, 255, 0.1);
//       border-radius: 2px;
//       overflow: hidden;
//     }
    
//     .loading-progress-bar {
//       height: 100%;
//       background: linear-gradient(90deg, #6366f1, #8b5cf6);
//       border-radius: 2px;
//       animation: loadingProgress 2s ease-in-out infinite;
//     }
    
//     @keyframes loadingProgress {
//       0% { width: 0%; }
//       50% { width: 70%; }
//       100% { width: 100%; }
//     }
    
//     /* ========== KEYBOARD HINTS ========== */
//     .keyboard-hint {
//       position: fixed;
//       bottom: 90px;
//       right: 20px;
//       background: rgba(0, 0, 0, 0.6);
//       backdrop-filter: blur(10px);
//       padding: 12px 16px;
//       border-radius: 12px;
//       border: 1px solid rgba(255, 255, 255, 0.1);
//       opacity: 0;
//       transform: translateY(10px);
//       transition: all 0.3s;
//       z-index: 40;
//     }
    
//     .keyboard-hint.show {
//       opacity: 1;
//       transform: translateY(0);
//     }
    
//     .keyboard-hint .hint {
//       display: flex;
//       align-items: center;
//       gap: 8px;
//       color: rgba(255, 255, 255, 0.7);
//       font-size: 12px;
//       margin-bottom: 6px;
//     }
    
//     .keyboard-hint .hint:last-child {
//       margin-bottom: 0;
//     }
    
//     .keyboard-hint kbd {
//       background: rgba(255, 255, 255, 0.15);
//       padding: 2px 8px;
//       border-radius: 4px;
//       font-family: inherit;
//       font-size: 11px;
//     }
    
//     /* ========== AUTOPLAY ========== */
//     .autoplay-indicator {
//       position: fixed;
//       top: 80px;
//       right: 20px;
//       background: rgba(99, 102, 241, 0.9);
//       color: white;
//       padding: 8px 16px;
//       border-radius: 20px;
//       font-size: 12px;
//       font-weight: 500;
//       display: flex;
//       align-items: center;
//       gap: 8px;
//       opacity: 0;
//       transform: translateY(-10px);
//       transition: all 0.3s;
//       z-index: 40;
//     }
    
//     .autoplay-indicator.show {
//       opacity: 1;
//       transform: translateY(0);
//     }
    
//     .autoplay-indicator .dot {
//       width: 8px;
//       height: 8px;
//       background: white;
//       border-radius: 50%;
//       animation: pulse 1s ease-in-out infinite;
//     }
    
//     @keyframes pulse {
//       0%, 100% { opacity: 1; }
//       50% { opacity: 0.5; }
//     }
    
//     /* ========== RESPONSIVE ========== */
//     @media (max-width: 768px) {
//       .header {
//         padding: 0 12px;
//         height: 56px;
//       }
      
//       .header-title h1 {
//         font-size: 14px;
//         max-width: 150px;
//       }
      
//       .header-center {
//         display: none;
//       }
      
//       .btn span:not(.icon) {
//         display: none;
//       }
      
//       .footer {
//         height: 64px;
//         gap: 8px;
//       }
      
//       .slider-container {
//         display: none;
//       }
      
//       .nav-arrow {
//         width: 44px;
//         height: 44px;
//         font-size: 18px;
//       }
      
//       .nav-arrow.left { left: 10px; }
//       .nav-arrow.right { right: 10px; }
      
//       .thumbnails-panel {
//         width: 100%;
//         left: -100%;
//       }
      
//       .instructions {
//         font-size: 11px;
//         padding: 8px 12px;
//         gap: 8px;
//       }
//     }
    
//     /* ========== PRINT STYLES ========== */
//     @media print {
//       .header, .footer, .nav-arrow, .instructions, 
//       .thumbnails-toggle, .thumbnails-panel { 
//         display: none !important; 
//       }
      
//       body {
//         background: white;
//       }
      
//       .main-content {
//         padding: 0;
//       }
//     }
//   </style>
// </head>
// <body>
//   <!-- Loading Screen -->
//   <div class="loading" id="loading">
//     <div class="loading-book">
//       <div class="page"></div>
//       <div class="page"></div>
//       <div class="page"></div>
//     </div>
//     <div class="loading-text">Loading flipbook...</div>
//     <div class="loading-progress">
//       <div class="loading-progress-bar"></div>
//     </div>
//   </div>

//   <!-- Header -->
//   <header class="header">
//     <div class="header-left">
//       <div class="logo">📖</div>
//       <div class="header-title">
//         <h1>${pageName}</h1>
//         <div class="meta">
//           <span class="badge">${totalPages} Page${totalPages > 1 ? 's' : ''}</span>
//         </div>
//       </div>
//     </div>
    
//     <div class="header-center">
//       <div class="zoom-controls">
//         <button id="zoomOut" title="Zoom Out (-)">−</button>
//         <span class="zoom-level" id="zoomLevel">100%</span>
//         <button id="zoomIn" title="Zoom In (+)">+</button>
//         <div class="divider"></div>
//         <button id="zoomFit" title="Fit to Screen (0)">⊡</button>
//       </div>
//     </div>
    
//     <div class="header-right">
//       <button class="btn btn-icon" id="autoplayBtn" title="Auto-play (P)">
//         <span class="icon">▶</span>
//       </button>
//       <button class="btn btn-icon" id="keyboardBtn" title="Keyboard Shortcuts (?)">
//         <span class="icon">⌨</span>
//       </button>
//       <button class="btn" id="fullscreenBtn" title="Fullscreen (F)">
//         <span class="icon">⛶</span>
//         <span>Fullscreen</span>
//       </button>
//       <button class="btn btn-danger" onclick="window.close()" title="Close (Esc)">
//         <span class="icon">✕</span>
//         <span>Close</span>
//       </button>
//     </div>
//   </header>

//   <!-- Thumbnails Panel -->
//   <button class="thumbnails-toggle" id="thumbnailsToggle" title="Show Thumbnails (T)">☰</button>
//   <div class="thumbnails-panel" id="thumbnailsPanel">
//     <div class="thumbnails-header">
//       <h3>📄 Pages</h3>
//       <button class="thumbnails-close" id="thumbnailsClose">✕</button>
//     </div>
//     <div class="thumbnails-list" id="thumbnailsList">
//       ${pageImages.map((img, idx) => `
//         <div class="thumbnail" data-page="${idx + 1}">
//           <img src="${img}" alt="Page ${idx + 1}" loading="lazy" />
//           <span class="thumbnail-number">${idx + 1}</span>
//         </div>
//       `).join('')}
//     </div>
//   </div>

//   <!-- Main Content -->
//   <main class="main-content">
//     <button class="nav-arrow left" id="prevArrow" title="Previous Page">❮</button>
    
//     <div class="flipbook-container">
//       <div class="flipbook-wrapper" id="flipbookWrapper">
//         <div id="flipbook">
//           ${pageImages.map((img, idx) => `
//             <div class="page p${idx + 1}" data-page="${idx + 1}">
//               <img src="${img}" alt="Page ${idx + 1}" draggable="false" />
//             </div>
//           `).join('')}
//         </div>
//       </div>
//     </div>
    
//     <button class="nav-arrow right" id="nextArrow" title="Next Page">❯</button>
    
//     <div class="instructions" id="instructions">
//       <span>👆 Drag pages or click corners to flip</span>
//       <div class="divider"></div>
//       <span>⌨️ Arrow keys to navigate</span>
//       <div class="divider"></div>
//       <span>🔍 Scroll to zoom</span>
//     </div>
//   </main>

//   <!-- Footer -->
//   <footer class="footer">
//     <div class="footer-nav">
//       <button class="nav-btn" id="firstBtn" title="First Page (Home)">⏮</button>
//       <button class="nav-btn" id="prevBtn" title="Previous Page (←)">◀</button>
//     </div>
    
//     <div class="page-indicator">
//       <span>Page</span>
//       <input type="number" class="page-input" id="pageInput" value="1" min="1" max="${totalPages}" />
//       <span>of <strong>${totalPages}</strong></span>
//     </div>
    
//     <div class="slider-container">
//       <span style="color: rgba(255,255,255,0.6); font-size: 12px;">1</span>
//       <input type="range" class="page-slider" id="pageSlider" min="1" max="${totalPages}" value="1" />
//       <span style="color: rgba(255,255,255,0.6); font-size: 12px;">${totalPages}</span>
//     </div>
    
//     <div class="footer-nav">
//       <button class="nav-btn" id="nextBtn" title="Next Page (→)">▶</button>
//       <button class="nav-btn" id="lastBtn" title="Last Page (End)">⏭</button>
//     </div>
//   </footer>

//   <!-- Keyboard Hints -->
//   <div class="keyboard-hint" id="keyboardHint">
//     <div class="hint"><kbd>←</kbd> <kbd>→</kbd> Navigate pages</div>
//     <div class="hint"><kbd>Home</kbd> <kbd>End</kbd> First/Last page</div>
//     <div class="hint"><kbd>+</kbd> <kbd>-</kbd> Zoom in/out</div>
//     <div class="hint"><kbd>F</kbd> Fullscreen</div>
//     <div class="hint"><kbd>P</kbd> Auto-play</div>
//     <div class="hint"><kbd>T</kbd> Thumbnails</div>
//   </div>

//   <!-- Autoplay Indicator -->
//   <div class="autoplay-indicator" id="autoplayIndicator">
//     <div class="dot"></div>
//     <span>Auto-playing...</span>
//   </div>

//   <script>
//     $(document).ready(function() {
//       // ========== CONFIGURATION ==========
//       const totalPages = ${totalPages};
//       const pageWidth = ${CANVAS_WIDTH};
//       const pageHeight = ${CANVAS_HEIGHT};
      
//       let currentZoom = 1;
//       let autoplayInterval = null;
//       let autoplaySpeed = 3000;
//       let isAutoPlaying = false;
      
//       // ========== CALCULATE OPTIMAL SIZE ==========
//       function calculateOptimalSize() {
//         const viewportWidth = window.innerWidth - 180;
//         const viewportHeight = window.innerHeight - 200;
//         const ratio = pageWidth / pageHeight;
        
//         let displayHeight = viewportHeight;
//         let displayWidth = displayHeight * ratio;
        
//         const doubleWidth = displayWidth * 2;
//         if (doubleWidth > viewportWidth) {
//           displayWidth = viewportWidth / 2;
//           displayHeight = displayWidth / ratio;
//         }
        
//         return { width: Math.floor(displayWidth), height: Math.floor(displayHeight) };
//       }
      
//       const size = calculateOptimalSize();
      
//       // ========== INITIALIZE TURN.JS ==========
//       $('#flipbook').turn({
//         width: size.width * 2,
//         height: size.height,
//         autoCenter: true,
//         display: totalPages === 1 ? 'single' : 'double',
//         acceleration: true,
//         elevation: 50,
//         gradients: true,
//         duration: 1000,
//         when: {
//           turning: function(event, page, view) {
//             updateUI(page);
//             playFlipSound();
//           },
//           turned: function(event, page, view) {
//             updateUI(page);
//             updateThumbnails(page);
//           },
//           start: function(event, pageObject, corner) {
//             // Add visual feedback
//             $(this).addClass('turning');
//           },
//           end: function(event, pageObject) {
//             $(this).removeClass('turning');
//           }
//         }
//       });
      
//       // ========== UI UPDATE FUNCTIONS ==========
//       function updateUI(page) {
//         // Update page input
//         $('#pageInput').val(page);
        
//         // Update slider
//         $('#pageSlider').val(page);
        
//         // Update button states
//         const isFirst = page <= 1;
//         const isLast = page >= totalPages;
        
//         $('#prevBtn, #prevArrow, #firstBtn').prop('disabled', isFirst);
//         $('#nextBtn, #nextArrow, #lastBtn').prop('disabled', isLast);
        
//         // Stop autoplay at last page
//         if (isLast && isAutoPlaying) {
//           stopAutoplay();
//         }
//       }
      
//       function updateThumbnails(page) {
//         $('.thumbnail').removeClass('active');
//         $('.thumbnail[data-page="' + page + '"]').addClass('active');
        
//         // Scroll thumbnail into view
//         const activeThumb = $('.thumbnail.active');
//         if (activeThumb.length) {
//           activeThumb[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
//         }
//       }
      
//       // ========== NAVIGATION ==========
//       function goToPage(page) {
//         page = Math.max(1, Math.min(totalPages, parseInt(page) || 1));
//         $('#flipbook').turn('page', page);
//       }
      
//       function nextPage() {
//         $('#flipbook').turn('next');
//       }
      
//       function prevPage() {
//         $('#flipbook').turn('previous');
//       }
      
//       // Navigation buttons
//       $('#prevBtn, #prevArrow').click(prevPage);
//       $('#nextBtn, #nextArrow').click(nextPage);
//       $('#firstBtn').click(() => goToPage(1));
//       $('#lastBtn').click(() => goToPage(totalPages));
      
//       // Thumbnail clicks
//       $('.thumbnail').click(function() {
//         goToPage($(this).data('page'));
//       });
      
//       // Page input
//       $('#pageInput').on('change', function() {
//         goToPage($(this).val());
//       }).on('keydown', function(e) {
//         if (e.key === 'Enter') {
//           $(this).blur();
//           goToPage($(this).val());
//         }
//       });
      
//       // Page slider
//       $('#pageSlider').on('input', function() {
//         goToPage($(this).val());
//       });
      
//       // ========== ZOOM CONTROLS ==========
//       function setZoom(zoom) {
//         currentZoom = Math.max(0.5, Math.min(3, zoom));
//         $('#flipbookWrapper').css('transform', 'scale(' + currentZoom + ')');
//         $('#zoomLevel').text(Math.round(currentZoom * 100) + '%');
//       }
      
//       function zoomIn() { setZoom(currentZoom + 0.1); }
//       function zoomOut() { setZoom(currentZoom - 0.1); }
//       function zoomReset() { setZoom(1); }
      
//       $('#zoomIn').click(zoomIn);
//       $('#zoomOut').click(zoomOut);
//       $('#zoomFit').click(zoomReset);
      
//       // Mouse wheel zoom
//       $('.main-content').on('wheel', function(e) {
//         if (e.ctrlKey || e.metaKey) {
//           e.preventDefault();
//           if (e.originalEvent.deltaY < 0) {
//             zoomIn();
//           } else {
//             zoomOut();
//           }
//         }
//       });
      
//       // ========== AUTOPLAY ==========
//       function startAutoplay() {
//         if (isAutoPlaying) return;
        
//         isAutoPlaying = true;
//         $('#autoplayBtn .icon').text('⏸');
//         $('#autoplayIndicator').addClass('show');
        
//         autoplayInterval = setInterval(function() {
//           const currentPage = $('#flipbook').turn('page');
//           if (currentPage >= totalPages) {
//             stopAutoplay();
//           } else {
//             nextPage();
//           }
//         }, autoplaySpeed);
//       }
      
//       function stopAutoplay() {
//         isAutoPlaying = false;
//         $('#autoplayBtn .icon').text('▶');
//         $('#autoplayIndicator').removeClass('show');
        
//         if (autoplayInterval) {
//           clearInterval(autoplayInterval);
//           autoplayInterval = null;
//         }
//       }
      
//       function toggleAutoplay() {
//         if (isAutoPlaying) {
//           stopAutoplay();
//         } else {
//           startAutoplay();
//         }
//       }
      
//       $('#autoplayBtn').click(toggleAutoplay);
      
//       // ========== THUMBNAILS PANEL ==========
//       function toggleThumbnails() {
//         $('#thumbnailsPanel').toggleClass('open');
//       }
      
//       $('#thumbnailsToggle').click(toggleThumbnails);
//       $('#thumbnailsClose').click(() => $('#thumbnailsPanel').removeClass('open'));
      
//       // ========== KEYBOARD HINTS ==========
//       let keyboardHintTimeout;
      
//       function showKeyboardHints() {
//         $('#keyboardHint').addClass('show');
//         clearTimeout(keyboardHintTimeout);
//         keyboardHintTimeout = setTimeout(() => {
//           $('#keyboardHint').removeClass('show');
//         }, 5000);
//       }
      
//       $('#keyboardBtn').click(showKeyboardHints);
      
//       // ========== FULLSCREEN ==========
//       function toggleFullscreen() {
//         if (document.fullscreenElement) {
//           document.exitFullscreen();
//         } else {
//           document.documentElement.requestFullscreen();
//         }
//       }
      
//       $('#fullscreenBtn').click(toggleFullscreen);
      
//       // ========== KEYBOARD SHORTCUTS ==========
//       $(document).keydown(function(e) {
//         // Don't handle if typing in input
//         if (e.target.tagName === 'INPUT') return;
        
//         switch(e.keyCode) {
//           case 37: // Left arrow
//             prevPage();
//             e.preventDefault();
//             break;
//           case 39: // Right arrow
//             nextPage();
//             e.preventDefault();
//             break;
//           case 36: // Home
//             goToPage(1);
//             e.preventDefault();
//             break;
//           case 35: // End
//             goToPage(totalPages);
//             e.preventDefault();
//             break;
//           case 187: // + (Plus)
//           case 107: // Numpad +
//             zoomIn();
//             e.preventDefault();
//             break;
//           case 189: // - (Minus)
//           case 109: // Numpad -
//             zoomOut();
//             e.preventDefault();
//             break;
//           case 48: // 0
//           case 96: // Numpad 0
//             zoomReset();
//             e.preventDefault();
//             break;
//           case 70: // F
//             toggleFullscreen();
//             e.preventDefault();
//             break;
//           case 80: // P
//             toggleAutoplay();
//             e.preventDefault();
//             break;
//           case 84: // T
//             toggleThumbnails();
//             e.preventDefault();
//             break;
//           case 27: // Escape
//             if (document.fullscreenElement) {
//               document.exitFullscreen();
//             }
//             stopAutoplay();
//             $('#thumbnailsPanel').removeClass('open');
//             break;
//           case 191: // ?
//             showKeyboardHints();
//             e.preventDefault();
//             break;
//         }
//       });
      
//       // ========== TOUCH SUPPORT ==========
//       let touchStartX = 0;
//       let touchStartY = 0;
      
//       $('#flipbook').on('touchstart', function(e) {
//         touchStartX = e.originalEvent.touches[0].clientX;
//         touchStartY = e.originalEvent.touches[0].clientY;
//       });
      
//       $('#flipbook').on('touchend', function(e) {
//         const touchEndX = e.originalEvent.changedTouches[0].clientX;
//         const touchEndY = e.originalEvent.changedTouches[0].clientY;
//         const diffX = touchEndX - touchStartX;
//         const diffY = touchEndY - touchStartY;
        
//         // Only handle horizontal swipes
//         if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
//           if (diffX > 0) {
//             prevPage();
//           } else {
//             nextPage();
//           }
//         }
//       });
      
//       // ========== SOUND EFFECTS (OPTIONAL) ==========
//       function playFlipSound() {
//         // Uncomment to enable flip sound
//         /*
//         const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10...');
//         audio.volume = 0.3;
//         audio.play().catch(() => {});
//         */
//       }
      
//       // ========== RESIZE HANDLER ==========
//       let resizeTimeout;
//       $(window).resize(function() {
//         clearTimeout(resizeTimeout);
//         resizeTimeout = setTimeout(function() {
//           const newSize = calculateOptimalSize();
//           $('#flipbook').turn('size', newSize.width * 2, newSize.height);
//         }, 250);
//       });
      
//       // ========== PRELOAD IMAGES ==========
//       function preloadImages() {
//         let loadedCount = 0;
//         const images = $('#flipbook img');
//         const total = images.length;
        
//         images.each(function() {
//           const img = new Image();
//           img.onload = img.onerror = function() {
//             loadedCount++;
//             if (loadedCount >= total) {
//               finishLoading();
//             }
//           };
//           img.src = $(this).attr('src');
//         });
        
//         // Fallback timeout
//         setTimeout(finishLoading, 5000);
//       }
      
//       function finishLoading() {
//         $('#loading').fadeOut(600, function() {
//           $(this).remove();
//         });
        
//         // Show instructions briefly
//         setTimeout(function() {
//           $('body').addClass('hide-instructions');
//         }, 5000);
//       }
      
//       // ========== INITIALIZATION ==========
//       updateUI(1);
//       updateThumbnails(1);
//       preloadImages();
      
//       // Prevent context menu on images
//       $('#flipbook').on('contextmenu', 'img', function(e) {
//         e.preventDefault();
//       });
      
//       // Double-click to zoom
//       $('#flipbook').on('dblclick', function() {
//         if (currentZoom === 1) {
//           setZoom(1.5);
//         } else {
//           setZoom(1);
//         }
//       });
//     });
//   <\/script>
// </body>
// </html>`;

//   // Open preview window
//   const previewWindow = window.open('', '_blank', 'width=1400,height=900');
//   if (previewWindow) {
//     previewWindow.document.write(previewHTML);
//     previewWindow.document.close();
//   } else {
//     // Fallback for popup blockers
//     const blob = new Blob([previewHTML], { type: 'text/html' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.target = '_blank';
//     a.click();
//     URL.revokeObjectURL(url);
//   }
// }, [pageName, CANVAS_WIDTH, CANVAS_HEIGHT]);

//   // ==================== SELECT ALL ====================
//   const selectAll = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     const objects = canvas.getObjects().filter(obj => 
//       !obj.isGrid && !obj.excludeFromExport && !obj.isGuideline
//     );

//     if (objects.length === 0) return;

//     canvas.discardActiveObject();
    
//     if (objects.length === 1) {
//       canvas.setActiveObject(objects[0]);
//     } else {
//       const selection = new fabric.ActiveSelection(objects, { canvas });
//       canvas.setActiveObject(selection);
//     }
    
//     canvas.renderAll();
//   }, []);

//   // ==================== COPY/PASTE ====================
//   const clipboardRef = useRef(null);

//   const copySelected = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     const obj = canvas?.getActiveObject();
//     if (!obj) return;

//     obj.clone((cloned) => {
//       clipboardRef.current = cloned;
//     });
//   }, []);

//   const paste = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas || !clipboardRef.current) return;

//     clipboardRef.current.clone((cloned) => {
//       canvas.discardActiveObject();
      
//       cloned.set({
//         left: (cloned.left || 0) + 20,
//         top: (cloned.top || 0) + 20,
//         evented: true,
//         selectable: true,
//         id: `paste_${Date.now()}`,
//       });

//       if (cloned.type === 'activeSelection') {
//         cloned.canvas = canvas;
//         cloned.forEachObject((obj) => {
//           canvas.add(obj);
//         });
//         cloned.setCoords();
//       } else {
//         canvas.add(cloned);
//       }

//       clipboardRef.current.set({
//         left: (clipboardRef.current.left || 0) + 20,
//         top: (clipboardRef.current.top || 0) + 20,
//       });

//       canvas.setActiveObject(cloned);
//       canvas.renderAll();
//       saveToHistory();
//     });
//   }, [saveToHistory]);

//   // TemplateEditor.jsx - Part 3 of 3
// // Keyboard Shortcuts, Complete UI Render, All Components

// // ==================== CONTINUE FROM PART 2 ====================
// // Add these after all the functions from Part 2, still inside the TemplateEditor component

//   // ==================== KEYBOARD SHORTCUTS ====================
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       // Skip if typing in input/textarea
//       if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

//       const canvas = fabricCanvasRef.current;
//       if (!canvas) return;

//       // Delete/Backspace - Delete selected
//       if (e.key === 'Delete' || e.key === 'Backspace') {
//         if (activeObject) {
//           e.preventDefault();
//           deleteSelected();
//         }
//       }

//       // Escape - Deselect
//       if (e.key === 'Escape') {
//         canvas.discardActiveObject();
//         canvas.renderAll();
//         setActiveObject(null);
//         resetProperties();
//         clearGuidelines();
//       }

//       // Ctrl/Cmd shortcuts
//       if (e.ctrlKey || e.metaKey) {
//         switch (e.key.toLowerCase()) {
//           case 'z':
//             e.preventDefault();
//             if (e.shiftKey) {
//               redo();
//             } else {
//               undo();
//             }
//             break;

//           case 'y':
//             e.preventDefault();
//             redo();
//             break;

//           case 'd':
//             e.preventDefault();
//             if (activeObject) {
//               duplicateSelected();
//             }
//             break;

//           case 'c':
//             e.preventDefault();
//             if (activeObject) {
//               copySelected();
//             }
//             break;

//           case 'v':
//             e.preventDefault();
//             paste();
//             break;

//           case 'x':
//             e.preventDefault();
//             if (activeObject) {
//               copySelected();
//               deleteSelected();
//             }
//             break;

//           case 's':
//             e.preventDefault();
//             saveCurrentPage();
//             break;

//           case 'a':
//             e.preventDefault();
//             selectAll();
//             break;

//           case 'g':
//             e.preventDefault();
//             setShowGrid(prev => !prev);
//             break;

//           case '0':
//             e.preventDefault();
//             fitToScreen();
//             break;

//           case '=':
//           case '+':
//             e.preventDefault();
//             handleZoom(zoom + 10);
//             break;

//           case '-':
//             e.preventDefault();
//             handleZoom(zoom - 10);
//             break;
//         }
//       }

//       // Arrow keys - Move object
//       if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
//         const obj = canvas.getActiveObject();
//         if (obj && !obj.isGrid) {
//           e.preventDefault();
//           const step = e.shiftKey ? 10 : 1;
          
//           switch (e.key) {
//             case 'ArrowUp':
//               obj.set('top', (obj.top || 0) - step);
//               break;
//             case 'ArrowDown':
//               obj.set('top', (obj.top || 0) + step);
//               break;
//             case 'ArrowLeft':
//               obj.set('left', (obj.left || 0) - step);
//               break;
//             case 'ArrowRight':
//               obj.set('left', (obj.left || 0) + step);
//               break;
//           }
          
//           obj.setCoords();
//           canvas.renderAll();
//           updatePropertiesFromObject(obj);
//         }
//       }

//       // Layer shortcuts
//       if (activeObject) {
//         if (e.key === '[' && (e.ctrlKey || e.metaKey)) {
//           e.preventDefault();
//           if (e.shiftKey) {
//             sendToBack();
//           } else {
//             sendBackward();
//           }
//         }
//         if (e.key === ']' && (e.ctrlKey || e.metaKey)) {
//           e.preventDefault();
//           if (e.shiftKey) {
//             bringToFront();
//           } else {
//             bringForward();
//           }
//         }
//       }

//       // Page navigation
//       if (e.key === 'PageDown' && (e.ctrlKey || e.metaKey)) {
//         e.preventDefault();
//         if (currentPage < pages.length - 1) {
//           switchToPage(currentPage + 1);
//         }
//       }
//       if (e.key === 'PageUp' && (e.ctrlKey || e.metaKey)) {
//         e.preventDefault();
//         if (currentPage > 0) {
//           switchToPage(currentPage - 1);
//         }
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [
//     activeObject, zoom, currentPage, pages,
//     deleteSelected, duplicateSelected, undo, redo,
//     saveCurrentPage, selectAll, copySelected, paste,
//     updatePropertiesFromObject, bringForward, sendBackward,
//     bringToFront, sendToBack, switchToPage, fitToScreen,
//     handleZoom, resetProperties, clearGuidelines
//   ]);

//   // ==================== TOGGLE SIDEBAR SECTION ====================
//   const toggleSidebarSection = useCallback((section) => {
//     setRightSidebarOpen(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   }, []);

//   // ==================== RENDER ====================
//   return (
//     <div className="flex h-screen bg-gray-100 font-sans text-gray-700 overflow-hidden">

//       {/* ================ LEFT SIDEBAR (Pages) ================ */}
//       <aside className="w-56 bg-slate-800 flex flex-col flex-shrink-0">
//         {/* Header */}
//         <div className="p-4 border-b border-slate-700 flex items-center justify-between">
//           <h2 className="text-lg font-semibold text-white">Pages</h2>
//           <div className="flex gap-1">
//             <button
//               onClick={duplicatePage}
//               className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
//               title="Duplicate Page (Ctrl+Shift+D)"
//             >
//               <Copy size={14} />
//             </button>
//             <button
//               onClick={addNewPage}
//               className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
//               title="Add Page"
//             >
//               <Plus size={16} />
//             </button>
//           </div>
//         </div>

//         {/* Pages List */}
//         <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
//           {pages.map((page, idx) => (
//             <div
//               key={page.id}
//               onClick={() => switchToPage(idx)}
//               className={`group relative rounded-lg overflow-hidden cursor-pointer transition-all
//                 ${currentPage === idx
//                   ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-800'
//                   : 'hover:ring-2 hover:ring-slate-500'}`}
//             >
//               {/* Thumbnail */}
//               <div className="aspect-[1/1.414] bg-white relative">
//                 {page.thumbnail ? (
//                   <img
//                     src={page.thumbnail}
//                     alt={page.name}
//                     className="w-full h-full object-contain"
//                     draggable={false}
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
//                     <Square size={24} />
//                   </div>
//                 )}

//                 {/* Page number badge */}
//                 <div className="absolute top-1.5 left-1.5 bg-indigo-600 text-white text-[10px] w-5 h-5 rounded flex items-center justify-center font-bold shadow">
//                   {idx + 1}
//                 </div>

//                 {/* Delete button */}
//                 {pages.length > 1 && (
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       deletePage(idx);
//                     }}
//                     className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
//                     title="Delete Page"
//                   >
//                     <X size={10} />
//                   </button>
//                 )}
//               </div>

//               {/* Page name */}
//               <div className={`py-2 px-2 text-center text-xs truncate transition-colors
//                 ${currentPage === idx ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
//                 {page.name}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Add Page Button */}
//         <div className="p-3 border-t border-slate-700">
//           <button
//             onClick={addNewPage}
//             className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
//           >
//             <Plus size={16} /> Add Page
//           </button>
//         </div>
//       </aside>

//       {/* ================ CENTER AREA ================ */}
//       <main className="flex-1 flex flex-col min-w-0">

//         {/* Top Header/Toolbar */}
//         <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-10 flex-shrink-0">
          
//           {/* Left - Document Name */}
//           <div className="flex items-center gap-3">
//             {isEditingPageName ? (
//               <input
//                 type="text"
//                 value={pageName}
//                 onChange={(e) => setPageName(e.target.value)}
//                 onBlur={() => setIsEditingPageName(false)}
//                 onKeyDown={(e) => e.key === 'Enter' && setIsEditingPageName(false)}
//                 className="text-sm text-gray-700 border border-indigo-500 rounded px-2 py-1 focus:outline-none w-48"
//                 autoFocus
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <span className="text-sm font-medium text-gray-700">{pageName}</span>
//                 <button
//                   onClick={() => setIsEditingPageName(true)}
//                   className="text-gray-400 hover:text-indigo-600 text-sm"
//                   title="Rename"
//                 >
//                   ✎
//                 </button>
//               </div>
//             )}
//             <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
//               {CANVAS_WIDTH} × {CANVAS_HEIGHT}px
//             </span>
//           </div>

//           {/* Center - Tools */}
//           <div className="flex items-center gap-1">
//             {/* Undo/Redo */}
//             <button
//               onClick={undo}
//               disabled={!canUndo}
//               className="p-2 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//               title="Undo (Ctrl+Z)"
//             >
//               <Undo size={18} />
//             </button>
//             <button
//               onClick={redo}
//               disabled={!canRedo}
//               className="p-2 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//               title="Redo (Ctrl+Y)"
//             >
//               <Redo size={18} />
//             </button>

//             <div className="w-px h-6 bg-gray-200 mx-2" />

//             {/* Grid & Snap */}
//             <button
//               onClick={() => setShowGrid(!showGrid)}
//               className={`p-2 rounded transition-colors ${showGrid ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}
//               title="Toggle Grid (Ctrl+G)"
//             >
//               <Grid size={18} />
//             </button>
//             <button
//               onClick={() => setSnapToGrid(!snapToGrid)}
//               className={`p-2 rounded transition-colors ${snapToGrid ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}
//               title="Snap to Grid"
//             >
//               <Magnet size={18} />
//             </button>

//             <div className="w-px h-6 bg-gray-200 mx-2" />

//             {/* Zoom Controls - IN TOOLBAR */}
//             <button
//               onClick={() => handleZoom(zoom - 10)}
//               disabled={zoom <= 25}
//               className="p-2 hover:bg-gray-100 rounded disabled:opacity-40 transition-colors"
//               title="Zoom Out (Ctrl+-)"
//             >
//               <ZoomOut size={18} />
//             </button>
            
//             <div className="flex items-center bg-gray-100 rounded px-2">
//               <input
//                 type="range"
//                 min="25"
//                 max="200"
//                 value={zoom}
//                 onChange={(e) => handleZoom(parseInt(e.target.value))}
//                 className="w-20 h-1 accent-indigo-600 cursor-pointer"
//               />
//               <span className="text-xs font-medium w-12 text-center text-gray-600">{zoom}%</span>
//             </div>
            
//             <button
//               onClick={() => handleZoom(zoom + 10)}
//               disabled={zoom >= 200}
//               className="p-2 hover:bg-gray-100 rounded disabled:opacity-40 transition-colors"
//               title="Zoom In (Ctrl++)"
//             >
//               <ZoomIn size={18} />
//             </button>
            
//             <button
//               onClick={fitToScreen}
//               className="p-2 hover:bg-gray-100 rounded transition-colors"
//               title="Fit to Screen (Ctrl+0)"
//             >
//               <Maximize size={18} />
//             </button>

//             <div className="w-px h-6 bg-gray-200 mx-2" />

//             {/* Rotation */}
//             <button
//               onClick={() => handleCanvasRotation(rotation - 90)}
//               className="p-2 hover:bg-gray-100 rounded transition-colors"
//               title="Rotate Left"
//             >
//               <RotateCw size={18} className="scale-x-[-1]" />
//             </button>
//             <span className="text-xs text-gray-500 w-10 text-center">{rotation}°</span>
//             <button
//               onClick={() => handleCanvasRotation(rotation + 90)}
//               className="p-2 hover:bg-gray-100 rounded transition-colors"
//               title="Rotate Right"
//             >
//               <RotateCw size={18} />
//             </button>
//           </div>

//           {/* Right - Actions */}
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => exportCanvas('png')}
//               className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1.5 transition-colors"
//               title="Export PNG"
//             >
//               <Download size={16} /> Export
//             </button>
//             <button
//               onClick={openPreview}
//               disabled={isLoading}
//               className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
//             >
//               {isLoading ? (
//                 <>
//                   <RefreshCw size={16} className="animate-spin" />
//                   {loadingMessage || 'Loading...'}
//                 </>
//               ) : (
//                 <>
//                   <Eye size={16} /> Preview
//                   <ExternalLink size={14} />
//                 </>
//               )}
//             </button>
//           </div>
//         </header>

//         {/* Canvas Workspace */}
//         <div
//           ref={wrapperRef}
//           className="flex-1 overflow-auto bg-slate-200 flex flex-col items-center py-6 relative"
//         >

//           {/* Floating Action Bar */}
//           <div className="bg-white rounded-xl shadow-lg px-3 py-2 mb-4 flex items-center gap-1 text-xs font-medium text-gray-600 flex-shrink-0 z-10">
//             <button
//               onClick={() => setShowTemplateModal(true)}
//               className="flex items-center gap-1.5 hover:bg-gray-100 transition-colors px-3 py-2 rounded-lg"
//             >
//               <Plus size={14} /> Template
//             </button>
            
//             <div className="w-px h-6 bg-gray-200" />
            
//             <button
//               onClick={() => addText()}
//               className="flex items-center gap-1.5 hover:bg-gray-100 transition-colors px-3 py-2 rounded-lg"
//               title="Add Text"
//             >
//               <Type size={14} /> Text
//             </button>
            
//             <div className="w-px h-6 bg-gray-200" />
            
//             <button
//               onClick={() => addShape('rect')}
//               className="flex items-center gap-1.5 hover:bg-gray-100 transition-colors px-2 py-2 rounded-lg"
//               title="Rectangle"
//             >
//               <Square size={14} />
//             </button>
//             <button
//               onClick={() => addShape('circle')}
//               className="flex items-center gap-1.5 hover:bg-gray-100 transition-colors px-2 py-2 rounded-lg"
//               title="Circle"
//             >
//               <Circle size={14} />
//             </button>
//             <button
//               onClick={() => addShape('triangle')}
//               className="flex items-center gap-1.5 hover:bg-gray-100 transition-colors px-2 py-2 rounded-lg"
//               title="Triangle"
//             >
//               <Triangle size={14} />
//             </button>
//             <button
//               onClick={() => addShape('line')}
//               className="flex items-center gap-1.5 hover:bg-gray-100 transition-colors px-2 py-2 rounded-lg"
//               title="Line"
//             >
//               <Minus size={14} />
//             </button>
            
//             <div className="w-px h-6 bg-gray-200" />
            
//             <label className="flex items-center gap-1.5 hover:bg-gray-100 transition-colors px-3 py-2 rounded-lg cursor-pointer">
//               <ImageIcon size={14} /> Image
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={addImage}
//                 className="hidden"
//               />
//             </label>
            
//             <div className="w-px h-6 bg-gray-200" />
            
//             <button
//               onClick={duplicateSelected}
//               disabled={!activeObject}
//               className="flex items-center gap-1.5 hover:bg-gray-100 transition-colors px-2 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
//               title="Duplicate (Ctrl+D)"
//             >
//               <Copy size={14} />
//             </button>
//             <button
//               onClick={deleteSelected}
//               disabled={!activeObject}
//               className="flex items-center gap-1.5 hover:bg-red-50 hover:text-red-500 transition-colors px-2 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
//               title="Delete"
//             >
//               <Trash2 size={14} />
//             </button>
            
//             <div className="w-px h-6 bg-gray-200" />
            
//             <button
//               onClick={clearCanvas}
//               className="flex items-center gap-1.5 hover:bg-orange-50 hover:text-orange-500 transition-colors px-3 py-2 rounded-lg"
//               title="Clear Canvas"
//             >
//               <X size={14} /> Clear
//             </button>
//           </div>

//           {/* Layer Controls - Bottom Left (shown when object selected) */}
//           {activeObject && (
//             <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-1.5 flex items-center gap-1 z-10">
//               <span className="text-xs text-gray-500 px-2">Layer:</span>
//               <button
//                 onClick={sendToBack}
//                 className="p-1.5 hover:bg-gray-100 rounded text-gray-600 flex items-center"
//                 title="Send to Back (Ctrl+Shift+[)"
//               >
//                 <ChevronDown size={14} />
//                 <ChevronDown size={14} className="-ml-2" />
//               </button>
//               <button
//                 onClick={sendBackward}
//                 className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
//                 title="Send Backward (Ctrl+[)"
//               >
//                 <ChevronDown size={14} />
//               </button>
//               <button
//                 onClick={bringForward}
//                 className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
//                 title="Bring Forward (Ctrl+])"
//               >
//                 <ChevronUp size={14} />
//               </button>
//               <button
//                 onClick={bringToFront}
//                 className="p-1.5 hover:bg-gray-100 rounded text-gray-600 flex items-center"
//                 title="Bring to Front (Ctrl+Shift+])"
//               >
//                 <ChevronUp size={14} />
//                 <ChevronUp size={14} className="-ml-2" />
//               </button>
//             </div>
//           )}

//           {/* Canvas Container */}
//           <div
//             ref={canvasContainerRef}
//             className="bg-white shadow-2xl relative flex-shrink-0"
//             style={{
//               width: CANVAS_WIDTH * (zoom / 100),
//               height: CANVAS_HEIGHT * (zoom / 100),
//               transform: `rotate(${rotation}deg)`,
//               transformOrigin: 'center center',
//             }}
//           >
//             <canvas ref={canvasRef} />

//             {/* Loading Overlay */}
//             {isLoading && (
//               <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20 rounded">
//                 <div className="flex flex-col items-center gap-3">
//                   <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
//                   <span className="text-sm text-gray-600">{loadingMessage || 'Loading...'}</span>
//                 </div>
//               </div>
//             )}

//             {/* Page indicator */}
//             <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
//               {currentPage + 1} / {pages.length}
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* ================ RIGHT SIDEBAR (Properties) ================ */}
//       <aside className="w-72 bg-white border-l border-gray-200 overflow-y-auto custom-scrollbar flex flex-col flex-shrink-0">

//         {/* Selected Object Info */}
//         {activeObject ? (
//           <div className="p-3 bg-indigo-50 border-b border-indigo-100">
//             <div className="flex items-center justify-between">
//               <span className="text-sm font-medium text-indigo-700 capitalize">
//                 {activeObject.type?.replace('i-text', 'Text').replace('rect', 'Rectangle')}
//               </span>
//               <div className="flex gap-1">
//                 <button
//                   onClick={duplicateSelected}
//                   className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded"
//                   title="Duplicate"
//                 >
//                   <Copy size={14} />
//                 </button>
//                 <button
//                   onClick={deleteSelected}
//                   className="p-1.5 text-red-500 hover:bg-red-100 rounded"
//                   title="Delete"
//                 >
//                   <Trash2 size={14} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="p-4 text-center text-gray-400 border-b border-gray-100">
//             <MousePointer2 size={28} className="mx-auto mb-2 opacity-40" />
//             <p className="text-xs">Select an object to edit</p>
//           </div>
//         )}

//         {/* ==================== DIMENSION SECTION ==================== */}
//         <div className="border-b border-gray-100">
//           <button
//             onClick={() => toggleSidebarSection('dimension')}
//             className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-sm"
//           >
//             <span className="font-medium text-gray-700">Position & Size</span>
//             {rightSidebarOpen.dimension ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
//           </button>

//           {rightSidebarOpen.dimension && (
//             <div className="px-3 pb-3 space-y-3">
//               {/* Position */}
//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="text-[10px] text-gray-400 uppercase mb-1 block">X</label>
//                   <input
//                     type="number"
//                     value={properties.left}
//                     onChange={(e) => updateProperty('left', parseInt(e.target.value) || 0)}
//                     className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
//                     disabled={!activeObject}
//                   />
//                 </div>
//                 <div>
//                   <label className="text-[10px] text-gray-400 uppercase mb-1 block">Y</label>
//                   <input
//                     type="number"
//                     value={properties.top}
//                     onChange={(e) => updateProperty('top', parseInt(e.target.value) || 0)}
//                     className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
//                     disabled={!activeObject}
//                   />
//                 </div>
//               </div>

//               {/* Size */}
//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="text-[10px] text-gray-400 uppercase mb-1 block">Width</label>
//                   <input
//                     type="number"
//                     value={properties.width}
//                     onChange={(e) => updateProperty('width', parseInt(e.target.value) || 0)}
//                     className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
//                     disabled={!activeObject}
//                   />
//                 </div>
//                 <div>
//                   <label className="text-[10px] text-gray-400 uppercase mb-1 block">Height</label>
//                   <input
//                     type="number"
//                     value={properties.height}
//                     onChange={(e) => updateProperty('height', parseInt(e.target.value) || 0)}
//                     className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
//                     disabled={!activeObject}
//                   />
//                 </div>
//               </div>

//               {/* Rotation & Opacity */}
//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="text-[10px] text-gray-400 uppercase mb-1 block">Rotation</label>
//                   <div className="flex">
//                     <input
//                       type="number"
//                       value={properties.angle}
//                       onChange={(e) => updateProperty('angle', parseInt(e.target.value) || 0)}
//                       className="w-full border border-gray-200 rounded-l px-2 py-1.5 text-sm focus:border-indigo-500 outline-none"
//                       disabled={!activeObject}
//                     />
//                     <span className="bg-gray-100 border border-l-0 border-gray-200 rounded-r px-2 py-1.5 text-xs text-gray-400">°</span>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="text-[10px] text-gray-400 uppercase mb-1 block">Opacity</label>
//                   <div className="flex">
//                     <input
//                       type="number"
//                       min="0"
//                       max="100"
//                       value={properties.fillOpacity}
//                       onChange={(e) => updateProperty('fillOpacity', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
//                       className="w-full border border-gray-200 rounded-l px-2 py-1.5 text-sm focus:border-indigo-500 outline-none"
//                       disabled={!activeObject}
//                     />
//                     <span className="bg-gray-100 border border-l-0 border-gray-200 rounded-r px-2 py-1.5 text-xs text-gray-400">%</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Quick Align */}
//               <div>
//                 <label className="text-[10px] text-gray-400 uppercase mb-1.5 block">Alignment</label>
//                 <div className="flex gap-1">
//                   {[
//                     { align: 'left', icon: <AlignLeft size={14} />, title: 'Align Left' },
//                     { align: 'center', icon: <AlignCenter size={14} />, title: 'Align Center' },
//                     { align: 'right', icon: <AlignRight size={14} />, title: 'Align Right' },
//                   ].map(({ align, icon, title }) => (
//                     <button
//                       key={align}
//                       onClick={() => alignObject(align)}
//                       disabled={!activeObject}
//                       className="flex-1 p-1.5 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed flex justify-center transition-colors"
//                       title={title}
//                     >
//                       {icon}
//                     </button>
//                   ))}
//                   <div className="w-px bg-gray-200 mx-0.5" />
//                   {[
//                     { align: 'top', icon: <ChevronUp size={14} />, title: 'Align Top' },
//                     { align: 'middle', icon: <Minus size={14} />, title: 'Align Middle' },
//                     { align: 'bottom', icon: <ChevronDown size={14} />, title: 'Align Bottom' },
//                   ].map(({ align, icon, title }) => (
//                     <button
//                       key={align}
//                       onClick={() => alignObject(align)}
//                       disabled={!activeObject}
//                       className="flex-1 p-1.5 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed flex justify-center transition-colors"
//                       title={title}
//                     >
//                       {icon}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* ==================== TEXT CONTENT SECTION ==================== */}
//         {isTextObject && (
//           <div className="border-b border-gray-100">
//             <button
//               onClick={() => toggleSidebarSection('text')}
//               className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-sm"
//             >
//               <div className="flex items-center gap-2">
//                 <Type size={14} className="text-gray-400" />
//                 <span className="font-medium text-gray-700">Text Content</span>
//               </div>
//               {rightSidebarOpen.text ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
//             </button>

//             {rightSidebarOpen.text && (
//               <div className="px-3 pb-3">
//                 <textarea
//                   className="w-full h-24 p-2 border border-gray-200 rounded text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
//                   value={properties.text}
//                   onChange={(e) => updateProperty('text', e.target.value)}
//                   placeholder="Enter text..."
//                 />
//               </div>
//             )}
//           </div>
//         )}

//         {/* ==================== TYPOGRAPHY SECTION ==================== */}
//         {isTextObject && (
//           <div className="border-b border-gray-100">
//             <button
//               onClick={() => toggleSidebarSection('typography')}
//               className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-sm"
//             >
//               <span className="font-medium text-gray-700">Typography</span>
//               {rightSidebarOpen.typography ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
//             </button>

//             {rightSidebarOpen.typography && (
//               <div className="px-3 pb-3 space-y-3">
//                 {/* Font Family & Size */}
//                 <div className="flex gap-2">
//                   <select
//                     value={properties.fontFamily}
//                     onChange={(e) => updateProperty('fontFamily', e.target.value)}
//                     className="flex-1 p-1.5 border border-gray-200 rounded text-sm bg-white focus:border-indigo-500 outline-none"
//                   >
//                     {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
//                   </select>
//                   <input
//                     type="number"
//                     min="8"
//                     max="200"
//                     value={properties.fontSize}
//                     onChange={(e) => updateProperty('fontSize', parseInt(e.target.value) || 24)}
//                     className="w-16 p-1.5 border border-gray-200 rounded text-sm text-center focus:border-indigo-500 outline-none"
//                   />
//                 </div>

//                 {/* Font Weight */}
//                 <select
//                   value={properties.fontWeight}
//                   onChange={(e) => updateProperty('fontWeight', parseInt(e.target.value))}
//                   className="w-full p-1.5 border border-gray-200 rounded text-sm bg-white focus:border-indigo-500 outline-none"
//                 >
//                   {fontWeights.map(fw => (
//                     <option key={fw.value} value={fw.value}>{fw.label}</option>
//                   ))}
//                 </select>

//                 {/* Text Alignment & Formatting */}
//                 <div className="flex gap-1">
//                   {[
//                     { align: 'left', icon: <AlignLeft size={14} /> },
//                     { align: 'center', icon: <AlignCenter size={14} /> },
//                     { align: 'right', icon: <AlignRight size={14} /> },
//                     { align: 'justify', icon: <AlignJustify size={14} /> },
//                   ].map(({ align, icon }) => (
//                     <button
//                       key={align}
//                       onClick={() => setTextAlign(align)}
//                       className={`flex-1 p-1.5 rounded transition-colors ${
//                         properties.textAlign === align
//                           ? 'bg-indigo-100 text-indigo-600'
//                           : 'bg-gray-100 hover:bg-gray-200'
//                       }`}
//                     >
//                       {icon}
//                     </button>
//                   ))}
                  
//                   <div className="w-px bg-gray-200" />
                  
//                   <button
//                     onClick={() => updateProperty('fontWeight', properties.fontWeight >= 700 ? 400 : 700)}
//                     className={`p-1.5 rounded transition-colors ${
//                       properties.fontWeight >= 700
//                         ? 'bg-indigo-100 text-indigo-600'
//                         : 'bg-gray-100 hover:bg-gray-200'
//                     }`}
//                     title="Bold"
//                   >
//                     <Bold size={14} />
//                   </button>
//                   <button
//                     onClick={() => updateProperty('fontStyle', properties.fontStyle === 'italic' ? 'normal' : 'italic')}
//                     className={`p-1.5 rounded transition-colors ${
//                       properties.fontStyle === 'italic'
//                         ? 'bg-indigo-100 text-indigo-600'
//                         : 'bg-gray-100 hover:bg-gray-200'
//                     }`}
//                     title="Italic"
//                   >
//                     <Italic size={14} />
//                   </button>
//                   <button
//                     onClick={() => updateProperty('underline', !properties.underline)}
//                     className={`p-1.5 rounded transition-colors ${
//                       properties.underline
//                         ? 'bg-indigo-100 text-indigo-600'
//                         : 'bg-gray-100 hover:bg-gray-200'
//                     }`}
//                     title="Underline"
//                   >
//                     <Underline size={14} />
//                   </button>
//                   <button
//                     onClick={() => updateProperty('linethrough', !properties.linethrough)}
//                     className={`p-1.5 rounded transition-colors ${
//                       properties.linethrough
//                         ? 'bg-indigo-100 text-indigo-600'
//                         : 'bg-gray-100 hover:bg-gray-200'
//                     }`}
//                     title="Strikethrough"
//                   >
//                     <Strikethrough size={14} />
//                   </button>
//                 </div>

//                 {/* Line Height & Letter Spacing */}
//                 <div className="grid grid-cols-2 gap-2">
//                   <div>
//                     <label className="text-[10px] text-gray-400 uppercase mb-1 block">Line Height</label>
//                     <input
//                       type="number"
//                       min="0.5"
//                       max="3"
//                       step="0.1"
//                       value={properties.lineHeight}
//                       onChange={(e) => updateProperty('lineHeight', parseFloat(e.target.value) || 1.2)}
//                       className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-[10px] text-gray-400 uppercase mb-1 block">Letter Spacing</label>
//                     <input
//                       type="number"
//                       value={properties.charSpacing}
//                       onChange={(e) => updateProperty('charSpacing', parseInt(e.target.value) || 0)}
//                       className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none"
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* ==================== COLOR SECTION ==================== */}
//         <div className="border-b border-gray-100">
//           <button
//             onClick={() => toggleSidebarSection('color')}
//             className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-sm"
//           >
//             <span className="font-medium text-gray-700">Fill & Stroke</span>
//             {rightSidebarOpen.color ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
//           </button>

//           {rightSidebarOpen.color && (
//             <div className="px-3 pb-3 space-y-3">
//               {/* Fill Color */}
//               <div>
//                 <label className="text-[10px] text-gray-400 uppercase mb-1.5 block">Fill Color</label>
//                 <div className="flex items-center gap-2">
//                   <div className="w-9 h-9 rounded-lg border border-gray-200 overflow-hidden relative shadow-sm">
//                     <input
//                       type="color"
//                       value={properties.fill || '#000000'}
//                       onChange={(e) => updateProperty('fill', e.target.value)}
//                       className="absolute -top-1 -left-1 w-12 h-12 cursor-pointer"
//                       disabled={!activeObject}
//                     />
//                   </div>
//                   <input
//                     type="text"
//                     value={properties.fill || '#000000'}
//                     onChange={(e) => updateProperty('fill', e.target.value)}
//                     className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm uppercase focus:border-indigo-500 outline-none font-mono"
//                     disabled={!activeObject}
//                     maxLength={7}
//                   />
//                   <button
//                     onClick={() => updateProperty('fill', '')}
//                     disabled={!activeObject}
//                     className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
//                     title="Remove Fill"
//                   >
//                     <X size={14} />
//                   </button>
//                 </div>
//               </div>

//               {/* Stroke */}
//               <div>
//                 <label className="text-[10px] text-gray-400 uppercase mb-1.5 block">Stroke</label>
//                 <div className="flex items-center gap-2">
//                   <div className="w-9 h-9 rounded-lg border border-gray-200 overflow-hidden relative shadow-sm">
//                     <input
//                       type="color"
//                       value={properties.stroke || '#000000'}
//                       onChange={(e) => updateProperty('stroke', e.target.value)}
//                       className="absolute -top-1 -left-1 w-12 h-12 cursor-pointer"
//                       disabled={!activeObject}
//                     />
//                   </div>
//                   <input
//                     type="number"
//                     min="0"
//                     max="50"
//                     value={properties.strokeWidth}
//                     onChange={(e) => updateProperty('strokeWidth', parseInt(e.target.value) || 0)}
//                     placeholder="Width"
//                     className="w-16 border border-gray-200 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none"
//                     disabled={!activeObject}
//                   />
//                   <select
//                     value={properties.strokeDashArray ? 'dashed' : 'solid'}
//                     onChange={(e) => updateProperty('strokeDashArray', e.target.value === 'dashed')}
//                     className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm bg-white focus:border-indigo-500 outline-none"
//                     disabled={!activeObject}
//                   >
//                     <option value="solid">Solid</option>
//                     <option value="dashed">Dashed</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Quick Colors */}
//               <div>
//                 <label className="text-[10px] text-gray-400 uppercase mb-1.5 block">Quick Colors</label>
//                 <div className="flex flex-wrap gap-1.5">
//                   {[
//                     '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
//                     '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#8b5cf6',
//                     '#ec4899', '#64748b'
//                   ].map(color => (
//                     <button
//                       key={color}
//                       onClick={() => updateProperty('fill', color)}
//                       disabled={!activeObject}
//                       className={`w-6 h-6 rounded-md border-2 transition-transform hover:scale-110 disabled:opacity-40 ${
//                         properties.fill === color ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
//                       }`}
//                       style={{ backgroundColor: color }}
//                       title={color}
//                     />
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* ==================== EXPORT SECTION ==================== */}
//         <div className="p-3 mt-auto border-t border-gray-200 bg-gray-50">
//           <div className="grid grid-cols-2 gap-2">
//             <button
//               onClick={() => exportCanvas('png')}
//               className="py-2 px-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
//             >
//               <Download size={14} /> PNG
//             </button>
//             <button
//               onClick={() => exportCanvas('jpeg')}
//               className="py-2 px-3 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-1.5"
//             >
//               <Download size={14} /> JPG
//             </button>
//           </div>
//           <button
//             onClick={() => exportAllPages('png')}
//             className="w-full mt-2 py-2 px-3 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
//           >
//             <Download size={14} /> Export All Pages
//           </button>
//         </div>
//       </aside>

//       {/* ================ TEMPLATE MODAL ================ */}
//       {showTemplateModal && (
//         <div
//           className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
//           onClick={() => setShowTemplateModal(false)}
//         >
//           <div
//             className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Modal Header */}
//             <div className="p-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
//               <h2 className="text-xl font-bold text-gray-800">Choose a Template</h2>
//               <div className="flex items-center gap-3">
//                 <div className="relative">
//                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     placeholder="Search templates..."
//                     className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
//                   />
//                 </div>
//                 <button
//                   onClick={() => setShowTemplateModal(false)}
//                   className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//                 >
//                   <X size={20} className="text-gray-500" />
//                 </button>
//               </div>
//             </div>

//             {/* Category Tabs */}
//             <div className="px-5 py-3 flex gap-2 overflow-x-auto border-b border-gray-100 flex-shrink-0">
//               {categories.map(cat => (
//                 <button
//                   key={cat}
//                   onClick={() => setActiveTab(cat)}
//                   className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
//                     ${activeTab === cat
//                       ? 'bg-indigo-600 text-white shadow-sm'
//                       : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>

//             {/* Template Grid */}
//             <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
//               <div className="grid grid-cols-4 gap-5">
//                 {/* Blank Template */}
//                 <div
//                   onClick={() => {
//                     clearCanvas();
//                     setShowTemplateModal(false);
//                   }}
//                   className="group bg-white rounded-xl overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:border-indigo-500 hover:shadow-lg transition-all"
//                 >
//                   <div className="aspect-[1/1.414] flex items-center justify-center bg-gray-50">
//                     <div className="text-center">
//                       <Plus size={40} className="mx-auto text-gray-300 group-hover:text-indigo-500 transition-colors" />
//                       <p className="mt-2 text-sm text-gray-400 group-hover:text-indigo-600 font-medium">Blank Canvas</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Template Cards */}
//                 {filteredTemplates.map((template) => (
//                   <div
//                     key={template.id}
//                     onClick={() => loadTemplate(template)}
//                     className="group bg-white rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all"
//                   >
//                     <div className="aspect-[1/1.414] bg-gray-100 relative overflow-hidden">
//                       <img
//                         src={template.src}
//                         alt={template.name}
//                         className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform"
//                         draggable={false}
//                       />
//                       <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors flex items-center justify-center">
//                         <span className="opacity-0 group-hover:opacity-100 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg">
//                           Use Template
//                         </span>
//                       </div>
//                     </div>
//                     <div className="p-3">
//                       <h4 className="font-medium text-gray-800 text-sm truncate">{template.name}</h4>
//                       <p className="text-xs text-gray-400 mt-0.5">{template.category}</p>
//                     </div>
//                   </div>
//                 ))}

//                 {/* No Results */}
//                 {filteredTemplates.length === 0 && searchQuery && (
//                   <div className="col-span-4 py-12 text-center text-gray-400">
//                     <Search size={48} className="mx-auto mb-3 opacity-30" />
//                     <p className="text-lg font-medium">No templates found</p>
//                     <p className="text-sm mt-1">Try adjusting your search or category</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ================ GLOBAL STYLES ================ */}
//       <style jsx global>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 6px;
//           height: 6px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: transparent;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #cbd5e1;
//           border-radius: 3px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: #94a3b8;
//         }
        
//         /* Canvas selection styling */
//         .canvas-container {
//           box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
//         }
        
//         /* Prevent text selection during drag */
//         .no-select {
//           -webkit-user-select: none;
//           -moz-user-select: none;
//           -ms-user-select: none;
//           user-select: none;
//         }
        
//         /* Input number spinners */
//         input[type="number"]::-webkit-inner-spin-button,
//         input[type="number"]::-webkit-outer-spin-button {
//           opacity: 0.5;
//         }
//         input[type="number"]:hover::-webkit-inner-spin-button,
//         input[type="number"]:hover::-webkit-outer-spin-button {
//           opacity: 1;
//         }
        
//         /* Range slider styling */
//         input[type="range"] {
//           -webkit-appearance: none;
//           background: transparent;
//         }
//         input[type="range"]::-webkit-slider-runnable-track {
//           height: 4px;
//           background: #e2e8f0;
//           border-radius: 2px;
//         }
//         input[type="range"]::-webkit-slider-thumb {
//           -webkit-appearance: none;
//           width: 14px;
//           height: 14px;
//           background: #6366f1;
//           border-radius: 50%;
//           margin-top: -5px;
//           cursor: pointer;
//           transition: transform 0.1s;
//         }
//         input[type="range"]::-webkit-slider-thumb:hover {
//           transform: scale(1.1);
//         }
        
//         /* Color input styling */
//         input[type="color"] {
//           -webkit-appearance: none;
//           border: none;
//           cursor: pointer;
//         }
//         input[type="color"]::-webkit-color-swatch-wrapper {
//           padding: 0;
//         }
//         input[type="color"]::-webkit-color-swatch {
//           border: none;
//           border-radius: 4px;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default TemplateEditor;

// src/Modules/Template_editer.jsx
import React from 'react';
import { MainEditor } from '../components/TemplateEditor';

const TemplateEditor = () => {
  return <MainEditor />;
};

export default TemplateEditor;