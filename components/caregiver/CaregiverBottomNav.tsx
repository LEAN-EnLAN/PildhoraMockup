
import React from 'react';
import { View } from '../../pages/CaregiverDashboard';

interface CaregiverBottomNavProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
    label: string;
    view: View;
    activeView: View;
    setActiveView: (view: View) => void;
    icon: React.ReactNode;
}> = ({ label, view, activeView, setActiveView, icon }) => {
    const isActive = activeView === view;
    return (
        <button
            onClick={() => setActiveView(view)}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors ${isActive ? 'text-pildhora-secondary' : 'text-gray-500 hover:text-pildhora-secondary'}`}
        >
            <div className="w-8 h-8">{icon}</div>
            <span className={`text-xs mt-1 ${isActive ? 'font-bold' : 'font-semibold'}`}>{label}</span>
        </button>
    );
};

const CaregiverBottomNav: React.FC<CaregiverBottomNavProps> = ({ activeView, setActiveView }) => {
    const navItems = [
        { label: 'Inicio', view: 'home' as View, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { label: 'Historial', view: 'history' as View, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { label: 'Meds', view: 'meds' as View, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> },
        { label: 'Tareas', view: 'tasks' as View, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
        { label: 'Reporte', view: 'adherence' as View, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg> },
    ];
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
            <div className="max-w-4xl mx-auto flex justify-around">
                {navItems.map(item => (
                    <NavItem 
                        key={item.view}
                        label={item.label}
                        view={item.view}
                        activeView={activeView}
                        setActiveView={setActiveView}
                        icon={item.icon}
                    />
                ))}
            </div>
        </div>
    );
};

export default CaregiverBottomNav;
