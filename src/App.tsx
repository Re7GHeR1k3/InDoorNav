import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MapCanvas } from './components/editor/MapCanvas';

function App() {
    return (
        <HashRouter>
            <Routes>
                {/* Открытый маршрут для входа */}
                <Route path="/login" element={<LoginPage />} />

                {/* Защищенный маршрут (основное приложение) */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <div className="w-screen h-screen overflow-hidden bg-slate-100">
                                <MapCanvas />
                            </div>
                        </ProtectedRoute>
                    }
                />

                {/* Любой неизвестный адрес перекидывает на главную (а она уже кинет на логин, если нет прав) */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
    );
}

export default App;