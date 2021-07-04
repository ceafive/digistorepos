import axios from "axios"
import Cart from "components/Cart/Cart"
import Modal from "components/Modal"
import ProductDetails from "components/Product/InventoryDetails"
import ProductsSelection from "components/ProductsSelection"
import { productsAdded } from "features/products/productsSlice"
// layout for page
import Admin from "layouts/Admin.js"
import React from "react"
import { useDispatch } from "react-redux"

export default function Dashboard() {
  const dispatch = useDispatch()

  React.useEffect(() => {
    const fetchProducts = async () => {
      const res = await axios.get("https://jsonplaceholder.typicode.com/photos")
      const data = await res.data
      dispatch(productsAdded(data.slice(0, 100)))
    }

    fetchProducts()
  }, [dispatch])

  return (
    <>
      <div className="flex min-h-screen">
        <Modal>
          <ProductDetails />
        </Modal>
        <div className="w-full xl:w-8/12 pb-6 pt-12 px-4">
          <ProductsSelection />
        </div>
        <div className="w-full xl:w-4/12 pb-6 pt-6 px-4">
          <Cart />
        </div>
      </div>
    </>
  )
}

Dashboard.layout = Admin
