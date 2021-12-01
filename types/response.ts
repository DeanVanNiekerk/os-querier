export interface OrdersResponse {
  query: Query;
}

export interface Query {
  selectedCollections: SelectedCollections;
  collections: Collections;
  collection: QueryCollection;
  paymentAssets: PaymentAssets;
  PaymentFilter_collection: PaymentFilterCollection;
  search: Search;
}

export interface PaymentFilterCollection {
  paymentAssets: PaymentAsset[];
  id: string;
}

export interface PaymentAsset {
  symbol: string;
  relayId: string;
  id: string;
  __typename?: PaymentAssetTypename;
}

export enum PaymentAssetTypename {
  PaymentAssetType = "PaymentAssetType",
}

export interface QueryCollection {
  numericTraits: NumericTrait[];
  stringTraits: StringTrait[];
  id: string;
}

export interface NumericTrait {
  key: string;
  value: Value;
}

export interface Value {
  max: number;
  min: number;
}

export interface StringTrait {
  key: string;
  counts: Count[];
}

export interface Count {
  count: number;
  value: string;
}

export interface Collections {
  edges: CollectionsEdge[];
  pageInfo: PageInfo;
}

export interface CollectionsEdge {
  node: PurpleNode;
  cursor: string;
}

export interface PurpleNode {
  assetCount: null;
  imageUrl: null | string;
  name: string;
  slug: string;
  isVerified: boolean;
  id: string;
  __typename?: PurpleTypename;
  description?: string;
}

export enum PurpleTypename {
  CollectionType = "CollectionType",
}

export interface PageInfo {
  endCursor: string;
  hasNextPage: boolean;
}

export interface PaymentAssets {
  edges: PaymentAssetsEdge[];
  pageInfo: PageInfo;
}

export interface PaymentAssetsEdge {
  node: PaymentAsset;
  cursor: string;
}

export interface Search {
  edges: SearchEdge[];
  totalCount: number;
  pageInfo: PageInfo;
}

export interface SearchEdge {
  node: FluffyNode;
  cursor: string;
}

export interface FluffyNode {
  asset: NodeAsset;
  assetBundle: null;
  __typename: string;
}

export interface NodeAsset {
  assetContract: PurpleAssetContract;
  collection: AssetCollection;
  relayId: string;
  tokenId: string;
  backgroundColor: string;
  imageUrl: string;
  name: string;
  id: string;
  isDelisted: boolean;
  animationUrl: null;
  displayImageUrl: string;
  decimals: null;
  favoritesCount: number;
  isFavorite: boolean;
  isFrozen: boolean;
  hasUnlockableContent: boolean;
  orderData: OrderData;
  assetEventData: AssetEventData;
}

export interface PurpleAssetContract {
  address: string;
  chain: string;
  id: string;
  openseaVersion: null;
}

export interface AssetEventData {
  lastSale: null;
}

export interface AssetCollection {
  isVerified: boolean;
  relayId: string;
  id: string;
  displayData: DisplayData;
  imageUrl: string;
  slug: string;
  name: string;
}

export interface DisplayData {
  cardDisplayStyle: null;
}

export interface OrderData {
  bestAsk: BestAsk;
  bestBid: BestBid;
}

export interface BestAsk {
  relayId: string;
  orderType: string;
  maker: Maker;
  closedAt: null;
  dutchAuctionFinalPrice: string;
  openedAt: string;
  priceFnEndedAt: string;
  quantity: string;
  decimals: null;
  paymentAssetQuantity: PaymentAssetQuantity;
}

export interface Maker {
  address: string;
}

export interface PaymentAssetQuantity {
  quantity: string;
  asset: PaymentAssetQuantityAsset;
  id: string;
  quantityInEth?: string;
}

export interface PaymentAssetQuantityAsset {
  decimals: number;
  imageUrl: string;
  symbol: string;
  usdSpotPrice: number;
  assetContract: FluffyAssetContract;
  id: string;
}

export interface FluffyAssetContract {
  blockExplorerLink: string;
  chain: string;
  id: string;
}

export interface BestBid {
  orderType: string;
  paymentAssetQuantity: PaymentAssetQuantity;
}

export interface SelectedCollections {
  edges: SelectedCollectionsEdge[];
}

export interface SelectedCollectionsEdge {
  node: PurpleNode;
}
