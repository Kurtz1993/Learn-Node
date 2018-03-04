const express = require('express');
const router = express.Router();

const StoreController = require('../controllers/store.controller');
const UserController = require('../controllers/user.controller');
const AuthController = require('../controllers/auth.controller');
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

router.get('/login', UserController.loginForm);
router.post('/login', AuthController.login);

router.get('/register', UserController.registerForm);
router.post('/register',
  UserController.validateRegister,
  catchErrors(UserController.register),
  AuthController.login
);

router.get('/logout', AuthController.logout);

module.exports = router;
