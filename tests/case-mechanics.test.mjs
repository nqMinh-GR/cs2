import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildSync} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const out=mkdtempSync(join(tmpdir(),'tnag-case-'));
try{
 buildSync({entryPoints:['src/lib/case-mechanics.ts'],outfile:join(out,'case.cjs'),bundle:true,platform:'node',format:'cjs'});
 const {createSpinProfile,createUniformSelector}=createRequire(import.meta.url)(join(out,'case.cjs'));
 test('normal motion keeps the deliberate case-opening pace',()=>{
  const profile=createSpinProfile(()=>.5,false);
  assert.deepEqual(profile,{durationMs:8500,tiles:35,friction:3});
 });
 test('reduced motion remains readable instead of becoming an instant Windows spin',()=>{
  const profile=createSpinProfile(()=>.5,true);
  assert.deepEqual(profile,{durationMs:4500,tiles:12,friction:3});
 });
 test('uniform selector gives every item identical odds',()=>{
  const items=[{price:10,rarity:0},{price:20,rarity:1},{price:50,rarity:4}];
  const selector=createUniformSelector(items);
  for(const item of items)assert.equal(selector.probabilities.get(item),1/3);
  assert.equal(selector.choose(items,()=>0),items[0]);
  assert.equal(selector.choose(items,()=>.999),items[2]);
 });
}finally{rmSync(out,{recursive:true,force:true})}
