export declare const config: {
    env: string;
    isProd: boolean;
    port: number;
    jwtSecret: string;
    corsOrigins: string[];
    supabase: {
        url: string;
        serviceRoleKey: string;
        anonKey: string;
    };
    databaseUrl: string;
    adminDefault: {
        email: string;
        password: string;
        displayName: string;
    };
};
