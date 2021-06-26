import { InferredElement, InputProps } from 'ra-core';
import { useForm, useFormState } from 'react-final-form';
import { ReactNode, useState, useEffect } from 'react';
import { TextInput } from 'react-admin';
import Tooltip from '@material-ui/core/Tooltip';
import cronstrue from 'cronstrue';
export default {
    name: 'ScheduleHelper',
    priority: 2,
    isValid: (resource, properties, fieldTypes, key, record) => {
        return key == 'schedule' && 'form' in fieldTypes;
    },
    infer: (properties, fieldTypes, key, record): InferredElement =>
        new InferredElement(
            {
                component: (props: { children: ReactNode } & InputProps) => {
                    const form = useForm();
                    const { values } = useFormState({ subscription: { values: true } });
                    const [preview, setPreview] = useState('');
                    useEffect(() => {
                        try {
                            const schedule = form.getState().values.schedule;
                            if (["@yearly", "@annually", "@monthly", "@weekly", "@daily", "@hourly", "@reboot"].includes(schedule)) {
                                setPreview(schedule.substring(1,2).toUpperCase() + schedule.substring(2));
                                return;
                            }
                            const help = cronstrue.toString(schedule);
                            setPreview(help);
                        } catch (e) {
                            setPreview(e);
                        }
                    }, [values]);
                    return (
                        <Tooltip title={preview}  placement="right">
                            <TextInput source="schedule" />
                        </Tooltip>
                    );
                },
                representation: () => `<TextField source="schedule" />`
            },
            {
                source: 'schedule'
            }
        )
};
