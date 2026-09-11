import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildSync} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const out=mkdtempSync(join(tmpdir(),'tnag-i18n-'));
try{
 buildSync({entryPoints:['src/lib/i18n.ts'],outfile:join(out,'i18n.cjs'),bundle:true,platform:'node',format:'cjs'});
 const {copy,fmt,priceLabel}=createRequire(import.meta.url)(join(out,'i18n.cjs'));
 const placeholders=(s)=>[...String(s).matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
 test('Vietnamese and English dictionaries have identical keys and placeholders',()=>{
  assert.deepEqual(Object.keys(copy.vi).sort(),Object.keys(copy.en).sort());
  for(const key of Object.keys(copy.vi)){
   const vi=copy.vi[key],en=copy.en[key];
   if(Array.isArray(vi)){assert.equal(vi.length,en.length,key);continue}
   assert.equal(typeof vi,'string',key);assert.ok(vi.trim().length,`${key} empty`);assert.ok(en.trim().length,`${key} empty (en)`);
   assert.deepEqual(placeholders(vi),placeholders(en),`placeholders differ for ${key}`);
  }
  assert.equal(copy.vi.tiers.length,5);
 });
 test('keys from the removed counter/inventory copy are gone',()=>{
  for(const key of ['counterPrefix','counterSuffix','counterTitle','starsPending','whatsInside','items','newItem','footer','title','open','openAgain'])assert.equal(key in copy.vi,false,key);
 });
 test('fmt fills placeholders and leaves unknown ones alone',()=>{
  assert.equal(fmt('Có {n} món',{n:3}),'Có 3 món');
  assert.equal(fmt('{a} {b}',{a:'x'}),'x {b}');
 });
 test('prices format per language',()=>{
  assert.equal(priceLabel(50,'en'),'₫50,000');
  assert.match(priceLabel(50,'vi',true),/^~50\.000đ$/);
 });
}finally{rmSync(out,{recursive:true,force:true})}
