import { Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Home from '../pages/Home'
import Rank from '../pages/Rank'
import Search from '../pages/Search'
import Category from '../pages/Category'
import History from '../pages/History'
import Watch from '../pages/Watch'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/rank" element={<Rank />} />
        <Route path="/search" element={<Search />} />
        <Route path="/category" element={<Category />} />
        <Route path="/history" element={<History />} />
      </Route>
      <Route path="/watch/:id" element={<Watch />} />
    </Routes>
  )
}
