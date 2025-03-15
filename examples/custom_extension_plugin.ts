import * as esbuild from "https://deno.land/x/esbuild@v0.19.11/mod.js";
import { denoLoaderPlugin, denoResolverPlugin } from "../mod.ts";
import { basename } from "@std/path";

import { get } from "https://deno.land/x/emoji@0.3.1/mod.ts";

const EMOJI_PLUGIN: esbuild.Plugin = {
  name: "emoji",
  setup(build) {
    build.onResolve({ filter: /.*\.emoji$/ }, (args) => {
      return { path: args.path, namespace: "file" };
    });

    build.onLoad({ filter: /.*\.emoji$/, namespace: "file" }, (args) => {
      const emoji = basename(args.path).replace(".emoji", "");
      return {
        contents: `export default "${get(emoji)}";`,
        loader: "ts",
      };
    });
  },
};

const res = await esbuild.build({
  plugins: [
    denoResolverPlugin(),
    EMOJI_PLUGIN, // added before the deno loader plugin to ensure it loads the emoji
    denoLoaderPlugin(),
  ],
  entryPoints: ["./waving_hand.emoji"],
  write: false,
});
console.log(res.outputFiles[0].text); // export default "\u{1F44B}";
const { default: emoji } = await import(
  "data:text/javascript," + res.outputFiles[0].text
);
console.log(emoji); // 👋
esbuild.stop();
