# url-cache
Cache data from a url request.

```JavaScript

  // get from cache (also delete expired)
  const cachedData = downloadHtmlCache.get(url);
  if(cachedData) return resolve(cachedData);

  // put to cache
  downloadHtmlCache.put(url, htmlData, '1 hour');

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
