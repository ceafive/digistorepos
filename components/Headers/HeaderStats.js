import React from "react";

// components

import CardStats from "components/Cards/CardStats.js";
import { useDispatch, useSelector } from "react-redux";
import { currentSearchTerm } from "features/products/productsSlice";
import SearchResults from "components/SearchResults";

export default function HeaderStats() {
  const dispatch = useDispatch();
  const searchTerm = useSelector((state) => state.products.searchTerm);

  return <>{/* Header */}</>;
}
