const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  term: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  count: {
    type: Number,
    default: 1
  },
  lastSearched: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update or create search term
searchSchema.statics.trackSearch = async function(term) {
  const searchTerm = term.toLowerCase().trim();
  
  const existing = await this.findOne({ term: searchTerm });
  
  if (existing) {
    existing.count += 1;
    existing.lastSearched = Date.now();
    await existing.save();
    return existing;
  } else {
    return await this.create({ term: searchTerm });
  }
};

// Get popular searches
searchSchema.statics.getPopular = async function(limit = 10) {
  return await this.find()
    .sort({ count: -1, lastSearched: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Search', searchSchema);