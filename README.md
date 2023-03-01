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

Then, build and run the compiled Typescript

```bash
pnpm build
node ./dist/index.js
```

You might want write a cron job to execute the script daily

# License

[GNU General Public License v3.0 © (gpl-3.0)](https://github.com/KosmoMoustache/epic_games_free_games/blob/main/LICENSE)
