import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    ReactFlowProvider,
    useReactFlow,
    type Connection,
    type NodeTypes,
    type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
    Upload,
    Save,
    Code,
    MapPin,
    MousePointer,
    QrCode,
    Trash2,
    Move,
    LogOut,
} from 'lucide-react';

import type { AppNode, AppEdge, GpsAnchor } from '../../types/navigation';
import { CustomArUcoNode } from './CustomArUcoNode';
import { CustomCorridorEdge } from './CustomCorridorEdge';
import { FloorplanNode } from './FloorplanNode';
import { ScaleCalibration } from './ScaleCalibration';
import { NodeSidebar } from './NodeSidebar';
import { GpsPickerModal } from '../gps/GpsPickerModal';
import { saveIndoorMapToSupabase, supabase } from '../../api/supabaseClient';
import {
    calculateDistanceMeters,
    calculateAzimuthDeg,
    getPixelDistance,
} from '../../utils/geometry';
import { serializeGraphToJSON } from '../../utils/graphSerializer';

const FLOORPLAN_NODE_ID = 'floorplan_bg_node';

type EditorTool = 'select' | 'add_aruco' | 'move_floorplan' | 'delete';

const MapEditorInner: React.FC = () => {
    const { screenToFlowPosition } = useReactFlow();

    const [activeTool, setActiveTool] = useState<EditorTool>('add_aruco');

    const [buildingName, setBuildingName] = useState<string>('');
    const [floorLevel, setFloorLevel] = useState<number>(0);
    const [floorplanUrl, setFloorplanUrl] = useState<string>('');
    const [floorplanScale, setFloorplanScale] = useState<number>(1);
    const [markerSize, setMarkerSize] = useState<number>(46);

    const [pxPerMeter, setPxPerMeter] = useState<number>(40);
    const [northOffsetDeg, setNorthOffsetDeg] = useState<number>(0);

    const [nextArucoId, setNextArucoId] = useState<number>(1);

    const [gpsAnchor, setGpsAnchor] = useState<GpsAnchor>({
        latitude: 54.35249339443582,
        longitude: 18.647663636751613,
        geofence_radius_meters: 30,
    });
    const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [exportedJson, setExportedJson] = useState<any>(null);

    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([]);

    const nodeTypes: NodeTypes = useMemo(
        () => ({
            aruco: CustomArUcoNode,
            floorplan: FloorplanNode,
        }),
        []
    );

    const edgeTypes: EdgeTypes = useMemo(
        () => ({
            corridor: CustomCorridorEdge,
        }),
        []
    );

    // Синхронизация подложки плана этажа
    useEffect(() => {
        if (!floorplanUrl) return;
        const isInteractive = activeTool === 'move_floorplan';

        setNodes((nds) => {
            const existing = nds.find((n) => n.id === FLOORPLAN_NODE_ID);
            const bgNode: AppNode = {
                id: FLOORPLAN_NODE_ID,
                type: 'floorplan',
                position: existing ? existing.position : { x: 400, y: 300 },
                draggable: isInteractive,
                selectable: isInteractive,
                connectable: false,
                zIndex: -20,
                className: isInteractive ? '' : 'layer-locked',
                data: {
                    imageUrl: floorplanUrl,
                    scale: floorplanScale,
                    isInteractive,
                },
            };
            return existing
                ? nds.map((n) => (n.id === FLOORPLAN_NODE_ID ? bgNode : n))
                : [bgNode, ...nds];
        });
    }, [floorplanUrl, floorplanScale, activeTool, setNodes]);

    // Синхронизация глобального размера маркеров ArUco
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) =>
                node.type === 'aruco'
                    ? { ...node, data: { ...node.data, markerSize } }
                    : node
            )
        );
    }, [markerSize, setNodes]);

    // Автопересчет длины и азимута ребер (от центра до центра)
    useEffect(() => {
        setEdges((eds) =>
            eds.map((edge) => {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return edge;

                const distanceMeters = calculateDistanceMeters(
                    sourceNode.position,
                    targetNode.position,
                    pxPerMeter
                );
                const azimuthDeg = calculateAzimuthDeg(
                    sourceNode.position,
                    targetNode.position,
                    northOffsetDeg
                );

                return { ...edge, data: { distanceMeters, azimuthDeg } };
            })
        );
    }, [nodes, pxPerMeter, northOffsetDeg, setEdges]);

    const handleFloorplanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFloorplanUrl(URL.createObjectURL(file));
    };

    // Клик по холсту: благодаря nodeOrigin={[0.5, 0.5]} координаты position.x/y — это точный ЦЕНТР маркера
    const handlePaneClick = useCallback(
        (event: React.MouseEvent) => {
            if (activeTool === 'add_aruco') {
                const position = screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                });

                const newId = `node_${Date.now()}`;
                const newNode: AppNode = {
                    id: newId,
                    type: 'aruco',
                    position: { x: position.x, y: position.y },
                    data: {
                        aruco_id: nextArucoId,
                        label: `Marker ${nextArucoId}`,
                        markerSize,
                    },
                };

                setNodes((nds) => [...nds, newNode]);
                setNextArucoId((prev) => prev + 1);
                setSelectedNodeId(newId);
                setSelectedEdgeId(null);
            } else {
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
            }
        },
        [activeTool, nextArucoId, markerSize, screenToFlowPosition, setNodes]
    );

    const onConnect = useCallback(
        (connection: Connection) => {
            const sourceNode = nodes.find((n) => n.id === connection.source);
            const targetNode = nodes.find((n) => n.id === connection.target);
            if (!sourceNode || !targetNode) return;

            const distanceMeters = calculateDistanceMeters(
                sourceNode.position,
                targetNode.position,
                pxPerMeter
            );
            const azimuthDeg = calculateAzimuthDeg(
                sourceNode.position,
                targetNode.position,
                northOffsetDeg
            );

            const newEdge: AppEdge = {
                ...connection,
                id: `edge_${connection.source}_${connection.target}_${Date.now()}`,
                type: 'corridor',
                data: { distanceMeters, azimuthDeg },
            };

            setEdges((eds) => addEdge(newEdge, eds));
        },
        [nodes, pxPerMeter, northOffsetDeg, setEdges]
    );

    const handleUpdateNode = (
        id: string,
        updatedData: { aruco_id?: number; label?: string }
    ) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id && node.type === 'aruco'
                    ? { ...node, data: { ...node.data, ...updatedData } }
                    : node
            )
        );
    };

    const handleDeleteNode = useCallback(
        (id: string) => {
            setNodes((nds) => nds.filter((n) => n.id !== id));
            setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
            setSelectedNodeId(null);
        },
        [setNodes, setEdges]
    );

    const selectedEdgePixelLength = useMemo(() => {
        if (!selectedEdgeId) return null;
        const edge = edges.find((e) => e.id === selectedEdgeId);
        if (!edge) return null;
        const s = nodes.find((n) => n.id === edge.source);
        const t = nodes.find((n) => n.id === edge.target);
        if (!s || !t) return null;
        return getPixelDistance(s.position, t.position);
    }, [selectedEdgeId, edges, nodes]);

    const selectedNode = useMemo(() => {
        const found = nodes.find((n) => n.id === selectedNodeId);
        return found && found.type === 'aruco' ? found : null;
    }, [nodes, selectedNodeId]);

    const handleSaveMap = async () => {
        const json = serializeGraphToJSON({
            buildingName: buildingName || 'Unnamed Building',
            floorLevel,
            gpsAnchor,
            pxPerMeter,
            northOffsetDeg,
            nodes,
            edges,
        });
        setExportedJson(json);

        try {
            setIsSaving(true);
            await saveIndoorMapToSupabase(
                buildingName || 'Unnamed Building',
                floorLevel,
                gpsAnchor.latitude,
                gpsAnchor.longitude,
                gpsAnchor.geofence_radius_meters,
                json
            );
            alert('Map successfully saved to Supabase database!');
        } catch (err: any) {
            alert(`Error saving to database: ${err?.message || 'Access denied'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                backgroundColor: '#f8fafc',
            }}
        >
            {/* Верхняя панель инструментов */}
            <header
                style={{
                    height: 48,
                    backgroundColor: '#f1f5f9',
                    borderBottom: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 12px',
                    flexShrink: 0,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="font-bold text-xs text-slate-700 mr-2">
            InDoorNav Admin Panel
          </span>

                    <button
                        type="button"
                        onClick={() => setActiveTool('select')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition ${
                            activeTool === 'select'
                                ? 'bg-blue-600 text-white border-blue-700 shadow-inner'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                    >
                        <MousePointer className="w-3.5 h-3.5" />
                        <span>cursor</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTool('add_aruco')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition ${
                            activeTool === 'add_aruco'
                                ? 'bg-blue-600 text-white border-blue-700 shadow-inner'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                    >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>+ ArUco marker</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTool('move_floorplan')}
                        disabled={!floorplanUrl}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium border transition ${
                            activeTool === 'move_floorplan'
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-inner'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 disabled:opacity-40'
                        }`}
                    >
                        <Move className="w-3.5 h-3.5" />
                        <span>Move Photo</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTool('delete')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition ${
                            activeTool === 'delete'
                                ? 'bg-red-600 text-white border-red-700 shadow-inner'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                    </button>

                    <div className="h-5 w-[1px] bg-slate-300 mx-1" />

                    <input
                        type="text"
                        value={buildingName}
                        onChange={(e) => setBuildingName(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 w-40"
                        placeholder="Building name"
                    />
                    <label className="text-xs text-slate-600 flex items-center gap-1">
                        Floor:
                        <input
                            type="number"
                            value={floorLevel}
                            onChange={(e) => setFloorLevel(Number(e.target.value))}
                            className="w-12 bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-mono"
                        />
                    </label>
                </div>

                {/* Правая группа */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <label className="cursor-pointer flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium px-2.5 py-1.5 rounded transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Floor Map</span>
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={handleFloorplanUpload}
                            className="hidden"
                        />
                    </label>

                    <button
                        type="button"
                        onClick={() => setIsGpsModalOpen(true)}
                        className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium px-2.5 py-1.5 rounded transition"
                    >
                        <MapPin className="w-3.5 h-3.5 text-red-600" />
                        <span>
              GPS ({gpsAnchor.latitude.toFixed(3)}, {gpsAnchor.longitude.toFixed(3)})
            </span>
                    </button>

                    <button
                        type="button"
                        disabled={isSaving}
                        onClick={handleSaveMap}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-medium px-3 py-1.5 rounded shadow-sm transition"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Saving...' : 'Save JSON'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-1 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-300 text-xs font-medium px-2.5 py-1.5 rounded transition"
                        title="Sign Out"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            </header>

            {/* Основная рабочая область */}
            <div style={{ display: 'flex', flex: 1, minHeight: 0, width: '100%' }}>
                <div
                    style={{
                        flex: 1,
                        height: '100%',
                        backgroundColor: '#ffffff',
                        cursor: activeTool === 'add_aruco' ? 'crosshair' : 'default',
                    }}
                >
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeOrigin={[0.5, 0.5]}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onPaneClick={handlePaneClick}
                        onNodeClick={(_, node) => {
                            if (node.type !== 'aruco') return;
                            if (activeTool === 'delete') {
                                handleDeleteNode(node.id);
                            } else {
                                setSelectedNodeId(node.id);
                                setSelectedEdgeId(null);
                            }
                        }}
                        onEdgeClick={(_, edge) => {
                            if (activeTool === 'delete') {
                                setEdges((eds) => eds.filter((e) => e.id !== edge.id));
                            } else {
                                setSelectedEdgeId(edge.id);
                                setSelectedNodeId(null);
                            }
                        }}
                        style={{ backgroundColor: '#ffffff' }}
                    >
                        <Background
                            variant={BackgroundVariant.Lines}
                            color="#e2e8f0"
                            gap={24}
                            lineWidth={1}
                        />
                        <Controls />
                        <MiniMap
                            zoomable
                            pannable
                            style={{
                                backgroundColor: '#f8fafc',
                                border: '1px solid #cbd5e1',
                            }}
                        />
                    </ReactFlow>
                </div>

                <aside
                    style={{
                        width: 320,
                        height: '100%',
                        backgroundColor: '#f8fafc',
                        borderLeft: '1px solid #cbd5e1',
                        padding: 12,
                        overflowY: 'auto',
                        flexShrink: 0,
                    }}
                    className="space-y-3"
                >
                    <ScaleCalibration
                        pxPerMeter={pxPerMeter}
                        onChangePxPerMeter={setPxPerMeter}
                        northOffsetDeg={northOffsetDeg}
                        onChangeNorthOffset={setNorthOffsetDeg}
                        selectedEdgePixelLength={selectedEdgePixelLength}
                        markerSize={markerSize}
                        onChangeMarkerSize={setMarkerSize}
                        floorplanScale={floorplanScale}
                        onChangeFloorplanScale={setFloorplanScale}
                    />

                    <NodeSidebar
                        selectedNode={selectedNode}
                        onUpdateNode={handleUpdateNode}
                        onDeleteNode={handleDeleteNode}
                    />

                    {exportedJson && (
                        <div className="bg-slate-900 text-slate-100 rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <Code className="w-3.5 h-3.5" />
                  Adjacency List JSON
                </span>
                                <span>{Object.keys(exportedJson.nodes).length} nodes</span>
                            </div>
                            <pre className="text-[11px] font-mono overflow-x-auto max-h-56 text-emerald-300">
                {JSON.stringify(exportedJson, null, 2)}
              </pre>
                        </div>
                    )}
                </aside>
            </div>

            <GpsPickerModal
                isOpen={isGpsModalOpen}
                onClose={() => setIsGpsModalOpen(false)}
                initialAnchor={gpsAnchor}
                onSave={(newAnchor) => setGpsAnchor(newAnchor)}
            />
        </div>
    );
};

export const MapCanvas: React.FC = () => (
    <ReactFlowProvider>
        <MapEditorInner />
    </ReactFlowProvider>
);