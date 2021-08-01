import * as React from 'react';
import { useState, useEffect } from 'react';
import inflection from 'inflection';
import { useNotify, useRefresh } from 'react-admin';
import {
    useListController,
    getElementsFromRecords,
    InferredElement,
    ListContextProvider,
    useResourceContext
} from 'ra-core';
import { useHistory } from 'react-router-dom';
import { linkToRecord, useListContext } from 'ra-core';
import ListView, { ListViewProps } from 'ra-ui-materialui/lib/list/ListView';
import listFieldTypes from 'ra-ui-materialui/lib/list/listFieldTypes';
import { ListProps } from 'ra-ui-materialui/lib/types';

import {
    mxGraph,
    mxRubberband,
    mxKeyHandler,
    mxRectangle,
    mxClient,
    mxUtils,
    mxEvent,
    mxConstants,
    mxPerimeter,
    mxEdgeStyle,
    mxImage,
    mxCellRenderer,
    mxImageShape
} from 'mxgraph-js';
import CrontabAction from './CrontabAction';

const JOB_WIDTH = 80;
const JOB_HEIGHT = 100;
const JOB_SPACER = 25;
const POOL_LANE_LENGTH = (80 / 100) * window.innerWidth;

const Graph = (props: ListProps) => {
    const controllerProps = useListController(props);
    return (
        <ListContextProvider value={controllerProps}>
            <ListGraph {...props} {...controllerProps} />
        </ListContextProvider>
    );
};

const ListGraph = (props: Omit<ListViewProps, 'children'>) => {
    const { data } = props;
    const [environments, setEnvironments] = useState(null);
    const [projects, setProject] = useState(null);
    const [logs, setLogs] = useState(null);
    const { filterValues } = useListContext(props);
    useEffect(() => {
        fetch(window.location.protocol + 'api/swagger/environments')
            .then((response) => response.json())
            .then((json) => setEnvironments(json));
        fetch(window.location.protocol + 'api/swagger/projects')
            .then((response) => response.json())
            .then((json) => {
                setProject(
                    json
                        .concat([{ id: null, name: 'Unassigned' }])
                        .filter(
                            (p) =>
                                !filterValues.project_id ||
                                filterValues.project_id == p.id
                        )
                );
            });
    }, [filterValues]);
    useEffect(() => {
        if (Object.keys(data).length) {
            fetch(
                window.location.protocol +
                    'api/swagger/logs?filter=' +
                    encodeURIComponent(JSON.stringify({ id: Object.keys(data) }))
            )
                .then((response) => response.json())
                .then((json) => setLogs(json));
        }
    }, [data]);
    return (
        <ListView
            {...props}
            pagination={false}
            actions={<CrontabAction {...props} basePath="jobs" />}
        >
            <>
                {projects &&
                    projects.map((project) => (
                        <>
                            <h2>{project.name}</h2>
                            <MxGraph
                                logs={logs}
                                environments={environments}
                                crontabs={Object.values(data).filter(
                                    (c) => c.project_id == project.id
                                )}
                            />
                        </>
                    ))}
            </>
        </ListView>
    );
};

ListGraph.propTypes = ListView.propTypes;

const MxGraph = ({ logs, crontabs, environments }) => {
    const history = useHistory();
    const notify = useNotify();
    const refresh = useRefresh();
    const addDivGraphRef = React.useCallback(
        (divGraph) => {
            const routes = { logger: '/api/static/log/', save: 'todo_route_save' };
            try {
                if (!divGraph) {
                    return;
                }
                if (!crontabs || !environments || !logs) {
                    return;
                }
                if (!crontabs.length || !environments.length || !logs.length) {
                    return;
                }
                divGraph.innerHTML = '';
                loadGraphFromCrontabs(
                    divGraph,
                    Object.values(crontabs),
                    environments,
                    logs,
                    routes,
                    history,
                    notify,
                    refresh
                );
            } catch (e) {
                console.error(e);
            }
        },
        [crontabs, environments, logs]
    );
    return <div className="container" ref={addDivGraphRef}>This project is empty</div>;
};

function loadGraphFromCrontabs(
    container,
    crontabs,
    environments,
    logs,
    routes,
    history,
    notify,
    refresh
) {
    // Checks if the browser is supported
    if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is not supported.
        console.error('Browser is not supported!', 200, false);
    } else {
        // Disables the built-in context menu
        mxEvent.disableContextMenu(container);

        // Creates the graph inside the given container
        const graph = new mxGraph(container);
        graph.setConnectable(true);
        putStyle(graph);
        putEvent(graph, crontabs, routes, history, notify, refresh);
        putControls(graph, crontabs, routes, notify, refresh);

        // Enables rubberband selection
        new mxRubberband(graph);

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        const parent = graph.getDefaultParent();

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();

        try {
            graph.setAllowDanglingEdges(false);
            graph.setDisconnectOnMove(false);

            crontabs.forEach(function (crontab) {
                let stylesclasses = '';
                const status = logs.filter((log) => log.id == crontab.id).pop();
                if (crontab.disabled) {
                    stylesclasses += 'disabled';
                } else if (status && status.code) {
                    stylesclasses += 'returncode';
                } else if (status && status.status) {
                    crontab.pid = status.pid;
                    stylesclasses += status.status;
                }

                graph.insertVertex(
                    getPool(graph, crontab, environments),
                    crontab.id,
                    crontab.name,
                    0,
                    0,
                    JOB_WIDTH,
                    JOB_HEIGHT,
                    stylesclasses
                );
            });
            crontabs.forEach(function (sourceJob) {
                if ('trigger' in sourceJob && sourceJob.trigger.forEach) {
                    sourceJob.trigger.forEach(function (targetJobId) {
                        if (graph.getModel().getCell(targetJobId)) {
                            graph.insertEdge(
                                parent,
                                null,
                                '',
                                graph.getModel().getCell(sourceJob.id),
                                graph.getModel().getCell(targetJobId)
                            );
                        }
                    });
                }
            });
            alignPools(graph, parent);
        } catch (e) {
            console.error(e);
        } finally {
            // Updates the display
            graph.getModel().endUpdate();
        }
    }
}

function alignPools(graph, root) {
    alignChildren(
        graph,
        graph.getModel().getChildVertices(root),
        0,
        0,
        0,
        JOB_HEIGHT + JOB_SPACER,
        alignJob
    );
}
function alignJob(graph, onePool) {
    if (graph.getModel().getChildVertices(onePool)) {
        graph
            .getModel()
            .getChildVertices(onePool)
            .map((node) => moveNodeUnderParent(node, graph));
        alignChildren(
            graph,
            graph.getModel().getChildVertices(onePool),
            JOB_SPACER,
            0,
            JOB_SPACER + JOB_HEIGHT,
            0,
            function () {}
        );
    }
}
function moveNodeUnderParent(node, graph) {
    let nodeConnection = 0;
    graph
        .getModel()
        .getEdges(node)
        .forEach(function (edge) {
            if (edge.source.id == node.id) {
                nodeConnection++;
                const position =
                    edge.target.geometry.x - edge.source.geometry.x + 2 * JOB_SPACER;
                const offset = nodeConnection * 2 * JOB_SPACER;
                if (position <= offset) {
                    const toOffet = offset - position;
                    edge.target.alreadyOffset = offset;
                    graph.moveCells([edge.target], toOffet, 0, false);
                }
            }
        });
}
function alignChildren(graph, children, x, y, xOffset, yOffset, childrenCallback) {
    if (children) {
        let previousCell = null;
        children.forEach(function (cell) {
            if (previousCell == null) {
                previousCell = cell;
                childrenCallback(graph, cell);
                return;
            }
            if (typeof cell.alreadyOffset == 'undefined') {
                cell.alreadyOffset = 0;
            }
            graph.moveCells(
                [cell],
                Math.max(
                    0,
                    previousCell.geometry.x -
                        cell.geometry.x +
                        xOffset +
                        x -
                        cell.alreadyOffset
                ),
                Math.max(0, previousCell.geometry.y - cell.geometry.y + yOffset + y),
                false
            );
            previousCell = cell;
            childrenCallback(graph, cell);
        });
    }
    return [x, y];
}
function getPool(graph, crontab, environments) {
    if (
        typeof graph.getModel().getCell(getPoolName(crontab, environments)) == 'undefined'
    ) {
        const pool = graph.insertVertex(
            graph.getDefaultParent(),
            getPoolName(crontab, environments),
            getPoolName(crontab, environments),
            0,
            0,
            POOL_LANE_LENGTH,
            JOB_HEIGHT,
            mxConstants.SHAPE_SWIMLANE
        );
        pool.setConnectable(false);
    }
    return graph.getModel().getCell(getPoolName(crontab, environments));
}
function getPoolName(crontab, environments) {
    if (environments && 'environment_id' in crontab) {
        const candidate = environments.filter((e) => e.id == crontab.environment_id);
        if (candidate.length) {
            return candidate[0].name;
        }
    }
    return 'local';
}

function putControls(graph, crontabs, routes, notify, refresh) {
    // Specifies the URL and size of the new control
    const controls = {
        startControl: {
            image: new mxImage('images/submenu.gif', 16, 16),
            condition: function (graph, cell) {
                let running = false;
                let stopped = false;
                crontabs.forEach(function (crontab) {
                    if (crontab.id == cell.id) {
                        running = crontab.pid != null;
                        stopped = crontab.disabled == true;
                        return;
                    }
                });
                return (
                    cell.style != mxConstants.SHAPE_SWIMLANE &&
                    graph.getModel().isVertex(cell) &&
                    !running &&
                    !stopped
                );
            },
            behavior: function (graph, state) {
                return function (evt) {
                    if (graph.isEnabled()) {
                        runJob(notify, refresh, state.cell.id);
                        graph.selectCellForEvent(state.cell, evt);
                        mxEvent.consume(evt);
                    }
                };
            }
        },
        killControl: {
            image: new mxImage('images/close.gif', 16, 16),
            condition: function (graph, cell) {
                let running = false;
                crontabs.forEach(function (crontab) {
                    if (crontab.id == cell.id) {
                        running = crontab.pid != null;
                        return;
                    }
                });
                return (
                    cell.style != mxConstants.SHAPE_SWIMLANE &&
                    graph.getModel().isVertex(cell) &&
                    running
                );
            },
            behavior: function (graph, state) {
                return function (evt) {
                    if (graph.isEnabled()) {
                        killJob(notify, state.cell.id);
                        graph.selectCellForEvent(state.cell, evt);
                        mxEvent.consume(evt);
                    }
                };
            }
        },
        viewLogControl: {
            image: new mxImage('images/maximize.gif', 16, 16),
            condition: function (graph, cell) {
                let exist = false;
                crontabs.forEach(function (crontab) {
                    if (crontab.id == cell.id) {
                        exist = true;
                        return;
                    }
                });
                return (
                    cell.style != mxConstants.SHAPE_SWIMLANE &&
                    graph.getModel().isVertex(cell) &&
                    exist
                );
            },
            behavior: function (graph, state) {
                return function (evt) {
                    if (graph.isEnabled()) {
                        window.open(routes.logger + state.cell.id + '.stdout.log');
                        window.open(routes.logger + state.cell.id + '.stderr.log');
                        graph.selectCellForEvent(state.cell, evt);
                        mxEvent.consume(evt);
                    }
                };
            }
        }
    };

    // Overridden to add an additional control to the state at creation time
    const mxCellRendererCreateControl = mxCellRenderer.prototype.createControl;
    mxCellRenderer.prototype.createControl = function (state) {
        mxCellRendererCreateControl.apply(this, arguments);

        const graph = state.view.graph;

        for (const control in controls) {
            if (controls[control].condition(graph, state.cell)) {
                if (state[control] == null) {
                    const b = new mxRectangle(
                        0,
                        0,
                        controls[control].image.width,
                        controls[control].image.height
                    );
                    state[control] = new mxImageShape(b, controls[control].image.src);
                    state[control].dialect = graph.dialect;
                    state[control].preserveImageAspect = false;

                    this.initControl(
                        state,
                        state[control],
                        false,
                        controls[control].behavior(graph, state)
                    );
                }
            } else if (state[control] != null) {
                state[control].destroy();
                state[control] = null;
            }
        }
    };

    // Helper function to compute the bounds of the control
    const getControlBounds = function (state, control, index) {
        if (state[control] != null) {
            const oldScale = state[control].scale;
            const w = state[control].bounds.width / oldScale;
            const h = state[control].bounds.height / oldScale;
            const s = state.view.scale;

            return state.view.graph.getModel().isEdge(state.cell)
                ? new mxRectangle(
                      state.x + state.width / 2 - (w / 2) * s,
                      state.y + state.height / 2 - (h / 2) * s,
                      w * s,
                      h * s
                  )
                : new mxRectangle(
                      state.x + state.width - w * s - w * index,
                      state.y,
                      w * s,
                      h * s
                  );
        }

        return null;
    };

    // Overridden to update the scale and bounds of the control
    const mxCellRendererRedrawControl = mxCellRenderer.prototype.redrawControl;
    mxCellRenderer.prototype.redrawControl = function (state) {
        mxCellRendererRedrawControl.apply(this, arguments);

        let index = 0;
        for (const control in controls) {
            if (state[control] != null) {
                const bounds = getControlBounds(state, control, index++);
                const s = state.view.scale;

                if (state[control].scale != s || !state[control].bounds.equals(bounds)) {
                    state[control].bounds = bounds;
                    state[control].scale = s;
                    state[control].redraw();
                }
            }
        }
    };

    // Overridden to remove the control if the state is destroyed
    const mxCellRendererDestroy = mxCellRenderer.prototype.destroy;
    mxCellRenderer.prototype.destroy = function (state) {
        mxCellRendererDestroy.apply(this, arguments);

        for (const control in controls) {
            if (state[control] != null) {
                state[control].destroy();
                state[control] = null;
            }
        }
    };
}
function putStyle(graph) {
    style = [];
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_STROKECOLOR] = '#a0a0a0';
    style[mxConstants.STYLE_FONTCOLOR] = '#606060';
    style[mxConstants.STYLE_FILLCOLOR] = '#E0E0DF';
    style[mxConstants.STYLE_GRADIENTCOLOR] = 'white';
    style[mxConstants.STYLE_STARTSIZE] = 30;
    style[mxConstants.STYLE_ROUNDED] = false;
    style[mxConstants.STYLE_FONTSIZE] = 12;
    style[mxConstants.STYLE_FONTSTYLE] = 0;
    style[mxConstants.STYLE_HORIZONTAL] = false;
    // To improve text quality for vertical labels in some old IE versions...
    style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#efefef';

    graph.getStylesheet().putCellStyle(mxConstants.SHAPE_SWIMLANE, style);

    var style = [];
    style[mxConstants.STYLE_FILLCOLOR] = '#ED4337';
    graph.getStylesheet().putCellStyle('returncode', style);

    const styleRunning = [];
    styleRunning[mxConstants.STYLE_FILLCOLOR] = '#90ee90';
    graph.getStylesheet().putCellStyle('running', styleRunning);

    const styleDisabled = [];
    styleDisabled[mxConstants.STYLE_FILLCOLOR] = '#d3d3d3';
    graph.getStylesheet().putCellStyle('disabled', styleDisabled);

    style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_CURVED] = '1';
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.SegmentConnector;
}

function putEvent(graph, crontabs, routes, history, notify, refresh) {
    const style = document.createElement('style');
    style.innerHTML = '.graph-selected {' + '    background-color: #00ff00 !important;';
    ('}');
    document.body.appendChild(style);

    graph.addListener(mxEvent.DOUBLE_CLICK, function (sender, evt) {
        const me = evt.getProperty('event');
        const cell = evt.getProperty('cell');

        if (cell != null) {
            editJob(history, cell.id);
            evt.consume();
        }
    });

    graph.connectionHandler.addListener(mxEvent.CONNECT, function (sender, evt) {
        const edge = evt.getProperty('cell');
        const source = graph.getModel().getTerminal(edge, true);
        const target = graph.getModel().getTerminal(edge, false);

        crontabs.forEach(function (crontab) {
            if (source.id == crontab.id) {
                if (!('trigger' in crontab && crontab.trigger.push)) {
                    crontab.trigger = [];
                }
                crontab.trigger.push(target.id);
                modifyRelationship(notify, refresh, crontab.id, target.id, 'PUT');
                return;
            }
        });
    });
}

function runJob(notify, refresh, id) {
    fetch(window.location.protocol + `/api/execute/${id}`)
        .then(async (response) => {
            if (!response.ok) {
                notify(await response.text(), 'warning');
            } else {
                notify('Job run', 'info', {}, true);
            }
            refresh();
        })
        .catch((error) => notify(`Error: ${error.message}`, 'warning'));
    refresh();
}

function modifyRelationship(notify, refresh, a, b, method) {
    fetch(window.location.protocol + `/api/swagger/relationship?from=${a}&to=${b}`, {
        method: method
    })
        .then(async (response) => {
        if (!response.ok) {
            notify(await response.text(), 'warning');
        } else {
            notify('Trigger modified', 'info', {}, true);
            refresh()
        }
    })
    .catch((error) => notify(`Error: ${error.message}`, 'warning'));
}

function killJob(notify, id) {
    fetch(window.location.protocol + `/api/kill/${id}`).then(async (response) => {
        if (!response.ok) {
            throw new Error(await response.text());
        }
        //TODO refactor with listcontext and refresh job
        notify('Job killed', 'info', {}, true);
    });
    //.catch((error) => notify(`Error: ${error.message}`, 'warning'));
}
function editJob(history, id) {
    history.push(linkToRecord('/jobs', id));
}

function deleteJob(notify, refresh, id) {
    fetch(window.location.protocol + 'api/swagger/jobs/' + id, { method: 'DELETE' }).then(
        () => {
            notify('Job deleted', 'info', {}, true);
            refresh();
        }
    );
}
export default Graph;
