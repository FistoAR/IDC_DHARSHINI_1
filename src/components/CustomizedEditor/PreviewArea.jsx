import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import HTMLFlipBook from 'react-pageflip';

const Page = React.forwardRef((props, ref) => {
    return (
        <div className="page bg-white h-full overflow-hidden relative" ref={ref}>
            <div className="page-content w-full h-full p-0 m-0">
                {props.children}
            </div>
        </div>
    );
});

const PreviewArea = ({ bookName, pages = [], zoom = 1, targetPage = 0, onPageChange, logoSettings }) => {
    const bookRef = useRef();
    const isFlippingRef = useRef(false);
    
    // Page dimensions (A4 ratio)
    const WIDTH = 400;
    const HEIGHT = 566; // 400 * 1.414

    const [offset, setOffset] = useState(-200); // Start centered on cover (page 0 is right side, so shift left)
    
    // Logo styles
    const logoObjectFit = logoSettings?.type === 'Fill' ? 'cover' : logoSettings?.type === 'Stretch' ? 'fill' : 'contain';

    const onFlip = useCallback((e) => {
        const index = e.data;
        const total = pages.length;
        
        // Notify parent of new page (only if not triggered by parent)
        if (onPageChange && !isFlippingRef.current) {
             onPageChange(index);
        }
        
        let newOffset = 0;
        
        // Logic: 
        // Index 0 (Cover) is a "Right" page in double mode essentially when "0" is hidden/fake left.
        // Actually, in react-pageflip with userPortrait=false:
        // Page 0 (1st page) is purely Right page. Left is empty. CENTER point is spine.
        // So entire book is at X=0. Spine is at X=0.
        // Right page extends 0 to 400. Left page -400 to 0.
        // To center the Right page (Cover), we need to move the Spine LEFT by half a page width (WIDTH/2 = 200).
        // So offset should be -200.
        
        if (index === 0) {
            newOffset = -200; 
        } else if (index === total - 1 && total % 2 === 0) {
            // Last page (if even total) is a Left page. Spine is at 0.
            // Page extends -400 to 0. Center of page is -200.
            // To center that page, we move spine RIGHT by 200.
            newOffset = 200;
        } else {
            // Spread view. Spine at 0 is centered.
            newOffset = 0;
        }
        
        setOffset(newOffset);
    }, [pages.length, onPageChange]);

    // Reset offset when pages change
    useEffect(() => {
        setOffset(pages.length > 0 ? -200 : 0);
    }, [pages.length]);

    // Handle external page change (e.g. from slider/autoplay)
    useEffect(() => {
        if (bookRef.current && bookRef.current.pageFlip()) {
            const flip = bookRef.current.pageFlip();
            if (flip.getCurrentPageIndex() !== targetPage) {
                isFlippingRef.current = true;
                try {
                     setTimeout(() => {
                        if(bookRef.current) bookRef.current.pageFlip().turnToPage(targetPage);
                        isFlippingRef.current = false;
                     }, 0);
                } catch(e) {
                    isFlippingRef.current = false;
                }
            }
        }
    }, [targetPage]);


    const getIframeContent = (html) => {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        body { margin: 0; padding: 0; overflow: hidden; background: white; width: 100%; height: 100%; }
                        * { box-sizing: border-box; }
                    </style>
                </head>
                <body>
                    ${html || ''}
                </body>
            </html>
        `;
    };



    return (
        <div className="flex-1 flex flex-col relative h-full overflow-hidden bg-[#DADBE8]">
            {/* Top Title Bar - Specific Dark Blue with Logo Area */}
            <div className="h-[70px] bg-[#3E4491] flex items-center justify-between px-8 shrink-0 w-full shadow-lg z-10 relative">
                
                {/* Logo Area - Left Aligned */}
                <div className="flex items-center group cursor-pointer">
                    {logoSettings?.url ? (
                        <a 
                            href={logoSettings.url.startsWith('http') ? logoSettings.url : `https://${logoSettings.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`h-16 w-auto min-w-[100px] px-3 rounded-full flex items-center justify-center transition-all ${logoSettings?.src ? 'bg-transparent border-none' : 'bg-white/10 border-2 border-dashed border-white/20 hover:bg-white/20 shadow-inner'}`}
                        >
                            {logoSettings?.src ? (
                                <img 
                                    src={logoSettings.src} 
                                    alt="Logo" 
                                    className="max-h-[36px] w-auto transition-all duration-300 drop-shadow-md"
                                    style={{ objectFit: logoObjectFit }}
                                />
                            ) : (
                                <div className="flex items-center gap-1.5 opacity-60">
                                    <Icon icon="fluent:image-shadow-24-regular" width="16" className="text-white" />
                                    <span className="text-[10px] text-white font-bold tracking-tight uppercase whitespace-nowrap">Logo Slot</span>
                                </div>
                            )}
                        </a>
                    ) : (
                        <div className={`h-16 w-auto min-w-[100px] px-3 rounded-lg flex items-center justify-center transition-all ${logoSettings?.src ? 'bg-transparent border-none' : 'bg-white/10 border-2 border-dashed border-white/20 hover:bg-white/20 shadow-inner'}`}>
                            {logoSettings?.src ? (
                                <img 
                                    src={logoSettings.src} 
                                    alt="Logo" 
                                    className="max-h-[36px] w-auto transition-all duration-300 drop-shadow-md"
                                    style={{ objectFit: logoObjectFit }}
                                />
                            ) : (
                                <div className="flex items-center gap-1.5 opacity-60">
                                    <Icon icon="fluent:image-shadow-24-regular" width="16" className="text-white" />
                                    <span className="text-[10px] text-white font-bold tracking-tight uppercase whitespace-nowrap">Logo Slot</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Centered Title */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-white text-lg font-semibold uppercase drop-shadow-sm">{bookName || 'TEMPLATE FLIPBOOK'}</span>
                </div> 
            </div>

            {/* Canvas Area */}
            <div className="flex-1 flex items-center justify-center relative p-8">
                
                {/* Left Arrow */}
                <button 
                    className="absolute left-8 w-10 h-10 bg-[#555AB9] rounded text-white flex items-center justify-center hover:bg-[#45499D] transition-colors shadow-sm z-20"
                    onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
                >
                    <Icon icon="fluent:chevron-left-24-filled" width="20" height="20" />
                </button>

                {/* Flipbook Container Wrapper with Transition for Centering */}
                <div 
                    className="relative flex items-center justify-center transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(${offset}px) scale(${zoom})`, transformOrigin: 'center center' }}
                >
                    {pages && pages.length > 0 ? (
                        <HTMLFlipBook
                            width={WIDTH}
                            height={HEIGHT}
                            size="fixed"
                            minWidth={300}
                            maxWidth={1200}
                            minHeight={400}
                            maxHeight={1500}
                            showCover={true}
                            usePortrait={false}
                            mobileScrollSupport={true}
                            className="flip-book"
                            ref={bookRef}
                            style={{ margin: '0 auto' }}
                            drawShadow={false}
                            flippingTime={1000}
                            onFlip={onFlip}
                        >
                            {pages.map((page, index) => (
                                <Page key={page.id || index} number={index + 1}>
                                    <iframe 
                                        className="w-full h-full border-none overflow-hidden origin-top-left" 
                                        srcDoc={getIframeContent(page.html || page.content)}
                                        title={`Page ${index + 1}`}
                                        style={{ 
                                            transform: 'scale(0.67)', 
                                            width: '149.25%', 
                                            height: '149.25%',
                                            pointerEvents: 'none'
                                        }} 
                                    />
                                </Page>
                            ))}
                        </HTMLFlipBook>
                    ) : (
                         <div className="flex items-center justify-center w-[400px] h-[566px] bg-white rounded shadow-lg">
                            <span className="text-gray-400 font-medium">No pages content</span>
                        </div>
                    )}
                </div>

                {/* Right Arrow */}
                <button 
                    className="absolute right-8 w-10 h-10 bg-[#555AB9] rounded text-white flex items-center justify-center hover:bg-[#45499D] transition-colors shadow-sm z-20"
                    onClick={() => bookRef.current?.pageFlip()?.flipNext()}
                >
                    <Icon icon="fluent:chevron-right-24-filled" width="20" height="20" />
                </button>
            </div>
        </div>
    );
};

export default PreviewArea;
