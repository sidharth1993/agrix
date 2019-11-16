/* eslint-disable import/no-named-as-default */
import React, { useState } from "react";
import { Form, Icon, Input, Button, Alert } from 'antd';
import axios from 'axios';

function Login(props) {
  const [error, setError] = useState('');
  const handleSubmit = e => {
    e.preventDefault();
    let { REACT_APP_DOMAIN: domain, REACT_APP_LOGIN_PORT: port } = process.env;
    props.form.validateFields((err, values) => {
      if (!err) {
        axios.post(`${domain}:${port}/api/user/login`, values).then(res => {
          const { data } = res;
          if (data.status) {
            setError('');
            props.setLogged(true);
            props.updateLocation(data.data.location);
          } else
            setError(data.data);
        })
      }
    });
  };

  const { getFieldDecorator } = props.form;
  return (
    <Form onSubmit={handleSubmit} className="login-form">
      {error.length > 0 && <Form.Item>
        <Alert message={error} type="error" />
      </Form.Item>}
      <Form.Item>
        {getFieldDecorator('username', {
          rules: [{ required: true, message: 'Please input your username!' }],
        })(
          <Input
            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Username"
          />,
        )}
      </Form.Item>
      <Form.Item>
        {getFieldDecorator('password', {
          rules: [{ required: true, message: 'Please input your Password!' }],
        })(
          <Input
            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
            type="password"
            placeholder="Password"
          />,
        )}
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button">
          Log in
          </Button>
        <Button type="default" style={{ marginLeft: 20 }} onClick={props.hide}>
          Close
          </Button>
      </Form.Item>
    </Form>
  );

}


const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(Login);

export default (WrappedNormalLoginForm);

