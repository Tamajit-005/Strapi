// lib/api.ts
import axios from "axios";
import { UserBlogPostData } from "./types";
import type { BlogPost } from "./types";

export const api: any = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL,
})

// ✅ Fetch all posts with pagination and optional search
export const getAllPosts = async (page = 1, searchQuery = "") => {
  try {
    const searchFilter = searchQuery
      ? `&filters[title][$containsi]=${encodeURIComponent(searchQuery)}`
      : "";

    const response = await api.get(
      `/api/blogs?populate=*&pagination[page]=${page}&pagination[pageSize]=${process.env.NEXT_PUBLIC_PAGE_LIMIT}${searchFilter}`
    );

    return {
      posts: response.data.data,
      pagination: response.data.meta?.pagination,
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw new Error("Server error");
  }
};

// ✅ Fetch single post by slug
export const getPostBySlug = async (slug: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/blogs?filters[slug][$eq]=${slug}&populate=*`
    );

    const data = await response.json();

    if (data.data.length > 0) {
      const item = data.data[0];
      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: item.description,
        content: item.content,
        cover: item.cover,
        categories: item.category || [],
        createdAt: item.createdAt,
        author: item.author,
      };
    }

    throw new Error("Post not found");
  } catch (err) {
    console.error("Error fetching post:", err);
    throw new Error("Server error");
  }
};

// ✅ Fetch all categories
export const getAllCategories = async () => {
  try {
    const response = await api.get(`/api/categories`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Server error");
  }
};

// ✅ Upload cover image
export const uploadImage = async (image: File, refId: number) => {
  try {
    const formData = new FormData();
    formData.append("files", image);
    formData.append("ref", "api::blog.blog");
    formData.append("refId", refId.toString());
    formData.append("field", "cover");

    const response = await api.post(`/api/upload`, formData);
    return response.data[0];
  } catch (err) {
    console.error("Error uploading image:", err);
    throw err;
  }
};

// ✅ Create a new blog post
export const createPost = async (postData: UserBlogPostData) => {
  try {
    const reqData = { data: { ...postData } };
    const response = await api.post(`/api/blogs`, reqData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }
};


// ✅ Search posts by title
export async function getBlogsBySearch(query: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/blogs?filters[title][$containsi]=${encodeURIComponent(
        query
      )}&populate=*`
    );
    const data = await res.json();

    return data.data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      slug: item.slug,
      cover: item.cover,
      createdAt: item.createdAt,
      categories: item.category || [],
      author: item.author || null,
    }));
  } catch (err) {
    console.error("Error fetching blogs by search:", err);
    return [];
  }
}