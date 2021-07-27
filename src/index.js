import fs from 'fs';
import path from 'path';
import axios from 'axios';
import cheerio from 'cheerio';
import _ from 'lodash';
import {
  updateAssets,
  isValidURL,
  downloadAssets,
} from './utils.js';

const assets = {
  img: {
    tag: 'img',
    linkAttr: 'src',
  },
  link: {
    tag: 'link',
    linkAttr: 'href',
  },
  script: {
    tag: 'script',
    linkAttr: 'src',
  },
};

const getAssetsLinks = (html, assetsCollection) => {
  const $ = cheerio.load(html);
  const result = _.flattenDeep(Object.values(assetsCollection)
    .map((asset) => {
      const nodes = $(asset.tag);
      if (nodes.length === 0) {
        return null;
      }
      return [...nodes]
        .map((node) => {
          const link = node.attribs[asset.linkAttr];
          if (isValidURL(link)) {
            return null;
          }
          return link;
        })
        .filter((node) => !!node);
    }));
  return result;
};

const createSiteFile = (directory, fileName, data) => fs.promises
  .writeFile(path.resolve(directory, fileName), data);

const getWebsiteName = (url) => {
  const newUrl = new URL(url);
  const { hostname, pathname } = newUrl;
  const result = `${hostname}${pathname}`.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '-');
  return result.slice(0, result.length - 1);
};

const getSiteHtml = (url) => axios.get(url);

const pageLoad = (url, directory) => {
  console.log('directory', directory);
  console.log('url', url);
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
      const assetsLinks = getAssetsLinks(html, assets);
      console.log('Assets got', assetsLinks);
      const updatedHtml = updateAssets(html, websiteName);
      console.log('Assetslinks was updated');
      createSiteFile(websitePath, `${websiteName}.html`, updatedHtml);
      console.log('WebSite was downloaded');
      downloadAssets(websitePath, websiteName, url, assetsLinks);
      console.log('Assets was download');
    })
    .catch((err) => {
      console.log(err.message);
    });
};

export default pageLoad;
