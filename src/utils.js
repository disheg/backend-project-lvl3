import cheerio from 'cheerio';
import path from 'path';

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

export const updateAssetsLinks = (html, websiteName) => {
  const $ = cheerio.load(html);
  const images = $('img');
  [...images].forEach((image) => image.attribs.src = `${websiteName}_files/${websiteName}${createAssetPath(image.attribs.src)}`);
  return $.html();
};
