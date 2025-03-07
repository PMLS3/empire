/**
 * Publishing Platform Integration Types
 */

// Publishing platform credentials
export interface PublishingPlatformCredentials {
  platform: 'amazon_kdp' | 'ingramspark' | 'apple_books' | 'google_play_books';
  access_key?: string;
  secret_key?: string;
  refresh_token?: string;
  access_token?: string;
  token_expires_at?: Date | string;
  account_id?: string;
  is_valid?: boolean;
  last_validated?: Date | string;
}

// Amazon KDP specific types
export interface AmazonKdpConfig {
  marketplace: 'us' | 'uk' | 'de' | 'fr' | 'es' | 'it' | 'nl' | 'jp' | 'br' | 'ca' | 'mx' | 'au' | 'in';
  pricing: {
    currency: string;
    listPrice: number;
    promotionalPrice?: number;
    promotionalStartDate?: Date | string;
    promotionalEndDate?: Date | string;
  };
  categories: string[];
  keywords: string[];
  series?: {
    name: string;
    volume: number;
  };
  adult_content: boolean;
  publication_date?: Date | string;
  pre_order?: boolean;
  pre_order_release_date?: Date | string;
}

// IngramSpark specific types
export interface IngramSparkConfig {
  pricing: {
    currency: string;
    listPrice: number;
    wholesale_discount: number; // percentage
  };
  print_options: {
    paper_type: 'white' | 'cream' | 'color';
    binding: 'paperback' | 'hardcover' | 'case_laminate' | 'cloth';
    laminate: 'gloss' | 'matte' | 'none';
    edge_color?: string;
  };
  distribution_channels: {
    ingram: boolean;
    amazon: boolean;
    barnes_and_noble: boolean;
    baker_and_taylor: boolean;
    international: boolean;
  };
  returns: 'yes' | 'no';
  print_on_demand: boolean;
}

// Apple Books specific types
export interface AppleBooksConfig {
  pricing: {
    currency: string;
    listPrice: number;
    agency: boolean; // true for agency pricing model
  };
  categories: string[];
  keywords: string[];
  series?: {
    name: string;
    volume: number;
  };
  pre_order?: boolean;
  pre_order_release_date?: Date | string;
  sample_length?: number; // percentage of book available as sample
  territories: string[]; // ISO country codes
}

// Google Play Books specific types
export interface GooglePlayBooksConfig {
  pricing: {
    currency: string;
    listPrice: number;
    promotionalPrice?: number;
    promotionalStartDate?: Date | string;
    promotionalEndDate?: Date | string;
  };
  categories: string[];
  series?: {
    name: string;
    volume: number;
  };
  sample_length?: number; // percentage of book available as sample
  territories: string[]; // ISO country codes
}

// Publishing status for a specific platform
export interface PlatformPublishingStatus {
  platform: 'amazon_kdp' | 'ingramspark' | 'apple_books' | 'google_play_books';
  status: 'draft' | 'submitted' | 'in_review' | 'published' | 'rejected' | 'error';
  platform_book_id?: string;
  submission_date?: Date | string;
  publication_date?: Date | string;
  rejection_reason?: string;
  error_message?: string;
  sales_link?: string;
  last_updated?: Date | string;
}

// Book marketing assets
export interface BookMarketingAssets {
  cover_mockups: string[];
  social_media_images: string[];
  book_preview: string;
  author_website_assets: string[];
}

// Book analytics data
export interface BookAnalytics {
  platform: 'amazon_kdp' | 'ingramspark' | 'apple_books' | 'google_play_books' | 'aggregate';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
  start_date?: Date | string;
  end_date?: Date | string;
  sales: {
    units: number;
    revenue: number;
    currency: string;
    by_format?: {
      ebook?: number;
      paperback?: number;
      hardcover?: number;
      audiobook?: number;
    };
    by_country?: Record<string, number>; // ISO country code to units
  };
  royalties: {
    amount: number;
    currency: string;
  };
  page_reads?: number; // For subscription services like Kindle Unlimited
  free_downloads?: number;
  returns?: number;
  ranking?: {
    overall?: number;
    category?: Record<string, number>; // Category name to rank
  };
}

// Book bundle
export interface BookBundle {
  id: string;
  title: string;
  description: string;
  books: string[]; // Book IDs
  cover_image?: string;
  price: {
    currency: string;
    amount: number;
    discount_percentage?: number; // Discount compared to buying separately
  };
  status: 'draft' | 'published';
  created_at: Date | string;
  updated_at: Date | string;
  published_at?: Date | string;
  sales_data?: {
    units_sold: number;
    revenue: number;
    currency: string;
  };
  marketing_assets?: {
    bundle_mockup?: string;
    promotional_images?: string[];
  };
}

// Print-on-demand order
export interface PrintOnDemandOrder {
  id: string;
  book_id: string;
  service: 'amazon_kdp' | 'ingramspark' | 'other';
  quantity: number;
  format: 'paperback' | 'hardcover';
  unit_cost: number;
  total_cost: number;
  currency: string;
  shipping_address: {
    name: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  shipping_method: 'standard' | 'expedited' | 'priority';
  shipping_cost: number;
  status: 'draft' | 'submitted' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery_date?: Date | string;
  actual_delivery_date?: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
}