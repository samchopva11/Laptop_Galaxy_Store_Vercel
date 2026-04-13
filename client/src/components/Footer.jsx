import { MapPin, Phone, Mail, Globe, Laptop } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-white/5 bg-[#0f0c29]/80 backdrop-blur-xl relative overflow-hidden">
      {/* Visual background element */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Row 1: 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Column 1: Logo & Description */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-white/10 group-hover:border-[var(--color-neon-blue)]/50 transition-all">
                <img src="/logo.png" alt="Galaxy Store Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black neon-text uppercase tracking-tighter">
                Laptop Galaxy Store
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-[var(--color-neon-blue)]/30 pl-4 italic">
              Chuyên cung cấp Laptop gaming, Laptop Hi-End, Build PC, Linh kiện, Màn hình, Gaming Gear |
              Hàng chính hãng, giá rẻ, trả góp 0%, free ship nội thành HCM, Hà Nội.
            </p>
          </div>

          {/* Column 2: Address */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--color-neon-blue)]" />
              Địa chỉ trạm chỉ huy
            </h3>
            <p className="text-gray-300 text-sm leading-6">
              527 Phan Văn Trị, P.5, Q. Gò Vấp, Tp.HCM
            </p>

          </div>

          {/* Column 2: Contact Info */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-[var(--color-neon-purple)]" />
              Kênh liên lạc
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 group cursor-pointer">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[var(--color-neon-blue)]/10 transition-colors">
                  <Phone className="w-4 h-4 text-gray-400 group-hover:text-[var(--color-neon-blue)]" />
                </div>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Hotline: 0915213128</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[var(--color-neon-purple)]/10 transition-colors">
                  <Mail className="w-4 h-4 text-gray-400 group-hover:text-[var(--color-neon-purple)]" />
                </div>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">nguyenanhquoc077@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-blue-500/10 transition-colors">
                  <Globe className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                </div>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Facebook: Laptop Galaxy Store</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Row 2: Copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
            Laptop Galaxy Store
          </p>
          <p className="text-[10px] text-gray-500 font-medium italic text-center">
            &copy; {new Date().getFullYear()} All rights reserved. Khám phá vũ trụ công nghệ.
          </p>
          <div className="flex gap-4">
            <div className="w-2 h-2 rounded-full bg-[var(--color-neon-blue)] animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-[var(--color-neon-purple)] animate-pulse delay-75"></div>
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
