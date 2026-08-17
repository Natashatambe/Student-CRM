import { useState, useEffect } from "react";
import { ListFilter, Plus, CheckCircle2, Edit2, Trash2, Globe, Share2, Search, Smartphone, Users, Phone } from "lucide-react";
import Layout from "../../Components/layout/Layout";
import PageHeader from "../../Components/common/PageHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../../Components/ui/dialog";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Select } from "../../Components/ui/select";
import { Badge } from "../../Components/ui/badge";
import { Card } from "../../Components/ui/card";
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
      <PageHeader
        title="Lead Sources & Channels"
        description="Configure Meta, Website, Google, Instagram, College, Walk-in & Inbound acquisition lists."
        badgeText={`${sources.length} Channels`}
        primaryAction={
          <Button
            onClick={() => handleOpenModal(null)}
            className="bg-[#cc785c] hover:bg-[#a9583e] font-bold gap-2"
          >
            <Plus className="h-4 w-4" /> Add Lead Source
          </Button>
        }
      />

      <div className="space-y-6">
        {toast && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {toast.msg}
          </div>
        )}

        {/* Sources Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#6c6a64]">Loading acquisition channels...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((s) => (
              <Card key={s.id} className="p-5 space-y-3.5 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-[#cc785c]/15 text-[#cc785c] flex items-center justify-center font-bold">
                      {s.name === "Meta" ? <Share2 className="h-4.5 w-4.5" /> :
                       s.name === "Website" ? <Globe className="h-4.5 w-4.5" /> :
                       s.name === "Google" ? <Search className="h-4.5 w-4.5" /> :
                       s.name === "Instagram" ? <Smartphone className="h-4.5 w-4.5" /> :
                       s.name === "College" ? <Users className="h-4.5 w-4.5" /> :
                       <Phone className="h-4.5 w-4.5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#141413]">{s.name}</h4>
                      <p className="text-[10px] text-[#6c6a64] font-medium uppercase">Acquisition Channel</p>
                    </div>
                  </div>

                  <Badge variant="success">
                    {s.status || "Active"}
                  </Badge>
                </div>

                <p className="text-xs text-[#6c6a64] bg-[#faf9f5] p-3 rounded-xl border border-[#e6dfd8]">
                  {s.description || "Default lead collection channel."}
                </p>

                <div className="flex items-center justify-end gap-1.5 pt-2.5 border-t border-[#e6dfd8]">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenModal(s)}
                    className="h-7 w-7 p-0 border-[#e6dfd8]"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(s.id)}
                    className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-600 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Form using Shadcn Dialog */}
        {modalOpen && (
          <Dialog open={true} onOpenChange={(open) => !open && setModalOpen(false)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingSource ? "Edit Lead Source" : "Add New Lead Source"}</DialogTitle>
                <DialogDescription>Configure custom lead source name and acquisition notes</DialogDescription>
              </DialogHeader>

              <DialogBody>
                <form id="lead-source-form" onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block mb-1 font-semibold text-[#6c6a64]">Source Name</label>
                    <Input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. TikTok Ads or Campus Drive"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-[#6c6a64]">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g. Paid campaign leads from TikTok lead gen form..."
                      className="w-full px-3.5 py-2.5 bg-[#efe9de] border border-[#e6dfd8] rounded-xl text-xs text-[#141413] focus:outline-none focus:border-[#cc785c]"
                    />
                  </div>
                </form>
              </DialogBody>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" form="lead-source-form" className="bg-[#cc785c] hover:bg-[#a9583e] font-bold">
                  Save Source
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
