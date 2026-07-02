# Resource Spec: Certificate (`addCertificate`)

Defines requirements for registering, looking up, and consuming TLS certificates with `addCertificate` and cross-stack reference methods.

## Overview and Strategy

Certificate validation is notoriously slow and often requires manual intervention (such as adding DNS records). Because the builder advocates for highly repeatable and deterministic stack deployments, tying a stateful application stack to the synchronous creation of a new certificate introduces severe deployment friction.

**The Builder Strategy**:
1. **Separation of Concerns**: Certificates should generally be provisioned in an upstream, standalone "Networking" or "Core" stack. This is typically a wildcard certificate (e.g., `*.example.com`).
2. **Cross-Stack Consumption**: The standard application stacks (like an API or a static site distribution) should consume this existing certificate via a cross-stack reference, completely bypassing the validation lifecycle during regular app deployments.
3. **Domain Generation Integration**: The domain generator `createDomainName(env)` must return an object containing `{ domainName: string, hostedZoneName: string }`. This ensures default props factories can automatically look up the Route53 hosted zone for DNS validation without the developer hardcoding the zone.
4. **CloudFront and `us-east-1`**: AWS CloudFront strictly requires certificates to exist in the `us-east-1` region. The builder's certificate extension will automatically handle deploying/requesting the certificate in `us-east-1` when it detects it will be used for CloudFront, regardless of the stack's native deployment region.
5. **Wildcard Scope**: *[TO BE SPECIFIED]* - We still need to specify whether wildcard certificates are issued strictly per-environment (`*.<opEnv>.example.com`) or globally (`*.example.com`), and how the `createDomainName` generator interacts with that structure.

## Method signatures (planned)

Because creation is separated from consumption in this pattern, the primary method for most developers will be a reference lookup, though creation must still be supported.

```ts
// For the upstream Networking Stack that actually provisions the certificate
addCertificate(
  resourceKey: string,
  options?: AddCertificateOptions,
): this;

// For the downstream Application Stacks that consume the wildcard certificate
addCrossStackReferenceByCertificateName(
  resourceKey: string,
  options?: AddCrossStackCertificateReferenceOptions,
): this;
```

## Typing

```ts
type CertificateRef<Key extends string = string> = ResourceRef<"certificate", Key>;

type AddCertificateOptions = {
  props?:
    | Partial<CertificateProps>
    | ((ctx: ResourcePropsContext, ref: CertificateRef) => Partial<CertificateProps>);
  metadata?: ResourceMetadata;
  tags?: Record<string, string>;
};

type AddCrossStackCertificateReferenceOptions = {
  /** The deterministic physical name/ID used to look up the certificate */
  certificateName?: string;
  env?: Partial<FullEnv>;
  metadata?: ResourceMetadata;
};
```

## Default props factory typing

```ts
createCertificateProps<Key extends string>(
  input: CreateResourcePropsInput<"certificate", Key>,
): Partial<CertificateProps>;
```

## Examples

### 1. Easy to Copy (Cross-Stack Lookup)
The most common usage path for a standard application stack that needs to attach a certificate to a Distribution or API Gateway.

```ts
// The builder handles looking up the certificate securely without hardcoding ARNs
s.addCrossStackReferenceByCertificateName("WildcardCert");

s.addDistribution("AppDistribution", {
  props: (ctx) => ({
    ...createDistributionPropsLatest({ env: ctx.env, resourceKey: "AppDistribution" }),
    certificate: ctx.getResource("WildcardCert"),
  }),
});
```

### 2. Eject to Custom Code (Anti Lock-in)
If you need to manually provision a highly specific certificate (perhaps a private CA or an imported certificate) and the builder's wrapper is too restrictive, you can eject to native CDK using `addConstruct` while maintaining registry compliance.

```ts
s.addConstruct("CustomCert", (scope, env, ctx) => {
  // 1. You can still use domain generation helpers from core
  const domainName = createDomainName(env);

  // 2. Instantiate a raw CDK Certificate exactly how you want it
  const certificate = new acm.Certificate(scope, 'MyCustomCert', {
    domainName: domainName,
    validation: acm.CertificateValidation.fromDns(), // Or an imported zone
  });

  // 3. Return it so the builder registers it for use by other resources
  return certificate;
});
```
