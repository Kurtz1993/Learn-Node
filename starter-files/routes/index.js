const express = require('express');
const router = express.Router();

const StoreController = require('../controllers/store.controller');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(StoreController.getStores));
router.get('/stores', catchErrors(StoreController.getStores));
router.get('/stores/:id/edit', catchErrors(StoreController.editStore));

router.get('/add', StoreController.addStore);
router.post('/add',
  StoreController.upload,
  catchErrors(StoreController.resize),
  catchErrors(StoreController.createStore)
);
router.post('/add/:id',
  StoreController.upload,
  catchErrors(StoreController.resize),
  catchErrors(StoreController.updateStore)
);

router.get('/store/:slug', catchErrors(StoreController.getStoreBySlug));

// Tags
router.get('/tags', catchErrors(StoreController.getStoresByTag));
router.get('/tags/:tag', catchErrors(StoreController.getStoresByTag));

module.exports = router;
