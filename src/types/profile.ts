export type Address = {
  city: string;
  complement: string;
  district: string;
  id: string;
  isDefault: boolean;
  label: string;
  number: string;
  postalCode: string;
  state: string;
  street: string;
};

export type ProfileState = {
  addresses: Address[];
  name: string;
  phone: string;
};
