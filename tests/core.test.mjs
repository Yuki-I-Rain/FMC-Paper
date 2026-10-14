import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SOLVED, parseScramble, computeFacelets, applyInput } from '../src/core.js';

// Independent geometric model: rotate physical sticker coordinates and normals,
// rather than reusing the library's permutation tables.
const faces = [
  ['U',[0,1,0],(r,c)=>[c-1,1,r-1]],
  ['D',[0,-1,0],(r,c)=>[c-1,-1,1-r]],
  ['R',[1,0,0],(r,c)=>[1,1-r,1-c]],
  ['L',[-1,0,0],(r,c)=>[-1,1-r,c-1]],
  ['F',[0,0,1],(r,c)=>[c-1,1-r,1]],
  ['B',[0,0,-1],(r,c)=>[1-c,1-r,-1]],
];
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const rotate=(v,n)=>{const d=dot(v,n),c=cross(n,v);return n.map((x,i)=>x*d-c[i]);};
const key=(p,n)=>[...p,...n].join(',');
function geometric(sequence){
  const stickers=faces.flatMap(([color,n,position])=>Array.from({length:9},(_,i)=>({color,p:position(Math.floor(i/3),i%3),n:[...n]})));
  const target=stickers.map(s=>key(s.p,s.n));
  for(const move of sequence.split(' ').filter(Boolean)){
    const axis=faces.find(f=>f[0]===move[0])[1];
    const turns=move.endsWith('2')?2:move.endsWith("'")?3:1;
    for(let turn=0;turn<turns;turn++) for(const s of stickers) if(dot(s.p,axis)===1){s.p=rotate(s.p,axis);s.n=rotate(s.n,axis);}
  }
  const map=new Map(stickers.map(s=>[key(s.p,s.n),s.color]));
  return target.map(k=>map.get(k)).join('');
}
for(const face of 'UDLRFB')for(const suffix of ['',"'",'2'])test(`independent geometry: ${face+suffix}`,()=>assert.equal(computeFacelets(face+suffix),geometric(face+suffix)));
test('all turns satisfy inverse and four-turn identities',()=>{
  for(const face of 'UDLRFB'){
    assert.equal(computeFacelets(`${face} ${face} ${face} ${face}`),SOLVED);
    assert.equal(computeFacelets(`${face} ${face}'`),SOLVED);
    assert.equal(computeFacelets(`${face}2 ${face}2`),SOLVED);
  }
});
test('multi-face scramble matches independent geometry',()=>{
  for(const sequence of ["R U R' U' F2 D L2 B'", "R' U' F D L2 D F2 U L2 R2 U' R2 D' U L D2 U' L2 F2 U' L' B' R' U R' U' F"])
    assert.equal(computeFacelets(sequence),geometric(sequence));
});
test('compact and multiline input normalize without cancelling',()=>{
  assert.equal(parseScramble("RUR'U'\nF2  D\tL2").normalized,"R U R' U' F2 D L2");
  assert.equal(parseScramble("R R R R").normalized,"R R R R");
  assert.equal(parseScramble(' \n\t').valid,true);
});
test('restricted notation rejects library extensions and malformed suffixes',()=>{
  for(const input of ['x','y2','z', 'r','Rw','M','E','S','R3',"R2'","R''",'R22','(R U)','R,U','R’','2R','NISS','你好'])
    assert.equal(parseScramble(input).valid,false,input);
  assert.deepEqual(parseScramble('R U R3 F').errors,[{start:4,end:6,text:'R3'}]);
});
test('state holds at last fully valid input then recomputes from solved',()=>{
  let state=applyInput({facelets:SOLVED,lastValid:''},'R U');
  const saved=state.facelets;
  state=applyInput(state,'R U M'); assert.equal(state.facelets,saved); assert.equal(state.lastValid,'R U');
  state=applyInput(state,'F U'); assert.equal(state.facelets,geometric('F U'));
  state=applyInput(state,'F'); assert.equal(state.facelets,geometric('F'));
  state=applyInput(state,''); assert.equal(state.facelets,SOLVED); assert.equal(state.lastValid,'');
});
