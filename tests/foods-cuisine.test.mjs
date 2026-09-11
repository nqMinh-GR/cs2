import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildSync} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const CUISINES=['vn','jp','kr','cn','tw','sg','th','in','me','mx','it','us','intl'];
const out=mkdtempSync(join(tmpdir(),'tnag-foods-'));
try{
 buildSync({entryPoints:['src/lib/foods.ts'],outfile:join(out,'foods.cjs'),bundle:true,platform:'node',format:'cjs'});
 const {foods}=createRequire(import.meta.url)(join(out,'foods.cjs'));
 test('every dish carries a known cuisine tag and unique image id',()=>{
  assert.ok(foods.length>=128);
  assert.equal(new Set(foods.map(f=>f.image)).size,foods.length);
  for(const food of foods)assert.ok(CUISINES.includes(food.cuisine),`${food.name} has cuisine ${food.cuisine}`);
 });
 test('spot checks',()=>{
  const by=(name)=>foods.find(f=>f.name===name).cuisine;
  assert.equal(by('Phở bò'),'vn');assert.equal(by('Sushi cá hồi'),'jp');assert.equal(by('Bibimbap'),'kr');
  assert.equal(by('Pizza'),'it');assert.equal(by('Burrito'),'mx');assert.equal(by('Dimsum'),'cn');assert.equal(by('Pad Thai'),'th');
 });
}finally{rmSync(out,{recursive:true,force:true})}
