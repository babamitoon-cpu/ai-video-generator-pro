const API_BASE='';
const i18n={en:{idea:'VIDEO IDEA',generate:'✦ GENERATE STORY',ready:'Ready',scenes:'scenes',voice:'🔊 Preview Voice',stop:'■ Stop Voice',exportTxt:'Export TXT',copy:'COPY PROMPT',noImage:'No image added'},id:{idea:'IDE VIDEO',generate:'✦ BUAT CERITA',ready:'Siap',scenes:'scene',voice:'🔊 Pratinjau Suara',stop:'■ Hentikan Suara',exportTxt:'Ekspor TXT',copy:'SALIN PROMPT',noImage:'Belum ada gambar'},es:{idea:'IDEA DEL VIDEO',generate:'✦ GENERAR HISTORIA',ready:'Listo',scenes:'escenas',voice:'🔊 Vista previa de voz',stop:'■ Detener voz',exportTxt:'Exportar TXT',copy:'COPIAR PROMPT',noImage:'Sin imagen'},pt:{idea:'IDEIA DO VÍDEO',generate:'✦ GERAR HISTÓRIA',ready:'Pronto',scenes:'cenas',voice:'🔊 Prévia da voz',stop:'■ Parar voz',exportTxt:'Exportar TXT',copy:'COPIAR PROMPT',noImage:'Sem imagem'},fr:{idea:'IDÉE VIDÉO',generate:'✦ GÉNÉRER L’HISTOIRE',ready:'Prêt',scenes:'scènes',voice:'🔊 Aperçu vocal',stop:'■ Arrêter la voix',exportTxt:'Exporter TXT',copy:'COPIER LE PROMPT',noImage:'Aucune image'},de:{idea:'VIDEO-IDEE',generate:'✦ STORY ERSTELLEN',ready:'Bereit',scenes:'Szenen',voice:'🔊 Stimme testen',stop:'■ Stimme stoppen',exportTxt:'TXT exportieren',copy:'PROMPT KOPIEREN',noImage:'Kein Bild'},ja:{idea:'動画アイデア',generate:'✦ ストーリー生成',ready:'準備完了',scenes:'シーン',voice:'🔊 音声を試す',stop:'■ 音声停止',exportTxt:'TXTを書き出す',copy:'プロンプトをコピー',noImage:'画像なし'},ko:{idea:'영상 아이디어',generate:'✦ 스토리 생성',ready:'준비 완료',scenes:'장면',voice:'🔊 음성 미리듣기',stop:'■ 음성 중지',exportTxt:'TXT 내보내기',copy:'프롬프트 복사',noImage:'이미지 없음'}};
let project=null,mode='shorts',lang='en';
const $=s=>document.querySelector(s);const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function wrap(ctx,text,x,y,max,line){const words=String(text||'').split(/\s+/);let current='';for(const word of words){const test=current?current+' '+word:word;if(ctx.measureText(test).width>max&&current){ctx.fillText(current,x,y);current=word;y+=line;}else current=test;}if(current)ctx.fillText(current,x,y);}

function makeLocalVisual(scene,index){
 const w=540,h=960,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
 const palettes=[['#0f172a','#2563eb'],['#172554','#7c3aed'],['#052e16','#16a34a'],['#431407','#ea580c'],['#3b0764','#db2777'],['#164e63','#0891b2']];
 const pal=palettes[index%palettes.length],g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,pal[0]);g.addColorStop(1,pal[1]);x.fillStyle=g;x.fillRect(0,0,w,h);
 for(let i=0;i<12;i++){x.beginPath();x.arc((i*83+index*31)%w,100+(i*113)%730,30+(i%5)*14,0,Math.PI*2);x.fillStyle=`rgba(255,255,255,${0.035+(i%3)*0.018})`;x.fill();}
 x.fillStyle='rgba(0,0,0,.35)';x.fillRect(24,565,w-48,330);x.fillStyle='#fff';x.textAlign='center';x.font='bold 29px Arial';x.fillText('SHORTS FACTORY',w/2,625);x.font='bold 24px Arial';wrap(x,scene.title||`Scene ${index+1}`,w/2,700,w-90,34);x.font='16px Arial';x.fillStyle='#dbeafe';x.fillText('FREE LOCAL VISUAL',w/2,845);return c.toDataURL('image/jpeg',.84);
}
function addAutoVisuals(){if(!project)return;project.scenes.forEach((s,i)=>{if(!s.imageData)s.imageData=makeLocalVisual(s,i);});render();}

function makeProject(){
 const topic=$('#topic').value.trim()||'Amazing facts',n=+$('#sceneCount').value,style=$('#style').value,long=mode==='long';
 const base=['Hook: '+topic,'The big idea','What happens first','A surprising detail','Why it matters','The science explained','Common mistake','A useful example','Key takeaway','Final thought'];
 const scenes=Array.from({length:n},(_,i)=>({title:base[i%base.length]+(i>=10?' — part '+(Math.floor(i/10)+1):''),narration:`Here is an interesting part of ${topic}. This scene explains the idea in a simple and memorable way. Stay until the end for the key takeaway.`,imagePrompt:`${style} illustration, ${long?'wide 16:9':'vertical 9:16'} educational composition, visualizing ${topic}, scene ${i+1}, consistent visual style, clean background, no text`}));
 return {app:'AI Video Generator',version:'5.0',language:lang,mode:long?'YouTube Long Video':'YouTube Shorts',format:long?'16:9':'9:16',duration:$('#duration').value,style,topic,title:topic+(long?' — Full Guide':' Explained'),description:`A ${long?'long-form':'short-form'} video about ${topic}. Created locally in your browser — no paid rendering service required.`,hashtags:['#YouTubeShorts','#Education','#Facts','#Storytelling'],scenes};
}

async function generateWithAI(){
 const topic=$('#topic').value.trim()||'Amazing facts',n=+$('#sceneCount').value,style=$('#style').value;
 const url=($('#aiUrl')?.value||'').trim().replace(/\/$/,'');
 const model=($('#aiModelText')?.value||'').trim()||'gpt-4o-mini';
 const key=($('#aiKey')?.value||'').trim();
 if(!url) throw new Error('Masukkan API URL.');
 if(!key) throw new Error('Masukkan API key provider AI.');
 localStorage.setItem('shortsFactoryAiUrl',url);localStorage.setItem('shortsFactoryAiModel',model);
 const languageName={en:'English',id:'Indonesian',es:'Spanish',pt:'Portuguese',fr:'French',de:'German',ja:'Japanese',ko:'Korean'}[lang]||'English';
 const prompt=`You are a professional faceless YouTube video producer. Create a complete ${mode==='shorts'?'YouTube Shorts':'long-form YouTube'} project in ${languageName}. Topic: ${topic}. Visual style: ${style}. Number of scenes: ${n}. Return ONLY valid JSON with this exact shape: {"title":"...","description":"...","hashtags":["#..."],"scenes":[{"title":"...","narration":"...","imagePrompt":"..."}]}. Make narration engaging, factual, and suitable for voice-over. Image prompts must describe original visuals, no text, consistent style, and ${mode==='shorts'?'vertical 9:16':'wide 16:9'} composition.`;
 $('#status').textContent='🤖 AI sedang membuat script...';
 const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model,temperature:.8,messages:[{role:'system',content:'Return JSON only.'},{role:'user',content:prompt}]})});
 const data=await r.json().catch(()=>({}));
 if(!r.ok) throw new Error(data?.error?.message||data?.message||`AI request gagal (${r.status})`);
 let text=data?.choices?.[0]?.message?.content||data?.response||'';
 text=String(text).replace(/^```json\s*/,'').replace(/^```\s*/,'').replace(/```$/,'').trim();
 const ai=JSON.parse(text);
 project={app:'AI Video Generator',version:'5.0',language:lang,mode:mode==='long'?'YouTube Long Video':'YouTube Shorts',format:mode==='long'?'16:9':'9:16',duration:$('#duration').value,style,topic,title:ai.title||topic,description:ai.description||'',hashtags:ai.hashtags||[],scenes:(ai.scenes||[]).slice(0,n)};
 showProject();$('#status').textContent=`✅ AI selesai: ${project.scenes.length} scenes`;
}

function showProject(){if(!project)return;$('#output').hidden=false;$('#title').textContent=project.title;$('#desc').textContent=project.description;$('#tags').innerHTML=(project.hashtags||[]).map(x=>`<span class="tag">${esc(x)}</span>`).join('');render();}
function applyLang(){const t=i18n[lang];$('#ideaLabel').textContent=t.idea;$('#generate').textContent=t.generate;$('#speak').textContent=t.voice;$('#stop').textContent=t.stop;$('#downloadTxt').textContent=t.exportTxt;document.documentElement.lang=lang;}
$('#language').onchange=e=>{lang=e.target.value;applyLang();};
document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>{document.querySelectorAll('.mode').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');mode=b.dataset.mode;$('#sceneCount').value=mode==='shorts'?10:20;$('#duration').value=mode==='shorts'?'60 sec':'10 min';});

$('#generate').onclick=()=>{project=makeProject();showProject();const t=i18n[lang];$('#status').textContent=`${t.ready}: ${project.scenes.length} ${t.scenes} • ${project.format}`;window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});};
$('#generateAI').onclick=async()=>{try{await generateWithAI();window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});}catch(e){$('#status').textContent='❌ '+e.message;alert(e.message);}};
$('#autoVideo')?.addEventListener('click',async()=>{try{$('#status').textContent='Membuat draft gratis di browser...';project=makeProject();showProject();addAutoVisuals();await new Promise(r=>setTimeout(r,150));renderVideo();}catch(e){$('#status').textContent='Gagal membuat video: '+e.message;alert(e.message);}});

function render(){if(!project)return;const t=i18n[lang];$('#scenesList').innerHTML=project.scenes.map((s,i)=>`<article class="card scene"><div class="scenehead"><b>SCENE ${String(i+1).padStart(2,'0')}</b><label class="upload">＋ ADD IMAGE<input type="file" accept="image/*" data-i="${i}"></label></div><h3>${esc(s.title)}</h3><p>🎙 ${esc(s.narration)}</p><div class="prompt"><small>IMAGE PROMPT</small><p>${esc(s.imagePrompt)}</p><button data-copy="${i}">${t.copy}</button></div><div id="preview${i}" class="preview">${s.imageData?`<img src="${s.imageData}">`:t.noImage}</div></article>`).join('');
 document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>navigator.clipboard?.writeText(project.scenes[b.dataset.copy].imagePrompt));
 document.querySelectorAll('input[type=file]').forEach(x=>x.onchange=e=>{const f=e.target.files[0],i=+x.dataset.i;if(!f)return;const r=new FileReader();r.onload=()=>{project.scenes[i].imageData=r.result;render();};r.readAsDataURL(f);});
}

$('#speak').onclick=()=>{if(!project)return alert('Generate a project first.');speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(project.scenes.map(s=>s.narration).join(' '));u.lang=lang==='id'?'id-ID':lang==='en'?'en-US':lang; speechSynthesis.speak(u);};
$('#stop').onclick=()=>speechSynthesis.cancel();
function save(name,data,type){const blob=data instanceof Blob?data:new Blob([data],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
$('#export').onclick=()=>{if(project)save('shorts-factory-project.json',JSON.stringify(project,null,2),'application/json');};
$('#downloadTxt').onclick=()=>{if(project)save('shorts-factory-script.txt',project.scenes.map((s,i)=>`SCENE ${i+1}\n${s.title}\n${s.narration}\nIMAGE PROMPT: ${s.imagePrompt}`).join('\n\n'),'text/plain');};

async function imageForScene(sc){if(!sc.imageData)return null;return await new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=sc.imageData;});}
function pickMime(){const types=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];return types.find(t=>window.MediaRecorder?.isTypeSupported?.(t))||'';}

async function renderVideo(){
 if(!project)return alert('Generate a project first.');
 if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)return alert('Browser ini belum mendukung video recording. Coba Chrome terbaru.');
 const w=project.format==='9:16'?540:960,h=project.format==='9:16'?960:540,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');
 const stream=canvas.captureStream(30),mime=pickMime();let rec;try{rec=new MediaRecorder(stream,mime?{mimeType:mime}:{})}catch(e){alert('MediaRecorder tidak tersedia: '+e.message);return;}
 const chunks=[];const sceneSeconds=project.mode==='YouTube Shorts'?Math.min(6,Math.max(2,60/project.scenes.length)):Math.min(8,Math.max(2,600/project.scenes.length));
 $('#status').textContent='Merender video gratis di browser... jangan tutup tab';
 rec.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};
 rec.onstop=()=>{stream.getTracks().forEach(t=>t.stop());const blob=new Blob(chunks,{type:rec.mimeType||'video/webm'});save('shorts-factory-video.webm',blob,blob.type);$('#status').textContent='✅ Video selesai — WebM sudah diunduh. Tidak ada biaya render.';};
 rec.start(250);
 for(let i=0;i<project.scenes.length;i++){
   const sc=project.scenes[i],img=await imageForScene(sc),start=performance.now();
   await new Promise(resolve=>{function frame(now){const p=Math.min(1,(now-start)/(sceneSeconds*1000));ctx.fillStyle='#111827';ctx.fillRect(0,0,w,h);
     if(img){const scale=Math.max(w/img.width,h/img.height)*(1+p*.12),dw=img.width*scale,dh=img.height*scale;ctx.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);}else{ctx.fillStyle='#1f2937';ctx.fillRect(0,0,w,h);ctx.fillStyle='#fff';ctx.font=`bold ${Math.max(24,w/18)}px Arial`;ctx.textAlign='center';ctx.fillText('SCENE '+String(i+1).padStart(2,'0'),w/2,h*.35);ctx.font=`${Math.max(18,w/28)}px Arial`;wrap(ctx,sc.title,w/2,h*.48,w*.8,Math.max(24,w/24));}
     ctx.fillStyle='rgba(0,0,0,.68)';ctx.fillRect(0,h*.73,w,h*.27);ctx.fillStyle='white';ctx.font=`${Math.max(16,w/32)}px Arial`;ctx.textAlign='center';wrap(ctx,sc.narration,w/2,h*.79,w*.86,Math.max(22,w/30));ctx.fillStyle='#fbbf24';ctx.font=`bold ${Math.max(14,w/38)}px Arial`;ctx.fillText(`${i+1}/${project.scenes.length}`,w/2,h*.965);
     if(p<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
 }
 rec.stop();
}
$('#renderVideo').onclick=renderVideo;

const saveProjectBtn=$('#saveProject'),loadProjectBtn=$('#loadProject'),projectFile=$('#projectFile');
saveProjectBtn?.addEventListener('click',()=>{if(!project)return alert('Generate a story first.');localStorage.setItem('shortsFactoryProject',JSON.stringify(project));$('#status').textContent='Project saved locally in this browser.';});
loadProjectBtn?.addEventListener('click',()=>projectFile?.click());
projectFile?.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{project=JSON.parse(r.result);showProject();$('#status').textContent='Project loaded successfully.';}catch(err){alert('Invalid project JSON.')}};r.readAsText(f);});
if($('#aiUrl'))$('#aiUrl').value=localStorage.getItem('shortsFactoryAiUrl')||$('#aiUrl').value;if($('#aiModelText'))$('#aiModelText').value=localStorage.getItem('shortsFactoryAiModel')||$('#aiModelText').value;applyLang();
