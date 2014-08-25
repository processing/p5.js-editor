function serviDB(db) {
  this.db = db;
}

//wrap basic mongo/nedb functions
serviDB.prototype.insert = function(params, cb) {
  if (typeof cb === 'function') {
    return this.db.insert(params, cb);
  } else {
    return this.db.insert(params);
  }
};

serviDB.prototype.find = function(params, cb) {
  if (typeof cb === 'function') {
    return this.db.find(params, cb);
  } else {
    return this.db.find(params);
  }
};

serviDB.prototype.findOne = function(params, cb) {
  if (typeof cb === 'function') {
    return this.db.findOne(params, cb);
  } else {
    return this.db.findOne(params);
  }
};

serviDB.prototype.count = function(params, cb) {
  return this.db.count(params, cb);
};

serviDB.prototype.update = function(params, update, options, cb) {
  return this.db.update(params, update, options, cb);
};

serviDB.prototype.remove = function(params, options, cb) {
  return this.db.remove(params, options, cb);
};

serviDB.prototype.ensureIndex = function(params, cb) {
  return this.db.ensureIndex(params, cb);
};

serviDB.prototype.removeIndex = function(params, cb) {
  return this.db.removeIndex(params, cb);
};

//convenience functions
serviDB.prototype.getOne = function(id, cb) {
  if (typeof cb === 'function') {
    this.findOne({'_id': id}, function(err, doc){
      cb(doc);
    });
  } else {
    return this.findOne({'_id': id});
  }
};

serviDB.prototype.getAll = function() {
  var cb, sort, skip, limit = null;
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i]
    if (typeof arg === 'object') sort = arg;
    if (typeof arg === 'function') cb = arg;
    if (typeof arg === 'number') {
      if (limit === null) limit = arg;
      else {
        skip = limit;
        limit = arg;
      }
    }
  }
  var cursor = this.find({});
  if (sort) {
    cursor.sort(sort);
  }
  if (skip) {
    cursor.skip(skip);
  }
  if (limit) {
    cursor.limit(limit);
  }
  if (cb) {
    cursor.exec(function(err, docs) {
      cb(docs);
    });
  } else {
    return cursor;
  }
};

serviDB.prototype.search = function(key, val, cb) {
  var params = {};
  params[key] = val;
  if (typeof cb === 'function') {
    this.find(params, function(err, docs){
      cb(docs);
    });
  } else {
    return this.find(params);
  }
};

serviDB.prototype.add = function(doc) {
  this.insert(doc);
};

serviDB.prototype.delete = function(id) {
  this.remove({'_id': id});
};

serviDB.prototype.change = function(id, fields) {
  this.update({'_id': id}, {$set: fields});
};

exports.db = serviDB;
