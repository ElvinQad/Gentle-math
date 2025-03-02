export const MAX_IMAGES = 10;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif'];

export const EMPTY_TREND_FORM = {
  title: '',
  description: '',
  type: '',
  imageUrls: [''],
  mainImageIndex: 0,
  spreadsheetUrl: '',
  categoryId: '',
};

export const EMPTY_CATEGORY_FORM = {
  name: '',
  slug: '',
  description: '',
  parentId: '',
};

export const TABS = {
  DETAILS: 'details',
  IMAGES: 'images',
  DATA: 'data',
} as const;

export const API_ENDPOINTS = {
  TRENDS: '/api/admin/trends',
  CATEGORIES: '/api/admin/categories',
  UPLOAD: '/api/admin/upload',
} as const; 