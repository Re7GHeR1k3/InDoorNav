export interface Point {
    x: number;
    y: number;
}

/**
 * Евклидово расстояние между двумя точками в пикселях
 */
export function getPixelDistance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.hypot(dx, dy);
}

/**
 * Перевод пиксельного расстояния в метры по коэффициенту калибровки
 */
export function calculateDistanceMeters(
    p1: Point,
    p2: Point,
    pxPerMeter: number
): number {
    if (pxPerMeter <= 0) return 0;
    const pxDist = getPixelDistance(p1, p2);
    return Number((pxDist / pxPerMeter).toFixed(2));
}

/**
 * Расчет магнитного азимута от 0° до 360°
 * На холсте ось Y направлена вниз, поэтому Север (вверх) — это -dy
 */
export function calculateAzimuthDeg(
    p1: Point,
    p2: Point,
    northOffsetDeg: number = 0
): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    // Угол относительно верха холста (0° = вверх, 90° = вправо)
    const rawAngle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    const normalizedCanvasAngle = (rawAngle + 360) % 360;

    // Учитываем поправку на реальный магнитный север здания
    return Math.round((normalizedCanvasAngle + northOffsetDeg + 360) % 360);
}