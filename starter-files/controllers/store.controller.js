const mongoose = require('mongoose');
const Store = mongoose.model('Store');
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
  }
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
  const store = await (new Store(req.body)).save();

  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // Query DB for a list of all stores.
  const stores = await Store.find();

  res.render('stores', { title: 'Stores', stores });
};

exports.editStore = async (req, res) => {
  const { id } = req.params;

  const store = await Store.findById(id);

  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  const { id } = req.params;
  // Set location data to be a point
  req.body.location.type = 'Point';

  const store = await Store.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true
  }).exec();

  req.flash('success', `Successfully updated ${store.name}. <a href="/stores/${store.slug}">View store</a>`);

  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
  const { slug } = req.params;
  const store = await Store.findOne({ slug });

  if (!store) return next();

  res.render('store', { title: store.name, store });
};

exports.getStoresByTag = async (req, res) => {
  const { tag } = req.params;
  const tagQuery = tag || { $exists: true };

  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });

  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  res.render('tag', { title: 'Tags', tags, tag, stores })
};