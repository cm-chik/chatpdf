import { S3 } from "@aws-sdk/client-s3";
import fs from "fs";

export async function downloadFromS3(file_key: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const s3 = new S3({
        region: process.env.NEXT_PUBLIC_S3_REGION!,
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
        },
      });
      const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: file_key,
      };
      const obj = await s3.getObject(params);
      const file_name = `/tmp/${Date.now().toString()}.pdf`;
      const body = await obj.Body?.transformToByteArray();
      if (!body) {
        throw new Error("Failed to retrieve file content from S3");
      }
      await fs.promises.writeFile(file_name, Buffer.from(body));
      resolve(file_name);
    } catch (error) {
      console.error("Error downloading file from S3:", error);
      reject(error);
      return null;
    }
  });
}
