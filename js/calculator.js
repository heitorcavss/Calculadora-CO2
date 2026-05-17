function calculateCO2(distance, transportKey, profile, passengers, roundTrip) {
  const transport = CONFIG.CO2_FACTORS[transportKey];
  if (!transport) return null;

  const profileMultiplier = CONFIG.PROFILE_MULTIPLIERS[profile]?.multiplier ?? 1.0;
  const tripMultiplier    = roundTrip ? 2 : 1;
  const totalDistance     = distance * tripMultiplier;

  // Auto-upgrade plane factor for long routes
  let factor = transport.factor;
  if (transportKey === 'plane_short' && distance > 1000) {
    factor = CONFIG.CO2_FACTORS.plane_long.factor;
  }

  const co2PerPassenger = totalDistance * factor * profileMultiplier;
  const totalCO2        = co2PerPassenger * passengers;

  return {
    co2PerPassenger,
    totalCO2,
    totalDistance,
    transport: { ...transport, key: transportKey },
    treesNeeded:    calcTreesNeeded(co2PerPassenger),
    classification: getClassification(co2PerPassenger),
    comparison:     buildComparison(distance, profile, roundTrip, passengers),
    savings:        calcSavings(co2PerPassenger, distance, profile, roundTrip),
  };
}

function calcTreesNeeded(co2Kg) {
  return Math.max(1, Math.ceil(co2Kg / CONFIG.TREE_ABSORPTION_KG_PER_YEAR));
}

function getClassification(co2Kg) {
  for (const [key, cls] of Object.entries(CONFIG.CLASSIFICATIONS)) {
    if (co2Kg <= cls.max) return { ...cls, key };
  }
}

function buildComparison(distance, profile, roundTrip, passengers) {
  const multiplier = (CONFIG.PROFILE_MULTIPLIERS[profile]?.multiplier ?? 1.0)
                     * (roundTrip ? 2 : 1);

  return Object.entries(CONFIG.CO2_FACTORS)
    .map(([key, t]) => {
      let factor = t.factor;
      if (key === 'plane_short' && distance > 1000) factor = CONFIG.CO2_FACTORS.plane_long.factor;
      const co2 = distance * multiplier * factor;
      return { key, label: t.label, icon: t.icon, color: t.color, co2PerPassenger: co2, totalCO2: co2 * passengers };
    })
    .sort((a, b) => a.co2PerPassenger - b.co2PerPassenger);
}

function calcSavings(currentCO2, distance, profile, roundTrip) {
  const multiplier = (CONFIG.PROFILE_MULTIPLIERS[profile]?.multiplier ?? 1.0)
                     * (roundTrip ? 2 : 1);
  const trainCO2 = distance * multiplier * CONFIG.CO2_FACTORS.train.factor;
  const busCO2   = distance * multiplier * CONFIG.CO2_FACTORS.bus.factor;
  return {
    vsTrainKg: Math.max(0, currentCO2 - trainCO2),
    vsBusKg:   Math.max(0, currentCO2 - busCO2),
  };
}

function formatCO2(kg) {
  if (kg === 0)      return '0 g';
  if (kg >= 1000)    return `${(kg / 1000).toFixed(2)} t`;
  if (kg >= 1)       return `${kg.toFixed(2)} kg`;
  return `${(kg * 1000).toFixed(0)} g`;
}

function formatCO2Long(kg) {
  if (kg === 0)      return '0 gramas de CO₂';
  if (kg >= 1000)    return `${(kg / 1000).toFixed(2)} toneladas de CO₂`;
  if (kg >= 1)       return `${kg.toFixed(2)} kg de CO₂`;
  return `${(kg * 1000).toFixed(0)} gramas de CO₂`;
}
