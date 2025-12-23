
import React, { useRef, useState, useEffect } from 'react';
import { AppState, DiagramNode, ShapeType, Connection } from '../types';

interface CanvasProps {
  state: AppState;
  onSelectNode: (id: string | null) => void;
  onSelectConnection: (id: string | null) => void;
  onUpdateNode: (id: string, updates: Partial<DiagramNode>, isFinal?: boolean) => void;
  onAddConnection: (from: string, to: string) => void;
  onPan: (pan: { x: number; y: number }) => void;
  onPushHistory: () => void;
  onEditStateChange?: (isEditing: boolean) => void;
}

type InteractionMode = 'none' | 'dragging' | 'resizing' | 'connecting' | 'panning';

const ShapeRenderer: React.FC<{ node: DiagramNode; isSelected: boolean }> = ({ node, isSelected }) => {
  const { width, height, type, fill, stroke, strokeWidth } = node;
  const sWidth = isSelected ? Math.max(strokeWidth, 2.5) : strokeWidth;
  const sColor = isSelected ? '#137fec' : stroke;

  switch (type) {
    case 'circle':
      return <ellipse cx={width / 2} cy={height / 2} rx={width / 2} ry={height / 2} fill={fill} stroke={sColor} strokeWidth={sWidth} />;
    case 'diamond':
      return <path d={`M ${width / 2} 0 L ${width} ${height / 2} L ${width / 2} ${height} L 0 ${height / 2} Z`} fill={fill} stroke={sColor} strokeWidth={sWidth} />;
    case 'triangle':
      return <path d={`M ${width / 2} 0 L ${width} ${height} L 0 ${height} Z`} fill={fill} stroke={sColor} strokeWidth={sWidth} />;
    case 'hexagon':
      const q = width * 0.2;
      return <path d={`M ${q} 0 L ${width - q} 0 L ${width} ${height / 2} L ${width - q} ${height} L ${q} ${height} L 0 ${height / 2} Z`} fill={fill} stroke={sColor} strokeWidth={sWidth} />;
    case 'cloud':
      return <path d={`M ${width * 0.25} ${height * 0.2} C 0 ${height * 0.2}, 0 ${height * 0.8}, ${width * 0.3} ${height * 0.8} C ${width * 0.3} ${height}, ${width * 0.7} ${height}, ${width * 0.7} ${height * 0.8} C ${width} ${height * 0.8}, ${width} ${height * 0.2}, ${width * 0.75} ${height * 0.2} C ${width * 0.75} 0, ${width * 0.25} 0, ${width * 0.25} ${height * 0.2} Z`} fill={fill} stroke={sColor} strokeWidth={sWidth} />;
    case 'parallelogram':
    case 'io':
      const po = width * 0.15;
      return <path d={`M ${po} 0 L ${width} 0 L ${width - po} ${height} L 0 ${height} Z`} fill={fill} stroke={sColor} strokeWidth={sWidth} />;
    case 'cylinder':
    case 'database':
      const r = 8;
      return <path d={`M 0 ${r} A ${width / 2} ${r} 0 0 1 ${width} ${r} L ${width} ${height - r} A ${width / 2} ${r} 0 0 1 0 ${height - r} Z M 0 ${r} A ${width / 2} ${r} 0 0 0 ${width} ${r}`} fill={fill} stroke={sColor} strokeWidth={sWidth} />;
    case 'document':
      const fold = 15;
      return <path d={`M 0 0 L ${width - fold} 0 L ${width} ${fold} L ${width} ${height} L 0 ${height} Z`} fill={fill} stroke={sColor} strokeWidth={sWidth} />;
    case 'text':
      return <rect x={0} y={0} width={width} height={height} fill="transparent" stroke={isSelected ? '#137fec' : 'transparent'} strokeWidth={1} strokeDasharray={isSelected ? '4,4' : 'none'} />;
    case 'rect':
    default:
      return <rect x={0} y={0} width={width} height={height} rx={6} ry={6} fill={fill} stroke={sColor} strokeWidth={sWidth} />;
  }
};

const Canvas: React.FC<CanvasProps> = ({ state, onSelectNode, onSelectConnection, onUpdateNode, onAddConnection, onPan, onPushHistory, onEditStateChange }) => {
  const [mode, setMode] = useState<InteractionMode>('none');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempConn, setTempConn] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [hoveredConnId, setHoveredConnId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const nodeStartRect = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const resizeHandle = useRef<string | null>(null);

  useEffect(() => {
    onEditStateChange?.(editingId !== null);
  }, [editingId, onEditStateChange]);

  const screenToWorld = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - state.pan.x) / state.zoom,
      y: (clientY - rect.top - state.pan.y) / state.zoom
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && (e.shiftKey || state.activeTool === 'hand'))) {
      setMode('panning');
      return;
    }
    const isSvg = (e.target as any).tagName === 'svg' || (e.target as any).tagName === 'path' && (e.target as any).classList.contains('bg-grid-svg');
    if (e.target === containerRef.current || isSvg) {
      onSelectNode(null);
      onSelectConnection(null);
      setEditingId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    if (mode === 'dragging' && activeId) {
      onUpdateNode(activeId, {
        x: nodeStartRect.current.x + (worldPos.x - dragStartPos.current.x),
        y: nodeStartRect.current.y + (worldPos.y - dragStartPos.current.y)
      }, false);
    } else if (mode === 'resizing' && activeId && resizeHandle.current) {
      const dx = worldPos.x - dragStartPos.current.x;
      const dy = worldPos.y - dragStartPos.current.y;
      let { x, y, w, h } = nodeStartRect.current;
      const hdl = resizeHandle.current;
      if (hdl.includes('e')) w += dx;
      if (hdl.includes('w')) { x += dx; w -= dx; }
      if (hdl.includes('s')) h += dy;
      if (hdl.includes('n')) { y += dy; h -= dy; }
      onUpdateNode(activeId, { x, y, width: Math.max(20, w), height: Math.max(20, h) }, false);
    } else if (mode === 'connecting') {
      setTempConn(prev => prev ? { ...prev, x2: worldPos.x, y2: worldPos.y } : null);
    } else if (mode === 'panning') {
      onPan({ x: state.pan.x + e.movementX, y: state.pan.y + e.movementY });
    }
  };

  const handleMouseUp = () => {
    if ((mode === 'dragging' || mode === 'resizing') && activeId) {
      const node = state.nodes.find(n => n.id === activeId);
      if (node) onUpdateNode(activeId, { x: node.x, y: node.y }, true);
    }
    if (mode === 'connecting' && activeId && tempConn) {
      const targetNode = state.nodes.find(n => n.id !== activeId && tempConn.x2 >= n.x && tempConn.x2 <= n.x + n.width && tempConn.y2 >= n.y && tempConn.y2 <= n.y + n.height);
      if (targetNode) onAddConnection(activeId, targetNode.id);
    }
    setMode('none'); setActiveId(null); setTempConn(null); resizeHandle.current = null;
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    if (state.activeTool === 'hand') return;
    e.stopPropagation(); onSelectNode(id); setMode('dragging'); setActiveId(id);
    const node = state.nodes.find(n => n.id === id)!;
    const worldPos = screenToWorld(e.clientX, e.clientY);
    dragStartPos.current = worldPos;
    nodeStartRect.current = { x: node.x, y: node.y, w: node.width, h: node.height };
  };

  const handleResizeStart = (e: React.MouseEvent, node: DiagramNode, handle: string) => {
    e.stopPropagation(); setMode('resizing'); setActiveId(node.id); resizeHandle.current = handle;
    const worldPos = screenToWorld(e.clientX, e.clientY);
    dragStartPos.current = worldPos;
    nodeStartRect.current = { x: node.x, y: node.y, w: node.width, h: node.height };
  };

  const handleConnectStart = (e: React.MouseEvent, node: DiagramNode, side: string) => {
    e.stopPropagation(); setMode('connecting'); setActiveId(node.id);
    let x = node.x + node.width / 2, y = node.y + node.height / 2;
    if (side === 'top') y = node.y; else if (side === 'bottom') y = node.y + node.height; else if (side === 'left') x = node.x; else x = node.x + node.width;
    setTempConn({ x1: x, y1: y, x2: x, y2: y });
  };

  const getPointsForNode = (node: DiagramNode) => [
    { x: node.x + node.width / 2, y: node.y, side: 'top' },
    { x: node.x + node.width, y: node.y + node.height / 2, side: 'right' },
    { x: node.x + node.width / 2, y: node.y + node.height, side: 'bottom' },
    { x: node.x, y: node.y + node.height / 2, side: 'left' },
  ];

  const renderArrowHead = (x: number, y: number, angle: number, color: string, scale: number = 1) => {
    const size = 10 * scale;
    return (
      <path
        d={`M ${x} ${y} L ${x - size} ${y - size / 2} L ${x - size} ${y + size / 2} Z`}
        fill={color}
        transform={`rotate(${angle}, ${x}, ${y})`}
        className="pointer-events-none"
      />
    );
  };

  const renderConnection = (conn: Connection | null, customPoints?: typeof tempConn) => {
    let x1, y1, x2, y2, s1 = 'right', s2 = 'left';
    if (customPoints) {
      ({ x1, y1, x2, y2 } = customPoints);
    } else if (conn) {
      const from = state.nodes.find(n => n.id === conn.from);
      const to = state.nodes.find(n => n.id === conn.to);
      if (!from || !to) return null;
      let minD = Infinity, b1 = { x: 0, y: 0, side: 'right' }, b2 = { x: 0, y: 0, side: 'left' };
      for (const p1 of getPointsForNode(from)) {
        for (const p2 of getPointsForNode(to)) {
          const d = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
          if (d < minD) { minD = d; b1 = p1; b2 = p2; }
        }
      }
      x1 = b1.x; y1 = b1.y; s1 = b1.side; x2 = b2.x; y2 = b2.y; s2 = b2.side;
    } else return null;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const offset = Math.min(dist * 0.4, 150);

    let cp1x = x1, cp1y = y1, cp2x = x2, cp2y = y2;
    if (s1 === 'top') cp1y -= offset; else if (s1 === 'bottom') cp1y += offset; else if (s1 === 'left') cp1x -= offset; else cp1x += offset;
    if (s2 === 'top') cp2y -= offset; else if (s2 === 'bottom') cp2y += offset; else if (s2 === 'left') cp2x -= offset; else cp2x += offset;

    const path = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
    const isSel = state.selectedConnectionId === conn?.id;
    const isHov = hoveredConnId === conn?.id;
    const color = (isSel || isHov) ? '#137fec' : (conn?.color || '#9ca3af');
    const strokeWidth = conn?.strokeWidth || 2;
    const arrowheadScale = Math.max(0.6, Math.min(1.5, strokeWidth / 2));

    const angleStart = Math.atan2(y1 - cp1y, x1 - cp1x) * (180 / Math.PI);
    const angleEnd = Math.atan2(y2 - cp2y, x2 - cp2x) * (180 / Math.PI);

    // Calculate center point of curve for the label
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    return (
      <g
        key={conn?.id || 'temp'}
        className="group"
        onMouseEnter={() => conn && setHoveredConnId(conn.id)}
        onMouseLeave={() => setHoveredConnId(null)}
      >
        <path
          d={path} stroke="transparent" strokeWidth="24" fill="none" className="cursor-pointer"
          onMouseDown={(e) => { e.stopPropagation(); if (conn && state.activeTool === 'select') onSelectConnection(conn.id); }}
        />
        {isSel && (
          <path d={path} stroke="#137fec" strokeWidth={strokeWidth + 6} strokeOpacity="0.2" fill="none" className="pointer-events-none" />
        )}
        <path
          d={path} stroke={color} strokeWidth={isSel || isHov ? strokeWidth + 0.5 : strokeWidth}
          strokeDasharray={conn?.lineStyle === 'dashed' || customPoints ? '5,5' : 'none'}
          fill="none"
          className="pointer-events-none transition-all duration-100"
        />
        {(conn?.arrowEnd || customPoints) && renderArrowHead(x2, y2, angleEnd, color, arrowheadScale)}
        {conn?.arrowStart && renderArrowHead(x1, y1, angleStart, color, arrowheadScale)}

        {conn?.text && (
          <foreignObject x={mx - 50} y={my - 12} width="100" height="24" className="pointer-events-none">
            <div className="flex items-center justify-center w-full h-full">
              <span className="px-2 py-0.5 bg-white/90 border border-gray-100 rounded text-[10px] text-gray-600 font-medium shadow-sm truncate">
                {conn.text}
              </span>
            </div>
          </foreignObject>
        )}
      </g>
    );
  };

  const canvasCursor = state.activeTool === 'hand'
    ? (mode === 'panning' ? 'cursor-grabbing' : 'cursor-grab')
    : 'cursor-default';

  return (
    <div ref={containerRef} className={`w-full h-full relative outline-none overflow-hidden ${canvasCursor}`}
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="absolute transition-transform duration-75 ease-out" style={{ transform: `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`, transformOrigin: '0 0' }}>
        <svg className="absolute top-0 left-0 w-[10000px] h-[10000px] pointer-events-none overflow-visible">
          {state.connections.map(c => renderConnection(c))}
          {tempConn && renderConnection(null, tempConn)}
        </svg>

        {state.nodes.map(node => (
          <div key={node.id} onMouseDown={(e) => handleNodeMouseDown(e, node.id)} onDoubleClick={() => state.activeTool === 'select' && setEditingId(node.id)}
            className={`absolute ${state.selectedNodeId === node.id ? 'z-20' : 'z-10'} ${state.activeTool === 'select' ? 'cursor-move' : ''}`} style={{ left: node.x, top: node.y, width: node.width, height: node.height }}>
            <svg width={node.width} height={node.height} className="absolute top-0 left-0 overflow-visible">
              <ShapeRenderer node={node} isSelected={state.selectedNodeId === node.id} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none overflow-hidden">
              {editingId === node.id ? (
                <textarea autoFocus className="w-full h-full bg-transparent border-none outline-none resize-none text-center pointer-events-auto"
                  style={{ fontSize: node.fontSize, fontFamily: node.fontFamily, fontWeight: node.fontWeight, color: node.textColor, textAlign: node.textAlign }}
                  value={node.text} onChange={(e) => onUpdateNode(node.id, { text: e.target.value }, false)} onBlur={() => { setEditingId(null); onPushHistory(); }} />
              ) : (
                <span className="text-center w-full break-words select-none leading-tight" style={{ fontSize: node.fontSize, fontWeight: node.fontWeight, textAlign: node.textAlign, fontFamily: node.fontFamily, color: node.textColor }}>
                  {node.text}
                </span>
              )}
            </div>
            {state.selectedNodeId === node.id && editingId !== node.id && state.activeTool === 'select' && (
              <>
                {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(h => (
                  <div key={h} onMouseDown={(e) => handleResizeStart(e, node, h)} className={`absolute w-3 h-3 bg-white border-2 border-[#137fec] z-30 cursor-${h}-resize shadow-sm hover:scale-125 transition-transform`}
                    style={{ left: h.includes('w') ? -4 : h.includes('e') ? '100%' : '50%', top: h.includes('n') ? -4 : h.includes('s') ? '100%' : '50%', transform: 'translate(-50%, -50%)' }} />
                ))}
                {(['top', 'right', 'bottom', 'left'] as const).map(s => (
                  <div key={s} onMouseDown={(e) => handleConnectStart(e, node, s)} className="absolute w-4 h-4 bg-white border border-[#137fec] rounded-full flex items-center justify-center cursor-crosshair hover:bg-[#137fec] hover:text-white transition-all shadow-md z-40"
                    style={{ top: s === 'top' ? -12 : s === 'bottom' ? 'calc(100% + 12px)' : '50%', left: s === 'left' ? -12 : s === 'right' ? 'calc(100% + 12px)' : '50%', transform: 'translate(-50%, -50%)' }}>
                    <span className="material-symbols-outlined text-[10px] font-bold">add</span>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
      <div className="absolute bottom-6 left-6 flex flex-col items-start gap-2 z-20">
        <button
          onClick={() => onPan({ x: 50, y: 50 })}
          className="flex items-center justify-center w-10 h-10 shrink-0 aspect-square bg-white border border-gray-200 rounded-lg shadow-lg text-gray-500 hover:text-[#137fec] transition-colors"
          title="Reset View"
        >
          <span className="material-symbols-outlined text-[20px]">center_focus_strong</span>
        </button>
      </div>
      <div className="absolute bottom-6 right-6 px-3 py-1.5 bg-black/5 text-[10px] text-gray-500 rounded-full font-medium shadow-sm">Shift+Drag: Pan • H: Hand Tool • V: Select Tool • Click Connection: Select</div>
    </div>
  );
};

export default Canvas;
