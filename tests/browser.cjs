// Requires Playwright and Microsoft Edge. All external services are mocked.
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    const page=await browser.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{
      const member=(id,name,email,team='geral')=>({id,name,username:name,password:'test',email,team,isAdmin:id==='a',color:'#1a8fff',avatar:'AB',role:'Membro',pts:0,hours:0,skills:[],metrics:{}});
      const store={gaia_v7:{members:[member('a','Admin','admin@example.com','adm'),member('b','Membro Geral','','geral'),member('c','Falha','fail@example.com'),member('d','Duplicado','ADMIN@example.com')],emailConfig:{serviceId:'fake',templateId:'fake',publicKey:'fake',configured:true}}};
      const read=p=>p.split('/').reduce((o,k)=>o?.[k],store)??null;
      const write=(p,v)=>{const keys=p.split('/');let o=store;for(const k of keys.slice(0,-1))o=o[k]??={};o[keys.at(-1)]=v;};
      const ref=p=>({
        child:k=>ref(p+'/'+k), on:(ev,fn)=>setTimeout(()=>fn({val:()=>read(p)}),1),
        once:async(ev,fn)=>{const snap={val:()=>read(p)};if(fn)fn(snap);return snap;},
        set:async v=>write(p,v),update:async v=>write(p,{...read(p),...v}),
        onDisconnect:()=>({update:()=>{}}),
        transaction:async fn=>{const value=fn(read(p));if(value!==undefined)write(p,value);return {committed:value!==undefined,snapshot:{val:()=>read(p)}};}
      });
      window.firebase={initializeApp:()=>({}),database:()=>({ref})};
      window.emailCalls=[];
      window.emailjs={send:async(s,t,p)=>{emailCalls.push({...p,time:Date.now()});if(p.to_email==='fail@example.com')throw {status:400,text:'Simulated provider rejection'};return {status:200};}};
    });
    await page.route('**/*',route=>{
      const url=new URL(route.request().url());
      if(url.hostname==='gaia.test'){
        const filename=url.pathname==='/email-queue.js'?'email-queue.js':'index.html';
        return route.fulfill({contentType:filename.endsWith('.js')?'application/javascript':'text/html',body:fs.readFileSync(path.join(__dirname,'..',filename))});
      }
      return route.fulfill({body:'',contentType:'application/javascript'});
    });
    await page.goto('https://gaia.test');
    await page.waitForFunction(()=>typeof M!=='undefined'&&M.length===4);
    await page.fill('#li-user','Admin');await page.fill('#li-pass','test');
    await page.evaluate(()=>doLogin());
    assert.match(await page.locator('#home-stats').innerText(),/4/);
    await page.evaluate(()=>goPage('members'));
    await page.locator('#pg-members .tab').filter({hasText:/^Geral$/}).click();
    assert.equal(await page.locator('#members-list .mc').count(),3);
    await page.evaluate(()=>openEditUser('b'));
    assert.equal(await page.locator('#mu-team').inputValue(),'geral');
    await page.fill('#mu-email','invalid');await page.evaluate(()=>saveUser());
    assert.equal(await page.evaluate(()=>M.find(m=>m.id==='b').email),'');
    await page.evaluate(()=>closeModal('modal-user'));
    await page.evaluate(()=>goPage('emailcfg'));
    assert.match(await page.locator('#emailcfg-content').innerText(),/3 de 4 membros/);
    const report=await page.evaluate(()=>sendEmails(M,{notice_title:'Teste de integração',notice_body:'Teste',notice_type:'Teste'},'test-notice'));
    assert.deepEqual([report.sent,report.failed,report.missing,report.duplicate],[1,1,1,1]);
    const calls=await page.evaluate(()=>emailCalls);
    assert.equal(calls.length,2);assert.ok(calls[1].time-calls[0].time>=1100);
    await page.locator('#email-reports summary').click();
    assert.match(await page.locator('#email-reports').innerText(),/Simulated provider rejection/);
    const repeat=await page.evaluate(()=>sendEmails([M[0]],{notice_title:'Repeat'},'test-notice'));
    assert.equal(repeat.alreadySent,1);assert.equal(await page.evaluate(()=>emailCalls.length),2);
    await page.evaluate(()=>{
      el('no-title').value='Aviso';el('no-body').value='Mensagem';el('no-team').value='geral';el('no-email').checked=true;
    });
    await page.evaluate(()=>publishNotice());
    assert.equal(await page.evaluate(()=>NOT[0].emailSent),false);
    assert.equal(await page.evaluate(()=>NOT[0].emailReport.failed),1);
    assert.equal(await page.locator('#no-team option[value="geral"]').count(),1);
    assert.deepEqual(errors,[]);
    console.log('Browser checks passed: login, Geral, validation, batch reports, recipient deduplication, reminder receipts, notice failure status. No real email sent.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
