const express = require('express');
const router = express.Router();

const StoreController = require('../controllers/store.controller');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(StoreController.getStores));
router.get('/stores', catchErrors(StoreController.getStores));
router.get('/stores/:id/edit', catchErrors(StoreController.editStore));

router.get('/add', StoreController.addStore);
router.post('/add', catchErrors(StoreController.createStore));
router.post('/add/:id', catchErrors(StoreController.updateStore))

module.exports = router;
