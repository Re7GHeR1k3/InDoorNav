import React from 'react';
import { Trash2, Tag, Hash } from 'lucide-react';
import type { AppNode } from '../../types/navigation';

interface NodeSidebarProps {
    selectedNode: Extract<AppNode, { type: 'aruco' }> | null;
    onUpdateNode: (id: string, data: { aruco_id?: number; label?: string }) => void;
    onDeleteNode: (id: string) => void;
}

export const NodeSidebar: React.FC<NodeSidebarProps> = ({
                                                            selectedNode,
                                                            onUpdateNode,
                                                            onDeleteNode,
                                                        }) => {
    if (!selectedNode) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-500">
                Click on a marker on the map to change its ArUco ID and text-to-speech (TTS) label.
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-semibold text-sm text-slate-800">
                    Marker properties #{selectedNode.data.aruco_id}
                </h3>
                <button
                    type="button"
                    onClick={() => onDeleteNode(selectedNode.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                    title="Delete marker"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        ArUco ID
                    </label>
                    <input
                        type="number"
                        value={selectedNode.data.aruco_id}
                        onChange={(e) =>
                            onUpdateNode(selectedNode.id, { aruco_id: Number(e.target.value) })
                        }
                        className="w-full text-sm font-mono border border-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        Voice label (label for TTS)
                    </label>
                    <input
                        type="text"
                        value={selectedNode.data.label}
                        onChange={(e) =>
                            onUpdateNode(selectedNode.id, { label: e.target.value })
                        }
                        placeholder="Example: Main entrance"
                        className="w-full text-sm border border-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500 font-mono">
                    <span>X: {Math.round(selectedNode.position.x)} px</span>
                    <span>Y: {Math.round(selectedNode.position.y)} px</span>
                </div>
            </div>
        </div>
    );
};