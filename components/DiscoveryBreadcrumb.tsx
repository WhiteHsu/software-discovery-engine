import Link from 'next/link';
export default function DiscoveryBreadcrumb({name}:{name:string}){
 return <nav aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true"> / </span><span aria-current="page">{name}</span></nav>;
}
