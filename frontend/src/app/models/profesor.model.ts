export interface Profesor {
  id: number;
  nombre: string;
  rut: string;
  email: string;
  telefono?: string;
  fotoPath?: string;
  tallerId?: number | null;
  taller?: { id: number; tipo?: string };
}

export interface CreateProfesorDto {
  nombre: string;
  rut: string;
  email: string;
  telefono?: string;
  fotoPath?: string;
  tallerId?: number | null;
  password?: string;
}

