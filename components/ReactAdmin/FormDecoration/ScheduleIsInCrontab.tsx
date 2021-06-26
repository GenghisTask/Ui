import { InferredElement, InputProps } from 'ra-core';
import inflection from 'inflection';
import { sanitizeFieldRestProps, TextFieldProps, TextField, ReferenceField } from 'react-admin';
import { FC, memo } from 'react';
import get from 'lodash/get';
import Typography from '@material-ui/core/Typography';
import { useRecordContext } from 'ra-core';
import { ReactNode } from 'react';

const ScheduleField: FC<TextFieldProps> = memo<TextFieldProps>((props) => {
    const { className, source, emptyText, ...rest } = props;
    const record = useRecordContext(props);
    const value = get(record, source);

    return (
        <Typography
            component="span"
            variant="body2"
            className={className}
            {...sanitizeFieldRestProps(rest)}
        >
            {value != null && typeof value !== 'string'
                ? JSON.stringify(value)
                : value || emptyText}
        </Typography>
    );
});
ScheduleField.displayName = 'ScheduleField';

export default {
    name: 'ScheduleIsInCrontab',
    priority: 2,
    isValid: (resource, properties, fieldTypes, key, record) => {
        return key == 'schedule' && 'table' in fieldTypes;
    },
    infer: (properties, fieldTypes, key, record): InferredElement =>
        new InferredElement(
            fieldTypes.reference,
            {
                source: 'id',
                reference: 'crons',
                label: 'Schedule'
            },
            new InferredElement({
                component: (props: { children: ReactNode } & InputProps) => (
                    <TextField source="in_crontab" />
                ),
                representation: () => `<TextField source="in_crontab" />`
            })
        )
};
