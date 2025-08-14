import { GraphQLClient } from "graphql-request";

const endpoint = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ENDPOINT;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

export const shopifyClient = new GraphQLClient(endpoint ?? "", {
  headers: token
    ? {
        "X-Shopify-Storefront-Access-Token": token,
      }
    : undefined,
});

export async function storefront<T>(query: string, variables?: Record<string, unknown>) {
  if (!endpoint || !token) {
    throw new Error("Shopify environment variables are not configured.");
  }
  return shopifyClient.request<T>(query, variables);
}

export const BUY_MUTATION = /* GraphQL */ `
  mutation createCart($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;


