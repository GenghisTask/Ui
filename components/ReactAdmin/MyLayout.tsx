import * as React from 'react';
import { Layout, AppBar, Button } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import handleClickGenerator, {
    useCrontabActionLoadingState
} from './CrontabAction/handleClickGenerator';
import { Tooltip, IconButton } from '@material-ui/core';

const MyUserMenu = (props) => {
    const isListing = window.location.toString().match(/s$/);
    const loading = useCrontabActionLoadingState((state) => state.loading);
    const router = useRouter();
    const checkoutAction = handleClickGenerator('checkout');
    const pushAction = handleClickGenerator('push');
    const pullAction = handleClickGenerator('pull');
    return (
        <>
            {isListing && (
                <Tooltip title={'Rollback'} enterDelay={500}>
                    <IconButton
                        color="inherit"
                        onClick={() => checkoutAction()}
                        disabled={loading}
                    >
                        <small>Checkout</small>
                    </IconButton>
                </Tooltip>
            )}
            {isListing && (
                <Tooltip title={'Backup'} enterDelay={500}>
                    <IconButton
                        color="inherit"
                        onClick={() => pushAction()}
                        disabled={loading}
                    >
                        <small>Push</small>
                    </IconButton>
                </Tooltip>
            )}
            {isListing && (
                <Tooltip title={'Update'} enterDelay={500}>
                    <IconButton
                        color="inherit"
                        onClick={() => pullAction()}
                        disabled={loading}
                    >
                        <small>Pull</small>
                    </IconButton>
                </Tooltip>
            )}
            {isListing && (
                <Tooltip title={'Edit the git repository'} enterDelay={500}>
                    <IconButton
                        color="inherit"
                        onClick={() => router.push('api/script/edit')}
                        disabled={loading}
                    >
                        <small>Git</small>
                    </IconButton>
                </Tooltip>
            )}
        </>
    );
};
const MyAppBar = (props) => (
    <AppBar {...props}>
        <MyUserMenu />
    </AppBar>
);

const MyLayout = (props) => <Layout {...props} appBar={MyAppBar} />;

export default MyLayout;
