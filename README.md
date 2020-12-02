# Alternate scraper

This is a web scraper to automatically check the queue status of your [Alternate](https://alternate.nl) order(s) for various new products.

# Table of contents

[1.0 Installation](#10-installation)  
[1.1 Install software](#11-install-software)   
[1.2 Install dependencies](#12-install-dependencies)  
[1.3 Compile](#13-compile)  
[1.4 Setup environment](#14-setup-environment)  
[1.5 Setup orders](#15-setup-orders)  
[1.6 Notifications](#16-notifications)  
[2.0 Execution](#20-execution)  
[3.0 Test](#30-test)

# 1.0 Installation

This project requires [Node.js](https://nodejs.org) and [TypeScript](https://www.typescriptlang.org) to be installed on your machine. 

## 1.1 Install software
Choose your platform and follow the steps.

### 1.1.1 Mac OS

**Homebrew**

[Homebrew](https://brew.sh) is a package manager. If you have it already, you can skip this step. Install it by pasting this in the terminal:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After the command is done, you can check if it's installed successfully by running this in the terminal:

```bash
brew
```

**Node.js**  

Next is [Node.js](https://nodejs.org), a platform built on V8 to build network applications. If you have it already, you can skip this step. Install it by pasting this in the terminal:

```bash
brew install node
```

After the command is done, you can check if it's installed successfully by running this in the terminal:

```bash
node -v
```

**Typescript** 

Next is [TypeScript](https://www.typescriptlang.org), an extension to Javascript by adding types. If you have it already, you can skip this step. Install it (globally) by pasting this in the terminal:

```bash
npm install -g typescript
```

After the command is done, you can check if it's installed successfully by running this in the terminal:

```bash
npx tsc
```

### 1.1.2 Windows

**Node.js**  

First install [Node.js](https://nodejs.org), a platform built on V8 to build network applications. If you have it already, you can skip this step. Install it by downloading it at the [Node.js website](https://nodejs.org).

After the installation is complete, you can check if it's installed successfully by running this in the terminal:

```bash
node -v
```

**Typescript** 

Next is [TypeScript](https://www.typescriptlang.org), an extension to Javascript by adding types. If you have it already, you can skip this step. Install it (globally) by pasting this in the terminal:

```bash
npm install -g typescript
```

After the command is done, you can check if it's installed successfully by running this in the terminal:

```bash
npx tsc
```

### 1.1.3 Ubuntu

**Node.js**  

First install [Node.js](https://nodejs.org), a platform built on V8 to build network applications. If you have it already, you can skip this step. Install it by pasting this in the terminal:

```bash
sudo apt install node
```

After the command is done, you can check if it's installed successfully by running this in the terminal:

```bash
node -v
```

**Typescript** 

Next is [TypeScript](https://www.typescriptlang.org), an extension to Javascript by adding types. If you have it already, you can skip this step. Install it (globally) by pasting this in the terminal:

```bash
npm install -g typescript
```

After the command is done, you can check if it's installed successfully by running this in the terminal:

```bash
npx tsc
```

## 1.2 Install dependencies

Install the project's dependencies by pasting this in the terminal:

```bash
npm install
```

## 1.4 Compile

Compile the [TypeScript](https://www.typescriptlang.org) code to [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) by pasting this in the terminal:

```bash
npm run compile
```

## 1.5 Setup orders

Create a `data.json` file with your matching details using `data.json.example` as reference.

## 1.6 Notifications

At the moment this project supports two type of notifications:

- [Slack](https://slack.com)
- [Discord](https://discord.com)

**Slack**

In order to use Slack, simply add your your `webhook url` and `channel` to the orders in [step 1.5](#15-setup-orders) and you're good to go.

**Discord**

If you wish to use Discord notifications, you should first create an application by going to the [Discord developer portal](https://discord.com/developers/applications), logging in, and click `New application`. Name it however you want and give it an icon (you can take `assets/images/alternate_scraper_icon.png`).

![Alternate scraper logo](./assets/images/alternate_scraper_icon.png)

The next step is creating a bot by clicking `Bot` on the left. Give the bot a name and icon just like before.

> Make sure you `public bot` is **TURNED ON** and `Requires Oauth2 code grant` is **TURNED OFF**. And you don't have to select any permissions because it will send direct messages.

> In order for the bot to be able to direct message someone, the bot and the user must **AT LEAST** share one server.

Invite the bot by click `Oauth2` on the left. Make sure you click the enable `bot` in the `scopes` section, once again, you don't have to select any permissions. Next, copy the shown URL and paste it in your in the URL bar of your browser.

 Next, create a `.env` file using `.env.example` as reference and replace `DISCORD_TOKEN='...'` with your own bot token.

The last step is adding a Discord user's ID. You can retrieve a user's ID by going to the Discord application (or browser), open the settings, go to `Appearance` and make sure to enable `developer mode`. Next right click on a user and click `Copy ID`. 
Add the ID to the orders in [step 1.5](#15-setup-orders) and you're good to go.

# 2.0 Execution

Execute the program by running

```bash
npm run run
```

> If you get errors related to Puppeteer on UNIX not being able to find some shared libraries, check [chrome-headless-doesnt-launch-on-unix](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix) and install the missing libraries for your UNIX distribution.

# 3.0 Test

Run the tests (none included at the moment) by pasting this in the terminal:

```bash
npm test
```
