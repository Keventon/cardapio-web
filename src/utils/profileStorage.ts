import type { Address, ProfileState } from "../types/profile";

export const profileStorageKey = "fast-burguer-profile";

export const emptyProfile: ProfileState = {
  addresses: [],
  name: "",
  phone: "",
};

export function normalizeAddress(address: Partial<Address>): Address {
  return {
    city: address.city ?? "",
    complement: address.complement ?? "",
    district: address.district ?? "",
    id: address.id ?? Date.now(),
    isDefault: Boolean(address.isDefault),
    label: address.label ?? "",
    number: address.number ?? "",
    postalCode: address.postalCode ?? "",
    state: address.state ?? "",
    street: address.street ?? "",
  };
}

export function getNextAddressId(addresses: Address[]) {
  return Math.max(0, ...addresses.map((address) => address.id)) + 1;
}

export function readSavedProfile(): ProfileState {
  try {
    const savedProfile = window.localStorage.getItem(profileStorageKey);

    if (!savedProfile) {
      return emptyProfile;
    }

    const parsedProfile = JSON.parse(savedProfile) as Partial<ProfileState>;

    return {
      addresses: parsedProfile.addresses?.map(normalizeAddress) ?? [],
      name: parsedProfile.name ?? "",
      phone: parsedProfile.phone ?? "",
    };
  } catch {
    return emptyProfile;
  }
}

export function writeSavedProfile(profile: ProfileState) {
  window.localStorage.setItem(profileStorageKey, JSON.stringify(profile));
}

export function addSavedAddress(address: Address) {
  const profile = readSavedProfile();
  const nextAddress = {
    ...address,
    isDefault: profile.addresses.length === 0 || address.isDefault,
  };

  writeSavedProfile({
    ...profile,
    addresses: [
      ...profile.addresses.map((currentAddress) => ({
        ...currentAddress,
        isDefault: nextAddress.isDefault ? false : currentAddress.isDefault,
      })),
      nextAddress,
    ],
  });
}
