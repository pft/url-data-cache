const shasum = require("shasum");
const osPaths = require("os-paths");
const fsp = require("fs/promises");
const path = require("path");
const util = require("util");
const rimraf = require("rimraf");

module.exports = function (application = "default") {
  function calculateLocations(link) {
    const paths = osPaths(application);
    const url = new URL(link);
    const cas = shasum(url.toString());
    const hostPath = url.hostname.replace(/[^a-zA-Z0-9-]/, "_");
    const basePath = path.resolve(paths.cache + `/cached/${hostPath}`);
    const fileName = cas + path.extname(url.pathname);
    const metaName = cas + ".json";
    const dataPath = path.join(basePath, fileName);
    const metaPath = path.join(basePath, metaName);
    return {
      basePath,
      dataPath,
      metaPath,
    };
  }

  function calculateExpirationDate(duration = 0) {
    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + duration);
    return expirationDate.toString();
  }

  async function info(url) {
    const { basePath, dataPath, metaPath } = calculateLocations(url);
    try {
      // May throw:
      await fsp.access(dataPath, fsp.constants.R_OK);
      // May throw:
      const { expiration } = JSON.parse(await fsp.readFile(metaPath));
      const currentDate = new Date();
      const dateOfExpiration = new Date(expiration);
      const expired = currentDate > dateOfExpiration;
      return { url, dataPath, metaPath, basePath, expired, exists: true };
    } catch (e) {
      // Yes, the file itself might exist, and metafile may have
      // caused an error. But let's just treat that as non-existing.
      return {
        url,
        dataPath,
        metaPath,
        basePath,
        expired: "n/a",
        exists: false,
      };
    }
  }

  async function put(url, data, duration = 0) {
    const expiration = calculateExpirationDate(duration);
    const { basePath, dataPath, metaPath } = calculateLocations(url);
    await fsp.mkdir(basePath, { recursive: true });
    await fsp.writeFile(metaPath, JSON.stringify({ expiration, url }, null, 2));
    await fsp.writeFile(dataPath, data);
    return;
  }

  async function drop(url) {
    const { basePath, dataPath, metaPath } = calculateLocations(url);
    await Promise.all([fsp.unlink(dataPath), fsp.unlink(metaPath)]);
    const entries = await fsp.readdir(basePath);
    if (entries.length === 0) {
      await util.promisify(rimraf)(basePath);
    }
    return null;
  }

  return {
    drop,
    info,
    put,
  };
};
