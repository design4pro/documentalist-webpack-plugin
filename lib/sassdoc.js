"use strict";

const path = require("path");
const sassdoc = require("sassdoc");

class SassdocPlugin {
    constructor(options) {}

    compile(cssFiles, dm) {
        return this.parseFiles(cssFiles).then((data) => {
            const sections = data.map((s) => convertSection(s, dm));
            const css = dm.objectify(sections, (s) => s.reference);

            return { css };
        });
    }

    parseFiles(files) {
        const input = files.map((file) => file.path);
        const options = { verbose: true, ...this.options };

        return sassdoc.parse(input, options);
    }
}

function convertSection(section, dm) {
    return {
        documentation: dm.renderMarkdown(section.description),
        markup: section.example || "",
        markupHtml: dm.renderMarkdown(`\`\`\`html\n${section.example || ""}\n\`\`\``),
        reference: section.group.toString()
    };
}

function convertModifier(mod, dm) {
    return {
        type: mod.type,
        name: mod.name,
    };
}

module.exports = SassdocPlugin;
