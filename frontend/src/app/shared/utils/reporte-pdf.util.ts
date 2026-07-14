/**
 * =============================================================================
 * app/shared/utils/reporte-pdf.util.ts — Generación de PDFs con tablas
 * =============================================================================
 * Construye y descarga reportes PDF (jsPDF + jspdf-autotable) usados en:
 * reportes-asistencia, gestion-actividades, control-asistencia, gestión
 * de inscripciones.
 *
 * Exporta: descargarPdfReporteAsistencia(), descargarPdfReporteActividad(),
 *          descargarPdfInscripcionesTaller().
 * Helpers internos: safeFilename(), addTitleAndMeta(), tableStyles().
 * =============================================================================
 */

// jsPDF = librería para crear documentos PDF en el navegador.
import { jsPDF } from 'jspdf';
// autoTable = plugin que dibuja tablas con encabezado, zebra y bordes.
import autoTable from 'jspdf-autotable';

/** Color de fondo del encabezado de tabla (gris oscuro). */
const HEADER_FILL: [number, number, number] = [31, 41, 55];
/** Color de filas alternas (zebra) para legibilidad. */
const STRIPE_FILL: [number, number, number] = [249, 250, 251];

/** Quita caracteres inválidos del nombre de archivo al guardar el PDF. */
function safeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, '-').trim() || 'reporte';
}

/**
 * Escribe título + filas de metadatos (clave/valor) al inicio del PDF.
 * Devuelve la coordenada Y donde debe empezar la siguiente tabla.
 */
function addTitleAndMeta(
  doc: jsPDF,
  title: string,
  metaRows: [string, string][],
): number {
  const margin = 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text(title, margin, 18);

  let y = 26;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);

  autoTable(doc, {
    startY: y,
    theme: 'plain',
    margin: { left: margin, right: margin },
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 'auto' },
    },
    body: metaRows,
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
  return (finalY ?? y) + 8;
}

/** Estilos comunes de tabla: grid, encabezado oscuro y filas zebra. */
function tableStyles() {
  return {
    theme: 'grid' as const,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [31, 41, 55] as [number, number, number],
      lineColor: [209, 213, 219] as [number, number, number],
      lineWidth: 0.2,
      overflow: 'linebreak' as const,
    },
    headStyles: {
      fillColor: HEADER_FILL,
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: 'bold' as const,
      halign: 'center' as const,
    },
    alternateRowStyles: { fillColor: STRIPE_FILL },
    margin: { left: 14, right: 14 },
  };
}

/** Reporte final de asistencia por alumno (Reportes de Asistencia). */
export function descargarPdfReporteAsistencia(opts: {
  tallerTipo: string;
  umbralAusencias: number;
  totalSesiones: number;
  alertasPendientes: number;
  filas: Array<{
    nombre: string;
    rut: string;
    apoderadoNombre: string;
    apoderadoTelefono: string;
    presentes: number;
    ausentes: number;
    porcentajeAsistencia: number;
    alertaAusencia: boolean;
  }>;
}): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const startY = addTitleAndMeta(doc, `REPORTE FINAL DE ASISTENCIA — ${opts.tallerTipo}`, [
    ['Umbral ausencias', String(opts.umbralAusencias)],
    ['Sesiones', String(opts.totalSesiones)],
    ['Alertas activas', String(opts.alertasPendientes)],
  ]);

  autoTable(doc, {
    ...tableStyles(),
    startY,
    head: [['Alumno', 'RUT', 'Apoderado', 'Teléfono', 'Presentes', 'Ausentes', '% Asistencia', 'Alerta']],
    body: opts.filas.map((f) => [
      f.nombre,
      f.rut,
      f.apoderadoNombre || '—',
      f.apoderadoTelefono || '—',
      String(f.presentes),
      String(f.ausentes),
      `${f.porcentajeAsistencia}%`,
      f.alertaAusencia ? 'SÍ' : 'NO',
    ]),
    columnStyles: {
      0: { halign: 'left', cellWidth: 45 },
      1: { halign: 'center', cellWidth: 28 },
      2: { halign: 'left', cellWidth: 40 },
      3: { halign: 'center', cellWidth: 32 },
      4: { halign: 'center', cellWidth: 22 },
      5: { halign: 'center', cellWidth: 22 },
      6: { halign: 'center', cellWidth: 28 },
      7: { halign: 'center', cellWidth: 20 },
    },
  });

  doc.save(`reporte-final-${safeFilename(opts.tallerTipo)}.pdf`);
}

/** Reporte de actividad (docente / gestión). */
export function descargarPdfReporteActividad(
  r: {
    actividad: { tipo: string; estado: string };
    periodoAcademico?: { nombre: string; fechaApertura: string; fechaCierre: string } | null;
    docente?: { nombre: string } | null;
    inscripciones: { total: number; aceptados: number; pendientes: number; rechazados?: number };
    asistencia?: {
      sesionesRealizadas: number;
      registrosPresentes: number;
      registrosAusentes: number;
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
      porcentajeAsistencia?: number;
      alertaAusencia?: boolean;
    }>;
  },
  titulo: string,
  formatAlumno: (al: { nombre?: string; rut?: string }) => { nombre: string; rut: string } = (al) => ({
    nombre: al.nombre ?? '—',
    rut: al.rut ?? '—',
  }),
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const meta: [string, string][] = [
    ['Estado', r.actividad.estado],
    ['Docente', r.docente?.nombre ?? '—'],
    [
      'Inscripciones',
      `${r.inscripciones.total} (aceptados: ${r.inscripciones.aceptados}, pendientes: ${r.inscripciones.pendientes}, rechazados: ${r.inscripciones.rechazados ?? 0})`,
    ],
  ];
  if (r.periodoAcademico) {
    meta.splice(1, 0, [
      'Período',
      `${r.periodoAcademico.nombre} (${r.periodoAcademico.fechaApertura} a ${r.periodoAcademico.fechaCierre})`,
    ]);
  }
  if (r.asistencia) {
    meta.push([
      'Asistencia',
      `${r.asistencia.sesionesRealizadas} sesiones | ${r.asistencia.registrosPresentes} presentes | ${r.asistencia.registrosAusentes} ausentes`,
    ]);
  }
  if (r.utilizacionEspacios) {
    const porEspacio = r.utilizacionEspacios.porEspacio.length
      ? ' — ' + r.utilizacionEspacios.porEspacio.map((e) => `${e.espacio}: ${e.cantidad}`).join(', ')
      : '';
    meta.push([
      'Espacios',
      `${r.utilizacionEspacios.totalReservas} reservas (${r.utilizacionEspacios.horasReservadas} h)${porEspacio}`,
    ]);
  }

  const startY = addTitleAndMeta(doc, `${titulo} — ${r.actividad.tipo}`, meta);

  autoTable(doc, {
    ...tableStyles(),
    startY,
    head: [['Alumno', 'RUT', 'Inscripción', 'Presentes', 'Ausentes', '% Asistencia', 'Alerta']],
    body: r.alumnos.map((al) => {
      const d = formatAlumno(al);
      const conAsistencia = al.estado === 'ACEPTADO' && al.porcentajeAsistencia != null;
      return [
        d.nombre,
        d.rut,
        al.estado,
        conAsistencia ? String(al.presentes ?? 0) : '—',
        conAsistencia ? String(al.ausentes ?? 0) : '—',
        conAsistencia ? `${al.porcentajeAsistencia}%` : '—',
        al.alertaAusencia ? 'SÍ' : 'NO',
      ];
    }),
    columnStyles: {
      0: { halign: 'left', cellWidth: 50 },
      1: { halign: 'center', cellWidth: 30 },
      2: { halign: 'center', cellWidth: 28 },
      3: { halign: 'center', cellWidth: 24 },
      4: { halign: 'center', cellWidth: 24 },
      5: { halign: 'center', cellWidth: 28 },
      6: { halign: 'center', cellWidth: 20 },
    },
  });

  const prefix = titulo.includes('DOCENTE') ? 'reporte-docente' : 'reporte';
  doc.save(`${prefix}-${safeFilename(r.actividad.tipo)}.pdf`);
}

/** Reporte de inscripciones del taller. */
export function descargarPdfReporteInscripciones(opts: {
  tallerTipo: string;
  capacidad: number;
  aceptados: number;
  pendientes: number;
  rechazados: number;
  cuposDisponibles: number;
  filas: Array<{
    nombre: string;
    rut: string;
    altura: string;
    peso: string;
    porcentajeGrasa: string;
    sedentario: string;
    estado: string;
    fecha: string;
  }>;
}): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const startY = addTitleAndMeta(doc, `REPORTE DE INSCRIPCIONES — ${opts.tallerTipo}`, [
    ['Capacidad', String(opts.capacidad)],
    ['Aceptados / Pendientes / Rechazados', `${opts.aceptados} / ${opts.pendientes} / ${opts.rechazados}`],
    ['Cupos disponibles', String(opts.cuposDisponibles)],
  ]);

  autoTable(doc, {
    ...tableStyles(),
    startY,
    head: [['Alumno', 'RUT', 'Altura', 'Peso', '% Grasa', 'Sedentario', 'Estado', 'Fecha']],
    body: opts.filas.map((f) => [
      f.nombre,
      f.rut,
      f.altura || '—',
      f.peso || '—',
      f.porcentajeGrasa || '—',
      f.sedentario || '—',
      f.estado,
      f.fecha || '—',
    ]),
  });

  doc.save(`inscripciones-${safeFilename(opts.tallerTipo)}.pdf`);
}
