import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,''));
const stable=x=>JSON.stringify(x);
const id=key=>{const s=createHash('sha256').update('toolelse-issue21-draft-v1:'+key).digest('hex');return `${s.slice(0,8)}-${s.slice(8,12)}-5${s.slice(13,16)}-a${s.slice(17,20)}-${s.slice(20,32)}`;};
const clean=row=>Object.fromEntries(Object.entries(row).filter(([k])=>!['created_at','updated_at'].includes(k)));
export function buildAccountFreeImport(){
 const baseline=read('seed/research/account-free-baseline-2026-11-02.json'),proposal=read('seed/research/account-free-proposal-2026-11-02.json');
 if(baseline.products.length!==2||baseline.existing_route.length||baseline.products.some(p=>!['affine','obsidian'].includes(p.slug)||p.status!=='published')||proposal.publicationApproved!==false||proposal.page.published!==false)throw Error('Unexpected baseline/proposal');
 const p=proposal.products.find(p=>p.slug==='standard-notes');if(!p||p.status!=='draft')throw Error('Standard Notes draft missing');
 const ops=[],add=(table,keys,row)=>ops.push({table,keys,row});
 const scope='account-free-note-workflow-scope',scopeId=id(scope),snId=id(p.slug),routeId=id(proposal.page.slug);
 add('attributes',['slug'],{id:scopeId,slug:scope,name:'Account-Free Personal Note Workflow Scope',description:'Documented local creation, editing and retention of personal notes in an installed desktop app without an app account. Sync, paid activation and external services are separate.',category:'workflow',value_type:'text'});
 add('products',['slug'],{id:snId,slug:p.slug,name:p.name,short_description:p.description,website_url:p.websiteUrl,status:'draft'});
 const urls=[...new Set(p.attributes.flatMap(c=>c.sources.map(s=>s.url)))].sort();
 for(const url of urls)add('evidence_sources',['seed_key'],{id:id('source:'+url),seed_key:'issue21-account-free-source:'+id(url),source_type:url.endsWith('/plans')?'pricing':'documentation',title:url.endsWith('/plans')?'Standard Notes plans':'Standard Notes account-free offline use',url,publisher:'Standard Notes',retrieved_at:'2026-11-02T00:00:00Z'});
 for(const c of p.attributes){
  if(!['no-account-required',scope,'pricing-model','trade-off-summary'].includes(c.slug)||c.verificationStatus!=='verified'||c.confidence!==.9||!c.sources.length)throw Error('Claim proposal drift');
  const attributeId=c.slug===scope?scopeId:baseline.attribute_taxonomy.find(a=>a.slug===c.slug)?.id;if(!attributeId)throw Error('Required taxonomy missing');
  add('product_attributes',['product_id','attribute_id'],{product_id:snId,attribute_id:attributeId,value_boolean:typeof c.value==='boolean'?c.value:null,value_text:typeof c.value==='string'?c.value:null,value_number:null,value_enum:null,confidence:c.confidence,verification_status:c.verificationStatus,last_verified_at:c.lastVerifiedAt});
  for(const source of c.sources){const key=p.slug+':'+c.slug+':'+source.url,evidenceId=id('claim:'+key);
   add('claim_evidence',['seed_key'],{id:evidenceId,seed_key:'issue21-account-free-claim:'+id(key),evidence_source_id:id('source:'+source.url),excerpt:null,notes:'Issue #21 documentary editorial draft only; source reference, not a quotation or hands-on test. Claim: '+c.slug});
   add('product_attribute_evidence',['product_id','attribute_id','claim_evidence_id'],{product_id:snId,attribute_id:attributeId,claim_evidence_id:evidenceId});
  }
 }
 add('escape_routes',['slug'],{id:routeId,slug:proposal.page.slug,name:proposal.page.name,description:proposal.page.description,anchor_id:null,status:'draft',editorially_approved:false,last_verified_at:proposal.page.lastVerifiedAt});
 for(const [i,slug] of ['affine','obsidian','standard-notes'].entries())add('escape_route_products',['escape_route_id','product_id'],{escape_route_id:routeId,product_id:slug==='standard-notes'?snId:baseline.products.find(p=>p.slug===slug).id,position:i+1,relevance_score:null,constraint_fit_score:null,quality_score:null,novelty_score:0,editorial_note:'Research membership only; not a published recommendation. Account-free desktop personal-note scope still needs final editorial acceptance.'});
 const guardProducts=baseline.products.map(clean),guardAttributes=baseline.product_attributes.map(clean),guardTaxonomy=baseline.attribute_taxonomy.map(clean);
 const payload={version:1,guardProducts,guardAttributes,guardTaxonomy,ops,snId,routeId,scopeId};
 return {payload,rehearse:sql(payload,'rehearse'),apply:sql(payload,'apply'),rollback:sql(payload,'rollback'),verify:verify(payload)};
}
function sql(data,mode){
 const payload=stable(data);if(payload.includes('$issue21$'))throw Error('Delimiter collision');
 return `-- Issue #21 account-free notes: ${mode}. Draft only; never updates existing rows.
DO $task$
DECLARE data jsonb=$issue21$${payload}$issue21$::jsonb;
 op jsonb; expected jsonb; actual jsonb; t text; k text; cols text; keys_sql text; match_sql text; found boolean; same boolean; before_public jsonb;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('software_discovery.issue21.account_free_draft'));
 LOCK TABLE software_discovery.products,software_discovery.attributes,software_discovery.product_attributes,software_discovery.escape_routes,software_discovery.escape_route_products,software_discovery.evidence_sources,software_discovery.claim_evidence,software_discovery.product_attribute_evidence IN SHARE ROW EXCLUSIVE MODE;
 SELECT jsonb_agg(to_jsonb(p) ORDER BY p.id) INTO before_public FROM software_discovery.products p WHERE status='published';
 FOR expected IN SELECT value FROM jsonb_array_elements(data->'guardProducts') LOOP
  SELECT to_jsonb(p)-'created_at'-'updated_at' INTO actual FROM software_discovery.products p WHERE p.id=(expected->>'id')::uuid;
  IF actual IS DISTINCT FROM expected THEN RAISE EXCEPTION 'Issue21 existing product baseline drift: %',expected->>'slug'; END IF;
 END LOOP;
 FOR expected IN SELECT value FROM jsonb_array_elements(data->'guardTaxonomy') LOOP
  SELECT to_jsonb(a)-'created_at'-'updated_at' INTO actual FROM software_discovery.attributes a WHERE a.id=(expected->>'id')::uuid;
  IF actual IS DISTINCT FROM expected THEN RAISE EXCEPTION 'Issue21 existing taxonomy baseline drift'; END IF;
 END LOOP;
 IF (SELECT count(*) FROM software_discovery.product_attributes WHERE product_id IN (SELECT (v->>'id')::uuid FROM jsonb_array_elements(data->'guardProducts') v))<>(SELECT count(*) FROM jsonb_array_elements(data->'guardAttributes')) THEN RAISE EXCEPTION 'Issue21 existing attribute count drift'; END IF;
 FOR expected IN SELECT value FROM jsonb_array_elements(data->'guardAttributes') LOOP
  SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',key,key),' AND ') INTO match_sql FROM jsonb_object_keys(expected) x(key);
  EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.product_attributes target CROSS JOIN jsonb_populate_record(NULL::software_discovery.product_attributes,$1) source WHERE %s)',match_sql) INTO same USING expected;
  IF NOT same THEN RAISE EXCEPTION 'Issue21 existing product attribute baseline drift'; END IF;
 END LOOP;
 FOR op IN SELECT value FROM jsonb_array_elements(data->'ops') ${mode==='rollback'?'WITH ORDINALITY x(value,n) ORDER BY n DESC':''} LOOP
  t=op->>'table';expected=op->'row';
  SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',value,value),' AND ') INTO keys_sql FROM jsonb_array_elements_text(op->'keys');
  SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',key,key),' AND '),string_agg(format('%I',key),',') INTO match_sql,cols FROM jsonb_object_keys(expected) x(key);
  EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s),EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s AND %s)',t,t,keys_sql,t,t,keys_sql,match_sql) INTO found,same USING expected;
  IF found AND NOT same THEN RAISE EXCEPTION 'Issue21 conflicting or edited row in %; no changes committed',t; END IF;
  ${mode==='rollback'?`IF NOT found THEN RAISE EXCEPTION 'Issue21 rollback requires intact imported rows: %',t; END IF;
  -- Refuse deleting a product/taxonomy/evidence source if later work depends on it.
  IF t='escape_routes' AND EXISTS(SELECT 1 FROM software_discovery.escape_route_products WHERE escape_route_id=(expected->>'id')::uuid) THEN RAISE EXCEPTION 'Issue21 route gained memberships'; END IF;
  IF t='product_attributes' AND EXISTS(SELECT 1 FROM software_discovery.product_attribute_evidence WHERE product_id=(expected->>'product_id')::uuid AND attribute_id=(expected->>'attribute_id')::uuid) THEN RAISE EXCEPTION 'Issue21 claim gained evidence'; END IF;
  IF t='claim_evidence' AND (EXISTS(SELECT 1 FROM software_discovery.product_attribute_evidence WHERE claim_evidence_id=(expected->>'id')::uuid) OR EXISTS(SELECT 1 FROM software_discovery.product_anchor_evidence WHERE claim_evidence_id=(expected->>'id')::uuid) OR EXISTS(SELECT 1 FROM software_discovery.product_problem_evidence WHERE claim_evidence_id=(expected->>'id')::uuid) OR EXISTS(SELECT 1 FROM software_discovery.product_audience_evidence WHERE claim_evidence_id=(expected->>'id')::uuid)) THEN RAISE EXCEPTION 'Issue21 fragment gained references'; END IF;
  IF t='evidence_sources' AND EXISTS(SELECT 1 FROM software_discovery.claim_evidence WHERE evidence_source_id=(expected->>'id')::uuid) THEN RAISE EXCEPTION 'Issue21 source gained references'; END IF;
  IF t='products' AND (EXISTS(SELECT 1 FROM software_discovery.product_attributes WHERE product_id=(expected->>'id')::uuid) OR EXISTS(SELECT 1 FROM software_discovery.product_anchors WHERE product_id=(expected->>'id')::uuid) OR EXISTS(SELECT 1 FROM software_discovery.product_problems WHERE product_id=(expected->>'id')::uuid) OR EXISTS(SELECT 1 FROM software_discovery.product_audiences WHERE product_id=(expected->>'id')::uuid) OR EXISTS(SELECT 1 FROM software_discovery.escape_route_products WHERE product_id=(expected->>'id')::uuid)) THEN RAISE EXCEPTION 'Issue21 product gained claims or memberships'; END IF;
  IF t='attributes' AND EXISTS(SELECT 1 FROM software_discovery.product_attributes WHERE attribute_id=(expected->>'id')::uuid) THEN RAISE EXCEPTION 'Issue21 scope gained claims'; END IF;
  EXECUTE format('DELETE FROM software_discovery.%I target USING jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s',t,t,keys_sql) USING expected;`:`IF NOT found THEN EXECUTE format('INSERT INTO software_discovery.%I (%s) SELECT %s FROM jsonb_populate_record(NULL::software_discovery.%I,$1)',t,cols,cols,t) USING expected; END IF;`}
 END LOOP;
 IF before_public IS DISTINCT FROM (SELECT jsonb_agg(to_jsonb(p) ORDER BY p.id) FROM software_discovery.products p WHERE status='published') THEN RAISE EXCEPTION 'Issue21 published products changed'; END IF;
 ${mode==='rehearse'?`RAISE EXCEPTION USING ERRCODE='P2121',MESSAGE='Issue21 rehearsal complete';`:`RAISE NOTICE 'Issue21 ${mode} complete. Existing published data preserved.';`}
${mode==='rehearse'?`EXCEPTION WHEN SQLSTATE 'P2121' THEN RAISE NOTICE 'Issue21 rehearsal rolled back; no data persisted.';`:''}
END $task$;
`;
}
function verify(data){
 const literal=value=>"'"+JSON.stringify(value).replaceAll("'","''")+"'::jsonb";
 const matches=(table,row)=>`EXISTS(SELECT 1 FROM software_discovery.${table} target CROSS JOIN jsonb_populate_record(NULL::software_discovery.${table},${literal(row)}) source WHERE ${Object.keys(row).map(k=>`target.${k} IS NOT DISTINCT FROM source.${k}`).join(' AND ')})`;
 const imported=data.ops.map(op=>matches(op.table,op.row)).join(' AND ');
 const claims=`(SELECT count(*) FROM software_discovery.product_attributes WHERE product_id IN (${data.guardProducts.map(p=>`'${p.id}'`).join(',')}))=${data.guardAttributes.length} AND `+data.guardAttributes.map(row=>matches('product_attributes',row)).join(' AND ');
 const products=data.guardProducts.map(row=>matches('products',row)).join(' AND ');
 return `-- Issue #21 read-only verification; all rows must be true.
WITH checks AS (
 SELECT 'imported_rows_match_expected' check_name, ${imported} passed
 UNION ALL SELECT 'existing_claims_unchanged',${claims}
 UNION ALL SELECT 'existing_product_metadata_unchanged',${products}
 UNION ALL SELECT 'standard_notes_draft', EXISTS(SELECT 1 FROM software_discovery.products WHERE id='${data.snId}' AND slug='standard-notes' AND status='draft') passed
 UNION ALL SELECT 'route_unapproved_draft',EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE id='${data.routeId}' AND status='draft' AND NOT editorially_approved)
 UNION ALL SELECT 'three_research_members', (SELECT count(*)=3 FROM software_discovery.escape_route_products WHERE escape_route_id='${data.routeId}')
 UNION ALL SELECT 'four_standard_notes_claims',(SELECT count(*)=4 FROM software_discovery.product_attributes WHERE product_id='${data.snId}')
 UNION ALL SELECT 'standard_notes_not_public',software_discovery.product_discovery_page('standard-notes') IS NULL
 UNION ALL SELECT 'existing_products_published',(SELECT count(*)=2 FROM software_discovery.products WHERE slug IN ('obsidian','affine') AND status='published')
 UNION ALL SELECT 'existing_products_no_new_scope',NOT EXISTS(SELECT 1 FROM software_discovery.product_attributes WHERE product_id IN (${data.guardProducts.map(p=>`'${p.id}'`).join(',')}) AND attribute_id='${data.scopeId}')
 UNION ALL SELECT 'claim_sources_linked',NOT EXISTS(SELECT 1 FROM software_discovery.product_attributes a WHERE a.product_id='${data.snId}' AND NOT EXISTS(SELECT 1 FROM software_discovery.product_attribute_evidence l WHERE l.product_id=a.product_id AND l.attribute_id=a.attribute_id))
)
SELECT * FROM checks ORDER BY check_name;
`;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=buildAccountFreeImport();
 for(const [name,value] of [['REHEARSE',result.rehearse],['APPLY',result.apply],['ROLLBACK',result.rollback]]){const out=path.join(root,'supabase/data/ISSUE21_ACCOUNT_FREE_'+name+'.sql');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,value);}
 const out=path.join(root,'supabase/verification/ISSUE21_ACCOUNT_FREE_VERIFY.sql');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,result.verify);
 console.log('Generated guarded draft-only rehearsal/apply/rollback and read-only verification SQL. No database connections.');
}
