/** Verifica que alumnos sin taller no vean salidas */
const API = 'http://127.0.0.1:3000';

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
  return { status: res.status, ok: res.ok, data };
}

function check(label, cond, detail = '') {
  const icon = cond ? '✅' : '❌';
  console.log(`${icon} ${label}${detail ? ': ' + detail : ''}`);
  return cond;
}

async function main() {
  console.log('=== Prueba: salidas solo para alumnos inscritos en taller ===\n');
  let passed = 0;
  let failed = 0;
  const assert = (label, cond, detail) => {
    if (check(label, cond, detail)) passed++;
    else failed++;
    return cond;
  };

  const alumnos = (await json('GET', '/alumno')).data;
  assert('Listar alumnos', Array.isArray(alumnos) && alumnos.length > 0, `${alumnos?.length} alumnos`);
  if (!alumnos?.length) process.exit(1);

  const todasPublicadas = (await json('GET', '/salida/publicadas')).data;
  assert(
    'Hay salidas publicadas en el sistema',
    Array.isArray(todasPublicadas),
    `${todasPublicadas?.length ?? 0} salidas`,
  );

  let sinTaller = null;
  let conTaller = null;

  for (const alumno of alumnos) {
    const inscs = (await json('GET', `/inscripcion-taller/por-alumno/${alumno.id}`)).data ?? [];
    const aceptadas = inscs.filter((i) => i.estado === 'ACEPTADO');
    const tieneTaller = aceptadas.length > 0 || !!alumno.tallerId;
    if (!tieneTaller && !sinTaller) sinTaller = { alumno, inscs };
    if (tieneTaller && !conTaller) conTaller = { alumno, inscs: aceptadas };
    if (sinTaller && conTaller) break;
  }

  if (sinTaller) {
    const { alumno } = sinTaller;
    const salidas = (await json('GET', `/salida/publicadas?alumnoId=${alumno.id}`)).data;
    assert(
      `Alumno sin taller (${alumno.rut || alumno.nombre}, id=${alumno.id}) no ve salidas`,
      Array.isArray(salidas) && salidas.length === 0,
      `recibió ${salidas?.length ?? '?'} salidas`,
    );

    if (todasPublicadas?.length) {
      const salidaId = todasPublicadas[0].id;
      const ins = await json('POST', '/inscripcion-salida', {
        alumnoId: alumno.id,
        salidaId,
      });
      assert(
        'Alumno sin taller no puede inscribirse en salida',
        ins.status === 403,
        `status ${ins.status} — ${ins.data?.message || ''}`,
      );
    }
  } else {
    console.log('⚠️  No se encontró alumno sin inscripción ACEPTADA ni taller_id');
  }

  if (conTaller) {
    const { alumno, inscs } = conTaller;
    const salidas = (await json('GET', `/salida/publicadas?alumnoId=${alumno.id}`)).data;
    const tallerIds = new Set([
      ...inscs.map((i) => i.tallerId),
      ...(alumno.tallerId ? [alumno.tallerId] : []),
    ]);
    const esperadas = (todasPublicadas ?? []).filter((s) => tallerIds.has(s.tallerId));
    assert(
      `Alumno con taller (${alumno.rut || alumno.nombre}, id=${alumno.id}) ve solo salidas de su taller`,
      Array.isArray(salidas) && salidas.length === esperadas.length,
      `recibió ${salidas?.length ?? '?'}, esperadas ${esperadas.length}`,
    );
    const fueraDeTaller = salidas.some((s) => !tallerIds.has(s.tallerId));
    assert('Ninguna salida es de un taller ajeno', !fueraDeTaller);
  } else {
    console.log('⚠️  No se encontró alumno con inscripción ACEPTADA');
  }

  console.log(`\n=== Resultado: ${passed} OK, ${failed} fallos ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
