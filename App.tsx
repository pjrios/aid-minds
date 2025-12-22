
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import Canvas from './components/Canvas';
import { AppState, DiagramNode, ShapeType, Connection, HistoryItem, InteractionTool } from './types';

const INITIAL_NODES: DiagramNode[] = [
  {
    id: '1',
    type: 'circle',
    x: 100,
    y: 100,
    width: 120,
    height: 60,
    text: 'Start',
    fill: '#ffffff',
    stroke: '#111418',
    textColor: '#111418',
    strokeWidth: 2,
    fontSize: 14,
    fontFamily: 'Inter',
    textAlign: 'center',
    fontWeight: 'bold',
  }
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    diagramName: 'Untitled Diagram',
    nodes: INITIAL_NODES,
    connections: [],
    selectedNodeId: null,
    selectedConnectionId: null,
    activeTool: 'select',
    zoom: 1,
    pan: { x: 50, y: 50 },
    history: [],
    future: [],
  });

  const [isAnyEditing, setIsAnyEditing] = useState(false);

  const pushToHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: [...prev.history, { 
        nodes: [...prev.nodes], 
        connections: [...prev.connections],
        diagramName: prev.diagramName 
      }].slice(-50),
      future: []
    }));
  }, []);

  const handleUndo = useCallback(() => {
    setState(prev => {
      if (prev.history.length === 0) return prev;
      const last = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);
      return {
        ...prev,
        nodes: last.nodes,
        connections: last.connections,
        diagramName: last.diagramName,
        history: newHistory,
        future: [{ nodes: prev.nodes, connections: prev.connections, diagramName: prev.diagramName }, ...prev.future]
      };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setState(prev => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      return {
        ...prev,
        nodes: next.nodes,
        connections: next.connections,
        diagramName: next.diagramName,
        future: newFuture,
        history: [...prev.history, { nodes: prev.nodes, connections: prev.connections, diagramName: prev.diagramName }]
      };
    });
  }, []);

  const handleSelectNode = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedNodeId: id, selectedConnectionId: null }));
  }, []);

  const handleSelectConnection = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedConnectionId: id, selectedNodeId: null }));
  }, []);

  const handleUpdateNode = useCallback((id: string, updates: Partial<DiagramNode>, isFinal: boolean = true) => {
    if (isFinal) pushToHistory();
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => node.id === id ? { ...node, ...updates } : node)
    }));
  }, [pushToHistory]);

  const handleUpdateConnection = useCallback((id: string, updates: Partial<Connection>) => {
    pushToHistory();
    setState(prev => ({
      ...prev,
      connections: prev.connections.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  }, [pushToHistory]);

  const handleAddNode = useCallback((type: ShapeType) => {
    pushToHistory();
    const isTextType = type === 'text';
    const newNode: DiagramNode = {
      id: Date.now().toString(),
      type,
      x: (300 - state.pan.x) / state.zoom,
      y: (200 - state.pan.y) / state.zoom,
      width: 120,
      height: 60,
      text: isTextType ? 'Label' : 'New ' + type,
      fill: isTextType ? 'transparent' : '#ffffff',
      stroke: isTextType ? 'transparent' : '#111418',
      textColor: '#111418',
      strokeWidth: isTextType ? 0 : 2,
      fontSize: 14,
      fontFamily: 'Inter',
      textAlign: 'center',
      fontWeight: 'normal',
    };
    setState(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      selectedNodeId: newNode.id,
      selectedConnectionId: null,
      activeTool: 'select'
    }));
  }, [state.pan, state.zoom, pushToHistory]);

  const handleAddConnection = useCallback((from: string, to: string) => {
    if (from === to) return;
    pushToHistory();
    const id = `conn_${Date.now()}`;
    setState(prev => ({
      ...prev,
      connections: [...prev.connections, { 
        id, from, to, color: '#9ca3af', strokeWidth: 2, arrowEnd: true, lineStyle: 'solid', text: ''
      }]
    }));
  }, [pushToHistory]);

  const handleDeleteSelected = useCallback(() => {
    if (state.selectedNodeId) {
      pushToHistory();
      setState(prev => ({
        ...prev,
        nodes: prev.nodes.filter(n => n.id !== prev.selectedNodeId),
        connections: prev.connections.filter(c => c.from !== prev.selectedNodeId && c.to !== prev.selectedNodeId),
        selectedNodeId: null
      }));
    } else if (state.selectedConnectionId) {
      pushToHistory();
      setState(prev => ({
        ...prev,
        connections: prev.connections.filter(c => c.id !== prev.selectedConnectionId),
        selectedConnectionId: null
      }));
    }
  }, [state.selectedNodeId, state.selectedConnectionId, pushToHistory]);

  const handleToolChange = useCallback((tool: InteractionTool) => {
    setState(prev => ({ ...prev, activeTool: tool }));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnyEditing) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y' || (e.key === 'Z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      }
      if (e.key === 'v') handleToolChange('select');
      if (e.key === 'h') handleToolChange('hand');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteSelected, handleUndo, handleRedo, isAnyEditing, handleToolChange]);

  const handleNew = useCallback(() => {
    if (confirm('Create a new diagram? All unsaved changes will be lost.')) {
      setState({
        diagramName: 'Untitled Diagram',
        nodes: INITIAL_NODES,
        connections: [],
        selectedNodeId: null,
        selectedConnectionId: null,
        activeTool: 'select',
        zoom: 1,
        pan: { x: 50, y: 50 },
        history: [],
        future: [],
      });
    }
  }, []);

  const handleExport = useCallback(() => {
    const data = JSON.stringify({
      diagramName: state.diagramName,
      nodes: state.nodes,
      connections: state.connections
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.diagramName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const content = JSON.parse(re.target?.result as string);
          pushToHistory();
          setState(prev => ({
            ...prev,
            diagramName: content.diagramName || 'Imported Diagram',
            nodes: content.nodes || [],
            connections: content.connections || [],
            selectedNodeId: null,
            selectedConnectionId: null,
          }));
        } catch (err) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [pushToHistory]);

  const selectedNode = state.nodes.find(n => n.id === state.selectedNodeId) || null;
  const selectedConnection = state.connections.find(c => c.id === state.selectedConnectionId) || null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f6f7f8] overflow-hidden select-none">
      <Header 
        diagramName={state.diagramName}
        setDiagramName={(name) => setState(p => ({ ...p, diagramName: name }))}
        onNew={handleNew}
        onImport={handleImport}
        onExport={handleExport}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onDelete={handleDeleteSelected}
        onResetView={() => setState(p => ({ ...p, zoom: 1, pan: { x: 50, y: 50 } }))}
        onEditStateChange={setIsAnyEditing}
      />
      <Toolbar 
        activeTool={state.activeTool}
        onToolChange={handleToolChange}
        zoom={state.zoom} 
        onZoomIn={() => setState(p => ({ ...p, zoom: Math.min(3, p.zoom + 0.1) }))}
        onZoomOut={() => setState(p => ({ ...p, zoom: Math.max(0.2, p.zoom - 0.1) }))}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={state.history.length > 0}
        canRedo={state.future.length > 0}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        <SidebarLeft onAddShape={handleAddNode} />
        
        <main className="flex-1 relative overflow-hidden bg-grid">
          <Canvas 
            state={state} 
            onSelectNode={handleSelectNode} 
            onSelectConnection={handleSelectConnection}
            onUpdateNode={handleUpdateNode}
            onAddConnection={handleAddConnection}
            onPan={(pan) => setState(p => ({ ...p, pan }))}
            onPushHistory={pushToHistory}
            onEditStateChange={setIsAnyEditing}
          />
        </main>
        
        {(selectedNode || selectedConnection) && (
          <SidebarRight 
            node={selectedNode} 
            connection={selectedConnection}
            onUpdateNode={(updates) => handleUpdateNode(selectedNode!.id, updates)}
            onUpdateConnection={(updates) => handleUpdateConnection(selectedConnection!.id, updates)}
            onDelete={handleDeleteSelected}
            onClose={() => {
              handleSelectNode(null);
              handleSelectConnection(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
