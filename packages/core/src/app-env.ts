
export type HasOrg = {
    orgDir: string,
}

export const OP_ENV_DEV = "dev" as const;
export const OP_ENV_QA = "qa" as const;
export const OP_ENV_TEST = "test" as const;
export const OP_ENV_REVIEW = "review" as const;
export const OP_ENV_PREVIEW = "preview" as const;
export const OP_ENV_PROD = "prod" as const;

export const OP_ENV_NOT_DEV_PROD = [OP_ENV_QA, OP_ENV_TEST, OP_ENV_REVIEW, OP_ENV_PREVIEW] as const;
export const OP_ENV_ALL = [OP_ENV_DEV, ...OP_ENV_NOT_DEV_PROD, OP_ENV_PROD] as const;

export type HasOpEnv = {
    opEnv: typeof OP_ENV_DEV | typeof OP_ENV_QA | typeof OP_ENV_TEST | typeof OP_ENV_REVIEW | typeof OP_ENV_PREVIEW | typeof OP_ENV_PROD | string,
}

export const genOpEnvHelpers = (input: HasOpEnv) => {
    const { opEnv } = input;
    return {
        isDev: () => opEnv === OP_ENV_DEV,
        isNotDev: () => opEnv !== OP_ENV_DEV,
        isQA: () => opEnv === OP_ENV_QA,
        isTest: () => opEnv === OP_ENV_TEST,
        isReview: () => opEnv === OP_ENV_REVIEW,
        isPreview: () => opEnv === OP_ENV_PREVIEW,
        isProd: () => opEnv === OP_ENV_PROD,
        isNotProd: () => opEnv !== OP_ENV_PROD,
        isNotDevOrProd: () => opEnv !== OP_ENV_DEV && opEnv !== OP_ENV_PROD,
    }
}

export type BaseEnv = HasOrg & HasOpEnv & {
    uniquePrefix?: string,
    uniqueSuffix?: string,
}

export const SOLUTION_DOMAIN_DEFAULT = "default" as const;
export const SOLUTION_DOMAIN_WATCH = "watch" as const;
export const SOLUTION_DOMAIN_PRODUCE = "produce" as const;
export const SOLUTION_DOMAIN_INTERACT = "interact" as const;

export type HasSolutionDomain = {
    solutionDomain: typeof SOLUTION_DOMAIN_DEFAULT | typeof SOLUTION_DOMAIN_WATCH | typeof SOLUTION_DOMAIN_PRODUCE | typeof SOLUTION_DOMAIN_INTERACT | string,
}

export const ROLE_NAME_DEFAULT = "default" as const;
export const ROLE_NAME_ATTEND = "attend" as const;
export const ROLE_NAME_ADMIN = "admin" as const;
export const ROLE_NAME_PUBLIC = "public" as const;
export const ROLE_NAME_INTEGRATION = "integ" as const;

export type HasApplRole = {
    applRole: typeof ROLE_NAME_DEFAULT | typeof ROLE_NAME_ADMIN | typeof ROLE_NAME_PUBLIC | typeof ROLE_NAME_ATTEND | typeof ROLE_NAME_INTEGRATION | string,
}

export const APPL_VARIANT_PRIMARY = "primary" as const; // primary application for a solution domain, assumed to be this if not set on FullEnv

export type HasApplVariant = {
    applVariant: typeof APPL_VARIANT_PRIMARY | string,
}

export type FullEnv = BaseEnv
    & Partial<HasApplRole>
    & Partial<HasSolutionDomain>
    & Partial<HasApplVariant>
    & {
        isResolved?: boolean,
    };

export type ResolvedEnv = FullEnv
    & Required<Pick<FullEnv, "solutionDomain" | "applVariant" | "applRole">>
    & {
        isResolved: true,
    };

export const genResolvedEnvHelpers = (env: FullEnv) => {
    const solutionDomain = env.solutionDomain ?? SOLUTION_DOMAIN_DEFAULT;
    const isSolutionDefault = () => solutionDomain === SOLUTION_DOMAIN_DEFAULT;
    const applVariant = env.applVariant ?? APPL_VARIANT_PRIMARY;
    const isApplVariantPrimary = () => applVariant === APPL_VARIANT_PRIMARY;
    const applRole = env.applRole ?? ROLE_NAME_DEFAULT;
    const isApplRoleDefault = () => applRole === ROLE_NAME_DEFAULT;

    return {
        solutionDomain,
        applVariant,
        applRole,
        isSolutionDefault,
        isApplVariantPrimary,
        isApplRoleDefault,
        ...genOpEnvHelpers(env),
    }
}

export type ResolvedEnvWithHelpers = ResolvedEnv
    & ReturnType<typeof genResolvedEnvHelpers>
    & {
        envOnly: ResolvedEnv,
    };

export const resolveEnv = (env: FullEnv) => {
    if (env.isResolved) {
        return env as ResolvedEnvWithHelpers;
    };

    const resolvedEnvWithHelpers = genResolvedEnvHelpers(env);
    const { solutionDomain, applVariant, applRole } = resolvedEnvWithHelpers;
    const envOnly = {
        ...env,
        solutionDomain,
        applVariant,
        applRole,
        isResolved: true,
    };

    return {
        ...env,
        ...resolvedEnvWithHelpers,
        envOnly,
    };
};


export const STORAGE_DEFAULT = "default" as const;
export const STORAGE_APP_STATIC = "static" as const;
export const STORAGE_RESOURCE = "resource" as const;
export const STORAGE_STATE = "state" as const;
export const STORAGE_DATA = "data" as const;
export const STORAGE_STREAM = "stream" as const;
export const STORAGE_DOWNLOAD = "download" as const;
export const STORAGE_RECORD = "record" as const;

export type StorageRole = typeof STORAGE_DEFAULT | typeof STORAGE_APP_STATIC | typeof STORAGE_RESOURCE | typeof STORAGE_STATE | typeof STORAGE_DATA
    | typeof STORAGE_STREAM | typeof STORAGE_DOWNLOAD | typeof STORAGE_RECORD | string;

export type HasStorageRole = {
    storageRole: StorageRole,
}

export type StorageEnv = BaseEnv
    & Partial<HasStorageRole>

export type ResolvedStorageEnv = StorageEnv & Required<Pick<StorageEnv, "storageRole">>;

export const resolveStorageEnv = (env: StorageEnv) => {
    const storageRole = env.storageRole ?? STORAGE_DEFAULT;
    const isStorageRoleDefault = storageRole === STORAGE_DEFAULT;
    const resolvedEnv = resolveEnv(env);
    const envOnly = {
        ...resolvedEnv.envOnly,
        storageRole,
    } satisfies ResolvedStorageEnv;
    return {
        ...resolvedEnv,
        storageRole,
        envOnly,
        isStorageRoleDefault,
    };
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

export const STORAGE_DEFAULT = "default" as const;
export const STORAGE_APP_STATIC = "static" as const;
export const STORAGE_RESOURCE = "resource" as const;
export const STORAGE_STATE = "state" as const;
export const STORAGE_DATA = "data" as const;
export const STORAGE_STREAM = "stream" as const;
export const STORAGE_DOWNLOAD = "download" as const;
export const STORAGE_RECORD = "record" as const;

export type HasStorageRole = {
    storageRole: typeof STORAGE_DEFAULT | typeof STORAGE_APP_STATIC | typeof STORAGE_RESOURCE | typeof STORAGE_STATE | typeof STORAGE_DATA
    | typeof STORAGE_STREAM | typeof STORAGE_DOWNLOAD | typeof STORAGE_RECORD | string,
}

export type StorageEnv = BaseEnv
    & Partial<HasStorageRole>

export type ResolvedStorageEnv = StorageEnv & Required<Pick<StorageEnv, "storageRole">>;

export const resolveStorageEnv = (env: StorageEnv) => {
    const storageRole = env.storageRole ?? STORAGE_DEFAULT;
    const isStorageRoleDefault = storageRole === STORAGE_DEFAULT;
    const resolvedEnv = resolveEnv(env);
    const envOnly = {
        ...resolvedEnv.envOnly,
        storageRole,
    } satisfies ResolvedStorageEnv;
    return {
        ...resolvedEnv,
        storageRole,
        envOnly,
        isStorageRoleDefault,
    };
}
