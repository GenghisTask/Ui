import { ReactNode, useEffect, useState, FunctionComponent } from 'react';
import { SelectArrayInput, Button, TextInput } from 'react-admin';
import { useInput, FieldTitle, InputProps } from 'ra-core';
import { TextFieldProps } from '@material-ui/core/TextField';
import ContentDelete from '@material-ui/icons/RemoveCircleOutline';
import ContentOk from '@material-ui/icons/Check';

import { Chip, Drawer } from '@material-ui/core';
export type ChipInputProps = InputProps<TextFieldProps> &
    Omit<TextFieldProps, 'label' | 'helperText'>;

const ChipInput: FunctionComponent<ChipInputProps> = ({
    argument,
    source,
    onDelete,
    record
}) => {
    const [edit, toggleEdit] = useState(argument == ""); 
    return (
        <>
            {!edit && (
                <Chip
                    label={argument}
                    onClick={() => {
                        toggleEdit(true);
                    }}
                />
            )}
            <div style={{ display: edit ? 'block' : 'none' }}>
                <TextInput
                    type={edit ? 'text' : 'hidden'}
                    label={record}
                    helperText={false}
                    value={argument}
                    source={source}
                />
                <Button label="" onClick={onDelete}>
                    <ContentDelete />
                </Button>
                <Button
                    label=""
                    onClick={() => {
                        toggleEdit(false);
                    }}
                >
                    <ContentOk />
                </Button>
            </div>
        </>
    );
};

export default ChipInput;
