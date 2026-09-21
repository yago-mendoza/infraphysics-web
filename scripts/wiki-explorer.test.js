import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transform } from 'esbuild';

const { code } = await transform(readFileSync(new URL('../src/lib/wikiExplorer.ts', import.meta.url), 'utf8'), { loader: 'ts', format: 'esm' });
const { matchesWikiName, branchDepths } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

test('Name matches leaf names and aliases, not ancestor paths', () => {
  const note = { title: 'industrial//fieldbus//modbus', name: 'modbus', displayTitle: 'Modbus', aliases: ['MB protocol'] };
  assert.equal(matchesWikiName(note, 'industrial'), false);
  assert.equal(matchesWikiName(note, 'fieldbus'), false);
  assert.equal(matchesWikiName(note, 'MODBUS'), true);
  assert.equal(matchesWikiName(note, 'mb protocol'), true);
  assert.equal(matchesWikiName({ title: note.title }, 'industrial'), false);
  assert.equal(matchesWikiName({ title: note.title }, 'modbus'), true);
});

test('selection contains only address descendants and never a previous selection or a prefix sibling', () => {
  const nodes = [
    { id: 'root', address: 'industrial' },
    { id: 'bus', address: 'industrial//fieldbus' },
    { id: 'modbus', address: 'industrial//fieldbus//modbus' },
    { id: 'tcp', address: 'industrial//fieldbus//modbus//tcp' },
    { id: 'other', address: 'industrial//fieldbus-other' },
    { id: 'scada', address: 'industrial//scada' },
  ];
  assert.deepEqual([...branchDepths(nodes, 'bus')], [['modbus', 1], ['tcp', 2]]);
  assert.deepEqual([...branchDepths(nodes, 'scada')], []);
  assert.deepEqual([...branchDepths(nodes, null)], []);
});
