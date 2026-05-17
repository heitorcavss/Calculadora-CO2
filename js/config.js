const CONFIG = {
  CO2_FACTORS: {
    car_gasoline:  { label: 'Carro (Gasolina)',    factor: 0.210, icon: '🚗', color: '#e74c3c' },
    car_diesel:    { label: 'Carro (Diesel)',       factor: 0.170, icon: '🚙', color: '#e67e22' },
    car_electric:  { label: 'Carro Elétrico',      factor: 0.050, icon: '⚡', color: '#f39c12' },
    motorcycle:    { label: 'Moto',                factor: 0.103, icon: '🏍️', color: '#d35400' },
    bus:           { label: 'Ônibus',              factor: 0.089, icon: '🚌', color: '#27ae60' },
    train:         { label: 'Trem / Metrô',        factor: 0.041, icon: '🚆', color: '#2ecc71' },
    plane_short:   { label: 'Avião (< 1 000 km)',  factor: 0.255, icon: '✈️', color: '#c0392b' },
    plane_long:    { label: 'Avião (> 1 000 km)',  factor: 0.195, icon: '🛫', color: '#e74c3c' },
    bicycle:       { label: 'Bicicleta',           factor: 0.000, icon: '🚲', color: '#1abc9c' },
    walking:       { label: 'A Pé',               factor: 0.000, icon: '🚶', color: '#16a085' },
  },

  PROFILE_MULTIPLIERS: {
    urban:   { label: 'Urbano',   multiplier: 1.2 },
    mixed:   { label: 'Misto',    multiplier: 1.1 },
    highway: { label: 'Rodovia',  multiplier: 1.0 },
  },

  TREE_ABSORPTION_KG_PER_YEAR: 22,

  PROFILE_DESCRIPTIONS: {
    urban:   'Percurso dentro de cidades, com tráfego e paradas frequentes (+20% emissões)',
    mixed:   'Combinação de trechos urbanos e estradas (+10% emissões)',
    highway: 'Percurso em rodovias com fluxo constante (fator base)',
  },

  CLASSIFICATIONS: {
    low:    { max: 10,       label: 'Baixo Impacto',     color: '#27ae60', icon: '🌱' },
    medium: { max: 50,       label: 'Impacto Moderado',  color: '#f39c12', icon: '🌿' },
    high:   { max: Infinity, label: 'Alto Impacto',      color: '#e74c3c', icon: '🌍' },
  },
};
