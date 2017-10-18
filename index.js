const { Documentalist, MarkdownPlugin, TypescriptPlugin } = require("documentalist");
const SassdocPlugin = require("./lib/sassdoc");
const text = require("./lib/text");

class DocumentalistPlugin {
    constructor(options = {}) {
        const defaults = {
            filepath: "docs.json",
            globs: "**/*",
            navPage: "_nav",
        };

        this.options = Object.assign(defaults, options);
    }

    apply(compiler) {
        compiler.plugin("after-emit", (compilation, callback) => {
            new Documentalist({
                markdown: {
                    renderer: text.renderer
                },
                // must mark our @Decorator APIs as reserved so we can use them in code samples
                reservedTags: ["import", "ContextMenuTarget", "HotkeysTarget"]
            })
            .use(".md", new MarkdownPlugin({
                navPage: this.options.navPage
            }))
            .use(/\.d\.ts$/, new TypescriptPlugin({
                excludeNames: [/Factory$/, /^I.+State$/],
                excludePaths: ["node_modules/", "core/typings"],
                includeDefinitionFiles: true
            }))
            .use(".scss", new SassdocPlugin({}))
            .documentGlobs(...this.options.globs)
            .then((docs) => JSON.stringify(docs, null, 2))
            .then((content) => {
                text.toFile(this.options.filepath, content);

                console.log("Your documentation has been parsed!");
                callback();
            })
            .catch((error) => {
                compilation.errors.push(error);
            });
        });
    }
}

module.exports = DocumentalistPlugin;
