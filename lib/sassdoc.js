"use strict";

import * as path from "path";
import * as sassdoc from "sassdoc";
import { ICompiler, IFile, IPlugin } from "documentalist";

/** A single modifier for an example. */
export interface ISassdocModifier {
    documentation: string;
    name: string;
}

/**
 * A markup/modifiers example parsed from a KSS comment block.
 */
export interface ISassdocExample {
    /** Raw documentation string. */
    documentation: string;
    /**
     * Raw HTML markup for example with `{{.modifier}}` templates,
     * to be used to render the markup for each modifier.
     */
    markup: string;
    /**
     * Syntax-highlighted version of the markup HTML, to be used
     * for rendering the markup itself with pretty colors.
     */
    markupHtml: string;
    /** Array of modifiers supported by HTML markup. */
    modifiers: ISassdocModifier[];
    /** Unique reference for addressing this example. */
    reference: string;
}

export interface ISassdocPluginData {
    css: {
        [reference: string]: ISassdocExample;
    };
}

export default class SassdocPlugin implements IPlugin<ISassdocPluginData> {
    public constructor(private options: sassdoc.IOptions) {}

    public compile(cssFiles: IFile[], dm: ICompiler) {
        const styleguide = this.parseFiles(cssFiles);
        const sections = styleguide.sections().map((s) => convertSection(s, dm));
        const css = dm.objectify(sections, (s) => s.reference);
        return { css };
    }

    private parseFiles(files: IFile[]) {
        const input = files.map<sassdoc.IFile>((file) => ({
            base: path.dirname(file.path),
            contents: file.read(),
            path: file.path,
        }));
        const options = { multiline: false, markdown: false, ...this.options };
        return sassdoc.parse(input, options);
    }
}

function convertSection(section: sassdoc.ISection, dm: ICompiler): ISassdocExample {
    return {
        documentation: dm.renderMarkdown(section.description()),
        markup: section.markup() || "",
        markupHtml: dm.renderMarkdown(`\`\`\`html\n${section.markup() || ""}\n\`\`\``),
        modifiers: section.modifiers().map((mod) => convertModifier(mod, dm)),
        reference: section.reference(),
    };
}

function convertModifier(mod: sassdoc.IModifier, dm: ICompiler): ISassdocModifier {
    return {
        documentation: dm.renderMarkdown(mod.description()),
        name: mod.name(),
    };
}
