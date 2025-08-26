import React, { useEffect } from 'react';
import type { Source } from '../types';
import { XIcon, DownloadIcon } from './icons';

interface ViewSourceModalProps {
    source: Source;
    onClose: () => void;
}

export const ViewSourceModal: React.FC<ViewSourceModalProps> = ({ source, onClose }) => {
     useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = source.value;
        link.download = source.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderContent = () => {
        if (!source.mimeType) {
            return <p className="text-slate-400">Cannot determine file type.</p>;
        }

        if (source.mimeType.startsWith('image/')) {
            return <img src={source.value} alt={source.name} className="max-w-full max-h-[70vh] object-contain mx-auto" />;
        }

        if (source.mimeType === 'application/pdf') {
            return <embed src={source.value} type="application/pdf" className="w-full h-[75vh]" />;
        }

        return (
            <div className="text-center p-8 bg-slate-700/50 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-300">Preview not available</h3>
                <p className="text-slate-400 mt-2">Cannot display files of type: <span className="font-mono bg-slate-600 px-2 py-1 rounded">{source.mimeType}</span></p>
            </div>
        )
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
             <div 
                className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0 gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <h2 className="text-lg font-bold text-slate-200 truncate" title={source.name}>{source.name}</h2>
                        <button onClick={handleDownload} title="Download File" className="text-slate-400 hover:text-teal-400 p-1 flex-shrink-0">
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-200 flex-shrink-0">
                        <XIcon className="w-6 h-6"/>
                    </button>
                </header>
                <div className="p-4 overflow-auto flex-grow flex items-center justify-center">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
