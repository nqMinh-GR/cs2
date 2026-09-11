import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildSync} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const out=mkdtempSync(join(tmpdir(),'tnag-state-'));
try{
 buildSync({entryPoints:['src/lib/unlock-state.ts'],outfile:join(out,'state.cjs'),bundle:true,platform:'node',format:'cjs'});
 const {unlockReducer,initialUnlockState,isBusy,shouldMaskGold}=createRequire(import.meta.url)(join(out,'state.cjs'));
 const winner={id:'food-1',name:'Phở bò',sub:'',price:55,rarity:1,art:{kind:'atlas',image:1}};
 test('legal chain idle → unlocking → spinning → settled → revealed → idle',()=>{
  let s=unlockReducer(initialUnlockState,{type:'UNLOCK',at:1000});
  assert.equal(s.phase,'unlocking');assert.equal(s.startedAt,1000);
  s=unlockReducer(s,{type:'SPIN'});assert.equal(s.phase,'spinning');
  s=unlockReducer(s,{type:'SETTLE',winner,slot:37});assert.equal(s.phase,'settled');assert.equal(s.result,winner);assert.equal(s.winnerSlot,37);
  s=unlockReducer(s,{type:'REVEAL'});assert.equal(s.phase,'revealed');
  s=unlockReducer(s,{type:'DISMISS'});assert.equal(s.phase,'idle');assert.equal(s.result,null);assert.equal(s.winnerSlot,null);
 });
 test('illegal actions return the same reference',()=>{
  assert.equal(unlockReducer(initialUnlockState,{type:'SPIN'}),initialUnlockState);
  assert.equal(unlockReducer(initialUnlockState,{type:'REVEAL'}),initialUnlockState);
  assert.equal(unlockReducer(initialUnlockState,{type:'DISMISS'}),initialUnlockState);
  const unlocking=unlockReducer(initialUnlockState,{type:'UNLOCK',at:1});
  assert.equal(unlockReducer(unlocking,{type:'UNLOCK',at:2}),unlocking);
  assert.equal(unlockReducer(unlocking,{type:'SETTLE',winner,slot:1}),unlocking);
 });
 test('busy covers every phase except idle and revealed',()=>{
  assert.equal(isBusy('idle'),false);assert.equal(isBusy('revealed'),false);
  for(const phase of ['unlocking','spinning','settled'])assert.equal(isBusy(phase),true);
 });
 test('gold contents remain masked until the reveal phase',()=>{
  for(const phase of ['idle','unlocking','spinning','settled'])assert.equal(shouldMaskGold(phase),true);
  assert.equal(shouldMaskGold('revealed'),false);
 });
}finally{rmSync(out,{recursive:true,force:true})}
