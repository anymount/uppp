import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import keyauthConfig from '../config/keyauth.js';

function Login() {
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        initSession();
    }, []);

    const initSession = async () => {
        try {
            console.log('Iniciando sessão com:', {
                name: keyauthConfig.name,
                ownerid: keyauthConfig.ownerid
            });

            const response = await axios({
                method: 'post',
                url: 'https://keyauth.win/api/1.2/',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                data: `type=init&name=${encodeURIComponent(keyauthConfig.name)}&ownerid=${encodeURIComponent(keyauthConfig.ownerid)}`
            });

            console.log('Resposta da inicialização:', response.data);
            
            if (response.data.success) {
                console.log('Sessão iniciada com sucesso:', response.data.sessionid);
                setSessionId(response.data.sessionid);
            } else {
                console.error('Erro na inicialização:', response.data.message);
                setError('Erro ao inicializar: ' + response.data.message);
            }
        } catch (err) {
            console.error('Erro completo na inicialização:', err);
            setError('Erro ao conectar com o servidor');
        }
    };

    const handleActivate = async (e) => {
        e.preventDefault();
        if (!sessionId) {
            setError('Aguarde a inicialização da sessão...');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('Verificando licença com:', {
                key,
                sessionId,
                name: keyauthConfig.name,
                ownerid: keyauthConfig.ownerid
            });

            const response = await axios({
                method: 'post',
                url: 'https://keyauth.win/api/1.2/',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                data: `type=license&key=${encodeURIComponent(key)}&name=${encodeURIComponent(keyauthConfig.name)}&ownerid=${encodeURIComponent(keyauthConfig.ownerid)}&secret=${encodeURIComponent(keyauthConfig.secret)}&sessionid=${encodeURIComponent(sessionId)}`
            });

            console.log('Resposta da verificação:', response.data);

            if (response.data.success) {
                localStorage.setItem('keyauth_token', sessionId);
                localStorage.setItem('license_key', key);
                navigate('/dashboard');
            } else {
                setError(response.data.message || 'Licença inválida');
            }
        } catch (err) {
            console.error('Erro completo na verificação:', err);
            setError(err.response?.data?.message || err.message || 'Erro ao verificar licença');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8">
                        <div className="flex justify-center mb-8">
                            <div className="p-4 bg-indigo-600 rounded-2xl">
                                <KeyRound size={40} className="text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                            Ativar Licença
                        </h2>
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleActivate} className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-gray-700 text-sm font-medium mb-2">
                                    <KeyRound size={18} />
                                    Chave de Licença
                                </label>
                                <input
                                    type="text"
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Digite sua chave de licença"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !sessionId}
                                className={`w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                                    (loading || !sessionId) ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Verificando...' : !sessionId ? 'Inicializando...' : 'Ativar'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
