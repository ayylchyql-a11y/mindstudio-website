import{a as n}from"./chunk-5TL3NGWZ.js";import{b as o,c as i}from"./chunk-EN3SAVJI.js";var t=o(i(),1),{CodeSnippetDeck:a}=n,m={id:"code-snippet-deck",aliases:[]};async function c(){await Promise.all([a.preload()])}function l(s){let{demoKey:r}=s;return(0,t.jsx)("div",{className:"w-full",children:(0,t.jsx)(a,{snippets:[{language:"typescript",label:"TypeScript",filename:"client.ts",highlightLines:[4,5],code:e=>`import { EasyClient } from "@easyui/sdk";

// Initialize resilient client
const client = new EasyClient({
  apiKey: "${e.apiKey||"sk_live_9981"}",
  environment: "${e.env||"production"}",
  streaming: ${e.stream?"true":"false"},
});

// Stream AI generation with zero layout shift
const completion = await client.completions.create({
  model: "easy-4o",
  prompt: "Synthesize dark UI telemetry dashboard",
});`},{language:"curl",label:"cURL",filename:"stream.sh",highlightLines:[2],code:e=>`curl -X POST https://api.easyui.dev/v1/completions \\
  -H "Authorization: Bearer ${e.apiKey||"sk_live_9981"}" \\
  -H "Content-Type: application/json" \\
  -d '{
  "model": "easy-4o",
  "environment": "${e.env||"production"}",
  "stream": ${e.stream?"true":"false"}
  }'`}],parameters:[{id:"stream",label:"Stream response",type:"boolean",defaultValue:!0},{id:"env",label:"Environment",type:"select",defaultValue:"production",options:["production","staging","development"]}],defaultLanguage:"typescript"},r)})}export{m as a,c as b,l as c};
