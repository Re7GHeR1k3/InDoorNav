import React from 'react';
import type { NodeProps, Node } from '@xyflow/react';
import type { RedGridNodeData } from '../../types/navigation';

export const RedGridNode: React.FC<NodeProps<Node<RedGridNodeData>>> = ({ data }) => {
    const { pxPerMeter, widthMeters = 30, heightMeters = 20, isInteractive } = data;
    const step = Math.max(pxPerMeter, 8);
    const totalWidthPx = widthMeters * step;
    const totalHeightPx = heightMeters * step;

    return (
        <div
            style={{
                width: totalWidthPx,
                height: totalHeightPx,
                position: 'relative',
                userSelect: 'none',
                cursor: isInteractive ? 'move' : 'default',
                border: isInteractive ? '2px solid #dc2626' : '1px solid rgba(220, 38, 38, 0.6)',
                backgroundColor: isInteractive ? 'rgba(254, 226, 226, 0.15)' : 'transparent',
                backgroundImage: `
          linear-gradient(to right, rgba(220, 38, 38, 0.55) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(220, 38, 38, 0.55) 1px, transparent 1px)
        `,
                backgroundSize: `${step}px ${step}px`,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: -24,
                    left: 0,
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                }}
            >
                Net: 1 sq. = 1m ({pxPerMeter} px) | Field: {widthMeters}×{heightMeters} m
                {isInteractive ? ' — move by mouse' : ''}
            </div>
        </div>
    );
};