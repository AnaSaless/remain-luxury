import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@components/layout/Layout'
import LoadingSpinner from '@components/common/LoadingSpinner'
import ScrollToTop from '@components/common/ScrollToTop'

const Home          = lazy(() => import('@pages/Home'))
const Catalog       = lazy(() => import('@pages/Catalog'))
const ProductDetail = lazy(() => import('@pages/ProductDetail'))
const SellItem      = lazy(() => import('@pages/SellItem'))
const Profile       = lazy(() => import('@pages/Profile'))
const Cart          = lazy(() => import('@pages/Cart'))
const Login         = lazy(() => import('@pages/Login'))
const Register      = lazy(() => import('@pages/Register'))
const NotFound      = lazy(() => import('@pages/NotFound'))
const Orders        = lazy(() => import('@pages/Orders').then(m => ({ default: m.default })))
const OrderDetail   = lazy(() => import('@pages/Orders').then(m => ({ default: m.OrderDetail })))
const Messages      = lazy(() => import('@pages/Messages'))

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/"               element={<Home />} />
            <Route path="/catalogo"       element={<Catalog />} />
            <Route path="/produto/:id"    element={<ProductDetail />} />
            <Route path="/vender"         element={<SellItem />} />
            <Route path="/perfil"         element={<Profile />} />
            <Route path="/perfil/:id"    element={<Profile />} />
            <Route path="/carrinho"       element={<Cart />} />
            <Route path="/login"          element={<Login />} />
            <Route path="/cadastro"       element={<Register />} />
            <Route path="/pedidos"        element={<Orders />} />
            <Route path="/pedidos/:id"    element={<OrderDetail />} />
            <Route path="/mensagens"      element={<Messages />} />
            <Route path="*"              element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
