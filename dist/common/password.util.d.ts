export declare function hashPassword(password: string, salt?: string): {
    hash: string;
    salt: string;
};
export declare function verifyPassword(password: string, storedHash?: string | null, storedSalt?: string | null): boolean;
export declare function needsPasswordInit(hash?: string | null): boolean;
export declare function defaultPassword(): string;
