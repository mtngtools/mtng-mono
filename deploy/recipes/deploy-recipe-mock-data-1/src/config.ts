import { normalizeKeyPrefix } from "./prefix.js";

export type DeployConfig = {
  bucket: string;
  keyPrefix: string;
  dryRun: boolean;
};

export function loadDeployConfig(): DeployConfig {
  const dryRun = process.argv.includes("--dry-run");
  const bucket = process.env.MOCK_DATA_S3_BUCKET_NAME?.trim();
  const rawPrefix = process.env.MOCK_DATA_S3_BUCKET_KEY_PREFIX?.trim();

  if (!bucket || !rawPrefix) {
    console.error(
      "Missing required environment: MOCK_DATA_S3_BUCKET_NAME and MOCK_DATA_S3_BUCKET_KEY_PREFIX must be non-empty.",
    );
    process.exit(1);
  }

  const keyPrefix = normalizeKeyPrefix(rawPrefix);
  if (!keyPrefix) {
    console.error(
      "MOCK_DATA_S3_BUCKET_KEY_PREFIX must not be empty or only slashes after normalization.",
    );
    process.exit(1);
  }

  return {
    bucket,
    keyPrefix,
    dryRun,
  };
}
