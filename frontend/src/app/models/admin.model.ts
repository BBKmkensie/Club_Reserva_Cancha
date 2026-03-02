export interface Admin {
  id: number;
  nombre: string;
  rut: string;
  email: string;
  passwordHash?: string;
  passwordSalt?: string;
}

export interface CreateAdminDto {
  nombre: string;
  rut: string;
  email: string;
  password: string;
}

