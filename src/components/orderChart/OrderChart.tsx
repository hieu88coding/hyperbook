import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

import {
  Layout,
  Button,
  Dropdown,
  Space,
  Typography,
  Row,
  Col,
  MenuProps,
  Divider,
} from "antd";
import { Line, Bar } from "react-chartjs-2";
import { DownOutlined } from "@ant-design/icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);
import { fetch } from "../../api/api-helper";
const { Content } = Layout;
const { Text } = Typography;

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdDate: string;
  orderLines: Array<{
    id: number;
    productId: string;
    quantity: number;
  }>;
}
const OrderChart: React.FC = () => {
  // const [orders, setOrders] = useState<Order[]>([]);
  const [chartType, setChartType] = useState<string>("revenue");
  const [timeRange, setTimeRange] = useState<
    "day" | "yesterday" | "lastWeek" | "lastMonth" | "lastYear"
  >("day");
  const [revenueData, setRevenueData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [statusData, setStatusData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const userId = localStorage.getItem("USER_ID");
  // Các mốc thời gian
  const timeLabels = {
    day: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    yesterday: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    lastWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    lastMonth: Array.from({ length: 31 }, (_, i) => `${i + 1}`),
    lastYear: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  };

  const fetchChartData = async () => {
    console.log(chartType);
    console.log();

    // Múi giờ Việt Nam
    const timeZone = dayjs.tz.guess();
    const vietnamTime = dayjs();
    let startDate: dayjs.Dayjs;
    let endDate = null;
    switch (timeRange) {
      case "yesterday": // Hôm qua
        startDate = vietnamTime.subtract(1, "day").startOf("day");
        endDate = vietnamTime.subtract(1, "day").endOf("day");
        break;

      case "day": // Hôm nay
        startDate = vietnamTime.startOf("day");
        endDate = vietnamTime.endOf("day");
        break;

      case "lastWeek": // Tuần trước
        startDate = vietnamTime.subtract(1, "week").startOf("week");
        break;

      case "lastMonth": // Tháng trước
        startDate = vietnamTime.subtract(1, "month").startOf("month");
        break;

      case "lastYear": // Năm trước
        startDate = vietnamTime.subtract(1, "year").startOf("year");
        break;

      default:
        startDate = vietnamTime.clone();
    }
    fetch(
      "order/statistic/dashboard",
      {
        startDate: dayjs
          .utc(startDate)
          .tz(timeZone)
          .format("YYYY-MM-DDTHH:mm:ssZ"),
        endDate: dayjs
          .utc(endDate || vietnamTime)
          .tz(timeZone)
          .format("YYYY-MM-DDTHH:mm:ssZ"),
        shopId: userId,
      },
      false
    )
      .then((res) => {
        console.log(res);

        if (res) {
          const orders: Order[] = res.data;
          const labels = timeLabels[timeRange];
          if (chartType === "revenue") {
            const revenue = Array(labels.length).fill(0);
            orders.forEach((order) => {
              const date = new Date(order.createdDate);
              let index = 0;
              switch (timeRange) {
                case "day":
                  index = date.getHours();
                  break;
                case "yesterday":
                  index = date.getHours();
                  break;

                case "lastWeek":
                  index = date.getDay() - 1;
                  break;

                case "lastMonth":
                  index = date.getDate() - 1;
                  break;

                case "lastYear":
                  index = date.getMonth();
                  break;
                default:
                  break;
              }
              revenue[index] += order.totalAmount;
            });
            setRevenueData({
              labels: labels,
              datasets: [
                {
                  label: "Giá trị",
                  data: revenue,
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                },
              ],
            });
          } else if (chartType === "status") {
            const pending = Array(labels.length).fill(0);
            const success = Array(labels.length).fill(0);
            orders.forEach((order) => {
              const date = new Date(order.createdDate);
              let index = 0;
              switch (timeRange) {
                case "day":
                  index = date.getHours();
                  break;
                case "yesterday":
                  index = date.getHours();
                  break;

                case "lastWeek":
                  index = date.getDay() - 1;
                  break;

                case "lastMonth":
                  index = date.getDate() - 1;
                  break;

                case "lastYear":
                  index = date.getMonth();
                  break;
                default:
                  break;
              }
              if (order.status.toLowerCase() === "pending") {
                pending[index] += 1;
              } else if (order.status.toLowerCase() === "success") {
                success[index] += 1;
              }
            });
            setStatusData({
              labels: labels,
              datasets: [
                {
                  label: "Pending",
                  data: pending,
                  backgroundColor: "rgba(255, 99, 132, 0.5)",
                },
                {
                  label: "Success",
                  data: success,
                  backgroundColor: "rgba(54, 162, 235, 0.5)",
                },
              ],
            });
          }
        }
      })
      .catch((e) => {
        console.log("ERROR GET LIST ORDERS", e);
      });
  };

  useEffect(() => {
    fetchChartData();
  }, [chartType, timeRange]);

  const chartTypeItems: MenuProps["items"] = [
    { key: "revenue", label: "Giá trị" },
    { key: "status", label: "Trạng thái" },
  ];
  const chartTimeItems: MenuProps["items"] = [
    { key: "day", label: "Hôm nay" },
    { key: "yesterday", label: "Hôm qua" },
    { key: "lastWeek", label: "Tuần trước" },
    { key: "lastMonth", label: "Tháng trước" },
    { key: "lastYear", label: "Năm trước" },
  ];

  return (
    <Content
      style={{
        padding: 24,
        background: "white",
        borderRadius: 16,
        minHeight: 280,
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col>
          <Space>
            <Text style={{ fontSize: 18 }} strong>
              Thống kê đơn hàng
            </Text>
          </Space>
        </Col>
        <Col>
          <Space>
            <Dropdown
              menu={{
                items: chartTypeItems,
                onClick: (e) => setChartType(e.key),
              }}
            >
              <Button onClick={(e) => e.preventDefault()}>
                {chartType === "revenue" ? "Giá trị" : "Trạng thái"}{" "}
                <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        </Col>
        <Col>
          <Space>
            <Dropdown
              menu={{
                items: chartTimeItems,
                onClick: (e) => setTimeRange(e.key as any),
              }}
            >
              <Button onClick={(e) => e.preventDefault()}>
                {timeRange === "day"
                  ? "Hôm nay"
                  : timeRange === "yesterday"
                  ? "Hôm qua"
                  : timeRange === "lastWeek"
                  ? "Tuần trước"
                  : timeRange === "lastMonth"
                  ? "Tháng trước"
                  : "Năm trước"}{" "}
                <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        </Col>
      </Row>
      <Divider />
      <div style={{ marginTop: 24 }}>
        {chartType === "revenue" ? (
          <Line
            data={revenueData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Giá trị" },
              },
            }}
          />
        ) : (
          <Bar
            data={statusData || []}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Trạng thái đơn hàng" },
              },
            }}
          />
        )}
      </div>
    </Content>
  );
};

export default OrderChart;
