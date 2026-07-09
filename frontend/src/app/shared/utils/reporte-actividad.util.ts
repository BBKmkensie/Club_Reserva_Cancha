/**
 * Utilidades para generar y descargar reportes de actividad en texto plano.
 */
/**
 * Construye el contenido textual de un reporte final de actividad (taller, inscripciones, asistencia).
 */
export function textoReporteActividad(
  r: {
    actividad: { tipo: string; estado: string };
    periodoAcademico?: { nombre: string; fechaApertura: string; fechaCierre: string } | null;
    docente?: { nombre: string } | null;
    inscripciones: { total: number; aceptados: number; pendientes: number; rechazados?: number };
    asistencia?: {
      sesionesRealizadas: number;
      registrosPresentes: number;
      registrosAusentes: number;
      registrosTardes?: number;
    };
    utilizacionEspacios?: {
      totalReservas: number;
      horasReservadas: number;
      porEspacio: { espacio: string; cantidad: number }[];
    };
    alumnos: Array<{
      nombre?: string;
      rut?: string;
      estado: string;
      presentes?: number;
      ausentes?: number;
      tardes?: number;
      porcentajeAsistencia?: number;
      alertaAusencia?: boolean;
    }>;
  },
  titulo = 'REPORTE FINAL',
  formatAlumno: (al: { nombre?: string; rut?: string }) => { nombre: string; rut: string } = (al) => ({
    nombre: al.nombre ?? '—',
    rut: al.rut ?? '—',
  }),
): string {
  const lineas = [
    `${titulo} — ACTIVIDAD: ${r.actividad.tipo}`,
    `Estado: ${r.actividad.estado}`,
    r.periodoAcademico
      ? `Período: ${r.periodoAcademico.nombre} (${r.periodoAcademico.fechaApertura} a ${r.periodoAcademico.fechaCierre})`
      : null,
    `Docente: ${r.docente?.nombre ?? '—'}`,
    `Inscripciones: ${r.inscripciones.total} (aceptados: ${r.inscripciones.aceptados}, pendientes: ${r.inscripciones.pendientes}, rechazados: ${r.inscripciones.rechazados ?? 0})`,
    r.asistencia
      ? `Asistencia: ${r.asistencia.sesionesRealizadas} sesiones | ${r.asistencia.registrosPresentes} presentes | ${r.asistencia.registrosAusentes} ausentes | ${r.asistencia.registrosTardes ?? 0} tarde`
      : null,
    r.utilizacionEspacios
      ? `Utilización espacios: ${r.utilizacionEspacios.totalReservas} reservas (${r.utilizacionEspacios.horasReservadas} h)${r.utilizacionEspacios.porEspacio.length ? ' — ' + r.utilizacionEspacios.porEspacio.map((e) => `${e.espacio}: ${e.cantidad}`).join(', ') : ''}`
      : null,
    '',
    'ALUMNOS (inscripción y asistencia si aplica):',
    ...r.alumnos.map((al) => {
      const d = formatAlumno(al);
      const base = `- ${d.nombre} (${d.rut}): inscripción ${al.estado}`;
      if (al.estado !== 'ACEPTADO' || al.porcentajeAsistencia == null) return base;
      return `${base} | ${al.presentes ?? 0}P ${al.tardes ?? 0}T ${al.ausentes ?? 0}A | ${al.porcentajeAsistencia}% asistencia${al.alertaAusencia ? ' ⚠' : ''}`;
    }),
  ];
  return lineas.filter((l) => l != null).join('\n');
}

/** Descarga un archivo de texto con el contenido del reporte en el navegador */
export function descargarTextoReporte(contenido: string, nombreArchivo: string): void {
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(a.href);
}
