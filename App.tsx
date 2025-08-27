import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { EditSourceModal } from './components/EditSourceModal';
import { ViewSourceModal } from './components/ViewSourceModal';
import { SettingsModal } from './components/SettingsModal';
import { getGroundedResponse } from './services/geminiService';
import type { Source, Message, Folder, AIModelConfig } from './types';
import { SourceType } from './types';

const App: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [sources, setSources] = useState<Source[]>([
    { id: '1', type: SourceType.URL, name: 'Gemini API Docs', value: 'https://ai.google.dev/docs' },
  ]);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set(['1']));
  const [messages, setMessages] = useState<Message[]>([
      { id: 'welcome', text: 'Hello! I am a chatbot that answers questions based on the sources you provide.\n\nسلام! من یک ربات گفتگو هستم که به سوالات شما بر اساس منابعی که ارائه می‌دهید پاسخ می‌دهم.', sender: 'bot' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [viewingSource, setViewingSource] = useState<Source | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modelConfigs, setModelConfigs] = useState<AIModelConfig[]>([
    { id: 'gemini-default', name: 'Google Gemini (gemini-2.5-flash)', type: 'gemini', isActive: true }
  ]);

  const handleAddFolder = useCallback((folder: Omit<Folder, 'id'>) => {
    const newFolder = { ...folder, id: new Date().toISOString() };
    setFolders(prev => [...prev, newFolder]);
  }, []);

  const handleDeleteFolder = useCallback((folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
    const sourcesToDelete = new Set(sources.filter(s => s.folderId === folderId).map(s => s.id));
    setSources(prev => prev.filter(s => s.folderId !== folderId));
    setSelectedSources(prev => {
        const newSet = new Set(prev);
        sourcesToDelete.forEach(id => newSet.delete(id));
        return newSet;
    });
  }, [sources]);

  const handleAddSource = useCallback((source: Omit<Source, 'id'>) => {
    const newSource = { ...source, id: new Date().toISOString() };
    setSources(prev => [...prev, newSource]);
  }, []);
  
  const handleDeleteSource = useCallback((sourceId: string) => {
      setSources(prev => prev.filter(s => s.id !== sourceId));
      setSelectedSources(prev => {
        const newSet = new Set(prev);
        newSet.delete(sourceId);
        return newSet;
      });
  }, []);

  const handleToggleSource = useCallback((sourceId: string) => {
    setSelectedSources(prev => {
        const newSet = new Set(prev);
        if (newSet.has(sourceId)) {
            newSet.delete(sourceId);
        } else {
            newSet.add(sourceId);
        }
        return newSet;
    });
  }, []);
  
  const handleUpdateSource = useCallback((updatedSource: Source) => {
    setSources(prevSources => prevSources.map(s => s.id === updatedSource.id ? updatedSource : s));
    setEditingSource(null);
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    const userMessage: Message = { id: new Date().toISOString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Check if the primary Gemini model is active
    const geminiIsActive = modelConfigs.some(m => m.type === 'gemini' && m.isActive);
    if (!geminiIsActive) {
        const errorMessage: Message = { 
            id: new Date().toISOString() + '-bot-error', 
            text: 'The default Gemini model is not active. Please enable it in the settings to get a response.', 
            sender: 'bot' 
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        return;
    }

    try {
        const activeSources = sources.filter(s => selectedSources.has(s.id));
        const responseText = await getGroundedResponse(text, activeSources);
        const botMessage: Message = { id: new Date().toISOString() + '-bot', text: responseText, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
    } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: Message = { 
            id: new Date().toISOString() + '-bot-error', 
            text: 'Sorry, I encountered an error. Please try again.', 
            sender: 'bot' 
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }, [sources, selectedSources, modelConfigs]);

  const handleExportChat = useCallback(() => {
    if (messages.length === 0) return;
    const chatHistory = messages.map(msg => `[${msg.sender.toUpperCase()}] ${new Date(msg.id.split('-bot')[0]).toLocaleString()}\n${msg.text}`).join('\n\n---\n\n');
    const blob = new Blob([chatHistory], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chatbot-session-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [messages]);
  
  const handleSaveSettings = useCallback((newConfigs: AIModelConfig[]) => {
    setModelConfigs(newConfigs);
    setIsSettingsOpen(false);
  }, []);

  return (
    <div className="flex h-screen w-full font-sans bg-slate-900">
      <Sidebar
        sources={sources}
        folders={folders}
        selectedSources={selectedSources}
        onAddSource={handleAddSource}
        onAddFolder={handleAddFolder}
        onToggleSource={handleToggleSource}
        onDeleteSource={handleDeleteSource}
        onDeleteFolder={handleDeleteFolder}
        onEditSource={setEditingSource}
        onViewSource={setViewingSource}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onExportChat={handleExportChat}
      />
      {editingSource && (
        <EditSourceModal
            source={editingSource}
            folders={folders}
            onUpdate={handleUpdateSource}
            onCancel={() => setEditingSource(null)}
        />
      )}
      {viewingSource && (
          <ViewSourceModal
            source={viewingSource}
            onClose={() => setViewingSource(null)}
          />
      )}
      {isSettingsOpen && (
        <SettingsModal 
            currentConfigs={modelConfigs}
            onSave={handleSaveSettings}
            onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;