import { exec } from 'child_process';

let scripts = process.argv.slice(2);
const runAsSync = scripts.includes('--sync');
if (runAsSync) scripts = scripts.filter(script => script !== '--sync');

const runScript = (scriptName) => {
    return new Promise((resolve) => {
        const proc = exec(`pnpm run ${scriptName}`, (error) => {
            if (error) {
                console.error(`An error occurred while running script "${scriptName}". Exiting...`);
                process.exit(1);
            } else {
                resolve();
            }
        });

        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
    });
};

const runScriptsConcurrently = async () => {
    try {
        if (!runAsSync) await Promise.all(scripts.map(runScript));
        else for (const script of scripts) {
            await runScript(script);
        }
        console.log('All scripts completed successfully.');
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

runScriptsConcurrently();
