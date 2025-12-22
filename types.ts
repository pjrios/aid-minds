
export type ShapeType = 'rect' | 'circle' | 'diamond' | 'triangle' | 'database' | 'document' | 'io' | 'hexagon' | 'cloud' | 'cylinder' | 'parallelogram' | 'text';
export type InteractionTool = 'select' | 'hand';

export interface DiagramNode {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fill: string;
  stroke: string;
  textColor: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  text?: string;
  color?: string;
  strokeWidth?: number;
  lineStyle?: 'solid' | 'dashed';
  arrowStart?: boolean;
  arrowEnd?: boolean;
}

export interface HistoryItem {
  nodes: DiagramNode[];
  connections: Connection[];
  diagramName: string;
}

export interface AppState {
  diagramName: string;
  nodes: DiagramNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  activeTool: InteractionTool;
  zoom: number;
  pan: { x: number; y: number };
  history: HistoryItem[];
  future: HistoryItem[];
}
