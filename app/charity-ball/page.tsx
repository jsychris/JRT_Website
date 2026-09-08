import type {Metadata} from 'next';
import Image from 'next/image';
import {ArrowUpRight, CalendarDays, Clock3, MapPin, Music2, Ticket, Utensils, Drama} from 'lucide-react';
import './ball.css';

const booking='https://forms.cloud.microsoft/e/Zavp72UYnP';
const email='mailto:charityball@jerseyroundtable.com';
export const metadata:Metadata={
  title:'Charity Ball 2026 · 28 November · £115',
  description:'A black-tie night of cabaret, dinner, live music and fundraising. Join Jersey Round Table on 28 November 2026, supporting four local charities. Register your ticket interest.',
  alternates:{canonical:'https://jerseyroundtable.com/charity-ball'},
  openGraph:{title:'Jersey Round Table Charity Ball 2026',description:'28 November · Doors 18:00 · Black tie · £115 per person. A brilliant night for four Jersey charities.',url:'https://jerseyroundtable.com/charity-ball',type:'website'},
};
const charities=[
  {name:'Les Amis',tag:'More independence. More opportunity.',text:'Helping people with learning disabilities and associated conditions reach their potential, with residential care, support for independent living and respite services.',href:'https://www.lesamis.org.je/'},
  {name:'ADHD Jersey',tag:'Understanding makes a difference.',text:'Support, resources and a sense of community for individuals and families affected by ADHD in Jersey, alongside education and advocacy.',href:'https://www.adhd.je/'},
  {name:'Jersey Stroke Support',tag:'Life after stroke, supported.',text:'Supporting stroke survivors and their families on the island, with post-stroke reviews and awareness of stroke and stroke prevention.',href:'https://www.jerseystroke.org.je/'},
  {name:'Sanctuary Trust',tag:'A safe place to start again.',text:'Accommodation and tailored support for men in Jersey experiencing, or at risk of, homelessness, helping them rebuild their lives and reconnect.',href:'https://www.sanctuarytrust.org.je/'},
];
function BookingLink({children='Register ticket interest'}:{children?:React.ReactNode}){return <a className="btn ball-button" href={booking} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={19} aria-hidden="true"/></a>}

export default function CharityBall(){return <main id="main" className="ball-page">
  <section className="ball-hero" aria-labelledby="ball-title">
    <div className="ball-hero-copy">
      <a className="ball-back" href="/">Jersey Round Table / Charity Ball</a>
      <span className="eyebrow">Saturday 28 November 2026</span>
      <h1 id="ball-title">The Charity<br/><em>Ball.</em></h1>
      <p className="ball-strapline">Dress up. Let loose. Do good.</p>
      <p>A night of big laughs, live music and island generosity. Get your favourite people together for Jersey Round Table’s annual black-tie celebration.</p>
      <div className="ball-hero-ticket"><strong>£115 <span>per person</span></strong><span>Doors open 18:00 · Black tie</span></div>
      <BookingLink/>
      <p className="ball-small">Express your interest through our booking form. The team will confirm availability and payment details.</p>
    </div>
    <figure className="ball-hero-photo"><Image src="/assets/photos/new-20.jpg" alt="Guests filling the dance floor beneath colourful lights at a past Jersey Round Table Ball" fill sizes="(max-width: 800px) 100vw, 50vw" priority/><figcaption>Good company. A full dance floor. A very Jersey night.<span>From a previous Ball</span></figcaption></figure>
  </section>

  <div className="ball-facts"><div className="wrap"><span><CalendarDays aria-hidden="true"/>28 November 2026</span><span><Clock3 aria-hidden="true"/>Doors 18:00</span><span><MapPin aria-hidden="true"/>Royal Jersey Showground, Trinity</span><a href="#charities">Four local charities ↓</a></div></div>

  <section className="section"><div className="wrap ball-intro"><div><span className="eyebrow">Your Saturday night, sorted</span><h2>Black tie.<br/>With a sense<br/>of humour.</h2></div><div><p className="ball-lead">An excuse to get everyone together. A show you’ll be talking about afterwards. And a reason to feel good about the whole evening.</p><p>Our Ball brings friends, colleagues and local businesses together to celebrate and fundraise for Jersey. Come for the night out. Be part of what it makes possible.</p><div className="ball-programme">{[{Icon:Utensils,title:'Dinner',text:'Settle in for dinner and catch up around the table.'},{Icon:Drama,title:'The cabaret',text:'The signature Round Table show, with plenty of local personality.'},{Icon:Ticket,title:'The raffle',text:'Join the fundraising on the night and support our chosen causes.'},{Icon:Music2,title:'Live music',text:'Make a night of it and head for the dance floor.'}].map(({Icon,title,text})=><div key={title}><Icon aria-hidden="true"/><h3>{title}</h3><p>{text}</p></div>)}</div></div></div></section>

  <section className="ball-show section"><div className="wrap ball-show-grid"><div><span className="eyebrow">A little less predictable</span><h2>The show?<br/><em>That’s us.</em></h2><p>Behind the black ties are the people who write, rehearse and perform the annual show. Familiar stories get a distinctly Jersey twist, with members throwing themselves into the fun.</p><p>Past productions have taken inspiration from Top Gun, Shrek, The Wizard of Oz and Eurovision. A new year brings another reason to see what happens when the curtain goes up.</p><a className="textlink" href="https://www.bailiwickexpress.com/news/why-islanders-should-do-more-joining-jersey-round-table/" target="_blank" rel="noopener noreferrer">Behind the Ball: the Bailiwick Express story <ArrowUpRight size={17}/></a></div><figure><Image src="/assets/photos/ball-showgirls.png" alt="Round Table members in black tie posing with cabaret performers at a previous Ball" width={621} height={227} sizes="(max-width: 800px) 100vw, 50vw"/><figcaption>A look back through the club’s Ball photo collection.</figcaption></figure></div></section>

  <section id="charities" className="section ball-charities"><div className="wrap"><div className="ball-section-heading"><span className="eyebrow">Our chosen charities for 2026</span><h2>One night.<br/>Four reasons to be there.</h2><p>This year’s Ball supports four charities doing vital work for people in Jersey. Your support helps us raise funds for the island we call home.</p></div><div className="ball-charity-grid">{charities.map((c,i)=><article key={c.name}><span className="ball-number">0{i+1}</span><h3>{c.name}</h3><h4>{c.tag}</h4><p>{c.text}</p><a href={c.href} className="textlink" target="_blank" rel="noopener noreferrer">Meet {c.name} <ArrowUpRight size={16} aria-hidden="true"/></a></article>)}</div></div></section>

  <section className="section ball-impact"><div className="wrap ball-impact-grid"><div><span className="eyebrow">The good carries on</span><h2>When the lights<br/>come up,<br/><em>the impact stays.</em></h2><p>Each Ball is part of a longer story of local giving. In a public update in 2025, the club reported £17,000 donated to four local causes from its November Charity Ball.</p><a href="https://www.facebook.com/jerseyroundtable/mentions/" className="textlink" target="_blank" rel="noopener noreferrer">Read the club’s fundraising updates <ArrowUpRight size={17}/></a></div><div className="ball-impact-stat"><strong>£17,000</strong><span>Donated to local causes<br/>from a previous November Ball</span><p>A past result we’re proud of.<br/>Help us make this year count.</p><BookingLink>Be part of the 2026 Ball</BookingLink></div></div><div className="wrap ball-history-note"><h3>A tradition of supporting Jersey.</h3><p>The 2018 Ball supported Brightly, Down’s Syndrome Jersey, Autism Jersey and Jersey Women’s Refuge. That commitment to local causes continues with our four chosen charities for 2026.</p><a className="textlink" href="https://brightly.je/rotary-jersey-annual-charity-ball/" target="_blank" rel="noopener noreferrer">Read Brightly’s 2018 Ball announcement <ArrowUpRight size={16}/></a></div></section>

  <section className="section"><div className="wrap ball-sponsor"><div><span className="eyebrow">With thanks to our 2026 platinum sponsor</span><a className="ball-warm" href="https://warm.je/" target="_blank" rel="noopener noreferrer" aria-label="Visit warm, our platinum sponsor">warm<span>↗</span></a></div><div><h2>Good things happen<br/>when Jersey gets behind them.</h2><p>Thank you to warm for supporting this year’s Ball, and to the businesses and individuals helping bring the evening to life.</p><p>Would your business like to get involved? Ask about sponsorship or donating a raffle prize.</p><a href={`${email}?subject=Charity%20Ball%202026%20%E2%80%94%20sponsorship%20or%20raffle%20prize`} className="textlink">Help make the night happen <ArrowUpRight size={17}/></a></div></div></section>

  <section className="section ball-faq"><div className="wrap ball-intro"><div><span className="eyebrow">Before you join us</span><h2>A few useful<br/>details.</h2></div><div>
    <details className="faq"><summary>How do I get tickets?</summary><p>Tickets are £115 per person. <a href={booking} target="_blank" rel="noopener noreferrer">Register your interest using our Microsoft form</a>. This is an enquiry, not a completed purchase: the organising team will confirm availability and payment arrangements.</p></details>
    <details className="faq"><summary>Can I come with friends or colleagues?</summary><p>Absolutely — get your group together and let the organisers know you’d like to attend together. Ask the team about table sizes and seating when you enquire.</p></details>
    <details className="faq"><summary>When and where is the Ball?</summary><p>Saturday 28 November 2026 at the Royal Jersey Showground in Trinity. Doors open at 18:00. The dress code is black tie.</p></details>
    <details className="faq"><summary>What’s planned for the evening?</summary><p>The 2026 programme includes dinner, the cabaret, a raffle and live music. We’ll share further programme details as they are confirmed. Raffle participation is optional; ask the team for ticketing details.</p></details>
    <details className="faq"><summary>What about dietary or accessibility requirements?</summary><p>Please contact the organising team before booking to discuss dietary requirements, allergies or access needs so they can confirm arrangements with you.</p></details>
    <details className="faq"><summary>Can I help if I can’t attend?</summary><p>Yes. Businesses and individuals can ask about sponsorship or offering raffle prizes. <a href={`${email}?subject=Supporting%20the%202026%20Charity%20Ball`}>Contact the Ball team</a> to find out how you can help.</p></details>
  </div></div></section>

  <section id="tickets" className="ball-booking section"><div className="wrap"><span className="eyebrow">Saturday 28 November · Jersey Round Table</span><h2>Get the group chat going.<br/><em>We’ll bring the night out.</em></h2><p>Black tie. Dinner. Cabaret. Live music.<br/>Four local charities worth coming together for.</p><strong className="ball-booking-price">£115 <span>per person</span></strong><BookingLink/><p className="ball-small">Enquire today. Booking and payment are confirmed by the organising team.</p><a className="ball-contact" href={email}>Questions? Email the Charity Ball team</a></div></section>
  <aside className="ball-mobile-booking" aria-label="Charity Ball ticket enquiries"><span><strong>28 Nov 2026</strong>£115 per person</span><BookingLink>Ticket enquiries</BookingLink></aside>
</main>}
