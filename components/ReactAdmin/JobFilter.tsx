import { Filter, SearchInput, SelectInput } from 'react-admin';
import { makeStyles, Chip } from '@material-ui/core';
import { useState, useEffect } from 'react';

const useQuickFilterStyles = makeStyles((theme) => ({
    chip: {
        marginBottom: theme.spacing(1)
    }
}));
const QuickFilter = ({ label }) => {
    const classes = useQuickFilterStyles();
    return <Chip className={classes.chip} label={label} />;
};

const JobFilter = (props) => {
    const [projects, setProjects] = useState(null);
    useEffect(() => {
        fetch(window.location.protocol + 'api/swagger/projects')
            .then((response) => response.json())
            .then((json) => setProjects(json));
    }, []);
    return (
        <Filter {...props}>
            <SearchInput source="name" alwaysOn />
            {projects && <SelectInput choices={projects} source="project_id" alwaysOn />}
        </Filter>
    );
};

export default JobFilter;
