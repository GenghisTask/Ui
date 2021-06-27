import { TopToolbar, CreateButton, Button } from 'react-admin';
import { useSwaggerApi } from './useSwaggerApi';
import handleClickGenerator, {
    useCrontabActionLoadingState
} from './CrontabAction/handleClickGenerator';

const CrontabAction = (props: { basePath: string; resource: string }) => {
    const { basePath, resource } = props;
    const api = useSwaggerApi();
    const loading = useCrontabActionLoadingState((state) => state.loading);
    const saveAction = handleClickGenerator('save');
    const isListing = window.location.toString().match(/s$/);
    return (
        <TopToolbar>
            {isListing &&
                api.paths['/api/swagger/' + resource.toLowerCase()] &&
                api.paths['/api/swagger/' + resource.toLowerCase()].post && (
                    <CreateButton basePath={basePath} />
                )}
            {isListing && resource == 'jobs' && (
                <Button
                    label="Save to crontab"
                    onClick={saveAction}
                    disabled={loading}
                />
            )}
        </TopToolbar>
    );
};
export default CrontabAction;
