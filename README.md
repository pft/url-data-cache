# url-cache
Cache data from a url request.

Forked from url-data-cache.

Main differences: This library is async. Does not itself remove expired
data.


```JavaScript

  import urlCacheInstance from 'url-data-cache';
  const urlDataCache = urlCacheInstance('my-app');
  // or

  const urlDataCache = require('url-data-cache')('my-app');

  // methods: drop, info, put

  // put data into cache, expiring after one hour
  urlDataCache.put(url, data, 3600);

  // get info from cache
  const {exists, expired, dataPath, basePath, metaPath, url } = await urlDataCache.info(url);
  if (exists && !expired) {
    // Do something with dataPath
  } if (exists && expired) {
    await urlDataCache.drop(url);
  }
  // NOTE if exists is false, expired is always 'n/a'


```
