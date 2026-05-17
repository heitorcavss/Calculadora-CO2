const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const OSRM      = 'https://router.project-osrm.org/route/v1/driving';

async function geocode(query) {
  const params = new URLSearchParams({ q: query, format: 'json', countrycodes: 'br', limit: '1' });
  const res = await fetch(`${NOMINATIM}?${params}`, { headers: { 'Accept-Language': 'pt-BR' } });
  if (!res.ok) throw new Error('Falha ao conectar com o geocodificador.');
  const data = await res.json();
  if (!data.length) {
    throw new Error(`Local não encontrado: "${query}". Tente incluir o estado (ex: "Campinas, SP").`);
  }
  const parts = data[0].display_name.split(',');
  return {
    lat:  parseFloat(data[0].lat),
    lon:  parseFloat(data[0].lon),
    name: parts.slice(0, 2).join(',').trim(),
  };
}

async function fetchRouteDistance(originText, destText) {
  const [from, to] = await Promise.all([geocode(originText), geocode(destText)]);
  const coord = `${from.lon},${from.lat};${to.lon},${to.lat}`;
  const res = await fetch(`${OSRM}/${coord}?overview=false`);
  if (!res.ok) throw new Error('Falha ao conectar com o serviço de roteamento.');
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error('Não foi possível calcular a rota entre os locais informados.');
  }
  return {
    distanceKm:  Math.round(data.routes[0].distance / 1000),
    durationMin: Math.round(data.routes[0].duration / 60),
    from,
    to,
  };
}
