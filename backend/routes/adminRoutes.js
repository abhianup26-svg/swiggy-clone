const express    = require('express');
const router     = express.Router();
const protect    = require('../middleware/authMiddleware');
const adminOnly  = require('../middleware/adminMiddleware');
const {
  getStats,
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  addRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/adminController');

// All routes protected — must be logged in AND be admin
router.use(protect);
router.use(adminOnly);

router.get('/stats',                  getStats);
router.get('/users',                  getAllUsers);
router.get('/orders',                 getAllOrders);
router.put('/orders/:id/status',      updateOrderStatus);
router.post('/restaurants',           addRestaurant);
router.put('/restaurants/:id',        updateRestaurant);
router.delete('/restaurants/:id',     deleteRestaurant);

module.exports = router;