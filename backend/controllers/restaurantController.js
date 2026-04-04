const Restaurant = require('../models/Restaurant');

// GET all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isOpen: true });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET single restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST seed sample restaurants
exports.seedRestaurants = async (req, res) => {
  try {
    await Restaurant.deleteMany({});

    const restaurants = [
      {
        name:         "McDonald's",
        image:        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
        cuisine:      ['Burgers', 'Fast Food', 'Beverages'],
        rating:       4.3,
        deliveryTime: 25,
        deliveryFee:  30,
        minOrder:     150,
        address:      'MG Road, Bengaluru',
        menu: [
          {
            name:        'McAloo Tikki Burger',
            description: 'Crispy potato patty burger',
            price:       89,
            isVeg:       true,
            category:    'Burgers',
          },
          {
            name:        'McChicken Burger',
            description: 'Juicy chicken burger',
            price:       149,
            isVeg:       false,
            category:    'Burgers',
          },
          {
            name:        'French Fries',
            description: 'Crispy golden fries',
            price:       129,
            isVeg:       true,
            category:    'Sides',
          },
          {
            name:        'Mcflurry',
            description: 'Creamy ice cream dessert',
            price:       99,
            isVeg:       true,
            category:    'Desserts',
          },
          {
            name:        'Coke',
            description: 'Chilled coca cola',
            price:       69,
            isVeg:       true,
            category:    'Beverages',
          },
        ],
      },
      {
        name:         'Pizza Hut',
        image:        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
        cuisine:      ['Pizza', 'Italian', 'Fast Food'],
        rating:       4.1,
        deliveryTime: 35,
        deliveryFee:  50,
        minOrder:     200,
        address:      'Koramangala, Bengaluru',
        menu: [
          {
            name:        'Margherita Pizza',
            description: 'Classic tomato and cheese',
            price:       249,
            isVeg:       true,
            category:    'Pizza',
          },
          {
            name:        'Chicken Supreme Pizza',
            description: 'Loaded with chicken toppings',
            price:       399,
            isVeg:       false,
            category:    'Pizza',
          },
          {
            name:        'Garlic Bread',
            description: 'Toasted garlic butter bread',
            price:       129,
            isVeg:       true,
            category:    'Sides',
          },
          {
            name:        'Pasta Arrabiata',
            description: 'Spicy tomato pasta',
            price:       199,
            isVeg:       true,
            category:    'Pasta',
          },
          {
            name:        'Pepsi',
            description: 'Chilled pepsi',
            price:       69,
            isVeg:       true,
            category:    'Beverages',
          },
        ],
      },
      {
        name:         'Dominos',
        image:        'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&q=80',
        cuisine:      ['Pizza', 'Pasta', 'Desserts'],
        rating:       4.2,
        deliveryTime: 30,
        deliveryFee:  40,
        minOrder:     150,
        address:      'Indiranagar, Bengaluru',
        menu: [
          {
            name:        'Farmhouse Pizza',
            description: 'Loaded veggie pizza',
            price:       299,
            isVeg:       true,
            category:    'Pizza',
          },
          {
            name:        'Chicken Dominator',
            description: 'Double chicken topping pizza',
            price:       449,
            isVeg:       false,
            category:    'Pizza',
          },
          {
            name:        'Garlic Breadsticks',
            description: 'Crispy garlic breadsticks',
            price:       149,
            isVeg:       true,
            category:    'Sides',
          },
          {
            name:        'Choco Lava Cake',
            description: 'Warm chocolate lava cake',
            price:       99,
            isVeg:       true,
            category:    'Desserts',
          },
          {
            name:        'Stuffed Garlic Bread',
            description: 'Cheese stuffed garlic bread',
            price:       179,
            isVeg:       true,
            category:    'Sides',
          },
        ],
      },
      {
        name:         'KFC',
        image:        'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80',
        cuisine:      ['Chicken', 'Burgers', 'Fast Food'],
        rating:       4.4,
        deliveryTime: 28,
        deliveryFee:  35,
        minOrder:     150,
        address:      'Brigade Road, Bengaluru',
        menu: [
          {
            name:        'Crispy Chicken',
            description: 'Classic crispy fried chicken',
            price:       199,
            isVeg:       false,
            category:    'Chicken',
          },
          {
            name:        'Zinger Burger',
            description: 'Spicy crispy chicken burger',
            price:       179,
            isVeg:       false,
            category:    'Burgers',
          },
          {
            name:        'Popcorn Chicken',
            description: 'Bite sized crispy chicken',
            price:       149,
            isVeg:       false,
            category:    'Chicken',
          },
          {
            name:        'Coleslaw',
            description: 'Creamy coleslaw salad',
            price:       69,
            isVeg:       true,
            category:    'Sides',
          },
          {
            name:        'Pepsi',
            description: 'Chilled pepsi',
            price:       69,
            isVeg:       true,
            category:    'Beverages',
          },
        ],
      },
    ];

    await Restaurant.insertMany(restaurants);
    res.json({ message: '4 restaurants added successfully!' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};