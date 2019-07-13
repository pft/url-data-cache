const shasum  = require('shasum');
const osPaths = require('os-paths');
const fs = require('fs');
const path = require('path');
const rimraf = require("rimraf");



module.exports = function(application='tarnation'){


    function calculateLocations(link){
      const paths = osPaths(application);
      const url = new URL(link);
      const cas = shasum(url.toString());
      let hostPath = url.hostname.split('.').map(i=>i.replace(/[^a-zA-Z0-9-]/,'_')).reverse().join('/')
      let basePath = path.resolve(paths.cache + `/cache-web/${hostPath}`);
      let fileName = cas + '.html';
      let metaName = cas + '.json';
      let dataPath = path.join(basePath, fileName);
      let metaPath = path.join(basePath, metaName);
      return {
        basePath,
        dataPath,
        metaPath,
      };
    };

    function calculateExpiration(duration){

      let [timeValue, timeUnit] = duration.split(' ');
      timeValue = parseInt(timeValue);
      let expirationDate = new Date();
      if(timeUnit.startsWith('second')){
        expirationDate.setSeconds(expirationDate.getSeconds() + timeValue);
      }else if(timeUnit.startsWith('minute')){
        expirationDate.setMinutes(expirationDate.getMinutes() + timeValue);
      }else if(timeUnit.startsWith('hour')){
        expirationDate.setHours(expirationDate.getHours() + timeValue);
      }else if(timeUnit.startsWith('month')){
        expirationDate.setMonth(expirationDate.getMonth() + timeValue);
      }else{
        throw new Error('Unknown timeUnit use in cache duration, use second, minute, hour, or month')
      }
      return expirationDate.toString();

    };

    function put(url, data, duration = '1 hour'){
      const expiration = calculateExpiration(duration);
      const { basePath, dataPath, metaPath } = calculateLocations(url);
      fs.mkdirSync(basePath, {recursive:true});
      fs.writeFileSync(metaPath, JSON.stringify({expiration, url}, null, '  '));
      fs.writeFileSync(dataPath, data);
      //console.log(`CACHE of ${url} will expire on ${expiration}`)
      console.log({ basePath, dataPath, metaPath })
  };

    function get(url){
      const { basePath, dataPath, metaPath } = calculateLocations(url);
      if (!fs.existsSync(dataPath)) {
        return null;
      }
      const {expiration} = JSON.parse( fs.readFileSync(metaPath) );
      const data = fs.readFileSync(dataPath);
      let currentDate = new Date();
      let dateOfExpiration = new Date(expiration);
      let expired = (currentDate > dateOfExpiration);
      if(!expired){
        //console.log(`WAS IN CACHE! ${url} will expire on ${expiration}`)
        return data;
      }else{
        //console.log(`WAS EXPIRED ${url} expired on ${expiration}`)
        rimraf.sync(basePath);
        return null;
      }
    };

  return {
    put, get
  }

}
