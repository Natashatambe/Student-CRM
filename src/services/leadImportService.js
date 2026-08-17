import api from "./api";

export const uploadAndImportLeads = async (file, source = "Website", mapping = {}) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("source", source);
  formData.append("mapping", JSON.stringify(mapping));

  const res = await api.post("/leads/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const importLeads = uploadAndImportLeads;

