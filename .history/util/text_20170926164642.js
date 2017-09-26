"use strict";

var fs = require("fs");
var marked = require("marked");
var Highlights = require("highlights");

var DEFAULT_SCOPE = "source.tsx";

// Highlights configuration (https://github.com/atom/highlights)

var highlighter = new Highlights();
// a few additional languages... highlights comes with a basic set.
["better-handlebars", "language-typescript", "language-less"].forEach(function (pkg) {
    highlighter.requireGrammarsSync({
        modulePath: require.resolve(`${pkg}/package.json`)
    });
});

// highlights the given text in the given language scope. returns HTML string wrapped in <pre> tag.
// must provide full TextMate language scope: "text.html.basic"
function highlight(fileContents, scopeName = DEFAULT_SCOPE) {
    if (fileContents) {
        return highlighter.highlightSync({ fileContents, scopeName });
    }
}

// Marked configuration (https://github.com/chjj/marked)

// custom renderer lets us change tag semantics
var renderer = new marked.Renderer();
renderer.code = function (textContent, language) {
    // massage markdown language hint into TM language scope
    if (language === "html") {
        language = "text.html.handlebars";
    } else if (language != null && !/^source\./.test(language)) {
        language = `source.${language}`;
    }
    // highlights returns HTML already wrapped in a <pre> tag
    return highlight(textContent, language);
};

module.exports = {
    // return a vinyl-source-stream with the given filename and write the contents to it.
    toFile: function (filename, contents) {
        return fs.writeFileSync(filename, contents, "utf8");;
    },

    // synchronously read and return string content of file.
    fromFile: function (filepath) {
        return fs.readFileSync(filepath, "utf8");
    },

    highlight,

    // render the given text as markdown, using the custom rendering logic above.
    // code blocks are highlighted using highlight() above.
    markdown: function (textContent) {
        return marked(textContent, {
            renderer
        });
    },

    renderer,
};