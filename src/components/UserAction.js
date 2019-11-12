import React, { useState } from 'react';
import { Menu, Dropdown, Avatar, Popover } from 'antd';
import { Link } from "react-router-dom";
import Login from './Login';

const menu = (
  <Menu>
    <Menu.Item>
      <Link to="/analysis">Analysis</Link>
    </Menu.Item>
    <Menu.Item>
      <Link to="/">Logout</Link>
    </Menu.Item>
  </Menu>
);

const UserAction = ({logged, setLogged}) => {
  const [beforeLog, AfterLog] = useState({
    visible: false,
  });

  const hide = () => {
    AfterLog({
      visible: false,
    });
  };

  const handleVisibleChange = visible => {
    AfterLog({ visible: visible });
  };
  const handleClick = e => {
    if(e.target.value === 'logout')
    setLogged(false);
    window.location.hash = '/'
  }
  return [
    logged ?
      <Dropdown overlay={menu} placement="bottomRight" onClick={handleClick}>
        <Avatar style={{ backgroundColor: '#87d068' }} icon="user" />
      </Dropdown> : <Popover
        placement="bottomRight"
        content={<Login hide={hide} setLogged={setLogged} />}
        trigger="click"
        visible={beforeLog.visible}
        onVisibleChange={handleVisibleChange}
      >
        <Avatar style={{ backgroundColor: '#f56a00' }} icon="login" />
      </Popover>
  ];
}

export default UserAction;
