import {useEffect,useState} from 'react';
import {compareVersions,currentVersion,fetchRelease} from './versionService';
import type {Release} from './versionService';
export function useAppUpdate(){
 const [release,setRelease]=useState<Release|null>(null);
 useEffect(()=>{
  let active=true;let lastCheck=0;let pending=false;let controller:AbortController|undefined;
  async function check(){
   if(document.visibilityState==='hidden'||pending||Date.now()-lastCheck<30000)return;
   pending=true;lastCheck=Date.now();controller=new AbortController();const timeout=setTimeout(()=>controller?.abort(),10000);
   try{const latest=await fetchRelease(controller.signal);if(active)setRelease(compareVersions(latest.version,currentVersion)===1?latest:null);}catch{/* Unavailable metadata must never interrupt work. */}finally{clearTimeout(timeout);pending=false;}
  }
  void check();const onFocus=()=>{void check();};
  window.addEventListener('focus',onFocus);document.addEventListener('visibilitychange',onFocus);
  const interval=setInterval(onFocus,15*60*1000);
  return()=>{active=false;controller?.abort();clearInterval(interval);window.removeEventListener('focus',onFocus);document.removeEventListener('visibilitychange',onFocus);};
 },[]);
 return release;
}
