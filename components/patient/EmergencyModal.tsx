import React, { useEffect, useRef } from 'react';

interface EmergencyModalProps {
    isOpen: boolean;
    onClose: () => void;
    triggerRef: React.RefObject<HTMLElement>;
}

const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, triggerRef }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (!focusableElements || focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            // Set focus on the first focusable element
            setTimeout(() => firstElement.focus(), 100);

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                }
                if (e.key === 'Tab') {
                    if (e.shiftKey) { // Shift + Tab
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else { // Tab
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            };
            
            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                // Return focus to the element that triggered the modal
                triggerRef.current?.focus(); 
            };
        }
    }, [isOpen, onClose, triggerRef]);

    if (!isOpen) return null;

    // Hardcoded for demo purposes
    const caregiverName = 'Carlos Gómez';
    const caregiverPhone = '+34 600 123 456';
    const emergencyNumber = '112';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="emergency-modal-title"
        >
            <div ref={modalRef} className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm text-center relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    aria-label="Cerrar modal"
                >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 id="emergency-modal-title" className="text-3xl font-bold text-gray-800 mt-4">En Caso de Emergencia</h2>
                </div>
                
                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-lg font-semibold text-gray-600">Contactar a tu Cuidador</p>
                        <p className="text-2xl font-bold text-gray-900">{caregiverName}</p>
                        <a href={`tel:${caregiverPhone}`} className="block mt-2 w-full py-3 text-xl font-bold text-white bg-pildhora-secondary rounded-xl hover:bg-blue-800">
                            Llamar a {caregiverName.split(' ')[0]}
                        </a>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl">
                        <p className="text-lg font-semibold text-gray-600">Llamar a Emergencias</p>
                         <a href={`tel:${emergencyNumber}`} className="block mt-2 w-full py-3 text-xl font-bold text-white bg-red-600 rounded-xl hover:bg-red-700">
                            Llamar al {emergencyNumber}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyModal;