import { gql } from "@apollo/client";

/* ------------------------------------------------------
   GRAPHQL QUERIES
------------------------------------------------------ */

// ALL BLOG POSTS
export const GET_ALL_POSTS = gql`
  query GetAllPosts {
    blogs(pagination: { limit: 100 }) {
      title
      documentId
      slug
      description
      # content

      category {
        documentId
        name
        # slug
        # description
      }

      cover {
        url
      }

      author {
        name
        # email
      }

      writer {
        username
        # email
      }

      createdAt
      updatedAt
    }
  }
`;

// SINGLE BLOG POST BY DOCUMENT ID
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

// SINGLE CATEGORY BY DOCUMENT ID WITH BLOGS
export const GET_CATEGORY_BY_DOCUMENT_ID = gql`
  query GetCategoryByDocumentId($documentId: ID!) {
    category(documentId: $documentId) {
      documentId
      name
      slug
      description

      blogs {
        documentId
        title
        description
        createdAt

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
      }
    }
  }
`;

// ALL CATEGORIES (flat)
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

// SEARCH BLOGS (server-side filtered — replaces fetching all posts in SearchClient)
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
   TYPESCRIPT TYPES
------------------------------------------------------ */

export type ImageData = {
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, { url: string; width: number; height: number }>;
};

export type Author = {
  name: string;
  email?: string | null;
};

export type Writer = {
  username: string;
  email?: string | null;
};

export type Category = {
  documentId: string;
  name: string;
  slug?: string;
  description?: string | null;
};

export type BlogPost = {
  documentId: string;
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  cover?: ImageData;
  author?: Author | null;
  writer?: Writer | null;
  category?: Category[];
};

/* ------------------------------------------------------
   QUERY RESULT TYPES
------------------------------------------------------ */

export type GetAllPostsResult = {
  blogs: Array<{
    title: string;
    documentId: string;
    slug?: string | null;
    description?: string | null;
    // content?: string | null;
    category?: Category[];
    cover?: { url?: string | null } | null;
    author?: { name: string /* ; email?: string | null */ } | null;
    writer?: { username: string /* ; email?: string | null */ } | null;
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

export type GetCategoryByDocumentIdResult = {
  category?: {
    documentId: string;
    name: string;
    slug: string;
    description?: string | null;
    blogs: Array<{
      documentId: string;
      title: string;
      description?: string | null;
      createdAt?: string | null;
      cover?: { url?: string | null } | null;
      author?: { name: string; email?: string | null } | null;
      writer?: { username: string; email?: string | null } | null;
    }>;
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