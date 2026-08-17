import api from "./api";

export const getAllLeadSources = async () => {
  try {
    const res = await api.get("/lead-sources");
    return res.data;
  } catch (err) {
    console.error("Error fetching lead sources:", err);
    return {
      success: true,
      data: [
        { id: 1, name: "Meta", description: "Facebook & Instagram Ads", status: "Active" },
        { id: 2, name: "Website", description: "Organic Website Form", status: "Active" },
        { id: 3, name: "Google", description: "Google PPC Ads", status: "Active" },
        { id: 4, name: "Instagram", description: "Instagram DM / Bio", status: "Active" },
        { id: 5, name: "College", description: "College Seminars", status: "Active" },
        { id: 6, name: "Walk-in", description: "Direct Branch Walk-in", status: "Active" },
        { id: 7, name: "Inbound", description: "Inbound Call Enquiries", status: "Active" }
      ]
    };
  }
};

export const createLeadSource = async (data) => {
  const res = await api.post("/lead-sources", data);
  return res.data;
};

export const updateLeadSource = async (id, data) => {
  const res = await api.put(`/lead-sources/${id}`, data);
  return res.data;
};

export const deleteLeadSource = async (id) => {
  const res = await api.delete(`/lead-sources/${id}`);
  return res.data;
};

export const getLeadSources = getAllLeadSources;

