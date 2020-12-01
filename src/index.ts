import * as dotenv from 'dotenv';
import { Application } from './application';

dotenv.config();

const application = new Application();
application.run();
