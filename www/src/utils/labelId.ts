import { randomBytes } from 'crypto';

export default class LabelId {
    private format = 'quantum:{{id}}:{{label}}';
    private labels = new Map<string, string>();

    constructor() {}

    public create(label: string): string {
        const id = this.format
            .replaceAll('{{id}}', randomBytes(16).toString('hex'))
            .replaceAll('{{label}}', label);
        this.labels.set(label, id);
        return id;
    }

    public get(label: string): string {
        return this.labels.get(label) || '';
    }
}
