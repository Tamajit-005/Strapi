import { defineQuery } from "next-sanity";

export const ALL_POSTS_FULL_QUERY = defineQuery(`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    body,
    publishedAt,
    image { asset, alt, hotspot, crop },
    author-> { name },
    categories[]-> { _id, name, "slug": slug.current }
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
    author-> { name },
    categories[]-> { _id, name, "slug": slug.current }
  }
`);

export const ALL_CATEGORIES_QUERY = defineQuery(`
  *[_type == "category"] | order(name asc) {
    _id,
    name,
    "slug": slug.current
  }
`);
