const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

async function requireResolve(specifier, parent, system) {
  try {
    // Let the default resolve algorithm try first
    let { url, format } = system(specifier, parent);

    // Resolve symlinks
    if (url.startsWith("file://")) {
      const realpath = await fs.promises.realpath(url.replace("file://", ""));
      url = `file://${realpath}`;
    }

    return { url, format };
  } catch (error) {
    const base = parent
      ? path.dirname(parent.replace("file://", ""))
      : process.cwd();
    const require = module.createRequire(path.join(base, specifier));

    let modulePath;
    try {
      modulePath = require.resolve(specifier);
    } catch (e) {
      // .cjs is apparently not part of the default resolution algorithm,
      // so check if .cjs file exists before bailing completely
      modulePath = require.resolve(`${specifier}.cjs`);
    }

    const ext = path.extname(modulePath);

    let format = EXTENSIONS[ext] || "module";

    // Mimic default behavior of treating .js[x]? as ESM iff
    // relevant package.json contains { "type": "module" }
    if (!ext || [".js", ".jsx"].includes(ext)) {
      const dir = path.dirname(modulePath);
      const pkgdef = findPackageJson(dir).next();
      const type = pkgdef && pkgdef.value && pkgdef.value.type;
      format = type === "module" ? "module" : "dynamic";
    }

    modulePath = await fs.promises.realpath(modulePath);

    return { url: `file://${path}`, format };
  }
}

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    format: "cjs",
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: "node",
    outfile: "dist/extension.js",
    external: ["vscode"],
    logLevel: "silent",
    plugins: [
      /* add to the end of plugins array */
      esbuildProblemMatcherPlugin,
      jsdomPatch,
    ],
  });
  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

const jsdomPatch = {
  name: "jsdom-patch",
  setup(build) {
    build.onLoad({ filter: /XMLHttpRequest-impl\.js$/ }, async (args) => {
      let contents = await fs.promises.readFile(args.path, "utf8");
      contents = contents.replace(
        'const syncWorkerFile = require.resolve ? require.resolve("./xhr-sync-worker.js") : null;',
        `const syncWorkerFile = "${await requireResolve(
          "jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js"
        )}";`.replaceAll("\\", process.platform === "win32" ? "\\\\" : "\\")
      );
      return { contents, loader: "js" };
    });
  },
};

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: "esbuild-problem-matcher",

  setup(build) {
    build.onStart(() => {
      console.log("[watch] build started");
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(
          `    ${location.file}:${location.line}:${location.column}:`
        );
      });
      console.log("[watch] build finished");
    });
  },
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
