import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { 
    CalendarDays, 
    CheckCircle2,
    Circle,
    BookOpen
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CalendarPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(`${API}/calendar/events`);
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEventsForDate = (date) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return isSameDay(eventDate, date);
        });
    };

    const selectedEvents = getEventsForDate(selectedDate);

    // Get dates with events for highlighting
    const eventDates = events.map(e => new Date(e.date));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn" data-testid="calendar-page">
            <div>
                <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                    <CalendarDays className="w-8 h-8 text-emerald-400" />
                    Calendario
                </h1>
                <p className="text-emerald-500 dark:text-emerald-400 mt-1">Visualiza todas tus actividades programadas</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <Card className="glass-card border-emerald-500/20">
                    <CardContent className="p-4">
                        <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            locale={es}
                            className="rounded-md"
                            modifiers={{
                                hasEvent: eventDates
                            }}
                            modifiersStyles={{
                                hasEvent: {
                                    fontWeight: 'bold',
                                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                    borderRadius: '50%'
                                }
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Events for selected date */}
                <Card className="glass-card border-emerald-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-heading">
                            <CalendarDays className="w-5 h-5 text-emerald-400" />
                            {format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedEvents.length === 0 ? (
                            <div className="text-center py-8">
                                <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">No hay eventos para este día</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedEvents.map((event) => (
                                    <div 
                                        key={event.id}
                                        className="p-3 rounded-lg border"
                                        style={{ 
                                            borderColor: `${event.color}50`,
                                            backgroundColor: `${event.color}10`
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            {event.status === 'completed' ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                                            ) : (
                                                <Circle className="w-5 h-5 mt-0.5" style={{ color: event.color }} />
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span 
                                                        className="text-xs px-2 py-0.5 rounded"
                                                        style={{ 
                                                            backgroundColor: `${event.color}30`,
                                                            color: event.color
                                                        }}
                                                    >
                                                        {event.type === 'task' ? 'Tarea' : 'Asignación'}
                                                    </span>
                                                    {event.course && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {event.course}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className={`font-medium ${event.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                    {event.title}
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    🕐 {event.time}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Events */}
            <Card className="glass-card border-emerald-500/20">
                <CardHeader>
                    <CardTitle className="text-lg font-heading">Próximos Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                    {events.filter(e => new Date(e.date) >= new Date() && e.status !== 'completed').length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No hay eventos próximos</p>
                    ) : (
                        <div className="space-y-2">
                            {events
                                .filter(e => new Date(e.date) >= new Date() && e.status !== 'completed')
                                .sort((a, b) => new Date(a.date) - new Date(b.date))
                                .slice(0, 5)
                                .map((event) => (
                                    <div 
                                        key={event.id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                                    >
                                        <div 
                                            className="w-2 h-10 rounded-full"
                                            style={{ backgroundColor: event.color }}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground">{event.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(event.date), "dd MMM yyyy", { locale: es })} • {event.time}
                                            </p>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded bg-muted">
                                            {event.type === 'task' ? 'Tarea' : 'Asignación'}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
