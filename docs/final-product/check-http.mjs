import {performance} from 'node:perf_hooks';
import fs from 'node:fs';
const base=process.env.ASSESSMENT_BASE||'http://localhost:3100';const tests=[];
async function check(name,route,options,status){const t=performance.now();const r=await fetch(base+route,options);const text=await r.text();const row={name,status:r.status,expected:status,pass:r.status===status,ms:Math.round(performance.now()-t)};if(route==='/api/ask'){try{row.message=JSON.parse(text).error}catch{row.message='non-JSON'}}tests.push(row);}
const headers={'Content-Type':'application/json',Origin:base};
for(const route of ['/','/experts','/ask','/about','/how-it-works','/sign-in','/register','/sources','/dashboard','/saved'])await check('GET '+route,route,undefined,200);
for(const [name,body,status] of [['valid signed-out request',{expertId:'00000000-0000-4000-8000-000000000011',question:'How can I build a business?'},401],['invalid expert identifier',{expertId:'wrong',question:'How can I build a business?'},400],['empty question',{expertId:'00000000-0000-4000-8000-000000000011',question:''},400],['overlong question',{expertId:'00000000-0000-4000-8000-000000000011',question:'x'.repeat(1201)},400]])await check(name,'/api/ask',{method:'POST',headers,body:JSON.stringify(body)},status);
await check('cross-origin rejected','/api/ask',{method:'POST',headers:{...headers,Origin:'https://other.example'},body:'{}'},400);
await check('malformed JSON rejected','/api/ask',{method:'POST',headers,body:'{'},400);
await check('body above32KiB rejected','/api/ask',{method:'POST',headers,body:'x'.repeat(40000)},400);
const timings=[];for(let i=0;i<10;i++){const t=performance.now();await(await fetch(base+'/')).text();timings.push(Math.round(performance.now()-t));}timings.sort((a,b)=>a-b);
const result={date:'2026-10-31',mode:'production live configuration, unauthenticated HTTP requests',base,node:process.version,platform:process.platform,tests,passed:tests.filter(t=>t.pass).length,total:tests.length,performance:{route:'/',samples:10,medianMs:(timings[4]+timings[5])/2,p95Ms:timings[9],minMs:timings[0],maxMs:timings[9],note:'Sequential local HTTP round trips; not browser rendering, AI latency or load testing.'}};
fs.writeFileSync('docs/final-product/evidence/http-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(tests.some(t=>!t.pass))process.exitCode=1;
