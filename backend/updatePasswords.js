require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updatePasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const users = await User.find({});
    console.log(`Found ${users.length} users. Updating passwords...`);

    for (let user of users) {
      user.password = 'password123';
      await user.save();
    }

    console.log('All passwords have been updated to "password123" and hashed successfully.');
    process.exit();
  } catch (error) {
    console.error('Update error:', error);
    process.exit(1);
  }
};

updatePasswords();
