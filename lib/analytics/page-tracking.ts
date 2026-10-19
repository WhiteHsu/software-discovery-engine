import 'server-only';
import {producerConfigEnabled} from './producer-config';
export function pageTrackingEnabled(){return producerConfigEnabled(process.env);}
