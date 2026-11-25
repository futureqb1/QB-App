const $=s=>document.querySelector(s),esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const KEY="qb-v1",uid=()=>Math.random().toString(36).slice(2,9);
const dl=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toISOString().slice(0,10)};
const pct=(h,a)=>a?Math.round(h/a*100):0,drill=id=>DRILLS.find(d=>d.id==id);
const plans=()=>PLANS.concat(S.custom),est=ids=>ids.reduce((a,i)=>a+drill(i).min,0);
let S=null;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
let charts=[],post=null,W=null,tick=null,range=30,fil={q:"",c:"",d:"",f:0};
const icons=()=>window.lucide&&lucide.createIcons();
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("on");setTimeout(()=>t.classList.remove("on"),1800)};
const opts=a=>a.map(x=>`<option>${x}</option>`).join("");
const fmt=d=>new Date(d+"T12:00").toLocaleDateString(undefined,{month:"short",day:"numeric"});

function seed(p){return{profile:p,history:[{id:uid(),date:dl(4),name:"Beginner QB Fundamentals",mins:28,drills:6,rating:4,focus:"Mechanics",sample:1},{id:uid(),date:dl(2),name:"Accuracy Development",mins:32,drills:6,rating:4,focus:"Accuracy",sample:1}],
throws:[[6,"5-10 yd","Hoop",20,12],[4,"5-10 yd","Hoop",20,14],[2,"10-20 yd","Window",18,9],[1,"10-20 yd","Window",20,12]].map(a=>({id:uid(),date:dl(a[0]),type:"Short accuracy",dist:a[1],target:a[2],attempts:a[3],hits:a[4],before:4,after:4,notes:"",sample:1})),
prs:[{id:uid(),name:"Hoop accuracy (5-10 yd)",value:70,unit:"%",date:dl(4),notes:"",sample:1}],
goals:[{id:uid(),title:"Hit 80% at 10-20 yards",desc:"",start:45,target:80,cur:60,due:dl(-60),sample:1}],
favs:[],draft:[],custom:[],recent:[],theme:"dark",sample:1}}

/* ---------- Onboarding ---------- */
const GOALS=["Improve throwing accuracy","Improve throwing mechanics","Improve footwork","Improve pocket movement","Improve decision-making","Improve arm strength safely","Improve mobility","Improve football IQ","Prepare for upcoming season"];
const EQ=["Football","Cones","Agility ladder","Resistance bands","Target or net","Field access"];
function onboard(){return`<div class="ob"><div class="logo">Q<b>B</b></div><h1>Build your development plan</h1><p class="mut">Takes a minute. No sensitive info needed. Everything stays on this device.</p>
<form class="card" data-f="onb"><label>Name or nickname<input name="name" required maxlength="30"></label>
<div class="row"><label>Age group<select name="age">${opts(["Youth (under 14)","High school (14-18)","College / adult"])}</select></label><label>Experience<select name="exp">${opts(["Beginner","Intermediate","Advanced"])}</select></label></div>
<div class="row"><label>Current level<select name="lvl">${opts(["Youth league","Middle school","JV","Varsity","Other"])}</select></label><label>Training days per week<select name="days">${opts(["2","3","4"])}</select></label></div>
<h3>Development goals</h3>${GOALS.map(g=>`<div class="chk"><input type="checkbox" name="g" value="${g}">${g}</div>`).join("")}
<h3 style="margin-top:16px">Equipment</h3>${EQ.map(g=>`<div class="chk"><input type="checkbox" name="e" value="${g}">${g}</div>`).join("")}
<h3 style="margin-top:16px">Support</h3><div class="chk"><input type="checkbox" name="partner">I have a throwing partner</div><div class="chk"><input type="checkbox" name="coach">I have access to a coach</div>
<label style="margin-top:12px">Position situation / goals<textarea name="sit" rows="2" placeholder="e.g. Competing for the starting job next season"></textarea></label>
<div class="note" style="margin-bottom:14px">${SAFETY[0]}</div><button class="btn">Create my dashboard</button></form></div>`}

/* ---------- Views ---------- */
const NAV=[["dash","Dashboard","layout-dashboard"],["train","Training","dumbbell"],["drills","Drills","book-open"],["throw","Throwing","target"],["prog","Progress","trending-up"],["me","Profile","user"]];
const streak=()=>{const s=new Set(S.history.map(x=>x.date));let n=0,i=s.has(dl(0))?0:1;while(s.has(dl(i))){n++;i++}return n};
const lastAcc=()=>{const t=S.throws.slice().sort((a,b)=>a.date<b.date?-1:1).pop();return t?pct(t.hits,t.attempts)+"%":"—"};
const empty=m=>`<div class="empty">${m}</div>`;

function vDash(){const p=S.profile,h=S.history,pl=plans()[h.length%plans().length],mins=h.reduce((a,x)=>a+x.mins,0),ds=new Set(h.map(x=>x.date));
const wk=[...Array(7)].map((_,i)=>{const d=dl(6-i),n=new Date(d+"T12:00").toLocaleDateString(undefined,{weekday:"short"});return`<div class="${ds.has(d)?"done":""} ${i==6?"tod":""}">${n}<br>${ds.has(d)?"✓":i==6?"Today":"·"}</div>`}).join("");
const act=[...h.map(x=>({d:x.date,t:`Completed ${x.name}`,s:`${x.mins} min · ${x.drills} drills`})),...S.throws.map(x=>({d:x.date,t:`Throwing: ${x.type}`,s:`${x.hits}/${x.attempts} (${pct(x.hits,x.attempts)}%)`}))].sort((a,b)=>a.d<b.d?1:-1).slice(0,5);
const done=S.goals.length?Math.round(S.goals.reduce((a,g)=>a+gp(g),0)/S.goals.length)+"%":"—";
return`<div class="hd"><h1>Welcome back, ${esc(p.name)}</h1><p class="mut">${esc(p.exp)} · ${esc(p.lvl)} · Quality reps beat more reps.</p></div>
<div class="grid g2"><div class="card"><span class="badge r">Today</span><h2>${esc(pl.name)}</h2><p class="mut sm">${pl.drills.length} drills · ${est(pl.drills)} min · Focus: ${esc(pl.focus||"Custom")}</p><button class="btn" data-a="start" data-v="${pl.id}"><i data-lucide="play"></i>Start training</button></div>
<div class="card"><h2>This week</h2><div class="week">${wk}</div><p class="mut sm" style="margin:10px 0 0">Aim for ${esc(p.days)} sessions with rest days between throwing days.</p></div></div>
<div class="grid g4" style="margin:14px 0">${[[h.length,"Sessions"],[streak()+" d","Streak"],[mins+" min","Training time"],[lastAcc(),"Latest accuracy"],[done,"Goal progress"],[S.prs.length,"Records"]].map(s=>`<div class="card stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("")}</div>
<div class="grid g2"><div class="card"><h2>Recent activity</h2><div class="list">${act.length?act.map(a=>`<div><span>${esc(a.t)}<br><span class="mut sm">${esc(a.s)}</span></span><span class="mut sm">${fmt(a.d)}</span></div>`).join(""):empty("No activity yet. Start a workout to begin.")}</div></div>
<div class="card"><h2>Quick actions</h2><div class="row"><a class="btn s" href="#throw"><i data-lucide="target"></i>Log throwing</a><a class="btn s" href="#prog"><i data-lucide="trophy"></i>Add record</a><a class="btn s" href="#drills"><i data-lucide="book-open"></i>Drills</a></div><div class="note" style="margin-top:14px">${SAFETY[0]}</div></div></div>`}

function vTrain(){const cards=plans().map(p=>`<div class="card"><span class="badge">${p.diff||"Custom"}</span><h2>${esc(p.name)}</h2><p class="mut sm">${esc(p.desc||"Custom workout")}</p><p class="sm">${p.drills.length} drills · ${est(p.drills)} min</p><div class="row"><button class="btn sm" data-a="start" data-v="${p.id}"><i data-lucide="play"></i>Start</button>${p.id[0]=="c"?`<button class="btn s sm" data-a="delplan" data-v="${p.id}">Delete</button>`:`<button class="btn s sm" data-a="dup" data-v="${p.id}">Copy to builder</button>`}</div></div>`).join("");
return`<div class="hd"><h1>Training</h1><p class="mut">Choose a plan or build your own from the Drill Library.</p></div><div class="grid g2">${cards}</div>
<div class="card" style="margin-top:14px"><h2>Workout builder</h2>${S.draft.length?`<div class="list">${S.draft.map((id,i)=>`<div><span>${i+1}. ${esc(drill(id).n)} <span class="mut sm">· ${drill(id).reps}</span></span><span><button class="btn s sm" data-a="mv" data-v="${i}">↑</button> <button class="btn s sm" data-a="rm" data-v="${i}">Remove</button></span></div>`).join("")}</div>
<form class="row" data-f="saveplan" style="margin-top:12px"><input name="name" placeholder="Workout name" required><button class="btn">Save workout</button></form>`:empty("Empty. Open a drill and tap Add to workout.")}</div>`}

function drillList(){const q=fil.q.toLowerCase(),r=DRILLS.filter(d=>(!q||(d.n+d.desc).toLowerCase().includes(q))&&(!fil.c||d.c==fil.c)&&(!fil.d||d.d==fil.d)&&(!fil.f||S.favs.includes(d.id)));
return r.length?r.map(d=>`<div class="card drill" data-a="open" data-v="${d.id}"><span class="badge">${d.c}</span><span class="badge ${d.d=="Beginner"?"g":""}">${d.d}</span>${S.favs.includes(d.id)?'<span class="badge r">Favorite</span>':""}<h3 style="margin-top:8px">${esc(d.n)}</h3><p class="mut sm" style="margin:0">${esc(d.desc)}</p></div>`).join(""):empty("No drills match your filters.")}
function vDrills(){const rc=S.recent.slice(0,5).map(drill).filter(Boolean);
return`<div class="hd"><h1>Drill Library</h1><p class="mut">${DRILLS.length} quarterback drills. Tap one for full instructions.</p></div>
<div class="row" style="margin-bottom:14px"><input id="q" placeholder="Search drills" value="${esc(fil.q)}"><select id="fc"><option value="">All categories</option>${CATS.map(c=>`<option ${fil.c==c?"selected":""}>${c}</option>`).join("")}</select><select id="fd"><option value="">All levels</option>${["Beginner","Intermediate","Advanced"].map(c=>`<option ${fil.d==c?"selected":""}>${c}</option>`).join("")}</select><button class="btn s" data-a="favf">${fil.f?"Showing favorites":"Favorites only"}</button></div>
${rc.length?`<p class="mut sm">Recently completed: ${rc.map(d=>esc(d.n)).join(", ")}</p>`:""}<div class="grid g2" id="dl">${drillList()}</div>`}

const THR=["Warm-up","Mechanics","Short accuracy","Intermediate accuracy","Deep accuracy","Movement throws","Situational"];
function group(k){const m={};S.throws.forEach(t=>{m[t[k]]=m[t[k]]||[0,0];m[t[k]][0]+=t.hits;m[t[k]][1]+=t.attempts});return Object.entries(m)}
function vThrow(){const ts=S.throws.slice().sort((a,b)=>a.date<b.date?1:-1);
post=()=>{const a=ts.slice().reverse();if(a.length)mk("c1","line",a.map(t=>fmt(t.date)),a.map(t=>pct(t.hits,t.attempts)),"Accuracy %")};
const tb=k=>`<table><tr><th>${k=="dist"?"Distance":"Target"}</th><th>Hits</th><th>Accuracy</th></tr>${group(k).map(([n,v])=>`<tr><td>${esc(n)}</td><td>${v[0]}/${v[1]}</td><td>${pct(v[0],v[1])}%</td></tr>`).join("")}</table>`;
return`<div class="hd"><h1>Throwing Development</h1><p class="mut">Log sessions and track accuracy. Quality over volume.</p></div>
<div class="note" style="margin-bottom:14px">Stop throwing if you feel shoulder or elbow pain, and talk to a coach, parent or healthcare professional. Keep volume modest.</div>
<div class="grid g2"><form class="card" data-f="throw"><h2>Log a session</h2><div class="row"><label>Date<input type="date" name="date" value="${dl(0)}" required></label><label>Type<select name="type">${opts(THR)}</select></label></div>
<div class="row"><label>Distance<select name="dist">${opts(["5-10 yd","10-20 yd","20+ yd"])}</select></label><label>Target<select name="target">${opts(["Hoop","Window","Receiver","Cone"])}</select></label></div>
<div class="row"><label>Attempts<input type="number" name="attempts" min="1" max="100" required></label><label>Hits<input type="number" name="hits" min="0" required></label></div>
<div class="row"><label>Arm feel before (1-5)<select name="before">${opts([5,4,3,2,1])}</select></label><label>Arm feel after (1-5)<select name="after">${opts([5,4,3,2,1])}</select></label></div>
<label>Partner or coach<input name="partner"></label><label>Notes<textarea name="notes" rows="2"></textarea></label><button class="btn">Save session</button></form>
<div class="card"><h2>Accuracy trend</h2>${ts.length?'<canvas id="c1"></canvas>':empty("Log a session to see your trend.")}</div></div>
<div class="grid g2" style="margin-top:14px"><div class="card"><h2>By distance</h2>${ts.length?tb("dist"):empty("No data yet.")}</div><div class="card"><h2>By target type</h2>${ts.length?tb("target"):empty("No data yet.")}</div></div>
<div class="card" style="margin-top:14px"><h2>Session history</h2><div class="list">${ts.length?ts.map(t=>`<div><span>${esc(t.type)} · ${esc(t.dist)} · ${esc(t.target)}<br><span class="mut sm">${fmt(t.date)} · ${t.hits}/${t.attempts} · arm ${t.before}→${t.after}${t.notes?" · "+esc(t.notes):""}</span></span><span><b>${pct(t.hits,t.attempts)}%</b> <button class="btn s sm" data-a="delt" data-v="${t.id}">✕</button></span></div>`).join(""):empty("No sessions logged.")}</div></div>`}

const gp=g=>g.target==g.start?0:Math.max(0,Math.min(100,Math.round((g.cur-g.start)/(g.target-g.start)*100)));
function vProg(){const from=range?dl(range):"0000",h=S.history.filter(x=>x.date>=from),t=S.throws.filter(x=>x.date>=from).sort((a,b)=>a.date<b.date?-1:1);
post=()=>{const m={};h.forEach(x=>m[x.date]=(m[x.date]||0)+x.mins);const k=Object.keys(m).sort();if(k.length)mk("c2","bar",k.map(fmt),k.map(x=>m[x]),"Minutes");if(t.length)mk("c3","line",t.map(x=>fmt(x.date)),t.map(x=>pct(x.hits,x.attempts)),"Accuracy %")};
const tot=t.reduce((a,x)=>[a[0]+x.hits,a[1]+x.attempts],[0,0]);
return`<div class="hd"><h1>Progress</h1><div class="row" style="margin-top:10px">${[[7,"7 days"],[30,"30 days"],[90,"90 days"],[0,"All time"]].map(r=>`<button class="btn ${range==r[0]?"":"s"} sm" data-a="range" data-v="${r[0]}">${r[1]}</button>`).join("")}</div></div>
<div class="grid g4"><div class="card stat"><b>${h.length}</b><span>Sessions</span></div><div class="card stat"><b>${h.reduce((a,x)=>a+x.mins,0)}</b><span>Minutes</span></div><div class="card stat"><b>${tot[1]?pct(tot[0],tot[1])+"%":"—"}</b><span>Accuracy</span></div><div class="card stat"><b>${h.length?(h.reduce((a,x)=>a+x.rating,0)/h.length).toFixed(1):"—"}</b><span>Avg rating</span></div></div>
<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Training volume</h2>${h.length?'<canvas id="c2"></canvas>':empty("No sessions in this range.")}</div><div class="card"><h2>Accuracy</h2>${t.length?'<canvas id="c3"></canvas>':empty("No throwing data in this range.")}</div></div>
<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Personal records</h2><form class="row" data-f="pr"><input name="name" placeholder="Record" required><input name="value" type="number" step="any" placeholder="Value" required style="max-width:90px"><input name="unit" placeholder="Unit" style="max-width:80px"><button class="btn">Add</button></form>
<div class="list">${S.prs.length?S.prs.map(r=>`<div><span>${esc(r.name)}<br><span class="mut sm">${fmt(r.date)}</span></span><span><b>${r.value} ${esc(r.unit)}</b> <button class="btn s sm" data-a="delpr" data-v="${r.id}">✕</button></span></div>`).join(""):empty("No records yet.")}</div></div>
<div class="card"><h2>Goals</h2><form data-f="goal"><input name="title" placeholder="Goal title, e.g. 80% at 10-20 yd" required style="margin-bottom:8px"><div class="row"><input name="start" type="number" step="any" placeholder="Start" required><input name="target" type="number" step="any" placeholder="Target" required><input name="due" type="date"></div><button class="btn sm" style="margin-top:8px">Add goal</button></form>
${S.goals.length?S.goals.map(g=>{const p=gp(g);return`<div style="margin-top:14px"><div class="row" style="justify-content:space-between"><b>${esc(g.title)}</b><span>${p>=100?'<span class="badge g">Goal reached</span>':p>=50?'<span class="badge r">Halfway</span>':""}${p}%</span></div><div class="bar"><i style="width:${p}%"></i></div><span class="mut sm">${g.start} → ${g.target} · now ${g.cur}${g.due?" · due "+fmt(g.due):""}</span> <button class="btn s sm" data-a="goalup" data-v="${g.id}">Update</button> <button class="btn s sm" data-a="delg" data-v="${g.id}">✕</button></div>`}).join(""):empty("Set a measurable goal.")}</div></div>`}

function vMe(){const p=S.profile;return`<div class="hd"><h1>Profile</h1><p class="mut">${esc(p.name)} · ${esc(p.age)} · ${esc(p.exp)}</p></div>
<div class="grid g2"><form class="card" data-f="prof"><h2>Edit profile</h2><label>Name<input name="name" value="${esc(p.name)}" required></label><div class="row"><label>Experience<select name="exp">${["Beginner","Intermediate","Advanced"].map(x=>`<option ${p.exp==x?"selected":""}>${x}</option>`).join("")}</select></label><label>Days per week<select name="days">${["2","3","4"].map(x=>`<option ${p.days==x?"selected":""}>${x}</option>`).join("")}</select></label></div><button class="btn">Save</button>
<p class="mut sm" style="margin-top:14px">Goals: ${p.goals.length?p.goals.map(esc).join(", "):"none selected"}<br>Equipment: ${p.eq.length?p.eq.map(esc).join(", "):"none listed"}<br>Partner: ${p.partner?"yes":"no"} · Coach: ${p.coach?"yes":"no"}</p></form>
<div class="card"><h2>Settings</h2><div class="row" style="margin-bottom:12px"><button class="btn s" data-a="theme">${S.theme=="dark"?"Switch to light mode":"Switch to dark mode"}</button><button class="btn s" data-a="export"><i data-lucide="download"></i>Export JSON</button></div>
<div class="row">${S.sample?'<button class="btn s" data-a="nosample">Remove sample data</button>':""}<button class="btn s" data-a="reset">Reset all data</button></div>
<h3 style="margin-top:18px">Favorite drills</h3>${S.favs.length?S.favs.map(i=>`<span class="badge">${esc(drill(i).n)}</span>`).join(""):'<span class="mut sm">None yet.</span>'}</div></div>
<div class="card" style="margin-top:14px"><h2>Safety &amp; training principles</h2><ul class="c">${SAFETY.map(s=>`<li>${s}</li>`).join("")}</ul></div>`}

/* ---------- Render ---------- */
function mk(id,type,labels,data,label){const c=document.getElementById(id);if(!c||!window.Chart)return;const v=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim(),tx=v("--tx"),mu=v("--mut");Chart.defaults.font.family="Fredoka,system-ui,sans-serif";charts.push(new Chart(c,{type,data:{labels,datasets:[{label,data,borderColor:tx,borderWidth:3,backgroundColor:type=="bar"?tx:tx+"1f",borderRadius:type=="bar"?10:0,pointBackgroundColor:tx,pointRadius:5,tension:.4,fill:type=="line"}]},options:{plugins:{legend:{display:false}},scales:{x:{ticks:{color:mu},grid:{display:false}},y:{beginAtZero:true,ticks:{color:mu},grid:{color:v("--line")}}}}}))}
function render(){charts.forEach(c=>c.destroy());charts=[];post=null;document.documentElement.dataset.theme=S?S.theme:"dark";
if(!S){$("#app").innerHTML=onboard();icons();return}
const r=location.hash.slice(1)||"dash",v={dash:vDash,train:vTrain,drills:vDrills,throw:vThrow,prog:vProg,me:vMe}[r]||vDash;
$("#app").innerHTML=`<aside><div class="logo">Q<b>B</b></div>${NAV.map(n=>`<a href="#${n[0]}" class="${n[0]==r?"on":""}"><i data-lucide="${n[2]}"></i><span>${n[1]}</span></a>`).join("")}</aside><main class="pg">${v()}</main>`;
icons();if(post)post();scrollTo(0,0)}
addEventListener("hashchange",render);

/* ---------- Drill detail ---------- */
function showDrill(id){const d=drill(id),m=$("#modal");m.hidden=false;m.innerHTML=`<div class="in"><button class="btn s sm" data-a="close">← Back</button><h1 style="margin-top:14px">${esc(d.n)}</h1><span class="badge">${d.c}</span><span class="badge">${d.d}</span><span class="badge">${d.reps}</span>
<p>${esc(d.desc)}</p><h3>Coaching cues</h3><ul class="c">${d.cues.map(c=>`<li>${esc(c)}</li>`).join("")}</ul><h3>Common mistake</h3><p class="mut">${esc(d.mist)}</p><h3>Easier variation</h3><p class="mut">${esc(d.ease)}</p><div class="note">${esc(d.safe)}</div>
<div class="row" style="margin-top:16px"><button class="btn s" data-a="fav" data-v="${d.id}">${S.favs.includes(d.id)?"Remove favorite":"Favorite"}</button><button class="btn s" data-a="add" data-v="${d.id}">Add to workout</button><button class="btn" data-a="mark" data-v="${d.id}">Mark completed</button></div></div>`}

/* ---------- Workout player ---------- */
const el=()=>W?Date.now()-W.t0-W.pt-(W.ps?Date.now()-W.ps:0):0,mmss=ms=>{const s=Math.floor(ms/1e3);return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")};
function startW(id){const p=plans().find(x=>x.id==id);if(!p||!p.drills.length)return;W={p,i:0,t0:Date.now(),pt:0,ps:0,res:[],ph:"d"};$("#player").hidden=false;rp();clearInterval(tick);tick=setInterval(()=>{const t=$("#tm");if(t)t.textContent=mmss(el())},500)}
function rp(){const w=W,n=w.p.drills.length,o=$("#player");
if(w.ph=="s"){const dn=w.res.filter(r=>r&&r.done).length;o.innerHTML=`<div class="in"><h1>Session summary</h1><div class="grid g4" style="margin:14px 0"><div class="card stat"><b>${mmss(el())}</b><span>Duration</span></div><div class="card stat"><b>${dn}/${n}</b><span>Drills completed</span></div><div class="card stat"><b>${esc(w.p.focus||"Custom")}</b><span>Focus</span></div></div>
<form data-f="fin"><label>Overall session rating<select name="rating">${opts([5,4,3,2,1])}</select></label><label>Reflection<textarea name="note" rows="3" placeholder="What went well? What will you work on next?"></textarea></label><div class="row"><button class="btn">Save to history</button><button type="button" class="btn s" data-a="quit">Discard</button></div></form></div>`;return}
const d=drill(w.p.drills[w.i]);
if(w.ph=="r"){o.innerHTML=`<div class="in"><h2>${esc(d.n)}: how did it go?</h2><form data-f="rate"><label>Performance (1-5)<select name="perf">${opts([5,4,3,2,1])}</select></label><label>Difficulty<select name="diff">${opts(["Too easy","About right","Too hard"])}</select></label><label>Notes<textarea name="note" rows="2"></textarea></label><button class="btn">${w.i<n-1?"Save and next drill":"Save and finish"}</button></form></div>`;return}
o.innerHTML=`<div class="in"><div class="row" style="justify-content:space-between"><span class="mut sm">${esc(w.p.name)} · Drill ${w.i+1} of ${n}</span><button class="btn s sm" data-a="quit">Exit</button></div><div class="bar"><i style="width:${w.i/n*100}%"></i></div>
<div class="timer" id="tm">${mmss(el())}</div><span class="badge">${d.c}</span><span class="badge r">${d.reps}</span><h1 style="margin-top:10px">${esc(d.n)}</h1><p>${esc(d.desc)}</p><h3>Cues</h3><ul class="c">${d.cues.map(c=>`<li>${esc(c)}</li>`).join("")}</ul><div class="note">${esc(d.safe)}</div>
<div class="row" style="margin-top:18px"><button class="btn s" data-a="pprev">Previous</button><button class="btn s" data-a="ppause">${w.ps?"Resume":"Pause"}</button><button class="btn s" data-a="pskip">Skip</button><button class="btn" data-a="pdone">Complete drill</button></div></div>`}
function nextD(){const w=W;if(w.i<w.p.drills.length-1){w.i++;w.ph="d"}else w.ph="s";rp()}
function closeW(){clearInterval(tick);W=null;$("#player").hidden=true;render()}

/* ---------- Actions ---------- */
const gp2=(id)=>S.goals.find(g=>g.id==id);
const ACT={
start:v=>startW(v),close:()=>{$("#modal").hidden=true;render()},open:v=>showDrill(+v),
fav:v=>{v=+v;S.favs=S.favs.includes(v)?S.favs.filter(x=>x!=v):[...S.favs,v];save();showDrill(v)},
add:v=>{S.draft.push(+v);save();toast("Added to your workout builder")},
mark:v=>{S.recent=[+v,...S.recent.filter(x=>x!=v)].slice(0,10);save();toast("Marked completed")},
rm:v=>{S.draft.splice(+v,1);save();render()},mv:v=>{v=+v;if(v>0){[S.draft[v-1],S.draft[v]]=[S.draft[v],S.draft[v-1]];save();render()}},
dup:v=>{S.draft=plans().find(p=>p.id==v).drills.slice();save();toast("Copied to builder");render()},
delplan:v=>{S.custom=S.custom.filter(p=>p.id!=v);save();render()},
favf:()=>{fil.f=fil.f?0:1;render()},range:v=>{range=+v;render()},
delt:v=>{S.throws=S.throws.filter(x=>x.id!=v);save();render()},delpr:v=>{S.prs=S.prs.filter(x=>x.id!=v);save();render()},delg:v=>{S.goals=S.goals.filter(x=>x.id!=v);save();render()},
goalup:v=>{const g=gp2(v),n=prompt("Current value for: "+g.title,g.cur);if(n!==null&&n!==""&&!isNaN(n)){g.cur=+n;save();render();if(gp(g)>=100)toast("Goal reached. Nice work.")}},
pprev:()=>{if(W.i>0){W.i--;rp()}},ppause:()=>{if(W.ps){W.pt+=Date.now()-W.ps;W.ps=0}else W.ps=Date.now();rp()},
pskip:()=>{W.res[W.i]={done:0};nextD()},pdone:()=>{W.ph="r";rp()},quit:()=>{if(confirm("Leave this workout? Progress will not be saved."))closeW()},
theme:()=>{S.theme=S.theme=="dark"?"light":"dark";save();render()},
export:()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:"application/json"}));a.download="qb-data.json";a.click()},
nosample:()=>{if(confirm("Remove sample sessions, throws, records and goals?")){["history","throws","prs","goals"].forEach(k=>S[k]=S[k].filter(x=>!x.sample));S.sample=0;save();render()}},
reset:()=>{if(confirm("Delete ALL saved data? This cannot be undone.")){localStorage.removeItem(KEY);S=null;location.hash="";render()}}};
document.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(b&&ACT[b.dataset.a])ACT[b.dataset.a](b.dataset.v)});
document.addEventListener("input",e=>{const i=e.target.id;if(!i)return;if(i=="q")fil.q=e.target.value;else if(i=="fc")fil.c=e.target.value;else if(i=="fd")fil.d=e.target.value;else return;$("#dl").innerHTML=drillList()});
const FORM={
onb:(d,f)=>{const g=n=>[...f.querySelectorAll(`[name=${n}]:checked`)].map(x=>x.value);S=seed({id:uid(),name:d.name.trim(),age:d.age,exp:d.exp,lvl:d.lvl,days:d.days,goals:g("g"),eq:g("e"),partner:!!d.partner,coach:!!d.coach,sit:d.sit});save();location.hash="dash";render()},
saveplan:d=>{S.custom.push({id:"c"+uid(),name:d.name,drills:S.draft.slice(),focus:"Custom"});S.draft=[];save();toast("Workout saved");render()},
throw:(d,f)=>{if(+d.hits>+d.attempts)return toast("Hits cannot exceed attempts");S.throws.push({id:uid(),date:d.date,type:d.type,dist:d.dist,target:d.target,attempts:+d.attempts,hits:+d.hits,before:+d.before,after:+d.after,partner:d.partner,notes:d.notes});save();toast("Session saved ("+pct(+d.hits,+d.attempts)+"%)");if(+d.after<=2)toast("Arm felt sore? Rest and tell a coach or parent.");render()},
pr:d=>{S.prs.unshift({id:uid(),name:d.name,value:+d.value,unit:d.unit,date:dl(0)});save();render()},
goal:d=>{S.goals.push({id:uid(),title:d.title,start:+d.start,cur:+d.start,target:+d.target,due:d.due});save();render()},
prof:d=>{Object.assign(S.profile,{name:d.name,exp:d.exp,days:d.days});save();toast("Profile saved");render()},
rate:d=>{W.res[W.i]={done:1,perf:+d.perf,diff:d.diff,note:d.note};nextD()},
fin:d=>{S.history.push({id:uid(),date:dl(0),name:W.p.name,mins:Math.max(1,Math.round(el()/6e4)),drills:W.res.filter(r=>r&&r.done).length,rating:+d.rating,focus:W.p.focus||"Custom",note:d.note,results:W.res});W.res.forEach((r,i)=>{if(r&&r.done)S.recent=[W.p.drills[i],...S.recent.filter(x=>x!=W.p.drills[i])].slice(0,10)});save();closeW();toast("Session saved")}};
document.addEventListener("submit",e=>{e.preventDefault();const f=e.target;if(FORM[f.dataset.f])FORM[f.dataset.f](Object.fromEntries(new FormData(f)),f)});
if(S){S.custom=S.custom||[];S.draft=S.draft||[];S.recent=S.recent||[]}
render();
