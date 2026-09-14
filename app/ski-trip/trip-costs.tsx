'use client';
import {useState} from 'react';
const euro=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(n);
const pound=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:2}).format(n);
export default function TripCosts(){
 const [people,setPeople]=useState(6);
 const [flight,setFlight]=useState('');
 const [message,setMessage]=useState('');
 const validFlight=flight.trim()!=='' && Number.isFinite(Number(flight)) && Number(flight)>=0;
 const rooms=people/2;
 async function copy(){try{await navigator.clipboard.writeText('https://jerseyroundtable.com/ski-trip');setMessage('Page link copied.');}catch{setMessage('Copy this link: https://jerseyroundtable.com/ski-trip');}}
 return <div className="ski-costs"><div className="ski-controls"><fieldset><legend>Travelling together</legend><div className="ski-toggle">{[6,8].map(n=><button key={n} type="button" aria-pressed={people===n} onClick={()=>setPeople(n)}>{n} people</button>)}</div></fieldset><p>{rooms} twin rooms · four nights · two adults per room</p></div>
 <div className="ski-two ski-cost-panels"><div><span className="ski-small">BELLEVUE / MOUNTAIN ROOMS</span><strong>{euro(rooms*229*4)}</strong><p>{euro(458)} per person for B&B, plus {euro(6)}pp published tourist tax. Group total including that tax: <b>{euro(rooms*229*4+people*6)}</b>.</p></div><div><span className="ski-small">MIL8 / STANDARD TWIN ROOMS</span><strong>{euro(rooms*545*4)}</strong><p>{euro(1090)} per person for B&B. Tourist tax extra. Both hotel totals use published seasonal tariffs; they do not confirm availability.</p></div></div>
 <div className="ski-table-scroll"><table><caption>Return transfer model for {people} people — two advertised one-way lead prices, not a return quote</caption><thead><tr><th scope="col">Option</th><th scope="col">Group return model</th><th scope="col">Per person</th></tr></thead><tbody><tr><th scope="row">Avoriaz private minibus</th><td>From {pound(338)}</td><td>From {pound(338/people)}</td></tr><tr><th scope="row">Avoriaz shared shuttle</th><td>From {pound(68*people)}</td><td>From {pound(68)}</td></tr><tr><th scope="row">Les Gets private minibus</th><td>From {pound(290)}</td><td>From {pound(290/people)}</td></tr><tr><th scope="row">Les Gets shared shuttle</th><td>From {pound(38*people)}</td><td>From {pound(38)}</td></tr></tbody></table></div>
 <p className="ski-note">Avoriaz model uses £169 × 2; Les Gets £145 × 2. Shuttle models use £34 or £19 × 2 per person. Actual date, time, vehicle and luggage requirements can change every figure. Do not add these transfer costs to Lauzes/Perce Neige unless choosing a separately priced upgrade.</p>
 <div className="ski-flight-input"><label htmlFor="ski-flight-price">Enter a return flight quote per person (£), including bags</label><input id="ski-flight-price" type="number" min="0" step="0.01" inputMode="decimal" placeholder="Not yet quoted" value={flight} onChange={e=>setFlight(e.target.value)}/><p aria-live="polite">{validFlight?<>Your entered flight quote totals <strong>{pound(Number(flight)*people)}</strong> for {people} people. This is a calculation from your input, not a verified fare.</>:'No flight amount entered. No all-in total is shown.'}</p></div>
 <p className="ski-note">Still outside these figures: ski passes, hire, food beyond the stated board basis, drinks, insurance, and any luggage-transfer or rental extras. Six people taking sole use of an eight-bed chalet need a separate quote; do not simply multiply a shared-room price by six.</p>
 <div className="ski-share"><button type="button" onClick={copy}>Copy page link ↗</button><button type="button" onClick={()=>window.print()}>Print / save PDF</button><span role="status">{message}</span></div>
 </div>
}
