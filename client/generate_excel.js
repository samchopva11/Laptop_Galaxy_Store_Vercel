const XLSX = require('xlsx');

const data = [
  {
    name: "ASUS ROG Flow X13",
    price: 36990000,
    image: "https://images.unsplash.com/photo-1593642702821-c823b13eb295?w=500&q=80",
    category: "ASUS",
    countInStock: 8,
    description: "Laptop Gaming xoay gập 360 độ siêu nhẹ, kết hợp màn hình cảm ứng hỗ trợ đồ hoạ di động.",
    cpu: "AMD Ryzen 9 6900HS",
    ram: "16GB LPDDR5",
    gpu: "NVIDIA GeForce RTX 3050 Ti"
  },
  {
    name: "ASUS ProArt Studiobook 16 OLED",
    price: 65000000,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80",
    category: "ASUS",
    countInStock: 3,
    description: "Chiến thần sáng tạo ProArt với núm xoay vật lý Asus Dial độc quyền.",
    cpu: "Intel Core i9-13980HX",
    ram: "32GB DDR5",
    gpu: "NVIDIA GeForce RTX 4070 8GB"
  },
  {
    name: "ASUS ExpertBook B9",
    price: 32000000,
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&q=80",
    category: "ASUS",
    countInStock: 12,
    description: "Laptop doanh nhân đỉnh cao với khối lượng chưa tới 1kg, pin trâu vĩnh cửu.",
    cpu: "Intel Core i7-1255U",
    ram: "16GB LPDDR5",
    gpu: "Intel Iris Xe Graphics"
  },
  {
    name: "ASUS Zenbook Duo 14",
    price: 39000000,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&q=80",
    category: "ASUS",
    countInStock: 6,
    description: "Laptop hai màn hình độc đáo, nâng cao hiệu suất làm việc đa nhiệm.",
    cpu: "Intel Core i7-1165G7",
    ram: "16GB LPDDR4X",
    gpu: "NVIDIA GeForce MX450"
  },
  {
    name: "ASUS VivoBook 15X OLED",
    price: 15500000,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80",
    category: "ASUS",
    countInStock: 25,
    description: "Mẫu laptop màn hình OLED ngon nhất trong tầm giá phổ thông dành cho sinh viên.",
    cpu: "AMD Ryzen 5 5600H",
    ram: "8GB DDR4",
    gpu: "AMD Radeon Graphics"
  }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Products');
XLSX.writeFile(wb, '../asus_samples_2.xlsx');
