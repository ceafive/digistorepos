import React from "react"
// components
import { useDispatch, useSelector } from "react-redux"

export default function HeaderStats() {
  const dispatch = useDispatch()
  const searchTerm = useSelector((state) => state.products.searchTerm)

  return <>{/* Header */}</>
}
