const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://localhost:27017/rapidservice';

const checkDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');
    
    const userCount = await User.countDocuments();
    const subCounts = await User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    
    console.log('Total Users:', userCount);
    console.log('Role Distribution:', JSON.stringify(subCounts, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking DB:', error);
    process.exit(1);
  }
};

checkDB();
