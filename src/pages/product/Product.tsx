import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Popconfirm,
} from "antd";
interface Product {
  id: string;
  name: string;
  description: string;
  img: string;
  shopId: string;
  availableQuantity: number;
  price: number;
}
import { fetch, post, put, deletes } from "../../api/api-helper";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const ProductManagement: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const userId = localStorage.getItem("USER_ID") || null;
  // Fetch products from API (without pagination from backend)
  const fetchProducts = () => {
    setLoading(true);
    if (userId) {
      fetch(`/product/${userId}`, null, false)
        .then((res) => {
          console.log(res);

          if (res) {
            setProducts(res.data); // Set all products in the state
            setPagination((prev) => ({
              ...prev,
              total: res.data.length, // Total number of products for pagination
            }));
            setLoading(false);
          }
        })
        .catch((e) => {
          console.log("ERROR GET LIST PRODUCT", e);
        });
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  useEffect(() => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = pagination.current * pagination.pageSize;
    setPaginatedProducts(products.slice(startIndex, endIndex));
  }, [products, pagination]);
  // Open modal to add or edit product
  const openModal = (product: Product | null = null) => {
    setEditingProduct(product);
    form.setFieldsValue(
      product || {
        name: "",
        description: "",
        img: "",
        price: 0,
        availableQuantity: 0,
      }
    );
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    form.resetFields();
  };

  // Handle form submit
  const handleSubmit = async (values: any) => {
    console.log(values);
    console.log(editingProduct);
    let editItem = {
      id: editingProduct?.id,
      name: values.name,
      description: values.description,
      img: values.img,
      availableQuantity: values.availableQuantity,
      price: values.price,
      shopId: userId,
    };
    let addItem = {
      // id:editingProduct?.id,
      name: values.name,
      description: values.description,
      img: values.img,
      availableQuantity: values.availableQuantity,
      price: values.price,
      shopId: userId,
    };
    if (editingProduct) {
      // Update product
      await put(`/product/${editingProduct?.id}`, editItem, false)
        .then((res) => {
          console.log(res);

          toast.success("Cập nhật sản phẩm thành công");
        })
        .catch((e) => {
          console.log("ERROR PUT LIST PRODUCT", e);
        });
    } else {
      // Add new product
      await post(`/product`, addItem, true)
        .then((res) => {
          console.log(res);

          toast.success("Thêm mới sản phẩm thành công");
        })
        .catch((e) => {
          console.log("ERROR CREATE LIST PRODUCT", e);
        });
    }
    fetchProducts();
    closeModal();
  };

  // Handle delete product
  const handleDelete = async (id: String) => {
    await deletes(`/product/${id}`, null, false)
      .then((res) => {
        console.log(res);

        toast.success("Xóa sản phẩm thành công");
      })
      .catch((e) => {
        console.log("ERROR DELETE LIST PRODUCT", e);
      });
    fetchProducts(); // Refresh the product list
  };

  // Handle table change (pagination)
  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
  };

  // Pagination logic
  //   const paginatedProducts = products.slice(
  //     (pagination.current - 1) * pagination.pageSize,
  //     pagination.current * pagination.pageSize
  //   );

  const columns = [
    {
      title: "Ảnh sản phẩm",
      dataIndex: "img", // Trường chứa đường dẫn ảnh
      key: "img",
      render: (img: string) => (
        <img
          src={
            img && img.length !== 0
              ? img
              : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT58P55blSKZmf2_LdBoU7jETl6OiB2sjYy9A&s"
          } // Link ảnh mặc định nếu không có
          alt="Product"
          style={{ width: "100px", height: "100px", objectFit: "cover" }} // Kiểm soát kích thước ảnh
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Số lượng",
      dataIndex: "availableQuantity",
      key: "availableQuantity",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: Product) => (
        <Space>
          <Button type="primary" onClick={() => openModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="primary" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => openModal()}
      >
        Thêm sản phẩm
      </Button>
      <Table
        dataSource={paginatedProducts}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "15", "20"],
        }}
        onChange={handleTableChange}
      />
      <Modal
        title={editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="img"
            label="Link ảnh"
            //rules={[{ required: false, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true, message: "Vui lòng nhập giá sản phẩm!" }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="availableQuantity"
            label="Số lượng"
            rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;
