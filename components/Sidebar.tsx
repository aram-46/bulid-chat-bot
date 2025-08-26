import React, { useState, useRef } from 'react';
import type { Source, Folder } from '../types';
import { SourceType } from '../types';
import { GlobeIcon, FileTextIcon, PlusIcon, TwitterIcon, TelegramIcon, FolderIcon, TrashIcon, ChevronRightIcon, EditIcon, EyeIcon } from './icons';

interface SidebarProps {
  sources: Source[];
  folders: Folder[];
  selectedSources: Set<string>;
  onAddSource: (source: Omit<Source, 'id'>) => void;
  onAddFolder: (folder: Omit<Folder, 'id'>) => void;
  onToggleSource: (sourceId: string) => void;
  onDeleteSource: (sourceId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onEditSource: (source: Source) => void;
  onViewSource: (source: Source) => void;
}

const sourceTypes = [SourceType.URL, SourceType.FILE, SourceType.TWITTER, SourceType.TELEGRAM];

const SourceTypeIcon = ({ type }: { type: SourceType }) => {
  const commonClass = "w-5 h-5 mr-3 text-slate-400 flex-shrink-0";
  switch (type) {
    case SourceType.URL: return <GlobeIcon className={commonClass} />;
    case SourceType.FILE: return <FileTextIcon className={commonClass} />;
    case SourceType.TWITTER: return <TwitterIcon className={commonClass} />;
    case SourceType.TELEGRAM: return <TelegramIcon className={commonClass} />;
    default: return null;
  }
};

const AddSourceForm: React.FC<{onAddSource: SidebarProps['onAddSource']; folders: Folder[]; onDone: () => void;}> = ({ onAddSource, folders, onDone }) => {
    const [newSourceType, setNewSourceType] = useState<SourceType>(SourceType.URL);
    const [newSourceValue, setNewSourceValue] = useState('');
    const [newSourceName, setNewSourceName] = useState('');
    const [newSourceFolderId, setNewSourceFolderId] = useState<string>('');
    const [uploadStatus, setUploadStatus] = useState<{status: 'idle' | 'reading' | 'success' | 'error', message: string}>({status: 'idle', message: ''});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setNewSourceName('');
        setNewSourceValue('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setUploadStatus({status: 'idle', message: ''});
    };

    const getPlaceholder = () => {
        switch (newSourceType) {
        case SourceType.URL: return "https://example.com";
        case SourceType.FILE: return "Click to select a file";
        case SourceType.TWITTER: return "@username or link";
        case SourceType.TELEGRAM: return "@channel or link";
        default: return "";
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            resetForm();
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setUploadStatus({status: 'error', message: 'File is too large (> 10MB).'});
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onloadstart = () => {
            setUploadStatus({status: 'reading', message: 'Reading file...'});
        }
        reader.onload = (event) => {
            setNewSourceName(file.name);
            setNewSourceValue(event.target?.result as string); // This will be a data URL (base64)
            setUploadStatus({status: 'success', message: 'File ready!'});
        };
        reader.onerror = () => {
             setUploadStatus({status: 'error', message: 'Could not read file.'});
             if (fileInputRef.current) fileInputRef.current.value = '';
        }
        reader.readAsDataURL(file);
    };

    const handleAddSource = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSourceValue.trim() || !newSourceName.trim()) return;

        const newSource: Omit<Source, 'id'> = {
            type: newSourceType,
            name: newSourceName,
            value: newSourceValue,
        };

        if(newSourceType === SourceType.FILE && fileInputRef.current?.files?.[0]){
            newSource.mimeType = fileInputRef.current.files[0].type;
        }

        if(newSourceFolderId) {
            newSource.folderId = newSourceFolderId;
        }

        onAddSource(newSource);
        resetForm();
        onDone();
    };
    
    return (
      <form onSubmit={handleAddSource} className="bg-slate-900 p-3 rounded-lg mb-4">
            <h3 className="text-sm font-semibold mb-3 text-slate-300">Add New Source</h3>
            <div className="mb-2">
                <label className="text-xs text-slate-400 mb-1 block">Source Name</label>
                 <input type="text" value={newSourceName} onChange={(e) => setNewSourceName(e.target.value)} placeholder="e.g., React Docs" disabled={newSourceType === SourceType.FILE} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"/>
            </div>
            <div className="mb-3">
                <label className="text-xs text-slate-400 mb-1 block">Source Type</label>
                <div className="flex bg-slate-700 rounded-md p-1">
                    {sourceTypes.map(type => (
                        <button type="button" key={type} onClick={() => { setNewSourceType(type); resetForm(); }} className={`flex-1 text-xs py-1 rounded ${newSourceType === type ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>
                            {type}
                        </button>
                    ))}
                </div>
            </div>
            <div className="mb-3">
                 <label className="text-xs text-slate-400 mb-1 block">{newSourceType} Value</label>
                 {newSourceType === SourceType.FILE ? (
                    <div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.html,.htm,.png,.jpg,.jpeg,.txt,.md" className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-teal-300 hover:file:bg-slate-600"/>
                        {uploadStatus.message && (
                            <p className={`text-xs mt-2 ${uploadStatus.status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                {uploadStatus.message}
                            </p>
                        )}
                    </div>
                 ) : (
                    <input type="text" value={newSourceValue} onChange={(e) => setNewSourceValue(e.target.value)} placeholder={getPlaceholder()} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                 )}
            </div>
            <div className="mb-3">
                <label className="text-xs text-slate-400 mb-1 block">Folder (Optional)</label>
                <select value={newSourceFolderId} onChange={e => setNewSourceFolderId(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">None</option>
                    {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                </select>
            </div>
            <div className="flex gap-2">
                <button type="button" onClick={onDone} className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={uploadStatus.status === 'reading'} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md text-sm flex items-center justify-center transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed">
                    <PlusIcon className="w-4 h-4 mr-2" /> Add Source
                </button>
            </div>
        </form>
    );
};

const AddFolderForm: React.FC<{onAddFolder: SidebarProps['onAddFolder']; onDone: () => void;}> = ({ onAddFolder, onDone }) => {
    const [name, setName] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim()) return;
        onAddFolder({ name });
        setName('');
        onDone();
    };
    return (
        <form onSubmit={handleSubmit} className="bg-slate-900 p-3 rounded-lg mb-4 flex gap-2">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="New folder name..." className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white font-bold p-2 rounded-md text-sm flex items-center justify-center transition-colors"><PlusIcon className="w-5 h-5" /></button>
            <button type="button" onClick={onDone} className="bg-slate-600 hover:bg-slate-500 text-white font-bold p-2 rounded-md text-sm">X</button>
        </form>
    );
};

const FolderItem: React.FC<{folder: Folder; children: React.ReactNode; onDeleteFolder: (id: string) => void;}> = ({ folder, children, onDeleteFolder }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div>
            <div onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between group p-2 rounded-md hover:bg-slate-700/50 cursor-pointer">
                <div className="flex items-center">
                    <ChevronRightIcon className={`w-4 h-4 mr-2 text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    <FolderIcon className="w-5 h-5 mr-3 text-teal-400" />
                    <span className="font-semibold text-slate-200">{folder.name}</span>
                </div>
                 <button onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrashIcon className="w-4 h-4"/>
                </button>
            </div>
            {isOpen && <div className="pl-6 border-l border-slate-700 ml-3">{children}</div>}
        </div>
    )
}

export const Sidebar: React.FC<SidebarProps> = ({ sources, folders, selectedSources, onAddSource, onAddFolder, onToggleSource, onDeleteSource, onDeleteFolder, onEditSource, onViewSource }) => {
    const [showAddSource, setShowAddSource] = useState(false);
    const [showAddFolder, setShowAddFolder] = useState(false);

    const sourceItemProps = {
        onToggle: onToggleSource,
        onDelete: onDeleteSource,
        onEdit: onEditSource,
        onView: onViewSource,
    };

    return (
        <div className="w-1/3 max-w-sm bg-slate-800 text-white flex flex-col p-4 border-r border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-slate-200">Knowledge Sources</h2>
            
            <div className="flex gap-2 mb-4">
                <button onClick={() => { setShowAddFolder(true); setShowAddSource(false); }} className="flex-1 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors"><FolderIcon className="w-4 h-4 mr-2"/>New Folder</button>
                <button onClick={() => { setShowAddSource(true); setShowAddFolder(false); }} className="flex-1 text-sm bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors"><PlusIcon className="w-4 h-4 mr-2"/>New Source</button>
            </div>

            {showAddFolder && <AddFolderForm onAddFolder={onAddFolder} onDone={() => setShowAddFolder(false)} />}
            {showAddSource && <AddSourceForm onAddSource={onAddSource} folders={folders} onDone={() => setShowAddSource(false)} />}

            <div className="flex-grow overflow-y-auto pr-2">
                <h3 className="text-lg font-semibold my-3 text-slate-300">Your Library</h3>
                {sources.length === 0 && folders.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">Your library is empty. Add a folder or source to begin.</p>
                ) : (
                    <ul className="space-y-1">
                        {folders.map(folder => (
                            <li key={folder.id}>
                                <FolderItem folder={folder} onDeleteFolder={onDeleteFolder}>
                                    <ul className="space-y-1 mt-2">
                                    {sources.filter(s => s.folderId === folder.id).map(source => (
                                        <SourceItem key={source.id} source={source} isSelected={selectedSources.has(source.id)} {...sourceItemProps} />
                                    ))}
                                    </ul>
                                </FolderItem>
                            </li>
                        ))}
                         {sources.filter(s => !s.folderId).map(source => (
                             <SourceItem key={source.id} source={source} isSelected={selectedSources.has(source.id)} {...sourceItemProps} />
                         ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const SourceItem = ({ source, isSelected, onToggle, onDelete, onEdit, onView }: { source: Source, isSelected: boolean, onToggle: (id: string) => void, onDelete: (id: string) => void, onEdit: (source: Source) => void, onView: (source: Source) => void }) => (
    <li className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between group">
        <div className="flex items-center overflow-hidden flex-1">
            <SourceTypeIcon type={source.type} />
            <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-slate-200 truncate" title={source.name}>{source.name}</p>
                <p className="text-xs text-slate-400 truncate" title={source.value}>{source.type === SourceType.FILE ? source.mimeType : source.value}</p>
            </div>
        </div>
        <div className="flex items-center pl-2">
             <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                {source.type === SourceType.FILE && (
                    <button onClick={() => onView(source)} title="View File" className="text-slate-400 hover:text-teal-400 p-1">
                        <EyeIcon className="w-4 h-4" />
                    </button>
                )}
                <button onClick={() => onEdit(source)} title="Edit Source" className="text-slate-400 hover:text-teal-400 p-1">
                    <EditIcon className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(source.id)} title="Delete Source" className="text-slate-400 hover:text-red-400 p-1">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(source.id)}
                className="form-checkbox h-5 w-5 bg-slate-600 border-slate-500 rounded text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-800 focus:ring-2 ml-2 flex-shrink-0"
            />
        </div>
    </li>
);