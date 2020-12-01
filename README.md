# Alternate scraper

This is a web scraper to automatically check the queue status of your [Alternate](https://alternate.nl) order(s) for various new products.

# Table of contents

[1.0 Installation](#10-installation)  
[1.1 Install dependencies](#11-install-dependencies)  
[1.2 Compile](#12-compile)  
[1.3 Setup environment](#13-setup-environment)  
[2.0 Execution](#20-execution)  
[3.0 Test](#30-test)

# 1.0 Installation

Follow these steps to install the project.

## 1.1 Install dependencies

Install the dependencies by running:

```bash
npm install
```

## 1.2 Compile

Compile the [TypeScript](https://www.typescriptlang.org) code to [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

```bash
npm run compile
```

## 1.3 Setup orders

If you wish to use Discord notifications, create a `.env` file with your matching details using `.env.example` as reference.

Create a `data.json` file with your matching details using `data.json.example` as reference.

# 2.0 Execution

Execute the program by running

```bash
npm run run
```

> If you get errors related to Puppeteer on UNIX not being able to find some shared libraries, check [chrome-headless-doesnt-launch-on-unix](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix) and install the missing libraries for your UNIX distribution.

# 3.0 Test

Run the tests by executing

```bash
npm test
```
