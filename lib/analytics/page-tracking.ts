import 'server-only';
import {producerConfigEnabled} from './producer-config';
export function pageTrackingEnabled(){return process.env.ANALYTICS_V2_ENABLED!=='true'&&producerConfigEnabled(process.env);}
