import { AdminService } from './admin.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    create(createAdminDto: CreateAdminDto): Promise<import("../entities/admin.entity").Admin>;
    findAll(): Promise<import("../entities/admin.entity").Admin[]>;
    findOne(id: number): Promise<import("../entities/admin.entity").Admin>;
    remove(id: number): Promise<void>;
}
