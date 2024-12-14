export const templates = {
    passed: '\x1b[32m✔\x1b[0m',
    failed: '\x1b[31m✖\x1b[0m',
    warning: '\x1b[33m⚠\x1b[0m',
    info: '\x1b[34mℹ\x1b[0m',
    item: '\x1b[36m•\x1b[0m'
};

export const pass = (...message: any[]) => {
    console.log(templates.passed, ...message);
};

export const fail = (...message: any[]) => {
    console.log(templates.failed, ...message);
};

export const warning = (...message: any[]) => {
    console.log(templates.warning, ...message);
};

export const info = (...message: any[]) => {
    console.log(templates.info, ...message);
};

export const item = (...message: any[]) => {
    console.log(templates.item, ...message);
};

export const wipePreviousLine = () => {
    process.stdout.write('\x1b[1A\x1b[2K');
};

export const hexToColor = (hex: string, fallback?: string): string => {
    if (hex.length !== 6) {
        return fallback || '\x1b[0m';
    } else if (/[^0-9A-F]/i.test(hex)) {
        return fallback || '\x1b[0m';
    }

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return `\x1b[38;2;${r};${g};${b}m`;
};
