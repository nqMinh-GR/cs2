import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildSync} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'os';
import {join} from 'node:path';

const out=mkdtempSync(join(tmpdir(),'tnag-adult-'));
try{
 buildSync({entryPoints:['src/lib/adult-gate.ts'],outfile:join(out,'adult-gate.cjs'),bundle:true,platform:'node',format:'cjs'});
 const {checkAdultPassword}=createRequire(import.meta.url)(join(out,'adult-gate.cjs'));
 test('accepts the intended password and rejects near misses',()=>{
  assert.equal(checkAdultPassword('ahihidocho'),true);
  assert.equal(checkAdultPassword('ahihidocho '),false);
  assert.equal(checkAdultPassword('Ahihidocho'),false);
  assert.equal(checkAdultPassword(''),false);
  assert.equal(checkAdultPassword('wrong'),false);
 });
 test('does not persist anything — the helper is a pure check',()=>{
  assert.equal(checkAdultPassword('ahihidocho'),true);
  assert.equal(checkAdultPassword('nope'),false);
  assert.equal(checkAdultPassword('ahihidocho'),true);
 });
}finally{rmSync(out,{recursive:true,force:true})}
