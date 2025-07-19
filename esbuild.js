import esbuild from "esbuild";
import fs from "fs";
import path from "path";

const bundles = [
  {
    name: "appbridge",
    src: "AppBridge",
    out: "extensions/theme-app-blocks/assets/app-bridge.min.js",
  },
  // {
  //   name: "imageeditor",
  //   src: "ImageEditor",
  //   out: "extensions/theme-app-blocks/assets/image-editor.min.js",
  // },
];

for (const { name, src, out } of bundles) {
  const entryDir = path.resolve("theme-extension-src", src);
  const files = fs
    .readdirSync(entryDir)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
    .map((f) => `./${src}/${f}`);

  const syntheticEntry = path.resolve(
    "theme-extension-src/temp",
    `__temp_entry_${name}.ts`,
  );
  fs.writeFileSync(
    syntheticEntry,
    files.map((f) => `import ".${f}";`).join("\n"),
  );

  const ctx = await esbuild.context({
    entryPoints: [syntheticEntry],
    bundle: true,
    minify: true,
    format: "esm",
    outfile: out,
    logLevel: "info",
    sourcemap: false,
  });

  await ctx.watch();
  console.log(`👀 Watching: ${src} → ${out}`);
}
