import {collectorConfig} from './http.ts';

// Independent server-side gate: collector QA must not start visitor producers.
export function producerConfigEnabled(env:Record<string,string|undefined>){
 const config=collectorConfig(env);
 return env.ANALYTICS_PRODUCER_ENABLED==='true'&&config.enabled&&config.trustedVercel;
}
