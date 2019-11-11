import React from 'react';
import { Breadcrumb, Icon, Layout } from 'antd';
import { Link } from "react-router-dom";
import windowDimensions  from 'react-window-dimensions';
import Job  from  './job';
const { Content } = Layout;

function Analysis({height}) {
    return (
        <Content style={{ padding: '10px 50px', backgroundColor:'#F0F2F5', height:`${height-67}px` }}>
            <Breadcrumb>
                <Breadcrumb.Item><Link to="/"><Icon type="home" size='large' /></Link></Breadcrumb.Item>
                <Breadcrumb.Item>Analysis</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ background: '#fff', padding: 24, minHeight: `${height-137}px`, marginTop:20 }}><Job/></div>
        </Content>
    )
}

export default windowDimensions()(Analysis);
