import { checkEnvironmentVariable } from './util.js';
import { spawn } from 'node:child_process';
import schedule from 'node-schedule';

// Checking environment variables.
checkEnvironmentVariable();

const run = () => {
    //Run processing
    const child = spawn('node', ['src/index.js']);
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    child.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
    });
};

if (process.env.JELLYFIN_SORT_CRON) {
    const cronStringList = process.env.JELLYFIN_SORT_CRON.split(',');
    for (const cronString of cronStringList) {
        const job = schedule.scheduleJob(cronString, run);
        console.log(`Schedule with ${cronString}`);
    }
} else {
    // Run once immediately.
    run();
}
