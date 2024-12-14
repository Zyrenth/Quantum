import { format as prettify } from 'prettier';
import { ModuleKind, Project, ScriptTarget, ts } from 'ts-morph';

export const convertToJs = (code: string, jsx: boolean) => {
    const commentCode = Date.now();
    const fixedCode = code.split('\n').map((line) => line === '' ? `/** ${commentCode} **/` : line).join('\n');

    const project = new Project({
        compilerOptions: {
            target: ScriptTarget.ESNext,
            jsx: jsx ? ts.JsxEmit.Preserve : ts.JsxEmit.React,
            module: ModuleKind.ESNext,
            removeComments: false,
            newLine: ts.NewLineKind.LineFeed,
            noEmit: false,
            noEmitHelpers: false,
        },
    });

    const sourceFile = project.createSourceFile('file.tsx', fixedCode);

    const jsCode = sourceFile?.getEmitOutput()?.getOutputFiles()?.[0]?.getText();
    return jsCode?.split('\n').map((line) => line === `/** ${commentCode} **/` ? '' : line).join('\n') ?? code;
};

export const format = async (code: string, ts?: boolean) => {
    const formattedCode = await prettify(code, {
        parser: ts ? 'babel-ts' : 'babel',
        jsxBracketSameLine: true,
        semi: true,
        singleQuote: true,
        trailingComma: 'all',
        arrowParens: 'always',
        printWidth: 80,
        tabWidth: 4,
        useTabs: false,
        jsxSingleQuote: false,
        bracketSpacing: true,
        proseWrap: 'preserve',
        endOfLine: 'lf',
    });

    return formattedCode;
};
