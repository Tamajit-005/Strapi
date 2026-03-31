import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const STRAPI_GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL || "http://localhost:1337/graphql";

// Singleton pattern — one client instance for the entire browser session
let clientInstance: ReturnType<typeof createApolloClient> | null = null;

function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: STRAPI_GRAPHQL_ENDPOINT }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: "cache-first",
        errorPolicy: "all",
      },
      watchQuery: {
        fetchPolicy: "cache-first",
      },
    },
  });
}

export const client =
  // Server-side: always fresh instance (no singleton — each request is isolated)
  typeof window === "undefined"
    ? createApolloClient()
    // Client-side: reuse the same instance so InMemoryCache persists across navigations
    : (clientInstance ??= createApolloClient());