

export const NAME_GENERATOR_DEFAULT = "default" as const;

export type GeneratedName = {
    resourceName: string,
}

export const NAME_STYLE_DEFAULT = "default" as const;
export const NAME_STYLE_NEEDS_UNIQUE_PREFIX = "needs-unique" as const;

export type NameGeneratorParams<I extends FullEnv=FullEnv, O extends GeneratedName = GeneratedName> = {
    generatorName?: typeof NAME_GENERATOR_DEFAULT | string,
    nameStyle?: typeof NAME_STYLE_DEFAULT | typeof NAME_STYLE_NEEDS_UNIQUE_PREFIX | string,
    generatorFn?: (input: I) => O,
}

export const dashDelimitedGenerateName = <I extends FullEnv = FullEnv>(env: I): GeneratedName => {
    const resolvedEnv = resolveEnv(env);
    const { orgDir, opEnv, solutionDomain, applRole, applVariant, isSolutionDefault, isApplVariantPrimary, isApplRoleDefault } = resolvedEnv;
    const applVariantPart = isApplVariantPrimary ? "" : `-${applVariant}`;
    const applRolePart = isApplRoleDefault ? "" : `-${applRole}`;
    const solutionDomainPart = isSolutionDefault ? "" : `-${solutionDomain}`;
    return { resourceName: `${orgDir}-${opEnv}${applVariantPart}${applRolePart}${solutionDomainPart}` };
}    

export const resolveNameGenerator = <I extends FullEnv = FullEnv, O extends GeneratedName = GeneratedName>(
    params: NameGeneratorParams<I, O>,
): (input: I) => O => {
    if (params.generatorFn) {
        return params.generatorFn;
    }
    const generatorName = params.generatorName ?? NAME_GENERATOR_DEFAULT;
    if (generatorName === NAME_GENERATOR_DEFAULT) {
        return dashDelimitedGenerateName as (input: I) => O;
    }
    throw new Error(`Unknown generator name: ${String(generatorName)}`);
}