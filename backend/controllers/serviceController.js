const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Get all services (with search, filter, and recommendation engine)
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, lat, lng } = req.query;

    let query = {};
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }
    query.isActive = true;

    let services = await Service.find(query).populate('provider', 'name rating location');

    // Recommendation Engine Scoring
    // Score = (w1 * NormalizedRating) + (w2 * NormalizedDistanceInverse) + (w3 * NormalizedPriceInverse)
    const w1 = 0.5, w2 = 0.3, w3 = 0.2;
    
    // Convert logic if lat/lng are provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      services = services.map(service => {
        let distance = 50; // max default distance if no location
        if (service.provider && service.provider.location && service.provider.location.coordinates) {
          const [pLng, pLat] = service.provider.location.coordinates;
          distance = getDistanceFromLatLonInKm(userLat, userLng, pLat, pLng);
        }

        const rating = service.provider?.rating || 0;
        const normalizedRating = rating / 5;
        const normalizedDistanceInverse = Math.max(0, (50 - distance) / 50); // Assumes 50km max radius
        const normalizedPriceInverse = Math.max(0, (1000 - service.basePrice) / 1000); // Inverse price assumption

        const score = (w1 * normalizedRating) + (w2 * normalizedDistanceInverse) + (w3 * normalizedPriceInverse);

        return { ...service._doc, distance, score };
      });

      // Sort by recommendation score (highest first)
      services.sort((a, b) => b.score - a.score);
    }

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Provider
exports.createService = async (req, res) => {
  try {
    req.body.provider = req.user._id;

    const service = await Service.create(req.body);

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Provider
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized to delete this service' });
    }

    await service.deleteOne();

    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Haversine formula for distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
