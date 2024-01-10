import { checkEnvironmentVariable } from './util.js';
import http from 'node:http';
import { spawn } from 'node:child_process';
import schedule from 'node-schedule';

// Checking environment variables.
checkEnvironmentVariable();

/**
 * Run processing program
 * @param {Array<string>} [itemIdList=[]] - A list of Item ID
 */
const run = (itemIdList = []) => {
    //Run processing
    const child = spawn('node', ['src/index.js', itemIdList.join(',')]);
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    child.on('close', (code) => {
        console.log(`Processing program exited with code ${code}`);
    });
};

if (process.env.JELLYFIN_SORT_HOOK_PORT) {
    const portNumber = parseInt(process.env.JELLYFIN_SORT_HOOK_PORT);
    // Create a local server to receive data from
    const server = http.createServer(async (req, res) => {
        // Get body from req
        const request = await new Promise((resolve, reject) => {
            let data = '';
            req.on('data', chunk => data += chunk);
            req.on('end', () => {
                try {
                    const requestJson = JSON.parse(data);
                    resolve(requestJson);
                } catch (error) {
                    reject(error);
                }
            });
            req.on('error', reject);
        }).catch(console.error);

        // Respond empty status.
        res.writeHead(204);
        res.end();

        // Process item.
        const itemId = request.ItemId;
        console.log(`Trigger hook for Item: ${itemId}`);
        run([itemId]);
    });

    server.listen(portNumber);
    console.log(`Server listening on ${portNumber}`);
}

if (process.env.JELLYFIN_SORT_CRON) {
    const cronStringList = process.env.JELLYFIN_SORT_CRON.split(',');
    for (const cronString of cronStringList) {
        schedule.scheduleJob(cronString, run);
        console.log(`Schedule with ${cronString}`);
    }
} else {
    // Run once immediately.
    run();
}
