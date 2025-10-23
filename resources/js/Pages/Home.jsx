import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Shield, Clock, MapPin, Phone, Mail, Star, Users, CheckCircle, Award, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { MedicineCard } from '../components/MedicineCard';
import { Navigation } from '../components/Navigation';
import '../../css/applanding.css';
import '../../css/app.css';
import '../../css/pharmacy.css';

export default function Home() {
  const { featuredMedicines = [] } = usePage().props;

  return (
    <>
      <Navigation />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background with Images */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-teal-100"></div>
            
            {/* Floating Images */}
            <div className="absolute top-20 right-10 w-64 h-48 rounded-3xl overflow-hidden shadow-2xl rotate-6 transform hover:rotate-3 transition-transform duration-700">
              <img 
                src="https://images.unsplash.com/photo-1576602976047-174e57a47881?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxwaGFybWFjeXxlbnwwfHx8fDE3NTk0OTUxMDR8MA&ixlib=rb-4.1.0&q=85"
                alt="Modern Pharmacy"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute bottom-32 left-10 w-56 h-40 rounded-3xl overflow-hidden shadow-2xl -rotate-6 transform hover:-rotate-3 transition-transform duration-700">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwcHJvZmVzc2lvbmFsfGVufDB8fHx8MTc1OTQ5NTA5OHww&ixlib=rb-4.1.0&q=85"
                alt="Healthcare Professional"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute top-1/2 right-32 w-48 h-36 rounded-3xl overflow-hidden shadow-2xl rotate-12 transform hover:rotate-6 transition-transform duration-700">
              <img 
                src="https://images.unsplash.com/photo-1580281657527-47f249e8f4df?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw0fHxwaGFybWFjeXxlbnwwfHx8fDE3NTk0OTUxMDR8MA&ixlib=rb-4.1.0&q=85"
                alt="Professional Pharmacist"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-40 left-1/4 w-32 h-32 bg-gradient-to-br from-teal-200 to-teal-300 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute bottom-40 right-1/4 w-24 h-24 bg-gradient-to-br from-green-200 to-green-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
            <div className="absolute top-1/3 left-1/3 w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-20 animate-pulse delay-500"></div>
          </div>
          
          {/* Content */}
          <br />
          <br />
          <div className="relative z-10 container max-w-5xl mx-auto text-center px-6 py-6">
            
            {/* <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg">
              <Award className="h-5 w-5 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">Apotek Terpercaya Sejak 2010</span>
            </div> */}
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-teal-600 via-green-600 to-teal-700 bg-clip-text text-transparent">
                Mitra Toko Obat
              </span>
              <br />
              <span className="text-gray-800">JGroup</span>
            </h1>
            
            <p className="text-2xl text-gray-600 mb-6 max-w-3xl mx-auto font-light">
              Mitra Terpercaya untuk Kesehatan Anda
            </p>
            
            <p className="text-lg text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
              Kami menyediakan obat-obatan berkualitas, vitamin, dan suplemen kesehatan 
              dengan layanan yang aman dan terpercaya. Pesan online, bayar dan ambil di apotek.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link 
                href="/katalogobat" 
                className="group bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
              >
                Lihat Katalog Obat
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="#features" 
                className="bg-white/90 backdrop-blur text-gray-800 border border-gray-200 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-teal-600 mb-2">500+</div>
                <div className="text-gray-600 text-sm">Produk Tersedia</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-teal-600 mb-2">13+</div>
                <div className="text-gray-600 text-sm">Tahun Berpengalaman</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-teal-600 mb-2">10K+</div>
                <div className="text-gray-600 text-sm">Pelanggan Puas</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-teal-600 mb-2">24/7</div>
                <div className="text-gray-600 text-sm">Layanan Konsultasi</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-teal-100 rounded-full px-4 py-2 mb-4">
                <CheckCircle className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-800">Keunggulan Kami</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Mengapa Memilih Kami?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Komitmen kami adalah memberikan pelayanan terbaik untuk kesehatan Anda dan keluarga
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-10 w-10 text-teal-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Obat Berkualitas</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Semua obat yang kami jual adalah obat resmi dan berkualitas tinggi, 
                  tanpa obat keras yang memerlukan resep dokter. Dijamin asli dan aman.
                </p>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-500 ml-1">5.0 Rating</span>
                </div>
              </div>
              
              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 md:mt-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-10 w-10 text-blue-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Pelayanan Cepat</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Proses pemesanan online yang mudah dan cepat. 
                  Pesan hari ini, siap diambil dalam 30 menit. Layanan express untuk kebutuhan mendesak.
                </p>
                <div className="mt-6 text-center">
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    <Clock className="h-3 w-3" />
                    Siap dalam 30 menit
                  </span>
                </div>
              </div>
              
              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-10 w-10 text-purple-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Lokasi Strategis</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Apotek kami terletak di lokasi yang mudah dijangkau 
                  dengan area parkir yang luas. Akses mudah dari berbagai arah transportasi.
                </p>
                <div className="mt-6 text-center">
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    <Users className="h-3 w-3" />
                    Area parkir luas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Trust Section */}
        <section className="py-20 bg-gradient-to-r from-teal-600 to-green-600">
          <div className="container">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-6">Dipercaya Ribuan Pelanggan</h2>
              <p className="text-xl opacity-90 mb-12 max-w-3xl mx-auto">
                Dengan pengalaman lebih dari 13 tahun, kami telah melayani ribuan pelanggan 
                dengan kepuasan dan kepercayaan tinggi
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">99%</div>
                  <div className="text-teal-100">Kepuasan Pelanggan</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">15+</div>
                  <div className="text-teal-100">Kategori Produk</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">30</div>
                  <div className="text-teal-100">Menit Persiapan</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">100%</div>
                  <div className="text-teal-100">Produk Original</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Medicines */}
        <section className="py-20 bg-gradient-to-br from-white to-gray-50">
          <div className="container">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-teal-100 rounded-full px-4 py-2 mb-4">
                <Star className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-800">Produk Terpopuler</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Obat Pilihan Utama
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Berikut adalah produk kesehatan yang paling sering dipesan dan dipercaya 
                oleh ribuan pelanggan kami setiap harinya
              </p>
            </div>
            
             <div className="medicine-grid">
                {featuredMedicines.map((medicine, index) => (
                  <div key={medicine.id} className="transform hover:scale-105 transition-transform duration-300">
                    <div className="relative">
                      {index < 3 && (
                        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          #{index + 1} Popular
                        </div>
                      )}
                      <MedicineCard medicine={medicine} />
                    </div>
                  </div>
                ))}
              </div>
            
            <div className="text-center">
              <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Tidak Menemukan yang Anda Cari?
                </h3>
                <p className="text-gray-600 mb-6">
                  Kami memiliki lebih dari 500 produk kesehatan berkualitas. 
                  Jelajahi katalog lengkap untuk menemukan obat yang Anda butuhkan.
                </p>
                <Link 
                  href="/katalogobat" 
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Jelajahi Katalog Lengkap
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-2 mb-4">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Lokasi & Kontak</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Kunjungi Apotek Kami
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Kami siap melayani Anda dengan fasilitas modern dan tim profesional 
                yang berpengalaman di bidang farmasi
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Contact Information */}
              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Alamat Lengkap</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Jl. Raya Kesehatan No. 123, Kelurahan Sehat, 
                        Kecamatan Obat, Jakarta Selatan 12345
                      </p>
                      <p className="text-sm text-teal-600 mt-2 font-medium">
                        Dekat dengan Rumah Sakit Pusat & Mall Kesehatan
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Phone className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Hubungi Kami</h3>
                      <p className="text-2xl font-bold text-gray-800 mb-1">+62 21 1234 5678</p>
                      <p className="text-gray-600">Konsultasi gratis dengan apoteker kami</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-sm text-green-600 font-medium">Online sekarang</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Jam Operasional</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Senin - Sabtu</span>
                          <span className="font-semibold text-gray-800">08.00 - 22.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Minggu</span>
                          <span className="font-semibold text-gray-800">08.00 - 20.00</span>
                        </div>
                        <div className="mt-3 p-3 bg-teal-50 rounded-xl">
                          <p className="text-sm text-teal-700 font-medium">
                            🕒 Layanan 24/7 untuk konsultasi online
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Mail className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Email & Media Sosial</h3>
                      <p className="text-gray-600 mb-2">info@mitratokoobat.com</p>
                      <p className="text-sm text-gray-500">Respons dalam 1-2 jam kerja</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Map */}
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Lokasi Kami</h3>
                  <p className="text-gray-600">Mudah dijangkau dari berbagai arah</p>
                </div>
                <div className="relative h-96">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.8195613!3d-6.2352575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e34b9d%3A0x5371bf0fdad786a2!2sJakarta%2C%20Indonesia!5e0!3m2!1sen!2s!4v1234567890123"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lokasi Apotek Mitra Toko Obat"
                    className="rounded-b-3xl"
                  ></iframe>
                </div>
              </div>
            </div>
            
            {/* CTA Section */}
            <div className="mt-20 text-center">
              <div className="bg-gradient-to-r from-teal-600 to-green-600 rounded-3xl p-12 shadow-2xl">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Siap Berbelanja Obat?
                </h3>
                <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
                  Mulai pesan obat sekarang juga dan rasakan kemudahan berbelanja 
                  dengan sistem pre-order kami yang aman dan terpercaya.
                </p>
                <Link 
                  to="/katalog" 
                  className="inline-flex items-center gap-3 bg-white text-teal-600 px-8 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Mulai Belanja Sekarang
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="container">
            {/* Main Footer Content */}
            <div className="py-16">
              <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
                {/* Company Info */}
                <div className="lg:col-span-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold">Mitra Toko Obat</span>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Mitra terpercaya untuk kesehatan Anda dan keluarga sejak 2010. 
                    Menyediakan obat-obatan berkualitas dengan pelayanan profesional.
                  </p>
                  <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors duration-300">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors duration-300">
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors duration-300">
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors duration-300">
                      <Youtube className="h-5 w-5" />
                    </a>
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className="text-lg font-bold mb-6">Menu Cepat</h3>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        Beranda
                      </Link>
                    </li>
                    <li>
                      <Link href="/katalogobat" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        Katalog Obat
                      </Link>
                    </li>
                    <li>
                      <section 
                        id="tentang" 
                        className="py-20 text-gray-300 hover:text-white transition-colors duration-300"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3" />
                          <h2 className="text-xl font-bold">Tentang Kami</h2>
                        </div>
                      </section>
                    </li>
                    <li>
                      <section 
                        id="kontak" 
                        className="py-20 text-gray-300 hover:text-white transition-colors duration-300"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3" />
                          <h2 className="text-xl font-bold">Kontak</h2>
                        </div>
                      </section>
                    </li>
                  </ul>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-lg font-bold mb-6">Kategori</h3>
                  <ul className="space-y-3">
                    <li>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        Obat Bebas
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        Vitamin & Suplemen
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        Alat Kesehatan
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        Perawatan Bayi
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-bold mb-6">Kontak</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-teal-400 mt-1 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">
                        Jl. Raya Kesehatan No. 123<br />
                        Jakarta Selatan 12345
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-teal-400 flex-shrink-0" />
                      <p className="text-gray-300">+62 21 1234 5678</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-teal-400 flex-shrink-0" />
                      <p className="text-gray-300">info@mitratokoobat.com</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-teal-400 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">
                        Senin - Sabtu: 08.00 - 22.00<br />
                        Minggu: 08.00 - 20.00
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-700 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-400 text-sm">
                  © 2024 Mitra Toko Obat JGroup. All rights reserved.
                </p>
                <div className="flex gap-6">
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
                    Kebijakan Privasi
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
                    Syarat & Ketentuan
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
                    Sitemap
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};