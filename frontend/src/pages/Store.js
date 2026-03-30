import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
    ShoppingCart, 
    CreditCard,
    Coins,
    Check,
    Wallet,
    Lock,
    ShieldCheck
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const detectCardType = (number) => {
    if (!number) return null;
    const clean = number.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'mastercard';
    if (/^3[47]/.test(clean)) return 'amex';
    return null;
};

const CARD_BRANDS = {
    visa: { name: 'Visa', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    mastercard: { name: 'Mastercard', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    amex: { name: 'Amex', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

export default function Store() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState(1);

    // Card form
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expMonth, setExpMonth] = useState('');
    const [expYear, setExpYear] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardType, setCardType] = useState(null);

    useEffect(() => {
        fetchPackages();
    }, []);

    useEffect(() => {
        setCardType(detectCardType(cardNumber));
    }, [cardNumber]);

    const fetchPackages = async () => {
        try {
            const response = await axios.get(`${API}/store/packages`);
            setPackages(response.data.packages);
        } catch (error) {
            console.error('Failed to fetch packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPackage = (pkg) => {
        setSelectedPackage(pkg);
        setStep(1);
        setDialogOpen(true);
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const parts = [];
        for (let i = 0, len = Math.min(v.length, 16); i < len; i += 4) {
            parts.push(v.substring(i, i + 4));
        }
        return parts.join(' ');
    };

    const formatExpMonth = (value) => {
        const v = value.replace(/[^0-9]/g, '').substring(0, 2);
        if (v.length === 1 && parseInt(v) > 1) return '0' + v;
        if (v.length === 2 && parseInt(v) > 12) return '12';
        return v;
    };

    const formatExpYear = (value) => {
        return value.replace(/[^0-9]/g, '').substring(0, 2);
    };

    const formatCvv = (value) => {
        return value.replace(/[^0-9]/g, '').substring(0, 4);
    };

    const isCardValid = () => {
        const cleanNum = cardNumber.replace(/\s/g, '');
        return cleanNum.length >= 15 && 
               cardName.trim().length >= 3 && 
               expMonth.length === 2 && 
               expYear.length === 2 && 
               cvv.length >= 3;
    };

    const handlePurchase = async () => {
        if (!isCardValid()) {
            toast.error('Completa todos los campos de la tarjeta');
            return;
        }

        setProcessing(true);
        try {
            const response = await axios.post(`${API}/store/purchase`, {
                package_id: selectedPackage.id,
                payment_method: cardType || 'card',
                card_number: cardNumber.replace(/\s/g, '')
            });
            setStep(3);
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error en la compra');
        } finally {
            setProcessing(false);
        }
    };

    const resetForm = () => {
        setCardNumber('');
        setCardName('');
        setExpMonth('');
        setExpYear('');
        setCvv('');
        setStep(1);
        setSelectedPackage(null);
        setDialogOpen(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn" data-testid="store-page">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-yellow-400" />
                        Tienda de Puntos
                    </h1>
                    <p className="text-yellow-400 mt-1">Compra puntos canjeables para desbloquear avatares</p>
                </div>
            </div>

            <Card className="glass-card border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <Coins className="w-12 h-12 text-yellow-400" />
                        <div>
                            <h3 className="font-bold text-foreground">¿Para qué sirven los puntos canjeables?</h3>
                            <p className="text-muted-foreground text-sm">
                                Usa tus puntos para desbloquear avatares exclusivos en la sección de Avatares.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                    <Card 
                        key={pkg.id}
                        className="glass-card border-yellow-500/20 hover:border-yellow-500/40 transition-all cursor-pointer hover:scale-[1.02]"
                        onClick={() => handleSelectPackage(pkg)}
                        data-testid={`package-${pkg.id}`}
                    >
                        <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                                <Coins className="w-8 h-8 text-yellow-400" />
                            </div>
                            <h3 className="text-3xl font-bold text-yellow-400">{pkg.points.toLocaleString()}</h3>
                            <p className="text-muted-foreground mb-4">puntos canjeables</p>
                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-foreground">RD$ {pkg.price_dop.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">= ${pkg.price_usd} USD</p>
                            </div>
                            <Button className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                                Comprar
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Payment Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(open); }}>
                <DialogContent className="glass-card border-yellow-500/20 sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-heading flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-yellow-400" />
                            {step === 3 ? 'Compra Exitosa' : 'Pago con Tarjeta'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    {selectedPackage && step !== 3 && (
                        <div className="space-y-5 mt-2">
                            {/* Order Summary */}
                            <div className="bg-yellow-500/10 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total a pagar</p>
                                    <p className="text-2xl font-bold text-foreground">RD$ {selectedPackage.price_dop.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Recibirás</p>
                                    <p className="text-xl font-bold text-yellow-400">{selectedPackage.points.toLocaleString()} pts</p>
                                </div>
                            </div>

                            {/* Card Preview */}
                            <div className="relative rounded-xl p-5 h-[180px] bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 border border-white/10 overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                                
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-7 bg-yellow-500/80 rounded" />
                                        {cardType && (
                                            <span className={`text-sm font-bold ${CARD_BRANDS[cardType]?.color || 'text-white'}`}>
                                                {CARD_BRANDS[cardType]?.name || ''}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-white/90 font-mono text-lg tracking-[0.25em]">
                                            {cardNumber || '•••• •••• •••• ••••'}
                                        </p>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase">Titular</p>
                                            <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
                                                {cardName || 'NOMBRE COMPLETO'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-white/40 uppercase">Vence</p>
                                            <p className="text-white/80 text-sm font-mono">
                                                {expMonth || 'MM'}/{expYear || 'YY'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Form */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Número de tarjeta</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                            placeholder="0000 0000 0000 0000"
                                            maxLength={19}
                                            className="pl-10 bg-black/30 border-white/10 font-mono text-base tracking-wider"
                                            data-testid="card-number-input"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Nombre del titular</Label>
                                    <Input
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                        placeholder="COMO APARECE EN LA TARJETA"
                                        className="bg-black/30 border-white/10 uppercase tracking-wider"
                                        data-testid="card-name-input"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Mes</Label>
                                        <Input
                                            value={expMonth}
                                            onChange={(e) => setExpMonth(formatExpMonth(e.target.value))}
                                            placeholder="MM"
                                            maxLength={2}
                                            className="bg-black/30 border-white/10 font-mono text-center"
                                            data-testid="card-exp-month"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Año</Label>
                                        <Input
                                            value={expYear}
                                            onChange={(e) => setExpYear(formatExpYear(e.target.value))}
                                            placeholder="YY"
                                            maxLength={2}
                                            className="bg-black/30 border-white/10 font-mono text-center"
                                            data-testid="card-exp-year"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            CVV <Lock className="w-3 h-3" />
                                        </Label>
                                        <Input
                                            value={cvv}
                                            onChange={(e) => setCvv(formatCvv(e.target.value))}
                                            placeholder="•••"
                                            maxLength={4}
                                            type="password"
                                            className="bg-black/30 border-white/10 font-mono text-center"
                                            data-testid="card-cvv"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Pay button */}
                            <Button 
                                onClick={handlePurchase}
                                disabled={!isCardValid() || processing}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-12 text-base"
                                data-testid="confirm-purchase-btn"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Procesando pago...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Pagar RD$ {selectedPackage.price_dop.toLocaleString()}
                                    </span>
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                Pago seguro con encriptación SSL · Simulación académica
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {step === 3 && selectedPackage && (
                        <div className="space-y-6 mt-4 text-center py-4">
                            <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                                <Check className="w-10 h-10 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">¡Compra Exitosa!</h3>
                                <p className="text-muted-foreground mt-1">
                                    Se han agregado <span className="text-yellow-400 font-bold">{selectedPackage.points.toLocaleString()} puntos</span> a tu cuenta
                                </p>
                            </div>
                            <Button onClick={resetForm} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                                Continuar
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
