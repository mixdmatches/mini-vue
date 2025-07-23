import minimist from "minimist";
import esbuild from "esbuild";
import {resolve, dirname} from "path";
import {fileURLToPath} from "url";
import {createRequire} from "module";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = minimist(process.argv.slice(2));

const require = createRequire(import.meta.url);
const target = args._[0] || "reactivity";
const format = args.f || "iife";

const entry = resolve(__dirname, `../packages/${target}/src/index.ts`);
const pkg = require(`../packages/${target}/package.json`);

esbuild
	.context({
		entryPoints: [entry],
		outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`),
		bundle: true,
		platform: "browser",
		sourcemap: true,
		format,
		globalName: pkg.buildOptions?.name,
	})
	.then((ctx) => {
		ctx.watch();
	});
