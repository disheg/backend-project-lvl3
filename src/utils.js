import cheerio from 'cheerio';
import path from 'path';
import axios from 'axios';
import fs from 'fs';

export const createAssetPath = (assetPath) => {
  const { dir, name, ext } = path.parse(assetPath);
  const result = `${dir}/${name}`.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '-');
  return `${result}${ext}`;
};

export const isValidURL = (string) => {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
};

export const updateAssets = (html, websiteName) => {
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
  const $ = cheerio.load(html);
  Object.values(assets).forEach((asset) => {
    const assetCollection = [...$(`${asset.tag}`)];
    if (assetCollection.length < 0) return;
    assetCollection
      .forEach((tag) => {
        const link = tag.attribs[asset.linkAttr];
        if (!link || isValidURL(link)) {
          return;
        }
        tag.attribs[asset.linkAttr] = `${websiteName}_files/${websiteName}${createAssetPath(link)}`;
      });
  });
  return $.html();
};

export const downloadAssets = (directory, websiteName, hostname, urls) => fs.promises.mkdir(path.resolve(directory, `${websiteName}_files`))
  .then(() => {
    urls.forEach((assetNode) => {
      const url = new URL(hostname);
      url.pathname = assetNode;
      return axios({
        method: 'GET',
        url: url.href,
        responseType: 'stream',
      })
        .then((response) => response.data
          .pipe(fs.createWriteStream(path.resolve(
            directory,
            `${websiteName}_files`,
            `${websiteName}${createAssetPath(assetNode)}`,
          ))));
    });
  });
