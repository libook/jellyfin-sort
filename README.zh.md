<p align="center">
    <img src="icon.png" width="128" title="Jellyfin Sort icon">
</p>

# Jellyfin Sort

[English](./README.md)

让Jellyfin中多种语言的媒体统一按照拉丁字母表（ABCD……）的顺序进行排列。

## 目录

- [目录](#目录)
- [特性](#特性)
- [使用方法](#使用方法)
    - [Docker](#docker)
    - [Node.js](#nodejs)
    - [参数列表](#参数列表)
- [支持的语言](#支持的语言)
- [原理](#原理)
- [贡献代码](#贡献代码)

## 特性

- 在添加新媒体时自动完成排序调整（通过Webhook实现）。
- 支持定时检查排序，并自动调整。
- 支持忽略用户手动设置顺序的媒体。
- 支持设置批量处理时每个批次的大小。

## 使用方法

**注意** ：此工具会修改媒体元数据的“短标题”，如果希望保留手动修改的短标题，请使用`JELLYFIN_SORT_EMPTY_ONLY`环境变量，开启忽略功能。

首先，你需要准备以下信息：

- Jellyfin URL：你的Jellyfin的访问地址，如"http://192.168.0.2:8096"
- Jellyfin API 密钥：在Jellyfin主菜单=>`管理`中的`控制台`=>`高级`中的`API密钥`=>点击`+`按钮创建。如"cd1fedb049404c17af7b6026badf50a5"

准备好了就可以参考以下方式使用。

### Docker

*想要了解Docker如何安装和使用，请参考[Docker官方文档(英文)](https://docs.docker.com/get-docker/)。*

一次性运行：
```shell
docker run --rm \
    --name=Jellyfin-Sort \
    --env=JELLYFIN_SERVER={Jellyfin URL} \
    --env=JELLYFIN_KEY={Jellyfin API 密钥} \
    --restart=unless-stopped \
    libook/jellyfin-sort:latest
```
将{Jellyfin URL}、{Jellyfin API 密钥}替换为你自己的信息。
更多参数请见下方[参数列表](#参数列表)。

使用指令创建Docker容器的时候，添加环境变量，只需要在新的环境变量前面添加`--env=`，并在环境变量后添加`={值}`，如"--env=JELLYFIN_SORT_EMPTY_ONLY=true"。

Docker 镜像可以在[这里](https://hub.docker.com/r/libook/jellyfin-sort)找到。

### Node.js

*想要了解Node.js如何安装和使用，请参考[Node.js官方文档(英文)](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs)。*

从GitHub克隆或下载代码：
```shell
git clone https://github.com/libook/jellyfin-sort.git
```

进入代码目录，安装依赖：
```shell
npm ci
```

一次性运行：
```shell
JELLYFIN_SERVER={Jellyfin URL} \
JELLYFIN_KEY={Jellyfin API 密钥} \
node ./src/daemon.js
```
将{Jellyfin URL}、{Jellyfin API 密钥}替换为你自己的信息。
更多参数请见下方[参数列表](#参数列表)。

使用指令运行Node.js程序的时候，添加环境变量，只需要在`node`指令之前添加环境变量，并在环境变量后添加`={值}`，如"JELLYFIN_SORT_EMPTY_ONLY=true"。


### 参数列表

所有参数均为环境变量。

- `JELLYFIN_KEY`
    - 必要
    - Jellyfin API 密钥，在Jellyfin主菜单=>`管理`中的`控制台`=>`高级`中的`API密钥`=>点击`+`按钮创建。如"cd1fedb049404c17af7b6026badf50a5"。
- `JELLYFIN_SERVER`
    - 必要
    - 你的Jellyfin的访问地址，如"http://192.168.0.2:8096"。
- `JELLYFIN_SORT_BATCH_LIMIT`
    - 可选
    - 限制每一批次处理的数量。
    - 不使用或留空则默认使用CPU核心数。
- `JELLYFIN_SORT_CRON`
    - 可选
    - 定时计划，使用[Cron格式](https://zh.wikipedia.org/wiki/Cron#%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F)。
    - 多个计划可以使用`,`分割，如："42 * * * *,18 * * * *"。
    - 不使用或留空则默认立即执行处理过程一次。
- `JELLYFIN_SORT_EMPTY_ONLY`
    - 可选
    - 忽略已经设置过“短标题”的媒体。如果你希望为某些媒体手动设置“短标题”，将这个变量设为任何值则可以让Jellyfin Sort跳过任何已经有“短标题”的媒体。
    - 不使用或留空则默认对所有媒体进行处理。注意，由于仅在不使用或留空的情况下关闭，所以将值设置为`false`、`0`等也等同于开启。
- `JELLYFIN_SORT_HOOK_PORT`
    - 可选
    - 设置一个监听端口，用于接收来自Jellyfin的Webhook。需要安装[Jellyfin Webhook 插件](https://github.com/jellyfin/jellyfin-plugin-webhook)，在Jellyfin主菜单=>`管理`中的`控制台`=>`高级`中的`插件`，安装weebhook插件，点击`Webhooks`=>`Add Generic Destination`，输入Jellyfin Sort的URL，勾选`Item Added`，点击`Save`即可。当Jellyfin中添加新媒体会自动向Jellyfin Sort发送一个通知，Jellyfin Sort会直接处理这一个媒体。
    - 注意，如果是在Docker中使用Jellyfin Sort，设置这个监听端口需要同时在创建Docker容器的时候添加`-p 宿主机端口:容器端口`。
    - 不使用或留空则默认不开启Webhook。

如果程序既不需要等待接收Webhook，也没有计划任务可以等待，则会在处理完成后自动退出。

附：Cron格式速查表
```
┌──分钟（0 - 59）
│ ┌──小时（0 - 23）
│ │ ┌──日（1 - 31）
│ │ │ ┌─月（1 - 12）
│ │ │ │ ┌─星期（0 - 6，表示从周日到周六）
│ │ │ │ │
* * * * *
```


## 支持的语言

- 通过[@sindresorhus/transliterate](https://github.com/sindresorhus/transliterate)支持
    - 阿拉伯文
    - 亚美尼亚文
    - 捷克文
    - 丹麦文
    - 迪维希文
    - 格鲁吉亚文
    - 德文（有变音符号）
    - 希腊文
    - 匈牙利文
    - 拉丁文
    - 拉脱维亚文
    - 立陶宛文
    - 马其顿文
    - 普什图文
    - 波斯文
    - 波兰文
    - 罗马尼亚文
    - 俄文
    - 塞尔维亚文
    - 斯洛伐克文
    - 瑞典文
    - 土耳其文
    - 乌克兰文
    - 乌尔都文
    - 越南文
- 通过[kuroshiro](https://github.com/hexenq/kuroshiro)支持
    - 日文
- 通过[pinyin-pro](https://github.com/zh-lx/pinyin-pro)支持
    - 中文

## 原理

Jellyfin默认使用媒体标题进行排序展示，如果用户设置了“短标题”，则会使用媒体的短标题作为排序依据。

很多语言都有拉丁化（罗马化）的方案。法语、德语、俄语等使用字母表的文字系统可以通过与拉丁字母表的映射关系来进行粗略转化。中文、日文等象形文字系统可以通过注音系统来粗略转化为拉丁字母表示。需要说明的是，受限于自然语言的复杂性和非严格性，这种转化可能不完全准确，但通常用于排序足够。

## 贡献代码

本项目使用GPL-3.0许可证，任何人可以以Pull Request的形式贡献代码。

本项目使用了ESLint并配置了规则，请确保代码符合规则要求，如果对规则有疑问可以提Issue商讨。

本项目使用[约定式提交](https://www.conventionalcommits.org/zh-hans)风格，请在提交代码的时候确保提交信息符合风格规范。
