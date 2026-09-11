import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildSync} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const out=mkdtempSync(join(tmpdir(),'tnag-grid-'));
try{
 buildSync({entryPoints:['src/lib/grid-slice.ts'],outfile:join(out,'grid.cjs'),bundle:true,platform:'node',format:'cjs'});
 const {collapsedSlice,collapsedCount}=createRequire(import.meta.url)(join(out,'grid.cjs'));
 const sorted=Array.from({length:120},(_,i)=>i);
 test('two rows end with the gold tile when the case has one',()=>{
  for(let cols=2;cols<=9;cols++){
   const slice=collapsedSlice(sorted,cols,true);
   assert.equal(slice.length+1,cols*2);
   assert.deepEqual(slice,sorted.slice(0,cols*2-1));
  }
 });
 test('two full rows without a gold tile',()=>{
  for(let cols=2;cols<=9;cols++)assert.equal(collapsedSlice(sorted,cols,false).length,cols*2);
 });
 test('degenerate column counts still show at least one tile',()=>{
  assert.equal(collapsedCount(0,true),1);
  assert.equal(collapsedCount(1,true),1);
  assert.equal(collapsedCount(1,false),2);
 });
}finally{rmSync(out,{recursive:true,force:true})}
