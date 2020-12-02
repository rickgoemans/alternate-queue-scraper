# Alternate scraper

This is a web scraper to automatically check the queue status of your [Alternate](https://alternate.nl) order(s) for various new products.

# Table of contents

[1.0 Installation](#10-installation)  
[1.1 Install software](#11-install-software)   
[1.2 Install dependencies](#12-install-dependencies)  
[1.3 Compile](#13-compile)  
[1.4 Setup environment](#14-setup-environment)  
[1.5 Setup orders](#15-setup-orders)  
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

If you wish to use Discord notifications, create a `.env` file with your matching details using `.env.example` as reference.

Create a `data.json` file with your matching details using `data.json.example` as reference.

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
