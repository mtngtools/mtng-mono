
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

export type HasApplName = {
    applName: string,
}

export const APPL_NAME_VIRT = "virt";

export type HasRoleName = {
    roleName: string,
}

export const ROLE_NAME_ADMIN = "admin";
export const ROLE_NAME_PUBLIC = "public";
export const ROLE_NAME_INTEGRATION = "integ";

export type HasApplVariant = {
    applVariant: string,
}

export type FullEnv = BaseEnv & HasApplName & HasRoleName
    & Partial<HasApplVariant>;
