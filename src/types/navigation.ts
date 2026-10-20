import type { Node, Edge } from '@xyflow/react';

// Данные внутри узла-маркера ArUco
export interface ArUcoNodeData extends Record<string, unknown> {
    aruco_id: number;
    label: string;
    markerSize?: number; // Размер маркера в пикселях
}

// Данные внутри узла плана этажа (теперь с масштабом и отдельно от сетки)
export interface FloorplanNodeData extends Record<string, unknown> {
    imageUrl: string;
    scale: number; // Масштаб картинки (1 = 100%)
    isInteractive?: boolean;
}

// Данные внутри отдельного независимого узла «Красной сетки»
export interface RedGridNodeData extends Record<string, unknown> {
    pxPerMeter: number;
    widthMeters: number;
    heightMeters: number;
    isInteractive?: boolean;
}

export interface CorridorEdgeData extends Record<string, unknown> {
    distanceMeters: number;
    azimuthDeg: number;
}

export type AppNode =
    | Node<ArUcoNodeData, 'aruco'>
    | Node<FloorplanNodeData, 'floorplan'>
    | Node<RedGridNodeData, 'redGrid'>;

export type AppEdge = Edge<CorridorEdgeData>;

export interface SerializedNode {
    aruco_id: number;
    label: string;
    x: number;
    y: number;
    neighbors: string[];
}

export interface GpsAnchor {
    latitude: number;
    longitude: number;
    geofence_radius_meters: number;
}

export interface IndoorMapJSON {
    schema_version: string;
    building_info: {
        name: string;
        floor_level: number;
        gps_anchor: GpsAnchor;
    };
    calibration: {
        px_per_meter: number;
        north_offset_deg: number;
    };
    nodes: Record<string, SerializedNode>;
}