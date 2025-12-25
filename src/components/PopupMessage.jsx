import React from 'react';

const PopupMessage = ({ isOpen, message, onClose, type = 'info' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md transition-all duration-300">
            <div className="bg-white text-primary p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border border-gray-100 animate-pop flex flex-col items-center text-center gap-4">

                {/* Icon based on type */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type === 'error' ? 'bg-red-50 text-red-500' : 'bg-black text-white'}`}>
                    {type === 'error' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="text-lg font-semibold tracking-tight">{type === 'error' ? 'Error' : 'Notification'}</h3>
                    <p className="text-gray-600 text-sm">{message}</p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-2.5 bg-black text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors active:scale-95"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
};

export default PopupMessage;
