"use strict";

import { Documentalist, MarkdownPlugin, TypescriptPlugin, KssPlugin } from "documentalist";
import text from "./lib/text";

export interface IDocumentalistPluginOptions {
    navPage: string;
    globs: string[];
    filepath: string;
}

export class DocumentalistPlugin {
    private options: IDocumentalistPluginOptions;

    public constructor(private pluginOptions: IDocumentalistPluginOptions) {
        const defaults = {
            navPage: "_nav",
            globs: "**/*",
            filepath: "docs.json"
        };

        this.options = Object.assign(defaults, this.pluginOptions);
    }

    public apply(compiler: any) {
        compiler.plugin("after-emit", (compilation: any, callback: any) => {
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
            .use(".scss", new KssPlugin({}))
            .documentGlobs(...this.options.globs)
            .then(docs => JSON.stringify(docs, null, 2))
            .then(content => {
                text.toFile(this.options.filepath, content);

                console.log("Your documentation has been parsed!");
                callback();
            })
            .catch(error => {
                compilation.errors.push(error);
            });
        });
    }
}
