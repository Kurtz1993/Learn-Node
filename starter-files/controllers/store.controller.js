const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
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

  const store = await Store.findOneAndUpdate({ _id: id }, req.body, {
    new: true, runValidators: true
  }).exec();

  req.flash('success', `Successfully updated ${store.name}. <a href="/stores/${store.slug}">View store</a>`);

  res.redirect(`/stores/${store._id}/edit`);
};