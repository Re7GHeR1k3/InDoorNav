import {
    BaseEdge,
    EdgeLabelRenderer,
    getStraightPath,
    type EdgeProps,
    type Edge,
} from '@xyflow/react';
import type { CorridorEdgeData } from '../../types/navigation';

export const CustomCorridorEdge: React.FC<EdgeProps<Edge<CorridorEdgeData>>> = ({
                                                                                    id,
                                                                                    sourceX,
                                                                                    sourceY,
                                                                                    targetX,
                                                                                    targetY,
                                                                                    data,
                                                                                    selected,
                                                                                }) => {
    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={{
                    strokeWidth: selected ? 4 : 3,
                    stroke: selected ? '#2563eb' : '#0f172a',
                }}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan bg-slate-900/90 text-white text-[11px] font-mono px-2 py-0.5 rounded-full shadow border border-slate-700"
                >
                    {data?.distanceMeters ?? 0} м | {data?.azimuthDeg ?? 0}°
                </div>
            </EdgeLabelRenderer>
        </>
    );
};