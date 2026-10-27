"use client";
export default function VercelAnalyticsPreference({language="en"}:{language?:"en"|"zh-Hant"}){
 const chinese=language==="zh-Hant";
 function choose(disabled:boolean){try{if(disabled)localStorage.setItem('toolelse-vercel-opt-out','1');else localStorage.removeItem('toolelse-vercel-opt-out');window.location.reload();}catch{window.alert(chinese?'瀏覽器無法儲存這項偏好。':'Your browser could not save this preference.');}}
 return <p><button type="button" onClick={()=>choose(true)}>{chinese?'在此瀏覽器停用補充分析':'Disable supplementary analytics in this browser'}</button>{' '}<button type="button" onClick={()=>choose(false)}>{chinese?'在此瀏覽器允許補充分析':'Allow supplementary analytics in this browser'}</button></p>;
}
