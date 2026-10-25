"use client";
import {useSyncExternalStore} from 'react';
import {Analytics,type BeforeSendEvent} from '@vercel/analytics/next';
import {cleanVercelUrl,safeVercelContext} from '@/lib/analytics/vercel-policy';
function permitted():boolean {
 try{if(navigator.doNotTrack==='1'||(navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl===true)return false;return !!cleanVercelUrl(window.location.href)&&safeVercelContext(sessionStorage.getItem('sd-session-v1'),localStorage.getItem('toolelse-vercel-opt-out'),document.referrer);}catch{return false;}
}
function beforeSend(event:BeforeSendEvent):BeforeSendEvent|null {
 if(event.type!=='pageview'||!permitted())return null;
 const url=cleanVercelUrl(event.url);return url?{...event,url}:null;
}
const subscribe=()=>()=>{};
const serverSnapshot=()=>false;
export default function VercelWebAnalytics(){
 const ready=useSyncExternalStore(subscribe,permitted,serverSnapshot);
 return ready?<Analytics beforeSend={beforeSend} mode="production" debug={false}/>:null;
}
