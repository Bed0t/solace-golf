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

// Basic product listing query
const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($first: Int = 50) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          featuredImage { url altText width height }
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
        }
      }
    }
  }
`;

// Single product by handle
const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      featuredImage { url altText width height }
      images(first: 10) { edges { node { url altText width height } } }
      options { id name values }
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions { name value }
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            image { url altText width height }
          }
        }
      }
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
    }
  }
`;

type ProductEdge<T> = { edges: { node: T }[] }

export type ShopifyMoney = { amount: string; currencyCode: string }
export type ShopifyImage = { url: string; altText?: string | null; width?: number | null; height?: number | null }

export type ShopifyProduct = {
  id: string
  handle: string
  title: string
  description: string
  featuredImage?: ShopifyImage | null
  priceRange: { minVariantPrice: ShopifyMoney; maxVariantPrice: ShopifyMoney }
}

export type ShopifyVariant = {
  id: string
  title: string
  availableForSale: boolean
  selectedOptions: { name: string; value: string }[]
  price: ShopifyMoney
  compareAtPrice?: ShopifyMoney | null
  image?: ShopifyImage | null
}

export type ShopifyProductFull = ShopifyProduct & {
  images?: ProductEdge<ShopifyImage>
  options: { id: string; name: string; values: string[] }[]
  variants: ProductEdge<ShopifyVariant>
}

export async function fetchProducts(first: number = 50): Promise<ShopifyProduct[]> {
  const res = await storefront<{ products: ProductEdge<ShopifyProduct> }>(PRODUCTS_QUERY, { first })
  return res.products.edges.map((e) => e.node)
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProductFull | null> {
  const res = await storefront<{ product: ShopifyProductFull | null }>(PRODUCT_BY_HANDLE_QUERY, { handle })
  return res.product
}

