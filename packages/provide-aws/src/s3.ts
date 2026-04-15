import { S3Client, GetObjectCommand, PutObjectCommand, PutObjectCommandInput, GetObjectCommandInput, GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { returnError, returnResult } from "@mtngtools/core";

// let s3Client: S3Client | null = null;

export type S3LogOptions = {
    logErrorMessageOnly?: boolean,
    logError?: boolean,
    logBucketAndKey?: boolean
}

/** Prefer explicit region from env so deploy scripts match Varlock / `.env` regardless of profile defaults. */
function resolveAwsRegion(): string | undefined {
    const r = process.env.AWS_REGION?.trim() || process.env.AWS_DEFAULT_REGION?.trim();
    return r || undefined;
}

function createDefaultS3Client(): S3Client {
    const region = resolveAwsRegion();
    // @aws-sdk/client-s3 is external in our build; default credential chain matches `aws` CLI.
    return region ? new S3Client({ region }) : new S3Client();
}

function toPutObjectInput(input: MTPutObjectCommandInput): PutObjectCommandInput {
    const { logBucketAndKey: _b, logError: _e, logErrorMessageOnly: _m, ...rest } = input;
    return rest;
}

function toGetObjectInput(input: MTGetObjectCommandInput): GetObjectCommandInput {
    const { logBucketAndKey: _b, logError: _e, logErrorMessageOnly: _m, ...rest } = input;
    return rest;
}

// export const getS3Client = () => {
//   if (!s3Client) {
//     s3Client = new S3Client();
//   }
//   return s3Client;
// }

export type MTPutObjectCommandInput = PutObjectCommandInput & S3LogOptions

export type MTGetObjectCommandInput = GetObjectCommandInput & S3LogOptions

export const getFileFromS3 = async (input: MTGetObjectCommandInput, s3Client?: S3Client) => {
    const client = s3Client ?? createDefaultS3Client();
    if (input.logBucketAndKey) {
        console.log(`Bucket: ${input.Bucket}, Key: ${input.Key}`);
    }
    try {
        const result = await client.send(new GetObjectCommand(toGetObjectInput(input)));
        return returnResult<GetObjectCommandOutput>(result);
    } catch (error) {
        if (input.logError) {
            console.error("ERROR in getFileFromS3:", error);
        }
        return returnError(error as Error);
    }
}

export const putStringToS3 = async (input: MTPutObjectCommandInput, s3Client?: S3Client) => {
    const client = s3Client ?? createDefaultS3Client();
    if (input.logBucketAndKey) {
        console.log(`Bucket: ${input.Bucket}, Key: ${input.Key}`);
    }
    try {
        await client.send(new PutObjectCommand(toPutObjectInput(input)));
        return returnResult<boolean>(true);
    } catch (error) {
        if (input.logError) {
            console.error("ERROR in putStringToS3:", error);
        }
        return returnError(error as Error);
    }
}

export const getTextFileFromS3 = async (input: MTGetObjectCommandInput, s3Client?: S3Client) => {
    const s3Result = await getFileFromS3(input, s3Client);
    if (s3Result.error) {
        return returnError(s3Result.errorData);
    } else {
        try {
            const data = s3Result.result;
            const body = data?.Body;
            if (body) {
                const bodyContents = await data.Body?.transformToString("utf-8");
                if (bodyContents) {
                    return returnResult<string>(bodyContents);
                } else {
                    return returnError(new Error("No text in body in s3 GetObject output"));
                }
            } else {
                return returnError(new Error("No body in S3 GetObject output"));
            }
        } catch (error) {
            return returnError(error as Error);
        }
    }
}

export const getObjectInJSONFromS3 = async <T = Object>(input: MTGetObjectCommandInput, s3Client?: S3Client) => {
    const s3Result = await getTextFileFromS3(input, s3Client);
    if (s3Result.error) {
        return returnError(s3Result.errorData);
    } else {
        try {
            const jsonObj = JSON.parse(s3Result.result);
            if (jsonObj) {
                return returnResult(jsonObj as T);
            } else {
                return returnError(new Error("No body in S3 GetObject output"));
            }
        } catch (error) {
            return returnError(error as Error);
        }
    }
}









