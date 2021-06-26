// require all modules on the path and with the pattern defined
const req = require['context']('./', true, /.tsx$/);

const modules = req
    .keys()
    .map(req)
    .filter((module) => 'default' in module)
    .map((module) => module.default);

export default modules;
