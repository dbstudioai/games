'use strict';
(() => {
 const canvas=document.querySelector('#aquarium'),ctx=canvas.getContext('2d');
 const el=id=>document.getElementById(id), KEY='sektor-drei-highscores-v1';
 const types=[{name:'Goldflosser',color:'#e7b65f',fin:'#bd8341',speed:60,points:10,shape:0},{name:'Korallenfisch',color:'#ef8876',fin:'#be5b58',speed:115,points:25,shape:1},{name:'Silberpfeil',color:'#b9a8ed',fin:'#8275b8',speed:195,points:50,shape:2}];
 let w=1000,h=500,fishes=[],pops=[],phase='idle',score=0,hits=0,endAt=0,last=0,spawnClock=0,records=[],storageOK=true;
 try{const parsed=JSON.parse(localStorage.getItem(KEY)||'[]');records=Array.isArray(parsed)?parsed.filter(x=>Number.isFinite(x.score)&&x.score>=0&&typeof x.date==='string').sort((a,b)=>b.score-a.score).slice(0,5):[];}catch{storageOK=false}
 el('best').textContent=records[0]?.score||0;
 function resize(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0)}
 new ResizeObserver(resize).observe(canvas);resize();
 function spawn(initial=false){const type=types[Math.floor(Math.random()*types.length)],s=type.shape===2?0.87:1;fishes.push({type,x:initial?Math.random()*w:-110,y:65+Math.random()*Math.max(30,h-140),baseY:0,size:s*(w<600?0.76:1),speed:type.speed*(w<600?.75:1)*(0.9+Math.random()*.2),seed:Math.random()*20,stopUntil:0});}
 for(let i=0;i<9;i++)spawn(true);
 function start(){phase='playing';score=0;hits=0;pops=[];fishes=[];for(let i=0;i<8;i++)spawn(true);spawnClock=0;endAt=performance.now()+60000;el('score').textContent=0;el('time').textContent='01:00';el('overlay').classList.add('hidden');el('time').classList.remove('urgent');el('progress').style.width='100%';}
 function finish(){if(phase!=='playing')return;phase='finished';const record=score>(records[0]?.score||0);records.push({score,date:new Date().toISOString()});records.sort((a,b)=>b.score-a.score);records=records.slice(0,5);try{localStorage.setItem(KEY,JSON.stringify(records))}catch{storageOK=false}el('best').textContent=records[0]?.score||0;el('final-score').textContent=score;el('hits').textContent=hits;el('result-label').textContent=record?'NEUER PERSÖNLICHER REKORD':'RUNDE BEENDET';el('highscores').replaceChildren(...records.map((r,i)=>{const li=document.createElement('li'),label=document.createElement('span'),value=document.createElement('b');label.textContent=`${i+1}.  ${new Date(r.date).toLocaleDateString('de-CH')} · ${new Date(r.date).toLocaleTimeString('de-CH',{hour:'2-digit',minute:'2-digit'})}`;value.textContent=`${r.score} Punkte`;li.append(label,value);return li}));el('save-note').textContent=storageOK?'Deine fünf besten Runden werden auf diesem Gerät gespeichert.':'Speichern ist im Browser gesperrt. Die Liste bleibt für diese Sitzung erhalten.';el('start-panel').classList.add('hidden');el('end-panel').classList.remove('hidden');el('overlay').classList.remove('hidden');el('restart').focus();}
 el('start').onclick=start;el('restart').onclick=start;
 function catchAt(x,y,now){if(phase!=='playing')return false;if(now>=endAt){finish();return false}for(let i=fishes.length-1;i>=0;i--){const f=fishes[i];if(now<f.stopUntil)continue;const dx=(x-f.x)/(62*f.size),dy=(y-f.y)/(35*f.size);if(dx*dx+dy*dy<1){f.stopUntil=now+1050;score+=f.type.points;hits++;el('score').textContent=score;pops.push({x:f.x,y:f.y-28,text:'+'+f.type.points,until:now+1000});return true}}return false}
 canvas.addEventListener('pointerdown',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();catchAt(e.clientX-r.left,e.clientY-r.top,performance.now())});
 function path(fill,draw,stroke){ctx.beginPath();draw();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.3;ctx.stroke()}}
 function fish(f,now){const t=f.type,stopped=now<f.stopUntil;ctx.save();ctx.translate(f.x,f.y);ctx.scale(f.size,f.size);if(stopped)ctx.rotate(Math.sin(now*.027)*.1);const tail=Math.sin(now*.009+f.seed)*4;
  path(t.fin,()=>{ctx.moveTo(-31,0);ctx.lineTo(-66,-25+tail);ctx.quadraticCurveTo(-60,0,-66,25+tail);ctx.closePath()},'#143f4d66');
  path(t.fin,()=>{ctx.moveTo(-15,-20);ctx.lineTo(0,-41);ctx.lineTo(24,-20);ctx.moveTo(-10,20);ctx.lineTo(9,36);ctx.lineTo(26,17)},'#143f4d66');
  path(t.color,()=>{ctx.ellipse(0,0,t.shape===2?49:43,t.shape===1?29:23,0,0,Math.PI*2)},'#14455388');
  ctx.save();ctx.beginPath();ctx.ellipse(0,0,t.shape===2?49:43,t.shape===1?29:23,0,0,Math.PI*2);ctx.clip();ctx.fillStyle=t.shape===0?'#fff2ce99':'#f6e9d0bb';if(t.shape===2){ctx.fillRect(-44,-3,82,6)}else{for(let x=-20;x<=10;x+=20){ctx.save();ctx.translate(x,0);ctx.rotate(-.13);ctx.fillRect(-5,-35,9,70);ctx.restore()}}ctx.restore();
  path(t.fin,()=>{ctx.moveTo(0,2);ctx.quadraticCurveTo(8,stopped?31:18,22,7);ctx.lineTo(8,-3)});
  ctx.strokeStyle='#24526666';ctx.beginPath();ctx.arc(21,0,13,Math.PI*.7,Math.PI*1.3);ctx.stroke();ctx.fillStyle='#143b43';ctx.beginPath();ctx.arc(t.shape===2?34:29,-7,2.5,0,7);ctx.fill();ctx.strokeStyle='#34575a';ctx.beginPath();ctx.moveTo(t.shape===2?44:38,5);ctx.lineTo(t.shape===2?49:43,3);ctx.stroke();
  if(stopped){ctx.strokeStyle='#d8f5d5aa';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,61,40,0,0,7);ctx.stroke()}ctx.restore();
 }
 function background(now){const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#39bdc1');g.addColorStop(.48,'#138c9d');g.addColorStop(1,'#125269');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.save();ctx.globalAlpha=.08;for(let i=0;i<6;i++){ctx.fillStyle='#d4fff2';ctx.beginPath();ctx.moveTo(w*(i*.22)-80,0);ctx.lineTo(w*(i*.22)+10,0);ctx.lineTo(w*(i*.22)+260,h);ctx.lineTo(w*(i*.22)+130,h);ctx.fill()}ctx.restore();
  for(let i=0;i<25;i++){let bx=((i*173)%997)/997*w,by=h-((now*.012+i*51)%(h+30));ctx.strokeStyle='#a6e5df24';ctx.lineWidth=1;ctx.beginPath();ctx.arc(bx,by,2+i%4,0,7);ctx.stroke()}
  path('#165b66',()=>{ctx.moveTo(0,h);ctx.quadraticCurveTo(w*.25,h-48,w*.48,h-15);ctx.quadraticCurveTo(w*.8,h-38,w,h-8);ctx.lineTo(w,h);ctx.closePath()});
  for(let side of [0,1])for(let i=0;i<8;i++){const x=side?w-16-i*17:10+i*18;ctx.strokeStyle=i%2?'#286f70':'#1b6268';ctx.lineWidth=5+i%3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,h);ctx.bezierCurveTo(x-27,h-40,x+26,h-85,x+Math.sin(now*.0006+i)*8,h-90-(i%4)*24);ctx.stroke()}
  for(let i=0;i<11;i++){ctx.fillStyle=i%2?'#367777':'#29666e';ctx.beginPath();ctx.ellipse((i*113+34)%w,h-6,20+i%3*9,8+i%4*4,0,0,7);ctx.fill()}
 }
 function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;background(now);if(phase==='playing'){const remain=Math.max(0,endAt-now);const seconds=Math.ceil(remain/1000);el('time').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');el('progress').style.width=(remain/600)+'%';el('time').classList.toggle('urgent',remain<=10000);if(remain===0)finish();}spawnClock+=dt;if(spawnClock>.85&&fishes.length<16){spawn();spawnClock=0}for(const f of fishes){if(now>=f.stopUntil)f.x+=f.speed*dt;f.y+=Math.sin(now*.0015+f.seed)*.12;f.y=Math.max(45,Math.min(h-50,f.y));fish(f,now)}fishes=fishes.filter(f=>f.x<w+120);pops=pops.filter(p=>p.until>now);for(const p of pops){const k=(p.until-now)/1000;ctx.save();ctx.globalAlpha=k;ctx.font='bold 21px Arial';ctx.textAlign='center';ctx.fillStyle='#efffce';ctx.fillText(p.text,p.x,p.y-(1-k)*35);ctx.restore()}requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();

