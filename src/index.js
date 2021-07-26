import fs from 'fs';
import path from 'path';
import axios from 'axios';
import cheerio from 'cheerio';
import {
  updateAssetsLinks,
  isValidURL,
  createAssetPath,
} from './utils.js';

const getAssetsLinks = (html) => {
  const $ = cheerio.load(html);
  const images = $('img');
  return images;
};

const downloadAssets = (directory, websiteName, url, assets) => {
  const assetsUrls = [...assets].map((asset) => asset.attribs.src);
  return fs.promises.mkdir(path.resolve(directory, `${websiteName}_files`))
    .then(() => {
      assetsUrls.forEach((assetUrl) => {
        const validUrl = isValidURL(assetUrl) ? assetUrl : `${url}${assetUrl}`;
        return axios({
          method: 'GET',
          url: validUrl,
          responseType: 'stream',
        })
          .then((response) => response.data
            .pipe(fs.createWriteStream(path.resolve(
              directory,
              `${websiteName}_files`,
              `${websiteName}${createAssetPath(assetUrl)}`,
            ))));
      });
    });
};

const createSiteFile = (directory, fileName, data) => fs.promises
  .writeFile(path.resolve(directory, fileName), data);

const getWebsiteName = (url) => {
  const newUrl = new URL(url);
  console.log(path.parse(url))
  const { hostname, pathname } = newUrl;
  const result = `${hostname}${pathname}`.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '-');
  return result.slice(0, result.length - 1);
};

const getSiteHtml = (url) => axios.get(url);

const pageLoad = (directory, url) => {
  const websiteName = getWebsiteName(url);
  const websitePath = path.resolve(directory, websiteName);
  const createProjectFolder = (name) => fs.promises.mkdir(name);
  return createProjectFolder(websitePath)
    .then(() => {
      console.log('Website folder was created');
      return getSiteHtml(url);
    })
    .then((response) => {
      console.log('Site got');
      const html = response.data;
      const assetsLinks = getAssetsLinks(html);
      console.log('Assets got');
      const updatedHtml = updateAssetsLinks(html, websiteName);
      console.log('Assetslinks was updated');
      createSiteFile(websitePath, `${websiteName}.html`, updatedHtml);
      console.log('WebSite was downloaded');
      downloadAssets(websitePath, websiteName, url, assetsLinks);
      console.log('Assets was download');
    })
    .catch((err) => {
      if (fs.existsSync(path.resolve('log.txt'))) {
        fs.appendFileSync(path.resolve('log.txt'), err.message);
      }
      fs.promises.writeFile(path.resolve('log.txt'), err.message);
    });
};

export default pageLoad;
