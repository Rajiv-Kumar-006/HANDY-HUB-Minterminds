import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Star, 
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  TrendingUp
} from 'lucide-react';

const WorkerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Total Earnings', value: '$2,450', change: '+12%', icon: DollarSign, color: 'green' },
    { label: 'Completed Jobs', value: '156', change: '+8%', icon: CheckCircle, color: 'blue' },
    { label: 'Average Rating', value: '4.9', change: '+0.1', icon: Star, color: 'yellow' },
    { label: 'Response Rate', value: '98%', change: '+2%', icon: MessageSquare, color: 'purple' }
  ];

  const recentBookings = [
    {
      id: 1,
      service: 'House Cleaning',
      customer: 'Jane Smith',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'confirmed',
      price: 75,
      location: 'Downtown'
    },
    {
      id: 2,
      service: 'Deep Cleaning',
      customer: 'Robert Johnson',
      date: '2024-01-16',
      time: '2:00 PM',
      status: 'pending',
      price: 120,
      location: 'Midtown'
    },
    {
      id: 3,
      service: 'Office Cleaning',
      customer: 'Sarah Wilson',
      date: '2024-01-18',
      time: '9:00 AM',
      status: 'confirmed',
      price: 200,
      location: 'Business District'
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Worker Dashboard</h1>
          <p className="text-gray-600">Manage your services and bookings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            const colorClasses = {
              green: 'bg-green-100 text-green-600',
              blue: 'bg-blue-100 text-blue-600',
              yellow: 'bg-yellow-100 text-yellow-600',
              purple: 'bg-purple-100 text-purple-600'
            };
            
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-4">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'bookings', label: 'Bookings' },
              { id: 'schedule', label: 'Schedule' },
              { id: 'earnings', label: 'Earnings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
                  <div className="space-y-4">
                    {recentBookings.map(booking => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{booking.service}</h3>
                              <p className="text-sm text-gray-600">{booking.customer}</p>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span className="mr-4">{booking.date}</span>
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{booking.location}</span>
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
                                <Eye className="w-4 h-4 inline mr-1" />
                                View
                              </button>
                              {booking.status === 'pending' && (
                                <>
                                  <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                                    Accept
                                  </button>
                                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                                    Decline
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Performance Overview</h2>
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>+15% this month</span>
                    </div>
                  </div>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Performance chart would go here</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">All Bookings</h2>
                <div className="space-y-4">
                  {recentBookings.map(booking => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{booking.service}</h3>
                          <p className="text-sm text-gray-600">{booking.customer}</p>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span className="mr-4">{booking.date} at {booking.time}</span>
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{booking.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">{booking.status}</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900 mt-2">${booking.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">My Schedule</h2>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Calendar component would go here</p>
                </div>
              </div>
            )}

            {activeTab === 'earnings' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Earnings Report</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600 font-medium">This Week</p>
                      <p className="text-2xl font-bold text-green-900">$485</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600 font-medium">This Month</p>
                      <p className="text-2xl font-bold text-blue-900">$2,450</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-purple-600 font-medium">Total</p>
                      <p className="text-2xl font-bold text-purple-900">$12,340</p>
                    </div>
                  </div>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Earnings chart would go here</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 font-medium">
                  Update Availability
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium">
                  Edit Services
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium">
                  View Profile
                </button>
              </div>
            </div>

            {/* Availability Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Availability</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                    Available
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Next Booking</span>
                  <span className="text-sm font-medium text-gray-900">Jan 15, 10:00 AM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Free Slots Today</span>
                  <span className="text-sm font-medium text-gray-900">3 slots</span>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-400 pl-4">
                  <div className="flex items-center mb-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900 ml-1">5.0</span>
                  </div>
                  <p className="text-sm text-gray-600">"Excellent service! Very professional and thorough."</p>
                  <p className="text-xs text-gray-500 mt-1">- Jane Smith</p>
                </div>
                <div className="border-l-4 border-yellow-400 pl-4">
                  <div className="flex items-center mb-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900 ml-1">4.8</span>
                  </div>
                  <p className="text-sm text-gray-600">"Great work and on time. Highly recommended!"</p>
                  <p className="text-xs text-gray-500 mt-1">- Robert Johnson</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;