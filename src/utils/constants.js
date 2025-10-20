// ✅ CONSUMERS
export const consumers = [
  {
    consumerId: 1,
    name: "Shame Canales",
    email: "shame@gmail.com",
    password: "shame123",
    role: "consumer",
  },
  {
    consumerId: 2,
    name: "Alice Dela Cruz",
    email: "alice@gmail.com",
    password: "alice123",
    role: "consumer",
  },
  {
    consumerId: 3,
    name: "Mark Reyes",
    email: "mark@gmail.com",
    password: "mark123",
    role: "consumer",
  },
];

export const connections = [
  {
    connectionId: 1,
    consumerId: 1,
    address: "Campalingo, San Fernando",
    meterNumber: 201,
    type: "residential",
  },
  {
    connectionId: 2,
    consumerId: 1,
    address: "Barangay Mabini, San Fernando",
    meterNumber: 202,
    type: "commercial",
  },
  {
    connectionId: 3,
    consumerId: 2,
    address: "Poblacion, San Fernando",
    meterNumber: 301,
    type: "residential",
  },
  {
    connectionId: 4,
    consumerId: 3,
    address: "San Agustin, San Fernando",
    meterNumber: 401,
    type: "residential",
  },
];

export const bills = [
  {
    billId: 1,
    connectionId: 1,
    amount: 234.5,
    period: "January",
    dueDate: "2025-02-10",
    status: "paid", // "paid" | "unpaid" | "overdue"
  },
  {
    billId: 2,
    connectionId: 1,
    amount: 260.0,
    period: "February",
    dueDate: "2025-03-10",
    status: "unpaid",
  },
  {
    billId: 3,
    connectionId: 2,
    amount: 480.75,
    period: "January",
    dueDate: "2025-02-15",
    status: "paid",
  },
  {
    billId: 4,
    connectionId: 3,
    amount: 198.25,
    period: "February",
    dueDate: "2025-03-10",
    status: "overdue",
  },
  {
    billId: 5,
    connectionId: 4,
    amount: 325.0,
    period: "March",
    dueDate: "2025-04-10",
    status: "unpaid",
  },
];

export const processors = [
  {
    processorId: 1,
    name: "John Doe",
    username: "johndoe@1233",
    password: "staff123",
    role: "staff",
  },
  {
    processorId: 2,
    name: "Maria Santos",
    username: "maria.manager",
    password: "manager123",
    role: "manager",
  },
];

export const issueReports = [
  {
    reportId: 1,
    consumerId: 1,
    connectionId: 1,
    description: "Leaking pipe near meter #201",
    status: "pending", // pending | taking_action | resolved
    createdAt: "2025-03-15",
  },
  {
    reportId: 2,
    consumerId: 2,
    connectionId: 3,
    description: "No water supply for 2 days",
    status: "taking_action",
    createdAt: "2025-03-20",
  },
  {
    reportId: 3,
    consumerId: 3,
    connectionId: 4,
    description: "Meter malfunction detected",
    status: "resolved",
    createdAt: "2025-02-28",
  },
];
