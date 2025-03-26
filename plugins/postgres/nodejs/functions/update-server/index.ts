import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { verifyJwtSignedUrl, withJwtSignedUrl } from "@hot-updater/js";
import { Hono } from "hono";
import { logger } from "hono/logger";
import pg from "pg";
import { getUpdateInfo } from "./getUpdateInfo";

const pool = new pg.Pool({
  host: process.env.HOT_UPDATER_POSTGRES_HOST!,
  port: process.env.HOT_UPDATER_POSTGRES_PORT!,
  user: process.env.HOT_UPDATER_POSTGRES_USER!,
  password: process.env.HOT_UPDATER_POSTGRES_PASSWORD!,
  database: process.env.HOT_UPDATER_POSTGRES_DATABASE!,
});

const s3Client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT,
  forcePathStyle: true,
});

const app = new Hono();
app.use(logger());

app.get("/api/check-update", async (c) => {
  try {
    const bundleId = c.req.header("x-bundle-id") as string;
    const appPlatform = c.req.header("x-app-platform") as "ios" | "android";
    const appVersion = c.req.header("x-app-version") as string;
    const minBundleId = c.req.header("x-min-bundle-id") as string | undefined; // nil
    const channel = c.req.header("x-channel") as string | undefined; // production

    if (!bundleId || !appPlatform || !appVersion) {
      return c.json(
        { error: "Missing bundleId, appPlatform, or appVersion" },
        400,
      );
    }

    const updateInfo = await getUpdateInfo(pool, {
      platform: appPlatform,
      bundleId,
      appVersion,
      minBundleId,
      channel,
    });
    if (!updateInfo) {
      return c.json(null);
    }

    const appUpdateInfo = await withJwtSignedUrl({
      data: updateInfo,
      reqUrl: c.req.url,
      jwtSecret:
        process.env.JWT_SECRET ||
        "229b6dad821c484fcc749627f5508fa18825701085d76a0ff0e87ae22362a836",
    });

    return c.json(appUpdateInfo, 200);
  } catch (e) {
    console.error(e);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

app.get("*", async (c) => {
  const result = await verifyJwtSignedUrl({
    path: c.req.path,
    token: c.req.query("token"),
    jwtSecret:
      process.env.JWT_SECRET ||
      "229b6dad821c484fcc749627f5508fa18825701085d76a0ff0e87ae22362a836",
    handler: async (key) => {
      try {
        const body = await s3Client.send(
          new GetObjectCommand({
            Bucket: process.env.HOT_UPDATER_S3_BUCKET_NAME! || "hot-updater",
            Key: key,
          }),
        );

        return {
          body: body.Body,
          contentType: body.ContentType,
        };
      } catch {
        return null;
      }
    },
  });

  if (result.status !== 200) {
    return c.json({ error: result.error }, result.status);
  }

  return c.body(result.responseBody, 200, result.responseHeaders);
});

export default app;
