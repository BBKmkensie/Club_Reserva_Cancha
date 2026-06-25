/** Prueba E2E del flujo de salidas/partidos */
const API = 'http://127.0.0.1:3000';

async function json(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, ok: res.ok, data };
}

function ok(label, cond, detail = '') {
  const icon = cond ? '✅' : '❌';
  console.log(`${icon} ${label}${detail ? ': ' + detail : ''}`);
  return cond;
}

async function main() {
  console.log('=== Prueba flujo salidas/partidos ===\n');
  let passed = 0;
  let failed = 0;
  const check = (label, cond, detail) => { if (ok(label, cond, detail)) passed++; else failed++; return cond; };

  const talleres = (await json('GET', '/taller')).data;
  const profesores = (await json('GET', '/profesor')).data;
  check('Obtener talleres', Array.isArray(talleres) && talleres.length > 0, `${talleres?.length} talleres`);
  check('Obtener profesores', Array.isArray(profesores) && profesores.length > 0, `${profesores?.length} profesores`);
  if (!talleres?.length || !profesores?.length) process.exit(1);

  const taller = talleres[0];
  const profesor = profesores[0];
  const fecha = '2026-07-15';

  // --- Flujo 1: Directiva asigna → Profesor acepta → Alumnos ven ---
  console.log('\n--- Flujo 1: Asignación directiva → aceptación profesor ---');
  let r = await json('POST', '/salida/asignar', {
    destino: 'Partido prueba E2E (asignación)',
    fecha,
    hora: '10:00',
    descripcion: 'Prueba automática asignación',
    tallerId: taller.id,
    profesorId: profesor.id,
    adminId: 1,
  });
  check('Directiva asigna partido', r.status === 201, `status ${r.status}`);
  const salidaAsignada = r.data;
  check('Estado PENDIENTE_PROFESOR', salidaAsignada?.estado === 'PENDIENTE_PROFESOR', salidaAsignada?.estado);
  check('Origen ASIGNACION_DIRECTIVA', salidaAsignada?.origen === 'ASIGNACION_DIRECTIVA', salidaAsignada?.origen);

  const antesPublicadas = (await json('GET', '/salida/publicadas')).data || [];
  const visibleAntes = antesPublicadas.some((s) => s.id === salidaAsignada.id);
  check('NO visible para alumnos antes de aceptar', !visibleAntes);

  r = await json('PATCH', `/salida/${salidaAsignada.id}/responder?actor=profesor&actorId=${profesor.id}`, {
    acepta: true,
  });
  check('Profesor acepta asignación', r.status === 200 && r.data?.estado === 'PUBLICADA', r.data?.estado);

  const despuesPublicadas = (await json('GET', '/salida/publicadas')).data || [];
  const visibleDespues = despuesPublicadas.find((s) => s.id === salidaAsignada.id);
  check('Visible para alumnos tras aceptar', !!visibleDespues);
  check('Muestra profesor responsable', visibleDespues?.profesor?.nombre?.length > 0, visibleDespues?.profesor?.nombre);

  // --- Flujo 2: Profesor abre y cierra con éxito + comentario ---
  console.log('\n--- Flujo 2: Abrir y cerrar salida ---');
  r = await json('PATCH', `/salida/${salidaAsignada.id}/abrir?profesorId=${profesor.id}`, {
    comentario: 'Salida iniciada, buen clima',
  });
  check('Profesor abre salida', r.status === 200 && r.data?.estado === 'EN_CURSO', r.data?.estado);

  r = await json('PATCH', `/salida/${salidaAsignada.id}/cerrar?profesorId=${profesor.id}`, {
    resultado: 'EXITO',
    comentario: 'Excelente partido, ganamos 3-1 y los alumnos participaron bien.',
  });
  check('Profesor cierra con ÉXITO', r.status === 200 && r.data?.estado === 'CERRADA', r.data?.estado);
  check('Resultado EXITO guardado', r.data?.resultado === 'EXITO', r.data?.resultado);
  check('Comentario de cierre guardado', r.data?.comentarioCierre?.includes('Excelente'), 'sí');

  const cerrada = (await json('GET', `/salida/${salidaAsignada.id}`)).data;
  check('Al consultar: muestra éxito y comentario', cerrada?.resultado === 'EXITO' && !!cerrada?.comentarioCierre);

  // --- Flujo 3: Profesor propone → Directiva acepta ---
  console.log('\n--- Flujo 3: Propuesta profesor → aceptación directiva ---');
  r = await json('POST', '/salida/proponer', {
    destino: 'Partido prueba E2E (propuesta)',
    fecha: '2026-07-20',
    hora: '15:00',
    descripcion: 'Prueba propuesta profesor',
    tallerId: taller.id,
    profesorId: profesor.id,
  });
  check('Profesor propone partido', r.status === 201, `status ${r.status}`);
  const salidaPropuesta = r.data;
  check('Estado PENDIENTE_DIRECTIVA', salidaPropuesta?.estado === 'PENDIENTE_DIRECTIVA', salidaPropuesta?.estado);
  check('Origen PROPUESTA_PROFESOR', salidaPropuesta?.origen === 'PROPUESTA_PROFESOR', salidaPropuesta?.origen);

  const noVisibleProp = !(await json('GET', '/salida/publicadas')).data?.some((s) => s.id === salidaPropuesta.id);
  check('NO visible antes de aprobación directiva', noVisibleProp);

  r = await json('PATCH', `/salida/${salidaPropuesta.id}/responder?actor=directiva`, { acepta: true });
  check('Directiva acepta propuesta', r.status === 200 && r.data?.estado === 'PUBLICADA', r.data?.estado);

  const visibleProp = (await json('GET', '/salida/publicadas')).data?.some((s) => s.id === salidaPropuesta.id);
  check('Visible para alumnos tras aprobación directiva', visibleProp);

  // --- Flujo 4: Rechazo ---
  console.log('\n--- Flujo 4: Rechazo de propuesta ---');
  r = await json('POST', '/salida/proponer', {
    destino: 'Partido rechazado E2E',
    fecha: '2026-08-01',
    tallerId: taller.id,
    profesorId: profesor.id,
  });
  const salidaRech = r.data;
  r = await json('PATCH', `/salida/${salidaRech.id}/responder?actor=directiva`, {
    acepta: false,
    motivo: 'Fecha no disponible',
  });
  check('Directiva rechaza propuesta', r.data?.estado === 'RECHAZADA', r.data?.estado);
  check('Motivo de rechazo guardado', r.data?.motivoRechazo?.includes('Fecha'), r.data?.motivoRechazo);

  const noVisibleRech = !(await json('GET', '/salida/publicadas')).data?.some((s) => s.id === salidaRech.id);
  check('Rechazada NO visible para alumnos', noVisibleRech);

  // Limpieza opcional
  for (const id of [salidaAsignada.id, salidaPropuesta.id, salidaRech.id]) {
    await json('DELETE', `/salida/${id}`);
  }

  console.log(`\n=== Resultado: ${passed} OK, ${failed} FALLIDOS ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Error fatal:', e.message);
  process.exit(1);
});
