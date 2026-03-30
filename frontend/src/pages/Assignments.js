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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
    Plus, 
    CalendarIcon, 
    Clock,
    BookOpen,
    CheckCircle2,
    Circle,
    ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Assignments() {
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [courseId, setCourseId] = useState('');
    const [dueDate, setDueDate] = useState(null);
    const [dueTime, setDueTime] = useState('23:59');
    const [points, setPoints] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assignmentsRes, coursesRes] = await Promise.all([
                axios.get(`${API}/assignments`),
                axios.get(`${API}/courses`)
            ]);
            setAssignments(assignmentsRes.data);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title || !courseId || !dueDate) {
            toast.error('Completa los campos requeridos');
            return;
        }

        try {
            const response = await axios.post(`${API}/assignments`, {
                title,
                description,
                course_id: courseId,
                due_date: format(dueDate, 'yyyy-MM-dd'),
                due_time: dueTime,
                points
            });
            setAssignments([response.data, ...assignments]);
            setDialogOpen(false);
            resetForm();
            toast.success('Asignación creada');
        } catch (error) {
            toast.error('Error al crear asignación');
        }
    };

    const handleComplete = async (assignmentId) => {
        try {
            const response = await axios.put(`${API}/assignments/${assignmentId}/complete`);
            setAssignments(assignments.map(a => 
                a.id === assignmentId ? { ...a, status: 'completed' } : a
            ));
            toast.success(`¡Completada! +${response.data.points_earned} pts`);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error');
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCourseId('');
        setDueDate(null);
        setDueTime('23:59');
        setPoints(10);
    };

    const pendingAssignments = assignments.filter(a => a.status === 'pending');
    const completedAssignments = assignments.filter(a => a.status === 'completed');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn" data-testid="assignments-page">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Asignaciones</h1>
                    <p className="text-emerald-500 dark:text-emerald-400 mt-1">Tareas y ejercicios de tus cursos</p>
                </div>
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-purple-500 hover:bg-purple-600 text-white" data-testid="new-assignment-btn">
                            <Plus className="w-4 h-4" />
                            Nueva Asignación
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-purple-500/20 sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="font-heading">Nueva Asignación</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Título *</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Nombre de la asignación"
                                    className="bg-black/20 border-white/10"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Curso *</Label>
                                <Select value={courseId} onValueChange={setCourseId}>
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue placeholder="Selecciona un curso" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.code} - {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {courses.length === 0 && (
                                    <p className="text-xs text-yellow-400">Primero crea un curso en "Mis Cursos"</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Instrucciones de la asignación..."
                                    className="bg-black/20 border-white/10 resize-none"
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fecha límite *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start bg-black/20 border-white/10">
                                                <CalendarIcon className="w-4 h-4 mr-2" />
                                                {dueDate ? format(dueDate, 'dd/MM/yyyy') : 'Fecha'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={dueDate}
                                                onSelect={setDueDate}
                                                locale={es}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Puntos</Label>
                                    <Input
                                        type="number"
                                        value={points}
                                        onChange={(e) => setPoints(parseInt(e.target.value) || 10)}
                                        className="bg-black/20 border-white/10"
                                        min={1}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1 bg-purple-500 text-white" disabled={courses.length === 0}>
                                    Crear
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Pending */}
            <div>
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Circle className="w-5 h-5 text-yellow-400" />
                    Pendientes ({pendingAssignments.length})
                </h2>
                {pendingAssignments.length === 0 ? (
                    <Card className="glass-card border-white/10">
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No hay asignaciones pendientes
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {pendingAssignments.map((assignment) => (
                            <Card key={assignment.id} className="glass-card border-white/10 overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <button
                                            onClick={() => handleComplete(assignment.id)}
                                            className="mt-1 flex-shrink-0"
                                        >
                                            <Circle className="w-5 h-5 text-yellow-400 hover:text-emerald-400 transition-colors" />
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span 
                                                    className="text-xs px-2 py-0.5 rounded"
                                                    style={{ 
                                                        backgroundColor: `${assignment.course?.color}20`,
                                                        color: assignment.course?.color
                                                    }}
                                                >
                                                    {assignment.course?.code || 'Sin curso'}
                                                </span>
                                                <span className="text-xs text-yellow-400 font-bold">+{assignment.points} pts</span>
                                            </div>
                                            <h3 className="font-medium text-foreground">{assignment.title}</h3>
                                            {assignment.description && (
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{assignment.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {format(new Date(assignment.due_date), 'dd MMM yyyy', { locale: es })}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1 text-emerald-400 border-emerald-500/30"
                                            onClick={() => navigate(`/courses/${assignment.course_id}`)}
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            Ir a Curso
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed */}
            {completedAssignments.length > 0 && (
                <div>
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        Completadas ({completedAssignments.length})
                    </h2>
                    <div className="grid gap-4 opacity-70">
                        {completedAssignments.map((assignment) => (
                            <Card key={assignment.id} className="glass-card border-emerald-500/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        <div className="flex-1">
                                            <span className="text-xs text-muted-foreground">{assignment.course?.code}</span>
                                            <h3 className="font-medium text-foreground line-through">{assignment.title}</h3>
                                        </div>
                                        <span className="text-emerald-400 text-sm font-bold">+{assignment.points}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
