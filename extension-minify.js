import esbuild from "esbuild";
import fs from "fs";
import path from "path";

/*
 *  minification script for the dropzone-component js and css.
    Shopify recommends keeping JS under 100KB, we're at under 10kb rn...
 */

// Only target the dropzone-component folder
const dropzoneComponentDir = "extensions/dropzone-component";

// Function to find the `assets/` folder inside the dropzone-component
function findAssetsDirectory(dir) {
  const assetsPath = path.join(dir, "assets");

  if (fs.existsSync(assetsPath)) {
    return assetsPath;
  }

  return null;
}

// Get the `assets/` directory inside the dropzone-component
const assetsPath = findAssetsDirectory(dropzoneComponentDir);

if (assetsPath) {
  const files = fs.readdirSync(assetsPath).filter(
    (file) =>
      /\.(js|css)$/.test(file) && // Only .js or .css files
      !/\.min\.(js|css)$/.test(file), // Ignore already minified files
  );

  files.forEach(async (file) => {
    const inputFile = path.join(assetsPath, file);
    const ext = path.extname(file);
    const baseName = path.basename(file, ext);
    const outputFile = path.join(assetsPath, `${baseName}.min${ext}`);

    try {
      await esbuild.build({
        entryPoints: [inputFile],
        outfile: outputFile,
        minify: true,
        bundle: false,
        sourcemap: false,
      });

      console.log(`Minified: ${inputFile} → ${outputFile}`);
    } catch (error) {
      console.error(`Error minifying ${inputFile}:`, error);
    }
  });
} else {
  console.log("No assets directory found in dropzone-component.");
}
