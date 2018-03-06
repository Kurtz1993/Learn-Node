const mongoose = require('mongoose');
const slug = require('slugs');
const { Schema } = mongoose;

const storeSchema = Schema(
  {
    name: {
      type: String,
      trim: true,
      required: 'Please enter a store name.',
    },
    slug: String,
    description: {
      type: String,
      trim: true,
    },
    tags: [String],
    created: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: [
        {
          type: Number,
          required: 'You must supply coordinates.',
        },
      ],
      address: {
        type: String,
        required: 'You must supply an address.',
      },
    },
    photo: String,
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: 'You must supply an author',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Define indexes
storeSchema.index({
  name: 'text',
  description: 'text',
});

storeSchema.index({
  location: '2dsphere',
});

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) return next();

  this.slug = slug(this.name);

  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });

  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }

  next();
});

storeSchema.statics.getTagsList = function getTagsList() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

// Find reviews where the sotres _id property === reviews store property
storeSchema.virtual('reviews', {
  ref: 'Review', // What model will be linked?
  localField: '_id', // Which field on the Store mdoel?
  foreignField: 'store', // Which field in the Review model?
});

module.exports = mongoose.model('Store', storeSchema);
