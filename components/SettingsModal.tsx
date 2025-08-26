import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';

interface SettingsModalProps {
    onClose: () => void;
}

// Per instructions, the API key must come from process.env. We will show its status.
const API_KEY_PROVIDED = !!process.env.API_KEY;

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('connections');
    const [customModelUrl, setCustomModelUrl] = useState('');

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

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
                                <h3 className="text-lg font-semibold text-slate-200 mb-4 border-b border-slate-600 pb-2">AI Models</h3>
                                
                                <div className="bg-slate-700/50 p-4 rounded-lg mb-6">
                                    <h4 className="font-semibold text-slate-100 mb-2">Google Gemini</h4>
                                    <p className="text-sm text-slate-400 mb-3">The primary model used by this application.</p>
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-2 ${API_KEY_PROVIDED ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-sm text-slate-300">
                                            {API_KEY_PROVIDED ? 'API Key provided via environment variable.' : 'API Key not provided.'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-slate-100 mb-2">Custom Model Endpoint</h4>
                                    <p className="text-sm text-slate-400 mb-3">Connect to a self-hosted or private model via its web server address.</p>
                                    <label htmlFor="custom-model-url" className="text-xs text-slate-400 mb-1 block">Server URL</label>
                                    <input
                                        id="custom-model-url"
                                        type="text"
                                        value={customModelUrl}
                                        onChange={e => setCustomModelUrl(e.target.value)}
                                        placeholder="https://your-model-api.com/generate"
                                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">Note: This feature is a placeholder and not yet connected to the chat logic.</p>
                                </div>

                                <div className="mt-6">
                                   <h4 className="font-semibold text-slate-100 mb-2">Active Model</h4>
                                   <p className="text-sm text-slate-400 mb-3">Choose which model to use for generating responses.</p>
                                   <select className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500">
                                       <option>Google Gemini (gemini-2.5-flash)</option>
                                       <option disabled>Custom Model (Not connected)</option>
                                   </select>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
                 <footer className="p-4 border-t border-slate-700 flex-shrink-0 flex justify-end">
                    <button onClick={onClose} className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">Close</button>
                </footer>
            </div>
        </div>
    );
};
