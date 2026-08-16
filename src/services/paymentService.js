import api from "./api";

const STORAGE_KEY = "crm_fallback_payments";

const DEFAULT_PAYMENTS = [
  {
    id: "TXN-9011",
    studentName: "Jonny Ive",
    studentEmail: "jonny@apple.com",
    courseName: "Java Full Stack",
    amount: 50000,
    method: "UPI / GPay",
    paymentMode: "UPI / GPay",
    status: "Completed",
    date: "2026-02-10",
  },
  {
    id: "TXN-9012",
    studentName: "Sarah Connor",
    studentEmail: "sarah@sky.net",
    courseName: "Python Masterclass",
    amount: 11667,
    method: "Credit Card",
    paymentMode: "Credit Card",
    status: "Completed",
    date: "2026-02-12",
  },
  {
    id: "TXN-9013",
    studentName: "Alex Rivera",
    studentEmail: "alex.rivera@tech.org",
    courseName: "React JS Track",
    amount: 30000,
    method: "Net Banking",
    paymentMode: "Net Banking",
    status: "Completed",
    date: "2026-02-14",
  },
];

const filterOutNatasha = (list) => {
  if (!Array.isArray(list)) return [];
  return list;
};

const getLocalPayments = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      const cleaned = filterOutNatasha(parsed);
      if (cleaned.length !== parsed.length) {
        saveLocalPayments(cleaned);
      }
      return cleaned;
    }
  } catch (e) {
    // Quietly fallback
  }
  return filterOutNatasha(DEFAULT_PAYMENTS);
};

const saveLocalPayments = (list) => {
  try {
    const cleaned = filterOutNatasha(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch (e) {
    // Quietly ignore
  }
};

// Get All Payments
export const getPayments = async () => {
  try {
    const res = await api.get("/payments");
    if (res && res.data) {
      let list = Array.isArray(res.data) ? res.data : (res.data.data || []);
      list = filterOutNatasha(list);
      saveLocalPayments(list);
      return { ...res, data: list };
    }
  } catch (error) {
    // Quietly use local store
  }
  return { data: getLocalPayments() };
};

// Get Payment By ID
export const getPaymentById = async (id) => {
  try {
    return await api.get(`/payments/${id}`);
  } catch (error) {
    const list = getLocalPayments();
    const found = list.find((p) => String(p.id) === String(id));
    return { data: found || list[0] };
  }
};

// Add Payment Receipt
export const addPayment = async (payment) => {
  const list = getLocalPayments();
  const newRecord = {
    ...payment,
    id: payment.id || `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
  };
  const updatedList = [newRecord, ...list.filter((p) => String(p.id) !== String(newRecord.id))];
  saveLocalPayments(updatedList);

  try {
    const res = await api.post("/payments", payment);
    if (res && res.data) return res;
  } catch (error) {
    // Quietly store locally
  }
  return { data: newRecord };
};

// Update Payment
export const updatePayment = async (id, payment) => {
  const list = getLocalPayments();
  const updatedList = list.map((p) => (String(p.id) === String(id) ? { ...p, ...payment } : p));
  saveLocalPayments(updatedList);

  try {
    const res = await api.put(`/payments/${id}`, payment);
    if (res && res.data) return res;
  } catch (error) {
    // Quietly update locally
  }
  return { data: payment };
};

// Delete Payment
export const deletePayment = async (id) => {
  const list = getLocalPayments();
  const updatedList = list.filter((p) => String(p.id) !== String(id));
  saveLocalPayments(updatedList);

  try {
    const res = await api.delete(`/payments/${id}`);
    if (res) return res;
  } catch (error) {
    // Quietly delete locally
  }
  return { data: { success: true } };
};
