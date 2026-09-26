(() => {
  const $ = (selector, scope=document) => scope.querySelector(selector);
  const $$ = (selector, scope=document) => [...scope.querySelectorAll(selector)];
  const KEYS = {progress:'eliana-progress-v2', content:'eliana-content-drafts-v2', cue:'eliana-habit-cue-v2', reflection:'eliana-reflection-v2'};
  const DAILY_MOVES = ['Reverse crunch','Slow bicycle','Forearm plank'];
  const DAILY_SECONDS = 60;
  const PLAN_SECONDS = 300;
  let route = 'home';
  let detailProgram = '30';
  let weekFilter = 0;
  let currentWorkout = null;
  let tickHandle = null;
  let timerRunning = false;
  let remaining = 0;
  let deadline = 0;
  let previousFocus = null;
  let toastHandle = null;

  function readJSON(key, fallback) {
    try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
    catch { return fallback; }
  }
  function writeJSON(key,value) { localStorage.setItem(key,JSON.stringify(value)); }
  function localDate(date=new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character])); }
  function toast(message) {
    const element = $('#toast'); element.textContent = message; element.classList.add('show');
    clearTimeout(toastHandle); toastHandle = setTimeout(()=>element.classList.remove('show'),3400);
  }
  function getProgress() {
    const saved = readJSON(KEYS.progress,null);
    if (saved && Array.isArray(saved.sessions)) return saved;
    const imported=[];
    for (const program of ['30','14']) {
      const old = readJSON('eliana-complete-'+program,[]);
      if (Array.isArray(old)) old.forEach(index => { if (Number.isInteger(index) && index>=0 && index<window.ELIANA_BASE[program].length) imported.push({id:`${program}:${index+1}`,program,day:index+1,date:null,minutes:program==='30'?5:0,kind:'legacy'}); });
    }
    const initial={sessions:imported}; writeJSON(KEYS.progress,initial); return initial;
  }
  function saveProgress(progress) { writeJSON(KEYS.progress,progress); renderJourney(); renderDays(); }
  function allContent() {
    const draft = readJSON(KEYS.content,{});
    return {
      '30': window.ELIANA_BASE['30'].map((day,index)=>({...day,...(draft?.['30']?.[index]||{})})),
      '14': window.ELIANA_BASE['14'].map((day,index)=>({...day,...(draft?.['14']?.[index]||{})}))
    };
  }
  function getDay(program,day) { return allContent()[program][day-1]; }
  function completed(program,day) { return getProgress().sessions.some(session=>session.id===`${program}:${day}`); }
  function completeSession(kind,program,day,minutes) {
    const progress=getProgress(); const id=kind==='daily60'?`daily60:${localDate()}`:`${program}:${day}`;
    if (!progress.sessions.some(session=>session.id===id)) progress.sessions.push({id,program,day,date:localDate(),minutes,kind});
    saveProgress(progress);
  }
  function routeTo(name, updateHash=true) {
    const allowed=['home','programs','journey','about','studio'];
    route=allowed.includes(name)?name:'home';
    $$('.view').forEach(view=>view.classList.toggle('active',view.id===`${route}-view`));
    $$('[data-route]').forEach(link=>{const active=link.dataset.route===route;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
    if(updateHash && location.hash!==`#${route}`) history.pushState(null,'',`#${route}`);
    window.scrollTo({top:0,behavior:'smooth'});
    if(route==='journey') renderJourney();
    if(route==='studio') renderStudio();
  }
  function openProgram(program) {
    routeTo('programs'); detailProgram=program; weekFilter=0;
    $('#program-detail').classList.add('open'); renderDetail();
    requestAnimationFrame(()=>$('#program-detail').scrollIntoView({behavior:'smooth',block:'start'}));
  }
  function renderDetail() {
    const isVideo=detailProgram==='14';
    $('#detail-kicker').textContent=isVideo?'THE NEXT CHAPTER · $19.99':'YOUR DAILY FIVE · $7.99';
    $('#detail-title').textContent=isVideo?'The 14-day progression':'Your 30-day rhythm';
    $('#detail-desc').textContent=isVideo?'The video course is in production. Explore the journey and open any day to see where each video, length, format, exercises, and modifications will go.':'Explore a working interactive adaptation of Eliana’s five-minute guide. The purchased Gumroad PDF is the official source; the routine details here should be checked against it before customer launch.';
    $$('[data-detail-program]').forEach(button=>{const active=button.dataset.detailProgram===detailProgram;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));});
    const weeks=isVideo?['All 14','Days 1–7','Days 8–14']:['All 30','Week 1','Week 2','Week 3','Week 4','Final 2'];
    $('#week-filters').innerHTML=weeks.map((label,index)=>`<button type="button" data-week="${index}" class="${index===weekFilter?'active':''}">${label}</button>`).join('');
    $$('[data-week]').forEach(button=>button.addEventListener('click',()=>{weekFilter=Number(button.dataset.week);renderDetail();}));
    renderDays();
  }
  function renderDays() {
    const target=$('#days-grid'); if(!target) return;
    const programDays=allContent()[detailProgram];
    const shown=programDays.filter(day=>{
      if(weekFilter===0) return true;
      if(detailProgram==='14') return weekFilter===1?day.day<=7:day.day>=8;
      if(weekFilter===5) return day.day>=29;
      return day.day>(weekFilter-1)*7 && day.day<=weekFilter*7;
    });
    target.innerHTML=shown.map(day=>`<button class="day-card ${completed(detailProgram,day.day)?'completed':''}" type="button" data-day="${day.day}" aria-label="Open day ${day.day}: ${esc(day.title)}"><small>DAY ${String(day.day).padStart(2,'0')}</small><strong>${esc(day.title)}</strong><span>${detailProgram==='14'?(day.video?'VIDEO READY':'VIDEO COMING SOON'):'5-MINUTE PRACTICE'}</span></button>`).join('');
    $$('[data-day]',target).forEach(button=>button.addEventListener('click',()=>openWorkout(detailProgram,Number(button.dataset.day))));
  }
  function safeVideo(url) {
    try {const parsed=new URL(url);if(parsed.protocol!=='https:')return null;const host=parsed.hostname.toLowerCase();return ['player.vimeo.com','www.youtube-nocookie.com','youtube-nocookie.com'].includes(host)?parsed.href:null;}
    catch{return null;}
  }
  function pauseTimer() {
    if(timerRunning){remaining=Math.max(0,(deadline-Date.now())/1000);timerRunning=false;clearInterval(tickHandle);tickHandle=null;renderTimer();}
  }
  function closeModal() {
    pauseTimer();$('#workout-modal').classList.remove('open');$('#workout-modal').setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');
    if(previousFocus?.isConnected)previousFocus.focus();currentWorkout=null;
  }
  function openModal() {
    previousFocus=document.activeElement;$('#workout-modal').classList.add('open');$('#workout-modal').setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
    requestAnimationFrame(()=>$('.modal-close').focus());
  }
  function openWorkout(program,day) {
    pauseTimer(); currentWorkout={kind:'day',program,day,feeling:null};
    const item=getDay(program,day),isVideo=program==='14';
    $('#workout-kicker').textContent=`${isVideo?'14-DAY VIDEO CHALLENGE':'30-DAY AB SCULPT'} · DAY ${String(day).padStart(2,'0')}`;
    $('#workout-title').textContent=item.title;$('#workout-subtitle').textContent=item.focus||'';
    const video=safeVideo(item.video);
    const videoMarkup=video?`<div class="workout-video"><iframe src="${esc(video)}" title="${esc(item.title)} workout video" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`:`<div class="workout-video"><div><strong>${isVideo?'Video coming soon':'Follow along at your pace'}</strong><span>${isVideo?'Eliana’s private workout will appear here after filming.':'Use the five-minute guided timer below.'}</span></div></div>`;
    const rows=`<div class="workout-rows"><div class="workout-row"><b>Length</b><p>${item.length?`${esc(item.length)} minutes`:'To be added after filming'}</p></div><div class="workout-row"><b>Format</b><p>${esc(item.format||'To be added after filming')}</p></div><div class="workout-row"><b>Exercises</b>${item.exercises?.length?`<ul>${item.exercises.map(move=>`<li>${esc(move)}</li>`).join('')}</ul>`:'<p>Exercise list coming soon</p>'}</div>${item.modifications?.length?`<div class="workout-row"><b>Options</b><ul>${item.modifications.map(mod=>`<li>${esc(mod)}</li>`).join('')}</ul></div>`:''}</div>`;
    const notes=(day===1||day===(isVideo?14:30))?`<div class="feel-check"><label for="day-note">${day===1?'How do you feel starting?':'What feels different now?'}</label><textarea id="day-note" placeholder="A few words for your future self…" style="width:100%;min-height:95px;border:1px solid #d7b2c1;border-radius:12px;padding:12px;resize:vertical"></textarea><small>Saved on this device.</small></div>`:'';
    const timer=(!isVideo||video)?`<div class="timer-card" id="timer-card"><span class="kicker">${isVideo?'VIDEO SESSION':'FIVE MINUTES FOR YOU'}</span><h3 id="timer-move">Get ready</h3><div class="timer-number" id="timer-number">${isVideo?'':'5:00'}</div><div class="timer-progress"><i id="timer-bar"></i></div><div class="timer-controls"><button type="button" id="timer-toggle">${isVideo?'Mark video watched':'Start workout'}</button>${isVideo?'':'<button type="button" class="secondary" id="timer-reset">Start over</button>'}</div><p class="timer-note" id="timer-note">${isVideo?'Watch the video, then mark your day complete.':'Five rounds of 45 seconds moving, 15 seconds to transition. Rest or modify whenever you need.'}</p></div>`:'';
    const sequence=(!isVideo&&item.exercises?.length)?`<div class="move-list" id="move-list">${Array.from({length:5},(_,index)=>`<div data-move-step="${index}"><b>${index+1}. ${esc(item.exercises[index%item.exercises.length])}</b><span>45s + 15s</span></div>`).join('')}</div>`:'';
    const action=isVideo&&!video?`<div class="feel-check"><strong>Day ${day} is planned.</strong><p>The video and details are still being created. You can return here when the challenge launches.</p><a class="text-link" href="mailto:elianaa.sue@gmail.com?subject=14-Day%20Challenge%20launch%20update">Ask for a launch update</a></div>`:'';
    $('#workout-content').innerHTML=videoMarkup+rows+notes+timer+sequence+action+`<div class="modal-journey-link"><button class="text-link" id="modal-journey">See my journey</button></div>`;
    if(notes){const noteKey=`eliana-note-v2-${program}-${day}`;$('#day-note').value=localStorage.getItem(noteKey)||'';$('#day-note').addEventListener('input',event=>localStorage.setItem(noteKey,event.target.value));}
    if(!isVideo){remaining=PLAN_SECONDS;renderTimer();$('#timer-toggle').addEventListener('click',toggleTimer);$('#timer-reset').addEventListener('click',()=>resetTimer(PLAN_SECONDS));}
    else if(video)$('#timer-toggle').addEventListener('click',()=>finishWorkout());
    $('#modal-journey').addEventListener('click',()=>{closeModal();routeTo('journey');});
    openModal();
  }
  function openDaily60() {
    pauseTimer();currentWorkout={kind:'daily60',program:'free',day:null,feeling:null};
    $('#workout-kicker').textContent='THE DAILY 60 · FREE';
    $('#workout-title').textContent='A minute for you.';
    $('#workout-subtitle').textContent='Three focused moves, 20 seconds each. Eliana’s short-session spirit in a timer you can use today.';
    $('#workout-content').innerHTML=`<div class="timer-card"><span class="kicker">SMALL START. REAL MOMENTUM.</span><h3 id="timer-move">Get ready</h3><div class="timer-number" id="timer-number">1:00</div><div class="timer-progress"><i id="timer-bar"></i></div><div class="timer-controls"><button type="button" id="timer-toggle">Start my minute</button><button type="button" class="secondary" id="timer-reset">Start over</button></div><p class="timer-note" id="timer-note">Move with control. A break is always allowed.</p></div><div class="move-list" id="move-list">${DAILY_MOVES.map((move,index)=>`<div data-move-step="${index}"><b>${index+1}. ${move}</b><span>20s</span></div>`).join('')}</div><div class="feel-check"><label>How do you feel right now?</label><div class="feel-options"><button type="button" data-feel="Calmer">Calmer</button><button type="button" data-feel="Stronger">Stronger</button><button type="button" data-feel="Proud I showed up">Proud I showed up</button></div></div><p class="local-note">Inspired by Eliana’s public 60-second finisher: reverse crunch, slow bicycle, forearm plank. Choose a modified version that feels right.</p><div class="modal-journey-link"><button class="text-link" id="modal-journey">See my journey</button></div>`;
    remaining=DAILY_SECONDS;renderTimer();
    $('#timer-toggle').addEventListener('click',toggleTimer);$('#timer-reset').addEventListener('click',()=>resetTimer(DAILY_SECONDS));
    $$('[data-feel]').forEach(button=>button.addEventListener('click',()=>{currentWorkout.feeling=button.dataset.feel;$$('[data-feel]').forEach(other=>other.classList.toggle('selected',other===button));}));
    $('#modal-journey').addEventListener('click',()=>{closeModal();routeTo('journey');});
    openModal();
  }
  function timerTotal() { return currentWorkout?.kind==='daily60'?DAILY_SECONDS:PLAN_SECONDS; }
  function renderTimer() {
    if(!currentWorkout||!$('#timer-number'))return;
    const total=timerTotal(),elapsed=Math.max(0,total-remaining),remainingRounded=Math.ceil(remaining);
    $('#timer-number').textContent=`${Math.floor(remainingRounded/60)}:${String(remainingRounded%60).padStart(2,'0')}`;
    $('#timer-bar').style.width=`${Math.min(100,elapsed/total*100)}%`;
    $('#timer-toggle').textContent=timerRunning?'Pause':elapsed>0?'Keep going':currentWorkout.kind==='daily60'?'Start my minute':'Start workout';
    if(currentWorkout.kind==='daily60'){
      const step=Math.min(2,Math.floor(elapsed/20));$('#timer-move').textContent=elapsed===0?'Get ready':DAILY_MOVES[step];
      $('#timer-note').textContent=elapsed===0?'Move with control. A break is always allowed.':window.ELIANA_MOVE_CUES[DAILY_MOVES[step]]||'Keep breathing.';
      $$('[data-move-step]').forEach(node=>node.classList.toggle('current',elapsed>0&&Number(node.dataset.moveStep)===step));
    }else{
      const item=getDay(currentWorkout.program,currentWorkout.day),step=Math.min(4,Math.floor(elapsed/60)),transition=elapsed>0&&Math.floor(elapsed%60)>=45;
      const moves=item.exercises?.length?item.exercises:['Gentle core movement'];
      const move=moves[step%moves.length];
      $('#timer-move').textContent=elapsed===0?'Get ready':transition?'Breathe & transition':move;
      $('#timer-note').textContent=elapsed===0?'Five rounds of 45 seconds moving, 15 seconds to transition. Rest or modify whenever you need.':transition?'Take a breath. The next move is coming.':window.ELIANA_MOVE_CUES[move]||'Slow down if your form begins to change.';
      $$('[data-move-step]').forEach(node=>node.classList.toggle('current',elapsed>0&&Number(node.dataset.moveStep)===step));
    }
  }
  function resetTimer(seconds) {pauseTimer();remaining=seconds;renderTimer();}
  function toggleTimer() {
    if(timerRunning){pauseTimer();return;}
    timerRunning=true;deadline=Date.now()+remaining*1000;renderTimer();
    tickHandle=setInterval(()=>{
      remaining=Math.max(0,(deadline-Date.now())/1000);renderTimer();
      if(remaining<=0){clearInterval(tickHandle);tickHandle=null;timerRunning=false;finishWorkout();}
    },180);
  }
  function finishWorkout() {
    if(!currentWorkout)return;
    const workout={...currentWorkout};clearInterval(tickHandle);tickHandle=null;timerRunning=false;remaining=0;
    const minutes=workout.kind==='daily60'?1:Number(getDay(workout.program,workout.day).length||0);
    completeSession(workout.kind,workout.program,workout.day,minutes);
    const count=getProgress().sessions.length;
    const message=count===1?'You made the first move. That matters.':count===7?'Seven moments you chose yourself. Keep that feeling.':count===14?'Fourteen moments of showing up. Look how far you have come.':'A little time for yourself, well spent.';
    $('#workout-content').innerHTML=`<div class="finish-card"><div class="heart">♡</div><span class="kicker">ONE MORE MOMENT FOR YOU</span><h3>Happy Abs!</h3><p>${message}</p><p>You will never regret putting yourself and your body first.</p><button class="button button-dark" id="finish-journey">See my journey <span>→</span></button></div>`;
    $('#finish-journey').addEventListener('click',()=>{closeModal();routeTo('journey');});
    toast('Your session is saved. Nice work!');
  }
  function renderJourney() {
    const sessions=getProgress().sessions,total=sessions.length,minutes=sessions.reduce((sum,session)=>sum+(Number(session.minutes)||0),0);
    const today=new Date(),dayOfWeek=(today.getDay()+6)%7,monday=new Date(today);monday.setDate(today.getDate()-dayOfWeek);monday.setHours(0,0,0,0);
    const weekDates=Array.from({length:7},(_,i)=>{const date=new Date(monday);date.setDate(monday.getDate()+i);return localDate(date)});
    const activeDates=new Set(sessions.map(session=>session.date).filter(Boolean));
    $('#stat-sessions').textContent=total;$('#stat-minutes').textContent=minutes;$('#stat-this-week').textContent=weekDates.filter(date=>activeDates.has(date)).length;
    $('#weekly-strip').innerHTML=weekDates.map((date,index)=>`<div><i class="${activeDates.has(date)?'done':''}"></i>${['M','T','W','T','F','S','S'][index]}</div>`).join('');
    const next=[...Array(30).keys()].find(index=>!completed('30',index+1));
    $('#journey-next-title').textContent=total===0?'Start with today.':next===undefined?'Your next moment is yours.':`Your next step: day ${next+1}.`;
    $('#journey-next-copy').textContent=total===0?'The Daily 60 is ready whenever you are.':next===undefined?'The 30-day journey is complete. A short reset is always here.':'You can do the Daily 60 or take on the next five-minute session.';
    $('#journey-start').dataset.next=next===undefined?'daily60':next+1;
  }
  function renderStudio() {
    const program=$('#studio-program').value;
    $('#studio-day').innerHTML=allContent()[program].map(day=>`<option value="${day.day}">Day ${day.day}: ${esc(day.title)}</option>`).join('');
    fillStudio();
  }
  function fillStudio() {
    const program=$('#studio-program').value,day=Number($('#studio-day').value||1),item=getDay(program,day),form=$('#studio-form');
    const field=name=>form.elements.namedItem(name);
    field('title').value=item.title||'';field('focus').value=item.focus||'';field('length').value=item.length||'';field('format').value=item.format||'';field('exercises').value=(item.exercises||[]).join('\n');field('modifications').value=(item.modifications||[]).join('\n');field('video').value=item.video||'';
  }
  function exportJSON(data,filename) {
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=filename;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function saveStudio(event) {
    event.preventDefault();const program=$('#studio-program').value,day=Number($('#studio-day').value),form=event.currentTarget;
    const lines=value=>value.split('\n').map(s=>s.trim()).filter(Boolean);
    const field=name=>form.elements.namedItem(name);
    const video=field('video').value.trim();if(video&&!safeVideo(video)){toast('Use a private Vimeo or YouTube No-Cookie embed link.');return;}
    const draft=readJSON(KEYS.content,{});draft[program] ||= {};
    draft[program][day-1]={title:field('title').value.trim(),focus:field('focus').value.trim(),length:field('length').value?Number(field('length').value):null,format:field('format').value.trim(),exercises:lines(field('exercises').value),modifications:lines(field('modifications').value),video};
    writeJSON(KEYS.content,draft);$('#studio-status').textContent=`Day ${day} draft saved in this browser.`;renderDetail();toast('Draft saved on this device');
  }
  function registerWebMCP() {
    const context=document.modelContext;if(!context?.registerTool)return;
    const register=tool=>Promise.resolve(context.registerTool(tool)).catch(()=>{});
    register({name:'open_workout_day',title:'Open workout day',description:'Open a day in the 30-day or 14-day course preview.',inputSchema:{type:'object',properties:{program:{type:'string',enum:['30','14']},day:{type:'integer',minimum:1,maximum:30}},required:['program','day'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute({program,day}){if(day>allContent()[program].length)throw new Error('Day outside program');openProgram(program);openWorkout(program,day);return{program,day,title:getDay(program,day).title};}});
    register({name:'get_course_progress',title:'Get course progress',description:'Read session counts and program completion on this device.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(){const progress=getProgress();return{sessions:progress.sessions.length,days30:progress.sessions.filter(s=>s.program==='30').length,days14:progress.sessions.filter(s=>s.program==='14').length};}});
    register({name:'start_daily_60',title:'Start Daily 60',description:'Open the free one-minute guided core session.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(){openDaily60();return{opened:true,durationSeconds:60};}});
  }
  $$('[data-route]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();routeTo(link.dataset.route);}));
  $$('[data-open-program]').forEach(button=>button.addEventListener('click',()=>openProgram(button.dataset.openProgram)));
  $$('[data-detail-program]').forEach(button=>button.addEventListener('click',()=>{detailProgram=button.dataset.detailProgram;weekFilter=0;renderDetail();}));
  $('#close-detail').addEventListener('click',()=>$('#program-detail').classList.remove('open'));
  $('#home-start').addEventListener('click',openDaily60);$('#today-start').addEventListener('click',openDaily60);
  $('#journey-start').addEventListener('click',()=>{const next=$('#journey-start').dataset.next;if(next==='daily60')openDaily60();else openWorkout('30',Number(next));});
  $$('[data-close-modal]').forEach(element=>element.addEventListener('click',closeModal));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('#workout-modal').classList.contains('open'))closeModal();});
  $('#habit-cue').value=localStorage.getItem(KEYS.cue)||'';
  $('#habit-cue').addEventListener('change',event=>{localStorage.setItem(KEYS.cue,event.target.value);$('#cue-result').textContent=event.target.value?`Your plan: a minute of core work ${event.target.value}.`:'Choose a cue whenever you are ready.';});
  $('#cue-result').textContent=$('#habit-cue').value?`Your plan: a minute of core work ${$('#habit-cue').value}.`:'';
  $('#reflection-text').value=localStorage.getItem(KEYS.reflection)||'';
  $('#reflection-text').addEventListener('input',event=>{localStorage.setItem(KEYS.reflection,event.target.value);$('#reflection-save').textContent='Saved on this device.';});
  $('#export-progress').addEventListener('click',()=>exportJSON({progress:getProgress(),cue:localStorage.getItem(KEYS.cue),reflection:localStorage.getItem(KEYS.reflection)},'eliana-sue-my-journey.json'));
  $('#studio-link').addEventListener('click',()=>routeTo('studio'));
  $('#studio-program').addEventListener('change',renderStudio);$('#studio-day').addEventListener('change',fillStudio);$('#studio-form').addEventListener('submit',saveStudio);
  $('#studio-export').addEventListener('click',()=>{exportJSON(allContent(),'eliana-sue-course-content.json');toast('Content file downloaded');});
  window.addEventListener('popstate',()=>routeTo(location.hash.slice(1)||'home',false));
  routeTo(location.hash.slice(1)==='course'?'home':location.hash.slice(1)||'home',false);
  renderJourney();registerWebMCP();
})();
