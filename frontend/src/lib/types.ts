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
  name: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
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
