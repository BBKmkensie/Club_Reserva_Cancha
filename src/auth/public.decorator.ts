/**
 * Decorador para marcar rutas como públicas.
 * Omite la validación JWT cuando se aplica a un endpoint o controlador.
 */
import { SetMetadata } from '@nestjs/common';

/** Clave de metadatos usada por JwtAuthGuard para detectar rutas públicas. */
export const IS_PUBLIC_KEY = 'isPublic';

/** Marca un handler o controlador como accesible sin autenticación. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
