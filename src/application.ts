import { Client, User } from 'discord.js';
import puppeteer, { Page } from 'puppeteer';
import { Order } from './models/order.model';
import fs from 'fs';

const FILE = 'data.json';

export class Application {
    protected data: {
        orders: Order[],
        lastRun: string,
    };
    protected discordClient: Client = new Client();
    protected ordersToNotifyOnDiscord: Order[] = [];
    protected ordersToNotifyOnSlack: Order[] = [];

    constructor() {
        // Create db file if it does not exist
        if(!fs.existsSync(FILE)) {
            const obj: any = {
                lastRun: 'INIT',
                orders: [],
            };

            fs.writeFileSync(FILE, JSON.stringify(obj));
        }

        // Load db file
        this.data = JSON.parse(fs.readFileSync(FILE).toString());
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
                        continue;
                }
            } catch (error) {
                console.error('Error:', error);

                continue;
            }

            console.log(`Order ${order.orderNr} (${order.type}) | Queue nr: ${queueNr}`);

            if(isNaN(queueNr)) {
                continue;
            }

            if(order.queueNr === undefined || order.queueNr !== queueNr) {
                order.queueNr = queueNr;

                // Store notifications
                if(order.slackWebhookUrl && order.slackChannel) {
                    this.ordersToNotifyOnSlack.push(order);
                }

                if(order.discordUserId) {
                    this.ordersToNotifyOnDiscord.push(order);
                }
            }
        }

        if(this.ordersToNotifyOnSlack.length) {
            this.notifyOnSlack(this.ordersToNotifyOnSlack);
        }

        if(this.ordersToNotifyOnDiscord.length) {
            this.notifyOnDiscord(this.ordersToNotifyOnDiscord);
        }

        // Store last run
        const timezoneOffset = (new Date()).getTimezoneOffset() * 60000; // offset in milliseconds
        const localISOTime = (new Date(Date.now() - timezoneOffset)).toISOString().slice(0, -1);
        this.data.lastRun = localISOTime;

        console.log(`Last run: ${localISOTime}`);

        // Store data back in db file
        fs.writeFileSync(FILE, JSON.stringify(this.data));

        // Close app after some time to ensure (Discord) notifications are sent
        setTimeout(() => {
            console.log('Closing...');

            process.exit();
        }, 3000);
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
                        if(data.hasOwnProperty('a')
                            && data.hasOwnProperty('b')
                            && data.hasOwnProperty('c')
                            && data.hasOwnProperty('d')
                            ) {
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
                            }

                        if(data.hasOwnProperty('error')) {
                            if(data.error === 'Deze order is reeds verzonden. Het wachten is voorbij!') {
                                resolve(0);
                            }

                            reject(`Error: ${data.error}`);
                        };

                        reject('Error: unknown response from check');
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
                    username: 'Alternate Scraper',
                    icon_emoji: ':compouter:',
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
        if(process.env.DISCORD_TOKEN) {
            this.discordClient.on('ready', async () => {
                // Send messages
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

                // Cleanup
                this.discordClient.destroy();
            });

            // Login
            this.discordClient.login(process.env.DISCORD_TOKEN);
        }
    }
}