import type { AppNode, AppEdge, GpsAnchor, IndoorMapJSON, SerializedNode } from '../types/navigation';

interface SerializeParams {
    buildingName: string;
    floorLevel: number;
    gpsAnchor: GpsAnchor;
    pxPerMeter: number;
    northOffsetDeg: number;
    nodes: AppNode[];
    edges: AppEdge[];
}

export function serializeGraphToJSON({
                                         buildingName,
                                         floorLevel,
                                         gpsAnchor,
                                         pxPerMeter,
                                         northOffsetDeg,
                                         nodes,
                                         edges,
                                     }: SerializeParams): IndoorMapJSON {
    // Берем только узлы-маркеры (игнорируем служебный узел подложки)
    const arucoNodes = nodes.filter(
        (n): n is Extract<AppNode, { type: 'aruco' }> => n.type === 'aruco'
    );

    // Карта соответствия внутреннего ID узла React Flow -> строковому ArUco ID
    const flowIdToArucoKey = new Map<string, string>();
    const serializedNodes: Record<string, SerializedNode> = {};

    for (const node of arucoNodes) {
        const key = String(node.data.aruco_id);
        flowIdToArucoKey.set(node.id, key);

        serializedNodes[key] = {
            aruco_id: node.data.aruco_id,
            label: node.data.label.trim() || `Маркер ${key}`,
            x: Math.round(node.position.x),
            y: Math.round(node.position.y),
            neighbors: [],
        };
    }

    // Заполняем двунаправленный список смежности (neighbors)
    for (const edge of edges) {
        const sourceKey = flowIdToArucoKey.get(edge.source);
        const targetKey = flowIdToArucoKey.get(edge.target);

        if (sourceKey && targetKey && sourceKey !== targetKey) {
            const sourceNeighbors = serializedNodes[sourceKey].neighbors;
            const targetNeighbors = serializedNodes[targetKey].neighbors;

            if (!sourceNeighbors.includes(targetKey)) {
                sourceNeighbors.push(targetKey);
            }
            if (!targetNeighbors.includes(sourceKey)) {
                targetNeighbors.push(sourceKey);
            }
        }
    }

    return {
        schema_version: '1.1.0',
        building_info: {
            name: buildingName,
            floor_level: floorLevel,
            gps_anchor: gpsAnchor,
        },
        calibration: {
            px_per_meter: Number(pxPerMeter.toFixed(2)),
            north_offset_deg: northOffsetDeg,
        },
        nodes: serializedNodes,
    };
}