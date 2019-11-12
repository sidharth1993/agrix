/* eslint-disable import/no-named-as-default */
import React from "react";
import { Form, Icon, Input, Button } from 'antd';

function Login(props) {

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        setTimeout(() => {
          props.setLogged(true);
        }, 300);
      }
    });
  };

  const { getFieldDecorator } = props.form;
  return (
      <Form onSubmit={handleSubmit} className="login-form">
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

