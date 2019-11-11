import React from 'react';
import { Layout } from 'antd';
import { Icon, Button, Divider, Menu, Dropdown, Avatar } from 'antd';
import { Link } from "react-router-dom";
import Logo from '../images/logo.png';
import { Typography } from 'antd';

const { Text } = Typography;
const { Header } = Layout;
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

const Head = ({toggleDraw, showDraw}) => {
  return [
    <Header style={{ backgroundColor: 'white' }} key='0'>
      <Button type="link" size='large' onClick={() => toggleDraw(!showDraw)}>
        <Icon type={showDraw ? "menu-fold" : "menu-unfold"} />
      </Button>
      <Link to='/'>
      <img src={Logo} height='32' alt='logo' />
      </Link>
      <Divider type='vertical' />
      <Text strong>Agri-X</Text>
      <span style={{ float: 'right' }}>
        <Button type="link" size='large'>
          <Icon type="bell" />
        </Button>
        <Dropdown overlay={menu} placement="bottomRight">
          <Avatar style={{ backgroundColor: '#87d068' }} icon="user" />
        </Dropdown>
      </span>
    </Header>,
      <div style={{height:3, backgroundImage: `linear-gradient(to right, #A33582, #17468B)`}} key='1'></div>
  ];
}

export default Head;
