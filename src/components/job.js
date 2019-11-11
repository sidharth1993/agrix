import React from 'react';
import { Table, Input, Button, Icon, Progress, Divider, notification } from 'antd';
import Highlighter from 'react-highlight-words';
import { Link } from 'react-router-dom';
import DownloadDialog from './downloadDialog';

const data = [
    {
        key: '1',
        description: 'Telangana',
        name: 'John Brown',
        createdOn: '2019-11-1 11:10:10',
        completed: 100,
        status: 'Completed'
    },
    {
        key: '2',
        description: 'Tamil Nadu',
        name: 'Joe Black',
        createdOn: '2019-11-1 11:10:10',
        completed: 70,
        status: 'In Progress'
    },
    {
        key: '3',
        description: 'Karnataka',
        name: 'Jim Green',
        createdOn: '2019-11-11 11:10:10',
        completed: 20,
        status: 'In Progress'
    },
    {
        key: '4',
        description: 'Kerala',
        name: 'Jim Red',
        createdOn: '2019-11-19 11:10:10',
        completed: 90,
        status: 'In Progress'
    },
];

class Job extends React.Component {
    state = {
        searchText: '',
        download: false
    };

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        this.searchInput = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Button
                    type="primary"
                    onClick={() => this.handleSearch(selectedKeys, confirm)}
                    icon="search"
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                >
                    Search
        </Button>
                <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                    Reset
        </Button>
            </div>
        ),
        filterIcon: filtered => (
            <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
        render: text => (
            <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[this.state.searchText]}
                autoEscape
                textToHighlight={text.toString()}
            />
        ),
    });

    handleSearch = (selectedKeys, confirm) => {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
    };
    showDownload = (val) => {
        this.setState({ download: val });
    }
    openNotification = () => {
        notification.open({
            message: 'Mail Sent...',
            description:
                'A mail has been sent to your registered e-mail id. You may click on the link to view the details.',
            icon: <Icon type="mail" style={{ color: '#108ee9' }} />,
        });
    };
    render() {
        const columns = [
            {
                title: 'ID',
                dataIndex: 'key',
                key: 'key',
                width: '5%',
                sorter: (a, b) => a.key - b.key
            },
            {
                title: 'Department',
                dataIndex: 'description',
                key: 'description',
                width: '15%',
                ...this.getColumnSearchProps('description'),
                sorter: (a, b) => a.name - b.name
            },
            {
                title: 'Submitted By',
                dataIndex: 'name',
                key: 'name',
                width: '15%',
                ...this.getColumnSearchProps('name'),
                sorter: (a, b) => a.name - b.name
            },
            {
                title: 'Created On',
                dataIndex: 'createdOn',
                key: 'createdOn',
                sorter: (a, b) => a.createdOn - b.createdOn
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                ...this.getColumnSearchProps('status'),
                sorter: (a, b) => a.status - b.status

            },
            {
                title: 'Completed(%)',
                dataIndex: 'completed',
                key: 'completed',
                ...this.getColumnSearchProps('completed'),
                sorter: (a, b) => a.completed - b.completed,
                render: c => <Progress percent={c} status={c < 100 && "active"} />
            },
            {
                title: 'Actions',
                width: '15%',
                render: c => {
                    return c.status === 'Completed' ? <span>
                        <Link to='/'><Button type='link'><Icon type="eye" /></Button> </Link>
                        <Divider type='vertical' />
                        <Button type='link' onClick={() => this.showDownload(true)}><Icon type="download" /></Button>
                        <Divider type='vertical' />
                        <Button type='link'  onClick={this.openNotification}><Icon type="mail" /></Button>
                    </span> : <div style={{ textAlign: 'center' }}>--</div>
                }
            }
        ];
        return (
            <>
                <DownloadDialog open={this.state.download} close={this.showDownload} />
                <Table columns={columns} dataSource={data} />
            </>
        );
    }
}

export default Job;