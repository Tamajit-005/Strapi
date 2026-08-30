import { defineQuery } from "next-sanity";

export const ALL_POSTS_QUERY = defineQuery(`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    publishedAt,
    image { asset, alt, hotspot, crop },
    author-> { _id, name, "slug": slug.current, email },
    categories[]-> { _id, name, "slug": slug.current, description }
  }
`);

export const ALL_POSTS_FULL_QUERY = defineQuery(`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    body,
    publishedAt,
    image { asset, alt, hotspot, crop },
    author-> { _id, name, "slug": slug.current, email },
    categories[]-> { _id, name, "slug": slug.current, description }
  }
`);

export const POST_BY_SLUG_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    body,
    publishedAt,
    image { asset, alt, hotspot, crop },
    author-> { _id, name, "slug": slug.current, email },
    categories[]-> { _id, name, "slug": slug.current, description }
  }
`);

export const ALL_CATEGORIES_QUERY = defineQuery(`
  *[_type == "category"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    description
  }
`);

export const POSTS_BY_CATEGORY_QUERY = defineQuery(`
  *[_type == "post" && $slug in categories[]->slug.current] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    publishedAt,
    image { asset, alt },
    author-> { _id, name, "slug": slug.current, email },
    categories[]-> { _id, name, "slug": slug.current }
  }
`);

export const SEARCH_POSTS_QUERY = defineQuery(`
  *[_type == "post" && (
    title match $query + "*" ||
    description match $query + "*" ||
    pt::text(body) match $query + "*"
  )] | order(publishedAt desc) [0...50] {
    _id,
    title,
    "slug": slug.current,
    description,
    publishedAt,
    image { asset, alt },
    categories[]-> { _id, name, "slug": slug.current }
  }
`);

// Re-export types for convenience
export type { BlogPost, Category, Author, SanityImage } from "@/lib/types";
