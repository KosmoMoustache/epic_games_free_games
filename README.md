# Epic Games free games tracker

Checks the Epic Games store api for free games and sends webhook when it finds one

Send a webhook similar to the following:
![Webhook](./webhook.png)

# Usage

First, clone the repo via git and install dependencies

```bash
git clone https://github.com/KosmoMoustache/epic_games_free_games.git
pnpm install
```

## Then, build and run the project

```bash
pnpm build
node ./dist/index.js
```

## Run using a cronjob

```crontab
0 17 * * * export NODE_ENV='production'; export PATH_TO='path/to/the/project'; cd $PATH_TO; (. ./cronjob.env.sh; ./script.sh >> $PATH_TO/logs/cron-`date +\%m-\%Y`.log; )
```

# License

[GNU General Public License v3.0 © (gpl-3.0)](https://github.com/KosmoMoustache/epic_games_free_games/blob/main/LICENSE)
