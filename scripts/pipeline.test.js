import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import { classify, encode, matchesObject } from './media.js';
import { pruneCards } from './og-cards.js';

test('same-size replacement is uploaded unless the bytes match the object ETag', () => {
  const old = Buffer.from('old'), replacement = Buffer.from('new');
  const existing = {size:old.length,etag:crypto.createHash('md5').update(old).digest('hex')};
  assert.equal(matchesObject(existing,old),true);
  assert.equal(matchesObject(existing,replacement),false);
  assert.equal(matchesObject({...existing,etag:'multipart-etag-2'},old),false);
});

test('renamed card routes retain the image still used by the new canonical URL', async () => {
  const manifest = {cards:{'/old':{key:'og/article/1.jpg'},'/new':{key:'og/article/1.jpg'},'/deleted':{key:'og/article/2.jpg'}}};
  const removed = [];
  await pruneCards(manifest,[{path:'/new',key:'og/article/1.jpg'}],['/old','/deleted'],{remove:async key=>removed.push(key)});
  assert.deepEqual(removed,['og/article/2.jpg']);
  assert.deepEqual(Object.keys(manifest.cards),['/new']);
});

test('identical masters respect figure and cover dimensions when cached', async () => {
  const buffer = await sharp({create:{width:1800,height:900,channels:3,background:'#123456'}}).png().toBuffer();
  const source = {buffer,hash:crypto.createHash('sha1').update(buffer).digest('hex').slice(0,12)};
  const figure = await encode(source,{kind:'webp',role:'figure'});
  const cover = await encode(source,{kind:'webp',role:'cover'});
  assert.equal(figure.width,1400);
  assert.equal(cover.width,1600);
  assert.equal((await encode(source,{kind:'webp',role:'figure'})).width,1400);
});

test('media paths distinguish covers, figures and unsupported layouts', () => {
  assert.equal(classify('articles/123/cover.jpg').role,'cover');
  assert.equal(classify('articles/123/figures/circuit.svg').role,'figure');
  assert.ok(classify('articles/123/circuit.png').error);
});

test('context check is read only and generation preserves unrelated studio files', () => {
  const dir = fs.mkdtempSync(path.resolve('room/context-test-'));
  try {
    fs.mkdirSync(path.join(dir,'scripts'),{recursive:true});
    fs.copyFileSync('scripts/context-pack.js',path.join(dir,'scripts/context-pack.mjs'));
    for (const file of ['README.md','NO-TICS.md','SYNTAX.md','STYLE.md','VOICE.md','VISUAL.md','essays/README.md','projects/README.md','bits2bricks/README.md']) {
      const target = path.join(dir,'src/data/pages',file);
      fs.mkdirSync(path.dirname(target),{recursive:true});
      fs.writeFileSync(target,'# Fixture\n\nSource '+file+'\n' + (file === 'README.md' ? '\n[Rules](STYLE.md) and `![example](image.png)`\n' : ''));
    }
    const sentinel = path.join(dir,'_studio/ai-ctx/keep.md');
    fs.mkdirSync(path.dirname(sentinel),{recursive:true});
    fs.writeFileSync(sentinel,'Handwritten original');
    const run = (...args) => spawnSync(process.execPath,[path.join(dir,'scripts/context-pack.mjs'),...args],{encoding:'utf8'});
    assert.equal(run('--check').status,1);
    assert.equal(fs.existsSync(path.join(dir,'_studio/articles')),false);
    assert.equal(run().status,0);
    assert.equal(fs.readFileSync(sentinel,'utf8'),'Handwritten original');
    const pack = path.join(dir,'_studio/articles/1-articles-format/write-essay.md');
    const before = fs.statSync(pack).mtimeMs;
    assert.match(fs.readFileSync(pack,'utf8'),/Source README.md/);
    assert.match(fs.readFileSync(pack,'utf8'),/Source VISUAL.md/);
    assert.ok(fs.readFileSync(pack,'utf8').includes('[Rules](../../../src/data/pages/STYLE.md)'));
    assert.ok(fs.readFileSync(pack,'utf8').includes('`![example](image.png)`'));
    assert.equal(run('--check').status,0);
    assert.equal(run().status,0);
    assert.equal(fs.statSync(pack).mtimeMs,before);
  } finally {
    // mkdtemp returns an absolute directory inside the disposable workspace room.
    assert.ok(dir.startsWith(path.resolve('room') + path.sep));
    fs.rmSync(dir,{recursive:true,force:true});
  }
});
