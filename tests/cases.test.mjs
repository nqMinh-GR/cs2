import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildSync} from 'esbuild';
import {createRequire} from 'node:module';
import {existsSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const out=mkdtempSync(join(tmpdir(),'tnag-cases-'));
try{
 buildSync({entryPoints:['src/lib/cases.ts','src/lib/items/icons.ts','src/lib/foods.ts','src/lib/case-decals.ts'],outdir:out,bundle:true,platform:'node',format:'cjs'});
 const require=createRequire(import.meta.url);
 const {cases,caseItems,caseSelector,rarityFor,findCase,DEFAULT_CASE}=require(join(out,'cases.js'));
 const {ICON_KEYS}=require(join(out,'items/icons.js'));
 const {foods}=require(join(out,'foods.js'));
 const {decalFor}=require(join(out,'case-decals.js'));
 const profile={disabled:[],custom:[],revision:0};
 test('registry integrity',()=>{
  assert.ok(findCase(DEFAULT_CASE));
  assert.equal(new Set(cases.map(c=>c.id)).size,cases.length);
  for(const def of cases){
   const [a,b,c,d]=def.rarityThresholds;assert.ok(a<b&&b<c&&c<d,`${def.id} thresholds ascending`);
   assert.ok(def.budgets.min<def.budgets.default&&def.budgets.default<=def.budgets.max,`${def.id} default in range`);
   for(const preset of def.budgets.presets)assert.ok(preset>=def.budgets.min&&preset<=def.budgets.max,`${def.id} preset ${preset} in range`);
   assert.ok(def.nameVi&&def.nameEn&&def.descVi&&def.descEn,`${def.id} copy`);
   assert.match(def.accent,/^#[0-9a-f]{6}$/i);
   const decal=decalFor(def);assert.ok(decal.glyph&&decal.label,`${def.id} decal`);
  }
 });
 test('every case has enough items, unique names, valid art and a feasible selector for every preset',()=>{
  for(const def of cases){
   const items=caseItems(def,profile);
   assert.ok(items.length>=8,`${def.id} has ${items.length} items`);
   assert.equal(new Set(items.map(i=>i.id)).size,items.length,`${def.id} unique ids`);
   assert.equal(new Set(items.map(i=>i.name)).size,items.length,`${def.id} unique names`);
   for(const item of items){
    assert.ok(Number.isInteger(item.price)&&item.price>0,`${item.name} price`);
    assert.equal(item.rarity,rarityFor(def,item.price));
    if(item.art.kind==='icon')assert.ok(ICON_KEYS.includes(item.art.icon),`${item.name} icon ${item.art.icon}`);
    else if(item.art.kind==='photo'){
     assert.match(item.art.src,/^\/items\/.+\.webp$/,`${item.name} photo`);
     assert.ok(existsSync(join('public',item.art.src.replace(/^\//,''))),`${item.name} missing ${item.art.src}`);
    }
    else assert.ok(foods.some(f=>f.image===item.art.image),`${item.name} atlas`);
    if(item.art.kind==='icon'||item.art.kind==='photo')assert.ok(item.customId||item.nameEn,`${item.name} needs an English name`);
   }
   for(const target of [...def.budgets.presets,def.budgets.default,def.budgets.min,def.budgets.max]){
    const selector=caseSelector(items,target,def.uniformOdds);assert.ok(selector,`${def.id} selector for ${target}`);
    const chosen=selector.choose(items,()=>.5);assert.ok(items.includes(chosen));
   }
   const veg=items.filter(i=>i.veg);
   if(def.vegFilter)assert.ok(veg.length>0,`${def.id} veg filter needs vegetarian items`);
  }
 });
 test('cuisine cases partition the catalog and the vegetarian case is all vegetarian',()=>{
  const cuisineCases=cases.filter(c=>c.source.kind==='foods'&&c.source.cuisines);
  const covered=cuisineCases.flatMap(c=>caseItems(c,profile).map(i=>i.id));
  assert.equal(covered.length,foods.length,'every dish belongs to exactly one cuisine case');
  assert.equal(new Set(covered).size,foods.length);
  for(const item of caseItems(findCase('do-chay'),profile))assert.equal(item.veg,true,item.name);
  assert.equal(caseItems(findCase('mon-chinh'),profile).length,foods.length);
 });
 test('rarity thresholds map prices to the five tiers',()=>{
  const def={rarityThresholds:[20,35,50,60]};
  assert.deepEqual([5,20,21,35,36,50,51,60,61].map(p=>rarityFor(def,p)),[0,0,1,1,2,2,3,3,4]);
 });
 test('18-plus case is gated, skips commerce, and uses the matching supplied photos',()=>{
  const def=findCase('18-plus');
  assert.ok(def);assert.equal(def.gated,true);assert.equal(def.commerce,false);
  const items=caseItems(def,profile);
  assert.equal(items.length,56);
  assert.equal(items.filter(item=>item.art.kind==='photo').length,55);
  const selector=caseSelector(items,def.budgets.default,def.uniformOdds);
  assert.equal(def.uniformOdds,true);
  for(const item of items)assert.ok(Math.abs(selector.probabilities.get(item)-1/items.length)<1e-12,`${item.name} equal odds`);
  for(const item of items){
   assert.equal(item.name,item.nameEn,item.name);
   assert.match(item.name,/^[A-Za-z0-9][A-Za-z0-9 ',+.-]*$/,item.name);
  }
  const fusion=items.find(item=>item.name==='The Fusion');
  assert.ok(fusion);assert.equal(fusion.art.kind,'icon');assert.equal(fusion.art.icon,'heart');
 });
}finally{rmSync(out,{recursive:true,force:true})}
