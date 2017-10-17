declare const text: {
    toFile: (filename: any, contents: any) => any;
    fromFile: (filepath: any) => any;
    highlight: (fileContents: any, scopeName?: string) => any;
    markdown: (textContent: any) => any;
    renderer: any;
};
export default text;
