var Promise = require('bluebird');
var Joi = require('joi');
var _ = require('lodash');
var override = require('./override');

function Config(schema, config) {
  config = config || {};
  this.schema = schema || Joi.object({}).default();
  this.reset(config);
}

Config.prototype.extendSchema = function (key, schema) {
  var additionalSchema = {};
  if (!this.has(key)) {
    additionalSchema[key] = schema;
    this.schema = this.schema.keys(additionalSchema);
    this.reset(this.config);
  }
};

Config.prototype.reset = function (obj) {
  var results = Joi.validate(obj, this.schema);
  if (results.error) {
    throw results.error;
  }
  this.config = results.value;
};

Config.prototype.set = function (key, value) {
  var config = _.cloneDeep(this.config);
  if (_.isPlainObject(key)) {
    config = override(config, key);
  } else {
    _.set(config, key, value);
  }
  var results = Joi.validate(config, this.schema);
  if (results.error) {
    throw results.error;
  }
  this.config = results.value;
};

Config.prototype.get = function (key) {
  if (!key) {
    return _.cloneDeep(this.config);
  }

  var value = _.get(this.config, key);
  if (value === undefined) {
    if (!this.has(key)) {
      throw new Error('Unknown config key: ' + key);
    }
  }
  return _.cloneDeep(value);
};

Config.prototype.has = function (key) {
  function has(key, schema, path) {
    path = path || [];
    // Catch the partial paths
    if (path.join('.') === key) return true;
    // Only go deep on inner objects with children
    if (schema._inner.children.length) {
      for (var i = 0; i < schema._inner.children.length; i++) {
        var child = schema._inner.children[i];
        // If the child is an object recurse through it's children and return
        // true if there's a match
        if (child.schema._type === 'object') {
          if (has(key, child.schema, path.concat([child.key]))) return true;
        // if the child matches, return true
        } else if (path.concat([child.key]).join('.') === key) {
          return true;
        }
      }
    }
  }
  return !!has(key, this.schema);
};

module.exports = Config;
