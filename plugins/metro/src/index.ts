import path from "path";
import { type BuildPluginArgs, log } from "@hot-updater/plugin-core";
import { execa } from "execa";
import fs from "fs/promises";

interface RunBundleArgs {
  cwd: string;
  platform: string;
  buildPath: string;
}

const runBundle = async ({ cwd, platform, buildPath }: RunBundleArgs) => {
  const reactNativePath = require.resolve("react-native");
  const cliPath = path.resolve(reactNativePath, "..", "cli.js");

  const bundleOutput = path.join(buildPath, `index.${platform}.bundle`);

  const args = [
    "bundle",
    "--assets-dest",
    buildPath,
    "--bundle-output",
    bundleOutput,
    "--dev",
    String(false),
    "--entry-file",
    "index.js",
    "--platform",
    String(platform),
    "--sourcemap-output",
    [bundleOutput, "map"].join("."),
    "--reset-cache",
  ];

  log.normal("\n");

  const { stderr } = await execa(cliPath, args, {
    cwd,
    reject: true,
  });

  if (stderr) {
    log.error(stderr.trim());
  }

  const bundleId = await fs.readFile(
    path.join(buildPath, "BUNDLE_ID"),
    "utf-8",
  );

  if (!bundleId) {
    throw new Error("Bundle ID not found");
  }

  return bundleId;
};

export const metro =
  () =>
  async ({ cwd, platform }: BuildPluginArgs) => {
    const buildPath = path.join(cwd, "build");

    await fs.rm(buildPath, { recursive: true, force: true });
    await fs.mkdir(buildPath, { recursive: true });

    const bundleId = await runBundle({ cwd, platform, buildPath });

    return {
      buildPath,
      bundleId,
    };
  };
