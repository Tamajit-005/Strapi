import { gql } from "@apollo/client";

// Re-export app types for convenience
export type {
  ImageData,
  Author,
  Writer,
  Category,
  BlogPost,
} from "@/lib/types";

/* ------------------------------------------------------
   GRAPHQL QUERIES
------------------------------------------------------ */

export const GET_ALL_POSTS = gql`
  query GetAllPosts {
    blogs(pagination: { limit: 100 }) {
      title
      documentId
      slug
      description

      category {
        documentId
        name
      }

      cover {
        url
      }

      author {
        name
      }

      writer {
        username
      }

      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_POSTS_FULL = gql`
  query GetAllPostsFull {
    blogs(pagination: { limit: 100 }) {
      documentId
      title
      slug
      description
      content

      category {
        documentId
        name
        slug
        description
      }

      cover {
        url
      }

      author {
        name
        email
      }

      writer {
        username
        email
      }

      createdAt
      updatedAt
    }
  }
`;

export const GET_POST_BY_DOCUMENT_ID = gql`
  query GetPostByDocumentId($documentId: ID!) {
    blog(documentId: $documentId) {
      title
      slug
      description
      content

      category {
        documentId
        name
        slug
        description
      }

      cover {
        url
      }

      author {
        name
        email
      }

      writer {
        username
        email
      }

      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    categories {
      documentId
      name
      slug
      description
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const GET_BLOGS_BY_SEARCH = gql`
  query SearchBlogs($query: String!) {
    blogs(
      filters: {
        or: [
          { title: { containsi: $query } }
          { description: { containsi: $query } }
        ]
      }
      pagination: { limit: 50 }
    ) {
      documentId
      title
      description

      cover {
        url
      }

      category {
        documentId
        name
      }

      createdAt
    }
  }
`;

/* ------------------------------------------------------
   QUERY RESULT TYPES
------------------------------------------------------ */

import type { Category } from "@/lib/types";

export type GetAllPostsResult = {
  blogs: Array<{
    title: string;
    documentId: string;
    slug?: string | null;
    description?: string | null;
    category?: Category[];
    cover?: { url?: string | null } | null;
    author?: { name: string } | null;
    writer?: { username: string } | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  }>;
};

export type GetAllPostsFullResult = {
  blogs: Array<{
    documentId: string;
    title: string;
    slug?: string | null;
    description?: string | null;
    content?: string | null;
    category?: Category[];
    cover?: { url?: string | null } | null;
    author?: { name: string; email?: string | null } | null;
    writer?: { username: string; email?: string | null } | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  }>;
};

export type GetPostByDocumentIdResult = {
  blog?: {
    title: string;
    slug?: string | null;
    description?: string | null;
    content?: string | null;
    category?: Category[];
    cover?: { url?: string | null } | null;
    author?: { name: string; email?: string | null } | null;
    writer?: { username: string; email?: string | null } | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  };
};

export type GetAllCategoriesResult = {
  categories: Array<{
    documentId: string;
    name: string;
    slug: string;
    description?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    publishedAt?: string | null;
  }>;
};

export type GetBlogsBySearchResult = {
  blogs: Array<{
    documentId: string;
    title: string;
    description?: string | null;
    cover?: { url?: string | null } | null;
    category?: Array<{ documentId: string; name: string }> | null;
    createdAt?: string | null;
  }>;
};