import { client } from "@/lib/apolloClient";
import { gql } from "@apollo/client";


export const GET_ALL_POSTS = gql`
  query GetAllPosts {
    blogs {
      title
      documentId
      slug
      description
      content
      cover {
        url
      }
      category {
        documentId
        name
        slug
        description
      }
      author {
        name
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
      cover {
        url
      }
      category {
        documentId
        name
        slug
        description
      }
      author {
        name
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
      data {
        id
        attributes {
          name
          slug
          description
        }
      }
    }
  }
`;

// Type definitions

export type Category = {
  documentId: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type BlogPost = {
  title: string;
  documentId: string;
  slug: string;
  description?: string;
  content?: string;
  cover?: { url: string };
  category: Category[];
  author?: { name: string; email: string };
  createdAt?: string;
  updatedAt?: string;
};

export type GetAllPostsResult = {
  blogs?: BlogPost[];
};

export type GetPostByDocumentIdResult = {
  blog?: BlogPost;
};

export type GetAllCategoriesResult = {
  categories: {
    data: Array<{
      id: string;
      attributes: {
        name: string;
        slug: string;
        description: string;
      };
    }>;
  };
};

// API functions

export async function getAllPosts() {
  const result = await client.query<GetAllPostsResult>({
    query: GET_ALL_POSTS,
    fetchPolicy: "no-cache",
  });

  if (!result.data?.blogs) throw new Error("No blogs data returned");
  return result.data.blogs;
}

export async function getPostByDocumentId(documentId: string) {
  const result = await client.query<GetPostByDocumentIdResult>({
    query: GET_POST_BY_DOCUMENT_ID,
    variables: { documentId },
    fetchPolicy: "no-cache",
  });

  if (!result.data?.blog) throw new Error("Blog not found");
  return result.data.blog;
}

export async function getAllCategories() {
  const result = await client.query<GetAllCategoriesResult>({
    query: GET_ALL_CATEGORIES,
    fetchPolicy: "no-cache",
  });

  if (!result.data?.categories) throw new Error("Failed to fetch categories");
  return result.data.categories.data.map(cat => ({
    id: cat.id,
    ...cat.attributes,
  }));
}

