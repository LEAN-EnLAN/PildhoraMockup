import React, { useState, useMemo } from 'react';
import { IntakeRecord, IntakeStatus } from '../../types';

interface VisualPillboxProps {
    intakeHistory: IntakeRecord[];
    nextMedication: IntakeRecord | null;
}

// Helper to check if two dates are on the same day, ignoring time
const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

const weekdayFormatter = new Intl.DateTimeFormat('es-ES', { weekday: 'long' });

const Pill: React.FC<{ record: IntakeRecord; color: string; isNext: boolean }> = ({ record, color, isNext }) => {
    const getPillClasses = () => {
        let classes = 'w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg';
        if (isNext) {
            classes += ' ring-4 ring-offset-2 ring-pildhora-secondary animate-pulse';
        }
        return classes;
    };
    
    const renderContent = () => {
        if (record.status === IntakeStatus.TAKEN) {
            return (
                 <div className={`${getPillClasses()} bg-green-500`}>
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
            );
        }
        if (record.status === IntakeStatus.MISSED) {
            return <div className={`${getPillClasses()} bg-gray-300`}></div>;
        }
        // Pending
        return <div className={getPillClasses()} style={{ backgroundColor: color }}></div>;
    };

    return <div title={`${record.medicationName} (${record.dosage})`}>{renderContent()}</div>;
};

const VisualPillbox: React.FC<VisualPillboxProps> = ({ intakeHistory, nextMedication }) => {
    const [currentDay, setCurrentDay] = useState(new Date());

    const handlePrevDay = () => {
        setCurrentDay(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() - 1);
            return newDate;
        });
    };
    const handleNextDay = () => {
        setCurrentDay(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 1);
            return newDate;
        });
    };
    
    const today = new Date();
    const isToday = isSameDay(currentDay, today);

    const dailySchedule = useMemo(() => {
        const recordsForDay = intakeHistory.filter(r => isSameDay(new Date(r.scheduledTime), currentDay));
        return {
            night: recordsForDay.filter(r => new Date(r.scheduledTime).getHours() >= 20 || new Date(r.scheduledTime).getHours() < 4),
            morning: recordsForDay.filter(r => new Date(r.scheduledTime).getHours() >= 4 && new Date(r.scheduledTime).getHours() < 12),
            midday: recordsForDay.filter(r => new Date(r.scheduledTime).getHours() >= 12 && new Date(r.scheduledTime).getHours() < 16),
            afternoon: recordsForDay.filter(r => new Date(r.scheduledTime).getHours() >= 16 && new Date(r.scheduledTime).getHours() < 20),
        };
    }, [intakeHistory, currentDay]);

    const pillColors = ['#FBBF24', '#818CF8', '#6EE7B7', '#FDBA74', '#F9A8D4'];
    
    const QuadrantPills: React.FC<{ records: IntakeRecord[] }> = ({ records }) => (
        <div className="relative w-full h-full flex flex-wrap items-center justify-center gap-2 transform scale-75 sm:scale-90">
            {records.map((record, index) => (
                <Pill
                    key={record.id}
                    record={record}
                    color={pillColors[index % pillColors.length]}
                    isNext={nextMedication?.id === record.id}
                />
            ))}
        </div>
    );

    return (
        <div className="text-center font-sans w-full py-8 bg-white rounded-3xl shadow-lg">
            <h1 className="text-5xl font-extrabold text-teal-600">Pildhora</h1>
            <p className="text-xl text-gray-500 mt-2 mb-8">Tu pastillero virtual inteligente</p>
            
            <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-square">
                {/* Quadrant Labels */}
                <div className="absolute top-2 left-2 text-left">
                    <p className="font-bold text-sm text-gray-400 tracking-wider">NOCHE ({dailySchedule.night.length})</p>
                </div>
                <div className="absolute top-2 right-2 text-right">
                    <p className="font-bold text-sm text-gray-400 tracking-wider">MAÑANA ({dailySchedule.morning.length})</p>
                </div>
                 <div className="absolute bottom-2 left-2 text-left">
                    <p className="font-bold text-sm text-gray-400 tracking-wider">TARDE ({dailySchedule.afternoon.length})</p>
                </div>
                <div className="absolute bottom-2 right-2 text-right">
                    <p className="font-bold text-sm text-gray-400 tracking-wider">MEDIODÍA ({dailySchedule.midday.length})</p>
                </div>

                <div className="w-full h-full p-4 sm:p-6">
                    <div className="relative w-full h-full rounded-full bg-slate-50 shadow-inner">
                        {/* Quadrants Container */}
                        <div className="absolute inset-0 rounded-full overflow-hidden grid grid-cols-2 grid-rows-2">
                           <div className="border-r border-b border-slate-200"><QuadrantPills records={dailySchedule.night} /></div>
                           <div className="border-b border-l border-slate-200"><QuadrantPills records={dailySchedule.morning} /></div>
                           <div className="border-t border-r border-slate-200"><QuadrantPills records={dailySchedule.afternoon} /></div>
                           <div className="border-l border-t border-slate-200"><QuadrantPills records={dailySchedule.midday} /></div>
                        </div>

                        {/* Center Dial */}
                        <div className="absolute top-1/2 left-1/2 w-[48%] h-[48%] bg-white rounded-full shadow-xl flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
                            <button onClick={handlePrevDay} className="absolute left-2 sm:left-4 text-gray-400 hover:text-gray-700 text-3xl font-light">&lt;</button>
                            <div className="text-center">
                                <p className="text-sm font-bold text-gray-400 uppercase">{isToday ? 'HOY' : ''}</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-800 capitalize">{weekdayFormatter.format(currentDay)}</p>
                            </div>
                            <button onClick={handleNextDay} className="absolute right-2 sm:right-4 text-gray-400 hover:text-gray-700 text-3xl font-light">&gt;</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisualPillbox;