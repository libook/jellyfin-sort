import { fetchErrorHandler } from './util.js';
import querystring from 'node:querystring';

export default class {
    /**
     * @typedef {Object} JellyfinUser
     * @property {string} Id - User ID
     * @property {string} Name - User name
     * @property {Object} Policy - User policy
     * @property {boolean} Policy.IsAdministrator - Whether user is administrator
     */
    /**
     * Get user list
     * @return {Promise<Array<JellyfinUser>>}
     */
    static async getUserList() {
        return fetch(`${process.env.JELLYFIN_SERVER}/Users/?api_key=${process.env.JELLYFIN_KEY}`)
            .then(fetchErrorHandler)
            .then(response => response.json());
    }
    /**
     * @typedef {Object} JellyfinLibrary
     * @property {string} Id - Library ID
     * @property {string} Name - Library name
     */
    /**
     * Get library list
     * @param {string} userId - Administrator user ID
     * @return {Promise<Array<JellyfinLibrary>>}
     */
    static async getLibraryList(userId) {
        const responseInfo = await fetch(`${process.env.JELLYFIN_SERVER}/Users/${userId}/Views?api_key=${process.env.JELLYFIN_KEY}`)
            .then(fetchErrorHandler)
            .then(response => response.json());
        return responseInfo.Items;
    }
    /**
     * @typedef {Object} JellyfinItemBasic
     * @property {string} Id - Item ID
     * @property {string} Name - Item name
     */
    /**
     * Get item list
     * @param {string} userId - Administrator user ID
     * @param {string} libraryId - Library ID
     * @param {"album"|"artist"} [type] - Get other type of item list
     * @return {Promise<Array<JellyfinItemBasic>>}
     */
    static async getItemList(userId, libraryId, type) {
        const queryInfo = {
            "api_key": process.env.JELLYFIN_KEY,
            "ParentId": libraryId,
        }
        switch (type) {
            case 'album': {
                Object.assign(queryInfo, {
                    "IncludeItemTypes": "MusicAlbum",
                    "Recursive": true,
                });
                break;
            }
            case 'artist': {
                Object.assign(queryInfo, {
                    "ArtistType": "Artist,AlbumArtist",
                    "Recursive": true,
                });
                break;
            }
        }
        return fetch(`${process.env.JELLYFIN_SERVER}/Users/${userId}/Items?${querystring.stringify(queryInfo)}`)
            .then(fetchErrorHandler)
            .then(response => response.json());
    }
    /**
     * @typedef {Object} JellyfinItem
     * @property {string} Id - Item ID
     * @property {string} Name - Item name
     * @property {string} ForcedSortName - The name used for sorting item
     */
    /**
     * Get item detail
     * @param {string} userId - Administrator user ID
     * @param {string} itemId - Item ID
     * @return {Promise<JellyfinItem>}
     */
    static async getItemDetail(userId, itemId) {
        return fetch(`${process.env.JELLYFIN_SERVER}/Users/${userId}/Items/${itemId}?api_key=${process.env.JELLYFIN_KEY}`)
            .then(fetchErrorHandler)
            .then(response => response.json());
    }
    /**
     * Update item
     * @param {string} itemId - Item ID
     * @param {JellyfinItem} newItemDetail - Item Object to be updated to
     * @returns 
     */
    static async updateItem(itemId, newItemDetail) {
        return fetch(`${process.env.JELLYFIN_SERVER}/Items/${itemId}?api_key=${process.env.JELLYFIN_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newItemDetail),
        })
            .then(fetchErrorHandler);
    }
};