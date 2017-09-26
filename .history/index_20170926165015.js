"use strict";

var dm = require('documentalist');
var yaml = require('js-yaml');
var path = require('path');
var fs = require('fs');
var text = require("./util/text");

function DocumentalistPlugin(options) {
    this.options = options;
}

DocumentalistPlugin.prototype.apply = function(compiler) {
    var self = this;

    compiler.plugin('after-emit', function(compilation, callback) {
        new dm.Documentalist({
                markdown: {
                    renderer: text.renderer
                },
                // must mark our @Decorator APIs as reserved so we can use them in code samples
                reservedTags: ["import", "ContextMenuTarget", "HotkeysTarget"],
            })
            .use(".md", new dm.MarkdownPlugin({
                navPage: self.options.navPage
            }))
            .use(/\.d\.ts$/, new dm.TypescriptPlugin({
                excludeNames: [/Factory$/, /^I.+State$/],
                excludePaths: ["node_modules/", "core/typings"],
                includeDefinitionFiles: true
            }))
            .use(".scss", new dm.KssPlugin())
            .documentGlobs("packages/*/src/**/*", "packages/*/dist/index.d.ts")
            .then(function (docs) {
                return JSON.stringify(docs, null, 2);
            })
            .then(function (content) {
                text.toFile(self.options.filepath, content);

                console.log('Your documentation has been parsed!');
                callback();
            })
            .then(function (error) {
                if (error) throw error;
            });
    });
};

module.exports = DocumentalistPlugin;
