const sidebarRoutes = [
  {
    id: 1,
    name: "Home",
    slug: "home",
    path: "/home",
    icon: "home",
    iconColor: "indigo-500",
    childLinks: [
      {
        id: 1,
        name: "Main",
        path: "/home/main",
        slug: "home/main",
      },
    ],
  },
  {
    id: 2,
    name: "Sell",
    slug: "sell",
    path: "/sell",
    icon: "shopping-bag",
    iconColor: "green-500",
    childLinks: [
      {
        id: 1,
        name: "Sell",
        path: "/sell/sell",
        slug: "sell/sell",
      },
      // {
      //   id: 2,
      //   name: "Open/Close",
      //   path: "/sell/open-close",
      //   slug: "sell/open-close",
      // },
      {
        id: 3,
        name: "Sales History",
        path: "/sell/sales-history",
        slug: "sell/sales-history",
      },
    ],
  },
  {
    id: 3,
    name: "Products",
    slug: "products",
    path: "/products",
    icon: "tags",
    iconColor: "orange-500",
    childLinks: [
      {
        id: 1,
        name: "Create",
        path: "/products/create",
        slug: "products/create",
      },
      {
        id: 2,
        name: "Manage",
        path: "/products/manage",
        slug: "products/manage",
      },
    ],
  },
];

module.exports = {
  sidebarRoutes,
};
