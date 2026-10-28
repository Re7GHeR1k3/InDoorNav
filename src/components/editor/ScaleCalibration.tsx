import React, { useState } from 'react';
import { Ruler, Compass, Maximize2, Image as ImageIcon } from 'lucide-react';

interface ScaleCalibrationProps {
    pxPerMeter: number;
    onChangePxPerMeter: (val: number) => void;
    northOffsetDeg: number;
    onChangeNorthOffset: (val: number) => void;
    selectedEdgePixelLength: number | null;
    markerSize: number;
    onChangeMarkerSize: (val: number) => void;
    floorplanScale: number;
    onChangeFloorplanScale: (val: number) => void;
}

export const ScaleCalibration: React.FC<ScaleCalibrationProps> = ({
                                                                      pxPerMeter,
                                                                      onChangePxPerMeter,
                                                                      northOffsetDeg,
                                                                      onChangeNorthOffset,
                                                                      selectedEdgePixelLength,
                                                                      markerSize,
                                                                      onChangeMarkerSize,
                                                                      floorplanScale,
                                                                      onChangeFloorplanScale,
                                                                  }) => {
    const [realMetersInput, setRealMetersInput] = useState<string>('10');

    const handleCalibrateByEdge = () => {
        const meters = parseFloat(realMetersInput);
        if (!selectedEdgePixelLength || isNaN(meters) || meters <= 0) return;
        const calculatedScale = selectedEdgePixelLength / meters;
        onChangePxPerMeter(Number(calculatedScale.toFixed(2)));
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-3.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
                <Ruler className="w-4 h-4 text-blue-600" />
                <span>Scale & Dimensions</span>
            </div>

            {/* Размер маркеров ArUco */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
            ArUco Marker Size:
          </span>
                    <span className="font-mono font-bold text-slate-800">{markerSize} px</span>
                </div>
                <input
                    type="range"
                    min="24"
                    max="120"
                    step="2"
                    value={markerSize}
                    onChange={(e) => onChangeMarkerSize(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                />
            </div>

            {/* Масштаб загруженного плана этажа */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            Floorplan Scale:
          </span>
                    <span className="font-mono font-bold text-slate-800">
            {Math.round(floorplanScale * 100)}%
          </span>
                </div>
                <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.05"
                    value={floorplanScale}
                    onChange={(e) => onChangeFloorplanScale(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                />
            </div>

            {/* Калибровка по выбранному ребру */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
                <p className="text-[11px] text-slate-600 leading-tight">
                    {selectedEdgePixelLength ? (
                        <>
                            Selected corridor:{' '}
                            <strong className="text-slate-900">
                                {Math.round(selectedEdgePixelLength)} px
                            </strong>
                            . Real length (m):
                        </>
                    ) : (
                        'Click a corridor line between markers to calibrate scale by real distance:'
                    )}
                </p>

                <div className="flex gap-1.5">
                    <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={realMetersInput}
                        onChange={(e) => setRealMetersInput(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded px-2 py-1"
                    />
                    <button
                        type="button"
                        disabled={!selectedEdgePixelLength}
                        onClick={handleCalibrateByEdge}
                        className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-medium px-2.5 py-1 rounded transition"
                    >
                        OK
                    </button>
                </div>
            </div>

            {/* Пиксели в метре и Север */}
            <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">
                        Pixels per 1m
                    </label>
                    <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={pxPerMeter}
                        onChange={(e) => onChangePxPerMeter(Math.max(1, Number(e.target.value)))}
                        className="w-full text-xs font-mono border border-slate-300 rounded px-2 py-1"
                    />
                </div>

                <div>
                    <label className="flex items-center gap-1 text-[11px] text-slate-500 mb-0.5">
                        <Compass className="w-3 h-3 text-blue-600" />
                        North (0-360°)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="359"
                        value={northOffsetDeg}
                        onChange={(e) => onChangeNorthOffset(Number(e.target.value))}
                        className="w-full text-xs font-mono border border-slate-300 rounded px-2 py-1"
                    />
                </div>
            </div>
        </div>
    );
};