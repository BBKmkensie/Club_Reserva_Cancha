/** Prueba rápida: disponibilidad + reserva + conflicto de horario */
const API = 'http://localhost:3000';
const FECHA = '2026-06-30'; // martes

async function json(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

function slot(slots, hora) {
  return slots.find((s) => s.horaInicio.startsWith(hora));
}

async function main() {
  console.log('=== 1. Disponibilidad inicial ===');
  let r = await json('GET', `/reserva/disponibilidad?fecha=${FECHA}`);
  if (r.status !== 200) {
    console.error('Error disponibilidad:', r.status, r.data);
    process.exit(1);
  }
  const slots = r.data;
  console.log(`Franjas habilitadas: ${slots.length}`);
  const s9 = slot(slots, '09:00');
  const s13 = slot(slots, '13:00');
  console.log('09:00–10:00:', s9?.estado, s9?.paraTodos ? '(para todos)' : '');
  console.log('13:00–14:00:', s13?.estado, s13?.paraTodos ? '(para todos)' : '');

  const talleres = (await json('GET', '/taller')).data;
  const t1 = talleres[0];
  const t2 = talleres[1];
  if (!t1 || !t2) {
    console.error('Se necesitan al menos 2 talleres');
    process.exit(1);
  }

  // Limpiar reservas de prueba en esa fecha/horas
  for (const f of [FECHA, '2026-06-29']) {
    const existentes = (await json('GET', `/reserva?fecha=${f}`)).data || [];
    for (const res of existentes) {
      const hi = (res.horaInicio || '').substring(0, 5);
      if (hi === '09:00' || hi === '13:00') {
        await json('DELETE', `/reserva/${res.id}`);
        console.log(`Eliminada reserva previa #${res.id} ${f} ${hi}`);
      }
    }
  }

  console.log('\n=== 2. Reserva taller 1 → 09:00–10:00 ===');
  r = await json('POST', '/reserva', {
    espacio: 'Cancha Principal',
    fecha: FECHA,
    horaInicio: '09:00',
    horaFin: '10:00',
    tallerId: t1.id,
    profesorId: t1.profesorId ?? undefined,
  });
  console.log('Status:', r.status, r.status === 201 ? 'OK' : r.data);

  console.log('\n=== 3. Conflicto: taller 2 intenta misma hora ===');
  r = await json('POST', '/reserva', {
    espacio: 'Cancha Principal',
    fecha: FECHA,
    horaInicio: '09:00',
    horaFin: '10:00',
    tallerId: t2.id,
  });
  console.log('Status:', r.status, '(esperado 409)');
  console.log('Mensaje:', r.data?.message || r.data);

  console.log('\n=== 4. Disponibilidad después de reservar ===');
  r = await json('GET', `/reserva/disponibilidad?fecha=${FECHA}`);
  const s9b = slot(r.data, '09:00');
  console.log('09:00–10:00:', s9b?.estado, '→', s9b?.tallerNombre);
  const s13b = slot(r.data, '13:00');
  console.log('13:00–14:00:', s13b?.estado, s13b?.paraTodos ? '(para todos, aún disponible)' : '');

  console.log('\n=== 5. Reserva 13:00–14:00 (para todos) ===');
  r = await json('POST', '/reserva', {
    espacio: 'Cancha Principal',
    fecha: FECHA,
    horaInicio: '13:00',
    horaFin: '14:00',
    tallerId: t2.id,
  });
  console.log('Status:', r.status, r.status === 201 ? 'OK' : r.data?.message || r.data);

  console.log('\n✅ Prueba completada.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
