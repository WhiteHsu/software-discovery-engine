"use client";
export default function ErrorView({reset}:{reset:()=>void}){return <section style={{padding:"64px 24px"}}><h1>Route temporarily unavailable</h1><p>We could not load the route evidence.</p><button onClick={reset}>Try again</button></section>;}
