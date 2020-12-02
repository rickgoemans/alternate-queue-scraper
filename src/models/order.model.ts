export class Order {
    type: OrderType;
    orderNr: number;
    zipcode: string;
    slackWebhookUrl?: string;
    slackChannel?: string;
    discordUserId?: string;
    queueNr?: number;

    constructor(type: OrderType, orderNr: number, zipcode: string, slackWebhookUrl?: string, slackChannel?: string, discordUserId?: string) {
        this.type = type;
        this.orderNr = orderNr;
        this.zipcode = zipcode;
        this.slackWebhookUrl = slackWebhookUrl;
        this.slackChannel = slackChannel;
        this.discordUserId = discordUserId;
    }
}

export type OrderType = 'AMD CPU' | 'AMD GPU' | 'Nvidia GPU';

