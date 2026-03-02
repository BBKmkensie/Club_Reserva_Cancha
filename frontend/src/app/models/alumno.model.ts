export interface Alumno {
  id: number;
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
  edad?: number;
  tallerId?: number | null;
  taller?: { id: number; tipo?: string } | null;
}

export interface CreateAlumnoDto {
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
  edad?: number;
  tallerId?: number | null;
  password?: string;
}

