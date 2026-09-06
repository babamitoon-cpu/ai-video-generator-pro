/* BABA AI GENERATOR VIDEO PRO — app.js V6
   Fixed:
   - Safe DOM initialization
   - Generate Story button
   - Auto Create Video button
   - Render Video totalScenes bug
   - findButtonByText whitespace bug
   - Better error handling
   - GitHub Pages cache-friendly version can be loaded with ?v=6
*/

const API_BASE = '';

const i18n = {
  en:{idea:'VIDEO IDEA',generate:'✦ GENERATE STORY',ready:'Ready',scenes:'scenes',voice:'🔊 Preview Voice',stop:'■ Stop Voice',exportTxt:'Export TXT',copy:'COPY PROMPT',noImage:'No image added'},
  id:{idea:'IDE VIDEO',generate:'✦ BUAT CERITA',ready:'Siap',scenes:'scene',voice:'🔊 Pratinjau Suara',stop:'■ Hentikan Suara',exportTxt:'Ekspor TXT',copy:'SALIN PROMPT',noImage:'Belum ada gambar'},
  es:{idea:'IDEA DEL VIDEO',generate:'✦ GENERAR HISTORIA',ready:'Listo',scenes:'escenas',voice:'🔊 Vista previa de voz',stop:'■ Detener voz',exportTxt:'Exportar TXT',copy:'COPIAR PROMPT',noImage:'Sin imagen'},
  pt:{idea:'IDEIA DO VÍDEO',generate:'✦ GERAR HISTÓRIA',ready:'Pronto',scenes:'cenas',voice:'🔊 Prévia da voz',stop:'■ Parar a voz',exportTxt:'Exportar TXT',copy:'COPIAR PROMPT',noImage:'Sem imagem'},
  fr:{idea:'IDÉE VIDÉO',generate:'✦ GÉNÉRER L’HISTOIRE',ready:'Prêt',scenes:'scènes',voice:'🔊 Aperçu vocal',stop:'■ Arrêter la voix',exportTxt:'Exporter TXT',copy:'COPIER LE PROMPT',noImage:'Aucune image'},
  de:{idea:'VIDEO-IDEE',generate:'✦ STORY ERSTELLEN',ready:'Bereit',scenes:'Szenen',voice:'🔊 Stimme testen',stop:'■ Stimme stoppen',exportTxt:'TXT exportieren',copy:'PROMPT KOPIEREN',noImage:'Kein Bild'},
  ja:{idea:'動画アイデア',generate:'✦ ストーリー生成',ready:'準備完了',scenes:'シーン',voice:'🔊 音声を試す',stop:'■ 音声停止',exportTxt:'TXTを書き出す',copy:'プロンプトをコピー',noImage:'画像なし'},
  ko:{idea:'영상 아이디어',generate:'✦ 스토리 생성',ready:'준비 완료',scenes:'장면',voice:'🔊 음성 미리듣기',stop:'■ 음성 중지',exportTxt:'TXT 내보내기',copy:'프롬프트 복사',noImage:'이미지 없음'}
};

let project = null;
let mode = 'shorts';
let lang = 'en';

const $ = (s) => document.querySelector(s);

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[m]));

function wrap(ctx,text,x,y,max,line){
  const words=String(text||'').split(/\s+/);
  let current='';
  for(const word of words){
    const test=current ? current+' '+word : word;
    if(ctx.measureText(test).width>max && current){
      ctx.fillText(current,x,y);
      current=word;
      y+=line;
    }else{
      current=test;
    }
  }
  if(current)ctx.fillText(current,x,y);
}

function setStatus(message){
  const el=$('#status');
  if(el)el.textContent=message;
}

function makeLocalVisual(scene,index){
  const w=540,h=960;
  const c=document.createElement('canvas');
  c.width=w;c.height=h;
  const x=c.getContext('2d');

  const palettes=[
    ['#0f172a','#2563eb'],
    ['#172554','#7c3aed'],
    ['#052e16','#16a34a'],
    ['#431407','#ea580c'],
    ['#3b0764','#db2777'],
    ['#164e63','#0891b2']
  ];

  const pal=palettes[index%palettes.length];
  const g=x.createLinearGradient(0,0,w,h);
  g.addColorStop(0,pal[0]);
  g.addColorStop(1,pal[1]);
  x.fillStyle=g;
  x.fillRect(0,0,w,h);

  for(let i=0;i<12;i++){
    x.beginPath();
    x.arc((i*83+index*31)%w,100+(i*113)%730,30+(i%5)*14,0,Math.PI*2);
    x.fillStyle=`rgba(255,255,255,${0.035+(i%3)*0.018})`;
    x.fill();
  }

  x.fillStyle='rgba(0,0,0,.35)';
  x.fillRect(24,565,w-48,330);
  x.fillStyle='#fff';
  x.textAlign='center';
  x.font='bold 29px Arial';
  x.fillText('SHORTS FACTORY',w/2,625);
  x.font='bold 24px Arial';
  wrap(x,scene.title||`Scene ${index+1}`,w/2,700,w-90,34);
  x.font='16px Arial';
  x.fillStyle='#dbeafe';
  x.fillText('FREE LOCAL VISUAL',w/2,845);

  return c.toDataURL('image/jpeg',.84);
}

function addAutoVisuals(){
  if(!project)return;
  project.scenes.forEach((s,i)=>{
    if(!s.imageData)s.imageData=makeLocalVisual(s,i);
  });
  render();
}

function makeProject(){
  const topicEl=$('#topic');
  const sceneEl=$('#sceneCount');
  const styleEl=$('#style');
  const durationEl=$('#duration');

  const topic=(topicEl?.value||'').trim()||'Amazing facts';
  const n=Math.max(1,Number(sceneEl?.value)||10);
  const style=styleEl?.value||'Analyst doodle';
  const duration=durationEl?.value||'60 sec';
  const long=mode==='long';

  const base=[
    'Hook: '+topic,
    'The big idea',
    'What happens first',
    'A surprising detail',
    'Why it matters',
    'The science explained',
    'Common mistake',
    'A useful example',
    'Key takeaway',
    'Final thought'
  ];

  const scenes=Array.from({length:n},(_,i)=>({
    title:base[i%base.length]+(i>=10?' — part '+(Math.floor(i/10)+1):''),
    narration:`Here is an interesting part of ${topic}. This scene explains the idea in a simple and memorable way. Stay until the end for the key takeaway.`,
    imagePrompt:`${style} illustration, ${long?'wide 16:9':'vertical 9:16'} educational composition, visualizing ${topic}, scene ${i+1}, consistent visual style, clean background, no text`
  }));

  return {
    app:'AI Video Generator',
    version:'6.0',
    language:lang,
    mode:long?'YouTube Long Video':'YouTube Shorts',
    format:long?'16:9':'9:16',
    duration,
    style,
    topic,
    title:topic+(long?' — Full Guide':' Explained'),
    description:`A ${long?'long-form':'short-form'} video about ${topic}. Created locally in your browser — no paid rendering service required.`,
    hashtags:['#YouTubeShorts','#Education','#Facts','#Storytelling'],
    scenes
  };
}

async function generateWithAI(){
  const topic=($('#topic')?.value||'').trim()||'Amazing facts';
  const n=Math.max(1,Number($('#sceneCount')?.value)||10);
  const style=$('#style')?.value||'Analyst doodle';
  const url=(($('#aiUrl')?.value)||'').trim().replace(/\/$/,'');
  const model=(($('#aiModelText')?.value)||'').trim()||'gpt-4o-mini';
  const key=(($('#aiKey')?.value)||'').trim();

  if(!url)throw new Error('Masukkan API URL.');
  if(!key)throw new Error('Masukkan API key provider AI.');

  localStorage.setItem('shortsFactoryAiUrl',url);
  localStorage.setItem('shortsFactoryAiModel',model);

  const languageName={
    en:'English',id:'Indonesian',es:'Spanish',pt:'Portuguese',
    fr:'French',de:'German',ja:'Japanese',ko:'Korean'
  }[lang]||'English';

  const prompt=`You are a professional faceless YouTube video producer. Create a complete ${mode==='shorts'?'YouTube Shorts':'long-form YouTube'} project in ${languageName}. Topic: ${topic}. Visual style: ${style}. Number of scenes: ${n}. Return ONLY valid JSON with this exact shape: {"title":"...","description":"...","hashtags":["#..."],"scenes":[{"title":"...","narration":"...","imagePrompt":"..."}]}. Make narration engaging, factual, and suitable for voice-over. Image prompts must describe original visuals, no text, consistent style, and ${mode==='shorts'?'vertical 9:16':'wide 16:9'} composition.`;

  setStatus('🤖 AI sedang membuat script...');

  const r=await fetch(url,{
    method:'POST',
    headers:{
      'content-type':'application/json',
      'Authorization':'Bearer '+key
    },
    body:JSON.stringify({
      model,
      temperature:.8,
      messages:[
        {role:'system',content:'Return JSON only.'},
        {role:'user',content:prompt}
      ]
    })
  });

  const data=await r.json().catch(()=>({}));

  if(!r.ok){
    throw new Error(
      data?.error?.message||
      data?.message||
      `AI request gagal (${r.status})`
    );
  }

  let text=data?.choices?.[0]?.message?.content||data?.response||'';
  text=String(text)
    .replace(/^```json\s*/,'')
    .replace(/^```\s*/,'')
    .replace(/```$/,'')
    .trim();

  const ai=JSON.parse(text);

  project={
    app:'AI Video Generator',
    version:'6.0',
    language:lang,
    mode:mode==='long'?'YouTube Long Video':'YouTube Shorts',
    format:mode==='long'?'16:9':'9:16',
    duration:$('#duration')?.value||'60 sec',
    style,
    topic,
    title:ai.title||topic,
    description:ai.description||'',
    hashtags:Array.isArray(ai.hashtags)?ai.hashtags:[],
    scenes:(Array.isArray(ai.scenes)?ai.scenes:[]).slice(0,n)
  };

  showProject();
  setStatus(`✅ AI selesai: ${project.scenes.length} scenes`);
}

function showProject(){
  if(!project)return;

  const output=$('#output');
  if(output)output.hidden=false;

  const title=$('#title');
  const desc=$('#desc');
  const tags=$('#tags');

  if(title)title.textContent=project.title||'Untitled';
  if(desc)desc.textContent=project.description||'';
  if(tags){
    tags.innerHTML=(project.hashtags||[])
      .map(x=>`<span class="tag">${esc(x)}</span>`)
      .join('');
  }

  render();
}

function applyLang(){
  const t=i18n[lang]||i18n.en;
  if($('#ideaLabel'))$('#ideaLabel').textContent=t.idea;
  if($('#generate'))$('#generate').textContent=t.generate;
  if($('#speak'))$('#speak').textContent=t.voice;
  if($('#stop'))$('#stop').textContent=t.stop;
  if($('#downloadTxt'))$('#downloadTxt').textContent=t.exportTxt;
  document.documentElement.lang=lang;
}

function findButtonByText(text){
  const wanted=String(text).replace(/\s+/g,' ').trim().toLowerCase();

  return [...document.querySelectorAll('button')].find(b=>
    (b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase().includes(wanted)
  );
}

function bindEvents(){
  const language=$('#language');
  language?.addEventListener('change',e=>{
    lang=e.target.value;
    applyLang();
  });

  document.querySelectorAll('.mode').forEach(b=>{
    b.addEventListener('click',()=>{
      document.querySelectorAll('.mode').forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected');
      mode=b.dataset.mode||'shorts';

      if($('#sceneCount'))$('#sceneCount').value=mode==='shorts'?'10':'20';
      if($('#duration'))$('#duration').value=mode==='shorts'?'60 sec':'10 min';

      setStatus('');
    });
  });

  $('#generate')?.addEventListener('click',()=>{
    try{
      const btn=$('#generate');
      if(btn)btn.disabled=true;

      project=makeProject();
      showProject();

      const t=i18n[lang]||i18n.en;
      setStatus(`${t.ready}: ${project.scenes.length} ${t.scenes} • ${project.format}`);

      window.scrollTo({
        top:document.body.scrollHeight,
        behavior:'smooth'
      });
    }catch(e){
      console.error(e);
      setStatus('❌ Gagal membuat cerita: '+e.message);
      alert('Gagal membuat cerita: '+e.message);
    }finally{
      const btn=$('#generate');
      if(btn)btn.disabled=false;
    }
  });

  $('#generateAI')?.addEventListener('click',async()=>{
    const btn=$('#generateAI');
    try{
      if(btn)btn.disabled=true;
      await generateWithAI();
      window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
    }catch(e){
      console.error(e);
      setStatus('❌ '+e.message);
      alert(e.message);
    }finally{
      if(btn)btn.disabled=false;
    }
  });

  const autoVideoBtn=$('#autoVideo')||
    findButtonByText('FREE AUTO CREATE VIDEO')||
    findButtonByText('BUAT VIDEO OTOMATIS');

  autoVideoBtn?.addEventListener('click',async()=>{
    try{
      autoVideoBtn.disabled=true;
      autoVideoBtn.dataset.oldText=autoVideoBtn.textContent;
      autoVideoBtn.textContent='⏳ MEMPROSES...';

      setStatus('⏳ Menyiapkan cerita... 0%');

      project=makeProject();
      showProject();
      addAutoVisuals();

      await new Promise(r=>setTimeout(r,150));
      await renderVideo();
    }catch(e){
      console.error(e);
      setStatus('❌ Gagal membuat video: '+e.message);
      alert(e.message);
    }finally{
      autoVideoBtn.disabled=false;
      autoVideoBtn.textContent=autoVideoBtn.dataset.oldText||'🚀 FREE AUTO CREATE VIDEO';
    }
  });

  const renderVideoBtn=$('#renderVideo')||findButtonByText('RENDER VIDEO');

  renderVideoBtn?.addEventListener('click',async()=>{
    try{
      renderVideoBtn.disabled=true;
      await renderVideo();
    }catch(e){
      console.error(e);
      setStatus('❌ Gagal render: '+e.message);
      alert(e.message);
    }finally{
      renderVideoBtn.disabled=false;
    }
  });

  $('#speak')?.addEventListener('click',()=>{
    if(!project)return alert('Generate a project first.');

    if(!('speechSynthesis' in window)){
      return alert('Browser ini tidak mendukung suara.');
    }

    speechSynthesis.cancel();

    const u=new SpeechSynthesisUtterance(
      project.scenes.map(s=>s.narration).join(' ')
    );

    u.lang=lang==='id'?'id-ID':
      lang==='en'?'en-US':lang;

    speechSynthesis.speak(u);
  });

  $('#stop')?.addEventListener('click',()=>{
    if('speechSynthesis' in window)speechSynthesis.cancel();
  });

  $('#export')?.addEventListener('click',()=>{
    if(project){
      save(
        'shorts-factory-project.json',
        JSON.stringify(project,null,2),
        'application/json'
      );
    }
  });

  $('#downloadTxt')?.addEventListener('click',()=>{
    if(project){
      save(
        'shorts-factory-script.txt',
        project.scenes.map((s,i)=>
          `SCENE ${i+1}\n${s.title}\n${s.narration}\nIMAGE PROMPT: ${s.imagePrompt}`
        ).join('\n\n'),
        'text/plain'
      );
    }
  });

  const saveProjectBtn=$('#saveProject');
  const loadProjectBtn=$('#loadProject');
  const projectFile=$('#projectFile');

  saveProjectBtn?.addEventListener('click',()=>{
    if(!project)return alert('Generate a story first.');

    localStorage.setItem(
      'shortsFactoryProject',
      JSON.stringify(project)
    );

    setStatus('Project saved locally in this browser.');
  });

  loadProjectBtn?.addEventListener('click',()=>{
    projectFile?.click();
  });

  projectFile?.addEventListener('change',e=>{
    const f=e.target.files?.[0];
    if(!f)return;

    const r=new FileReader();

    r.onload=()=>{
      try{
        project=JSON.parse(r.result);
        showProject();
        setStatus('Project loaded successfully.');
      }catch(err){
        console.error(err);
        alert('Invalid project JSON.');
      }
    };

    r.readAsText(f);
  });

  if($('#aiUrl')){
    $('#aiUrl').value=
      localStorage.getItem('shortsFactoryAiUrl')||
      $('#aiUrl').value;
  }

  if($('#aiModelText')){
    $('#aiModelText').value=
      localStorage.getItem('shortsFactoryAiModel')||
      $('#aiModelText').value;
  }

  applyLang();

  // Helpful diagnostic in browser console.
  console.log('BABA AI Generator V6 loaded successfully.');
  console.log('Generate button:', !!$('#generate'));
  console.log('Auto video button:', !!$('#autoVideo'));
}

function render(){
  if(!project)return;

  const t=i18n[lang]||i18n.en;
  const list=$('#scenesList');

  if(!list)return;

  list.innerHTML=project.scenes.map((s,i)=>`
    <article class="card scene">
      <div class="scenehead">
        <b>SCENE ${String(i+1).padStart(2,'0')}</b>
        <label class="upload">
          ＋ ADD IMAGE
          <input type="file" accept="image/*" data-i="${i}">
        </label>
      </div>

      <h3>${esc(s.title)}</h3>
      <p>🎙 ${esc(s.narration)}</p>

      <div class="prompt">
        <small>IMAGE PROMPT</small>
        <p>${esc(s.imagePrompt)}</p>
        <button type="button" data-copy="${i}">${t.copy}</button>
      </div>

      <div id="preview${i}" class="preview">
        ${s.imageData?`<img src="${s.imageData}" alt="Scene ${i+1}">`:t.noImage}
      </div>
    </article>
  `).join('');

  document.querySelectorAll('[data-copy]').forEach(b=>{
    b.addEventListener('click',async()=>{
      const prompt=project.scenes[Number(b.dataset.copy)]?.imagePrompt||'';

      try{
        await navigator.clipboard.writeText(prompt);
        const old=b.textContent;
        b.textContent='✓ COPIED';
        setTimeout(()=>b.textContent=old,1200);
      }catch(e){
        alert('Tidak bisa menyalin otomatis. Silakan copy prompt secara manual.');
      }
    });
  });

  document.querySelectorAll('input[type=file][data-i]').forEach(input=>{
    input.addEventListener('change',e=>{
      const f=e.target.files?.[0];
      const i=Number(input.dataset.i);
      if(!f||!project.scenes[i])return;

      const r=new FileReader();

      r.onload=()=>{
        project.scenes[i].imageData=r.result;
        render();
      };

      r.readAsDataURL(f);
    });
  });
}

async function imageForScene(sc){
  if(!sc.imageData)return null;

  return await new Promise(resolve=>{
    const img=new Image();

    img.onload=()=>resolve(img);
    img.onerror=()=>resolve(null);
    img.src=sc.imageData;
  });
}

function pickMime(){
  const types=[
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];

  return types.find(t=>
    window.MediaRecorder?.isTypeSupported?.(t)
  )||'';
}

async function renderVideo(){
  if(!project){
    alert('Generate a project first.');
    return;
  }

  if(!window.MediaRecorder||
     !HTMLCanvasElement.prototype.captureStream){
    alert('Browser ini belum mendukung video recording. Coba Chrome terbaru.');
    return;
  }

  const w=project.format==='9:16'?540:960;
  const h=project.format==='9:16'?960:540;

  // FIX: totalScenes sebelumnya tidak didefinisikan.
  const totalScenes=project.scenes.length;

  if(totalScenes===0){
    throw new Error('Project tidak memiliki scene.');
  }

  const canvas=document.createElement('canvas');
  canvas.width=w;
  canvas.height=h;

  const ctx=canvas.getContext('2d',{alpha:false});
  const stream=canvas.captureStream(30);
  const mime=pickMime();

  let rec;

  try{
    rec=new MediaRecorder(
      stream,
      mime
        ? {mimeType:mime,videoBitsPerSecond:2500000}
        : {videoBitsPerSecond:2500000}
    );
  }catch(e){
    stream.getTracks().forEach(t=>t.stop());
    throw new Error('MediaRecorder tidak tersedia: '+e.message);
  }

  const chunks=[];

  const stopped=new Promise(resolve=>{
    rec.onstop=()=>resolve({ok:true});
    rec.onerror=e=>resolve({ok:false,error:e});
  });

  rec.ondataavailable=e=>{
    if(e.data&&e.data.size>0)chunks.push(e.data);
  };

  const sceneSeconds=
    project.mode==='YouTube Shorts'
      ? Math.min(6,Math.max(2,60/totalScenes))
      : Math.min(8,Math.max(2,600/totalScenes));

  setStatus('🎬 Memulai render video...');

  rec.start(1000);

  await new Promise(r=>setTimeout(r,300));

  for(let i=0;i<totalScenes;i++){
    const sc=project.scenes[i];
    const img=await imageForScene(sc);
    const start=performance.now();

    await new Promise(resolve=>{
      function frame(now){
        const p=Math.min(
          1,
          (now-start)/(sceneSeconds*1000)
        );

        const overall=((i+p)/totalScenes)*100;

        setStatus(
          `🎬 Merender scene ${i+1}/${totalScenes} — ${Math.floor(overall)}%`
        );

        ctx.fillStyle='#111827';
        ctx.fillRect(0,0,w,h);

        if(img){
          const scale=
            Math.max(w/img.width,h/img.height)*
            (1+p*.12);

          const dw=img.width*scale;
          const dh=img.height*scale;

          ctx.drawImage(
            img,
            (w-dw)/2,
            (h-dh)/2,
            dw,
            dh
          );
        }else{
          ctx.fillStyle='#1f2937';
          ctx.fillRect(0,0,w,h);

          ctx.fillStyle='#fff';
          ctx.font=`bold ${Math.max(24,w/18)}px Arial`;
          ctx.textAlign='center';

          ctx.fillText(
            'SCENE '+String(i+1).padStart(2,'0'),
            w/2,
            h*.35
          );

          ctx.font=`${Math.max(18,w/28)}px Arial`;

          wrap(
            ctx,
            sc.title,
            w/2,
            h*.48,
            w*.8,
            Math.max(24,w/24)
          );
        }

        ctx.fillStyle='rgba(0,0,0,.68)';
        ctx.fillRect(0,h*.73,w,h*.27);

        ctx.fillStyle='white';
        ctx.font=`${Math.max(16,w/32)}px Arial`;
        ctx.textAlign='center';

        wrap(
          ctx,
          sc.narration,
          w/2,
          h*.79,
          w*.86,
          Math.max(22,w/30)
        );

        ctx.fillStyle='#fbbf24';
        ctx.font=`bold ${Math.max(14,w/38)}px Arial`;

        ctx.fillText(
          `${i+1}/${totalScenes}`,
          w/2,
          h*.965
        );

        if(p<1){
          requestAnimationFrame(frame);
        }else{
          resolve();
        }
      }

      requestAnimationFrame(frame);
    });
  }

  if(rec.state==='recording'){
    try{rec.requestData();}catch(e){}

    await new Promise(r=>setTimeout(r,250));
    rec.stop();
  }

  const stopResult=await stopped;

  stream.getTracks().forEach(t=>t.stop());

  if(!stopResult.ok){
    throw new Error('Video recorder gagal. Coba Chrome terbaru.');
  }

  await new Promise(r=>setTimeout(r,250));

  const blob=new Blob(
    chunks,
    {type:rec.mimeType||'video/webm'}
  );

  if(!blob.size){
    throw new Error('Video kosong. Silakan coba lagi di Chrome.');
  }

  save(
    'baba-ai-generator-video-pro.webm',
    blob,
    blob.type
  );

  setStatus(
    `✅ Video selesai — 100% — ${(blob.size/1024/1024).toFixed(1)} MB WebM sudah diunduh.`
  );
}

function save(name,data,type){
  const blob=
    data instanceof Blob
      ? data
      : new Blob([data],{type});

  const a=document.createElement('a');
  const url=URL.createObjectURL(blob);

  a.href=url;
  a.download=name;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

// Run only after the page DOM is ready.
// This makes the script safe even if the script location changes later.
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',bindEvents,{once:true});
}else{
  bindEvents();
}
