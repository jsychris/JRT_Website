'use client';
import useEmblaCarousel from 'embla-carousel-react';
import {useEffect,useState} from 'react';
export default function HeroCarousel({photos}:{photos:{src:string,caption:string}[]}){
 const [ref,api]=useEmblaCarousel({loop:true});const [index,setIndex]=useState(0);
 useEffect(()=>{if(!api)return;const select=()=>setIndex(api.selectedScrollSnap());api.on('select',select);return()=>{api.off('select',select)}},[api]);
 return <div className="hero-image hero-carousel" role="region" aria-roledescription="carousel" aria-label="Life at Jersey Round Table">
  <div className="hero-viewport" ref={ref}><div className="hero-slides">{photos.map((p,i)=><div className="hero-slide" role="group" aria-roledescription="slide" aria-label={`${i+1} of ${photos.length}`} key={p.src}><img src={p.src} alt={p.caption} loading={i===0?'eager':'lazy'} fetchPriority={i===0?'high':'auto'}/></div>)}</div></div>
  <div className="hero-carousel-footer"><span className="carousel-caption" aria-live="polite">{photos[index]?.caption}</span>{photos.length>1&&<div className="carousel-controls"><button type="button" aria-label="Previous photo" onClick={()=>api?.scrollPrev()}>←</button><span>{index+1} / {photos.length}</span><button type="button" aria-label="Next photo" onClick={()=>api?.scrollNext()}>→</button></div>}</div>
 </div>;
}
