import { TopToolbar, CreateButton, Button } from 'react-admin';
import { useSwaggerApi } from './useSwaggerApi';
import handleClickGenerator, {
    useCrontabActionLoadingState
} from './CrontabAction/handleClickGenerator';
import { useRouter } from 'next/router';

const CrontabAction = (props: { basePath: string; resource: string }) => {
    const { basePath, resource } = props;
    const api = useSwaggerApi();
    const router = useRouter();
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
            {resource.toLowerCase() == 'environments' && (
                <Button label="Manage" onClick={() => router.push('api/script/edit')} />
            )}
            {isListing && resource == 'jobs' && (
                <Button label="Save to crontab" onClick={saveAction} disabled={loading} />
            )}
        </TopToolbar>
    );
};
export default CrontabAction;
