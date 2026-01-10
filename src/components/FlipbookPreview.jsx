import React from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const Page = React.forwardRef((props, ref) => {
  return (
    <div className="bg-white shadow-md border-l h-full p-8" ref={ref}>
       <div className="h-full border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative bg-orange-50/30">
          <div className="absolute top-4 left-4 text-4xl font-bold opacity-10 text-gray-400">Page {props.number}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">SIPPER GLASS</h2>
          <div className="w-32 h-32 bg-orange-200 rounded-full mb-6 opacity-80 mix-blend-multiply"></div>
          <p className="text-center text-gray-600 text-sm px-8">
            This is a preview of the flipbook content. 
            The content is interactive and flips like a real book.
          </p>
       </div>
    </div>
  );
});

function FlipbookPreview({ onBack }) {
  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Preview Header */}
      <div className="h-16 bg-gray-900 text-white flex items-center justify-between px-6 shadow-md z-10">
        <button onClick={onBack} className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
          <ArrowLeft size={20} /> Back to Editor
        </button>
        <h1 className="text-lg font-semibold">Flipbook Preview Mode</h1>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/10 rounded"><ZoomOut size={18}/></button>
          <button className="p-2 hover:bg-white/10 rounded"><ZoomIn size={18}/></button>
          <button className="p-2 hover:bg-white/10 rounded"><Maximize size={18}/></button>
        </div>
      </div>

      {/* Book Container */}
      <div className="flex-1 flex items-center justify-center overflow-hidden py-10">
        <HTMLFlipBook 
          width={400} 
          height={550} 
          showCover={true}
          className="shadow-2xl"
        >
          <Page number={1} />
          <Page number={2} />
          <Page number={3} />
          <Page number={4} />
          <Page number={5} />
          <Page number={6} />
        </HTMLFlipBook>
      </div>
    </div>
  );
}

export default FlipbookPreview;