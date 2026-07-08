import { readFileSync } from "node:fs";
import { chromium } from "playwright";
const shots="/private/tmp/claude-501/-Users-miguelangelo-Projetos-cardapio-web/2209407d-aab9-442c-aae4-5ab50f5b8917/scratchpad";
const fixture=JSON.parse(readFileSync(`${shots}/orders-hdr-fixture.json`,"utf8"));
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:375,height:800},deviceScaleFactor:2});
await page.addInitScript((a)=>window.localStorage.setItem("fast-burguer-store-auth",JSON.stringify(a)),{token:fixture.token,storeUser:fixture.storeUser});
await page.goto("http://localhost:5202/loja/pedidos");
await page.waitForTimeout(2500);
const report=await page.evaluate(()=>{
  const over=[];
  for(const el of document.querySelectorAll("main *")){const r=el.getBoundingClientRect();if(r.right>window.innerWidth+0.5)over.push(`${el.tagName}.${String(el.className).split(' ').slice(0,3).join(' ')} right=${Math.round(r.right)} w=${Math.round(r.width)}`);}
  return {innerWidth:window.innerWidth, docScroll:document.documentElement.scrollWidth, over:over.slice(0,10)};
});
console.log(JSON.stringify(report,null,1));
await page.screenshot({path:`${shots}/orders-before.png`, fullPage:true});
await browser.close();
