import { useNotify, useRedirect, useRefresh } from 'react-admin';
import { useCallback, useState } from 'react';
import create from 'zustand';

export const useCrontabActionLoadingState = create((set: any) => ({
    loading: false,
    setLoading: (value) => set(() => ({ loading: value }))
}));

const handleClickGenerator = (action) => {
    const notify = useNotify();
    const redirect = useRedirect();
    const refresh = useRefresh();
    const setLoading = useCrontabActionLoadingState((state) => state.setLoading);
    return useCallback(() => {
        setLoading(true);
        fetch(window.location.protocol + 'api/swagger/crons/' + action, {
            method: 'POST'
        })
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
};


export default handleClickGenerator;
