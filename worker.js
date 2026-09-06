// BABA AI GENERATOR VIDEO PRO V8
// Deploy this file as a Cloudflare Worker.
// Add secret: OPENAI_API_KEY
// Then put the Worker URL into the GitHub Pages app's "AI Backend URL" field.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function json(data,status=200){
  return new Response(JSON.stringify(data),{
    status,headers:{"Content-Type":"application/json",...cors}
  });
}

async function openai(path,body,env){
  const r=await fetch("https://api.openai.com"+path,{
    method:"POST",
    headers:{
      "Authorization":"Bearer "+env.OPENAI_API_KEY,
      "Content-Type":"application/json"
    },
    body:JSON.stringify(body)
  });
  const text=await r.text();
  if(!r.ok) throw new Error(text);
  return JSON.parse(text);
}

function cleanJson(text){
  text=text.trim().replace(/^```json/i,"").replace(/^```/,"").replace(/```$/,"").trim();
  const a=text.indexOf("{"), b=text.lastIndexOf("}");
  return JSON.parse(text.slice(a,b+1));
}

export default {
  async fetch(request,env){
    if(request.method==="OPTIONS") return new Response("",{status:204,headers:cors});
    const url=new URL(request.url);
    if(request.method!=="POST") return json({ok:true,message:"BABA V8 backend online"});

    try{
      const body=await request.json();

      if(url.pathname==="/story"){
        const count=Math.min(15,Math.max(1,Number(body.sceneCount||10)));
        const topic=String(body.topic||"").slice(0,1200);
        const style=String(body.style||"cinematic realistic").slice(0,120);
        const prompt=`Create a coherent short-video storyboard for this exact idea: "${topic}".
Return ONLY valid JSON in this shape:
{"scenes":[{"number":1,"title":"...","narration":"...","imagePrompt":"..."}]}
Create exactly ${count} scenes.
Every scene must visibly depict the same main subject/character and environment where appropriate.
Narration must be different and advance the story.
Image prompts must be concrete and scene-specific, not generic.
Visual style: ${style}.
Vertical 9:16. No text, no captions, no logos, no watermark.
If the idea contains a specific animal/object/person, that exact subject must be clearly visible in every relevant scene.`;
        const r=await openai("/v1/responses",{
          model:"gpt-5.6-luna",
          input:prompt
        },env);
        const data=cleanJson(r.output_text||"");
        return json(data);
      }

      if(url.pathname==="/image"){
        const prompt=String(body.prompt||"").slice(0,5000);
        if(!prompt) return json({error:"Missing prompt"},400);
        const r=await openai("/v1/responses",{
          model:"gpt-5.6-luna",
          input:`Generate the requested visual exactly as described. ${prompt}`,
          tools:[{
            type:"image_generation",
            model:"gpt-image-2",
            size:"1024x1536",
            quality:"medium",
            output_format:"jpeg",
            background:"opaque"
          }]
        },env);
        const call=(r.output||[]).find(x=>x.type==="image_generation_call" && x.result);
        if(!call) throw new Error("Image generation returned no image.");
        return json({image:"data:image/jpeg;base64,"+call.result});
      }

      return json({error:"Unknown endpoint"},404);
    }catch(e){
      return json({error:String(e.message||e)},500);
    }
  }
};
