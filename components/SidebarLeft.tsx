
import React, { useState, useMemo } from 'react';
import { ShapeType } from '../types';

interface SidebarLeftProps {
  onAddShape: (type: ShapeType) => void;
}

interface ShapeDef {
  id: ShapeType;
  label: string;
  category: 'Basic' | 'Flowchart' | 'Creative';
}

const SHAPES: ShapeDef[] = [
  { id: 'rect', label: 'Rectangle', category: 'Basic' },
  { id: 'circle', label: 'Circle', category: 'Basic' },
  { id: 'text', label: 'Connector Shape', category: 'Basic' },
  { id: 'diamond', label: 'Decision', category: 'Basic' },
  { id: 'hexagon', label: 'Hexagon', category: 'Basic' },
  { id: 'triangle', label: 'Triangle', category: 'Basic' },
  { id: 'cylinder', label: 'Database', category: 'Flowchart' },
  { id: 'document', label: 'Document', category: 'Flowchart' },
  { id: 'parallelogram', label: 'Data (I/O)', category: 'Flowchart' },
  { id: 'cloud', label: 'Cloud', category: 'Creative' },
];

const ShapeIcon: React.FC<{ type: ShapeType }> = ({ type }) => {
  const strokeColor = "currentColor";
  const strokeWidth = 1.5;
  
  switch (type) {
    case 'rect':
      return <rect x="3" y="6" width="18" height="12" rx="2" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />;
    case 'circle':
      return <circle cx="12" cy="12" r="8" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />;
    case 'text':
      return (
        <g stroke={strokeColor} strokeWidth={strokeWidth} fill="none">
          <text x="12" y="16" fontSize="12" textAnchor="middle" strokeWidth="0.5" fill="currentColor" fontFamily="serif">A</text>
          <path d="M4 4 h16 M4 20 h16" opacity="0.2" strokeDasharray="2,2" />
        </g>
      );
    case 'diamond':
      return <path d="M12 4 L20 12 L12 20 L4 12 Z" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />;
    case 'hexagon':
      return <path d="M12 3 L19.5 7.5 L19.5 16.5 L12 21 L4.5 16.5 L4.5 7.5 Z" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />;
    case 'triangle':
      return <path d="M12 4 L21 19 L3 19 Z" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />;
    case 'cylinder':
      return (
        <g stroke={strokeColor} strokeWidth={strokeWidth} fill="none">
          <ellipse cx="12" cy="7" rx="8" ry="3.5" />
          <path d="M4 7 V17 C4 18.9 7.6 20.5 12 20.5 S20 18.9 20 17 V7" />
        </g>
      );
    case 'document':
      return <path d="M14 3 H6 A2 2 0 0 0 4 5 V19 A2 2 0 0 0 6 21 H18 A2 2 0 0 0 20 19 V9 L14 3 Z M14 3 V9 H20" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />;
    case 'parallelogram':
      return <path d="M6 19 L2 6 H18 L22 19 Z" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />;
    case 'cloud':
      return <path d="M17.5 19 C20.5 19 22.5 17 22.5 14.5 C22.5 12.3 21 10.5 18.8 10.1 C18.3 6.6 15.3 4 11.8 4 C9.2 4 6.9 5.5 5.7 7.7 C3.1 8.3 1 10.5 1 13.2 C1 16.4 3.6 19 6.8 19 H17.5 Z" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />;
    default:
      return <rect x="4" y="4" width="16" height="16" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />;
  }
};

const SidebarLeft: React.FC<SidebarLeftProps> = ({ onAddShape }) => {
  const [search, setSearch] = useState('');

  const filteredShapes = useMemo(() => {
    return SHAPES.filter(s => 
      s.label.toLowerCase().includes(search.toLowerCase()) || 
      s.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const categories = ['Basic', 'Flowchart', 'Creative'] as const;

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col shrink-0 z-10 shadow-sm">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">search</span>
          <input 
            type="text" 
            placeholder="Search shapes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {categories.map(cat => {
          const shapes = filteredShapes.filter(s => s.category === cat);
          if (shapes.length === 0) return null;
          return (
            <div key={cat}>
              <h3 className="px-4 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cat}</h3>
              <div className="grid grid-cols-2 gap-1.5 px-1.5">
                {shapes.map(shape => (
                  <button
                    key={shape.id}
                    onClick={() => onAddShape(shape.id)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group active:scale-95"
                  >
                    <div className="w-12 h-12 flex items-center justify-center text-gray-700 group-hover:text-[#137fec] transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <ShapeIcon type={shape.id} />
                      </svg>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium mt-0.5 text-center truncate w-full">{shape.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {filteredShapes.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-gray-300">
            <span className="material-symbols-outlined text-[40px] mb-2">search_off</span>
            <p className="text-xs font-medium">No shapes found</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarLeft;
