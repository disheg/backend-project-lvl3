import { test, expect, beforeEach } from '@jest/globals';
import nock from 'nock';
import fs from 'fs';
import path from 'path';
import os from 'os';
import pageLoad from '../src/index';
import { createAssetPath, updateAssetsLinks } from '../src/utils';

nock.disableNetConnect();

let directoryName;
const fileName = 'ru-hexlet-io-courses.html';
const websiteName = 'ru-hexlet-io-courses';
const url = new URL('https://ru.hexlet.io/courses');

beforeEach(async () => {
  directoryName = await fs.promises.mkdtemp(path.join(os.tmpdir(), `page-loader-hexlet`));
})

test('File was created and downloaded', async () => {
  const expected = '<!DOCTYPE html><html><head></head><body></body></html>';
  nock(url.origin)
    .get(url.pathname)
    .reply(200, '<!DOCTYPE html><html><head></head><body></body></html>');
  await pageLoad(directoryName, url.href);
  console.log('dir', directoryName);
  const fileData = await fs.promises.readFile(path.join(directoryName, websiteName, fileName), 'utf-8');
  expect(fileData).toEqual(expected);
});

test('Asset name was converted', () => {
  const expected = '-assets-professions-nodejs.png';
  expect(createAssetPath('/assets/professions/nodejs.png')).toEqual(expected);
});