import { useState, useEffect } from "react";
import { UserCheck, Plus, Phone, Mail, CheckCircle2, Search, Edit2, Trash2, Power } from "lucide-react";
import Layout from "../../Components/layout/Layout";
import PageHeader from "../../Components/common/PageHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../../Components/ui/dialog";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Select } from "../../Components/ui/select";
import { Badge } from "../../Components/ui/badge";
import { Card } from "../../Components/ui/card";
import { getUsers, createUser, updateUser, toggleUserStatus, deleteUser } from "../../services/userService";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "ROLE_COUNSELLOR",
    status: "Active"
  });

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      if (res && res.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.data || [];
        setUsers(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        role: user.role || "ROLE_COUNSELLOR",
        status: user.status || "Active"
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        role: "ROLE_COUNSELLOR",
        status: "Active"
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id || editingUser.userId, formData);
        showToast("User profile updated successfully");
      } else {
        await createUser(formData);
        showToast("New staff user created successfully");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      showToast("Error saving user profile", "error");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleUserStatus(id);
      showToast("User access status updated");
      fetchUsers();
    } catch (err) {
      showToast("Failed to change user status", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user account?")) return;
    try {
      await deleteUser(id);
      showToast("User account deleted");
      fetchUsers();
    } catch (err) {
      showToast("Failed to delete user", "error");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  return (
    <Layout>
      <PageHeader
        title="User & Staff Management"
        description="Manage Admin and Counsellor credentials, active system status, and role privileges."
        badgeText={`${users.length} Active Accounts`}
        primaryAction={
          <Button
            onClick={() => handleOpenModal(null)}
            className="bg-[#cc785c] hover:bg-[#a9583e] font-bold gap-2"
          >
            <Plus className="h-4 w-4" /> Add New User / Counsellor
          </Button>
        }
      />

      <div className="space-y-6">
        {toast && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {toast.msg}
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-[#efe9de] border border-[#e6dfd8] px-4 py-2.5 rounded-2xl text-xs">
          <Search className="h-4 w-4 text-[#6c6a64]" />
          <input
            type="text"
            placeholder="Search staff users by name, username, email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-[#141413] focus:outline-none w-full placeholder-[#6c6a64]"
          />
        </div>

        {/* User Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#6c6a64]">Loading staff directory...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-[#efe9de] border border-[#e6dfd8] p-12 rounded-2xl text-center text-xs text-[#6c6a64]">
            No user accounts found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => {
              const isAdmin = u.role === "ROLE_ADMIN" || u.role === "ADMIN";
              const isActive = (u.status || "Active").toLowerCase() === "active";

              return (
                <Card key={u.id || u.userId} className="p-5 space-y-3.5 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#141413]">{u.name || u.username}</h4>
                      <p className="text-xs text-[#6c6a64]">@{u.username}</p>
                    </div>

                    <Badge variant={isAdmin ? "default" : "secondary"}>
                      {isAdmin ? "Admin" : "Counsellor"}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#6c6a64] bg-[#faf9f5] p-3 rounded-xl border border-[#e6dfd8]">
                    <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-[#cc785c]" /> {u.email || "No email"}</p>
                    <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-[#5db8a6]" /> {u.phone || "+91 9809890898"}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-[#e6dfd8]">
                    <Button
                      size="sm"
                      variant={isActive ? "success" : "destructive"}
                      onClick={() => handleToggleStatus(u.id || u.userId)}
                      className="h-7 text-[10px] gap-1"
                    >
                      <Power className="h-3 w-3" />
                      {isActive ? "Active" : "Inactive"}
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenModal(u)}
                        className="h-7 w-7 p-0 border-[#e6dfd8]"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(u.id || u.userId)}
                        className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-600 hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* User Form Modal using Shadcn Dialog */}
        {modalOpen && (
          <Dialog open={true} onOpenChange={(open) => !open && setModalOpen(false)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingUser ? "Edit User Account" : "Create New User"}</DialogTitle>
                <DialogDescription>Configure user credentials, role permissions, and access status</DialogDescription>
              </DialogHeader>

              <DialogBody>
                <form id="user-management-form" onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block mb-1 font-semibold text-[#6c6a64]">Full Name</label>
                    <Input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sarah Counsellor"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-[#6c6a64]">Username</label>
                    <Input
                      type="text"
                      required
                      disabled={!!editingUser}
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="e.g. counselor1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block mb-1 font-semibold text-[#6c6a64]">Email Address</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="user@crm.com"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold text-[#6c6a64]">Phone</label>
                      <Input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 9809890898"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-[#6c6a64]">Password {editingUser && "(Leave blank to keep unchanged)"}</label>
                    <Input
                      type="password"
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block mb-1 font-semibold text-[#6c6a64]">Role Privileges</label>
                      <Select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="ROLE_COUNSELLOR">Counsellor Desk</option>
                        <option value="ROLE_ADMIN">System Admin</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold text-[#6c6a64]">Account Status</label>
                      <Select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </Select>
                    </div>
                  </div>
                </form>
              </DialogBody>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" form="user-management-form" className="bg-[#cc785c] hover:bg-[#a9583e] font-bold">
                  Save User Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
