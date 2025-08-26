
import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { SendIcon, BotIcon, DownloadIcon, CopyIcon } from './icons';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onExportChat: () => void;
}

const TypingIndicator = () => (
    <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
    </div>
);

const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`group flex items-end gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.sender === 'bot' && (
                 <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                     <BotIcon className="w-5 h-5 text-teal-400" />
                 </div>
            )}
            <div className={`max-w-lg lg:max-w-2xl px-4 py-3 rounded-2xl relative ${message.sender === 'user' ? 'bg-teal-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
            </div>
            <button onClick={handleCopy} title="Copy text" className="shrink-0 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                {copied ? <span className="text-xs">Copied!</span> : <CopyIcon className="w-4 h-4"/>}
            </button>
        </div>
    );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSendMessage, onExportChat }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900">
       <header className="flex items-center justify-between p-4 border-b border-slate-700">
           <h1 className="text-lg font-bold text-slate-200">Chat</h1>
           <button onClick={onExportChat} className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-3 rounded-md transition-colors">
               <DownloadIcon className="w-4 h-4" />
               Export Chat
           </button>
       </header>
      <div className="flex-1 p-6 overflow-y-auto">
        {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-slate-500">
                <BotIcon className="w-16 h-16 mb-4"/>
                <h2 className="text-2xl font-bold text-slate-300">Grounding Source Chatbot</h2>
                <p className="text-center mt-2">Add a source on the left and select it to start chatting. <br /> (برای شروع گفتگو، یک منبع در سمت چپ اضافه و انتخاب کنید)</p>
            </div>
        ) : (
        <div className="space-y-4">
          {messages.map(message => <MessageItem key={message.id} message={message} />)}
          {isLoading && (
            <div className="flex items-end gap-3 justify-start">
               <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-teal-400" /></div>
               <div className="max-w-lg px-4 py-3 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
                    <TypingIndicator />
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-700">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Ask a question based on your sources..."
            disabled={isLoading}
            className="w-full bg-slate-800 border border-slate-600 rounded-full py-3 pl-4 pr-14 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white hover:bg-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
