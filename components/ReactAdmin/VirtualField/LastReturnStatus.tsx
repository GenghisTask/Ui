import { InferredElement, InputProps } from 'ra-core';
import inflection from 'inflection';
import { sanitizeFieldRestProps, TextFieldProps, TextField, ReferenceField } from 'react-admin';
import { FC, memo } from 'react';
import get from 'lodash/get';
import Typography from '@material-ui/core/Typography';
import { useRecordContext } from 'ra-core';
import { ReactNode } from 'react';

export default {
    name: 'LastReturnStatus',
    priority: 3,
    isValid: (resource, properties, fieldTypes, record) => {
        return resource == 'jobs' && 'table' in fieldTypes;
    },
    infer: (properties, fieldTypes, record): InferredElement =>
        new InferredElement(
            fieldTypes.reference,
            {
                source: 'id',
                reference: 'logs',
                label: 'Status'
            },
            new InferredElement({
                component: (props: { children: ReactNode } & InputProps) => (
                    <><TextField source="status" /><br/>
                    { props.record.code &&  <>  (<TextField source="code" />) </>}
                    </>
                ),
                representation: () => `<TextField source="status" />`
            })
        )
};
