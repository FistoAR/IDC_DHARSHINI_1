import React from 'react';
import { Icon } from '@iconify/react';
import { Edit2 } from 'lucide-react'; 

const SidebarItem = ({ icon, label, isOpen, onClick, hasDropdown, children, active }) => (
  <div className="flex flex-col px-3 mb-1">
    <div 
        onClick={onClick}
        className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-all duration-300 ${active ? 'bg-[#3E4491] text-white rounded-[15px] shadow-sm' : 'hover:bg-gray-50 text-gray-700'}`}
    >
      <div className="flex items-center gap-3">
        <Icon icon={icon} width="15" height="15" className={`${active ? 'text-white' : 'text-gray-900'}`} />
        <span className="font-semibold text-xs">{label}</span>
      </div>
      {hasDropdown && (
          <Icon 
            icon="fluent:chevron-down-24-regular" 
            width="15" height="15" 
            className={`transition-transform duration-300 ${active ? 'text-white' : 'text-gray-500'} ${isOpen ? 'rotate-180' : ''}`} 
          />
      )}
    </div>
    
    {hasDropdown && isOpen && children && (
        <div className="mt-2 mx-0.5 bg-white border border-[#3E4491]  rounded-[15px] shadow-lg p-2 flex flex-col gap-1 ring-1 ring-black/5 ">
            {children}
        </div>
    )}
  </div>
);

const SubItem = ({ icon, label, onClick, isActive }) => (
    <div 
        onClick={onClick}
        className={`flex items-center gap-4 py-2 px-3 rounded-[15px] cursor-pointer transition-all duration-200 ${isActive ? 'bg-[#DBDEF0] text-black' : 'hover:[#DBDEF0] text-gray-600'}`}
    >
        <Icon icon={icon} width="15" height="15" className="text-gray-900" />
        <span className={`text-xs font-medium ${isActive ? 'text-black' : 'text-gray-600'}`}>{label}</span>
    </div>
);

const Sidebar = ({ bookName, pageCount, activePanel, onSelectPanel, onUpdateBookName }) => {
  const [expandedSection, setExpandedSection] = React.useState('Branding');
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempName, setTempName] = React.useState(bookName);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleSave = () => {
    onUpdateBookName(tempName);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        handleSave();
    } else if (e.key === 'Escape') {
        setTempName(bookName);
        setIsEditing(false);
    }
  };

  return (
    <div className="w-60 bg-white shadow-lg flex flex-col z-10 h-full overflow-y-auto border-xs border-gray-200 shrink-0">
      <div className="flex flex-col">
        {/* Title Section */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between gap-2 min-h-[24px]">
            <div 
                onClick={() => setIsEditing(true)}
                className="flex-1 cursor-text"
            >
                <input 
                    autoFocus={isEditing}
                    type="text"
                    value={tempName}
                    onChange={(e) => {
                        setTempName(e.target.value);
                        onUpdateBookName(e.target.value);
                    }}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={handleKeyDown}
                    className={`w-full font-semibold text-xs text-gray-900 bg-transparent py-0.5 focus:outline-none uppercase ${isEditing ? 'border-b border-[#3E4491]' : 'truncate pointer-events-none'}`}
                    readOnly={!isEditing}
                    placeholder="Enter Book Name"
                />
            </div>
            <Icon 
                icon="fluent:edit-20-filled" 
                width="15" height="15" 
                className={`cursor-pointer transition-colors shrink-0 ${isEditing ? 'text-[#3E4491]' : 'text-gray-900 hover:text-[#3E4491]'}`} 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                }}
            />
          </div>
        </div>
        
        {/* Pages Badge Section */}
        <div className="px-5 py-3 border-b border-gray-200 flex justify-end">
          <span className="bg-[#F3F4F6] text-[11px] font-medium px-2.5 py-1 rounded-sm text-gray-600">
            {pageCount || 0} Pages
          </span>
        </div>
      </div>

      <div className="flex-1 py-1">
        <SidebarItem 
            icon="fluent:window-header-horizontal-20-regular" 
            label="Branding" 
            hasDropdown={true} 
            isOpen={expandedSection === 'Branding'}
            onClick={() => toggleSection('Branding')}
            active={expandedSection === 'Branding'}
        >
            <SubItem 
                icon="mdi:diamond-outline" 
                label="Logo" 
                isActive={activePanel === 'Logo'}
                onClick={() => onSelectPanel('Logo')}
            />
            <SubItem 
                icon="mdi:account" 
                label="Profile" 
                isActive={activePanel === 'Profile'}
                onClick={() => onSelectPanel('Profile')}
            />
        </SidebarItem>

        <SidebarItem 
            icon="icon-park-outline:texture" 
            label="Appearance" 
            hasDropdown={true} 
            isOpen={expandedSection === 'Appearance'}
            onClick={() => toggleSection('Appearance')}
            active={expandedSection === 'Appearance'}
        />
        <SidebarItem 
            icon="fluent:list-20-regular" 
            label="Menu Bar" 
            hasDropdown={true} 
            isOpen={expandedSection === 'Menu Bar'}
            onClick={() => toggleSection('Menu Bar')}
            active={expandedSection === 'Menu Bar'}
        />
        <SidebarItem icon="fluent:settings-20-regular" label="Other Setup" />
        <SidebarItem icon="fluent:clipboard-text-20-regular" label="Lead Form" />
        <SidebarItem 
            icon="fluent:eye-20-regular" 
            label="Visibility" 
            hasDropdown={true} 
            isOpen={expandedSection === 'Visibility'}
            onClick={() => toggleSection('Visibility')}
            active={expandedSection === 'Visibility'}
        />
        <SidebarItem icon="fluent:poll-24-regular" label="Statistic" />
      </div>
    </div>
  );
};

export default Sidebar;
