import { api } from "./api";
import type { StoreUser } from "../types/storeAuth";
import type { OrderStatus, StoreOrder } from "../types/storeOrder";
import type {
  StoreCategory,
  StoreCategoryWithProducts,
  StoreProduct,
} from "../types/storeMenu";

type LoginStoreUserResponse = {
  storeUser: StoreUser;
  token: string;
};

export async function loginStoreUser(email: string, password: string) {
  const { data } = await api.post<LoginStoreUserResponse>(
    "store-users/login",
    { email, password },
  );

  return data;
}

type RegisterStorePayload = {
  name: string;
  slug: string;
  owner: {
    cpf: string;
    email: string;
    name: string;
    password: string;
  };
};

export async function registerStore(payload: RegisterStorePayload) {
  const { data } = await api.post("stores", payload);

  return data;
}

export async function getStoreOrders() {
  const { data } = await api.get<StoreOrder[]>("store/orders");

  return data;
}

export async function getStoreOrdersStreamTicket() {
  const { data } = await api.post<{ ticket: string }>(
    "store/orders/stream-ticket",
  );

  return data;
}

export async function updateStoreOrderStatus(id: string, status: OrderStatus) {
  // The API returns the bare updated order (no items/client relations),
  // mirroring the minimal "status_changed" realtime event — callers should
  // only rely on `status` here and patch their local copy, not replace it.
  const { data } = await api.patch<Pick<StoreOrder, "id" | "status">>(
    `store/orders/${id}/status`,
    { status },
  );

  return data;
}

type CreateCategoryPayload = {
  enabled?: boolean;
  name: string;
};

export async function createCategory(payload: CreateCategoryPayload) {
  const { data } = await api.post<StoreCategory>("store/categories", payload);

  return data;
}

export async function updateCategory(
  categoryId: string,
  payload: CreateCategoryPayload,
) {
  const { data } = await api.put<StoreCategory>(
    `store/categories/${categoryId}`,
    payload,
  );

  return data;
}

export async function reorderCategories(orderedIds: string[]) {
  await api.patch("store/categories/reorder", { orderedIds });
}

export async function reorderProducts(categoryId: string, orderedIds: string[]) {
  await api.patch(`store/categories/${categoryId}/products/reorder`, {
    orderedIds,
  });
}

type CreateProductPayload = {
  description?: string;
  enabled?: boolean;
  imageFile?: File;
  imageUrl?: string;
  name: string;
  price: number;
};

export async function createProduct(
  categoryId: string,
  { imageFile, ...payload }: CreateProductPayload,
) {
  if (imageFile) {
    const formData = new FormData();

    formData.append("name", payload.name);
    formData.append("price", String(payload.price));
    formData.append("enabled", String(payload.enabled ?? false));

    if (payload.description) {
      formData.append("description", payload.description);
    }

    formData.append("image", imageFile);

    const { data } = await api.post<StoreProduct>(
      `store/categories/${categoryId}/products`,
      formData,
    );

    return data;
  }

  const { data } = await api.post<StoreProduct>(
    `store/categories/${categoryId}/products`,
    payload,
  );

  return data;
}

export async function getStoreProducts() {
  const { data } = await api.get<StoreCategoryWithProducts[]>(
    "store/products",
  );

  return data;
}

type UpdateProductPayload = {
  description?: string;
  enabled?: boolean;
  imageFile?: File;
  imageUrl?: string;
  name: string;
  price: number;
};

export async function updateProduct(
  productId: string,
  { imageFile, ...payload }: UpdateProductPayload,
) {
  if (imageFile) {
    const formData = new FormData();

    formData.append("name", payload.name);
    formData.append("price", String(payload.price));
    formData.append("enabled", String(payload.enabled ?? false));

    if (payload.description) {
      formData.append("description", payload.description);
    }

    formData.append("image", imageFile);

    const { data } = await api.put<StoreProduct>(
      `store/products/${productId}`,
      formData,
    );

    return data;
  }

  const { data } = await api.put<StoreProduct>(
    `store/products/${productId}`,
    payload,
  );

  return data;
}
