import { InferredElement, InputProps } from 'ra-core';
import inflection from 'inflection';
import { TextField, Datagrid } from 'react-admin';
import { ReactNode } from 'react';
import { Chip } from '@material-ui/core';
export default {
    name: 'SelectByNameOfReference',
    priority: 10,
    isValid: (resource, properties, fieldTypes, key, record) => {
        return key.indexOf('allowed_projects') != -1 && 'table' in fieldTypes;
    },
    infer: (properties, fieldTypes, key, record): InferredElement =>
        new InferredElement(
            fieldTypes.referenceArray,
            {
                source: key,
                reference: 'projects'
            },
            new InferredElement({
                component: (props: { children: ReactNode } & InputProps) => {
                    return (
                        <>
                            {Object.keys(props.data).map((id, key) => (
                                <Chip key={key} label={props.data[id].name} />
                            ))}
                        </>
                    );
                },
                representation: () => `<Datagrid><TextField source="name" /></Datagrid>`
            })
        )
};
