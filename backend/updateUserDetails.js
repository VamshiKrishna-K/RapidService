require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updateUserDetails = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const users = await User.find({});
    console.log(`Found ${users.length} users. Updating details...`);

    const locations = [
      { address: 'Banjara Hills, Hyderabad', lat: 17.4156, lng: 78.4482 },
      { address: 'Madhapur, Hyderabad', lat: 17.4483, lng: 78.3908 },
      { address: 'Kukatpally, Hyderabad', lat: 17.4933, lng: 78.4011 },
      { address: 'Jubilee Hills, Hyderabad', lat: 17.4326, lng: 78.4071 }
    ];

    let i = 0;
    for (let user of users) {
      const loc = locations[i % locations.length];
      
      // Update phone if empty
      if (!user.phone) {
        user.phone = `91000${10000 + i}`;
      }
      
      // Update address and coordinates if empty
      if (!user.address || !user.location || !user.location.coordinates.length) {
        user.address = loc.address;
        user.location = {
          type: 'Point',
          coordinates: [loc.lng, loc.lat]
        };
      }
      
      await user.save();
      i++;
    }

    console.log('All user phone numbers and locations have been updated successfully.');
    process.exit();
  } catch (error) {
    console.error('Update error:', error);
    process.exit(1);
  }
};

updateUserDetails();
