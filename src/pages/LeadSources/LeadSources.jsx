import { useState, useEffect } from "react";
import { ListFilter, Plus, CheckCircle2, Edit2, Trash2, Globe, Share2, Search, Smartphone, Users, Phone } from "lucide-react";
import Layout from "../../Components/layout/Layout";
import { getLeadSources, createLeadSource, updateLeadSource, deleteLeadSource } from "../../services/leadSourceService";

export default function LeadSources() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active"
  });

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const res = await getLeadSources();
      if (res && res.data) {
        setSources(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (src = null) => {
    if (src) {
      setEditingSource(src);
      setFormData({
        name: src.name || "",
        description: src.description || "",
        status: src.status || "Active"
      });
    } else {
      setEditingSource(null);
      setFormData({
        name: "",
        description: "",
        status: "Active"
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSource) {
        await updateLeadSource(editingSource.id, formData);
        showToast("Lead source updated successfully");
      } else {
        await createLeadSource(formData);
        showToast("New lead source created successfully");
      }
      setModalOpen(false);
      fetchSources();
    } catch (err) {
      showToast("Error saving lead source", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead source?")) return;
    try {
      await deleteLeadSource(id);
      showToast("Lead source deleted");
      fetchSources();
    } catch (err) {
      showToast("Failed to delete lead source", "error");
    }
  };

  return (
    <Layout>
      <div className="space-y-6 text-[#faf9f5]">
        {toast && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-900/40 text-emerald-200 border border-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {toast.msg}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between bg-[#1f1e1b] border border-[#252320] p-4 rounded-2xl gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#cc785c]/15 text-[#cc785c] flex items-center justify-center">
              <ListFilter className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-serif-display font-semibold">Manage Lead Sources & Acquisition Channels</h3>
              <p className="text-xs text-[#a09d96]">Configure Meta, Website, Google, Instagram, College, Walk-in & Inbound channels</p>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal(null)}
            className="px-4 py-2.5 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition"
          >
            <Plus className="h-4 w-4" /> Add Lead Source
          </button>
        </div>

        {/* Sources Grid */}
        {loading ? (
          <div className="p-8 text-center text-xs text-[#a09d96]">Loading lead sources...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((s) => (
              <div key={s.id} className="bg-[#1f1e1b] border border-[#252320] p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#cc785c]/15 text-[#cc785c] flex items-center justify-center">
                      {s.name === "Meta" ? <Share2 className="h-4 w-4" /> :
                       s.name === "Website" ? <Globe className="h-4 w-4" /> :
                       s.name === "Google" ? <Search className="h-4 w-4" /> :
                       s.name === "Instagram" ? <Smartphone className="h-4 w-4" /> :
                       s.name === "College" ? <Users className="h-4 w-4" /> :
                       <Phone className="h-4 w-4" />}
                    </div>
                    <h4 className="font-bold text-sm text-[#faf9f5]">{s.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {s.status || "Active"}
                  </span>
                </div>

                <p className="text-xs text-[#a09d96]">{s.description || "Acquisition channel"}</p>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#252320]">
                  <button
                    onClick={() => handleOpenModal(s)}
                    className="p-1.5 rounded-lg bg-[#252320] text-[#faf9f5] hover:bg-[#322f2b]"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 rounded-lg bg-[#252320] text-rose-400 hover:bg-rose-600 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1f1e1b] border border-[#322f2b] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-[#faf9f5]">
              <div className="flex justify-between items-center border-b border-[#252320] pb-3">
                <h3 className="text-base font-serif-display font-semibold">
                  {editingSource ? "Edit Lead Source" : "Add New Lead Source"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-[#a09d96] text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block mb-1 text-[#a09d96]">Source Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. TikTok Ads or Campus Drive"
                    className="w-full px-3 py-2 bg-[#181715] border border-[#322f2b] rounded-xl text-xs text-[#faf9f5] focus:outline-none focus:border-[#cc785c]"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[#a09d96]">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Paid campaign leads from TikTok lead gen form"
                    className="w-full px-3 py-2 bg-[#181715] border border-[#322f2b] rounded-xl text-xs text-[#faf9f5] focus:outline-none focus:border-[#cc785c]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#252320]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-[#252320] text-[#faf9f5] rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#cc785c] text-white rounded-xl text-xs font-bold"
                  >
                    Save Source
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
