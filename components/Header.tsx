
import React, { useState } from 'react';

interface HeaderProps {
  diagramName: string;
  metadata: { firstName: string; lastName: string; group: string; topic: string };
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onEditMetadata: () => void;
  onNew: () => void;
  onImport: () => void;
  onExport: () => void;
  onExportImage: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onResetView: () => void;
}

const Header: React.FC<HeaderProps> = ({
  diagramName, metadata, isDarkMode, onToggleDarkMode, onEditMetadata, onNew, onImport, onExport, onExportImage,
  onUndo, onRedo, onDelete, onResetView
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const closeMenu = () => setActiveMenu(null);

  const menuItems: Record<string, { label: string; action: () => void }[]> = {
    File: [
      { label: 'New Diagram', action: onNew },
      { label: 'Import JSON...', action: onImport },
      { label: 'Export as JSON...', action: onExport },
      { label: 'Export as Image...', action: onExportImage },
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
      { label: 'About AIDMinds Studio', action: () => alert('AIDMinds Studio v1.0\nA clean diagramming tool.') },
    ]
  };

  return (
    <header className="flex items-center justify-between px-6 py-2 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 z-50 shrink-0 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-[#137fec]/10 rounded flex items-center justify-center text-[#137fec]">
          <span className="material-symbols-outlined text-[20px]">hub</span>
        </div>
        <div className="relative">
          <div className="flex items-baseline gap-2">
            <h1
              onClick={onEditMetadata}
              className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight cursor-pointer hover:text-[#137fec] transition-colors whitespace-nowrap"
            >
              {metadata.firstName
                ? `${metadata.firstName} ${metadata.lastName} - ${metadata.group} - ${metadata.topic}`
                : diagramName}
            </h1>
          </div>

          <nav className="flex gap-3 text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
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
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl py-1 w-48 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                      {menuItems[menu].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => { item.action(); closeMenu(); }}
                          className="w-full text-left px-4 py-2 text-[12px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-[#137fec] transition-colors flex justify-between items-center"
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

      <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <span className="material-symbols-outlined text-[16px]">cloud_done</span>
        <span>All changes saved</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleDarkMode}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <button
          onClick={onExportImage}
          className="flex items-center gap-2 px-4 py-1.5 bg-[#137fec] text-white text-sm font-bold rounded-lg hover:bg-[#137fec]/90 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export
        </button>
      </div>
    </header>
  );
};

export default Header;
