import cronParseer from 'cron-parser';

/**
 * Handle fetch error
 * @param {Response} response 
 * @return {Response}
 */
export const fetchErrorHandler = async (response) => {
    if (!response.ok) {
        throw new Error(await response.text());
    } else {
        return response;
    }
};

/**
 * Check environment variables
 */
export const checkEnvironmentVariable = () => {
    /**
     * @callback EnvironmentVariableValidator
     * @param {string} value
     * @return {boolean}
     */
    /**
     * @type {Object<string, EnvironmentVariableValidator>}
     */
    const environmentVariableValidatorMap = {
        "JELLYFIN_KEY": (value) => (Boolean(value)), // Jellyfin key
        "JELLYFIN_SERVER": (value) => (Boolean(value)), // Jellyfin server URL
        "JELLYFIN_SORT_CRON": (value) => {
            // Use cron-style expression to define schedule.
            // Using commas to split multiple expressions. e.g. "42 * * * *,18 * * * *"
            // Leave to blank to run once immediately.
            if (value) {
                const cronStringList = value.split(',');
                for (const cronString of cronStringList) {
                    try {
                        cronParseer.parseExpression(cronString);
                    } catch (error) {
                        return false;
                    }
                }
                return true;
            } else {
                return true;
            }
        },
        "JELLYFIN_SORT_EMPTY_ONLY": () => true, // Only process while sort name is empty. Set to anything to enable. Leave to blank to disable.
        "JELLYFIN_SORT_HOOK_PORT": (value) => {
            // Set a port to recieve hook from Webhook plugin. https://github.com/jellyfin/jellyfin-plugin-webhook
            // Leave to blank to disable.
            if (value) {
                const numberValue = parseInt(value);
                return (
                    !isNaN(numberValue)
                    && numberValue >= 0
                    && numberValue <= 65535
                );
            } else {
                return true;
            }
        }
    };
    for (const environmentVariable in environmentVariableValidatorMap) {
        if (!environmentVariableValidatorMap[environmentVariable](process.env[environmentVariable])) {
            throw new Error(`Bad variable ${environmentVariable} with value ${process.env[environmentVariable]}`);
        }
    }
};
