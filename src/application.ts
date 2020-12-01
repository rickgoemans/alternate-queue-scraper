import { User } from 'discord.js';
import puppeteer, { Page } from 'puppeteer';
import { Order } from './models/order.model';

const FILE = 'data.json';

export class Application {
    protected data: {
        orders: Order[],
        lastRun: string,
    };
    protected discordClient: any;
    protected fs: any;
    protected discordOrdersToNotify: Order[] = [];
    protected slackOrdersToNotify: Order[] = [];

    constructor() {
        this.fs = require('fs');

        // Create db file if it does not exist
        if(!this.fs.existsSync(FILE)) {
            const obj: any = {
                lastRun: 'INIT',
                orders: [],
            };

            this.fs.writeFileSync(FILE, JSON.stringify(obj));
        }

        // Load db file
        this.data = JSON.parse(this.fs.readFileSync(FILE));

        // Setup Discord
        if(process.env.DISCORD_TOKEN) {
            const Discord = require('discord.js');
            this.discordClient = new Discord.Client();
        }
    }

    public async run (): Promise<void> {
        // Open browser
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        for(let order of this.data.orders) {
            let queueNr;
            try {
                // Get queueNr
                switch (order.type) {
                    case 'AMD CPU':
                        queueNr = await this.checkAmdCpuOrderQueueNr(page, order);
                    break;
                    case 'AMD GPU':
                        queueNr = await this.checkAmdGpuOrderQueueNr(page, order);
                    break;
                    case 'Nvidia GPU':
                        queueNr = await this.checkNvidiaGpuOrderQueueNr(page, order);
                    break;
                    default:
                        return;
                }
            } catch (error) {
                console.error('Error:', error);

                return;
            }

            console.log(`Order ${order.orderNr} (${order.type}) | Queue nr: ${queueNr}`);

            if(isNaN(queueNr)) {
                return;
            }

            if(order.queueNr === undefined || order.queueNr !== queueNr) {
                order.queueNr = queueNr;

                // Store notifications
                if(order.slackWebhookUrl && order.slackChannel) {
                    this.slackOrdersToNotify.push(order);
                }

                if(order.discordUserId) {
                    this.discordOrdersToNotify.push(order);
                }
            }
        }

        if(this.slackOrdersToNotify.length) {
            this.notifyOnSlack(this.slackOrdersToNotify);
        }

        if(this.discordOrdersToNotify.length) {
            this.notifyOnDiscord(this.discordOrdersToNotify);
        }

        // Store last run
        const timezoneOffset = (new Date()).getTimezoneOffset() * 60000; // offset in milliseconds
        const localISOTime = (new Date(Date.now() - timezoneOffset)).toISOString().slice(0, -1);
        this.data.lastRun = localISOTime;

        console.log(`Last run: ${localISOTime}`);

        // Store data back in db file
        this.fs.writeFileSync(FILE, JSON.stringify(this.data));

        process.exit();
    }

    protected async checkNvidiaGpuOrderQueueNr(page: Page, order: Order): Promise<number> {
        return await this.checkQueueNr(page, 'https://include.alternate.nl/3080', 'http://include.alternate.nl/3080/check.php', order);
    }

    protected async checkAmdCpuOrderQueueNr(page: Page, order: Order): Promise<number> {
        return await this.checkQueueNr(page, 'https://include.alternate.nl/ryzen5000', 'http://include.alternate.nl/ryzen5000/check.php', order);
    }

    protected async checkAmdGpuOrderQueueNr(page: Page, order: Order): Promise<number> {
        return await this.checkQueueNr(page, 'https://include.alternate.nl/rx6x00', 'https://include.alternate.nl/rx6x00/check.php', order);
    }

    protected async checkQueueNr(page: Page, url: string, responseUrl: string, order: Order): Promise<number> {
        console.log(`Checking ${order.type} order queue`);
        console.log(`Order nr: ${order.orderNr}`);
        console.log(`Zipcode: ${order.zipcode}`);

        return new Promise(async (resolve, reject) => {
            // Open page
            await page.goto(url);

            // Wait for input
            await page.waitForSelector('#ordernummer');

            // Enter order nr
            await page.focus('#ordernummer');
            await page.keyboard.type(order.orderNr.toString());

            // Enter zipcoe
            await page.focus('#postcode');
            await page.keyboard.type(order.zipcode);

            // Submit
            await page.click('button[type="submit"]');

            await page.on('response', response => {
                if(response.url() === responseUrl){
                    if(response.status() !== 200) {
                        reject('Invalid response');
                    }

                    response.json().then(async (data: any) => {
                        // Destructurize the object
                        const {a, b, c, d} = data;
                        let slots = [
                            a,
                            b,
                            c,
                            d,
                        ];
                        slots = slots.map(nr => nr - 2);
                        const queueNr = parseInt(slots.join(''), 10);

                        resolve(queueNr);
                    });
                }
            });
        });
    }

    notifyOnSlack(orders: Order[]): void {
        for(const order of this.data.orders) {
            if(order.slackWebhookUrl && order.slackChannel && order.queueNr) {
                const slack = require('slack-notify')(order.slackWebhookUrl);

                slack.note({
                    channel: order.slackChannel,
                    text: `Queue position update`,
                    fields: {
                        'Queue': order.type,
                        'Order': order.orderNr,
                        'Position': order.queueNr,
                    },
                });
            }
        }
    }

    notifyOnDiscord(orders: Order[]): void {
        if(this.discordClient !== undefined) {
            this.discordClient.on('ready', async () => {
                for(const order of orders) {
                    if(order.discordUserId && order.queueNr) {
                        try {
                            const user: User = await this.discordClient.users.fetch(order.discordUserId);
                            await user.send(`Order ${order.orderNr} (${order.type}) | Queue nr: ${order.queueNr}`);

                            console.log(`Message sent to ${user.username} (${user.id})`);
                        } catch (error) {
                            console.error('Discord message error: ', error);
                        }
                    }
                }
            });

            this.discordClient.login(process.env.DISCORD_TOKEN);
        }
    }
}