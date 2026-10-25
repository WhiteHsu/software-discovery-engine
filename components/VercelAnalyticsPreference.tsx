"use client";
export default function VercelAnalyticsPreference(){
 function choose(disabled:boolean){try{if(disabled)localStorage.setItem('toolelse-vercel-opt-out','1');else localStorage.removeItem('toolelse-vercel-opt-out');window.location.reload();}catch{window.alert('Your browser could not save this preference.');}}
 return <p><button type="button" onClick={()=>choose(true)}>Disable supplementary analytics in this browser</button>{' '}<button type="button" onClick={()=>choose(false)}>Allow supplementary analytics in this browser</button></p>;
}
