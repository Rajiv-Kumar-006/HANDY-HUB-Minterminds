import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Star, 
  Users, 
  Clock, 
  Shield,
  ArrowRight,
  Wrench,
  Home,
  Zap,
  Droplets,
  Scissors,
  ChefHat
} from 'lucide-react';

const HomePage: React.FC = () => {
  const services = [
    { id: 1, name: 'House Cleaning', icon: Home, color: 'from-blue-500 to-blue-600', price: '$50-80' },
    { id: 2, name: 'Plumbing', icon: Droplets, color: 'from-teal-500 to-teal-600', price: '$75-120' },
    { id: 3, name: 'Electrical', icon: Zap, color: 'from-yellow-500 to-orange-500', price: '$80-150' },
    { id: 4, name: 'Gardening', icon: Scissors, color: 'from-green-500 to-green-600', price: '$40-70' },
    { id: 5, name: 'Cooking', icon: ChefHat, color: 'from-red-500 to-pink-500', price: '$60-100' },
    { id: 6, name: 'Handyman', icon: Wrench, color: 'from-purple-500 to-purple-600', price: '$55-90' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Verified Professionals',
      description: 'All our service providers are background-checked and verified for your safety.'
    },
    {
      icon: Clock,
      title: 'Quick Booking',
      description: 'Book services instantly with our easy-to-use platform and flexible scheduling.'
    },
    {
      icon: Star,
      title: 'Quality Guarantee',
      description: 'We ensure top-quality service with our rating system and satisfaction guarantee.'
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Our customer support team is available around the clock to assist you.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Home Services,
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Connect with trusted local professionals for all your household needs. 
              From cleaning to repairs, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/services"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Browse Services
              </Link>
              <Link
                to="/worker/apply"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Become a Worker
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our wide range of professional home services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <Link
                  key={service.id}
                  to={`/booking/${service.id}`}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4">Professional {service.name.toLowerCase()} services</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">{service.price}</span>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose HandyHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make it easy to find and book trusted professionals for your home
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust HandyHub for their home service needs.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;