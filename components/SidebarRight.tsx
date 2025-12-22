
import React from 'react';
import { DiagramNode, Connection } from '../types';

interface SidebarRightProps {
  node: DiagramNode | null;
  connection: Connection | null;
  onUpdateNode: (updates: Partial<DiagramNode>) => void;
  onUpdateConnection: (updates: Partial<Connection>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const SidebarRight: React.FC<SidebarRightProps> = ({ 
  node, connection, onUpdateNode, onUpdateConnection, onDelete, onClose 
}) => {
  const handleSwapDirection = () => {
    if (!connection) return;
    onUpdateConnection({
      from: connection.to,
      to: connection.from,
      arrowStart: connection.arrowEnd,
      arrowEnd: connection.arrowStart
    });
  };

  return (
    <aside className="w-72 border-l border-gray-200 bg-white flex flex-col shrink-0 z-40 shadow-sm animate-in slide-in-from-right duration-200">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-900">
          {node ? 'Node Style' : 'Arrow Style'}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-900">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        {node && (
          <>
            <section>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Appearance</h4>
              <div className="space-y-4">
                <ColorPicker label="Fill" value={node.fill} onChange={(v) => onUpdateNode({ fill: v })} />
                <ColorPicker label="Stroke" value={node.stroke} onChange={(v) => onUpdateNode({ stroke: v })} />
                <RangeInput label="Stroke Width" min={0} max={10} value={node.strokeWidth} onChange={(v) => onUpdateNode({ strokeWidth: v })} />
              </div>
            </section>
            <section>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Text Styling</h4>
              <div className="space-y-4">
                <textarea 
                  value={node.text}
                  onChange={(e) => onUpdateNode({ text: e.target.value })}
                  className="w-full text-xs p-3 bg-gray-50 text-gray-900 border border-gray-100 rounded-lg focus:ring-1 focus:ring-[#137fec] min-h-[60px]"
                  placeholder="Node text..."
                />
                <ColorPicker label="Text Color" value={node.textColor} onChange={(v) => onUpdateNode({ textColor: v })} />
                <div className="flex gap-2">
                  <select value={node.fontFamily} onChange={(e) => onUpdateNode({ fontFamily: e.target.value })} className="flex-1 h-9 bg-gray-50 rounded px-2 text-xs text-gray-900 border border-transparent">
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times</option>
                  </select>
                  <input type="number" value={node.fontSize} onChange={(e) => onUpdateNode({ fontSize: parseInt(e.target.value) })} className="w-16 h-9 bg-gray-50 rounded text-xs text-center text-gray-900" />
                </div>
              </div>
            </section>
          </>
        )}

        {connection && (
          <>
            <section>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Properties</h4>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Label</label>
                  <input 
                    type="text" 
                    value={connection.text || ''} 
                    onChange={(e) => onUpdateConnection({ text: e.target.value })}
                    className="w-full h-9 px-3 bg-gray-50 text-xs text-gray-900 border border-gray-100 rounded-lg focus:ring-1 focus:ring-[#137fec]"
                    placeholder="E.g. Leads to, Related..."
                  />
                </div>
                <ColorPicker label="Line Color" value={connection.color || '#9ca3af'} onChange={(v) => onUpdateConnection({ color: v })} />
                <RangeInput label="Thickness" min={1} max={12} value={connection.strokeWidth || 2} onChange={(v) => onUpdateConnection({ strokeWidth: v })} />
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-600">Line Style</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
                    {(['solid', 'dashed'] as const).map(style => (
                      <button key={style} onClick={() => onUpdateConnection({ lineStyle: style })}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded capitalize transition-all ${connection.lineStyle === style ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}>
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Direction</h4>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-600">Arrowheads</label>
                  <div className="flex gap-2">
                    <ToggleBtn label="Start" active={!!connection.arrowStart} onClick={() => onUpdateConnection({ arrowStart: !connection.arrowStart })} />
                    <ToggleBtn label="End" active={!!connection.arrowEnd} onClick={() => onUpdateConnection({ arrowEnd: !connection.arrowEnd })} />
                  </div>
                </div>
                <button 
                  onClick={handleSwapDirection}
                  className="w-full py-2.5 flex items-center justify-center gap-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-[11px] font-bold hover:bg-gray-100 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                  Swap Start/End
                </button>
              </div>
            </section>
          </>
        )}

        <section className="pt-4 border-t border-gray-100">
          <button onClick={onDelete} className="w-full py-2.5 flex items-center justify-center gap-2 bg-red-50 text-red-500 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Delete Selection
          </button>
        </section>
      </div>
    </aside>
  );
};

const ColorPicker = ({ label, value, onChange }: any) => (
  <div className="flex items-center justify-between">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-400 font-mono uppercase">{value}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded border-none p-0 cursor-pointer shadow-sm" />
    </div>
  </div>
);

const RangeInput = ({ label, value, min, max, onChange }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-bold text-gray-400"><span>{label.toUpperCase()}</span><span>{value}px</span></div>
    <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full h-1 bg-gray-100 rounded-lg appearance-none accent-[#137fec]" />
  </div>
);

const ToggleBtn = ({ label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex-1 py-2 text-[10px] font-bold border rounded-lg transition-all ${active ? 'bg-[#137fec] text-white border-[#137fec]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
    {label}
  </button>
);

export default SidebarRight;
