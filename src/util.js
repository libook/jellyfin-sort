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
}
