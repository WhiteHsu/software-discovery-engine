import test from 'node:test';
import assert from 'node:assert/strict';
import {localeNavigation,pilotSlugs} from '../lib/i18n/pilot.ts';

test('navigation is recalculated for Chinese to English and back without a layout remount',()=>{
 const states=['/zh-hant','/','/zh-hant'].map(path=>localeNavigation(path,pilotSlugs));
 assert.deepEqual(states.map(s=>s.alternate),['/','/zh-hant','/']);
 assert.deepEqual(states.map(s=>s.language),['zh-Hant','en','zh-Hant']);
 assert.deepEqual(states.map(s=>s.home),['/zh-hant','/','/zh-hant']);
});
test('comparison, product, privacy and unsupported routes get appropriate current navigation',()=>{
 const slug=pilotSlugs[0];
 assert.equal(localeNavigation('/zh-hant/escape/'+slug,pilotSlugs).alternate,'/escape/'+slug);
 assert.equal(localeNavigation('/escape/'+slug,pilotSlugs).alternate,'/zh-hant/escape/'+slug);
 assert.equal(localeNavigation('/software/affine',pilotSlugs).alternate,null);
 assert.equal(localeNavigation('/software/affine',pilotSlugs).privacy,'/privacy');
 assert.equal(localeNavigation('/zh-hant/privacy',pilotSlugs).alternate,'/privacy');
 assert.equal(localeNavigation('/privacy',pilotSlugs).alternate,'/zh-hant/privacy');
 assert.equal(localeNavigation('/escape/'+slug,[]).alternate,null);
 assert.equal(localeNavigation('/escape/simple-notion-alternatives',pilotSlugs).alternate,null);
});
