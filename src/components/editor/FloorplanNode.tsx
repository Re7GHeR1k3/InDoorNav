import React, { useState } from 'react';
import type { NodeProps, Node } from '@xyflow/react';
import type { FloorplanNodeData } from '../../types/navigation';

export const FloorplanNode: React.FC<NodeProps<Node<FloorplanNodeData>>> = ({ data }) => {
    const { imageUrl, scale = 1, isInteractive } = data;
    const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);

    if (!imageUrl) return null;

    return (
        <div
            style={{
                position: 'relative',
                userSelect: 'none',
                outline: isInteractive ? '3px dashed #2563eb' : 'none',
                cursor: isInteractive ? 'move' : 'default',
            }}
        >
            {isInteractive && (
                <div
                    style={{
                        position: 'absolute',
                        top: -28,
                        left: 0,
                        backgroundColor: '#2563eb',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 4,
                        whiteSpace: 'nowrap',
                    }}
                >
                    Plan movement mode (scale: {Math.round(scale * 100)}%)
                </div>
            )}
            <img
                src={imageUrl}
                alt="Floorplan"
                onLoad={(e) => {
                    setNaturalSize({
                        w: e.currentTarget.naturalWidth,
                        h: e.currentTarget.naturalHeight,
                    });
                }}
                style={{
                    display: 'block',
                    maxWidth: 'none',
                    opacity: 0.75,
                    width: naturalSize ? naturalSize.w * scale : 'auto',
                    height: naturalSize ? naturalSize.h * scale : 'auto',
                }}
                draggable={false}
            />
        </div>
    );
};