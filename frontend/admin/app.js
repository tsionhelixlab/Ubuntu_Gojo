(() => {
  const token = localStorage.getItem('token');
  if (!token) { alert('Please sign in with an administrator account.'); location.href = '../auth/signin.html'; return; }

  const API = '/api/admin';
  const $ = id => document.getElementById(id);
  let opportunities = [], subtypes = [], resources = [], lessons = [];
  let toastTimer;

  async function request(path, options = {}) {
    const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
    if (options.body) headers['Content-Type'] = 'application/json';
    const response = await fetch(`${API}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      alert(data.message || 'Your account does not have administrator access.');
      location.href = '../auth/signin.html';
      throw new Error(data.message || 'Access denied');
    }
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  }
  function notify(message) {
    $('toast').textContent = message;
    $('toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2800);
  }
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }
  function csv(value) { return Array.isArray(value) ? value.join(', ') : ''; }
  function setTab(name) {
    document.querySelectorAll('.tab').forEach(button => button.classList.toggle('active', button.dataset.tab === name));
    ['overview', 'opportunities', 'resources'].forEach(section => $(`${section}-section`).classList.toggle('hidden', section !== name));
  }
  document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => setTab(button.dataset.tab)));

  async function loadOverview() {
    const data = await request('/overview');
    $('stat-total').textContent = data.opportunities.total;
    $('stat-active').textContent = data.opportunities.active;
    $('stat-unverified').textContent = data.opportunities.unverified;
    $('stat-resources').textContent = data.resources;
  }
  async function loadSubtypes() {
    const data = await request('/opportunity-subtypes');
    subtypes = data.data || [];
    $('opp-subtype').innerHTML = '<option value="">Choose subtype</option>' + subtypes.map(item => `<option value="${item.subtype_id}">${esc(item.category)} — ${esc(item.subtype_name.replaceAll('_', ' '))}</option>`).join('');
  }
  async function loadOpportunities() {
    const data = await request('/opportunities');
    opportunities = data.data || [];
    renderOpportunities();
  }
  function renderOpportunities() {
    const query = $('opp-search').value.trim().toLowerCase();
    const rows = opportunities.filter(item => [item.title, item.provider, item.subtype_name, item.subtype_category].some(v => String(v || '').toLowerCase().includes(query)));
    $('opp-rows').innerHTML = rows.length ? rows.map(item => `
      <tr><td><div class="item-title">${esc(item.title)}</div><div class="item-subtitle">${esc(item.provider || 'Provider not entered')}</div></td>
      <td>${esc((item.subtype_name || item.category || '—').replaceAll('_', ' '))}</td>
      <td>${item.deadline ? esc(String(item.deadline).slice(0, 10)) : '—'}</td>
      <td><span class="pill ${item.is_verified ? 'good' : 'warn'}">${item.is_verified ? 'Verified' : 'Unverified'}</span></td>
      <td><span class="pill ${item.is_active ? 'good' : 'off'}">${item.is_active ? 'Active' : 'Inactive'}</span></td>
      <td><div class="actions"><button class="action" data-action="edit-opp" data-id="${item.opportunity_id}">Edit</button><button class="action" data-action="toggle-opp" data-id="${item.opportunity_id}">${item.is_active ? 'Deactivate' : 'Activate'}</button><button class="action danger" data-action="delete-opp" data-id="${item.opportunity_id}">Delete</button></div></td></tr>`).join('') : '<tr><td colspan="6">No opportunities found.</td></tr>';
  }
  function addTestRow(test = {}) {
    const row = document.createElement('div');
    row.className = 'test-row';
    row.innerHTML = `<input class="test-name" placeholder="Test name (IELTS, SAT...)" value="${esc(test.test_type || '')}">
      <input class="test-min" type="number" step="0.001" placeholder="Minimum score" value="${test.min_score ?? ''}">
      <input class="test-max" type="number" step="0.001" placeholder="Maximum (optional)" value="${test.max_score ?? ''}">
      <button class="remove-test" type="button" aria-label="Remove test">×</button>`;
    row.querySelector('.remove-test').addEventListener('click', () => row.remove());
    $('test-list').appendChild(row);
  }
  function getTests() {
    return [...$('test-list').querySelectorAll('.test-row')].map(row => ({
      test_type: row.querySelector('.test-name').value.trim(),
      min_score: row.querySelector('.test-min').value,
      max_score: row.querySelector('.test-max').value
    })).filter(test => test.test_type && test.min_score !== '');
  }
  function resetOpportunityForm() {
    $('opportunity-form').reset(); $('opp-id').value = ''; $('opp-active').checked = true;
    $('opp-form-title').textContent = 'Add an opportunity'; $('save-opp').textContent = 'Save opportunity';
    $('cancel-opp').classList.add('hidden'); $('test-list').innerHTML = ''; $('opp-form-message').textContent = '';
  }
  function editOpportunity(item) {
    $('opp-id').value = item.opportunity_id; $('opp-title').value = item.title || ''; $('opp-provider').value = item.provider || '';
    $('opp-subtype').value = item.subtype_id; $('opp-deadline').value = item.deadline ? String(item.deadline).slice(0, 10) : '';
    $('opp-url').value = item.application_url || ''; $('opp-min-age').value = item.min_age ?? ''; $('opp-max-age').value = item.max_age ?? '';
    $('opp-min-academic').value = item.min_academic_percent ?? ''; $('opp-purpose').value = item.opportunity_purpose || '';
    $('opp-description').value = item.description || ''; $('opp-countries').value = csv(item.countries); $('opp-destinations').value = csv(item.destinations);
    $('opp-fields').value = csv(item.fields); $('opp-education').value = csv(item.education_levels);
    $('opp-verified').checked = Boolean(item.is_verified); $('opp-active').checked = Boolean(item.is_active);
    $('test-list').innerHTML = ''; (item.test_requirements || []).forEach(addTestRow);
    $('opp-form-title').textContent = 'Edit opportunity'; $('save-opp').textContent = 'Update opportunity'; $('cancel-opp').classList.remove('hidden');
    setTab('opportunities'); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  $('opportunity-form').addEventListener('submit', async event => {
    event.preventDefault();
    const id = $('opp-id').value;
    const payload = {
      title: $('opp-title').value.trim(), provider: $('opp-provider').value.trim(), subtype_id: Number($('opp-subtype').value),
      deadline: $('opp-deadline').value || null, application_url: $('opp-url').value.trim(),
      min_age: $('opp-min-age').value, max_age: $('opp-max-age').value, min_academic_percent: $('opp-min-academic').value,
      opportunity_purpose: $('opp-purpose').value.trim(), description: $('opp-description').value.trim(),
      countries: $('opp-countries').value, destinations: $('opp-destinations').value, fields: $('opp-fields').value,
      education_levels: $('opp-education').value, test_requirements: getTests(), is_verified: $('opp-verified').checked, is_active: $('opp-active').checked
    };
    if (!payload.subtype_id) return $('opp-form-message').textContent = 'Please choose an opportunity subtype.';
    $('save-opp').disabled = true; $('opp-form-message').textContent = 'Saving...';
    try {
      await request(id ? `/opportunities/${id}` : '/opportunities', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      resetOpportunityForm(); await Promise.all([loadOpportunities(), loadOverview()]); notify(id ? 'Opportunity updated.' : 'Opportunity added.');
    } catch (error) { $('opp-form-message').textContent = error.message; }
    finally { $('save-opp').disabled = false; }
  });
  $('opp-rows').addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]'); if (!button) return;
    const item = opportunities.find(row => String(row.opportunity_id) === button.dataset.id); if (!item) return;
    try {
      if (button.dataset.action === 'edit-opp') return editOpportunity(item);
      if (button.dataset.action === 'delete-opp') {
        if (!confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
        await request(`/opportunities/${item.opportunity_id}`, { method: 'DELETE' }); notify('Opportunity deleted.');
      }
      if (button.dataset.action === 'toggle-opp') {
        await request(`/opportunities/${item.opportunity_id}/status`, { method: 'PATCH', body: JSON.stringify({ is_active: !item.is_active }) });
        notify(item.is_active ? 'Opportunity deactivated.' : 'Opportunity activated.');
      }
      await Promise.all([loadOpportunities(), loadOverview()]);
    } catch (error) { notify(error.message); }
  });
  $('opp-search').addEventListener('input', renderOpportunities);
  $('add-test').addEventListener('click', () => addTestRow());
  $('cancel-opp').addEventListener('click', resetOpportunityForm);
  $('new-opportunity').addEventListener('click', () => { resetOpportunityForm(); $('opp-title').focus(); });

  async function loadLearningOptions() {
    const data = await request('/learning-options');
    lessons = data.lessons || [];
    $('resource-lesson').innerHTML = '<option value="">Choose lesson</option>' + lessons.map(item => `<option value="${item.lesson_id}">${esc(item.level_title)} / ${esc(item.topic_title)} / ${esc(item.lesson_title)}</option>`).join('');
  }
  async function loadResources() {
    const data = await request('/learning-resources'); resources = data.data || []; renderResources();
  }
  function renderResources() {
    const query = $('resource-search').value.trim().toLowerCase();
    const rows = resources.filter(item => [item.title, item.lesson_title, item.topic_title, item.level_title, item.resource_type].some(v => String(v || '').toLowerCase().includes(query)));
    $('resource-rows').innerHTML = rows.length ? rows.map(item => `<tr><td><div class="item-title">${esc(item.title)}</div><div class="item-subtitle"><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Open resource ↗</a></div></td>
      <td><div>${esc(item.lesson_title)}</div><div class="item-subtitle">${esc(item.level_title)} / ${esc(item.topic_title)}</div></td><td>${esc(item.resource_type)}</td><td>${item.is_free ? 'Yes' : 'No'}</td>
      <td><div class="actions"><button class="action" data-action="edit-resource" data-id="${item.resource_id}">Edit</button><button class="action danger" data-action="delete-resource" data-id="${item.resource_id}">Delete</button></div></td></tr>`).join('') : '<tr><td colspan="5">No learning resources found.</td></tr>';
  }
  function resetResourceForm() {
    $('resource-form').reset(); $('resource-id').value = ''; $('resource-order').value = 1; $('resource-free').checked = true;
    $('resource-form-title').textContent = 'Add a learning resource'; $('save-resource').textContent = 'Save resource';
    $('cancel-resource').classList.add('hidden'); $('resource-form-message').textContent = '';
  }
  $('resource-form').addEventListener('submit', async event => {
    event.preventDefault();
    const id = $('resource-id').value;
    const payload = { lesson_id: Number($('resource-lesson').value), title: $('resource-title').value.trim(), resource_type: $('resource-type').value,
      url: $('resource-url').value.trim(), description: $('resource-description').value.trim(), display_order: Number($('resource-order').value) || 1, is_free: $('resource-free').checked };
    if (!payload.lesson_id) return $('resource-form-message').textContent = 'Please choose an existing lesson.';
    $('save-resource').disabled = true; $('resource-form-message').textContent = 'Saving...';
    try {
      await request(id ? `/learning-resources/${id}` : '/learning-resources', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      resetResourceForm(); await Promise.all([loadResources(), loadOverview()]); notify(id ? 'Resource updated.' : 'Resource added.');
    } catch (error) { $('resource-form-message').textContent = error.message; }
    finally { $('save-resource').disabled = false; }
  });
  $('resource-rows').addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]'); if (!button) return;
    const item = resources.find(row => String(row.resource_id) === button.dataset.id); if (!item) return;
    if (button.dataset.action === 'edit-resource') {
      $('resource-id').value = item.resource_id; $('resource-lesson').value = item.lesson_id; $('resource-title').value = item.title;
      $('resource-type').value = item.resource_type; $('resource-url').value = item.url; $('resource-description').value = item.description || '';
      $('resource-order').value = item.display_order; $('resource-free').checked = Boolean(item.is_free);
      $('resource-form-title').textContent = 'Edit learning resource'; $('save-resource').textContent = 'Update resource'; $('cancel-resource').classList.remove('hidden');
      setTab('resources'); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
    }
    if (button.dataset.action === 'delete-resource' && confirm(`Delete “${item.title}”?`)) {
      try { await request(`/learning-resources/${item.resource_id}`, { method: 'DELETE' }); await Promise.all([loadResources(), loadOverview()]); notify('Resource deleted.'); }
      catch (error) { notify(error.message); }
    }
  });
  $('resource-search').addEventListener('input', renderResources);
  $('cancel-resource').addEventListener('click', resetResourceForm);
  $('new-resource').addEventListener('click', () => { resetResourceForm(); $('resource-title').focus(); });
  $('refresh-btn').addEventListener('click', async () => {
    try { await Promise.all([loadOverview(), loadOpportunities(), loadResources()]); notify('Dashboard refreshed.'); }
    catch (error) { notify(error.message); }
  });

  (async function init() {
    try {
      await Promise.all([loadOverview(), loadSubtypes(), loadOpportunities(), loadLearningOptions(), loadResources()]);
    } catch (error) { notify(error.message); console.error('Admin dashboard initialization:', error); }
  })();
})();
