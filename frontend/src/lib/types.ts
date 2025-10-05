// lib/types.ts

// Image interface
export interface ImageData {
  url: string;
}

// Author interface
export interface Author {
  id: number;
  name: string;
  email: string;
  avatar: ImageData;
}

// Category interface
export interface Category {
  id: number; // Use `id` instead of `documentId` (Strapi returns numeric IDs)
  name: string;
  description: string;
}

// Blog post interface
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  createdAt: string;
  cover: ImageData;
  author: Author;
  categories: Category[];
}

// For creating a post (client-side)
export interface UserBlogPostData {
  title: string;
  slug: string;
  description: string;
  content: string;
}

// Response types
export interface BlogPostResponse {
  data: BlogPost[];
}

export interface SingleBlogPostResponse {
  data: BlogPost;
}
