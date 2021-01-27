// vim: set tw=99 ts=2 sw=2 et:

'use strict';

const crypto = require('crypto');
const path = require('path');

const am = require('am');
const sleep = require('await-sleep');
const { program } = require('commander');
const fs = require('fs-extra');
const puppeteer = require('puppeteer-core');
const tmp = require('tmp-promise');

tmp.setGracefulCleanup();

program
  .version(require('./package.json').version)
  .requiredOption('-b, --browser <path>', 'browser executable path')
  .requiredOption('-o, --output <path>', 'Page Graph output directory')
  .option('-p, --profile <path>', 'browser profile directory', null)
  .option('-v, --verbose', 'enable verbose browser logging', false)
  .parse(require('process').argv);

const {
  browser: browserExePath,
  output: outputDirPath,
  profile: profileDirPath,
  verbose: enableBrowserLogging,
} = program;

const computeHash = data => crypto.createHash('sha256').update(data).digest('hex');

const attachToTarget = async target => {
  const client = await target.createCDPSession();
  client.on('Page.finalPageGraph', async event => {
    const graphFileName = `frame-${event.frameId.toLowerCase()}-${computeHash(
      event.data
    ).substring(0, 32)}.graphml`;
    const graphFilePath = path.join(outputDirPath, graphFileName);
    await fs.writeFile(graphFilePath, event.data);
    console.log(`Saved: ${graphFilePath}`);
  });
};

am(async () => {
  await fs.ensureDir(outputDirPath);

  const profileDir = profileDirPath
    ? { path: profileDirPath, cleanup () {} }
    : await tmp.dir({
        unsafeCleanup: true,
      });

  const browser = await puppeteer.launch({
    executablePath: browserExePath,
    userDataDir: profileDir.path,
    userDataDir: '/home/spinda/.config/BraveSoftware/Brave-Browser-Development',
    args: [
      ...(enableBrowserLogging ? ['--enable-logging', '--v=0'] : []),
      '--disable-brave-update',
      ...(enableBrowserLogging ? ['--enable-logging=stderr'] : []),
    ],
    ignoreDefaultArgs: [
      '--disable-sync',
      '--enable-features=NetworkService,NetworkServiceInProcess',
      // ^ breaks Brave Shields
      '--disable-extensions',
    ],
    dumpio: enableBrowserLogging,
    headless: false,
  });

  browser.on('targetcreated', async target => {
    if (target.type() === 'page') {
      await attachToTarget(target);
    }
  });

  for (const page of await browser.pages()) {
    attachToTarget(page.target());
  }

  browser.on('disconnected', async () => {
    profileDir.cleanup();
  });
});
