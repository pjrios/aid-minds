
import React, { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  diagramName: string;
  setDiagramName: (name: string) => void;
  onNew: () => void;
  onImport: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onResetView: () => void;
  onEditStateChange?: (isEditing: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  diagramName, setDiagramName, onNew, onImport, onExport, 
  onUndo, onRedo, onDelete, onResetView, onEditStateChange
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      onEditStateChange?.(true);
    } else {
      onEditStateChange?.(false);
    }
  }, [isEditingName, onEditStateChange]);

  const closeMenu = () => setActiveMenu(null);

  const menuItems: Record<string, { label: string; action: () => void }[]> = {
    File: [
      { label: 'New Diagram', action: onNew },
      { label: 'Import JSON...', action: onImport },
      { label: 'Export as JSON...', action: onExport },
    ],
    Edit: [
      { label: 'Undo', action: onUndo },
      { label: 'Redo', action: onRedo },
      { label: 'Delete Selected', action: onDelete },
    ],
    View: [
      { label: 'Reset Zoom & Pan', action: onResetView },
    ],
    Help: [
      { label: 'Shortcuts Guide', action: () => alert('Shift+Drag: Pan\nDelete/Backspace: Remove Selected\nCtrl+Z/Y: Undo/Redo') },
      { label: 'About MindFlow', action: () => alert('MindFlow Studio v1.0\nA clean diagramming tool.') },
    ]
  };

  return (
    <header className="flex items-center justify-between px-6 py-2 bg-white border-b border-gray-200 z-50 shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-[#137fec]/10 rounded flex items-center justify-center text-[#137fec]">
          <span className="material-symbols-outlined text-[20px]">hub</span>
        </div>
        <div className="relative">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
              className="text-sm font-bold text-gray-900 leading-tight border-b-2 border-[#137fec] outline-none bg-transparent w-48"
            />
          ) : (
            <h1 
              onClick={() => setIsEditingName(true)}
              className="text-sm font-bold text-gray-900 leading-tight cursor-text hover:text-[#137fec] transition-colors"
            >
              {diagramName}
            </h1>
          )}
          
          <nav className="flex gap-3 text-[11px] text-gray-500 font-medium mt-0.5">
            {Object.keys(menuItems).map(menu => (
              <div key={menu} className="relative">
                <button 
                  onMouseDown={() => setActiveMenu(activeMenu === menu ? null : menu)}
                  className={`hover:text-[#137fec] outline-none ${activeMenu === menu ? 'text-[#137fec]' : ''}`}
                >
                  {menu}
                </button>
                {activeMenu === menu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={closeMenu} />
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 w-48 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                      {menuItems[menu].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => { item.action(); closeMenu(); }}
                          className="w-full text-left px-4 py-2 text-[12px] text-gray-700 hover:bg-gray-50 hover:text-[#137fec] transition-colors flex justify-between items-center"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400">
        <span className="material-symbols-outlined text-[16px]">cloud_done</span>
        <span>All changes saved</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          <img className="w-8 h-8 rounded-full border-2 border-white" src="https://picsum.photos/seed/u1/64" alt="User" />
          <img className="w-8 h-8 rounded-full border-2 border-white" src="https://picsum.photos/seed/u2/64" alt="User" />
        </div>
        <button className="px-4 py-1.5 bg-[#137fec] text-white text-sm font-bold rounded-lg hover:bg-[#137fec]/90 transition-colors shadow-sm">
          Share
        </button>
      </div>
    </header>
  );
};

export default Header;
