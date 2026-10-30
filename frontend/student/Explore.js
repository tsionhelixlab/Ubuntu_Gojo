const token = localStorage.getItem('token');
const $ = id => document.getElementById(id);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statusLabels = { ELIGIBLE:'Eligible', POTENTIALLY_ELIGIBLE:'Potentially eligible', REQUIREMENTS_NOT_MET:'Requirements not met' };
const trackingLabels = { RESEARCHING:'Researching', CONSIDERING:'Considering', PLANNING_TO_APPLY:'Planning to apply', APPLIED:'Applied' };
let lastResults = [];
if (!token) location.href = '../auth/signin.html';

function request(path, options={}) {
  return fetch(`${API_BASE_URL}${path}`, { ...options, headers: { Authorization:`Bearer ${token}`, 'Content-Type':'application/json', ...(options.headers||{}) } }).then(async r => {
    const data = await r.json().catch(()=>({}));
    if (r.status === 401) { localStorage.clear(); location.href='../auth/signin.html'; throw new Error('Please sign in again.'); }
    if (!r.ok) throw new Error(data.message || 'Request failed');
    return data;
  });
}
function queryString() {
  const params = new URLSearchParams();
  for (const id of ['q','type','subtype','field','country','education_level','eligibility','deadline','sort']) {
    const value = $(id).value.trim(); if (value) params.set(id, value);
  }
  if ($('expired').checked) params.set('status','expired');
  return params.toString();
}
function labelEligibility(status) { return statusLabels[status] || 'Needs assessment'; }
function pillClass(status) { return status === 'ELIGIBLE' ? 'eligible' : status === 'REQUIREMENTS_NOT_MET' ? 'notmet' : 'potential'; }
function deadlineText(deadline) { return deadline?.label || 'Deadline not provided'; }
function renderCard(item) {
  const o=item.opportunity, saved=item.savedStatus;
  const fieldNames=(o.fields||[]).slice(0,3).join(', ');
  const reasons=(item.goalFit?.dimensions||[]).filter(d=>d.state==='ALIGNS').map(d=>`${d.dimension.replaceAll('_',' ')} aligns`).slice(0,2);
  const reason=item.goalFit?.status==='NOT_PERSONALIZED' ? 'Goal fit is not personalized yet. You can still explore this opportunity.' : (reasons.length ? reasons.join(' · ') : item.goalFit?.explanation || 'Review the details to see how this opportunity fits your plans.');
  const card=document.createElement('article'); card.className='op-card';
  card.innerHTML=`<div class="card-top"><div><h3>${escapeHtml(o.title)}</h3><div class="provider">${escapeHtml(o.provider || 'Provider not specified')}</div></div></div>
    <div class="pills"><span class="pill ${pillClass(item.eligibility?.status)}">${escapeHtml(labelEligibility(item.eligibility?.status))}</span><span class="pill">${escapeHtml(o.subtype_category || o.category || 'Opportunity')}</span>${o.subtype_name?`<span class="pill">${escapeHtml(o.subtype_name.replaceAll('_',' ').toLowerCase())}</span>`:''}${item.dataQuality?.needsReview?'<span class="pill warning">Information needs review</span>':''}</div>
    <p class="summary">${escapeHtml((o.description||'No description has been provided yet.').slice(0,220))}${(o.description||'').length>220?'…':''}</p>
    <div class="meta"><span><i class="fa-regular fa-calendar"></i>${escapeHtml(deadlineText(item.deadline))}</span>${fieldNames?`<span><i class="fa-solid fa-book-open"></i>${escapeHtml(fieldNames)}</span>`:''}</div>
    <div class="reason"><strong>Goal fit:</strong> ${escapeHtml(reason)}</div>
    <div class="card-actions"><button class="details" data-details="${o.opportunity_id}">View details</button><button class="${saved?'saved':''}" data-save="${o.opportunity_id}">${saved?'Saved · '+escapeHtml(trackingLabels[saved]||saved):'＋ Save opportunity'}</button>${o.application_url?`<a href="${escapeHtml(o.application_url)}" target="_blank" rel="noopener noreferrer">Official page ↗</a>`:''}</div>`;
  card.querySelector('[data-details]').addEventListener('click',()=>showDetails(o.opportunity_id));
  card.querySelector('[data-save]').addEventListener('click',()=>saveOpportunity(o.opportunity_id,saved));
  return card;
}
async function loadExplore() {
  $('results').innerHTML='<div class="loading">Loading opportunities…</div>';
  try {
    const data=await request(`/matching/explore?${queryString()}`); lastResults=data.opportunities||[];
    $('resultsTitle').textContent=$('expired').checked?'Past opportunities':'Explore opportunities';
    $('resultCount').textContent=`${data.total} result${data.total===1?'':'s'}`;
    $('results').replaceChildren();
    if (!lastResults.length) { $('results').innerHTML='<div class="empty"><h3>No opportunities found</h3><p>Try changing your search or clearing some filters. You can explore without setting study goals.</p><button class="quiet" id="emptyClear">Clear filters</button></div>'; $('emptyClear').onclick=clearFilters; return; }
    const subtypeValues=[...new Set(lastResults.map(x=>x.opportunity.subtype_name).filter(Boolean))].sort();
    const subtypeSelect=$('subtype'); const selected=subtypeSelect.value;
    subtypeSelect.innerHTML='<option value="">All subtypes</option>'+subtypeValues.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s.replaceAll('_',' ').toLowerCase())}</option>`).join('');
    if (subtypeValues.includes(selected)) subtypeSelect.value=selected;
    lastResults.forEach(item=>$('results').appendChild(renderCard(item)));
  } catch(e) { $('results').innerHTML=`<div class="empty"><h3>Could not load opportunities</h3><p>${escapeHtml(e.message)}</p><p>Confirm that the database migration has been applied and the server is running.</p></div>`; }
}
async function saveOpportunity(id, currentStatus) {
  try {
    if (currentStatus) { location.href='MyOpportunities.html'; return; }
    await request(`/matching/saved/${id}`,{method:'POST',body:JSON.stringify({status:'RESEARCHING'})});
    await loadExplore();
  } catch(e) { alert(e.message); }
}
async function showDetails(id) {
  $('detailContent').innerHTML='<p>Loading opportunity details…</p>'; $('detailBackdrop').hidden=false;
  try {
    const data=await request(`/matching/opportunities/${id}`); const item=data.result; const o=item.opportunity;
    const checks=(item.eligibility.checks||[]).map(c=>`<div class="check-row"><strong>${escapeHtml(c.requirement)}</strong> <span class="state ${escapeHtml(c.state)}">${escapeHtml(c.state.replace('_',' '))}</span><p>${escapeHtml(c.explanation)}</p><small>Student: ${escapeHtml(typeof c.studentValue==='object'?JSON.stringify(c.studentValue):c.studentValue??'Not provided')} · Required: ${escapeHtml(typeof c.required==='object'?JSON.stringify(c.required):c.required??'Not specified')}</small></div>`).join('') || '<p>No confirmed mandatory requirements are recorded yet. This does not by itself confirm eligibility.</p>';
    const dimensions=(item.goalFit.dimensions||[]).map(d=>`<li><b>${escapeHtml(d.dimension.replaceAll('_',' '))}:</b> ${escapeHtml(d.state)} — target ${escapeHtml(Array.isArray(d.target)?d.target.join(', '):d.target)}</li>`).join('') || '<li>Not personalized yet. Set a goal if you want goal-fit guidance.</li>';
    const warnings=(item.dataQuality.warnings||[]).map(w=>`<li>${escapeHtml(w)}</li>`).join('')||'<li>No automatic data warnings.</li>';
    const next=(item.nextSteps||[]).map(n=>`<li>${escapeHtml(n.action)}</li>`).join('')||'<li>Review the official opportunity information before applying.</li>';
    $('detailContent').innerHTML=`<p class="eyebrow">${escapeHtml(o.subtype_category||o.category||'OPPORTUNITY')}</p><h2 id="detailTitle">${escapeHtml(o.title)}</h2><p class="provider">${escapeHtml(o.provider||'Provider not specified')}</p><div class="pills"><span class="pill ${pillClass(item.eligibility.status)}">${escapeHtml(labelEligibility(item.eligibility.status))}</span><span class="pill">${escapeHtml(item.classification.label)}</span></div>
      <div class="detail-section"><h3>About this opportunity</h3><p>${escapeHtml(o.description||'Description not provided.')}</p><p><b>Subtype:</b> ${escapeHtml(o.subtype_name||'Not specified')} · <b>Deadline:</b> ${escapeHtml(deadlineText(item.deadline))}</p><p><b>Destinations:</b> ${escapeHtml((o.destinations||[]).join(', ')||'Not provided')} · <b>Fields:</b> ${escapeHtml((o.fields||[]).join(', ')||'Not provided')} · <b>Education levels:</b> ${escapeHtml((o.education_levels||[]).join(', ')||'Not provided')}</p>${o.application_url?`<p><a class="official" href="${escapeHtml(o.application_url)}" target="_blank" rel="noopener noreferrer">Open official opportunity page ↗</a></p>`:''}</div>
      <div class="detail-section"><h3>Eligibility breakdown</h3><p>${escapeHtml(labelEligibility(item.eligibility.status))}. Missing information is marked unknown rather than automatically treated as failure.</p>${checks}</div>
      <div class="detail-section"><h3>Goal fit</h3><p>${escapeHtml(item.goalFit.explanation)}</p><ul>${dimensions}</ul>${item.goalFit.score!==null?`<p><b>Goal-fit indicator:</b> ${item.goalFit.score}% of assessable dimensions align. This is not an eligibility score.</p>`:''}</div>
      <div class="detail-section"><h3>Information to verify</h3><ul>${warnings}</ul><p><b>Classification:</b> ${escapeHtml(item.classification.explanation)}</p></div>
      <div class="detail-section"><h3>Suggested next steps</h3><ul>${next}</ul></div>
      <div class="card-actions"><button class="details" id="detailSave">${item.savedStatus?'Open My Opportunities':'Save to My Opportunities'}</button>${o.application_url?`<a href="${escapeHtml(o.application_url)}" target="_blank" rel="noopener noreferrer">Official page ↗</a>`:''}</div>`;
    $('detailSave').onclick=async()=>{if(item.savedStatus){location.href='MyOpportunities.html';return;}await saveOpportunity(id,null);$('detailBackdrop').hidden=true;};
  } catch(e) { $('detailContent').innerHTML=`<h2>Unable to load details</h2><p>${escapeHtml(e.message)}</p>`; }
}
function clearFilters(){['q','type','subtype','field','country','education_level','eligibility','deadline'].forEach(id=>$(id).value='');$('sort').value='relevance';$('expired').checked=false;loadExplore();}
$('searchForm').addEventListener('submit',e=>{e.preventDefault();loadExplore();});
['type','subtype','field','country','education_level','eligibility','deadline','sort','expired'].forEach(id=>$(id).addEventListener('change',loadExplore));
$('clearFilters').addEventListener('click',clearFilters);$('closeDetails').addEventListener('click',()=>$('detailBackdrop').hidden=true);$('detailBackdrop').addEventListener('click',e=>{if(e.target===$('detailBackdrop'))$('detailBackdrop').hidden=true;});document.addEventListener('keydown',e=>{if(e.key==='Escape')$('detailBackdrop').hidden=true;});
loadExplore();
