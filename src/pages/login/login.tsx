import { useState } from "react";
import { Form, Input, Button, Tabs, DatePicker, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const { TabPane } = Tabs;
const { Title } = Typography;
import { post, fetch } from "../../api/api-helper";
const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onFinishLogin = (values: { username: string; password: string }) => {
    post("/identity/auth/token", values, false, true)
      .then((res) => {
        if (
          res &&
          res.data.code === 1000 &&
          res.data.result.authenticated === true
        ) {
          const token = res.data.result.token;
          localStorage.setItem("ACCESS_TOKEN", token);

          // Gọi API thứ hai sau khi có token
          return fetch("/identity/users/my-info", null, false);
        } else {
          throw new Error("Authentication failed");
        }
      })
      .then((secondApiRes) => {
        if (secondApiRes && secondApiRes.data.code === 1000) {
          console.log("Response from second API:", secondApiRes.data);
          localStorage.setItem("USER_ID", secondApiRes.data.result.id);
        }
        toast.success("Đăng nhập thành công");
        navigate("/");
      })
      .catch((error) => {
        console.error("ERROR:", error);
        toast.error("Đăng nhập thất bại");
      });
  };

  const onFinishRegister = async (values: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    dob: any; // Để xử lý giá trị ngày tháng từ DatePicker
  }) => {
    const { username, password, firstName, lastName, dob } = values;
    const dobFormatted = dob ? dob.format("YYYY-MM-DD") : ""; // Chuyển đổi giá trị ngày tháng thành định dạng yyyy-mm-dd

    const data = {
      username,
      password,
      firstName,
      lastName,
      dob: dobFormatted,
    };

    post("/identity/users", data, false, true)
      .then((res) => {
        if (res && res.data.code === 1000) {
          toast.success("Đăng ký thành công");
        } else {
          throw new Error("Authentication failed");
        }
      })
      .catch((error) => {
        console.error("ERROR:", error);
        toast.error("Đăng nhập thất bại");
      });
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "url('https://wallpapersok.com/images/hd/light-blue-aesthetic-geometric-ipy4weuid1okvv7b.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          padding: 20,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 10,
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: 20 }}>
          HyperBook
        </Title>
        <Tabs defaultActiveKey="1" centered>
          <TabPane tab="Đăng nhập" key="1">
            <Form name="login" onFinish={onFinishLogin} layout="vertical">
              <Form.Item
                label="User Name"
                name="username"
                rules={
                  [
                    // { required: true, message: "Vui lòng nhập email!" },
                    // { type: "email", message: "Email không hợp lệ!" },
                  ]
                }
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Mật khẩu"
                name="password"
                //   rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="Đăng ký" key="2">
            <Form name="register" onFinish={onFinishRegister} layout="vertical">
              <Form.Item
                label="Tên đăng nhập"
                name="username"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                label="Họ"
                name="firstName"
                rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Tên"
                name="lastName"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Ngày sinh"
                name="dob"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sinh!" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  Đăng ký
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
