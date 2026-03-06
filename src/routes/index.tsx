import { Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Home from '../pages/Home'
import Rank from '../pages/Rank'
import Search from '../pages/Search'
import Category from '../pages/Category'
import Watch from '../pages/Watch'
import Login from '../pages/Login'
import Admin from '../pages/Admin'
import Profile from '../pages/Profile'
import MyList from '../pages/MyList'
import History from '../pages/History'
import TopUp from '../pages/TopUp'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/rank" element={<Rank />} />
        <Route path="/search" element={<Search />} />
        <Route path="/category" element={<Category />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mylist" element={<MyList />} />
        <Route path="/history" element={<History />} />
        <Route path="/topup" element={<TopUp />} />
      </Route>
      <Route path="/admin" element={<Admin />} />
      <Route path="/watch/:id" element={<Watch />} />
    </Routes>
  )
}
