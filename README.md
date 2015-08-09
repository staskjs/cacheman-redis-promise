# cacheman-redis-primose

Basically an extension of cacheman-redis module that uses promises and is able to disable caching without messing up all code [cacheman-redis](https://github.com/cayasso/cacheman-redis).

## Instalation

``` bash
$ npm install cacheman-redis-promise
```

## Usage

```javascript
var cache = require('cacheman-redis-promise')({host: '127.0.0.1', port: 6379})

cache.set('some key', 'hello there').then(function(data) {
	console.log(data); // -> 'hello there'
	return cache.get('some key');
}).then(function(data) {
	console.log(data); // -> 'hello there' from cache.get
	return cache.del('some key');
}).then(function() {
	console.log('value deleted');
});

// Or you can use fetch to simplify common cache operations (like get, then check and then set if there is no value)

var fn = function() {
	return 'hey there';
	// Or you can also return a some promise here
};

// fn will be executed only if there are no value under 'some key' key
// and its result will be put into cache under this key
// But if there was value under the key, it will be returned without executing fn
cache.fetch('some key', fn).then(function(data) {
	console.log(data); // -> 'hey there'
});
```
