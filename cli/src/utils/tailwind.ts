import * as path from 'path';
import { ExportAssignment, IndentationText, Node, ObjectLiteralExpression, Project, PropertyAssignment, SourceFile, SyntaxKind } from 'ts-morph';

export class Tailwind {
    private configFilePath;
    private tsConfigPath;
    private isTypescript: boolean;
    private project: Project;
    private sourceFile: SourceFile;

    constructor(ts: boolean, configPath: string, tsConfigPath: string) {
        this.configFilePath = path.resolve(configPath);
        this.tsConfigPath = path.resolve(tsConfigPath);
        this.isTypescript = ts;

        this.project = new Project({
            tsConfigFilePath: this.tsConfigPath,
            manipulationSettings: {
                indentationText: IndentationText.FourSpaces,
            }
        });

        this.sourceFile = this.project.addSourceFileAtPath(this.configFilePath);
    }

    getConfigObject(): ObjectLiteralExpression | undefined {
        // On a sidenote: What a perfect naming: If this is Typescript.
        if (this.isTypescript) {
            const exportAssignment: ExportAssignment | undefined = this.sourceFile.getExportAssignments()[0];

            if (!exportAssignment) throw new Error('No export assignment found');
            if (![SyntaxKind.SatisfiesExpression, SyntaxKind.ObjectLiteralExpression, SyntaxKind.Identifier].includes(exportAssignment.getExpression().getKind()))
                throw new Error('Couldn\'t find a valid config export.');

            if (exportAssignment.getExpression().getKind() === SyntaxKind.Identifier) {
                const exportDeclaration = exportAssignment.getExpression().getText();
                return this.sourceFile.getVariableDeclarationOrThrow(exportDeclaration).getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
            } else if (exportAssignment.getExpression().getKind() === SyntaxKind.SatisfiesExpression) {
                return exportAssignment.getExpression().getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);
            } else if (exportAssignment.getExpression().getKind() === SyntaxKind.ObjectLiteralExpression) {
                return exportAssignment.getExpressionIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
            } else {
                throw new Error('Couldn\'t find a valid config export.');
            }
        } else {
            const moduleExports = this.sourceFile.getDescendantsOfKind(SyntaxKind.ExpressionStatement)
                .filter(statement => {
                    const expression = statement.getExpression();
                    return expression && expression.getText().startsWith('module.exports');
                });

            if (moduleExports.length === 0) throw new Error('No module export found');

            return moduleExports?.[0]?.getExpression().getChildrenOfKind(SyntaxKind.ObjectLiteralExpression)[0];
        }
    }

    private parseInitializer(initializer: Node | undefined): any {
        if (!initializer) return undefined;

        if (Node.isStringLiteral(initializer)) {
            return initializer.getLiteralText();
        } else if (Node.isNumericLiteral(initializer)) {
            return Number(initializer.getText());
        } else if (initializer.getKind() === SyntaxKind.TrueKeyword) {
            return true;
        } else if (initializer.getKind() === SyntaxKind.FalseKeyword) {
            return false;
        } else if (Node.isObjectLiteralExpression(initializer)) {
            return this.parseObjectLiteral(initializer);
        } else if (Node.isArrayLiteralExpression(initializer)) {
            return initializer.getElements().map(element => this.parseInitializer(element));
        }

        return initializer.getText();
    }

    private parseObjectLiteral(expression: ObjectLiteralExpression): any {
        return expression.getProperties().reduce((obj, prop) => {
            if (Node.isPropertyAssignment(prop)) {
                let key = prop.getName();
                if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
                const initializer = prop.getInitializer();

                if (Node.isObjectLiteralExpression(initializer)) {
                    obj[key] = this.parseObjectLiteral(initializer);
                } else if (Node.isArrayLiteralExpression(initializer)) {
                    obj[key] = initializer.getElements().map(element => this.parseInitializer(element));
                } else {
                    obj[key] = this.parseInitializer(initializer);
                }
            }
            return obj;
        }, {} as Record<string, any>);
    }

    getConfig(): Record<string, unknown> {
        const configObject = this.getConfigObject();

        if (!configObject) return {};

        return this.parseObjectLiteral(configObject);
    }

    get(key: string): any {
        return this.getConfig()[key];
    }

    set(key: string, value: any): void {
        const configObject = this.getConfigObject();
        const properties = configObject?.getProperties() ?? [];
        const propertyIndex = properties.findIndex(prop =>
            prop.getKind() === SyntaxKind.PropertyAssignment && (prop as PropertyAssignment).getName() === key
        );

        if (!configObject) return;

        const firstLine = configObject.getFullText().split('\n')[0];

        if (firstLine === undefined) {
            throw new Error('Couldn\'t find the first line of the config object.');
        }

        const isFormattedProperly = /^[ \t{]*$/.test(firstLine);

        const leadingTriviaList = properties.map(property => property.getFullText());
        const leadingSpacesList = leadingTriviaList
            .map(trivia => trivia.split('\n').filter(line => line !== '')[0])
            .map(line => line?.match(/^[ \t]*/)?.[0] || '');

        const indentCount: { [key: string]: number } = {};
        leadingSpacesList.forEach(spaces => {
            const { length } = spaces;
            if (indentCount[length] === undefined) {
                indentCount[length] = 1;
            } else {
                indentCount[length]++;
            }
        });

        const mostPopularIndent = Object.keys(indentCount).reduce((a, b) => (indentCount[a] ?? 0) > (indentCount[b] ?? 0) ? a : b);
        const indentationSize = isFormattedProperly ? parseInt(mostPopularIndent, 10) : 0;
        const isTab = leadingSpacesList.some(spaces => spaces.includes('\t'));

        this.project.manipulationSettings.set({
            indentationText: (isTab ? '\t' : ' ').repeat(indentationSize) as IndentationText
        });

        if (propertyIndex !== -1) {
            properties[propertyIndex]?.remove();
        }

        const formattedValue = this.formatObject(value, indentationSize);

        if (propertyIndex !== -1) {
            configObject?.insertPropertyAssignment(propertyIndex, {
                name: key,
                initializer: writer => {
                    writer.queueIndentationLevel(1);
                    writer.setIndentationLevel(0);
                    formattedValue.split('\n').forEach(line => writer.write(line).newLine());
                }
            });
        } else {
            configObject?.addPropertyAssignment({
                name: key,
                initializer: writer => {
                    writer.queueIndentationLevel(1);
                    writer.setIndentationLevel(0);
                    formattedValue.split('\n').forEach(line => writer.write(line).newLine());
                }
            });
        }
    }

    private formatObject(value: any, indentSize = 4, indentLevel = 1): string {
        if (typeof value !== 'object' || value === null) {
            return JSON.stringify(value);
        }

        const indent = ' '.repeat(indentSize * indentLevel);
        const entries = Object.entries(value)
            .map(([k, v]) => {
                const formattedKey = this.requiresQuotes(k) ? `"${k}"` : k;
                const formattedValue = typeof v === 'object' ? this.formatObject(v, indentSize, indentLevel + 1) : JSON.stringify(v);
                return `${indent}${formattedKey}: ${formattedValue}`;
            })
            .join(',\n') + ',';

        const reverseIndentSize = indentSize * (indentLevel - 1);

        return `{\n${entries}\n${' '.repeat(
            reverseIndentSize < 0 ? 0 : reverseIndentSize
        )}}`;
    }

    private requiresQuotes(key: string): boolean {
        const reservedWords = new Set([
            'abstract', 'await', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue',
            'debugger', 'default', 'delete', 'do', 'double', 'else', 'enum', 'export', 'extends', 'false', 'final',
            'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import', 'in', 'instanceof', 'int',
            'interface', 'let', 'long', 'native', 'new', 'null', 'package', 'private', 'protected', 'public', 'return',
            'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try',
            'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield'
        ]);

        if (reservedWords.has(key)) return true;

        return !/^[$_\p{L}][$_\p{L}\p{N}]*$/u.test(key);
    }

    async save(): Promise<void> {
        await this.sourceFile.save();
    }
}
