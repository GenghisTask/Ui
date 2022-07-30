
import { useEffect, useState, ReactNode } from 'react';
import { Table, TableHead, TableBody, TableCell, TableRow } from '@material-ui/core';

const ShowLogs = (props) => {
    const [lines, setLines] = useState([]);
    useEffect(() => {
        fetch(window.location.protocol + 'api/static/log/' + window.location.hash.split('logs/')[1] +  '.log')
            .then((response) => response.text())
            .then((text) => `[${text}]`.replace(/\n/g, ',').replace('},]','}]'))
            .then((text) => setLines(JSON.parse(text)));
    }, []);
    const columns = ['execution_id', 'timestamp', 'command', 'status', 'pid', 'code'];
    return (
        <Table>
            <TableHead>
                <TableRow>
                    {columns.map(((column, j)=> (<TableCell key={j}>{column}</TableCell>)))}
                </TableRow>
            </TableHead>
            <TableBody>
            {lines.map((line, i) => (
                <TableRow key={i}>
                    {columns.map(((column, j)=> (<TableCell key={j}>{line[column]}</TableCell>)))}
                </TableRow>
            ))}
            </TableBody>
        </Table>
   );
};

export default ShowLogs;
