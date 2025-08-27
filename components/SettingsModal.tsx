import React, { useState, useEffect } from 'react';
import { XIcon, PlusIcon, TrashIcon } from './icons';
import type { AIModelConfig } from '../types';

interface SettingsModalProps {
    currentConfigs: AIModelConfig[];
    onSave: (newConfigs: AIModelConfig[]) => void;
    onClose: () => void;
}

// Per instructions, the API key must come from process.env. We will show its status.
const API_KEY_PROVIDED = !!process.env.API_KEY;

const AddCustomModelForm: React.FC<{ onAddModel: (model: AIModelConfig) => void }> = ({ onAddModel }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim() || !url.trim()){
            return;
        }
        onAddModel({
            id: `custom-${new Date().toISOString()}`,
            name,
            url,
            type: 'custom',
            isActive: true,
        });
        setName('');
        setUrl('');
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900/50 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-100 mb-2">Add Custom Model</h4>
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Model Name (e.g., My Llama)"
                    className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                />
                <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://your-model-api.com/generate"
                    className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                />
                <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center transition-colors">
                   <PlusIcon className="w-4 h-4 mr-2" /> Add
                </button>
            </div>
        </form>
    );
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ currentConfigs, onSave, onClose }) => {
    const [activeTab, setActiveTab] = useState('connections');
    const [modelConfigs, setModelConfigs] = useState<AIModelConfig[]>(() => JSON.parse(JSON.stringify(currentConfigs)));

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleToggleActive = (id: string) => {
        setModelConfigs(prev => prev.map(m => m.id === id ? {...m, isActive: !m.isActive} : m));
    };
    
    const handleAddModel = (model: AIModelConfig) => {
        setModelConfigs(prev => [...prev, model]);
    };

    const handleDeleteModel = (id: string) => {
        setModelConfigs(prev => prev.filter(m => m.id !== id));
    };

    const handleSave = () => {
        onSave(modelConfigs);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-200">Settings</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-200">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="flex-grow flex">
                    <nav className="w-1/4 border-r border-slate-700 p-4">
                        <ul>
                            <li>
                                <button
                                    onClick={() => setActiveTab('connections')}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'connections' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}
                                >
                                    Connections
                                </button>
                            </li>
                        </ul>
                    </nav>
                    <main className="w-3/4 p-6 overflow-y-auto">
                        {activeTab === 'connections' && (
                            <div>
                                <h3 className="text-lg font-semibold text-slate-200 mb-4">AI Model Connections</h3>
                                <p className="text-sm text-slate-400 mb-6">Manage and activate the AI models used to generate responses. You can enable multiple models.</p>
                                
                                <div className="space-y-3 mb-6">
                                    {modelConfigs.map(model => (
                                    <div key={model.id} className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center">
                                                {model.type === 'gemini' && (
                                                     <div className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${API_KEY_PROVIDED ? 'bg-green-500' : 'bg-red-500'}`} title={API_KEY_PROVIDED ? 'API Key found' : 'API Key not found'}></div>
                                                )}
                                                <h4 className="font-semibold text-slate-100">{model.name}</h4>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1 pl-6">{model.type === 'gemini' ? `Status: ${API_KEY_PROVIDED ? 'Connected' : 'Not Connected'}` : model.url}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {model.type === 'custom' && (
                                                <button onClick={() => handleDeleteModel(model.id)} title="Delete Model" className="text-slate-500 hover:text-red-400">
                                                    <TrashIcon className="w-5 h-5"/>
                                                </button>
                                            )}
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={model.isActive}
                                                    onChange={() => handleToggleActive(model.id)}
                                                    className="form-checkbox h-5 w-5 bg-slate-600 border-slate-500 rounded text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-800 focus:ring-2"
                                                />
                                                <span className="ml-3 text-sm text-slate-300">Active</span>
                                            </label>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                                <AddCustomModelForm onAddModel={handleAddModel} />
                                <p className="text-xs text-slate-500 mt-4">Note: Custom model integration is for UI demonstration and is not yet fully connected to the chat logic.</p>
                            </div>
                        )}
                    </main>
                </div>
                 <footer className="p-4 border-t border-slate-700 flex-shrink-0 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">Cancel</button>
                    <button onClick={handleSave} className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">Save Changes</button>
                </footer>
            </div>
        </div>
    );
};
