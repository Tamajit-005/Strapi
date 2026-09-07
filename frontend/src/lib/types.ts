import type { PortableTextBlock } from "next-sanity";

export interface SanityImage {
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string | null;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  } | null;
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } | null;
}

export interface Author {
  _id: string;
  name: string;
  slug: string;
  email?: string | null;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  description?: string | null;
  body?: PortableTextBlock[] | null;
  publishedAt: string;
  image?: SanityImage | null;
  author?: Author | null;
  categories?: Category[] | null;
  cardColor?: string | null;
}

// Backwards-compat alias used during migration — will be removed in Phase 4
export type ImageData = SanityImage;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface BlogPostResponse {
  data: BlogPost[];
  meta?: {
    pagination?: PaginationMeta;
  };
}

export interface SingleBlogPostResponse {
  data: BlogPost;
}

export interface CategoryResponse {
  data: Category[];
  meta?: {
    pagination?: PaginationMeta;
  };
}
