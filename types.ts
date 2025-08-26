
export enum SourceType {
  URL = 'URL',
  FILE = 'File',
  TELEGRAM = 'Telegram',
  TWITTER = 'Twitter',
}

export interface Folder {
  id: string;
  name: string;
}

export interface Source {
  id:string;
  type: SourceType;
  name: string;
  value: string; // The URL for URL type, or base64 data for File type
  mimeType?: string; // e.g., 'application/pdf', 'image/png'
  folderId?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}
