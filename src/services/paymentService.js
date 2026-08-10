import api from "./api";

// Get All Payments
export const getPayments = async () => {
  return await api.get("/payments");
};

// Get Payment By ID
export const getPaymentById = async (id) => {
  return await api.get(`/payments/${id}`);
};

// Add Payment Receipt
export const addPayment = async (payment) => {
  return await api.post("/payments", payment);
};

// Update Payment
export const updatePayment = async (id, payment) => {
  return await api.put(`/payments/${id}`, payment);
};

// Delete Payment
export const deletePayment = async (id) => {
  return await api.delete(`/payments/${id}`);
};
