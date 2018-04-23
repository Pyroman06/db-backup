'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _core = require('@blueprintjs/core');

var _toaster = require('./toaster');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Dashboard = function (_React$Component) {
    _inherits(Dashboard, _React$Component);

    function Dashboard(props) {
        _classCallCheck(this, Dashboard);

        var _this = _possibleConstructorReturn(this, (Dashboard.__proto__ || Object.getPrototypeOf(Dashboard)).call(this, props));

        _this.state = {
            isAddDatabaseOpen: false,
            databaseName: "",
            databaseEngine: "mysql",
            databaseHostname: "",
            databasePort: "",
            databaseUsername: "",
            databasePassword: "",
            databaseUri: "",
            addDatabaseDisabled: false,
            error: false,
            loading: true,
            initialLoaded: false,
            databases: {},
            schedules: {},
            backups: {},
            isManualBackupOpen: false,
            manualBackupDatabaseId: "",
            manualBackupDestination: "local",
            manualBackupPath: "",
            isAddTaskOpen: false,
            addTaskDatabase: "",
            addTaskDestination: "local",
            addTaskPath: "",
            addTaskRule: "",
            addTaskDisabled: false,
            isLogOpen: false,
            logIndex: null
        };
        return _this;
    }

    _createClass(Dashboard, [{
        key: 'addTask',
        value: function addTask() {
            var _this2 = this;

            this.setState({
                addTaskDisabled: true
            });
            fetch('/api/scheduler/add', {
                credentials: 'same-origin',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    databaseId: this.state.addTaskDatabase,
                    destination: this.state.addTaskDestination,
                    path: this.state.addTaskPath,
                    rule: this.state.addTaskRule
                })
            }).then(function (response) {
                if (!response.ok) {
                    _this2.setState({
                        addTaskDisabled: false
                    });
                    _toaster.AppToaster.show({ message: response.statusText, intent: _core.Intent.DANGER });
                }

                return response;
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (!data.error) {
                    _toaster.AppToaster.show({ message: "Task was added", intent: _core.Intent.SUCCESS });
                    _this2.setState({
                        isAddTaskOpen: false,
                        addTaskDisabled: false,
                        addTaskDatabase: "",
                        addTaskDestination: "local",
                        addTaskPath: "",
                        addTaskRule: ""
                    });
                    _this2.getDashboard();
                } else {
                    _this2.setState({
                        addTaskDisabled: false
                    });
                    _toaster.AppToaster.show({ message: data.message, intent: _core.Intent.DANGER });
                }
            }).catch(function (err) {
                _this2.setState({
                    addTaskDisabled: false
                });
                _toaster.AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: _core.Intent.DANGER });
            });
        }
    }, {
        key: 'removeTask',
        value: function removeTask(taskId) {
            var _this3 = this;

            fetch('/api/scheduler/delete', {
                credentials: 'same-origin',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    taskId: taskId
                })
            }).then(function (response) {
                if (!response.ok) {
                    _toaster.AppToaster.show({ message: response.statusText, intent: _core.Intent.DANGER });
                }

                return response;
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (!data.error) {
                    _toaster.AppToaster.show({ message: "Task was deleted", intent: _core.Intent.SUCCESS });
                    _this3.getDashboard();
                } else {
                    _toaster.AppToaster.show({ message: data.message, intent: _core.Intent.DANGER });
                }
            }).catch(function (err) {
                _toaster.AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: _core.Intent.DANGER });
            });
        }
    }, {
        key: 'getDashboard',
        value: function getDashboard() {
            var _this4 = this;

            if (!this.state.initialLoaded) {
                this.setState({
                    loading: true
                });
            }
            fetch('/api/dashboard/get', {
                credentials: 'same-origin',
                method: 'POST'
            }).then(function (response) {
                if (!response.ok) {
                    _this4.setState({
                        error: true,
                        loading: false
                    });
                    _toaster.AppToaster.show({ message: response.statusText, intent: _core.Intent.DANGER });
                }

                return response;
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (!data.error) {
                    _this4.setState({
                        databases: data.databases,
                        schedules: data.schedules,
                        backups: data.backups,
                        error: false,
                        loading: false,
                        initialLoaded: true
                    });
                } else {
                    _this4.setState({
                        error: true,
                        loading: false
                    });
                    _toaster.AppToaster.show({ message: data.message, intent: _core.Intent.DANGER });
                }
            }).catch(function (err) {
                _this4.setState({
                    error: true,
                    loading: false
                });
                _toaster.AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: _core.Intent.DANGER });
            });
        }
    }, {
        key: 'handleAddDatabaseOpen',
        value: function handleAddDatabaseOpen() {
            this.setState({
                isAddDatabaseOpen: !this.state.isAddDatabaseOpen
            });
        }
    }, {
        key: 'databaseNameChange',
        value: function databaseNameChange(e) {
            this.setState({
                databaseName: e.target.value
            });
        }
    }, {
        key: 'databaseEngineChange',
        value: function databaseEngineChange(e) {
            this.setState({
                databaseEngine: e.target.value
            });
        }
    }, {
        key: 'databaseHostnameChange',
        value: function databaseHostnameChange(e) {
            this.setState({
                databaseHostname: e.target.value
            });
        }
    }, {
        key: 'databasePortChange',
        value: function databasePortChange(e) {
            this.setState({
                databasePort: e.target.value
            });
        }
    }, {
        key: 'databaseUsernameChange',
        value: function databaseUsernameChange(e) {
            this.setState({
                databaseUsername: e.target.value
            });
        }
    }, {
        key: 'databasePasswordChange',
        value: function databasePasswordChange(e) {
            this.setState({
                databasePassword: e.target.value
            });
        }
    }, {
        key: 'databaseUriChange',
        value: function databaseUriChange(e) {
            this.setState({
                databaseUri: e.target.value
            });
        }
    }, {
        key: 'addDatabase',
        value: function addDatabase() {
            var _this5 = this;

            this.setState({
                addDatabaseDisabled: true
            });

            var data = {};
            if (this.state.databaseEngine == "mysql") {
                data = { name: this.state.databaseName, engine: this.state.databaseEngine, hostname: this.state.databaseHostname, port: this.state.databasePort, username: this.state.databaseUsername, password: this.state.databasePassword };
            } else if (this.state.databaseEngine == "mongodb") {
                data = { name: this.state.databaseName, engine: this.state.databaseEngine, uri: this.state.databaseUri };
            }

            fetch('/api/database/add', {
                credentials: 'same-origin',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(function (response) {
                if (!response.ok) {
                    _this5.setState({
                        addDatabaseDisabled: false
                    });
                    _toaster.AppToaster.show({ message: response.statusText, intent: _core.Intent.DANGER });
                }

                return response;
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (!data.error) {
                    _toaster.AppToaster.show({ message: "Database was added", intent: _core.Intent.SUCCESS });
                    _this5.setState({
                        isAddDatabaseOpen: false,
                        addDatabaseDisabled: false,
                        databaseName: "",
                        databaseEngine: "mysql",
                        databaseHostname: "",
                        databasePort: "",
                        databaseUsername: "",
                        databasePassword: "",
                        databaseUri: ""
                    });
                    _this5.getDashboard();
                } else {
                    _this5.setState({
                        addDatabaseDisabled: false
                    });
                    _toaster.AppToaster.show({ message: data.message, intent: _core.Intent.DANGER });
                }
            }).catch(function (err) {
                _this5.setState({
                    addDatabaseDisabled: false
                });
                _toaster.AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: _core.Intent.DANGER });
            });
        }
    }, {
        key: 'deleteDatabase',
        value: function deleteDatabase(databaseId) {
            var _this6 = this;

            fetch('/api/database/delete', {
                credentials: 'same-origin',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    databaseId: databaseId
                })
            }).then(function (response) {
                if (!response.ok) {
                    _toaster.AppToaster.show({ message: response.statusText, intent: _core.Intent.DANGER });
                }

                return response;
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (!data.error) {
                    _toaster.AppToaster.show({ message: "Database was deleted", intent: _core.Intent.SUCCESS });
                    _this6.getDashboard();
                } else {
                    _toaster.AppToaster.show({ message: data.message, intent: _core.Intent.DANGER });
                }
            }).catch(function (err) {
                _toaster.AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: _core.Intent.DANGER });
            });
        }
    }, {
        key: 'manualBackup',
        value: function manualBackup(databaseId) {
            this.setState({
                manualBackupDatabaseId: databaseId,
                manualBackupDestination: "local",
                manualBackupPath: "",
                isManualBackupOpen: true
            });
        }
    }, {
        key: 'manualBackupDestinationChange',
        value: function manualBackupDestinationChange(e) {
            this.setState({
                manualBackupDestination: e.target.value
            });
        }
    }, {
        key: 'manualBackupPathChange',
        value: function manualBackupPathChange(e) {
            this.setState({
                manualBackupPath: e.target.value
            });
        }
    }, {
        key: 'performManualBackup',
        value: function performManualBackup() {
            var _this7 = this;

            this.toggleManualBackup();
            fetch('/api/database/manualbackup', {
                credentials: 'same-origin',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    databaseId: this.state.manualBackupDatabaseId,
                    destination: this.state.manualBackupDestination,
                    path: this.state.manualBackupPath
                })
            }).then(function (response) {
                if (!response.ok) {
                    _toaster.AppToaster.show({ message: response.statusText, intent: _core.Intent.DANGER });
                }

                return response;
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (!data.error) {
                    _toaster.AppToaster.show({ message: "Backup was added to the queue", intent: _core.Intent.SUCCESS });
                    _this7.getDashboard();
                } else {
                    _toaster.AppToaster.show({ message: data.message, intent: _core.Intent.DANGER });
                }
            }).catch(function (err) {
                _toaster.AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: _core.Intent.DANGER });
            });
        }
    }, {
        key: 'toggleManualBackup',
        value: function toggleManualBackup() {
            this.setState({
                isManualBackupOpen: !this.state.isManualBackupOpen
            });
        }
    }, {
        key: 'handleAddTaskOpen',
        value: function handleAddTaskOpen() {
            this.setState({
                isAddTaskOpen: !this.state.isAddTaskOpen
            });
        }
    }, {
        key: 'addTaskDestinationChange',
        value: function addTaskDestinationChange(e) {
            this.setState({
                addTaskDestination: e.target.value
            });
        }
    }, {
        key: 'addTaskPathChange',
        value: function addTaskPathChange(e) {
            this.setState({
                addTaskPath: e.target.value
            });
        }
    }, {
        key: 'addTaskDatabaseChange',
        value: function addTaskDatabaseChange(e) {
            this.setState({
                addTaskDatabase: e.target.value
            });
        }
    }, {
        key: 'addTaskRuleChange',
        value: function addTaskRuleChange(e) {
            this.setState({
                addTaskRule: e.target.value
            });
        }
    }, {
        key: 'toggleLogOpen',
        value: function toggleLogOpen() {
            this.setState({
                isLogOpen: !this.state.isLogOpen
            });
        }
    }, {
        key: 'openLog',
        value: function openLog(index) {
            this.setState({
                isLogOpen: true,
                logIndex: index
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            var that = this;
            this.getDashboard();
            setInterval(function () {
                that.getDashboard.bind(that)();
            }, 10000);
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.state.loading || this.state.error) {
                return _react2.default.createElement(
                    'div',
                    { className: 'db-loading-fill' },
                    _react2.default.createElement(_core.Spinner, null)
                );
            } else {
                var that = this;
                return _react2.default.createElement(
                    'div',
                    { className: 'db-dashboard' },
                    _react2.default.createElement(
                        'div',
                        { className: 'db-dashboard-item' },
                        _react2.default.createElement(
                            'h2',
                            null,
                            'Databases'
                        ),
                        _react2.default.createElement(_core.Button, { text: 'Add new database', intent: _core.Intent.PRIMARY, onClick: this.handleAddDatabaseOpen.bind(this) }),
                        _react2.default.createElement(
                            _core.Collapse,
                            { isOpen: this.state.isAddDatabaseOpen },
                            _react2.default.createElement(
                                'div',
                                { className: 'db-form-default', style: { marginTop: "15px" } },
                                _react2.default.createElement(
                                    _core.FormGroup,
                                    { helperText: 'Choose a name for new database to be able to distinguish it from others', label: 'Name', labelFor: 'database-name', requiredLabel: true },
                                    _react2.default.createElement('input', { id: 'database-name', className: 'pt-input pt-intent-primary', type: 'text', placeholder: 'Name', dir: 'auto', value: this.state.databaseName, onChange: this.databaseNameChange.bind(this) })
                                ),
                                _react2.default.createElement(
                                    _core.RadioGroup,
                                    {
                                        label: 'Database engine',
                                        onChange: this.databaseEngineChange.bind(this),
                                        selectedValue: this.state.databaseEngine
                                    },
                                    _react2.default.createElement(_core.Radio, { label: 'MySQL', value: 'mysql' }),
                                    _react2.default.createElement(_core.Radio, { label: 'MongoDB', value: 'mongodb' })
                                ),
                                this.state.databaseEngine == "mysql" && _react2.default.createElement(
                                    'div',
                                    null,
                                    _react2.default.createElement(
                                        _core.FormGroup,
                                        { helperText: 'Hostname of your database', label: 'Hostname', labelFor: 'database-hostname', requiredLabel: true },
                                        _react2.default.createElement('input', { id: 'database-hostname', className: 'pt-input pt-intent-primary', type: 'text', placeholder: 'Hostname', dir: 'auto', value: this.state.databaseHostname, onChange: this.databaseHostnameChange.bind(this) })
                                    ),
                                    _react2.default.createElement(
                                        _core.FormGroup,
                                        { helperText: 'Port of your database', label: 'Port', labelFor: 'database-port', requiredLabel: true },
                                        _react2.default.createElement('input', { id: 'database-port', className: 'pt-input pt-intent-primary', type: 'text', placeholder: 'Port', dir: 'auto', value: this.state.databasePort, onChange: this.databasePortChange.bind(this) })
                                    ),
                                    _react2.default.createElement(
                                        _core.FormGroup,
                                        { helperText: 'Username for your database', label: 'Username', labelFor: 'database-username', requiredLabel: true },
                                        _react2.default.createElement('input', { id: 'database-username', className: 'pt-input pt-intent-primary', type: 'text', placeholder: 'Username', dir: 'auto', value: this.state.databaseUsername, onChange: this.databaseUsernameChange.bind(this) })
                                    ),
                                    _react2.default.createElement(
                                        _core.FormGroup,
                                        { helperText: 'Password for your database', label: 'Password', labelFor: 'database-password', requiredLabel: true },
                                        _react2.default.createElement('input', { id: 'database-password', className: 'pt-input pt-intent-primary', type: 'text', placeholder: 'Password', dir: 'auto', value: this.state.databasePassword, onChange: this.databasePasswordChange.bind(this) })
                                    )
                                ) || this.state.databaseEngine == "mongodb" && _react2.default.createElement(
                                    'div',
                                    null,
                                    _react2.default.createElement(
                                        _core.FormGroup,
                                        { helperText: 'Connection string for your MongoDB database', label: 'Connection string', labelFor: 'database-uri', requiredLabel: true },
                                        _react2.default.createElement('input', { id: 'database-uri', className: 'pt-input pt-intent-primary', type: 'text', placeholder: 'Connection string', dir: 'auto', value: this.state.databaseUri, onChange: this.databaseUriChange.bind(this) })
                                    )
                                ),
                                _react2.default.createElement(_core.Button, { text: 'Add', intent: _core.Intent.PRIMARY, className: 'pt-large', loading: this.state.addDatabaseDisabled, onClick: this.addDatabase.bind(this) })
                            )
                        ),
                        _react2.default.createElement(
                            'table',
                            { className: 'pt-html-table pt-interactive' },
                            _react2.default.createElement(
                                'thead',
                                null,
                                _react2.default.createElement(
                                    'tr',
                                    null,
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        'Name'
                                    ),
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        'Engine'
                                    ),
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        'Options'
                                    ),
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        'Actions'
                                    )
                                )
                            ),
                            this.state.databases ? _react2.default.createElement(
                                'tbody',
                                null,
                                this.state.databases.map(function (database) {
                                    return _react2.default.createElement(
                                        'tr',
                                        null,
                                        _react2.default.createElement(
                                            'td',
                                            null,
                                            database.name
                                        ),
                                        _react2.default.createElement(
                                            'td',
                                            null,
                                            database.engine == "mysql" && "MySQL" || database.engine == "mongodb" && "MongoDB"
                                        ),
                                        _react2.default.createElement(
                                            'td',
                                            null,
                                            database.options.uri ? _react2.default.createElement(
                                                'div',
                                                null,
                                                'Connection string: ',
                                                database.options.uri
                                            ) : null,
                                            database.options.hostname ? _react2.default.createElement(
                                                'div',
                                                null,
                                                'Hostname: ',
                                                database.options.hostname
                                            ) : null,
                                            database.options.port ? _react2.default.createElement(
                                                'div',
                                                null,
                                                'Port: ',
                                                database.options.port
                                            ) : null,
                                            database.options.username ? _react2.default.createElement(
                                                'div',
                                                null,
                                                'Username: ',
                                                database.options.username
                                            ) : null,
                                            database.options.password ? _react2.default.createElement(
                                                'div',
                                                null,
                                                'Password: ',
                                                database.options.password
                                            ) : null
                                        ),
                                        _react2.default.createElement(
                                            'td',
                                            null,
                                            _react2.default.createElement(
                                                _core.Popover,
                                                { content: _react2.default.createElement(
                                                        _core.Menu,
                                                        null,
                                                        _react2.default.createElement(_core.MenuItem, { icon: 'floppy-disk', onClick: that.manualBackup.bind(that, database._id), text: 'Manual backup' }),
                                                        _react2.default.createElement(_core.MenuItem, { icon: 'delete', onClick: that.deleteDatabase.bind(that, database._id), text: 'Delete', intent: _core.Intent.DANGER })
                                                    ) },
                                                _react2.default.createElement(_core.Button, { text: 'Menu' })
                                            )
                                        )
                                    );
                                }),
                                _react2.default.createElement(
                                    _core.Dialog,
                                    {
                                        isOpen: that.state.isManualBackupOpen,
                                        onClose: that.toggleManualBackup.bind(that),
                                        title: 'Manual backup'
                                    },
                                    _react2.default.createElement(
                                        'div',
                                        { style: { padding: "15px 15px 15px 15px" } },
                                        _react2.default.createElement(
                                            _core.RadioGroup,
                                            {
                                                label: 'Backup destination',
                                                onChange: that.manualBackupDestinationChange.bind(that),
                                                selectedValue: that.state.manualBackupDestination
                                            },
                                            _react2.default.createElement(_core.Radio, { label: 'Local', value: 'local' }),
                                            _react2.default.createElement(_core.Radio, { label: 'Amazon S3', value: 's3' })
                                        ),
                                        that.state.manualBackupDestination == "local" && _react2.default.createElement(
                                            _core.FormGroup,
                                            { helperText: 'Path where to store backup', label: 'Path', labelFor: 'manual-local-path', requiredLabel: true },
                                            _react2.default.createElement('input', { id: 'manual-local-path', className: 'pt-input pt-intent-primary', type: 'text', placeholder: 'Path', dir: 'auto', value: that.state.manualBackupPath, onChange: that.manualBackupPathChange.bind(that) })
                                        ) || that.state.manualBackupDestination == "s3" && _react2.default.createElement(
                                            _core.FormGroup,
                                            { helperText: 'S3 bucket to store backup in', label: 'Amazon S3 Bucket', labelFor: 'manual-s3-bucket', requiredLabel: true },
                                            _react2.default.createElement('input', { id: 'manual-s3-bucket', className: 'pt-input pt-intent-primary', type: 'text', placeholder: 'Amazon S3 Bucket', dir: 'auto', value: that.state.manualBackupPath, onChange: that.manualBackupPathChange.bind(that) })
                                        ) || null,
                                        _react2.default.createElement(_core.Button, { text: 'Start backup', intent: _core.Intent.PRIMARY, onClick: that.performManualBackup.bind(that) })
                                    )
                                )
                            ) : null
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'db-dashboard-item' },
                        _react2.default.createElement(
                            'h2',
                            null,
                            'Scheduler'
                        ),
                        _react2.default.createElement(_core.Button, { text: 'Add new task', intent: _core.Intent.PRIMARY, onClick: this.handleAddTaskOpen.bind(this) }),
                        _react2.default.createElement(
                            _core.Collapse,
                            { isOpen: this.state.isAddTaskOpen },
                            _react2.default.createElement(
                                'div',
                                { className: 'db-form-default', style: { marginTop: "15px" } },
                                _react2.default.createElement(
                                    'div',
                                    { 'class': 'pt-select' },
                                    _react2.default.createElement(
                                        'select',
                                        { onChange: this.addTaskDatabaseChange.bind(this) },
                                        _react2.default.createElement(
                                            'option',
                                            { selected: true },
                                            'Choose a database...'
                                        ),
                                        this.state.databases.map(function (database) {
                                            return _react2.default.createElement(
                                                'option',
                                                { value: database._id },
                                                database.name
                                            );
                                        })
                                    )
                                ),
                                _react2.default.createElement(
                                    _core.RadioGroup,
                                    {
                                        label: 'Backup destination',
                                        onChange: this.addTaskDestinationChange.bind(this),
                                        selectedValue: this.state.addTaskDestination
                                    },
                                    _react2.default.createElement(_core.Radio, { label: 'Local', value: 'local' }),
                                    _react2.default.createElement(_core.Radio, { label: 'Amazon S3', value: 's3' })
                                ),
                                this.state.addTaskDestination == "local" && _react2.default.createElement(
                                    _core.FormGroup,
                                    { helperText: 'Path where to store backup', label: 'Path', labelFor: 'scheduler-local-path', requiredLabel: true },
                                    _react2.default.createElement('input', { id: 'scheduler-local-path', className: 'pt-input pt-intent-primary', type: 'text', placeholder: 'Path', dir: 'auto', value: this.state.addTaskPath, onChange: this.addTaskPathChange.bind(this) })
                                ) || this.state.addTaskDestination == "s3" && _react2.default.createElement(
                                    _core.FormGroup,
                                    { helperText: 'S3 bucket to store backup in', label: 'Amazon S3 Bucket', labelFor: 'scheduler-s3-bucket', requiredLabel: true },
                                    _react2.default.createElement('input', { id: 'scheduler-s3-bucket', className: 'pt-input pt-intent-primary', type: 'text', placeholder: 'Amazon S3 Bucket', dir: 'auto', value: this.state.addTaskPath, onChange: this.addTaskPathChange.bind(this) })
                                ) || null,
                                _react2.default.createElement(
                                    _core.FormGroup,
                                    { helperText: 'Enter rule in Cron format', label: 'Rule', labelFor: 'scheduler-rule', requiredLabel: true },
                                    _react2.default.createElement('input', { id: 'scheduler-rule', className: 'pt-input pt-intent-primary', type: 'text', placeholder: 'Rule', dir: 'auto', value: this.state.addTaskRule, onChange: this.addTaskRuleChange.bind(this) })
                                ),
                                _react2.default.createElement(_core.Button, { text: 'Add task', intent: _core.Intent.PRIMARY, onClick: this.addTask.bind(this) })
                            )
                        ),
                        _react2.default.createElement(
                            'table',
                            { className: 'pt-html-table pt-interactive' },
                            _react2.default.createElement(
                                'thead',
                                null,
                                _react2.default.createElement(
                                    'tr',
                                    null,
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        'Database'
                                    ),
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        'Destination'
                                    ),
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        'Rule'
                                    ),
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        'Actions'
                                    )
                                )
                            ),
                            this.state.schedules ? _react2.default.createElement(
                                'tbody',
                                null,
                                this.state.schedules.map(function (schedule) {
                                    return _react2.default.createElement(
                                        'tr',
                                        null,
                                        _react2.default.createElement(
                                            'td',
                                            null,
                                            schedule.database.name
                                        ),
                                        _react2.default.createElement(
                                            'td',
                                            null,
                                            (schedule.destination.type == "local" && "Local: " || schedule.destination.type == "s3" && "Amazon S3: ") + schedule.destination.path
                                        ),
                                        _react2.default.createElement(
                                            'td',
                                            null,
                                            schedule.rule
                                        ),
                                        _react2.default.createElement(
                                            'td',
                                            null,
                                            _react2.default.createElement(_core.Button, { text: 'Delete', intent: _core.Intent.DANGER, onClick: that.removeTask.bind(that, schedule._id) })
                                        )
                                    );
                                })
                            ) : null
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'db-dashboard-item' },
                        _react2.default.createElement(
                            'h2',
                            null,
                            'Latest backups'
                        ),
                        _react2.default.createElement(
                            'table',
                            { className: 'pt-html-table pt-interactive' },
                            _react2.default.createElement(
                                'thead',
                                null,
                                _react2.default.createElement(
                                    'tr',
                                    null,
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        'Database'
                                    ),
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        'Destination'
                                    ),
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        'Time'
                                    ),
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        'Type'
                                    ),
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        'Status'
                                    ),
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        'Log'
                                    )
                                )
                            ),
                            this.state.backups ? _react2.default.createElement(
                                'tbody',
                                null,
                                this.state.backups.map(function (backup, index) {
                                    return _react2.default.createElement(
                                        'tr',
                                        null,
                                        _react2.default.createElement(
                                            'td',
                                            null,
                                            backup.database && backup.database.name || "Removed"
                                        ),
                                        _react2.default.createElement(
                                            'td',
                                            null,
                                            (backup.destination.type == "local" && "Local: " || backup.destination.type == "s3" && "Amazon S3: ") + backup.destination.path
                                        ),
                                        _react2.default.createElement(
                                            'td',
                                            null,
                                            new Date(backup.startDate).toLocaleString()
                                        ),
                                        _react2.default.createElement(
                                            'td',
                                            null,
                                            backup.type == "manual" && "Manual" || backup.type == "scheduled" && "Scheduled"
                                        ),
                                        _react2.default.createElement(
                                            'td',
                                            null,
                                            _react2.default.createElement(
                                                _core.Tag,
                                                { className: 'pt-minimal', intent: (backup.status == "queued" || backup.status == "progress") && _core.Intent.WARNING || backup.status == "finished" && _core.Intent.SUCCESS || backup.status == "failed" && _core.Intent.DANGER },
                                                backup.status == "queued" && "In queue" || backup.status == "progress" && "In progress" || backup.status == "finished" && "Finished" || backup.status == "failed" && "Failed"
                                            )
                                        ),
                                        _react2.default.createElement(
                                            'td',
                                            null,
                                            _react2.default.createElement(_core.Button, { text: 'Log', intent: _core.Intent.PRIMARY, onClick: that.openLog.bind(that, index) })
                                        )
                                    );
                                }),
                                that.state.logIndex != null ? _react2.default.createElement(
                                    _core.Dialog,
                                    {
                                        isOpen: that.state.isLogOpen,
                                        onClose: that.toggleLogOpen.bind(that),
                                        title: 'Backup log'
                                    },
                                    _react2.default.createElement(
                                        _core.TextArea,
                                        { readOnly: true, style: { height: "400px", margin: "15px 15px 0px 15px", resize: "none" } },
                                        that.state.backups[that.state.logIndex].log
                                    )
                                ) : null
                            ) : null
                        )
                    )
                );
            }
        }
    }]);

    return Dashboard;
}(_react2.default.Component);

exports.default = Dashboard;