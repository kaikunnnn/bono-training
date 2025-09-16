// src/types/ghost.ts
// Ghost APIのレスポンス型定義

export interface GhostPost {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  html: string;
  excerpt: string;
  feature_image: string | null;
  featured: boolean;
  published_at: string;
  updated_at: string;
  created_at: string;
  reading_time: number;
  tags?: GhostTag[];
  primary_tag?: GhostTag | null;
  authors?: GhostAuthor[];
  primary_author?: GhostAuthor;
  url: string;
  custom_excerpt?: string | null;
}

export interface GhostTag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  feature_image?: string | null;
  visibility: string;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface GhostAuthor {
  id: string;
  name: string;
  slug: string;
  profile_image?: string | null;
  cover_image?: string | null;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  url: string;
}

export interface GhostPostsResponse {
  posts: GhostPost[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      pages: number;
      total: number;
      next?: number | null;
      prev?: number | null;
    };
  };
}

export interface GhostApiOptions {
  include?: string[];
  fields?: string[];
  filter?: string;
  limit?: number;
  page?: number;
  order?: string;
}