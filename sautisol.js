const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const store={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const grads=['#ff8a3d,#b44cff','#36d1dc,#5b86e5','#f857a6,#ff5858','#11998e,#38ef7d','#fc4a1a,#f7b733','#8e2de2,#4a00e0','#ee0979,#ff6a00','#00c6ff,#0072ff'];
const g=i=>`linear-gradient(135deg,${grads[i%grads.length]})`;

/* Router */
function route(){const h=(location.hash||'#home').slice(1);const id=['home','media','tickets','account'].includes(h)?h:'home';
  $$('.page').forEach(p=>p.classList.toggle('on',p.id===id));$$('#nav a').forEach(a=>a.classList.toggle('on',a.hash==='#'+id));scrollTo(0,0)}
addEventListener('hashchange',route);route();

/* Audio: 10 formats */
const T=[['Mawimbi','mp3','audio/mpeg'],['Usiku wa Moto','wav','audio/wav'],['Sauti Yangu','ogg','audio/ogg'],['Nyota','flac','audio/flac'],['Safari','aac','audio/aac'],['Pwani','m4a','audio/mp4'],['Upepo','opus','audio/ogg; codecs=opus'],['Jua','weba','audio/webm'],['Asante','aiff','audio/aiff'],['Kesho','mp4','audio/mp4']];
let cur=null,ctx=null;
const probe=document.createElement('audio');
$('#tracks').innerHTML=T.map((t,i)=>`<button class="card track" data-i="${i}"><span class="ic">▶</span><span><b>${t[0]}</b><small>.${t[1]} · ${probe.canPlayType(t[2])?'supported':'may not play here'}</small></span></button>`).join('');
function stopAll(){if(cur){cur.stop();cur=null}$$('.track').forEach(b=>{b.classList.remove('on');b.querySelector('.ic').textContent='▶'})}
function demoTone(i){ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();const sc=[0,2,4,7,9,12,9,7,4,2],base=196*Math.pow(2,(i%5)/12*2);let stopped=false,tm=[];
  sc.forEach((s,k)=>{const o=ctx.createOscillator(),gn=ctx.createGain(),t=ctx.currentTime+k*.45;o.type=['sine','triangle','sawtooth','square','triangle'][i%5];o.frequency.value=base*Math.pow(2,s/12);gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(.2,t+.05);gn.gain.exponentialRampToValueAtTime(.0001,t+.42);o.connect(gn).connect(ctx.destination);o.start(t);o.stop(t+.45);tm.push(o)});
  return{stop(){tm.forEach(o=>{try{o.stop()}catch(e){}})}}}
function play(i,btn){stopAll();btn.classList.add('on');btn.querySelector('.ic').textContent='■';
  const a=new Audio(`audio/sautisol-${i+1}.${T[i][1]}`);
  const fb=()=>{if(cur&&cur.a===a){cur=demoTone(i);setTimeout(()=>{if(btn.classList.contains('on'))stopAll()},4600)}};
  cur={a,stop(){a.pause()}};a.onended=stopAll;a.onerror=fb;a.play().catch(fb)}
$('#tracks').addEventListener('click',e=>{const b=e.target.closest('.track');if(!b)return;b.classList.contains('on')?stopAll():play(+b.dataset.i,b)});

/* Recorder */
const mimes=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4','audio/webm','audio/ogg'].filter(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m));
$('#fmt').innerHTML=mimes.length?mimes.map(m=>`<option value="${m}">${m.split('/')[1].replace(';codecs=',' / ')}</option>`).join(''):'<option>Recording not supported in this browser</option>';
let mr,chunks,tick,t0,stream;
const fmt2=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
$('#recBtn').onclick=async()=>{
  if(!mimes.length)return $('#recState').textContent='Recording is not supported in this browser.';
  try{stream=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){return $('#recState').textContent='Microphone access was blocked. Allow it and try again.'}
  const type=$('#fmt').value;chunks=[];mr=new MediaRecorder(stream,{mimeType:type});
  mr.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  mr.onstop=()=>{clearInterval(tick);stream.getTracks().forEach(t=>t.stop());const blob=new Blob(chunks,{type}),url=URL.createObjectURL(blob),ext=type.includes('mp4')?'m4a':type.includes('ogg')?'ogg':'webm',secs=Math.round((Date.now()-t0)/1000);
    $('#recOut').innerHTML=`<b>Recording (${fmt2(secs)})</b><audio controls src="${url}"></audio><p><a class="btn ghost" download="sautisol-recording.${ext}" href="${url}">Download .${ext}</a></p>`;
    $('#recState').textContent=secs>=60?'Saved — nice, over a minute!':'Saved.';$('#recBtn').disabled=false;$('#stopBtn').disabled=true};
  mr.start(1000);t0=Date.now();$('#recBtn').disabled=true;$('#stopBtn').disabled=false;$('#recState').innerHTML='<span class="dot"></span>Recording…';
  tick=setInterval(()=>$('#timer').textContent=fmt2(Math.floor((Date.now()-t0)/1000)),250)};
$('#stopBtn').onclick=()=>mr&&mr.state!=='inactive'&&mr.stop();

/* Gallery, posters */
const gl=['Live at the Coast','Backstage','Studio Sessions','Crowd Energy','Festival Night','Rehearsal','Acoustic Set','Album Shoot'];
$('#gallery').innerHTML=gl.map((n,i)=>`<button class="g" style="background:${g(i)}" data-i="${i}">${n}</button>`).join('');
$('#gallery').onclick=e=>{const b=e.target.closest('.g');if(!b)return;$('#lbi').style.background=g(+b.dataset.i);$('#lbi').textContent=b.textContent;$('#lb').classList.add('on')};
$('#lb').onclick=()=>$('#lb').classList.remove('on');
const EV=[['Sautisol Live — Nairobi','Sat 14 Nov 2026','Uhuru Gardens',[['Regular',1500],['VIP',4000],['VVIP',8000]]],['Coast Sunset Sessions','Sat 5 Dec 2026','Mombasa Beachfront',[['Regular',1200],['VIP',3500],['VVIP',7000]]],['Homecoming Night — Meru','Sun 27 Dec 2026','Meru Stadium',[['Regular',1000],['VIP',3000],['VVIP',6000]]]];
$('#posters').innerHTML=EV.map((e,i)=>`<div class="poster" style="background:${g(i*2)}"><div><small>SAUTISOL PRESENTS</small><br><b>${e[0]}</b></div><div><p>${e[1]}<br>${e[2]}</p><a class="btn" href="#tickets" data-ev="${i}">Buy tickets</a></div></div>`).join('');
$('#posters').onclick=e=>{const a=e.target.closest('[data-ev]');if(a){$('#ev').value=a.dataset.ev;renderTiers()}};
