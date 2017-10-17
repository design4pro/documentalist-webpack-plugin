"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const documentalist_1 = require("documentalist");
const text_1 = require("./lib/text");
class DocumentalistPlugin {
    constructor(pluginOptions) {
        this.pluginOptions = pluginOptions;
        const defaults = {
            navPage: "_nav",
            globs: "**/*",
            filepath: "docs.json"
        };
        this.options = Object.assign(defaults, this.pluginOptions);
    }
    apply(compiler) {
        compiler.plugin("after-emit", (compilation, callback) => {
            new documentalist_1.Documentalist({
                markdown: {
                    renderer: text_1.default.renderer
                },
                // must mark our @Decorator APIs as reserved so we can use them in code samples
                reservedTags: ["import", "ContextMenuTarget", "HotkeysTarget"]
            })
                .use(".md", new documentalist_1.MarkdownPlugin({
                navPage: this.options.navPage
            }))
                .use(/\.d\.ts$/, new documentalist_1.TypescriptPlugin({
                excludeNames: [/Factory$/, /^I.+State$/],
                excludePaths: ["node_modules/", "core/typings"],
                includeDefinitionFiles: true
            }))
                .use(".scss", new documentalist_1.KssPlugin({}))
                .documentGlobs(...this.options.globs)
                .then(docs => JSON.stringify(docs, null, 2))
                .then(content => {
                text_1.default.toFile(this.options.filepath, content);
                console.log("Your documentation has been parsed!");
                callback();
            })
                .catch(error => {
                compilation.errors.push(error);
            });
        });
    }
}
exports.DocumentalistPlugin = DocumentalistPlugin;
