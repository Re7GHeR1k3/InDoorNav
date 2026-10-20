import React, { useState } from 'react';
import { Ruler, Grid, Maximize2, Image as ImageIcon } from 'lucide-react';

interface ScaleCalibrationProps {
    pxPerMeter: number;
    onChangePxPerMeter: (val: number) => void;
    northOffsetDeg: number;
    onChangeNorthOffset: (val: number) => void;
    showRedGrid: boolean;
    onToggleRedGrid: () => void;
    selectedEdgePixelLength: number | null;
    markerSize: number;
    onChangeMarkerSize: (val: number) => void;
    floorplanScale: number;
    onChangeFloorplanScale: (val: number) => void;
    gridWidthMeters: number;
    gridHeightMeters: number;
    onChangeGridDimensions: (w: number, h: number) => void;
}

export const ScaleCalibration: React.FC<ScaleCalibrationProps> = ({
                                                                      pxPerMeter,
                                                                      onChangePxPerMeter,
                                                                      showRedGrid,
                                                                      onToggleRedGrid,
                                                                      selectedEdgePixelLength,
                                                                      markerSize,
                                                                      onChangeMarkerSize,
                                                                      floorplanScale,
                                                                      onChangeFloorplanScale,
                                                                      gridWidthMeters,
                                                                      gridHeightMeters,
                                                                      onChangeGridDimensions,
                                                                  }) => {
    const [realMetersInput, setRealMetersInput] = useState<string>('10');

    const handleCalibrateByEdge = () => {
        const meters = parseFloat(realMetersInput);
        if (!selectedEdgePixelLength || isNaN(meters) || meters <= 0) return;
        const calculatedScale = selectedEdgePixelLength / meters;
        onChangePxPerMeter(Number(calculatedScale.toFixed(2)));
    };
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
                    <Ruler className="w-4 h-4 text-red-600" />
                    <span>Scale calibration</span>
                </div>
                <button
                    type="button"
                    onClick={onToggleRedGrid}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition ${
                        showRedGrid
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                    <Grid className="w-3.5 h-3.5" />
                    {showRedGrid ? 'Net: ON' : 'Net: OFF'}
                </button>
            </div>

            {/* Размер маркеров ArUco */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
            ArUco size:
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
              Photo size:
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

            {/* Размеры красной сетки в метрах */}
            {showRedGrid && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    <div>
                        <label className="block text-[11px] text-slate-500 mb-0.5">
                            Net width (m)
                        </label>
                        <input
                            type="number"
                            min="5"
                            max="200"
                            value={gridWidthMeters}
                            onChange={(e) =>
                                onChangeGridDimensions(Math.max(5, Number(e.target.value)), gridHeightMeters)
                            }
                            className="w-full text-xs font-mono border border-slate-300 rounded px-2 py-1"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] text-slate-500 mb-0.5">
                            Height (m)
                        </label>
                        <input
                            type="number"
                            min="5"
                            max="200"
                            value={gridHeightMeters}
                            onChange={(e) =>
                                onChangeGridDimensions(gridWidthMeters, Math.max(5, Number(e.target.value)))
                            }
                            className="w-full text-xs font-mono border border-slate-300 rounded px-2 py-1"
                        />
                    </div>
                </div>
            )}

            {/* Калибровка по выбранному отрезку  */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
                <p className="text-xs text-slate-600">
                    {selectedEdgePixelLength ? (
                        <>
                            the length of selected segment {' '}
                            <strong className="text-slate-900">
                                {Math.round(selectedEdgePixelLength)} px
                            </strong>
                            . give the real length:
                        </>
                    ) : (
                        'Connect two markers along a known wall and click on the line for precise calibration:'
                    )}
                </p>

                <div className="flex gap-2">
                    <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={realMetersInput}
                        onChange={(e) => setRealMetersInput(e.target.value)}
                        placeholder="Meters (Ex. 10)"
                        className="w-full text-sm border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        disabled={!selectedEdgePixelLength}
                        onClick={handleCalibrateByEdge}
                        className="shrink-0 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
                    >
                        Apply (m)
                    </button>
                </div>
            </div>

            {/* Ручная подстройка коэффициента и Севера */}
            <div className="grid grid-cols-1 gap-3 pt-1">
                <div>
                    <label className="block text-xs text-slate-500 mb-1">
                        Pixels in 1 meter
                    </label>
                    <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={pxPerMeter}
                        onChange={(e) => onChangePxPerMeter(Math.max(1, Number(e.target.value)))}
                        className="w-full text-sm font-mono border border-slate-300 rounded-md px-3 py-1"
                    />
                </div>

                {/*<div>*/}
                {/*    <label className="flex items-center gap-1 text-xs text-slate-500 mb-1">*/}
                {/*        <Compass className="w-3.5 h-3.5 text-blue-600" />*/}
                {/*        North correction (0-360°)*/}
                {/*    </label>*/}
                {/*    <input*/}
                {/*        type="number"*/}
                {/*        min="0"*/}
                {/*        max="359"*/}
                {/*        value={northOffsetDeg}*/}
                {/*        onChange={(e) => onChangeNorthOffset(Number(e.target.value))}*/}
                {/*        className="w-full text-sm font-mono border border-slate-300 rounded-md px-2.5 py-1"*/}
                {/*    />*/}
                {/*</div>*/}
            </div>
        </div>
    );
};