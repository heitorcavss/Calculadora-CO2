let mapFetchedDistance = null;

document.addEventListener('DOMContentLoaded', () => {
  populateCitySelects();
  bindEvents();
  setInputMode('map');
});

// ── Event binding ─────────────────────────────────────────────────────────────

function bindEvents() {
  document.getElementById('calculate-btn').addEventListener('click', handleCalculate);
  document.getElementById('reset-btn').addEventListener('click', handleReset);

  document.querySelectorAll('input[name="input-mode"]').forEach(radio => {
    radio.addEventListener('change', e => setInputMode(e.target.value));
  });

  // Combobox mode — auto-busca quando ambas as cidades estão selecionadas
  ['origin-city', 'destination-city'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      mapFetchedDistance = null;
      document.getElementById('route-result').classList.add('hidden');
      const origin = document.getElementById('origin-city').value;
      const dest   = document.getElementById('destination-city').value;
      if (origin && dest) handleFetchRoute(origin, dest, 'route-result');
    });
  });

  // Modo texto livre — botão + Enter
  document.getElementById('fetch-manual-btn').addEventListener('click', handleFetchManual);
  ['origin-text', 'destination-text'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      mapFetchedDistance = null;
      document.getElementById('manual-route-result').classList.add('hidden');
    });
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') handleFetchManual();
    });
  });

  document.getElementById('profile').addEventListener('change', updateProfileHint);
}

// ── Populate city selects ─────────────────────────────────────────────────────

function populateCitySelects() {
  ['origin-city', 'destination-city'].forEach(id => {
    const select = document.getElementById(id);
    CITIES_DATA.forEach(city => {
      const opt = document.createElement('option');
      opt.value       = city.query;
      opt.textContent = city.name;
      select.appendChild(opt);
    });
  });
}

// ── Input mode ────────────────────────────────────────────────────────────────

function setInputMode(mode) {
  document.getElementById('map-section').classList.toggle('hidden',             mode !== 'map');
  document.getElementById('manual-distance-section').classList.toggle('hidden', mode !== 'manual');
  mapFetchedDistance = null;
  document.getElementById('route-result').classList.add('hidden');
  document.getElementById('manual-route-result').classList.add('hidden');
}

// ── Profile hint ──────────────────────────────────────────────────────────────

function updateProfileHint() {
  const profile = document.getElementById('profile').value;
  const hint    = document.getElementById('profile-hint');
  if (hint) hint.textContent = CONFIG.PROFILE_DESCRIPTIONS[profile] || '';
}

// ── Main calculate handler ────────────────────────────────────────────────────

function handleCalculate() {
  hideError();

  if (!mapFetchedDistance) {
    const mode = document.querySelector('input[name="input-mode"]:checked')?.value || 'map';
    showError(mode === 'map'
      ? 'Selecione origem e destino para buscar a rota automaticamente.'
      : 'Clique em "Buscar distância" antes de calcular.');
    return;
  }

  const transport  = document.getElementById('transport').value;
  const profile    = document.getElementById('profile').value;
  const passengers = Math.max(1, parseInt(document.getElementById('passengers').value) || 1);
  const roundTrip  = document.getElementById('round-trip').checked;

  setLoading(true);

  setTimeout(() => {
    const result = calculateCO2(mapFetchedDistance, transport, profile, passengers, roundTrip);
    if (result) {
      renderResults(result);
    } else {
      showError('Erro ao calcular. Verifique os dados e tente novamente.');
    }
    setLoading(false);
  }, 400);
}

// ── Reset ─────────────────────────────────────────────────────────────────────

function handleReset() {
  document.getElementById('calc-form').reset();
  document.getElementById('results').classList.add('hidden');
  mapFetchedDistance = null;
  document.getElementById('route-result').classList.add('hidden');
  document.getElementById('manual-route-result').classList.add('hidden');
  setInputMode('map');
  hideError();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Route fetch — modo texto livre ────────────────────────────────────────────

function handleFetchManual() {
  const origin = document.getElementById('origin-text').value.trim();
  const dest   = document.getElementById('destination-text').value.trim();
  if (!origin || !dest) { showError('Informe a cidade de origem e de destino.'); return; }
  mapFetchedDistance = null;
  document.getElementById('manual-route-result').classList.add('hidden');
  handleFetchRoute(origin, dest, 'manual-route-result');
}

// ── Route fetch — núcleo compartilhado ───────────────────────────────────────

async function handleFetchRoute(origin, dest, resultElId) {
  if (origin === dest) { showError('Origem e destino não podem ser iguais.'); return; }

  hideError();
  const resultEl      = document.getElementById(resultElId);
  resultEl.textContent = '⏳  Calculando rota...';
  resultEl.classList.remove('hidden');

  try {
    const route = await fetchRouteDistance(origin, dest);
    mapFetchedDistance = route.distanceKm;

    const h   = Math.floor(route.durationMin / 60);
    const m   = route.durationMin % 60;
    const dur = h > 0 ? `${h}h ${m}min` : `${m}min`;
    resultEl.textContent = `📍 ${route.from.name} → ${route.to.name} · ${route.distanceKm} km · ~${dur} de carro`;

    const transport = document.getElementById('transport');
    if (transport.value === 'plane_short' && route.distanceKm > 1000) transport.value = 'plane_long';
    if (transport.value === 'plane_long'  && route.distanceKm <= 1000) transport.value = 'plane_short';
  } catch (err) {
    resultEl.classList.add('hidden');
    showError(err.message);
  }
}
