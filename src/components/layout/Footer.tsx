import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                HandyHub
              </span>
            </Link>
            <p className="text-gray-400 text-sm">
              Your trusted platform for connecting with reliable household service professionals.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/services?category=cleaning" className="text-gray-400 hover:text-white transition-colors duration-200">House Cleaning</Link></li>
              <li><Link to="/services?category=plumbing" className="text-gray-400 hover:text-white transition-colors duration-200">Plumbing</Link></li>
              <li><Link to="/services?category=electrical" className="text-gray-400 hover:text-white transition-colors duration-200">Electrical</Link></li>
              <li><Link to="/services?category=cooking" className="text-gray-400 hover:text-white transition-colors duration-200">Cooking</Link></li>
              <li><Link to="/services?category=gardening" className="text-gray-400 hover:text-white transition-colors duration-200">Gardening</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200">About Us</Link></li>
              <li><Link to="/worker/apply" className="text-gray-400 hover:text-white transition-colors duration-200">Become a Worker</Link></li>
              <li><Link to="/help" className="text-gray-400 hover:text-white transition-colors duration-200">Help Center</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span>support@handyhub.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>New York, NY</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 HandyHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;