const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/store.controller');

// Do work here
router.get('/', StoreController.homePage);
router.get('/add', StoreController.addStore);
router.post('/add', StoreController.createStore);

module.exports = router;
