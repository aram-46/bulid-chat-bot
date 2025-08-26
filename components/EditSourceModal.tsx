import React, { useState, useEffect } from 'react';
import type { Source, Folder } from '../types';
import { XIcon } from './icons';

interface EditSourceModalProps {
    source: Source;
    folders: Folder[];
    onUpdate: (source: Source) => void;
    onCancel: () => void;
}

export const EditSourceModal: React.FC<EditSourceModalProps> = ({ source, folders, onUpdate, onCancel }) => {
    const [name, setName] = useState(source.name);
    const [folderId, setFolderId] = useState(source.folderId || '');

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onCancel]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onUpdate({ ...source, name, folderId: folderId || undefined });
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={onCancel}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4 relative"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onCancel} className="absolute top-3 right-3 text-slate-500 hover:text-slate-200">
                    <XIcon className="w-6 h-6"/>
                </button>
                <h2 className="text-xl font-bold mb-4 text-slate-200">Edit Source</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="sourceName" className="text-sm text-slate-400 mb-2 block">Source Name</label>
                        <input
                            id="sourceName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="sourceFolder" className="text-sm text-slate-400 mb-2 block">Folder</label>
                        <select
                            id="sourceFolder"
                            value={folderId}
                            onChange={e => setFolderId(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="">None</option>
                            {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">Cancel</button>
                        <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};