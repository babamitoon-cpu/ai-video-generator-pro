/* BABA AI GENERATOR VIDEO PRO - V7 MP4 */
(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  let mode = "shorts";
  let project = null;
  let recorder = null;
  let chunks = [];

  const setStatus = (text) => {
    const el = $("#status");
    if (el) el.textContent = text || "";
  };

  const clean = (v, fallback = "") => String(v ?? fallback).trim();

  function makeProject() {
    const topic = clean($("#topic")?.value, "Untitled Video");
    const count = Math.max(1, parseInt($("#sceneCount")?.value || "10", 10));
    const durationText = clean($("#duration")?.value, "60 sec");
    const style = clean($("#style")?.value, "Analyst doodle");
    const duration = parseDuration(durationText);
    const secondsPerScene = Math.max(1, duration / count);

    const scenes = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Scene ${i + 1}`,
      narration: i === 0
        ? `Let's explore ${topic}.`
        : `This is an important part of ${topic}.`,
      visual: `${style} visual about ${topic}, scene ${i + 1}`
    }));

    return {
      version: "7.0",
      title: topic,
      description: `A ${mode === "shorts" ? "YouTube Shorts" : "YouTube long video"} about ${topic}.`,
      tags: [topic, style, "AI video", "YouTube"],
      mode,
      duration,
      durationText,
      style,
      scenes,
      secondsPerScene
    };
  }

  function parseDuration(text) {
    const n = parseFloat(text) || 60;
    if (/min/i.test(text)) return n * 60;
    return n;
  }

  function renderProject() {
    if (!project) return;
    $("#output").hidden = false;
    $("#title").textContent = project.title;
    $("#desc").textContent = project.description;
    $("#tags").textContent = project.tags.map(x => `#${x.replace(/\s+/g, "")}`).join(" ");

    const list = $("#scenesList");
    list.innerHTML = "";
    project.scenes.forEach((s) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="top">
          <div>
            <small>SCENE ${s.id}</small>
            <h3>${escapeHtml(s.title)}</h3>
          </div>
        </div>
        <p><strong>Narration:</strong> ${escapeHtml(s.narration)}</p>
        <p class="muted"><strong>Visual:</strong> ${escapeHtml(s.visual)}</p>
      `;
      list.appendChild(card);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));
  }

  function drawScene(ctx, canvas, scene, index, total) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    g.addColorStop(0, "#f7f0df");
    g.addColorStop(1, "#d8c3a5");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,.65)";
    ctx.beginPath();
    ctx.arc(canvas.width * .78, canvas.height * .20, canvas.width * .12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#3d3027";
    ctx.textAlign = "center";
    ctx.font = `bold ${Math.max(28, canvas.width * .045)}px sans-serif`;
    wrapText(ctx, scene.title, canvas.width / 2, canvas.height * .35, canvas.width * .8, canvas.width * .055);

    ctx.font = `${Math.max(18, canvas.width * .026)}px sans-serif`;
    wrapText(ctx, scene.narration, canvas.width / 2, canvas.height * .52, canvas.width * .78, canvas.width * .038);

    ctx.font = `${Math.max(14, canvas.width * .018)}px sans-serif`;
    ctx.fillStyle = "#6f5b4c";
    ctx.fillText(`BABA AI GENERATOR • ${index + 1}/${total}`, canvas.width / 2, canvas.height * .91);
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text).split(/\s+/);
    let line = "";
    const lines = [];
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else line = test;
    }
    if (line) lines.push(line);
    lines.slice(0, 5).forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  }

  async function recordVideo() {
    if (!project) project = makeProject();

    const isShorts = project.mode === "shorts";
    const canvas = document.createElement("canvas");
    canvas.width = isShorts ? 720 : 1280;
    canvas.height = isShorts ? 1280 : 720;

    const stream = canvas.captureStream(30);

    const mimeCandidates = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ];
    const mime = mimeCandidates.find(x => MediaRecorder.isTypeSupported(x));
    if (!mime) throw new Error("Browser tidak mendukung perekaman video.");

    chunks = [];
    recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5000000 });

    const stopped = new Promise(resolve => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
    });
    recorder.ondataavailable = e => {
      if (e.data && e.data.size) chunks.push(e.data);
    };

    recorder.start(250);

    const ctx = canvas.getContext("2d");
    const sceneMs = project.duration * 1000 / project.scenes.length;
    const start = performance.now();

    await new Promise(resolve => {
      function frame(now) {
        const elapsed = now - start;
        const idx = Math.min(project.scenes.length - 1, Math.floor(elapsed / sceneMs));
        drawScene(ctx, canvas, project.scenes[idx], idx, project.scenes.length);
        if (elapsed >= project.duration * 1000) resolve();
        else requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });

    recorder.stop();
    stream.getTracks().forEach(t => t.stop());
    return stopped;
  }

  async function convertToMp4(webmBlob) {
    setStatus("Mengubah WebM → MP4... jangan tutup halaman.");

    if (!window.FFmpegWASM) {
      await loadScript("https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js");
    }

    if (!window.FFmpegWASM) {
      throw new Error("FFmpeg belum berhasil dimuat. Periksa koneksi internet.");
    }

    const { FFmpeg } = window.FFmpegWASM;
    const { fetchFile, toBlobURL } = window.FFmpegUtil || {};
    if (!fetchFile || !toBlobURL) {
      await loadScript("https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js");
    }

    const util = window.FFmpegUtil;
    if (!util) throw new Error("FFmpeg utility gagal dimuat.");

    const ffmpeg = new FFmpeg();
    const base = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpeg.load({
      coreURL: await util.toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await util.toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm")
    });

    await ffmpeg.writeFile("input.webm", await util.fetchFile(webmBlob));
    await ffmpeg.exec([
      "-i", "input.webm",
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      "-preset", "veryfast",
      "output.mp4"
    ]);

    const data = await ffmpeg.readFile("output.mp4");
    return new Blob([data.buffer], { type: "video/mp4" });
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return existing.addEventListener("load", resolve, { once: true });
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Gagal memuat " + src));
      document.head.appendChild(s);
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }

  async function autoCreateVideo() {
    try {
      const btn = $("#autoVideo");
      if (btn) btn.disabled = true;

      project = makeProject();
      renderProject();
      setStatus("Membuat video...");
      const webm = await recordVideo();
      const mp4 = await convertToMp4(webm);

      downloadBlob(mp4, "baba-ai-generator-video-pro.mp4");
      setStatus("✅ MP4 selesai dan siap didownload.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Gagal membuat MP4: " + (err?.message || err));
    } finally {
      const btn = $("#autoVideo");
      if (btn) btn.disabled = false;
    }
  }

  function bind() {
    document.querySelectorAll(".mode").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".mode").forEach(x => x.classList.remove("selected"));
        btn.classList.add("selected");
        mode = btn.dataset.mode || "shorts";
      });
    });

    $("#generate")?.addEventListener("click", () => {
      project = makeProject();
      renderProject();
      setStatus("✅ Story berhasil dibuat.");
    });

    $("#autoVideo")?.addEventListener("click", autoCreateVideo);

    $("#downloadTxt")?.addEventListener("click", () => {
      if (!project) return;
      const text = [
        project.title,
        "",
        project.description,
        "",
        ...project.scenes.map(s => `SCENE ${s.id}\n${s.title}\n${s.narration}\nVisual: ${s.visual}\n`)
      ].join("\n");
      downloadBlob(new Blob([text], {type:"text/plain"}), "baba-ai-project.txt");
    });

    $("#export")?.addEventListener("click", () => {
      if (!project) project = makeProject();
      downloadBlob(
        new Blob([JSON.stringify(project, null, 2)], {type:"application/json"}),
        "baba-ai-project.json"
      );
    });

    $("#saveProject")?.addEventListener("click", () => {
      localStorage.setItem("baba-ai-project-v7", JSON.stringify(project || makeProject()));
      setStatus("✅ Project tersimpan di perangkat.");
    });

    $("#loadProject")?.addEventListener("click", () => $("#projectFile")?.click());

    $("#projectFile")?.addEventListener("change", async e => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        project = JSON.parse(await file.text());
        renderProject();
        setStatus("✅ Project berhasil dimuat.");
      } catch {
        setStatus("❌ File project tidak valid.");
      }
    });

    $("#speak")?.addEventListener("click", () => {
      if (!project) project = makeProject();
      speechSynthesis.cancel();
      speechSynthesis.speak(new SpeechSynthesisUtterance(
        project.scenes.map(s => s.narration).join(" ")
      ));
    });

    $("#stop")?.addEventListener("click", () => speechSynthesis.cancel());

    console.log("BABA AI GENERATOR V7 MP4 loaded.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
