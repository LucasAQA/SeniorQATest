export const API_URL = "https://serverest.dev";
export const FRONT_URL = "https://front.serverest.dev";
export const urls = {
  ui: {
    login: "/login",
    clientHome: "/home",
    adminHome: "/admin/home",
  },
  apiIntercepts: {
    login: "**/login",
    products: "**/produtos",
    productById: (id) => `**/produtos/${id}`,
    carts: "**/carrinhos",
  },
};
