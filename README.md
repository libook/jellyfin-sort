# Jellyfin Sort

[中文](./README.zh.md)

Make media in multiple languages uniformly sorted in the order of the Latin alphabet (ABCD ......) in Jellyfin.

## Index

- [Index](#index)
- [Features](#features)
- [Usage](#usage)
    - [Docker](#docker)
    - [Node.js](#nodejs)
    - [Parameter list](#parameter-list)
- [Supported languages](#supported-languages)
- [How it works](#how-it-works)
- [How to contribute](#how-to-contribute)

## Features

- Automatically complete the sorting adjustment when adding new media (realized by Webhook).
- Supports checking the sorting automatically at schedule.
- Support ignoring media whose is manually sorted by user.
- Support to set the size of each batch when batch processing.

## Usage

**Note** : This tool will modify the "Short title" of media metadata, if you want to keep the manually modified short title, please use `JELLYFIN_SORT_EMPTY_ONLY` environment variable to enable the ignore feature.

First, you need to prepare the following information:

- Jellyfin URL: your Jellyfin access address, e.g. "http://192.168.0.2:8096"
- Jellyfin API Key: created by clicking the `+` button in the Jellyfin main menu => `Dashboard` in `Administration` => `API Keys` in `Advanced` => click the `+` button. For example "cd1fedb049404c17af7b6026badf50a5"

When you are ready, you can refer to the following ways to use it.

### Docker

*To learn how to install and use Docker, please refer to the [Docker Official Documentation](https://docs.docker.com/get-docker/).*

A one-time run:
```shell
docker run --rm \
    --name=Jellyfin-Sort \
    --env=JELLYFIN_SERVER={Jellyfin URL} \
    --env=JELLYFIN_KEY={Jellyfin API Key} \
    --restart=unless-stopped \
    libook/jellyfin-sort:latest
```
Replace {Jellyfin URL}, {Jellyfin API Key} with your own information.
See [Parameter list](#parameter-list) below for more parameters.

To add environment variables when creating Docker containers, simply add `--env=` in front of the new environment variable and add `={value}` after the environment variable, such as "--env=JELLYFIN_SORT_EMPTY_ONLY=true".

Docker image can be found in [here](https://hub.docker.com/r/libook/jellyfin-sort).

### Node.js

*To learn how to install and use Node.js, please refer to the [Node.js Official Documentation](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs).*

Clone or download code from GitHub:
```shell
git clone https://github.com/libook/jellyfin-sort.git
```

Enter project directory, install dependencies:
```shell
npm ci
```

A one-time run:
```shell
JELLYFIN_SERVER={Jellyfin URL} \
JELLYFIN_KEY={Jellyfin API Key} \
node ./src/daemon.js
```
Replace {Jellyfin URL}, {Jellyfin API Key} with your own information.
See [Parameter list](#parameter-list) below for more parameters.

To add an environment variable when running a Node.js program, simply add the environment variable before the `node` command and add `={value}` after the environment variable, e.g. "JELLYFIN_SORT_EMPTY_ONLY=true".


### Parameter list

All parameters are environment variables.

- `JELLYFIN_KEY`
    - Required
    - Jellyfin API Key，created by clicking the `+` button in the Jellyfin main menu => `Dashboard` in `Administration` => `API Keys` in `Advanced` => click the `+` button. For example "cd1fedb049404c17af7b6026badf50a5".
- `JELLYFIN_SERVER`
    - Required
    - Your Jellyfin access address, e.g. "http://192.168.0.2:8096".
- `JELLYFIN_SORT_BATCH_LIMIT`
    - Optional
    - Limiting the number of batches for batch processing.
    - Not used or left blank will default to the number of CPU cores used.
- `JELLYFIN_SORT_CRON`
    - Optional
    - Timed schedule, using [Cron format](https://en.wikipedia.org/wiki/Cron#Cron_expression).
    - Multiple schedules can be split using `,`. e.g. "42 * * * *,18 * * * *".
    - Not used or left blank will default to executing the process once immediately.
- `JELLYFIN_SORT_EMPTY_ONLY`
    - Optional
    - Ignore media that already has a "Short Title" set. If you wish to manually set the Short Title for certain media, setting this variable to any value will allow Jellyfin Sort to skip any media that already has a Short Title.
    - Not used or left blank will default to processing all media. Note that setting the value to `false`, `0`, etc. is also equivalent to turning it on since it is only turned off if not used or left blank.
- `JELLYFIN_SORT_HOOK_PORT`
    - Optional
    - Set up a listening port for receiving webhooks from Jellyfin. you need to install the [Jellyfin Webhook Plugin](https://github.com/jellyfin/jellyfin-plugin-webhook),  in the Jellyfin main menu=>`Dashboard` in `Administration` => `Plugins` in `Advanced`, install the weebhook plugin. Click `Webhooks`=>`Add Generic Destination`, type in the URL of Jellyfin Sort, check `Item Added` and click `Save`. When a new media is added to Jellyfin, a notification will automatically be sent to Jellyfin Sort, and Jellyfin Sort will process the media directly.
    - Note that if you are using Jellyfin Sort in Docker, setting this listening port requires that you also add `-p host port:container port` when creating the Docker container.
    - Not using or left blank will default to not turning on Webhooks.

If the program neither needs to wait to receive the Webhook nor has a scheduled task to wait for, it will exit automatically when processing is complete.

Annex: Cron format quick reference
```
┌───────────── minute (0–59)
│ ┌───────────── hour (0–23)
│ │ ┌───────────── day of the month (1–31)
│ │ │ ┌───────────── month (1–12)
│ │ │ │ ┌───────────── day of the week (0–6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```


## Supported Languages

- Support via [@sindresorhus/transliterate](https://github.com/sindresorhus/transliterate)
    - Arabic
    - Armenian
    - Czech
    - Danish
    - Dhivehi
    - Georgian
    - German (umlauts)
    - Greek
    - Hungarian
    - Latin
    - Latvian
    - Lithuanian
    - Macedonian
    - Pashto
    - Persian
    - Polish
    - Romanian
    - Russian
    - Serbian
    - Slovak
    - Swedish
    - Turkish
    - Ukrainian
    - Urdu
    - Vietnamese
- Support via [kuroshiro](https://github.com/hexenq/kuroshiro)
    - Japanese
- Support via [pinyin-pro](https://github.com/zh-lx/pinyin-pro)
    - Chinese(Han)

## How it works

By default, Jellyfin uses the media title to sort the list, if the user sets "Short title", the short title of the media will be used as the basis for sorting.

Many languages have a Latinized (romanized) scheme. Alphabetic writing systems such as French, German, Russian, etc. can be roughly converted by mapping to the Latin alphabet. Chinese, Japanese, and other hieroglyphic writing systems can be roughly transformed into Latin alphabet representations by means of a phonetic system. It should be noted that, due to the complexity and non-strictness of natural languages, such transformations may not be completely accurate, but they are usually sufficient for sorting.

## How to contribute

This project uses GPL-3.0 license, anyone can contribute code as Pull Request.

This project uses ESLint and configured rules, please make sure the code conforms to the rules, if you have questions about the rules, you can submit an Issue to discuss.

This project uses the [convention commit](https://www.conventionalcommits.org) style, please make sure that the commit message conforms to the style specification when you commit the code.
