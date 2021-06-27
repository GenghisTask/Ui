import {
    Admin,
    Resource,
    Layout,
    CreateView,
    EditView,
    ListView,
    ListGuesser
} from 'react-admin';
import { ReactNode } from 'react';
import myDataProvider from './ReactAdmin/MyDataProvider';
import MyLayout from './ReactAdmin/MyLayout';
import FormGuesser from './ReactAdmin/FormGuesser';
import { ApiContext, useSwaggerApi } from './ReactAdmin/useSwaggerApi';
import editFieldTypes from 'ra-ui-materialui/lib/detail/editFieldTypes';
import listFieldTypes from 'ra-ui-materialui/lib/list/listFieldTypes';
import Graph from './ReactAdmin/Graph';
import JobFilter from './ReactAdmin/JobFilter';
import {
    CreateContextProvider,
    useCreateController,
    EditContextProvider,
    useEditController,
    ListContextProvider,
    useListController,
    useEditContext,
    useListContext
} from 'ra-core';
import {} from 'react-admin';

/**
 * Basic react-admin layout
 */
const ReactAdmin = (): ReactNode => {
    return (
        <ApiContext>
            {(api) => (
                <Admin dataProvider={myDataProvider} layout={MyLayout}>
                    <Resource
                        name="Graphs"
                        list={(props) => <Graph {...props} resource="jobs" filters={<JobFilter />} />}
                    />
                    <Resource intent="route" name="crons" />
                    <Resource intent="route" name="logs" />
                    {api.resources.map((value, i) => (
                        <Resource
                            key={i}
                            name={`${value}s`}
                            list={(props) => (
                                <FormGuesser
                                    {...props}
                                    filters={value == 'job' ? <JobFilter /> : null} 
                                    parentElement={listFieldTypes.table}
                                    fieldTypes={listFieldTypes}
                                    ContextProvider={ListContextProvider}
                                    controller={useListController}
                                    recordContext={useListContext}
                                    View={ListView}
                                />
                            )}
                            edit={(props) => (
                                <FormGuesser
                                    {...props}
                                    parentElement={editFieldTypes.form}
                                    fieldTypes={editFieldTypes}
                                    ContextProvider={EditContextProvider}
                                    recordContext={useEditContext}
                                    controller={useEditController}
                                    View={EditView}
                                />
                            )}
                            create={(props) => (
                                <FormGuesser
                                    {...props}
                                    parentElement={editFieldTypes.form}
                                    fieldTypes={editFieldTypes}
                                    ContextProvider={CreateContextProvider}
                                    controller={useCreateController}
                                    recordContext={useEditContext}
                                    View={CreateView}
                                />
                            )}
                        />
                    ))}
                </Admin>
            )}
        </ApiContext>
    );
};

export default ReactAdmin;
