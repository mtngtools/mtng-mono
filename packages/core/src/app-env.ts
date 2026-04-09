
export type HasOrg = {
    orgDir: string,
}

export type HasOp = {
    opEnv: string,
}

export type BaseEnv = HasOrg & HasOp & {
    uniqueSuffix?: string,
}

export type HasId = {
    id: string,
}

export type HasCreated = {
    createdAt: number,
}

export type HasUpdated = {
    updatedAt: number,
}

export type HasMessage = {
    message: string,
}

export type HasCreatedUpdated = {
    updatedAt: string,
}

export const SOLUTION_DOMAIN_MULTI = "multi" as const; 
export const SOLUTION_DOMAIN_WATCH = "watch" as const;
export const SOLUTION_DOMAIN_PRODUCE = "produce" as const;
export const SOLUTION_DOMAIN_INTERACT = "interact" as const;

export type HasSolutionDomain = {
    solutionDomain: typeof SOLUTION_DOMAIN_MULTI | typeof SOLUTION_DOMAIN_WATCH | typeof SOLUTION_DOMAIN_PRODUCE | typeof SOLUTION_DOMAIN_INTERACT | string,
}

export const ROLE_NAME_ATTEND = "attend" as const;
export const ROLE_NAME_ADMIN = "admin" as const;
export const ROLE_NAME_PUBLIC = "public" as const;
export const ROLE_NAME_INTEGRATION = "integ" as const;

export type HasApplRole = {
    applRole: typeof ROLE_NAME_ADMIN | typeof ROLE_NAME_PUBLIC | typeof ROLE_NAME_ATTEND | typeof ROLE_NAME_INTEGRATION | string,
}    

export const APPL_VARIANT_PRIMARY = "primary" as const; // primary application for a solution domain, assumed to be this if not set on FullEnv

export type HasApplVariant = {
    applVariant: typeof APPL_VARIANT_PRIMARY | string,
}

export type FullEnv = BaseEnv & HasSolutionDomain & HasApplRole
    & Partial<HasApplVariant>;
