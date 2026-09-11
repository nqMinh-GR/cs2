import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildSync} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const out=mkdtempSync(join(tmpdir(),'tnag-reel-'));
try{
 buildSync({entryPoints:['src/lib/reel-plan.ts'],outfile:join(out,'reel.cjs'),bundle:true,platform:'node',format:'cjs'});
 const {planReel}=createRequire(import.meta.url)(join(out,'reel.cjs'));
 const eligible=Array.from({length:12},(_,i)=>({id:`i${i}`,price:30+i*10}));
 const selector={probabilities:new Map(eligible.map(f=>[f,1])),choose:(items)=>items[0]};
 const reel=Array.from({length:12},(_,id)=>({id,food:eligible[id%eligible.length]}));
 test('winner lands on the target slot and the end offset centers it',()=>{
  const winner=eligible[7];
  const plan=planReel({reel,eligible,selector,winner,width:1000,start:-400,tiles:35,stop:.5});
  assert.equal(plan.center,Math.floor((500+400)/254));
  assert.equal(plan.target,plan.center+35);
  assert.equal(plan.end,500-240*.5-plan.target*254);
  assert.equal(plan.items.find(i=>i.id===plan.target).food,winner);
  const ids=plan.items.map(i=>i.id);
  for(let k=1;k<ids.length;k++)assert.equal(ids[k],ids[k-1]+1,'slot ids stay contiguous');
  assert.equal(ids.at(-1),plan.target+4);
  for(const {food} of plan.items)assert.ok(eligible.includes(food));
 });
 test('retained cards keep their slots and no dish repeats inside an 8-card window',()=>{
  const plan=planReel({reel,eligible,selector,winner:eligible[3],width:1000,start:-400,tiles:35,stop:.3});
  const rightEdge=Math.ceil((1000+400)/254)+1;
  for(const original of reel)if(original.id>=plan.center-Math.ceil(1000/254)-2&&original.id<=rightEdge)assert.equal(plan.items.find(i=>i.id===original.id)?.food,original.food,`slot ${original.id} retained`);
  const fresh=plan.items.filter(i=>i.id>11&&i.id!==plan.target).map(i=>i.food);
  for(let k=0;k<fresh.length;k++)for(let j=k+1;j<Math.min(fresh.length,k+8);j++)assert.notEqual(fresh[k],fresh[j]);
 });
 test('narrow viewport still resolves a center slot',()=>{
  const plan=planReel({reel,eligible,selector,winner:eligible[0],width:360,start:-400,tiles:10,stop:.5});
  assert.equal(plan.center,2);
  assert.equal(plan.target,12);
 });
 test('tiny pools fall back to repeats instead of throwing',()=>{
  const two=eligible.slice(0,2);
  const sel={probabilities:new Map(two.map(f=>[f,1])),choose:(items)=>items[0]};
  const plan=planReel({reel:reel.map(s=>({...s,food:two[s.id%2]})),eligible:two,selector:sel,winner:two[1],width:800,start:-400,tiles:30,stop:.5});
  assert.equal(plan.items.find(i=>i.id===plan.target).food,two[1]);
 });
}finally{rmSync(out,{recursive:true,force:true})}
