export type StoreCategory = {
  createdAt: string;
  enabled: boolean;
  id: string;
  name: string;
  position: number;
  storeId: string;
  updateAt: string;
};

export type StoreProduct = {
  categoryId: string;
  createdAt: string;
  description: string | null;
  enabled: boolean;
  id: string;
  imageUrl: string | null;
  name: string;
  position: number;
  price: number;
  updateAt: string;
};

export type StoreCategoryWithProducts = StoreCategory & {
  products: StoreProduct[];
};
