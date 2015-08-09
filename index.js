// Methods to work with redis and using it as cache store
// Basically this module is an extension of cacheman-redis

var redis = require('redis');
var CachemanRedis = require('cacheman-redis');
var q = require('q');

var noopPromise = function() { return q.Promise(function(resolve) { return resolve(); })}

var cache = {
	set: noopPromise,
	get: noopPromise,
	del: noopPromise,
	clear: noopPromise
};


// Inspired by fetch method from Rails.cache, it is able to simplify standard cache procedure - get, check, put
// @param [String] key redis key
// @param [Integer] ttl key lifetime in seconds (optional). -1 or nil for unlimited
// @param [Function] fn function that can return promise or simple value. result of function execution will be put in redis
var fetch = function(key, ttl, fn) {
	if(fn == null) fn = ttl;
	return cache.get(key).then(function(result) {
		if(result == null) {
			result = q(fn()).then(function(res) {
				cache.set(key, res, ttl);
				return res;
			});
		}
		return result;
	});
};

// @param [Object] options options for redis client @see node_redis
// @param [Boolean] disabled disables cache and gives same functionality that stubs same methods
module.exports = function(options, disabled) {

	if(disabled != null && disabled) {
		cache.fetch = fetch;
		return cache;
	}

	redis = new CachemanRedis(options);
	cache = {
		raw: redis,
		set: function(key, value, ttl) {
			return q.Promise(function(resolve, reject) {
				redis.set(key, value, ttl, function(error) {
					if(error) reject(error);
					else resolve(value);
				});
			});
		},
		get: function(key) {
			return q.Promise(function(resolve, reject) {
				redis.get(key, function(error, data) {
					if(error) reject(error);
					else resolve(data);
				});
			});
		},
		del: function(key) {
			return q.Promise(function(resolve, reject) {
				redis.del(key, function(error) {
					if(error) reject(error);
					else resolve();
				});
			});
		},
		clear: function() {
			return q.Promise(function(resolve, reject) {
				redis.clear(function(error) {
					if(error) reject(error);
					else resolve();
				});
			});
		}
	};

	cache.fetch = fetch;

	return cache;
};
