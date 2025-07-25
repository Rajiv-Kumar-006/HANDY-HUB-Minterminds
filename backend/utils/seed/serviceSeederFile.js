const Service = require("../../models/Service");

require('dotenv').config()

const services = [
  {
    name: "House Cleaning",
    title: "Professional House Cleaning",
    description:
      "Complete home cleaning service including dusting, vacuuming, and sanitizing.",
    category: "cleaning",
    provider: "Sarah Johnson",
    basePrice: {
      min: 70,
      max: 100,
    },
    duration: {
      min: 2,
      max: 3,
    },
    location: "Downtown",
    image:
      "https://images.pexels.com/photos/4239037/pexels-photo-4239037.jpeg?auto=compress&cs=tinysrgb&w=300",
    icon: "home",
    requirements: [
      "Access to all rooms",
      "No pets in the house during cleaning",
    ],
    includes: ["Vacuuming", "Mopping", "Bathroom sanitization"],
    isActive: true,
    popularity: 90,
    averageRating: 4.9,
    totalReviews: 156,
  },
  {
    name: "Plumbing Repair",
    title: "Emergency Plumbing Repair",
    description:
      "Fast and reliable plumbing repairs for leaks, clogs, and installations.",
    category: "plumbing",
    provider: "Mike Wilson",
    basePrice: {
      min: 100,
      max: 130,
    },
    duration: {
      min: 1,
      max: 2,
    },
    location: "Midtown",
    image:
      "https://images.pexels.com/photos/8553854/pexels-photo-8553854.jpeg?auto=compress&cs=tinysrgb&w=300",
    icon: "droplets",
    requirements: ["Shut off water supply"],
    includes: ["Leak repair", "Clog removal", "Pipe installation"],
    isActive: true,
    popularity: 85,
    averageRating: 4.8,
    totalReviews: 203,
  },
  {
    name: "Electrical Work",
    title: "Electrical Installation & Repair",
    description:
      "Licensed electrician for all your electrical needs and safety inspections.",
    category: "electrical",
    provider: "Alex Rodriguez",
    basePrice: {
      min: 90,
      max: 110,
    },
    duration: {
      min: 1,
      max: 3,
    },
    location: "Uptown",
    image:
      "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=300",
    icon: "zap",
    requirements: ["Turn off power supply to the work area"],
    includes: ["Wiring", "Switch replacement", "Electrical panel check"],
    isActive: true,
    popularity: 80,
    averageRating: 4.7,
    totalReviews: 89,
  },
  {
    name: "Gardening Services",
    title: "Garden Maintenance & Landscaping",
    description:
      "Professional gardening services including lawn care and plant maintenance.",
    category: "gardening",
    provider: "Emma Green",
    basePrice: {
      min: 50,
      max: 70,
    },
    duration: {
      min: 2,
      max: 4,
    },
    location: "Suburbs",
    image:
      "https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=300",
    icon: "scissors",
    requirements: ["Access to outdoor water supply"],
    includes: ["Lawn mowing", "Weeding", "Pruning"],
    isActive: true,
    popularity: 92,
    averageRating: 4.9,
    totalReviews: 134,
  },
  {
    name: "Chef Service",
    title: "Personal Chef Services",
    description:
      "Gourmet meal preparation and cooking services for special occasions.",
    category: "cooking",
    provider: "Chef David Martinez",
    basePrice: {
      min: 140,
      max: 160,
    },
    duration: {
      min: 3,
      max: 4,
    },
    location: "Downtown",
    image:
      "https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg?auto=compress&cs=tinysrgb&w=300",
    icon: "chef-hat",
    requirements: ["Clean kitchen", "Access to basic utensils"],
    includes: ["Menu planning", "Cooking", "Cleaning after meal"],
    isActive: true,
    popularity: 78,
    averageRating: 4.8,
    totalReviews: 78,
  },
  {
    name: "Handyman",
    title: "General Handyman Services",
    description:
      "Fix-it services, furniture assembly, and general home repairs.",
    category: "handyman",
    provider: "Tom Builder",
    basePrice: {
      min: 70,
      max: 90,
    },
    duration: {
      min: 2,
      max: 3,
    },
    location: "Citywide",
    image:
      "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=300",
    icon: "wrench",
    requirements: ["Access to the area needing repair"],
    includes: ["Wall fixing", "Furniture assembly", "TV mounting"],
    isActive: true,
    popularity: 88,
    averageRating: 4.6,
    totalReviews: 167,
  },
];

const seedServices = async () => {
  try {
    const count = await Service.countDocuments();
    if (count === 0) {
      await Service.insertMany(services);
      console.log("✅ Services seeded successfully");
    } else {
      console.log("ℹ️ Services already exist. Skipping seeding.");
    }
  } catch (err) {
    console.error("❌ Failed to seed services:", err);
  }
};

module.exports = seedServices;
