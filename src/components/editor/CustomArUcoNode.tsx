import { useEffect, useState, useMemo, type FC } from 'react';
import {
    Handle,
    Position,
    NodeResizer,
    type NodeProps,
    type Node,
} from '@xyflow/react';
import type { ArUcoNodeData } from '../../types/navigation';

// Кэш оригинального словаря 4x4_1000 с сайта chev.me/arucogen
let cachedDict4x4: number[][] | null = null;
let dictPromise: Promise<number[][] | null> | null = null;

const FALLBACK_4X4: Record<number, [number, number]> = {
    0: [181, 219],
    1: [230, 92],
    2: [59, 240],
    19: [118, 175],
    114: [9, 198],
};

function loadChevArucoDict(): Promise<number[][] | null> {
    if (cachedDict4x4) return Promise.resolve(cachedDict4x4);
    if (!dictPromise) {
        dictPromise = fetch(
            'https://cdn.jsdelivr.net/gh/okalachev/arucogen@master/dict.json'
        )
            .then((res) => res.json())
            .then((data) => {
                if (data && data['4x4_1000']) {
                    cachedDict4x4 = data['4x4_1000'];
                    return cachedDict4x4;
                }
                return null;
            })
            .catch(() => null);
    }
    return dictPromise;
}

function unpackAruco4x4Bytes(bytes: number[]): boolean[][] {
    const width = 4;
    const height = 4;
    const bitsCount = width * height;
    const bits: number[] = [];

    for (const byte of bytes) {
        const start = bitsCount - bits.length;
        for (let i = Math.min(7, start - 1); i >= 0; i--) {
            bits.push((byte >> i) & 1);
        }
    }

    const matrix: boolean[][] = [];
    for (let r = 0; r < height; r++) {
        const row: boolean[] = [];
        for (let c = 0; c < width; c++) {
            row.push(bits[r * width + c] === 1);
        }
        matrix.push(row);
    }
    return matrix;
}

export const CustomArUcoNode: FC<NodeProps<Node<ArUcoNodeData>>> = ({
                                                                        data,
                                                                        selected,
                                                                    }) => {
    const [dictLoaded, setDictLoaded] = useState<boolean>(!!cachedDict4x4);

    useEffect(() => {
        if (!cachedDict4x4) {
            loadChevArucoDict().then((res) => {
                if (res) setDictLoaded(true);
            });
        }
    }, []);

    const arucoId = Math.max(0, Math.min(999, Math.floor(data.aruco_id || 0)));

    const matrix = useMemo(() => {
        const bytes =
            (cachedDict4x4 && cachedDict4x4[arucoId]) ||
            FALLBACK_4X4[arucoId] ||
            [181, 219];
        return unpackAruco4x4Bytes(bytes);
    }, [arucoId, dictLoaded]);

    const handleStyle = {
        width: 9,
        height: 9,
        background: '#2563eb',
        border: '2px solid #ffffff',
    };

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                userSelect: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box',
            }}
            title={data.label}
        >
            {/* Рамка растягивания строго по границе квадрата маркера */}
            <NodeResizer
                color="#2563eb"
                isVisible={selected}
                keepAspectRatio
                minWidth={24}
                minHeight={24}
                maxWidth={160}
                maxHeight={160}
                handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
                onResize={(_, params) => {
                    if (data.onResizeMarker) {
                        data.onResizeMarker(Math.round(params.width));
                    }
                }}
            />

            {/* Точки соединения строго на 4 гранях квадрата маркера */}
            <Handle type="target" position={Position.Top} id="top-target" style={handleStyle} />
            <Handle type="source" position={Position.Top} id="top-source" style={handleStyle} />

            <Handle type="target" position={Position.Right} id="right-target" style={handleStyle} />
            <Handle type="source" position={Position.Right} id="right-source" style={handleStyle} />

            <Handle type="target" position={Position.Bottom} id="bottom-target" style={handleStyle} />
            <Handle type="source" position={Position.Bottom} id="bottom-source" style={handleStyle} />

            <Handle type="target" position={Position.Left} id="left-target" style={handleStyle} />
            <Handle type="source" position={Position.Left} id="left-source" style={handleStyle} />

            {/* Сам квадрат ArUco маркера, заполняющий 100% контейнера */}
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    padding: 3,
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    border: selected ? '2px solid #2563eb' : '1.5px solid #0f172a',
                    borderRadius: 4,
                    boxShadow: selected
                        ? '0 0 0 3px rgba(37, 99, 235, 0.25)'
                        : '0 1px 3px rgba(0,0,0,0.15)',
                }}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 6 6"
                    shapeRendering="crispEdges"
                    style={{ display: 'block' }}
                >
                    <rect x="0" y="0" width="6" height="6" fill="#000000" />
                    {matrix.map((row, rIdx) =>
                        row.map((isWhite, cIdx) =>
                            isWhite ? (
                                <rect
                                    key={`${rIdx}-${cIdx}`}
                                    x={cIdx + 1}
                                    y={rIdx + 1}
                                    width="1"
                                    height="1"
                                    fill="#ffffff"
                                />
                            ) : null
                        )
                    )}
                </svg>
            </div>

            {/* Подпись ID вынесена за пределы квадрата, чтобы не смещать рамку и центр */}
            <div
                style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: 5,
                    padding: '1px 6px',
                    backgroundColor: selected ? '#2563eb' : '#ffffff',
                    color: selected ? '#ffffff' : '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                }}
            >
                ID: {arucoId}
            </div>
        </div>
    );
};