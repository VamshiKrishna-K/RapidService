const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/rapidservice';

const clearDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');
    
    // Drop the bookings collection directly
    await mongoose.connection.db.dropCollection('bookings');
    console.log('Bookings collection dropped successfully');
    
    process.exit(0);
  } catch (error) {
    if (error.code === 26) {
        console.log('Bookings collection does not exist or is already clear.');
        process.exit(0);
    }
    console.error('Error clearing DB:', error);
    process.exit(1);
  }
};

clearDB();
