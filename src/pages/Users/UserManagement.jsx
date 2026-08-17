import { useState, useEffect } from "react";
import { UserCheck, Plus, Phone, Mail, CheckCircle2, XCircle, Search, Edit2, Trash2 } from "lucide-react";
import Layout from "../../Components/layout/Layout";
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
        showToast("User updated successfully");
      } else {
        await createUser(formData);
        showToast("New user created successfully");
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
      showToast("User status updated");
      fetchUsers();
    } catch (err) {
      showToast("Failed to change user status", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      showToast("User deleted");
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
      <div className="space-y-6 text-[#faf9f5]">
        {toast && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-900/40 text-emerald-200 border border-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {toast.msg}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between bg-[#1f1e1b] border border-[#252320] p-4 rounded-2xl gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#cc785c]/15 text-[#cc785c] flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-serif-display font-semibold">User & Staff Management</h3>
              <p className="text-xs text-[#a09d96]">Manage Admin & Counsellor system accounts and access status</p>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal(null)}
            className="px-4 py-2.5 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition"
          >
            <Plus className="h-4 w-4" /> Add New User / Counsellor
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-[#1f1e1b] border border-[#252320] px-3.5 py-2 rounded-xl text-xs">
          <Search className="h-4 w-4 text-[#a09d96]" />
          <input
            type="text"
            placeholder="Search users by name, username, email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-[#faf9f5] focus:outline-none w-full placeholder-[#a09d96]"
          />
        </div>

        {/* User Cards Grid */}
        {loading ? (
          <div className="p-8 text-center text-xs text-[#a09d96]">Loading system users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#a09d96]">No users found matching search.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => {
              const isAdmin = u.role === "ROLE_ADMIN" || u.role === "ADMIN";
              const isActive = (u.status || "Active").toLowerCase() === "active";

              return (
                <div key={u.id || u.userId} className="bg-[#1f1e1b] border border-[#252320] p-5 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#faf9f5]">{u.name || u.username}</h4>
                      <p className="text-[11px] text-[#a09d96]">@{u.username}</p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isAdmin
                          ? "bg-[#cc785c]/20 text-[#cc785c] border-[#cc785c]/30"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      }`}
                    >
                      {isAdmin ? "Admin" : "Counsellor"}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-[#a09d96]">
                    <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[#cc785c]" /> {u.email || "No email"}</p>
                    <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[#5db8a6]" /> {u.phone || "+91 9809890898"}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#252320]">
                    <button
                      onClick={() => handleToggleStatus(u.id || u.userId)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border ${
                        isActive
                          ? "bg-emerald-950/40 text-emerald-300 border-emerald-800"
                          : "bg-rose-950/40 text-rose-300 border-rose-800"
                      }`}
                    >
                      {isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {isActive ? "Active" : "Inactive"}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenModal(u)}
                        className="p-1.5 rounded-lg bg-[#252320] text-[#faf9f5] hover:bg-[#322f2b]"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id || u.userId)}
                        className="p-1.5 rounded-lg bg-[#252320] text-rose-400 hover:bg-rose-600 hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Form */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1f1e1b] border border-[#322f2b] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-[#faf9f5]">
              <div className="flex justify-between items-center border-b border-[#252320] pb-3">
                <h3 className="text-base font-serif-display font-semibold">
                  {editingUser ? "Edit User Account" : "Create New User"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-[#a09d96] text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block mb-1 text-[#a09d96]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Counsellor"
                    className="w-full px-3 py-2 bg-[#181715] border border-[#322f2b] rounded-xl text-xs text-[#faf9f5] focus:outline-none focus:border-[#cc785c]"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[#a09d96]">Username</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. counselor1"
                    className="w-full px-3 py-2 bg-[#181715] border border-[#322f2b] rounded-xl text-xs text-[#faf9f5] focus:outline-none focus:border-[#cc785c] disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 text-[#a09d96]">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="user@crm.com"
                      className="w-full px-3 py-2 bg-[#181715] border border-[#322f2b] rounded-xl text-xs text-[#faf9f5] focus:outline-none focus:border-[#cc785c]"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[#a09d96]">Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 9809890898"
                      className="w-full px-3 py-2 bg-[#181715] border border-[#322f2b] rounded-xl text-xs text-[#faf9f5] focus:outline-none focus:border-[#cc785c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-[#a09d96]">Password {editingUser && "(Leave blank to keep unchanged)"}</label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#181715] border border-[#322f2b] rounded-xl text-xs text-[#faf9f5] focus:outline-none focus:border-[#cc785c]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 text-[#a09d96]">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 bg-[#181715] border border-[#322f2b] rounded-xl text-xs text-[#faf9f5] focus:outline-none focus:border-[#cc785c]"
                    >
                      <option value="ROLE_COUNSELLOR">Counsellor</option>
                      <option value="ROLE_ADMIN">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-[#a09d96]">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-[#181715] border border-[#322f2b] rounded-xl text-xs text-[#faf9f5] focus:outline-none focus:border-[#cc785c]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
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
                    Save User
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
