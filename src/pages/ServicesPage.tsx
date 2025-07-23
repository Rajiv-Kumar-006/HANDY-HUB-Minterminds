import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Star,
  MapPin,
  Clock,
  Home,
  Zap,
  Droplets,
  Scissors,
  ChefHat,
  Wrench,
  PaintBucket,
  Car
} from 'lucide-react';

const ServicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const categories = [
    { id: 'all', name: 'All Services', icon: Home },
    { id: 'cleaning', name: 'House Cleaning', icon: Home },
    { id: 'plumbing', name: 'Plumbing', icon: Droplets },
    { id: 'electrical', name: 'Electrical', icon: Zap },
    { id: 'gardening', name: 'Gardening', icon: Scissors },
    { id: 'cooking', name: 'Cooking', icon: ChefHat },
    { id: 'handyman', name: 'Handyman', icon: Wrench },
    { id: 'painting', name: 'Painting', icon: PaintBucket },
    { id: 'automotive', name: 'Automotive', icon: Car },
  ];
 
  const services = [
    {
      id: 1,
      title: 'Professional House Cleaning',
      category: 'cleaning',
      provider: 'Sarah Johnson',
      rating: 4.9,
      reviews: 156,
      price: 75,
      duration: '2-3 hours',
      location: 'Downtown',
      image: 'https://images.pexels.com/photos/4239037/pexels-photo-4239037.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Complete home cleaning service including dusting, vacuuming, and sanitizing.'
    },
    {
      id: 2,
      title: 'Emergency Plumbing Repair',
      category: 'plumbing',
      provider: 'Mike Wilson',
      rating: 4.8,
      reviews: 203,
      price: 120,
      duration: '1-2 hours',
      location: 'Midtown',
      image: 'https://images.pexels.com/photos/8553854/pexels-photo-8553854.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Fast and reliable plumbing repairs for leaks, clogs, and installations.'
    },
    {
      id: 3,
      title: 'Electrical Installation & Repair',
      category: 'electrical',
      provider: 'Alex Rodriguez',
      rating: 4.7,
      reviews: 89,
      price: 95,
      duration: '1-3 hours',
      location: 'Uptown',
      image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Licensed electrician for all your electrical needs and safety inspections.'
    },
    {
      id: 4,
      title: 'Garden Maintenance & Landscaping',
      category: 'gardening',
      provider: 'Emma Green',
      rating: 4.9,
      reviews: 134,
      price: 60,
      duration: '2-4 hours',
      location: 'Suburbs',
      image: 'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Professional gardening services including lawn care and plant maintenance.'
    },
    {
      id: 5,
      title: 'Personal Chef Services',
      category: 'cooking',
      provider: 'Chef David Martinez',
      rating: 4.8,
      reviews: 78,
      price: 150,
      duration: '3-4 hours',
      location: 'Downtown',
      image: 'https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Gourmet meal preparation and cooking services for special occasions.'
    },
    {
      id: 6,
      title: 'General Handyman Services',
      category: 'handyman',
      provider: 'Tom Builder',
      rating: 4.6,
      reviews: 167,
      price: 80,
      duration: '2-3 hours',
      location: 'Citywide',
      image: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Fix-it services, furniture assembly, and general home repairs.'
    }
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesPrice = priceRange === 'all' ||
      (priceRange === 'low' && service.price < 75) ||
      (priceRange === 'medium' && service.price >= 75 && service.price <= 120) ||
      (priceRange === 'high' && service.price > 120);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'reviews':
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Service
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse our wide selection of professional home services
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Price Filter */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Prices</option>
              <option value="low">Under $75</option>
              <option value="medium">$75 - $120</option>
              <option value="high">Over $120</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedServices.map(service => (
            <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {categories.find(c => c.id === service.category)?.name}
                  </span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {service.rating} ({service.reviews})
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{service.description}</p>

                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="mr-4">{service.location}</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{service.duration}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${service.price}</span>
                    <span className="text-gray-500 text-sm ml-1">/ service</span>
                  </div>
                  <Link
                    to={`/booking/${service.id}`}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 font-medium"
                  >
                    Book Now
                  </Link>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">by {service.provider}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedServices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No services found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;