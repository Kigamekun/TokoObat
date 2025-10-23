import { useState } from 'react';
import { Link } from "@inertiajs/react";
import { ShoppingCart, Menu, X, Pill } from 'lucide-react';
import { mockCart } from '../data/mock';
import { usePage } from '@inertiajs/react';

export const Navigation = () => {
  const { url } = usePage();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(
    mockCart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const isActive = (path) => url.startsWith(path);

  const handleScroll = (e, id) => {
    e.preventDefault();
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  return (
    <nav className="nav-header">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <Pill className="h-8 w-8 text-teal-600" />
          <span className="hidden sm:inline">Mitra Toko Obat</span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6">
        <Link
          href="/"
          className={`nav-link ${
            isActive('/') ? 'text-teal-600 font-semibold' : ''
          }`}
        >
          Beranda
        </Link>
        <Link
          href="/katalogobat"
          className={`nav-link ${
            isActive('/katalog') ? 'text-teal-600 font-semibold' : ''
          }`}
        >
          Katalog Obat
        </Link>
        <Link href="/beranda#tentang" className="nav-link">
          Tentang Kami
        </Link>

        <Link href="/beranda#kontak" className="nav-link">
          Kontak
        </Link>


      </div>

      {/* Cart and Mobile Menu */}
      <div className="flex items-center gap-4">
        <Link
          href="/cart"
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ShoppingCart className="h-6 w-6 text-gray-600" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden">
          <div className="flex flex-col p-4 gap-2">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className={`nav-link text-left ${
                isActive('/') ? 'text-teal-600 font-semibold' : ''
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/katalogobat"
              onClick={() => setIsMenuOpen(false)}
              className={`nav-link text-left ${
                isActive('/katalog') ? 'text-teal-600 font-semibold' : ''
              }`}
            >
              Katalog Obat
            </Link>
            <Link href="/beranda#tentang" className="nav-link">
              Tentang Kami
            </Link>

            <Link href="/beranda#kontak" className="nav-link">
              Kontak
            </Link>
          </div>
        </div>
      )}
    </nav>
  );




};
