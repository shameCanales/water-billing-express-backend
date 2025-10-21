// ✅ CONSUMERS
export const consumers = [
  {
    name: "Shame Canales",
    email: "shame@gmail.com",
    birthDate: "1990-05-15",
    mobileNumber: "09171234567",
    password: "shame123",
    address: "1538 San Rafael St., San Fernando",
    createdAt: "2023-01-10",
    status: "active", // suspended or active depending on active connections.
  },
];

export const connections = [
  {
    id: 1, // automated
    consumerId: 1, //tied to consumerId
    meterNumber: 201,
    address: "Campalingo, San Fernando",
    connectionDate: "2023-01-15",
    type: "residential", // residential | commercial
    status: "active", // active | disconnected
  },
];

export const bills = [
  {
    billId: 1,
    connectionId: 1, // tied to connection
    dateAdded: "2025-01-10", // date bill was generated
    monthOf: "January",
    dueDate: "2025-02-10",
    meterReading: 120.5, //current meter reading
    chargePerCubicMeter: 15.0, // from settings
    consumedUnits: 15.63, // meterReading - meterReading of last month
    amount: 234.5, // consumedUnits * chargePerUnit - do we need to store this?
    status: "paid", // "paid" | "unpaid" | "overdue"
  },
];

export const processors = [
  {
    processorId: 1,
    processorName: "John Doe",
    processorEmail: "johndoe@example.com",
    processorPassword: "staff123",
    role: "staff",
  },
  {
    processorId: 2,
    processorName: "Maria Santos",
    processorEmail: "maria.santos@example.com",
    processorPassword: "manager123",
    role: "manager",
  },
];

//future
export const issueReports = [
  {
    reportId: 1,
    consumerId: 1,
    connectionId: 1,
    description: "Leaking pipe near meter #201",
    status: "pending", // pending | taking_action | resolved
    createdAt: "2025-03-15",
  },
];

export const settings = {
  chargePerCubicMeter: 15.0,
  percentageLateFee: 0.02, // 2% late fee
};
