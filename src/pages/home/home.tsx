import React, { useState } from "react";
import { Layout, Menu, Avatar, Typography, Space } from "antd";
import {
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import Dashboard from "../dashboard/Dashboard";
import OrderManagement from "../order/Order";
import ProductManagement from "../product/Product";
import { post } from "../../api/api-helper";
const { Header, Sider, Content } = Layout;
const { Text } = Typography;
import { useNavigate } from "react-router-dom";
// Định nghĩa type cho Menu Item
interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const Home: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>("1");
  const navigate = useNavigate();
  const handleLogout = () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    post("/identity/auth/logout", { token: token }, false)
      .then((res) => {
        console.log(res);
        if (res.data.code === 1000) {
          localStorage.removeItem("ACCESS_TOKEN");
          localStorage.removeItem("USER_ID"); // Xóa token
          navigate("/login"); // Chuyển hướng về trang đăng nhập
        }
      })
      .catch((error) => {
        console.log("ERROR LOGOUT:", error);
      });
  };
  const menuItems: MenuItem[] = [
    {
      key: "1",
      label: "Dashboard",
      icon: <UserOutlined />,
      content: <Dashboard />,
    },
    {
      key: "2",
      label: "Orders",
      icon: <LaptopOutlined />,
      content: <OrderManagement />,
    },
    {
      key: "3",
      label: "Products",
      icon: <NotificationOutlined />,
      content: <ProductManagement />,
    },
  ];

  const handleMenuClick = (e: { key: string }): void => {
    setSelectedKey(e.key);
  };

  const selectedContent = menuItems.find(
    (item) => item.key === selectedKey
  )?.content;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Header
        style={{
          background: "#F5F5F5",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e8e8e8",
        }}
      >
        <Space>
          <Text strong style={{ fontSize: "16px", marginLeft: 24 }}>
            HYPERBOOK
          </Text>
        </Space>
        <Space>
          <Text strong style={{ fontSize: "16px" }}>
            USER
          </Text>
          <Avatar onClick={handleLogout} size="large" icon={<UserOutlined />} />
        </Space>
      </Header>

      {/* Main Layout */}
      <Layout>
        {/* Sidebar */}
        <Sider
          style={{ marginTop: 24 }}
          width={200}
          className="site-layout-background"
        >
          <Menu
            items={menuItems}
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            style={{ height: "100%", borderRight: 0, background: "#F5F5F5" }}
          ></Menu>
        </Sider>

        {/* Content */}
        <Layout style={{ padding: "24px" }}>
          <Content
            style={{
              background: "#F5F5F5",
              margin: 0,
              minHeight: 280,
            }}
          >
            {selectedContent}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Home;
