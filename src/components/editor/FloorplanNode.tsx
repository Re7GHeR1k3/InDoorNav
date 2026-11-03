import { NodeResizer, type NodeProps } from '@xyflow/react';
import type { FloorplanNodeData } from '../../types/navigation';

export const FloorplanNode = ({ data, selected }: NodeProps) => {
    const nodeData = data as FloorplanNodeData;

    return (
        <div className="relative w-full h-full">
            <NodeResizer
                color="#10b981"
                isVisible={Boolean(nodeData.isInteractive && selected)}
                keepAspectRatio
                minWidth={150}
                minHeight={100}
                handleStyle={{ width: 10, height: 10, borderRadius: 2 }}
            />
            <img
                src={nodeData.imageUrl}
                alt="Floorplan"
                draggable={false}
                className="w-full h-full block select-none pointer-events-none"
            />
        </div>
    );
};