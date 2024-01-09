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
    const environmentVariableValidatorMap = {
        "JELLYFIN_SERVER": (value) => (!!value), // Jellyfin server URL
        "JELLYFIN_KEY": (value) => (!!value), // Jellyfin key
        "JELLYFIN_SORT_EMPTY_ONLY": () => true, // Only process while sort name is empty. Set to anything to enable. Leave to blank to disable.
    };
    for (const environmentVariable in environmentVariableValidatorMap) {
        if (!environmentVariableValidatorMap[environmentVariable](process.env[environmentVariable])) {
            throw new Error(`Bad variable ${environmentVariable} with value ${process.env[environmentVariable]}`);
        }
    }
};
