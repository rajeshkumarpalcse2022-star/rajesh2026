export interface AdminGreetingItem {
  id: string;
  sender: string;
  message: string;
  photos: string[];
  photoCount: number;
  occasion: string;
  isCustomized: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminGreetingStats {
  total: number;
  customized: number;
  photos: number;
  latest: string | null;
}

export interface AdminGreetingListResponse {
  items: AdminGreetingItem[];
  total: number;
  page: number;
  pageSize: number;
  stats: AdminGreetingStats;
}
