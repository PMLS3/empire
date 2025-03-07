/**
 * Book Publishing System Data Models
 */

// Basic book project model
export interface Book {
  id?: string;
  workspace_id?: string;
  owner_id?: string;
  title?: string;
  description?: string;
  cover_image?: string;
  status?: 'draft' | 'in_progress' | 'ready_to_publish' | 'published' | 'archived';
  book_type?: string;
  language?: string;
  languageOptions?: string[];
  format?: string;
  formatOptions?: string[];
  size?: BookSize;
  pages?: Page[];
  chapters?: Chapter[];
  created_at?: Date | string;
  updated_at?: Date | string;
  published_at?: Date | string | null;
  deleted_at?: Date | string | null;
  
  // Research and planning fields
  keywords?: string[];
  topic?: string;
  topicOptions?: string[];
  category?: string;
  categoryOptions?: string[];
  subCategory?: string;
  subCategoryOptions?: string[];
  categoryAnalysis?: string;
  reviewsAnalysis?: string;
  bookStructure?: string;
  bookStructureBreakdown?: any[];
  bookPlan?: string;
  examples?: any[];
  
  // Publishing criteria
  criteriaPassed?: boolean;
  bundlePossible?: boolean;
  bsrCriteria?: {
    kindle?: { amount: number; less: number; condition: boolean };
    paperback?: { amount: number; less: number; condition: boolean };
    audible?: { amount: number; less: number; condition: boolean };
  };
  search?: { amount: number; condition: boolean };
}

// Book size model
export interface BookSize {
  label: string;
  dimensions?: string;
  width: number;
  length: number;
}

// Page model
export interface Page {
  id: string;
  type: 'cover' | 'content' | 'layout' | 'puzzle' | 'toc' | 'copyright' | 'dedication';
  name: string;
  content?: string;
  images?: string[];
  elements?: Element[];
  chapter_id?: string;
  page_number?: number;
  layout_template?: string;
  background_color?: string;
  background_image?: string;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Chapter model
export interface Chapter {
  id: string;
  title: string;
  description?: string;
  order: number;
  pages?: Page[];
  content?: string;
  status?: 'draft' | 'in_progress' | 'completed' | 'reviewed';
}

// Element model (for page elements)
export interface Element {
  id: string;
  type: 'puzzle' | 'image' | 'text' | 'drawing' | 'path' | 'shape' | 'video' | 'audio';
  puzzle?: PuzzleElement;
  path?: PathElement;
  shape?: ShapeElement;
  text?: TextElement;
  image?: ImageElement;
  video?: VideoElement;
  audio?: AudioElement;
  style: ElementStyle;
}

// Element style properties
export interface ElementStyle {
  width: string;
  height: string;
  top: string;
  left: string;
  transform: string;
  zIndex?: string;
  opacity?: number;
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
  backgroundColor?: string;
}

// Puzzle element properties
export interface PuzzleElement {
  type: 'word-search' | 'crossword' | 'sudoku' | 'maze';
  content: {
    grid: any;
    words?: any;
    size: any;
    showSolution?: boolean;
    locations?: any;
    textColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    locationsColor?: string;
  };
}

// Path element properties
export interface PathElement {
  points: Array<{ x: number; y: number }>;
  brushSize: number;
  color: string;
  opacity: number;
  type: 'pencil' | 'marker' | 'airbrush';
  originalWidth?: number;
  originalHeight?: number;
}

// Shape element properties
export interface ShapeElement {
  type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'polygon';
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  cornerRadius?: number;
  isFilled: boolean;
  hasStroke: boolean;
}

// Text element properties
export interface TextElement {
  content: string;
  font: string;
  size: number;
  color: string;
  alignment: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
  underline: boolean;
  lineHeight: number;
  letterSpacing: number;
  opacity: number;
  effects?: {
    shadow?: {
      enabled: boolean;
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    };
    outline?: {
      enabled: boolean;
      color: string;
      width: number;
    };
  };
}

// Image element properties
export interface ImageElement {
  src: string;
  alt?: string;
  originalWidth?: number;
  originalHeight?: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
  };
}

// Video element properties
export interface VideoElement {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  controls?: boolean;
  muted?: boolean;
  poster?: string;
}

// Audio element properties
export interface AudioElement {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  controls?: boolean;
}

// Book template model
export interface BookTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  book_type: string;
  pages: Page[];
  default_size: BookSize;
  category: string;
  tags: string[];
}

// Research example book model
export interface ResearchExampleBook {
  id?: string;
  title?: string;
  author?: string;
  description?: string;
  cover_image?: string;
  publication_date?: string;
  publisher?: string;
  category?: string;
  sub_category?: string;
  format?: string;
  page_count?: number;
  language?: string;
  isbn?: string;
  asin?: string;
  amazon_link?: string;
  price?: {
    kindle?: number;
    paperback?: number;
    hardcover?: number;
    audiobook?: number;
  };
  bsr?: {
    kindle?: number;
    paperback?: number;
    hardcover?: number;
    audiobook?: number;
  };
  reviews?: {
    count?: number;
    average?: number;
  };
  content_sample?: string;
  toc?: string[];
  research_id?: string;
  workspace_id?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// Export configuration model
export interface ExportConfig {
  format: 'pdf' | 'epub' | 'mobi' | 'fixed-layout';
  quality: 'draft' | 'standard' | 'high';
  includeBleed?: boolean;
  includeTrimMarks?: boolean;
  coverType?: 'front-only' | 'full-wrap';
  pageRange?: 'all' | 'custom';
  customPageRange?: string; // e.g., "1-5, 8, 10-15"
  resolution?: number; // DPI
  colorSpace?: 'rgb' | 'cmyk';
  embedFonts?: boolean;
}

// Publishing platform model
export interface PublishingPlatform {
  id: string;
  name: string;
  logo: string;
  supportedFormats: string[];
  apiIntegration: boolean;
  url: string;
  requirements?: {
    coverDimensions?: string;
    fileFormats?: string[];
    maxFileSize?: number;
    isbn?: boolean;
  };
}

// BookPage type for backward compatibility
export type BookPage = Page;
