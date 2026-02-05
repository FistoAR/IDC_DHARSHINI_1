import React, { useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { Upload, Trash2, Plus } from 'lucide-react';

const Branding = ({ activeTab, logoSettings, profileSettings, onUpdateLogo, onUpdateProfile, onClose }) => {
  const fileInputRef = useRef(null);

  // Logo process
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPG or PNG)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateLogo({ ...logoSettings, src: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderLogoPanel = () => {
    const { src, url, type } = logoSettings;
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <h4 className="text-sm font-semibold text-gray-900 whitespace-nowrap">Upload your Logo</h4>
          <div className="h-[1px] bg-gray-200 w-full"></div>
        </div>

        {/* Image Type Dropdown */}
        <div className="mb-8">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Select the Image type :</label>
          <div className="relative">
            <select 
              value={type}
              onChange={(e) => onUpdateLogo({ ...logoSettings, type: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 pr-10 text-xs text-gray-800 appearance-none focus:outline-none focus:border-[#3E4491] focus:ring-1 focus:ring-[#3E4491]/20 shadow-sm"
            >
              <option value="Fit">Fit</option>
              <option value="Fill">Fill</option>
              <option value="Stretch">Stretch</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon icon="fluent:chevron-down-12-regular" width="18" height="18" className="text-gray-500" />
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mb-6">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <div 
            onClick={() => fileInputRef.current?.click()} 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload(e);
            }}
            className={`flex-1 min-h-[100px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${src ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-300 hover:border-indigo-400 hover:bg-white'}`}
          >
            {src ? (
              <div className="relative w-[120px] h-[120px] p-6 flex items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                <img src={src} className="max-h-full max-w-full object-contain" alt="Logo preview" />
                <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white/10 backdrop-blur-lg px-4 py-1.5 rounded-sm text-sm font-semibold">Click to Replace</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6">
                <Upload size={20} className="text-gray-500 mb-1" />
                <p className="text-sm text-gray-400 font-medium text-center">Drag & Drop or <span className="font-bold text-indigo-600">Upload</span></p>
              </div>
            )}
          </div>
        </div>

        {/* URL Input */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Add URL :</label>
          <input 
            type="text" 
            value={url}
            onChange={(e) => onUpdateLogo({ ...logoSettings, url: e.target.value })}
            placeholder="https://..." 
            className="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-xs text-gray-800 focus:outline-none focus:border-[#3E4491] focus:ring-1 focus:ring-[#3E4491]/20 shadow-sm placeholder-gray-400"
          />
        </div>
      </div>
    );
  };

  const renderProfilePanel = () => {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        {/* Add Profile Section */}
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
                <h4 className="text-sm font-semibold text-gray-900 whitespace-nowrap">Add Profile</h4>
                <div className="h-[1px] bg-gray-200 w-full"></div>
            </div>
            <p className="text-xs text-gray-400 font-medium mb-6 leading-relaxed">Add your basic details to let readers know who created this flipbook</p>
            
            <div className="space-y-4">
                <div className="flex items-center">
                    <label className="w-16 text-xs font-semibold text-gray-700">Name :</label>
                    <input 
                        type="text"
                        value={profileSettings.name}
                        onChange={(e) => onUpdateProfile({ ...profileSettings, name: e.target.value })}
                        placeholder="Enter Your Name"
                        className="flex-1 bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs focus:ring-1 focus:ring-[#3E4491] focus:outline-none"
                    />
                </div>
                <div className="flex items-start">
                    <label className="w-16 text-xs font-semibold text-gray-700 mt-2">About :</label>
                    <textarea 
                        value={profileSettings.about}
                        onChange={(e) => onUpdateProfile({ ...profileSettings, about: e.target.value })}
                        placeholder="Enter About"
                        rows={4}
                        className="flex-1 bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs focus:ring-1 focus:ring-[#3E4491] focus:outline-none resize-none"
                    />
                </div>
            </div>
        </div>

        {/* Contact Section */}
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
                <h4 className="text-sm font-semibold text-gray-900 whitespace-nowrap">Contact</h4>
                <div className="h-[1px] bg-gray-200 w-full"></div>
            </div>
            <p className="text-xs text-gray-400 font-medium mb-6 leading-relaxed">Viewers can use these details to contact you while viewing the flipbook</p>

            <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                        <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Gmail" className="w-6 h-auto grayscale" />
                    </div>
                    <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2">
                        <input 
                            type="email"
                            placeholder="Enter your Gmail"
                            className="w-full text-xs focus:outline-none"
                        />
                         <Trash2 size={14} className="text-red-400 cursor-pointer ml-2" />
                    </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-1">
                    <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                        <Icon icon="lucide:phone" className="text-gray-600" width="20" />
                    </div>
                    <div className="flex-1 flex gap-2">
                        <div className="relative w-24">
                            <select className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-xs appearance-none focus:outline-none">
                                <option>+91</option>
                            </select>
                            <Icon icon="fluent:chevron-down-12-regular" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" width="12" />
                        </div>
                        <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2">
                             <input 
                                type="text"
                                placeholder="1234567890"
                                className="w-full text-xs focus:outline-none tracking-wider"
                            />
                            <Trash2 size={14} className="text-red-400 cursor-pointer ml-2" />
                        </div>
                    </div>
                </div>

                {/* Add Button */}
                <div className="flex justify-end pt-2">
                    <button className="flex items-center gap-1 px-4 py-1.5 border border-gray-200 rounded-lg text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                        <Plus size={14} /> Add
                    </button>
                </div>
            </div>
        </div>

        {/* Social Icons Float (Reference from image) */}
        <div className="mt-5 flex justify-end">
             <div className="bg-white rounded-2xl shadow-2xl p-4 w-[160px] border border-gray-50 animate-in slide-in-from-bottom-5 duration-700">
                <div className="space-y-3">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <Icon icon="skill-icons:instagram" width="20" className="transition-transform group-hover:scale-110" />
                        <span className="text-[13px] font-medium text-gray-700">Instagram</span>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <Icon icon="logos:facebook" width="20" className="transition-transform group-hover:scale-110" />
                        <span className="text-[13px] font-medium text-gray-700">Facebook</span>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <Icon icon="ri:twitter-x-fill" width="20" className="text-black transition-transform group-hover:scale-110" />
                        <span className="text-[13px] font-medium text-gray-700">X</span>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <Icon icon="logos:linkedin-icon" width="20" className="transition-transform group-hover:scale-110" />
                        <span className="text-[13px] font-medium text-gray-700">Linked In</span>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer pt-1 border-t border-gray-100">
                        <Icon icon="lucide:phone" width="20" className="text-gray-600 transition-transform group-hover:scale-110" />
                        <span className="text-[13px] font-medium text-gray-700">Contact</span>
                    </div>
                </div>
             </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-[300px] bg-white h-full border-r border-gray-200 flex flex-col z-20 shrink-0 animate-in slide-in-from-left-4 duration-300">
      {/* Header */}
      <div className="h-[50px] px-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          {activeTab === 'Logo' ? (
              <Icon icon="mdi:diamond-outline" width="18" height="18" className="text-gray-900" />
          ) : (
              <Icon icon="mdi:account" width="20" height="20" className="text-gray-900" />
          )}
          <h3 className="font-semibold text-sm text-gray-700">{activeTab}</h3>
        </div>
        <button onClick={onClose} className="hover:bg-gray-100 p-1.5 rounded-full transition-colors">
          <Icon icon="fluent:arrow-left-24-regular" width="18" height="18" className="text-gray-900" />
        </button>
      </div>

      {activeTab === 'Logo' ? renderLogoPanel() : renderProfilePanel()}
    </div>
  );
};

export default Branding;
