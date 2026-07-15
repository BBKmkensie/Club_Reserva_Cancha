/** Tipos MIME aceptados por POST /salida/:id/asistencia/imagen */
export type MimeImagenEvidencia = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/jpg';

export interface ImagenEvidenciaPayload {
  base64: string;
  mimeType: MimeImagenEvidencia;
}

const MAX_LADO_PX = 2048;
const CALIDAD_JPEG_INICIAL = 0.85;
const CALIDAD_JPEG_MIN = 0.55;
/** Tamaño máximo del base64 (~4 MB decodificados con margen). */
const MAX_BASE64_CHARS = 5_500_000;

/**
 * Normaliza cualquier imagen del navegador (PNG, AVIF, HEIC si el SO lo soporta…)
 * a JPEG comprimido para cumplir límites del backend.
 */
export async function prepararImagenEvidencia(file: File): Promise<ImagenEvidenciaPayload> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Seleccione un archivo de imagen');
  }

  const dataUrl = await comprimirComoJpeg(file);
  const base64 = dataUrl.split(',')[1] ?? '';
  if (!base64) {
    throw new Error('No se pudo leer la imagen');
  }
  if (base64.length > MAX_BASE64_CHARS) {
    throw new Error('La imagen sigue siendo muy pesada. Prueba con otra foto o menos resolución.');
  }

  return { base64, mimeType: 'image/jpeg' };
}

async function comprimirComoJpeg(file: File): Promise<string> {
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    let ancho = bitmap.width;
    let alto = bitmap.height;
    const escala = Math.min(1, MAX_LADO_PX / Math.max(ancho, alto, 1));
    ancho = Math.max(1, Math.round(ancho * escala));
    alto = Math.max(1, Math.round(alto * escala));

    const canvas = document.createElement('canvas');
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo procesar la imagen');
    ctx.drawImage(bitmap, 0, 0, ancho, alto);

    let calidad = CALIDAD_JPEG_INICIAL;
    let dataUrl = canvas.toDataURL('image/jpeg', calidad);
    while (calidad > CALIDAD_JPEG_MIN && dataUrl.length > MAX_BASE64_CHARS) {
      calidad -= 0.08;
      dataUrl = canvas.toDataURL('image/jpeg', calidad);
    }
    return dataUrl;
  } catch {
    return comprimirComoJpegFallback(file);
  } finally {
    bitmap?.close();
  }
}

function comprimirComoJpegFallback(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        let ancho = img.naturalWidth || img.width;
        let alto = img.naturalHeight || img.height;
        const escala = Math.min(1, MAX_LADO_PX / Math.max(ancho, alto, 1));
        ancho = Math.max(1, Math.round(ancho * escala));
        alto = Math.max(1, Math.round(alto * escala));
        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen'));
          return;
        }
        ctx.drawImage(img, 0, 0, ancho, alto);
        resolve(canvas.toDataURL('image/jpeg', CALIDAD_JPEG_INICIAL));
      } catch {
        reject(new Error('No se pudo abrir la imagen. Usa JPG, PNG o WebP.'));
      } finally {
        if (img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
      }
    };
    img.onerror = () => reject(new Error('No se pudo abrir la imagen. Usa JPG, PNG o WebP.'));
    img.src = URL.createObjectURL(file);
  });
}
