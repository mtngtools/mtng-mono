# CDK Builder Resource Specs

Detailed resource behavior specifications for builder `addXxxx` methods live in this folder.

Each resource gets its own subfolder and `README.md`.

- [bucket](./bucket/README.md)
- [function](./function/README.md)
- [distribution](./distribution/README.md)
- [table](./table/README.md)
- [parameter](./parameter/README.md)
- [custom-resource](./custom-resource/README.md)

Additional resource specs can be added as dedicated methods are stabilized.

## Cross-stack and external references (pattern)

Resource kinds may specify **reference registration methods** in addition to `addXxxx` for creation:

- **cross-stack**: look up a compliant physical name derived from `FullEnv` / `StorageEnv` conventions.
- **external**: accept explicit identifiers (name/ARN/etc.) because the resource may not follow mtngTOOLS naming.

These methods are intentionally separate (even when implementations converge) to keep recipes explicit about dependency shape.
