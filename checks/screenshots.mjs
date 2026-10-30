import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const base = process.env.BASE_URL || 'http://localhost:5173';
const output = 'docs/screenshots';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1050},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1200);
await page.addStyleTag({content:'html{scroll-behavior:auto!important}*{scroll-behavior:auto!important}'});
async function shot(name,selector){const el=page.locator(selector);await el.scrollIntoViewIfNeeded();await page.waitForTimeout(500);await el.screenshot({path:`${output}/${name}.png`,animations:'disabled',timeout:15000});console.log(name);}
await shot('01-hero','.hero');
await shot('02-memory-machine','#memory-room');
await page.getByRole('button',{name:'Let’s get a little lost'}).click();
await shot('03-retro-browser','#memory-room');
for(const [name,label,id] of [['04-music-player','My music','music'],['05-future-letter','Dear future me','notes'],['06-guestbook','Guestbook','guestbook'],['07-recycle-bin','Recycle bin','trash']]){
 await page.locator('.desktop-icons').getByRole('button',{name:label,exact:false}).click();
 if(id==='music')await page.getByRole('button',{name:'Play or pause visualization'}).click();
 if(id==='guestbook'){await page.getByRole('textbox',{name:'Guestbook message'}).fill('I remember when every homepage felt like a little secret.');await page.getByRole('button',{name:'Leave your mark'}).click();}
 await shot(name,'#memory-room');
 await page.locator('.window-'+id).getByRole('button',{name:'Close window'}).click();
}
await page.locator('#collection').scrollIntoViewIfNeeded();await page.waitForTimeout(900);
await shot('08-collection','#collection');
await page.getByRole('button',{name:'CABINET VIEW',exact:false}).click();await page.waitForTimeout(700);await shot('09-cabinet-view','#collection');
await page.getByRole('button',{name:'GRID VIEW',exact:false}).click();await page.locator('.artifact-card').first().click();await page.waitForTimeout(500);await shot('10-artifact-detail','.artifact-modal');await page.keyboard.press('Escape');
await page.locator('#graveyard').evaluate(el=>window.scrollTo(0,el.offsetTop));await page.waitForTimeout(700);await page.locator('.memorial').first().getByRole('button').click();await shot('11-digital-afterlife','.graveyard-sticky');
await shot('12-timeline','#timeline');await shot('13-archivist-note','#about');
await page.getByRole('button',{name:'Open archive terminal'}).click();await page.getByRole('textbox',{name:'Terminal command'}).fill('help');await page.getByRole('textbox',{name:'Terminal command'}).press('Enter');await page.waitForTimeout(300);await shot('14-terminal','.archive-terminal');await page.keyboard.press('Escape');
await page.setViewportSize({width:390,height:844});await page.goto(base);await page.waitForTimeout(1000);await page.addStyleTag({content:'html,*{scroll-behavior:auto!important}'});
await shot('15-mobile-hero','.hero');await shot('16-mobile-memory-machine','#memory-room');await shot('17-mobile-collection','#collection');await shot('18-mobile-timeline','#timeline');
console.log(JSON.stringify({pageErrors:errors,mobileOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}));await browser.close();
