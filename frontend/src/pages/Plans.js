import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { 
    Plus, 
    CalendarIcon, 
    MoreVertical, 
    Edit2, 
    Trash2,
    Target,
    Rocket
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Plans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetDate, setTargetDate] = useState(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await axios.get(`${API}/plans`);
            setPlans(response.data);
            localStorage.setItem('plans', JSON.stringify(response.data));
        } catch (error) {
            console.error('Failed to fetch plans:', error);
            const cached = localStorage.getItem('plans');
            if (cached) setPlans(JSON.parse(cached));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setTargetDate(null);
        setEditingPlan(null);
    };

    const handleOpenDialog = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setTitle(plan.title);
            setDescription(plan.description);
            setTargetDate(plan.target_date ? new Date(plan.target_date) : null);
        } else {
            resetForm();
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title) {
            toast.error('Por favor ingresa un título');
            return;
        }

        const planData = {
            title,
            description,
            target_date: targetDate ? format(targetDate, 'yyyy-MM-dd') : null,
        };

        try {
            if (editingPlan) {
                const response = await axios.put(`${API}/plans/${editingPlan.id}`, planData);
                setPlans(plans.map(p => p.id === editingPlan.id ? response.data : p));
                toast.success('Plan actualizado');
            } else {
                const response = await axios.post(`${API}/plans`, planData);
                setPlans([response.data, ...plans]);
                toast.success('Plan creado');
            }
            setDialogOpen(false);
            resetForm();
        } catch (error) {
            toast.error('Error al guardar el plan');
        }
    };

    const handleDelete = async (planId) => {
        try {
            await axios.delete(`${API}/plans/${planId}`);
            setPlans(plans.filter(p => p.id !== planId));
            toast.success('Plan eliminado');
        } catch (error) {
            toast.error('Error al eliminar el plan');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn" data-testid="plans-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Planes Futuros</h1>
                    <p className="text-muted-foreground mt-1">Registra tus metas y objetivos</p>
                </div>
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            className="gap-2 bg-secondary text-secondary-foreground"
                            style={{ boxShadow: '0 0 15px rgba(112, 0, 255, 0.3)' }}
                            onClick={() => handleOpenDialog()}
                            data-testid="new-plan-btn"
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo Plan
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-white/10 sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="font-heading">
                                {editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Título *</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Mi meta u objetivo"
                                    className="bg-black/20 border-white/10"
                                    required
                                    data-testid="plan-title-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe tu plan en detalle..."
                                    className="bg-black/20 border-white/10 resize-none"
                                    rows={4}
                                    data-testid="plan-description-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha objetivo (opcional)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start bg-black/20 border-white/10"
                                            data-testid="plan-date-btn"
                                        >
                                            <CalendarIcon className="w-4 h-4 mr-2" />
                                            {targetDate ? format(targetDate, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={targetDate}
                                            onSelect={setTargetDate}
                                            locale={es}
                                            data-testid="plan-calendar"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => setDialogOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="flex-1 bg-secondary text-secondary-foreground"
                                    data-testid="plan-submit-btn"
                                >
                                    {editingPlan ? 'Guardar' : 'Crear'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Plans grid */}
            {plans.length === 0 ? (
                <Card className="glass-card border-white/10">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                            <Rocket className="w-8 h-8 text-secondary" />
                        </div>
                        <p className="text-muted-foreground text-center">
                            No tienes planes futuros. ¡Crea tu primera meta!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((plan, index) => (
                        <Card 
                            key={plan.id}
                            className="glass-card border-white/10 hover:border-secondary/30 transition-colors group"
                            style={{ animationDelay: `${index * 0.05}s` }}
                            data-testid={`plan-card-${plan.id}`}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                                        <Target className="w-5 h-5 text-secondary" />
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                data-testid={`plan-menu-${plan.id}`}
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleOpenDialog(plan)}>
                                                <Edit2 className="w-4 h-4 mr-2" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => handleDelete(plan.id)}
                                                className="text-red-400 focus:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                
                                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                                    {plan.title}
                                </h3>
                                
                                {plan.description && (
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                                        {plan.description}
                                    </p>
                                )}
                                
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-white/5">
                                    <span>
                                        Creado {format(new Date(plan.created_at), 'dd MMM', { locale: es })}
                                    </span>
                                    {plan.target_date && (
                                        <span className="flex items-center gap-1 text-secondary">
                                            <CalendarIcon className="w-3 h-3" />
                                            {format(new Date(plan.target_date), 'dd MMM yyyy', { locale: es })}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
