import { FileDataStore } from '@apidevtools/swagger-express-middleware';
import KnexDataStore from './database/knex-data-store';
import path from 'path';
import conf from '../credentials.json'
const swaggerFile = path.join(process.cwd(), '/data/public/swagger.yaml');
export const FileDatabase = new FileDataStore(process.cwd() + '/data');
export const DatabaseIsFile = (typeof conf['client'] == "undefined");
export default DatabaseIsFile ? FileDatabase : new KnexDataStore(conf, swaggerFile);
