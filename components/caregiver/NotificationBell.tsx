import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Notification } from '../../types';

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
    <div className="p-3 hover:bg-slate-100 border-b last:border-b-0">
        <p className="text-sm text-gray-800">{notification.message}</p>
        <p className="text-xs text-gray-500 mt-1">{notification.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
    </div>
);


const NotificationBell: React.FC = () => {
    const { notifications, markNotificationsAsRead } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (isOpen && unreadCount > 0) {
             // If closing and there are unread, mark them as read after a short delay
             setTimeout(markNotificationsAsRead, 300);
        }
    };
    
    // Close dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                if (isOpen && unreadCount > 0) {
                    markNotificationsAsRead();
                }
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, unreadCount]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={toggleDropdown}
                className="relative p-2 rounded-full hover:bg-slate-200 transition-colors"
            >
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 justify-center items-center text-white text-[10px] font-bold">{unreadCount}</span>
                    </span>
                )}
            </button>
            
            {isOpen && (
                 <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-30">
                    <div className="p-3 border-b">
                        <h4 className="font-semibold text-gray-800">Notificaciones</h4>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(n => <NotificationItem key={n.id} notification={n} />)
                        ) : (
                            <p className="p-4 text-sm text-center text-gray-500">No hay notificaciones nuevas.</p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <div className="p-2 border-t bg-slate-50">
                            <button onClick={markNotificationsAsRead} className="text-sm text-pildhora-secondary font-semibold w-full text-center">Marcar todas como leídas</button>
                        </div>
                    )}
                 </div>
            )}
        </div>
    );
};

export default NotificationBell;