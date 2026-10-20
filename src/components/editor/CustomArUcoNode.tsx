import React, { useEffect, useState, useMemo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { ArUcoNodeData } from '../../types/navigation';

// Кэш оригинального словаря 4x4_1000 с сайта chev.me/arucogen
let cachedDict4x4: number[][] | null = null;
let dictPromise: Promise<number[][] | null> | null = null;

// Резервные байты для популярных ID на случай работы без интернета (0, 1, 2, 19, 101..114)
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
        dictPromise = fetch('https://cdn.jsdelivr.net/gh/okalachev/arucogen@master/dict.json')
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

/**
 * Оригинальный алгоритм распаковки байтов из chev.me/arucogen (main.js)
 */
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

export const CustomArUcoNode: React.FC<NodeProps<Node<ArUcoNodeData>>> = ({
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
    const markerSize = data.markerSize || 46;

    const matrix = useMemo(() => {
        const bytes =
            (cachedDict4x4 && cachedDict4x4[arucoId]) ||
            FALLBACK_4X4[arucoId] ||
            [181, 219];
        return unpackAruco4x4Bytes(bytes);
    }, [arucoId, dictLoaded]);

    const handleStyle = {
        width: 10,
        height: 10,
        background: '#2563eb',
        border: '2px solid #ffffff',
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                userSelect: 'none',
                cursor: 'pointer',
            }}
            title={data.label}
        >
            {/* Универсальные точки соединения со всех 4 сторон */}
            <Handle type="target" position={Position.Top} id="top-target" style={handleStyle} />
            <Handle type="source" position={Position.Top} id="top-source" style={handleStyle} />

            <Handle type="target" position={Position.Right} id="right-target" style={handleStyle} />
            <Handle type="source" position={Position.Right} id="right-source" style={handleStyle} />

            <Handle type="target" position={Position.Bottom} id="bottom-target" style={handleStyle} />
            <Handle type="source" position={Position.Bottom} id="bottom-source" style={handleStyle} />

            <Handle type="target" position={Position.Left} id="left-target" style={handleStyle} />
            <Handle type="source" position={Position.Left} id="left-source" style={handleStyle} />

            {/* Сам ArUco маркер (100% совпадение с chev.me/arucogen) */}
            <div
                style={{
                    padding: 3,
                    backgroundColor: '#ffffff',
                    border: selected ? '2.5px solid #2563eb' : '1.5px solid #0f172a',
                    borderRadius: 4,
                    boxShadow: selected
                        ? '0 0 0 3px rgba(37, 99, 235, 0.25)'
                        : '0 1px 3px rgba(0,0,0,0.15)',
                }}
            >
                <svg
                    width={markerSize}
                    height={markerSize}
                    viewBox="0 0 6 6"
                    shapeRendering="crispEdges"
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

            {/* Подпись ID снизу */}
            <div
                style={{
                    marginTop: 4,
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
                }}
            >
                ID: {arucoId}
            </div>
        </div>
    );
};