const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a service category'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a service title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Please add a base price'],
    },
    priceUnit: {
      type: String,
      enum: ['hourly', 'fixed'],
      default: 'fixed',
    },
    images: {
      type: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for text search
serviceSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
