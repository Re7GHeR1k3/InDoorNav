import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';
import { Lock, Mail, ShieldAlert, QrCode } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [isLockedOut, setIsLockedOut] = useState(false);

    // Если сессия уже активна — сразу перенаправляем в редактор
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate('/', { replace: true });
        });
    }, [navigate]);

    // Временная блокировка формы после 5 неудачных попыток подряд
    useEffect(() => {
        if (failedAttempts >= 5) {
            setIsLockedOut(true);
            const timer = setTimeout(() => {
                setIsLockedOut(false);
                setFailedAttempts(0);
            }, 30000); // 30 секунд блокировки
            return () => clearTimeout(timer);
        }
    }, [failedAttempts]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLockedOut) return;

        setLoading(true);
        setErrorMsg(null);

        const cleanEmail = email.trim().toLowerCase();

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password,
            });

            if (error) {
                setFailedAttempts((prev) => prev + 1);
                // Обезличенная ошибка (OWASP standard: не сообщаем, существует ли такой email)
                throw new Error('Invalid credentials or access denied.');
            }

            setFailedAttempts(0);
            navigate('/', { replace: true });
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-slate-900 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow">
                        <QrCode className="h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">InDoorNav Admin</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Restricted access. Authorized personnel only.
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                        <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {isLockedOut && (
                    <div className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
                        Too many failed login attempts. Please wait 30 seconds.
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Administrator Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                type="email"
                                required
                                disabled={isLockedOut || loading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@domain.com"
                                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                type="password"
                                required
                                disabled={isLockedOut || loading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || isLockedOut}
                        className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-300 transition"
                    >
                        {loading ? 'Verifying...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};