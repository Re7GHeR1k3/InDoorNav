import { createClient } from '@supabase/supabase-js';
import type { IndoorMapJSON } from '../types/navigation';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Supabase URL or Anon Key is missing. Check your .env file.'
    );
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

export async function saveIndoorMapToSupabase(
    buildingName: string,
    floorLevel: number,
    latitude: number,
    longitude: number,
    geofenceRadiusMeters: number,
    graphData: IndoorMapJSON
) {
    // Вызов защищенной серверной функции (RPC) вместо прямого обращения к таблице
    const { data, error } = await supabase.rpc('save_map_rpc', {
        p_building_name: buildingName,
        p_floor_level: floorLevel,
        p_lat: latitude,
        p_lng: longitude,
        p_radius: geofenceRadiusMeters,
        p_graph: graphData,
    });

    if (error) {
        throw error;
    }

    return data;
}