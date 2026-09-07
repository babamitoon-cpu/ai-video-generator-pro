const $ = s => document.querySelector(s);
let scenes = [];
let topic = "";

function backend(){
  return ($("#apiBase").value || "").trim().replace(/\/+$/,"");
}
function setStatus(msg){ $("#status").textContent = msg; }

function localScenes(subject, n){
  const beats = [
    ["Hook", `Something unexpected is happening: ${subject}.`],
    ["Setup", `We follow the main subject as the situation begins: ${subject}.`],
    ["First action", `The main action becomes clear while the subject reacts naturally.`],
    ["Close-up", `A closer moment reveals an important detail of the story.`],
    ["Challenge", `A small obstacle changes what happens next.`],
    ["Reaction", `The main subject reacts and the story moves forward.`],
    ["Turning point", `The situation reaches its most interesting moment.`],
    ["Payoff", `The result of the action becomes visible.`],
    ["Resolution", `The tension settles and the story reaches a satisfying ending.`],
    ["Final thought", `A memorable final image closes the story.`]
  ];
  return Array.from({length:n},(_,i)=>{
    const b=beats[i%beats.length];
    return {
      number:i+1,title:b[0],narration:b[1],
      imagePrompt:`${subject}. Scene ${i+1}: ${b[1]} Show the exact subject clearly, with the main character and environment matching the other scenes. ${$("#style").value}. Vertical 9:16 composition, cinematic framing, natural lighting, no text, no watermark.`
    };
  });
}

async function generateStory(){
  topic=$("#topic").value.trim();
  if(!topic){ setStatus("Masukkan VIDEO IDEA dulu."); return; }
  const n=Number($("#sceneCount").value);
  const base=backend();
  setStatus("Membuat 10 scene yang benar-benar mengikuti ide...");
  try{
    if(!base) throw new Error("NO_BACKEND");
    const r=await fetch(base+"/story",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({topic,sceneCount:n,style:$("#style").value})
    });
    if(!r.ok) throw new Error(await r.text());
    const data=await r.json();
    scenes=(data.scenes||[]).slice(0,n);
    if(!scenes.length) throw new Error("Backend tidak mengembalikan scene.");
  }catch(e){
    scenes=localScenes(topic,n);
    setStatus("Story lokal dibuat. Isi AI Backend URL untuk story AI + gambar AI nyata.");
  }
  renderScenes();
  if(base) setStatus(`${scenes.length} scene siap. Klik GENERATE ALL REAL IMAGES.`);
}

function renderScenes(){
  const box=$("#scenesList");
  box.innerHTML="";
  scenes.forEach((s,i)=>{
    const el=document.createElement("article");
    el.className="scene";
    el.innerHTML=`
      <div class="scene-head">
        <h3>SCENE ${String(i+1).padStart(2,"0")} — ${escapeHtml(s.title||"Scene")}</h3>
        <span class="badge" id="badge-${i}">${s.imageData?"IMAGE READY":"WAITING"}</span>
      </div>
      <div class="scene-grid">
        <div>
          <img id="img-${i}" src="${s.imageData||""}" alt="Scene ${i+1}" ${s.imageData?"":"style='display:none'"} />
          <div class="scene-actions">
            <button class="secondary addImage" data-i="${i}">＋ ADD IMAGE</button>
            <button class="primary genImage" data-i="${i}">🖼️ GENERATE IMAGE</button>
          </div>
          <input class="hidden fileInput" id="file-${i}" type="file" accept="image/*">
        </div>
        <div class="scene-meta">
          <p><b>Narration</b><textarea data-field="narration" data-i="${i}">${escapeHtml(s.narration||"")}</textarea></p>
          <p><b>Image Prompt</b><textarea data-field="imagePrompt" data-i="${i}">${escapeHtml(s.imagePrompt||"")}</textarea></p>
        </div>
      </div>`;
    box.appendChild(el);
  });
  box.querySelectorAll(".genImage").forEach(b=>b.onclick=()=>generateImage(Number(b.dataset.i)));
  box.querySelectorAll(".addImage").forEach(b=>b.onclick=()=>$("#file-"+b.dataset.i).click());
  box.querySelectorAll(".fileInput").forEach(inp=>inp.onchange=e=>loadLocalImage(Number(inp.id.split("-")[1]),e.target.files[0]));
  box.querySelectorAll("textarea[data-field]").forEach(t=>t.oninput=()=>{
    scenes[Number(t.dataset.i)][t.dataset.field]=t.value;
  });
}

function escapeHtml(v){
  return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function loadLocalImage(i,file){
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    scenes[i].imageData=reader.result;
    const img=$("#img-"+i); img.src=reader.result; img.style.display="block";
    $("#badge-"+i).textContent="IMAGE READY";
  };
  reader.readAsDataURL(file);
}

async function generateImage(i){
  const base=backend();
  if(!base){ setStatus("Isi AI Backend URL dulu."); return; }
  setStatus(`Generating real image untuk Scene ${i+1}...`);
  try{
    const r=await fetch(base+"/image",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        prompt: scenes[i].imagePrompt,
        style:$("#style").value,
        sceneIndex:i+1,
        topic: topic
      })
    });
    if(!r.ok) throw new Error(await r.text());
    const data=await r.json();
    if(!data.image) throw new Error("Tidak ada image dari backend.");
    scenes[i].imageData=data.image;
    const img=$("#img-"+i); img.src=data.image; img.style.display="block";
    $("#badge-"+i).textContent="REAL IMAGE READY";
    setStatus(`Scene ${i+1} selesai.`);
  }catch(e){
    console.error(e);
    setStatus(`Gagal Scene ${i+1}: ${e.message}`);
  }
}

async function generateAll(){
  if(!scenes.length){ await generateStory(); }
  if(!scenes.length) return;
  for(let i=0;i<scenes.length;i++){
    if(!scenes[i].imageData) await generateImage(i);
  }
  setStatus("Semua scene selesai. Sekarang klik CREATE MP4.");
}

async function createMp4(){
  const ready=scenes.filter(s=>s.imageData);
  if(!ready.length){ setStatus("Generate atau Add Image minimal 1 scene."); return; }
  setStatus("Membuat video MP4 dari gambar scene...");
  try{
    const blob=await renderWebm(ready,Number($("#duration").value));
    const mp4=await convertToMp4(blob);
    const url=URL.createObjectURL(mp4);
    const a=document.createElement("a");
    a.href=url;a.download="baba-ai-generator-video-pro.mp4";a.click();
    setTimeout(()=>URL.revokeObjectURL(url),5000);
    setStatus("MP4 selesai dibuat dan siap disimpan.");
  }catch(e){
    console.error(e);
    setStatus("MP4 gagal dibuat: "+e.message);
  }
}

function renderWebm(list,seconds){
  return new Promise(async(resolve,reject)=>{
    const canvas=document.createElement("canvas");
    canvas.width=720;canvas.height=1280;
    const ctx=canvas.getContext("2d");
    const stream=canvas.captureStream(30);
    const mime=MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm";
    const rec=new MediaRecorder(stream,{mimeType:mime});
    const chunks=[];
    rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
    rec.onerror=e=>reject(e.error||new Error("Recorder error"));
    rec.onstop=()=>resolve(new Blob(chunks,{type:"video/webm"}));
    rec.start();
    const frameMs=1000/30;
    let sceneNum=0;
    for(const s of list){
      sceneNum++;
      setStatus(`Merender video: scene ${sceneNum}/${list.length}...`);
      const img=await loadImg(s.imageData);
      const start=performance.now(), total=seconds*1000;
      while(performance.now()-start<total){
        const p=Math.min(1,(performance.now()-start)/total);
        ctx.fillStyle="#000";ctx.fillRect(0,0,720,1280);
        const scale=1+0.06*p;
        const iw=img.width*scale, ih=img.height*scale;
        const sc=Math.max(720/img.width,1280/img.height)*scale;
        const dw=img.width*sc, dh=img.height*sc;
        const x=(720-dw)/2 - p*8, y=(1280-dh)/2;
        ctx.drawImage(img,x,y,dw,dh);
        await new Promise(r=>setTimeout(r,frameMs));
      }
    }
    rec.stop();
  });
}

function loadImg(src){
  return new Promise((resolve,reject)=>{
    if(!src){ reject(new Error("Scene ini tidak punya gambar (imageData kosong).")); return; }
    const i=new Image();
    const timer=setTimeout(()=>reject(new Error("Timeout: gambar gagal dimuat dalam 15 detik.")),15000);
    i.onload=()=>{ clearTimeout(timer); resolve(i); };
    i.onerror=()=>{ clearTimeout(timer); reject(new Error("Gambar rusak/gagal dimuat.")); };
    i.src=src;
  });
}

async function convertToMp4(webm){
  setStatus("Konversi WebM → MP4... pertama kali bisa agak lama di HP.");
  const {FFmpeg,fetchFile}=await import("https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/+esm");
  const {toBlobURL}=await import("https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/+esm");
  const ff=new FFmpeg();
  const withTimeout=(p,ms,label)=>Promise.race([
    p,
    new Promise((_,rej)=>setTimeout(()=>rej(new Error(`Timeout: ${label} lebih dari ${ms/1000} detik. Cek koneksi internet.`)),ms))
  ]);
  const baseURL="https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
  // Browser menolak Worker langsung dari CDN luar (cross-origin).
  // Solusinya: unduh dulu jadi blob lokal, baru dipakai sebagai Worker.
  const coreURL=await withTimeout(toBlobURL(`${baseURL}/ffmpeg-core.js`,"text/javascript"),90000,"download FFmpeg core");
  const wasmURL=await withTimeout(toBlobURL(`${baseURL}/ffmpeg-core.wasm`,"application/wasm"),90000,"download FFmpeg wasm");
  await withTimeout(ff.load({ coreURL, wasmURL }),90000,"memuat FFmpeg engine");
  await ff.writeFile("input.webm",await fetchFile(webm));
  await ff.exec(["-i","input.webm","-c:v","libx264","-pix_fmt","yuv420p","-movflags","+faststart","output.mp4"]);
  const data=await ff.readFile("output.mp4");
  return new Blob([data.buffer],{type:"video/mp4"});
}

$("#generate").onclick=generateStory;
$("#generateAll").onclick=generateAll;
$("#createMp4").onclick=createMp4;
$("#clearAll").onclick=()=>{
  scenes=[];topic="";$("#topic").value="";$("#scenesList").innerHTML="";
  setStatus("Reset selesai.");
};
