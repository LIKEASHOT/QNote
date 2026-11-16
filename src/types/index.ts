export interface Notebook {
  id: string;
  title: string;
  description?: string;
  colorKey: string; // references NATURAL_PALETTES key
  customColor?: string;
  createdAt: number;
  updatedAt: number;
  content: string; // Markdown or HTML string
  fontSize?: number; // e.g. 16
  zoomLevel?: number; // e.g. 1.0 (50% - 250%)
  alignment?: 'left' | 'center' | 'right';
  headingsCount?: number;
}

export interface TabItem {
  id: string; // notebook id
  title: string;
  colorKey: string;
}

export interface OutlineItem {
  id: string;
  text: string;
  level: number; // 1 to 6
  pos: number;
}

export type CodeLanguage = 'java' | 'python' | 'javascript' | 'typescript' | 'sql' | 'bash' | 'rust' | 'json' | 'html' | 'css' | 'plaintext';
