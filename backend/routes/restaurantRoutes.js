const express = require('express');
const router  = express.Router();
const {
  getAllRestaurants,
  getRestaurantById,
  seedRestaurants
} = require('../controllers/restaurantController');

router.post('/seed',    seedRestaurants);
router.get('/',         getAllRestaurants);
router.get('/:id',      getRestaurantById);

module.exports = router;