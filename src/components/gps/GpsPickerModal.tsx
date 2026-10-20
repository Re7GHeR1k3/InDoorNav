import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, X, Check } from 'lucide-react';
import type { GpsAnchor } from '../../types/navigation';

// Исправление дефолтной иконки Leaflet в React
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface GpsPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialAnchor: GpsAnchor;
    onSave: (anchor: GpsAnchor) => void;
}

// Компонент для отслеживания кликов по карте Leaflet
function LocationClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export const GpsPickerModal: React.FC<GpsPickerModalProps> = ({
                                                                  isOpen,
                                                                  onClose,
                                                                  initialAnchor,
                                                                  onSave,
                                                              }) => {
    const [lat, setLat] = useState<number>(initialAnchor.latitude || 54.35249339443582);
    const [lng, setLng] = useState<number>(initialAnchor.longitude || 18.647663636751613);
    const [radius, setRadius] = useState<number>(initialAnchor.geofence_radius_meters || 50);

    React.useEffect(() => {
        if (initialAnchor.latitude) setLat(initialAnchor.latitude);
        if (initialAnchor.longitude) setLng(initialAnchor.longitude);
        if (initialAnchor.geofence_radius_meters) setRadius(initialAnchor.geofence_radius_meters);
    }, [initialAnchor, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
            geofence_radius_meters: Number(radius),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
                {/* Шапка модального окна */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-slate-800 text-base">
                            Linking a building to GPS coordinates
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Интерактивная карта Leaflet */}
                <div className="h-80 w-full relative z-0">
                    <MapContainer
                        center={[lat, lng]}
                        zoom={16}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[lat, lng]} />
                        <LocationClickHandler
                            onLocationSelect={(newLat, newLng) => {
                                setLat(newLat);
                                setLng(newLng);
                            }}
                        />
                    </MapContainer>
                </div>

                {/* Настройки параметров геозоны */}
                <div className="p-6 space-y-4 bg-slate-50">
                    <p className="text-xs text-slate-600">
                        Click on a building on the map above to set the precise GPS coordinates for its main entrance.
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Latitude</label>
                            <input
                                type="number"
                                step="0.000001"
                                value={lat}
                                onChange={(e) => setLat(Number(e.target.value))}
                                className="w-full text-sm font-mono border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Longitude</label>
                            <input
                                type="number"
                                step="0.000001"
                                value={lng}
                                onChange={(e) => setLng(Number(e.target.value))}
                                className="w-full text-sm font-mono border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Radius</label>
                            <input
                                type="number"
                                min="10"
                                value={radius}
                                onChange={(e) => setRadius(Number(e.target.value))}
                                className="w-full text-sm font-mono border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow transition"
                        >
                            <Check className="w-4 h-4" />
                            <span>Save coordinates</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};