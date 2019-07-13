# url-cache
Cache data from a url request.

```JavaScript

  import urlCacheInstance from 'url-data-cache';
  const urlDataCache = urlCacheInstance('my-app');

  // or

  const urlDataCache = require('url-data-cache')('my-app');

  // then


  // get from cache (also delete expired)
  const cachedData = urlDataCache.get(url);
  if(cachedData) return resolve(cachedData);

  // put to cache
  urlDataCache.put(url, htmlData, '1 hour');

```

Supported time units:

- n second
- n seconds
- n minute
- n minutes
- n hour
- n hours
- n month
- n months

where n is a number
