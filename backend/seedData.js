require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Service = require('./models/Service');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing data (CAUTION: Removes all users and services)
    await User.deleteMany({ role: 'provider' });
    await Service.deleteMany({});
    console.log('Cleared existing providers and services...');

    const providers = [
      {
        name: 'Anita Sharma',
        email: 'anita@example.com',
        password: 'password123',
        role: 'provider',
        phone: '9876543210',
        address: 'Banjara Hills, Hyderabad',
        location: { type: 'Point', coordinates: [78.4482, 17.4156] }, // [Long, Lat]
        serviceRadius: 10
      },
      {
        name: 'Rahul Kumar',
        email: 'rahul@example.com',
        password: 'password123',
        role: 'provider',
        phone: '9988776655',
        address: 'Madhapur, Hyderabad',
        location: { type: 'Point', coordinates: [78.3908, 17.4483] },
        serviceRadius: 8
      },
      {
        name: 'Suresh Varma',
        email: 'suresh@example.com',
        password: 'password123',
        role: 'provider',
        phone: '8877665544',
        address: 'Kukatpally, Hyderabad',
        location: { type: 'Point', coordinates: [78.4011, 17.4933] },
        serviceRadius: 15
      }
    ];

    const createdProviders = await User.create(providers);
    console.log(`${createdProviders.length} providers created.`);

    const services = [
      {
        provider: createdProviders[0]._id,
        category: 'Cleaning',
        title: 'Full Home Deep Cleaning',
        description: 'Professional cleaning for all rooms including kitchen and bathrooms.',
        basePrice: 2500,
        priceUnit: 'fixed'
      },
      {
        provider: createdProviders[0]._id,
        category: 'Cleaning',
        title: 'Sofa & Carpet Shampooing',
        description: 'Deep extraction cleaning for your upholstery.',
        basePrice: 800,
        priceUnit: 'fixed'
      },
      {
        provider: createdProviders[1]._id,
        category: 'Electrician',
        title: 'Fan & Light Installation',
        description: 'Expert installation of all electrical fixtures.',
        basePrice: 300,
        priceUnit: 'hourly'
      },
      {
        provider: createdProviders[1]._id,
        category: 'Repair',
        title: 'AC Servicing & Repair',
        description: 'Fast and reliable AC maintenance.',
        basePrice: 1500,
        priceUnit: 'fixed'
      },
      {
        provider: createdProviders[2]._id,
        category: 'Plumbing',
        title: 'Full Clog Removal',
        description: 'Clearing blocked drains and pipes efficiently.',
        basePrice: 600,
        priceUnit: 'fixed'
      }
    ];

    await Service.create(services);
    console.log(`${services.length} services created.`);

    console.log('Database seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
