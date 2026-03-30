import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Mail, Lock, User, ArrowRight, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const UNPHU_LOGO = "/unphu-logo.png";

export default function Register() {
    const [step, setStep] = useState(1); // 1=form, 2=verify code, 3=complete
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const { register } = useAuth();
    const navigate = useNavigate();

    const startCountdown = () => {
        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendCode = async (e) => {
        e.preventDefault();

        if (!name.trim()) { toast.error('Ingresa tu nombre'); return; }
        if (!email.trim()) { toast.error('Ingresa tu correo'); return; }
        if (password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return; }
        if (password !== confirmPassword) { toast.error('Las contraseñas no coinciden'); return; }

        setSendingCode(true);
        try {
            await axios.post(`${API}/auth/send-code`, { email: email.trim().toLowerCase() });
            toast.success('Código enviado a tu correo');
            setStep(2);
            startCountdown();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error al enviar el código');
        } finally {
            setSendingCode(false);
        }
    };

    const handleResendCode = async () => {
        if (countdown > 0) return;
        setSendingCode(true);
        try {
            await axios.post(`${API}/auth/send-code`, { email: email.trim().toLowerCase() });
            toast.success('Código reenviado');
            startCountdown();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error al reenviar');
        } finally {
            setSendingCode(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        if (code.length !== 6) { toast.error('Ingresa el código de 6 dígitos'); return; }

        setIsLoading(true);
        try {
            // Step 1: Verify code
            await axios.post(`${API}/auth/verify-code`, { 
                email: email.trim().toLowerCase(), 
                code 
            });

            // Step 2: Register
            await register(email.trim().toLowerCase(), password, name);
            toast.success('¡Cuenta creada exitosamente!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error al verificar');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCodeChange = (value) => {
        const cleaned = value.replace(/[^0-9]/g, '').substring(0, 6);
        setCode(cleaned);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a1a0a] dark:bg-[#0a1a0a]">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-900/20" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
            
            <Card className="w-full max-w-md glass-card border-emerald-500/20 animate-fadeIn relative z-10" data-testid="register-card">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden">
                        <img src={UNPHU_LOGO} alt="TaskFlow Lite UNPHU" className="w-full h-full object-contain" />
                    </div>
                    <CardTitle className="text-2xl font-heading text-white">
                        {step === 1 ? 'Crear Cuenta' : 'Verificar Correo'}
                    </CardTitle>
                    <CardDescription className="text-emerald-400">
                        {step === 1 ? 'TaskFlow Lite - UNPHU' : `Código enviado a ${email}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <form onSubmit={handleSendCode} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-300">Nombre</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Tu nombre"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-10 bg-black/20 border-white/10 focus:border-emerald-500 text-white placeholder:text-slate-500 h-12"
                                        required
                                        data-testid="register-name-input"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="tu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-black/20 border-white/10 focus:border-emerald-500 text-white placeholder:text-slate-500 h-12"
                                        required
                                        data-testid="register-email-input"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-300">Contraseña</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 bg-black/20 border-white/10 focus:border-emerald-500 text-white placeholder:text-slate-500 h-12"
                                        required
                                        data-testid="register-password-input"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-slate-300">Confirmar Contraseña</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 bg-black/20 border-white/10 focus:border-emerald-500 text-white placeholder:text-slate-500 h-12"
                                        required
                                        data-testid="register-confirm-password-input"
                                    />
                                </div>
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl hover:scale-[1.02] transition-transform"
                                style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}
                                disabled={sendingCode}
                                data-testid="register-submit-btn"
                            >
                                {sendingCode ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Enviando código...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Enviar Código de Verificación
                                        <Mail className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                                </div>
                                <p className="text-slate-400 text-sm">
                                    Ingresa el código de 6 dígitos que enviamos a
                                </p>
                                <p className="text-emerald-400 font-medium mt-1">{email}</p>
                            </div>

                            <form onSubmit={handleVerifyAndRegister} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Código de Verificación</Label>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={code}
                                        onChange={(e) => handleCodeChange(e.target.value)}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="bg-black/20 border-white/10 focus:border-emerald-500 text-white text-center text-2xl font-mono tracking-[0.5em] h-14"
                                        autoFocus
                                        data-testid="verification-code-input"
                                    />
                                </div>

                                <Button 
                                    type="submit"
                                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl hover:scale-[1.02] transition-transform"
                                    style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}
                                    disabled={isLoading || code.length !== 6}
                                    data-testid="verify-code-btn"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Verificando...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Verificar y Crear Cuenta
                                            <ArrowRight className="w-4 h-4" />
                                        </span>
                                    )}
                                </Button>
                            </form>

                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
                                >
                                    <ArrowLeft className="w-3 h-3" />
                                    Volver
                                </button>
                                <button
                                    onClick={handleResendCode}
                                    disabled={countdown > 0 || sendingCode}
                                    className={`text-sm transition-colors ${
                                        countdown > 0 ? 'text-slate-600' : 'text-emerald-400 hover:text-emerald-300'
                                    }`}
                                    data-testid="resend-code-btn"
                                >
                                    {sendingCode ? 'Enviando...' : countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar código'}
                                </button>
                            </div>
                        </div>
                    )}

                    <p className="mt-6 text-center text-slate-400">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="text-emerald-400 hover:underline font-medium" data-testid="login-link">
                            Inicia sesión
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
