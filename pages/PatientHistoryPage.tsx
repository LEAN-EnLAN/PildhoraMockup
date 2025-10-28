import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { IntakeRecord, IntakeStatus } from '../types';

type ViewType = 'today' | 'week' | 'month';
type TimelineFilter = 'all' | 'taken' | 'missed';

const AdherenceRing: React.FC<{ percentage: number; size?: number; strokeWidth?: number }> = ({ percentage, size = 80, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const getColor = (p: number) => {
        if (p >= 90) return 'stroke-pildhora-success';
        if (p >= 70) return 'stroke-pildhora-warning';
        return 'stroke-pildhora-error';
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
                <circle
                    className="stroke-gray-200"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    className={`transition-all duration-500 ${getColor(percentage)}`}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size/2} ${size/2})`}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{Math.round(percentage)}%</span>
            </div>
        </div>
    );
};

const DailyTimeline: React.FC<{ records: IntakeRecord[], filter: TimelineFilter, setFilter: (f: TimelineFilter) => void }> = ({ records, filter, setFilter }) => {
     const filteredRecords = useMemo(() => {
        if (filter === 'all') return records;
        if (filter === 'taken') return records.filter(r => r.status === IntakeStatus.TAKEN);
        if (filter === 'missed') return records.filter(r => r.status === IntakeStatus.MISSED);
        return [];
    }, [records, filter]);

    const getStatusIcon = (status: IntakeStatus) => {
        switch(status) {
            case IntakeStatus.TAKEN: return <div className="flex items-center justify-center size-8 rounded-full bg-green-100"><span className="material-symbols-outlined text-green-600">check</span></div>;
            case IntakeStatus.MISSED: return <div className="flex items-center justify-center size-8 rounded-full bg-red-100"><span className="material-symbols-outlined text-red-600">close</span></div>;
            default: return <div className="flex items-center justify-center size-8 rounded-full bg-yellow-100"><span className="material-symbols-outlined text-yellow-600">schedule</span></div>;
        }
    };
    
    return (
        <div className="px-4 pb-4">
             <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-gray-200 p-1 mb-4">
                {(['all', 'taken', 'missed'] as const).map(f => (
                    <label key={f} className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-medium leading-normal transition-colors ${filter === f ? 'bg-white shadow-sm text-pildhora-secondary' : 'text-gray-600'}`}>
                        <span className="truncate">{f === 'all' ? 'Todos' : f === 'taken' ? 'Tomadas' : 'Omitidas'}</span>
                        <input checked={filter === f} onChange={() => setFilter(f)} className="invisible w-0" name="filter-toggle" type="radio" value={f} />
                    </label>
                ))}
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-2">Hoy, {new Date().toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })}</p>
            <div className="grid grid-cols-[auto_1fr] gap-x-4">
                {filteredRecords.map((record, index, arr) => (
                    <React.Fragment key={record.id}>
                        <div className="flex flex-col items-center gap-1">
                            {getStatusIcon(record.status)}
                            {index < arr.length - 1 && <div className="w-px bg-gray-300 grow"></div>}
                        </div>
                        <div className="flex flex-col pb-6">
                            <p className="text-gray-900 font-medium">{record.medicationName}, {record.dosage}</p>
                            <p className="text-gray-500">{record.scheduledTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </React.Fragment>
                ))}
                 {filteredRecords.length === 0 && <p className="col-span-2 text-center text-gray-500 py-4">No hay tomas para este filtro.</p>}
            </div>
        </div>
    );
}

const MonthlyView: React.FC<{intakeHistory: IntakeRecord[]}> = ({ intakeHistory }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Fix: Hoist firstDayOfMonth out of useMemo to make it accessible in the render method for calendar padding calculation.
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const { monthlyAdherence, calendarDays, adherenceByDay } = useMemo(() => {
        const now = new Date();
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const recordsThisMonth = intakeHistory.filter(r => {
            const d = r.scheduledTime;
            return d >= firstDayOfMonth && d <= now && d <= lastDayOfMonth;
        });

        const taken = recordsThisMonth.filter(r => r.status === IntakeStatus.TAKEN).length;
        const missed = recordsThisMonth.filter(r => r.status === IntakeStatus.MISSED).length;
        const total = taken + missed;
        const monthlyAdherence = total > 0 ? (taken / total) * 100 : 100;

        const calendarDays = Array(lastDayOfMonth.getDate()).fill(null).map((_, i) => i + 1);
        
        const adherenceByDay: { [day: number]: string } = {};
        for(let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            if (dayDate > now) continue;

            const recordsForDay = recordsThisMonth.filter(r => r.scheduledTime.getDate() === i);
            const dTaken = recordsForDay.filter(r => r.status === IntakeStatus.TAKEN).length;
            const dMissed = recordsForDay.filter(r => r.status === IntakeStatus.MISSED).length;
            const dTotal = dTaken + dMissed;

            if (dTotal > 0) {
                const adherence = (dTaken / dTotal) * 100;
                if (adherence >= 90) adherenceByDay[i] = 'adherence-green';
                else if (adherence >= 70) adherenceByDay[i] = 'adherence-yellow';
                else adherenceByDay[i] = 'adherence-red';
            }
        }

        return { monthlyAdherence, calendarDays, adherenceByDay };
    }, [intakeHistory, currentDate, firstDayOfMonth]);

    const changeMonth = (delta: number) => {
        setCurrentDate(d => {
            const newDate = new Date(d);
            newDate.setMonth(d.getMonth() + delta);
            return newDate;
        });
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-6">
                <div className="flex items-center gap-6">
                    <AdherenceRing percentage={monthlyAdherence} />
                    <div className="flex flex-col">
                        <p className="text-gray-900 text-lg font-bold leading-normal">Tu Adherencia Mensual</p>
                        <p className="text-gray-500 text-sm">¡Sigue así!</p>
                    </div>
                </div>
            </div>
             <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100"><span className="material-symbols-outlined text-gray-500">chevron_left</span></button>
                    <h3 className="text-gray-900 text-lg font-bold capitalize">{currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100"><span className="material-symbols-outlined text-gray-500">chevron_right</span></button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-500 mb-2">
                    <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array(firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1).fill(null).map((_, i) => <div key={`empty-${i}`}></div>)}
                    {calendarDays.map(day => (
                        <div key={day} className={`aspect-square flex items-center justify-center rounded-lg ${adherenceByDay[day] || 'adherence-gray'}`}>
                           <p className="font-semibold">{day}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const WeeklyView: React.FC<{intakeHistory: IntakeRecord[]}> = ({ intakeHistory }) => {
    const { weeklyAdherence, dailyAdherence } = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const recordsThisWeek = intakeHistory.filter(r => {
            const d = r.scheduledTime;
            return d >= startOfWeek && d <= now;
        });

        const taken = recordsThisWeek.filter(r => r.status === IntakeStatus.TAKEN).length;
        const missed = recordsThisWeek.filter(r => r.status === IntakeStatus.MISSED).length;
        const total = taken + missed;
        const weeklyAdherence = total > 0 ? (taken / total) * 100 : 100;

        const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const dailyAdherence = dayLabels.map((label, i) => {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            if(dayDate > now) return { label, percentage: null };

            const dayRecords = recordsThisWeek.filter(r => r.scheduledTime.getDay() === dayDate.getDay());
            const dTaken = dayRecords.filter(r => r.status === IntakeStatus.TAKEN).length;
            const dMissed = dayRecords.filter(r => r.status === IntakeStatus.MISSED).length;
            const dTotal = dTaken + dMissed;

            return {
                label,
                percentage: dTotal > 0 ? Math.round((dTaken / dTotal) * 100) : null
            };
        });

        return { weeklyAdherence, dailyAdherence };
    }, [intakeHistory]);

    return (
         <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-6">
            <div className="flex items-center gap-6">
                <AdherenceRing percentage={weeklyAdherence} />
                <div className="flex flex-col">
                    <p className="text-gray-900 text-lg font-bold leading-normal">Tu Adherencia Semanal</p>
                    <p className="text-gray-500 text-sm">¡Buen trabajo esta semana!</p>
                </div>
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-100">
                {dailyAdherence.map(day => (
                     <div key={day.label} className="flex flex-col items-center">
                        <p className="text-gray-900 text-sm font-medium">{day.label}</p>
                        {day.percentage !== null ? (
                            <p className="text-pildhora-secondary text-sm font-semibold">{day.percentage}%</p>
                        ) : (
                             <p className="text-gray-500 text-sm font-semibold">-</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const TodayView: React.FC<{intakeHistory: IntakeRecord[]}> = ({intakeHistory}) => {
    const { todayRecords, adherenceByMed } = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23,59,59,999);

        const todayRecords = intakeHistory.filter(r => r.scheduledTime >= startOfDay && r.scheduledTime <= endOfDay)
            .sort((a,b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());

        const adherenceByMed: { [medId: string]: number } = {};
        // Fix: Use Array.from for robust type inference. The spread operator on a Set was being inferred as unknown[], causing a type error.
        const medIds = Array.from(new Set(todayRecords.map(r => r.medicationId)));

        // Fix: Explicitly type `medId` as string in forEach callback to resolve index signature error.
        medIds.forEach((medId: string) => {
            const recordsForMed = intakeHistory.filter(r => r.medicationId === medId && r.scheduledTime <= now);
            const taken = recordsForMed.filter(r => r.status === IntakeStatus.TAKEN).length;
            const missed = recordsForMed.filter(r => r.status === IntakeStatus.MISSED).length;
            const total = taken + missed;
            adherenceByMed[medId] = total > 0 ? (taken/total) * 100 : 100;
        });

        return { todayRecords, adherenceByMed };
    }, [intakeHistory]);

    return (
        <div className="px-4 pb-4">
            <p className="text-sm font-semibold text-gray-500 mb-2">Hoy, {new Date().toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })}</p>
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4">
                {todayRecords.map((record, index, arr) => (
                    <React.Fragment key={record.id}>
                        <div className="flex flex-col items-center justify-center">
                             <div className={`flex items-center justify-center size-8 rounded-full ${
                                record.status === IntakeStatus.TAKEN ? 'bg-green-100' : record.status === IntakeStatus.MISSED ? 'bg-red-100' : 'bg-yellow-100'
                             }`}>
                                <span className={`material-symbols-outlined ${
                                    record.status === IntakeStatus.TAKEN ? 'text-green-600' : record.status === IntakeStatus.MISSED ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                    {record.status === IntakeStatus.TAKEN ? 'check' : record.status === IntakeStatus.MISSED ? 'close' : 'schedule'}
                                </span>
                            </div>
                            {index < arr.length - 1 && <div className="w-px bg-gray-300 h-12"></div>}
                        </div>

                        <div className="flex flex-col py-3">
                            <p className="text-gray-900 font-medium">{record.medicationName}, {record.dosage}</p>
                            <p className="text-gray-500">{record.scheduledTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        
                        <div className="relative">
                            <AdherenceRing percentage={adherenceByMed[record.medicationId] ?? 100} size={48} strokeWidth={5} />
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};


const PatientHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { intakeHistory, loading } = useData();
    const [view, setView] = useState<ViewType>('month');
    const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('all');
    
    const todayRecords = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        return intakeHistory
            .filter(r => r.scheduledTime >= startOfDay && r.scheduledTime.getDate() === now.getDate())
            .sort((a,b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
    }, [intakeHistory]);

    const renderContent = () => {
        if (loading) {
            return (
                 <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pildhora-secondary"></div>
                </div>
            );
        }
        
        switch(view) {
            case 'month': return <MonthlyView intakeHistory={intakeHistory} />;
            case 'week': return <WeeklyView intakeHistory={intakeHistory} />;
            case 'today': return <TodayView intakeHistory={intakeHistory} />;
            default: return null;
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-gray-800">
            <header className="sticky top-0 z-10 flex items-center justify-between bg-slate-100/80 p-4 pb-2 backdrop-blur-sm">
                <button onClick={() => navigate(-1)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full hover:bg-black/5" aria-label="Volver">
                    <span className="material-symbols-outlined text-gray-800">arrow_back</span>
                </button>
                <h2 className="flex-1 text-center text-lg font-bold text-gray-900">Historial y Adherencia</h2>
                <div className="w-12" /> {/* Spacer */}
            </header>

            <div className="flex gap-3 overflow-x-auto px-4 py-2">
                {(['today', 'week', 'month'] as const).map(v => (
                     <button 
                        key={v}
                        onClick={() => setView(v)}
                        className={`h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 text-sm font-medium transition-colors ${view === v ? 'bg-pildhora-secondary/20 text-pildhora-secondary' : 'bg-gray-200 text-gray-800'}`}>
                        {v === 'today' ? 'Hoy' : v === 'week' ? 'Esta Semana' : 'Este Mes'}
                    </button>
                ))}
            </div>
            
            <main className="p-4 space-y-6">
                {renderContent()}
                {view !== 'today' && <DailyTimeline records={todayRecords} filter={timelineFilter} setFilter={setTimelineFilter} />}
            </main>
        </div>
    );
};

export default PatientHistoryPage;