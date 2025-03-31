import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Layout, Space, Typography, Row, Col, Divider } from "antd";
ChartJS.register(ArcElement, Tooltip, Legend, Title);
const { Content } = Layout;
const { Text } = Typography;
import { fetch } from "../../api/api-helper";
interface Product {
  id: string;
  name: string;
  description: string;
  img: string;
  shopId: string;
  availableQuantity: string;
  price: number;
}

const ProductChart: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const userId = localStorage.getItem("USER_ID");
  const getProducts = () => {
    fetch(`/product/${userId}`, null, false)
      .then((res) => {
        console.log(res);

        if (res) {
          setProducts(res?.data);
        }
      })
      .catch((e) => {
        console.log("ERROR GET LIST PRODUCT", e);
      });
  };

  useEffect(() => {
    getProducts();
  }, []);
  const data = {
    labels: products.map((product) => product.name), // Tên sản phẩm
    datasets: [
      {
        label: "Số lượng sản phẩm",
        data: products.map((product) => product.availableQuantity), // Số lượng sản phẩm
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  return (
    <Content
      style={{
        padding: 24,
        background: "white",
        borderRadius: 16,
        minHeight: 280,
        marginTop: 50,
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col>
          <Space>
            <Text style={{ fontSize: 18 }} strong>
              Thống kê sản phẩm
            </Text>
          </Space>
        </Col>
      </Row>
      <Divider />
      <div
        style={{
          marginTop: 24,
          width: "50%", // Đặt kích thước cố định (nhỏ hơn)
          height: "50%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Pie data={data} options={options} />
      </div>
    </Content>
  );
};

export default ProductChart;
