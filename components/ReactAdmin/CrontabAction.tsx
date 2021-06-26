import { TopToolbar, CreateButton, SaveButton, Link, Button, useNotify, useRedirect, useRefresh } from 'react-admin';
import { useCallback , useState } from 'react';
import { useSwaggerApi } from './useSwaggerApi';

const CrontabAction = (props) => {
    const { basePath, resource } = props;
    const notify = useNotify();
    const redirect = useRedirect();
    const refresh = useRefresh();
    const api = useSwaggerApi();
    const [loading, setLoading] = useState(false);
    const handleClickGenerator = (action) =>
        useCallback(() => {
            setLoading(true);
            fetch(window.location.protocol + 'api/swagger/crons/' + action, { method: 'POST' })
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(await response.text());
                    }
                    redirect('/jobs');
                    refresh();
                    notify('Success', 'info', {}, true);
                })
                .catch((error) => notify(`Error: ${error.message}`, 'warning'))
                .finally(() => setLoading(false));
        }, []);
    const handleSave = handleClickGenerator('save');
    const handleBackup = handleClickGenerator('backup');
    const handleRestore = handleClickGenerator('restore');

    const isListing = window.location.toString().match(/s$/);
    return (
        <TopToolbar>
            {isListing && api.paths['/api/swagger/' + resource.toLowerCase()] && api.paths['/api/swagger/' + resource.toLowerCase()].post && <CreateButton basePath={basePath} />}
            {isListing && resource == "jobs"  && <Button label="Save to crontab" onClick={handleSave} disabled={loading} />}
            {isListing && <Button label="Backup" onClick={handleBackup} disabled={loading} />}
            {isListing && <Button label="Restore" onClick={handleRestore} disabled={loading} />}
        </TopToolbar>
    );
};
export default CrontabAction;
