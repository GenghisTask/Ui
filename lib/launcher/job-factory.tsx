import { FileDataStore, Resource } from '@apidevtools/swagger-express-middleware';
import util from 'util';
import Job from './job';
import Environment from './environment';

const myDB = new FileDataStore(process.cwd() + '/data');

class JobFactory {
    static async load(id): Promise<Resource> {
        const get = util.promisify(myDB.get).bind(myDB);
        const getCollection = util.promisify(myDB.getCollection).bind(myDB);

        const job = await get(`/api/swagger/jobs/${id}`);
        if (!job) {
            throw `Unable to find ${id}`;
        }
        if (job.data.project_id) {
            job.project = (
                await get(`/api/swagger/projects/${job.data.project_id}`)
            ).data;
        }
        if (job.data.environment_id) {
            job.environment = (await Environment.getCollection())
                .filter((e) => e.id == job.data.environment_id)
                .pop();
        } else {
            job.environment = {
                remote: ''
            };
        }
        job.secret = (await getCollection(`/api/swagger/secrets`)).reduce((buf, rsx) => {
            buf[rsx.data.key] = rsx.data.value;
            return buf;
        }, {});
        return Object.assign(new Job(), job);
    }

    static async save(job): Promise<Resource> {
        const remove = util.promisify(myDB.delete).bind(myDB);
        const save = util.promisify(myDB.save).bind(myDB);
        const resource = Object.assign(new Resource(), job);
        await remove(resource);
        await save(resource);
    }
}

export default JobFactory;
