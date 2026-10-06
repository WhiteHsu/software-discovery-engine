"use client";
export default function ProductError({reset}:{reset:()=>void}) {
  return <section><h1>Product information is temporarily unavailable</h1><p>Please try again. We haven’t replaced missing data with guessed product facts.</p><button onClick={reset}>Try again</button></section>;
}
