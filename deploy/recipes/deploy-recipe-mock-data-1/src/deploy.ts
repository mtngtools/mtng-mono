import "varlock/auto-load";
import {
  createMockMeetingFromRecipe,
  getNamedRecipe,
  listNamedRecipeIds,
} from "@mtngtools/develop-mock-data";
import { putStringToS3 } from "@mtngtools/provide-aws";
import { loadDeployConfig } from "./config.js";

function objectKey(prefix: string, recipeId: string, file: string): string {
  return `${prefix}/${recipeId}/${file}`;
}

function utf8ByteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

/** One JSON object: print the same line shape every time; only real deploy calls S3. */
async function putOrLogDryRun(
  dryRun: boolean,
  bucket: string,
  key: string,
  body: string,
  errorContext: string,
): Promise<void> {
  const uri = `s3://${bucket}/${key}`;
  const bytes = utf8ByteLength(body);
  if (dryRun) {
    console.log(`  Would upload ${uri} (${bytes} bytes UTF-8)`);
    return;
  }
  const result = await putStringToS3({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: "application/json",
    logBucketAndKey: false,
  });
  if (result.error) {
    console.error(`putStringToS3 failed for ${errorContext} key=${key}:`, result.errorData);
    process.exit(1);
  }
  console.log(`  Uploaded ${uri} (${bytes} bytes UTF-8)`);
}

async function main(): Promise<void> {
  const { bucket, keyPrefix, dryRun } = loadDeployConfig();
  const recipeIds = [...listNamedRecipeIds()].sort((a, b) => a.localeCompare(b));

  if (dryRun) {
    console.log("Dry run — no S3 uploads (no S3 API calls).");
  }
  const awsRegion = process.env.AWS_REGION?.trim();
  console.log(`AWS region: ${awsRegion ?? "(unset — SDK default chain)"}`);
  console.log(`Bucket: ${bucket}`);
  console.log(`Key prefix: ${keyPrefix}`);
  console.log(`Recipe count: ${recipeIds.length}`);
  console.log("");

  let totalBytes = 0;
  let objectCount = 0;

  for (const recipeId of recipeIds) {
    const recipe = getNamedRecipe(recipeId);
    const meeting = createMockMeetingFromRecipe(recipe);
    const meetingBody = `${JSON.stringify(meeting, null, 2)}\n`;
    const recipeBody = `${JSON.stringify(recipe, null, 2)}\n`;

    const meetingKey = objectKey(keyPrefix, recipeId, "mock-meeting.json");
    const recipeKey = objectKey(keyPrefix, recipeId, "recipe.json");

    console.log(recipeId);

    await putOrLogDryRun(dryRun, bucket, meetingKey, meetingBody, `recipeId=${recipeId}`);
    await putOrLogDryRun(dryRun, bucket, recipeKey, recipeBody, `recipeId=${recipeId}`);

    totalBytes += utf8ByteLength(meetingBody) + utf8ByteLength(recipeBody);
    objectCount += 2;
  }

  console.log("");
  const summaryVerb = dryRun ? "Would upload" : "Uploaded";
  console.log(`${summaryVerb} ${objectCount} objects, ~${totalBytes} bytes total (UTF-8 body sizes).`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
