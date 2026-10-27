import {NextResponse,type NextRequest} from 'next/server';
import {chinesePath} from './lib/i18n/pilot';
export function proxy(request:NextRequest){
 const headers=new Headers(request.headers);
 // Always overwrite incoming headers; locale is determined solely by the URL.
 headers.set('x-toolelse-language',chinesePath(request.nextUrl.pathname)?'zh-Hant':'en');
 headers.set('x-toolelse-path',request.nextUrl.pathname);
 return NextResponse.next({request:{headers}});
}
export const config={matcher:['/((?!api|_next|favicon.ico).*)']};
