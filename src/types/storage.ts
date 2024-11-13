export interface StorageItem {
  key: string;
  value: any;
  collection: string;
}

export interface SearchResult {
  id: string;
  document: any;
  metadata: any;
  distance?: number;
}

export interface DbManagerContextType {
  currentCollection: string;
  items: StorageItem[];
  searchResults: SearchResult[];
  isLoading: boolean;
  setCurrentCollection: (collection: string) => void;
  loadItems: (pattern?: string) => Promise<void>;
  saveItem: (key: string, value: any) => Promise<boolean>;
  deleteItem: (key: string) => Promise<boolean>;
  searchItems: (query: string, n_results?: number) => Promise<void>;
} 


export type Backend = 'redis' | 'mongo' | 'chroma';

export interface StorageSetParams {
  key: string;
  value: any;
  collection?: string;
}

export interface StorageSearchParams {
  query: string;
  collection?: string;
  n_results?: number;
}

export interface StorageResponse {
  status: string;
  key: string;
}

export interface SearchResult {
  id: string;
  document: any;
  metadata: any;
  distance?: number;
}

export interface SearchResponse {
  results: SearchResult[];
}

export interface DatabasesResponse {
  databases: string[];
}

export interface CollectionsResponse {
  collections: string[];
}
