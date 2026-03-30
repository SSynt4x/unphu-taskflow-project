import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
    Plus, 
    BookOpen, 
    Folder,
    MoreVertical,
    Trash2,
    ChevronRight
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COURSE_COLORS = [
    { name: 'Verde', value: '#10B981' },
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Morado', value: '#8B5CF6' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Naranja', value: '#F59E0B' },
    { name: 'Rojo', value: '#EF4444' },
];

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#10B981');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get(`${API}/courses`);
            setCourses(response.data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name || !code) {
            toast.error('Nombre y código son requeridos');
            return;
        }

        try {
            const response = await axios.post(`${API}/courses`, { name, code, description, color });
            setCourses([response.data, ...courses]);
            setDialogOpen(false);
            setName('');
            setCode('');
            setDescription('');
            toast.success('Curso creado');
        } catch (error) {
            toast.error('Error al crear curso');
        }
    };

    const handleDelete = async (courseId) => {
        try {
            await axios.delete(`${API}/courses/${courseId}`);
            setCourses(courses.filter(c => c.id !== courseId));
            toast.success('Curso eliminado');
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn" data-testid="courses-page">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Mis Cursos</h1>
                    <p className="text-emerald-500 dark:text-emerald-400 mt-1">Vista general de curso</p>
                </div>
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="new-course-btn">
                            <Plus className="w-4 h-4" />
                            Nuevo Curso
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-emerald-500/20 sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="font-heading">Nuevo Curso</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Nombre del Curso *</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej: Sistemas de Información"
                                    className="bg-black/20 border-white/10"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Código *</Label>
                                <Input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Ej: INF-560-01"
                                    className="bg-black/20 border-white/10"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Descripción del curso..."
                                    className="bg-black/20 border-white/10 resize-none"
                                    rows={2}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Color</Label>
                                <div className="flex gap-2">
                                    {COURSE_COLORS.map((c) => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => setColor(c.value)}
                                            className={`w-8 h-8 rounded-full transition-transform ${color === c.value ? 'ring-2 ring-white scale-110' : ''}`}
                                            style={{ backgroundColor: c.value }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1 bg-emerald-500 text-white">
                                    Crear
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {courses.length === 0 ? (
                <Card className="glass-card border-emerald-500/20">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-emerald-400" />
                        </div>
                        <p className="text-muted-foreground text-center">
                            No tienes cursos. ¡Crea tu primer curso!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course) => (
                        <Card 
                            key={course.id}
                            className="glass-card border-white/10 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform group"
                            onClick={() => navigate(`/courses/${course.id}`)}
                            data-testid={`course-card-${course.id}`}
                        >
                            <div className="h-32 relative" style={{ backgroundColor: course.color }}>
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute top-2 right-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(course.id); }}
                                                className="text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <Folder className="w-12 h-12 text-white/80" />
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-1">{course.code}</p>
                                <h3 className="font-bold text-foreground line-clamp-2">{course.name}</h3>
                                {course.description && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{course.description}</p>
                                )}
                                <div className="flex items-center justify-end mt-3 text-emerald-400 text-sm">
                                    Ver módulos <ChevronRight className="w-4 h-4 ml-1" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
