// User Types
export interface User {
  uid: string;
  email: string;
  name: string;
  subscription_plan: 'free' | 'starter' | 'pro' | 'business';
  daily_credits: number;
  credits_reset_at: Date;
  github_repo: string;
  github_folder: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile extends User {}

// Project Types
export interface Project {
  id: string;
  uid: string;
  name: string;
  description: string;
  site_type: 'ecommerce' | 'blog' | 'portfolio' | 'agency' | 'saas' | 'custom';
  admin_schema: AdminSchema;
  github_path: string;
  preview_url: string;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

// Admin Schema Types
export interface AdminSchema {
  modules: AdminModule[];
  permissions?: Record<string, string[]>;
}

export interface AdminModule {
  id: string;
  name: string;
  type: 'form' | 'table' | 'gallery' | 'custom';
  fields: AdminField[];
}

export interface AdminField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea' | 'file';
  required: boolean;
  options?: string[];
}

// AI Types
export interface AIGenerationRequest {
  userId: string;
  projectId: string;
  prompt: string;
  siteType: string;
}

export interface GeneratedWebsite {
  html: string;
  css: string;
  adminSchema: AdminSchema;
  metadata: {
    title: string;
    description: string;
    siteType: string;
  };
}

// Payment Types
export interface PaymentSession {
  session_id: string;
  url: string;
  plan: string;
  amount: number;
  currency: string;
}

export interface PricingTier {
  name: 'free' | 'starter' | 'pro' | 'business';
  price: number;
  currency: string;
  features: string[];
  ai_credits: number;
  projects_limit: number;
}

export interface CountryPricing {
  country: string;
  country_code: string;
  currency: string;
  symbol: string;
  payment_gateways: string[];
  local_payment_note?: string;
  tiers: PricingTier[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  uid: string;
  user: {
    email: string;
    name: string;
    subscription_plan: string;
    daily_credits: number;
  };
}

// Database Types
export interface DBUser {
  uid: string;
  email: string;
  name: string;
  subscription_plan: string;
  daily_credits: number;
  credits_reset_at: string;
  github_repo: string;
  github_folder: string;
  created_at: string;
  updated_at: string;
}

export interface DBProject {
  id: string;
  uid: string;
  name: string;
  description: string;
  site_type: string;
  admin_schema: string;
  github_path: string;
  preview_url: string;
  is_published: number;
  created_at: string;
  updated_at: string;
}
