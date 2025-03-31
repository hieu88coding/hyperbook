import React, { useState, useEffect } from "react";
import { Table, Select, DatePicker, Space, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);
const { RangePicker } = DatePicker;
const { Option } = Select;
import { fetch } from "../../api/api-helper";
import { useNavigate } from "react-router-dom";
interface Order {
  id: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  orderLines: { id: number; productId: string; quantity: number }[];
  createdDate: string;
  lastModifiedDate: string;
}

interface Pageable {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pageable, setPageable] = useState<Pageable | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<null | (Dayjs | null)[]>(null);
  const userId = localStorage.getItem("USER_ID") || null;
  const navigate = useNavigate();
  const fetchOrders = async (page: number = 0, size: number = 10) => {
    setLoading(true);
    if (!userId) {
      navigate("/login");
    }
    const params: any = {
      page,
      size,
      ...(statusFilter && { status: statusFilter }),
      ...(dateRange &&
        dateRange[0] &&
        dateRange[1] && {
          startDate: dateRange[0]?.format("YYYY-MM-DDTHH:mm:ssZ"),
          endDate: dateRange[1]?.format("YYYY-MM-DDTHH:mm:ssZ"),
        }),
      shopId: userId,
    };
    fetch("/order/filter", params, false)
      .then((res) => {
        console.log(res);

        if (res) {
          setOrders(res.data.content);
          setPageable({
            pageNumber: res.data.pageable.pageNumber + 1,
            pageSize: res.data.pageable.pageSize,
            totalElements: res.data.totalElements,
            totalPages: res.data.totalPages,
          });
          setLoading(false);
        }
      })
      .catch((e) => {
        console.log("ERROR GET LIST ORDER", e);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateRange]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleDateRangeChange = (dates: null | (Dayjs | null)[]) => {
    setDateRange(dates);
  };

  const handleTableChange = (pagination: any) => {
    fetchOrders(pagination.current - 1, pagination.pageSize);
  };

  const columns: ColumnsType<Order> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <Typography.Text copyable>{text}</Typography.Text>,
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => `${amount.toFixed(2)} USD`,
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = status === "success" ? "green" : "orange";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
      // sorter: (a, b) =>
      //   dayjs(a.createdDate).unix() - dayjs(b.createdDate).unix(),
      // defaultSortOrder: "descend",
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Filter by Status"
          style={{ width: 200 }}
          allowClear
          onChange={handleStatusChange}
        >
          <Option value="pending">Pending</Option>
          <Option value="success">Success</Option>
        </Select>
        <RangePicker showTime onChange={handleDateRangeChange} />
      </Space>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey={(record) => record.id}
        pagination={{
          current: pageable?.pageNumber ?? 0,
          pageSize: pageable?.pageSize ?? 10,
          total: pageable?.totalElements ?? 0,
        }}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default OrderManagement;
