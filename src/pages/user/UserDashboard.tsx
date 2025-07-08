import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Search,
  Filter,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingBookings = [
    {
      id: 1,
      service: 'House Cleaning',
      provider: 'Sarah Johnson',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'confirmed',
      price: 75,
      image: 'https://images.pexels.com/photos/4239037/pexels-photo-4239037.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 2,
      service: 'Plumbing Repair',
      provider: 'Mike Wilson',
      date: '2024-01-18',
      time: '2:00 PM',
      status: 'pending',
      price: 120,
      image: 'https://images.pexels.com/photos/8553854/pexels-photo-8553854.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  const pastBookings = [
    {
      id: 3,
      service: 'Garden Maintenance',
      provider: 'Emma Green',
      date: '2024-01-05',
      time: '9:00 AM',
      status: 'completed',
      price: 60,
      rating: 5,
      image: 'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 4,
      service: 'Electrical Work',
      provider: 'Alex Rodriguez',
      date: '2023-12-28',
      time: '3:00 PM',
      status: 'completed',
      price: 95,
      rating: 4,
      image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your bookings and account</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">22</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/services"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Book New Service</h3>
                <p className="text-sm text-gray-600">Find and book services</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </Link>

            <Link
              to="/profile"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200">
                <Filter className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Update Profile</h3>
                <p className="text-sm text-gray-600">Manage your information</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </Link>

            <Link
              to="/help"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200">
                <AlertCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Get Help</h3>
                <p className="text-sm text-gray-600">Support & FAQ</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </Link>
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Bookings</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'past'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Past Bookings
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'upcoming' ? (
              <div className="space-y-4">
                {upcomingBookings.map(booking => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={booking.image}
                          alt={booking.service}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{booking.service}</h3>
                          <p className="text-sm text-gray-600">by {booking.provider}</p>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span className="mr-4">{booking.date}</span>
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{booking.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">{booking.status}</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 mt-2">${booking.price}</p>
                        <div className="flex space-x-2 mt-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View Details
                          </button>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {pastBookings.map(booking => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={booking.image}
                          alt={booking.service}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{booking.service}</h3>
                          <p className="text-sm text-gray-600">by {booking.provider}</p>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span className="mr-4">{booking.date}</span>
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{booking.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">{booking.status}</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 mt-2">${booking.price}</p>
                        <div className="flex items-center mt-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{booking.rating}/5</span>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Book Again
                          </button>
                          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;