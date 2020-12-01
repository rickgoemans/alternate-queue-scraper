import { User } from 'discord.js';
import puppeteer, { Page } from 'puppeteer';
import { Order } from './models/order.model';

const FILE = 'data.json';

export class Application {
    protected fs: any;
    protected data: {
        orders: Order[],
        lastRun: string,
    };

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
    }

    public async run (): Promise<void> {
        // Open browser
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        for(let order of this.data.orders) {
            let queueNr;

            // Get queueNr
            switch (order.type) {
                case 'AMD CPU':
                    queueNr = await this.checkAmdCpuOrderQueueNr(page, order.orderNr, order.zipcode);
                break;
                case 'AMD GPU':
                    queueNr = await this.checkAmdGpuOrderQueueNr(page, order.orderNr, order.zipcode);
                break;
                case 'Nvidia GPU':
                    queueNr = await this.checkNvidiaGpuOrderQueueNr(page, order.orderNr, order.zipcode);
                break;
                default:
                    return;
            }

            console.log(`Order ${order.orderNr} (${order.type}) | Queue nr: ${queueNr}`);

            if(order.queueNr === undefined || order.queueNr != queueNr) {
                order.queueNr = queueNr;

                // Send notifications
                if(order.slackWebhookUrl && order.slackChannel) {
                    this.notifyOnSlack(order);
                }

                if(process.env.DISCORD_TOKEN && order.discordUserId) {
                    this.notifyOnDiscord(order);
                }
            }
        }

        // Store last run
        let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        let localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
        this.data.lastRun = localISOTime;

        console.log('Last run: ', localISOTime);

        // Store queue nrs in db file
        this.fs.writeFileSync(FILE, JSON.stringify(this.data));

        process.exit();
    }

    protected async checkNvidiaGpuOrderQueueNr(page: Page, orderNr: number, zipcode: string): Promise<number> {
        console.log('Checking Nvidia GPU order queue');
        console.log('Order nr:', orderNr);
        console.log('Zipcode: ', zipcode);

        return this.checkQueueNr(page, 'https://include.alternate.nl/3080', 'http://include.alternate.nl/3080/check.php', orderNr, zipcode);
    }

    protected async checkAmdCpuOrderQueueNr(page: Page, orderNr: number, zipcode: string): Promise<number> {
        console.log('Checking AMD CPU order queue');
        console.log('Order nr:', orderNr);
        console.log('Zipcode: ', zipcode);

        return await this.checkQueueNr(page, 'https://include.alternate.nl/ryzen5000', 'http://include.alternate.nl/ryzen5000/check.php', orderNr, zipcode);
    }

    protected async checkAmdGpuOrderQueueNr(page: Page, orderNr: number, zipcode: string): Promise<number> {
        console.log('Checking AMD GPU order queue');
        console.log('Order nr:', orderNr);
        console.log('Zipcode: ', zipcode);

        return this.checkQueueNr(page, 'https://include.alternate.nl/rx6x00', 'https://include.alternate.nl/rx6x00/check.php', orderNr, zipcode);
    }

    protected async checkQueueNr(page: Page, url: string, responseUrl: string, orderNr: number, zipcode: string): Promise<number> {
        return new Promise(async (resolve, reject) => {
            // Open page
            await page.goto(url);

            // Wait for input
            await page.waitForSelector('#ordernummer');

            // Enter order nr
            await page.focus('#ordernummer');
            await page.keyboard.type(orderNr.toString());

            // Enter zipcoe
            await page.focus('#postcode');
            await page.keyboard.type(zipcode);

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

    notifyOnSlack(order: Order): void {
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

    notifyOnDiscord(order: Order): void {
        if(process.env.DISCORD_TOKEN && order.discordUserId && order.queueNr) {
            console.log('Should log to discord: ', order.queueNr);

            const Discord = require('discord.js');
            const client = new Discord.Client();
            
            client.on('ready', async () => {
                let user: User = await client.users.fetch(order.discordUserId);
                await user.send(`Order ${order.orderNr} (${order.type}) | Queue nr: ${order.queueNr}`);
                
                client.destroy();
            });
            
            client.login(process.env.DISCORD_TOKEN);
        }
    }
}