/** Oculta medidas físicas sensibles (directiva/admin no deben verlas). */
export function omitirDatosAntropometricos<T extends {
  altura?: unknown;
  peso?: unknown;
  porcentajeGrasa?: unknown;
  sedentario?: unknown;
}>(row: T): T {
  return {
    ...row,
    altura: null,
    peso: null,
    porcentajeGrasa: null,
    sedentario: null,
  };
}
