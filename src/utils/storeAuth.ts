export const storeCredentials = {
  login: "loja@fastburguer.com",
  name: "Fast Burguer",
  password: "fastburguer123",
};

const storeSessionKey = "fast-burguer-store-session";

export function validateStoreCredentials(login: string, password: string) {
  return (
    login.trim().toLowerCase() === storeCredentials.login &&
    password === storeCredentials.password
  );
}

export function readStoreSession() {
  return window.localStorage.getItem(storeSessionKey) === "active";
}

export function writeStoreSession() {
  window.localStorage.setItem(storeSessionKey, "active");
}

export function clearStoreSession() {
  window.localStorage.removeItem(storeSessionKey);
}
