import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // 1. Проверяем текущую сессию при загрузке
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsAuthenticated(!!session);
            setLoading(false);
        });

        // 2. Слушаем изменения (если токен протух или нажали Log Out)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Пока проверяем базу, показываем экран загрузки
    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-slate-300 text-sm font-medium">
                Checking access rights...
            </div>
        );
    }

    // Если сессии нет — принудительно кидаем на страницу логина
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Если всё ок — пускаем в редактор
    return <>{children}</>;
};