import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';
import { CreateAdminDto } from '../dto/create-admin.dto';
export declare class AdminService {
    private adminRepository;
    constructor(adminRepository: Repository<Admin>);
    create(createAdminDto: CreateAdminDto): Promise<Admin>;
    findAll(): Promise<Admin[]>;
    findOne(id: number): Promise<Admin>;
    findByEmail(email: string): Promise<Admin | null>;
    remove(id: number): Promise<void>;
}
