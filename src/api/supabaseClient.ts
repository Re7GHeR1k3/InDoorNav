import { createClient } from '@supabase/supabase-js';
import type { IndoorMapJSON } from '../types/navigation';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Сохранить сгенерированный JSON карты в базу данных PostgreSQL
 */
export async function saveIndoorMapToSupabase(
    buildingName: string,
    floorLevel: number,
    latitude: number,
    longitude: number,
    geofenceRadius: number,
    graphData: IndoorMapJSON
) {
    const { data, error } = await supabase.from('indoor_maps').insert([
        {
            building_name: buildingName,
            floor_level: floorLevel,
            latitude,
            longitude,
            geofence_radius_meters: geofenceRadius,
            graph_data: graphData,
        },
    ]);

    if (error) {
        console.error('Ошибка сохранения в Supabase:', error.message);
        throw error;
    }

    return data;
}