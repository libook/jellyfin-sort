import { checkEnvironmentVariable } from './util.js';
import { cpus } from 'node:os';
import JellyfinService from './JellyfinService.js';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import Kuroshiro from 'kuroshiro';
import { pinyin } from 'pinyin-pro';
import pLimit from 'p-limit';
import transliterate from '@sindresorhus/transliterate';

// Checking environment variables.
checkEnvironmentVariable();

// Initializing.
const kuroshiro = new Kuroshiro.default();
await kuroshiro.init(new KuromojiAnalyzer());

// Main program.
(async () => {

    // Get administrator.
    const user = await (async () => {
        const userList = await JellyfinService.getUserList();
        for (const tryUser of userList) {
            if (tryUser.Policy.IsAdministrator === true) {
                console.log(`Got administrator ${tryUser.Name}`);
                return tryUser;
            }
        }

        // Didn't return means this error:
        throw new Error('No administrator user founded, please check your key.');
    })();

    /**
     * Modify sort name
     * @param {JellyfinItemBasic} item 
     * @return {boolean} - True for processed and false for skipped
     */
    const modifySortName = async (item) => {
        const itemDetail = await JellyfinService.getItemDetail(user.Id, item.Id);
        if (process.env.JELLYFIN_SORT_EMPTY_ONLY && itemDetail.ForcedSortName) {
            return false;
        } else {
            // Converting letter systems that have an explicit conversion relationship with the Latin alphabet.
            let forcedSortName = transliterate(itemDetail.Name);

            // Converting Japanese. Rough judgment that anything containing a kana is Japanese.
            // Avoiding judging the vast majority of Han characters as Japanese, so for the time being,
            // let the weight of a Han character judged as Chinese be higher than as Japanese.
            if (/[ぁ-んァ-ン]/.test(forcedSortName)) {
                // Converting Japanese to Romanji.
                forcedSortName = await kuroshiro.convert(forcedSortName, { "mode": "spaced", "to": "romaji" });
            } else {
                // Converting Chinese to Pinyin.
                forcedSortName = pinyin(forcedSortName, { "nonZh": "consecutive", "toneType": "none" });
            }
            // console.log(itemDetail.Name, '\t', forcedSortName);

            if (forcedSortName !== itemDetail.ForcedSortName) {
                // Modify item sort name.
                itemDetail.ForcedSortName = forcedSortName;
                await JellyfinService.updateItem(itemDetail.Id, itemDetail);
                // console.log(itemDetail.Name, '\t', forcedSortName);

                return true;
            } else {
                return false;
            }
        }
    };

    /**
     * Batch modify sort name
     * @param {Array<JellyfinItemBasic>} itemList 
     * @param {string} type - An item type string for logging
     */
    const modifySortNameBatch = async (itemList, type) => {
        let countProcessed = 0;
        let countSkipped = 0;
        const limit = pLimit(process.env.JELLYFIN_SORT_BATCH_LIMIT || cpus().length);
        const task = [];
        for (const item of itemList) {
            task.push(limit(async () => {
                const isProcessed = await modifySortName(item);
                isProcessed ? countProcessed++ : countSkipped++;
                console.log(`${type}\t${countProcessed + countSkipped}/${itemList.length}\t${isProcessed ? 'Modified' : 'Skipped'}`);
            }));
        }
        await Promise.all(task);
        console.log(`Compleate ${type}, total: ${itemList.length}\tprocessed: ${countProcessed}\tskipped: ${countSkipped}`);
    };

    const FIRST_ARGUMENT_INDEX = 2;
    const itemIdParameter = process.argv[FIRST_ARGUMENT_INDEX];
    if (itemIdParameter) {
        // Hook uses paramerter input item ID. Like:
        // node index.js <ItemId1,ItemId2>
        const itemIdList = itemIdParameter.split(',');
        await modifySortNameBatch(itemIdList.map(itemId => ({ "Id": itemId })), 'Hook');
    } else {
        // Get libraries
        const libraryList = await JellyfinService.getLibraryList(user.Id);
        console.log(`Got libraries ${libraryList.map(library => library.Name).join(', ')}`);

        // Get items from libraries
        for (const library of libraryList) {
            if (library.CollectionType === 'music') {
                // Albums
                {
                    const itemsResponse = await JellyfinService.getItemList(user.Id, library.Id, 'album');
                    await modifySortNameBatch(itemsResponse.Items, 'Albums');
                }
                // Artists
                {
                    const itemsResponse = await JellyfinService.getItemList(user.Id, library.Id, 'artist');
                    await modifySortNameBatch(itemsResponse.Items, 'Artists');
                }
            }

            {
                const itemsResponse = await JellyfinService.getItemList(user.Id, library.Id);
                await modifySortNameBatch(itemsResponse.Items, library.Name);
            }
        }
    }
})().catch(console.error);
