import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';
import FeaturesStrip from './components/FeaturesStrip';
import About from './components/About';
import Products from './components/Products';
import Process from './components/Process';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import OrderForm from './components/OrderForm';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminLayout from './pages/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import Orders from './pages/Admin/Orders';
import Messages from './pages/Admin/Messages';

function MainSite() {
  return (
    <>
      <Navbar />
      <HeroSlider />
      <FeaturesStrip />
      <About />
      <Products />
      <Process />
      <Gallery />
      <Testimonials />
      <OrderForm />
      <Footer />
      <ChatWidget />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainSite />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="messages" element={<Messages />} />
      </Route>
    </Routes>
  );
}

export default App;
