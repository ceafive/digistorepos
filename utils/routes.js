const sidebarRoutes = (isBooking = false) => [
  // {
  //   id: 1,
  //   name: "Home",
  //   slug: "home",
  //   path: "/home",
  //   icon: "home",
  //   iconColor: "indigo-500",
  //   childLinks: [
  //     {
  //       id: 1,
  //       name: "Main",
  //       path: "/home/main",
  //       slug: "home/main",
  //     },
  //   ],
  // },
  {
    id: 2,
    name: isBooking ? "Book" : "Sell",
    slug: "sell",
    path: "/sell",
    icon: "shopping-bag",
    iconColor: "green-500",
    childLinks: [
      {
        id: 1,
        name: isBooking ? "Book" : "Sell",
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
        name: isBooking ? "Booking History" : "Sales History",
        path: "/sell/sales-history",
        slug: "sell/sales-history",
      },
    ],
  },
  {
    id: 3,
    name: isBooking ? "Bookings" : "Products",
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
  {
    id: 6,
    name: "Customers",
    slug: "customers",
    path: "/customers",
    icon: "user-friends",
    iconColor: "indigo-500",
    childLinks: [
      {
        id: 1,
        name: "Customers",
        path: "/customers/customers",
        slug: "customers/customers",
      },
    ],
  },
];

module.exports = {
  sidebarRoutes,
};
