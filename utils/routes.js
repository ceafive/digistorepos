export const sidebarRoutes = [
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
        slug: "home/main"
      }
    ]
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
        slug: "sell/sell"
      },
      {
        id: 2,
        name: "Open/Close",
        path: "/sell/open-close",
        slug: "sell/open-close"
      },
      {
        id: 3,
        name: "Sales History",
        path: "/sell/sales-history",
        slug: "sell/sales-history"
      }
    ]
  }
]
