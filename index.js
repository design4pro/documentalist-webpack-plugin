"use strict";

const { Documentalist, MarkdownPlugin, TypescriptPlugin, KssPlugin } = require('documentalist');
const text = require("./lib/text");

function DocumentalistPlugin(options) {
    this.options = options;
}

DocumentalistPlugin.prototype.apply = (compiler) => {
    var self = this;

    compiler.plugin('after-emit', (compilation, callback) => {
        new Documentalist({
                markdown: {
                    renderer: text.renderer
                },
                // must mark our @Decorator APIs as reserved so we can use them in code samples
                reservedTags: ["import", "ContextMenuTarget", "HotkeysTarget"]
            })
            .use(".md", new MarkdownPlugin({
                navPage: self.options.navPage
            }))
            .use(/\.d\.ts$/, new TypescriptPlugin({
                excludeNames: [/Factory$/, /^I.+State$/],
                excludePaths: ["node_modules/", "core/typings"],
                includeDefinitionFiles: true
            }))
            .use(".scss", new KssPlugin())
            .documentGlobs("packages/*/src/**/*", "packages/*/dist/index.d.ts")
            .then((docs) => JSON.stringify(docs, null, 2))
            .then((content) => {
                text.toFile(self.options.filepath, content);

                console.log('Your documentation has been parsed!');
                callback();
            })
            .then((error) => {
                if (error) throw error;
            });
    });
};

module.exports = DocumentalistPlugin;
