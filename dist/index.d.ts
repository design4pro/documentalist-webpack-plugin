export interface IDocumentalistPluginOptions {
    navPage: string;
    globs: string[];
    filepath: string;
}
export declare class DocumentalistPlugin {
    private pluginOptions;
    private options;
    constructor(pluginOptions: IDocumentalistPluginOptions);
    apply(compiler: any): void;
}
