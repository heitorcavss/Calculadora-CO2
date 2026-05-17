// ── Results renderer ──────────────────────────────────────────────────────────

function renderResults(result) {
  const section = document.getElementById('results');
  section.classList.remove('hidden');
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Hero numbers
  document.getElementById('co2-value').textContent      = formatCO2Long(result.co2PerPassenger);
  document.getElementById('total-co2').textContent      = formatCO2Long(result.totalCO2);
  document.getElementById('trees-needed').textContent   = result.treesNeeded;
  document.getElementById('total-distance').textContent = `${result.totalDistance} km`;

  // Classification badge
  const cls = result.classification;
  const badge = document.getElementById('classification');
  badge.textContent  = `${cls.icon}  ${cls.label}`;
  badge.style.color  = cls.color;
  badge.style.borderColor = cls.color;
  badge.className    = `badge badge--${cls.key}`;

  renderMeter(result.co2PerPassenger);
  renderComparison(result.comparison, result.transport.key);
  renderTips(result);
}

// ── CO₂ meter ────────────────────────────────────────────────────────────────

function renderMeter(co2Kg) {
  const MAX  = 300;
  const pct  = Math.min((co2Kg / MAX) * 100, 100);
  const fill = document.getElementById('co2-meter-fill');
  fill.style.width = `${pct}%`;

  const cls = getClassification(co2Kg);
  const gradients = {
    low:    'linear-gradient(90deg, #27ae60, #2ecc71)',
    medium: 'linear-gradient(90deg, #f39c12, #e67e22)',
    high:   'linear-gradient(90deg, #e74c3c, #c0392b)',
  };
  fill.style.background = gradients[cls.key] ?? gradients.high;
}

// ── Comparison bars ───────────────────────────────────────────────────────────

function renderComparison(comparison, currentKey) {
  const container = document.getElementById('comparison-list');
  container.innerHTML = '';

  const maxCO2 = Math.max(...comparison.map(c => c.co2PerPassenger), 0.001);

  comparison.forEach(item => {
    const pct     = (item.co2PerPassenger / maxCO2) * 100;
    const isCur   = item.key === currentKey;
    const display = item.co2PerPassenger === 0 ? '♻ Zero emissões' : formatCO2(item.co2PerPassenger);

    const div = document.createElement('div');
    div.className = `comparison-item${isCur ? ' comparison-item--current' : ''}`;
    div.innerHTML = `
      <div class="comparison-header">
        <span class="comparison-icon">${item.icon}</span>
        <span class="comparison-label">${item.label}${isCur ? ' <em>(sua escolha)</em>' : ''}</span>
        <span class="comparison-value">${display}</span>
      </div>
      <div class="bar-bg">
        <div class="bar-fill" style="width:${pct}%;background:${item.color}"></div>
      </div>`;
    container.appendChild(div);
  });
}

// ── Tips ──────────────────────────────────────────────────────────────────────

function renderTips(result) {
  const container = document.getElementById('tips-container');
  container.innerHTML = '';
  generateTips(result).forEach(tip => {
    const card = document.createElement('div');
    card.className = 'tip-card';
    card.innerHTML = `<span class="tip-icon">${tip.icon}</span><p>${tip.text}</p>`;
    container.appendChild(card);
  });
}

function generateTips(result) {
  const { co2PerPassenger, transport, treesNeeded, savings } = result;
  const tips = [];

  if (transport.factor > CONFIG.CO2_FACTORS.bus.factor) {
    tips.push({ icon: '🚌', text: 'Ônibus ou transporte público pode reduzir suas emissões em até 70% neste trajeto.' });
  }
  if (transport.factor > CONFIG.CO2_FACTORS.train.factor && savings.vsTrainKg > 1) {
    tips.push({ icon: '🚆', text: `Trem ou metrô economizaria ${formatCO2(savings.vsTrainKg)} de CO₂ por passageiro.` });
  }
  if (transport.key?.startsWith('car') && !transport.key.includes('electric')) {
    tips.push({ icon: '⚡', text: 'Um carro elétrico emitiria ~75% menos CO₂ neste trajeto.' });
  }
  if (co2PerPassenger > 20) {
    tips.push({ icon: '🌳', text: `São necessárias ${treesNeeded} árvore(s) crescendo por 1 ano para compensar esta emissão.` });
  }
  if (result.totalDistance <= 30) {
    tips.push({ icon: '🚲', text: 'Para trajetos de até 30 km, bicicleta ou patinete são opções com zero emissões.' });
  }
  if (co2PerPassenger > 80) {
    tips.push({ icon: '💻', text: 'Avalie se esta viagem pode ser substituída por uma videoconferência.' });
  }
  tips.push({ icon: '🌱', text: 'Pequenas mudanças de hábito somadas fazem grande diferença para o planeta.' });

  return tips.slice(0, 4);
}

// ── Feedback ──────────────────────────────────────────────────────────────────

function showError(msg) {
  const el = document.getElementById('error-message');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), 4500);
}

function hideError() {
  document.getElementById('error-message').classList.add('hidden');
}

function setLoading(active) {
  const btn = document.getElementById('calculate-btn');
  btn.disabled    = active;
  btn.textContent = active ? 'Calculando…' : '🌿  Calcular Emissões';
}

