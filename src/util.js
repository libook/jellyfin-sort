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
        "JELLYFIN_SERVER": (value) => (!!value), // Jellyfin server URL
        "JELLYFIN_KEY": (value) => (!!value), // Jellyfin key
        "JELLYFIN_SORT_EMPTY_ONLY": () => true, // Only process while sort name is empty. Set to anything to enable. Leave to blank to disable.
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
    };
    for (const environmentVariable in environmentVariableValidatorMap) {
        if (!environmentVariableValidatorMap[environmentVariable](process.env[environmentVariable])) {
            throw new Error(`Bad variable ${environmentVariable} with value ${process.env[environmentVariable]}`);
        }
    }
};
