
import React from 'react';
import { InteractionTool } from '../types';

interface ToolbarProps {
  activeTool: InteractionTool;
  onToolChange: (tool: InteractionTool) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  activeTool, onToolChange, zoom, onZoomIn, onZoomOut, onUndo, onRedo, canUndo, canRedo 
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-white border-b border-gray-200 z-20 shrink-0 shadow-sm">
      <div className="flex items-center gap-1">
        <div className="flex items-center border-r border-gray-100 pr-2 mr-2 gap-1">
          <button 
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded transition-colors ${canUndo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300'}`} 
            title="Undo (Ctrl+Z)"
          >
            <span className="material-symbols-outlined text-[20px]">undo</span>
          </button>
          <button 
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded transition-colors ${canRedo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300'}`} 
            title="Redo (Ctrl+Y)"
          >
            <span className="material-symbols-outlined text-[20px]">redo</span>
          </button>
        </div>

        <div className="flex items-center border-r border-gray-100 pr-2 mr-2 gap-1">
          <button 
            onClick={() => onToolChange('select')}
            className={`p-2 rounded transition-all ${activeTool === 'select' ? 'bg-[#137fec]/10 text-[#137fec]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`} 
            title="Select Tool (V)"
          >
            <span className="material-symbols-outlined text-[20px]">near_me</span>
          </button>
          <button 
            onClick={() => onToolChange('hand')}
            className={`p-2 rounded transition-all ${activeTool === 'hand' ? 'bg-[#137fec]/10 text-[#137fec]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`} 
            title="Hand Tool (H or Shift + Drag)"
          >
            <span className="material-symbols-outlined text-[20px]">pan_tool</span>
          </button>
        </div>

        <div className="flex items-center gap-1 px-2">
          <button onClick={onZoomOut} className="p-1 text-gray-400 hover:text-gray-900">
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
          <span className="text-[13px] font-medium w-12 text-center text-gray-700">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={onZoomIn} className="p-1 text-gray-400 hover:text-gray-900">
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="px-3 py-1 bg-green-50 text-green-700 rounded text-[10px] font-bold border border-green-100 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">check_circle</span>
          AUTO-SAVED
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
