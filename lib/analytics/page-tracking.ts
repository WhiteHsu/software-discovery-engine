import 'server-only';
import {collectorConfig} from './http';
export function pageTrackingEnabled(){const config=collectorConfig(process.env);return config.enabled&&config.trustedVercel;}
