const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');

    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: "That file isn't allowed!" }, false);
    }
  },
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

// Upload handlers
exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there's no new file to resize
  if (!req.file) return next();

  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;

  // Resize photo
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);

  next();
};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await new Store(req.body).save();

  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 4;
  const skip = limit * (page - 1);

  // Query DB for a list of all stores.
  const storesPromise = Store.find()
    .skip(skip)
    .limit(limit)
    .sort({ created: -1 });
  const countPromise = Store.count();

  const [stores, count] = await Promise.all([storesPromise, countPromise]);

  const pages = Math.ceil(count / limit);

  if (!stores.length && skip) {
    req.flash(
      'info',
      `Hey! You asked for page ${page}. But that doesn't exist. So i put you on page ${pages}.`
    );

    return res.redirect(`/stores/page/${pages}`);
  }

  res.render('stores', { title: 'Stores', stores, count, page, pages });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it!');
  }
};

exports.editStore = async (req, res) => {
  const { id } = req.params;

  const store = await Store.findById(id);

  confirmOwner(store, req.user);

  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  const { id } = req.params;
  // Set location data to be a point
  req.body.location.type = 'Point';

  const store = await Store.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  }).exec();

  req.flash(
    'success',
    `Successfully updated ${store.name}. <a href="/stores/${store.slug}">View store</a>`
  );

  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
  const { slug } = req.params;
  const store = await Store.findOne({ slug }).populate('author reviews');

  if (!store) return next();

  res.render('store', { title: store.name, store });
};

exports.getStoresByTag = async (req, res) => {
  const { tag } = req.params;
  const tagQuery = tag || { $exists: true };

  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });

  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  res.render('tag', { title: 'Tags', tags, tag, stores });
};

exports.searchStores = async (req, res) => {
  // This will search in every field marked as a text index.
  const stores = await Store.find(
    {
      $text: {
        $search: req.query.q,
      },
    },
    {
      // Project a score based on the metadata stored in the index.
      score: { $meta: 'textScore' },
    }
  )
    .sort({
      score: { $meta: 'textScore' },
    })
    .limit(5);

  res.json(stores);
};

exports.mapStores = async (req, res) => {
  const { lng, lat } = req.query;
  const coordinates = [lng, lat].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: 10000, // 1 = 1m
      },
    },
  };

  const stores = await Store.find(q)
    .select('slug name description location photo')
    .limit(10);

  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map ' });
};

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { [operator]: { hearts: req.params.id } },
    { new: true }
  );

  res.json(user);
};

exports.hearts = async (req, res) => {
  const stores = await Store.find({
    _id: { $in: req.user.hearts },
  });

  res.render('stores', { title: 'Hearts', stores });
};

exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopStores();

  res.render('topStores', { title: '★ Top Stores!', stores });
};
