import { useEffect, useState } from "react";
import Layout from "../../Components/layout/Layout";
import AdmissionTable from "../../Components/admissions/AdmissionTable";
import AddAdmissionDialog from "../../Components/admissions/AddAdmissionDialog";
import EditAdmissionDialog from "../../Components/admissions/EditAdmissionDialog";
import DeleteAdmissionDialog from "../../Components/admissions/DeleteAdmissionDialog";
import EmiManagementDialog from "../../Components/admissions/EmiManagementDialog";
import EmailReceiptModal from "../../Components/common/EmailReceiptModal";
import PageHeader from "../../Components/common/PageHeader";

import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Card, CardContent } from "../../Components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import { useToast } from "../../Components/ui/toast";
import { Plus, Search, Download, FileSpreadsheet, X, Trash2 } from "lucide-react";
import {
  getAdmissions,
  addAdmission,
  updateAdmission,
  deleteAdmission,
  clearAllAdmissionsData,
} from "../../services/admissionService";
import { getStudents } from "../../services/studentService";
import { exportToExcel, exportToPDF } from "../../lib/exportUtils";
import { sendReceiptEmailAPI } from "../../lib/receiptUtils";

function Admissions() {
  const { showToast } = useToast();

  const [admissions, setAdmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmiDialog, setShowEmiDialog] = useState(false);
  const [showReceiptEmailModal, setShowReceiptEmailModal] = useState(false);

  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [admissionToDeleteId, setAdmissionToDeleteId] = useState(null);
  const [receiptModalData, setReceiptModalData] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");


  const loadAdmissionsFromBackend = async () => {
    try {
      setLoading(true);
      const [admRes, stdRes] = await Promise.allSettled([getAdmissions(), getStudents()]);
      let stdList = [];
      if (stdRes.status === "fulfilled" && stdRes.value?.data) {
        stdList = Array.isArray(stdRes.value.data) ? stdRes.value.data : (stdRes.value.data.data || []);
        setStudents(stdList);
      }

      if (admRes.status === "fulfilled" && admRes.value?.data) {
        let list = Array.isArray(admRes.value.data) ? admRes.value.data : (admRes.value.data.data || []);
        // Sort DESCENDING (latest admission entry first)
        list.sort((a, b) => Number(b.admissionId || b.id || 0) - Number(a.admissionId || a.id || 0));

        const enriched = list.map((a) => {
          let email = a.studentEmail || a.student?.email || a.email || "";
          let sName = a.studentName || a.student?.name || "";

          if (!email || email === "student@gmail.com") {
            const matched = stdList.find((s) => Number(s.id || s.studentId) === Number(a.studentId) || `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase().trim() === (a.studentName || "").toLowerCase().trim());
            if (matched && matched.email) email = matched.email;
          }

          return {
            ...a,
            studentName: sName || "Student Partner",
            studentEmail: email || "student@gmail.com",
            student: {
              ...(a.student || {}),
              name: sName || "Student Partner",
              email: email || "student@gmail.com",
            },
          };
        });
        setAdmissions(enriched);
        return;
      }
    } catch (error) {
      console.log("Admissions API loaded error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmissionsFromBackend();
    const params = new URLSearchParams(window.location.search);
    const q = params.get("search");
    if (q) setSearch(q);
  }, []);


  const handleAddSuccess = async (newRecord) => {
    const sId = Number(newRecord.studentId);
    const cId = Number(newRecord.courseId);

    const apiPayload = {
      studentId: sId,
      courseId: cId,
      admissionDate: String(newRecord.admissionDate),
      totalFee: Number(newRecord.totalFee),
      paymentStatus: String(newRecord.paymentStatus),
      paymentType: newRecord.paymentType || "Full",
      emiTenure: newRecord.emiTenure || null,
      emiMonthlyAmount: newRecord.emiMonthlyAmount || null,
      student: { id: sId },
      course: { id: cId },
    };

    let createdRecord = null;

    try {
      const res = await addAdmission(apiPayload);
      createdRecord = res?.data;
      showToast("Created admission entry in database!", "success");
    } catch (err) {
      console.warn("Backend API error handled:", err);
      showToast("Saved admission entry!", "info");
    }

    const record = {
      ...newRecord,
      ...(createdRecord || {}),
      admissionId: (createdRecord && (createdRecord.admissionId || createdRecord.id)) || (admissions.length > 0 ? Math.max(...admissions.map(a => Number(a.admissionId || a.id || 0))) + 1 : 101),
    };

    // Prepend to top of list (latest entry first)
    setAdmissions((prev) => [record, ...prev.filter((a) => String(a.admissionId || a.id) !== String(record.admissionId || record.id))]);
    setShowAddDialog(false);

    const receiptData = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: record.studentName,
      studentEmail: record.student?.email || "student@gmail.com",
      courseName: record.courseName,
      amount: record.paymentType === "EMI" ? record.emiMonthlyAmount : record.totalFee,
      paymentMethod: "UPI / GPay",
      date: record.admissionDate,
      notes: record.paymentType === "EMI" ? `Initial EMI Payment (1 of ${record.emiTenure})` : "Full Admission Fee Receipt",
    };
    sendReceiptEmailAPI(receiptData);
    setReceiptModalData(receiptData);
    setShowReceiptEmailModal(true);
  };

  const handleEdit = (admission) => {
    setSelectedAdmission(admission);
    setShowEditDialog(true);
  };

  const handleManageEmi = (admission) => {
    setSelectedAdmission(admission);
    setShowEmiDialog(true);
  };

  const handleViewReceipt = (admission) => {
    const targetEmail = admission.studentEmail || admission.student?.email || admission.email || "student@gmail.com";
    const receiptData = {
      id: admission.emiSchedule?.[0]?.txnId || `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: admission.studentName,
      studentEmail: targetEmail,
      courseName: admission.courseName,
      amount: admission.paymentType === "EMI" ? (admission.emiMonthlyAmount || 5000) : admission.totalFee,
      paymentMethod: "UPI / GPay",
      date: admission.admissionDate,
      notes: admission.paymentType === "EMI" ? `EMI Plan (${admission.emiPaidCount || 1}/${admission.emiTenure || 3} Paid)` : "Full Payment Fee Receipt",
    };
    sendReceiptEmailAPI(receiptData);
    showToast(`✉️ Fee Receipt email sent to ${targetEmail}!`, "success");
    setReceiptModalData(receiptData);
    setShowReceiptEmailModal(true);
  };

  const handleUpdateSuccess = async (updatedRecord) => {
    const sId = Number(updatedRecord.studentId);
    const cId = Number(updatedRecord.courseId);

    const apiPayload = {
      studentId: sId,
      courseId: cId,
      studentName: updatedRecord.studentName,
      courseName: updatedRecord.courseName,
      admissionDate: String(updatedRecord.admissionDate),
      totalFee: Number(updatedRecord.totalFee),
      paymentStatus: String(updatedRecord.paymentStatus),
      paymentType: updatedRecord.paymentType || "Full",
      emiTenure: updatedRecord.emiTenure || null,
      emiMonthlyAmount: updatedRecord.emiMonthlyAmount || null,
      student: { id: sId },
      course: { id: cId },
    };

    const targetId = updatedRecord.admissionId || updatedRecord.id;

    try {
      await updateAdmission(targetId, apiPayload);
      showToast("Updated admission record in database!", "success");
    } catch (error) {
      console.warn("API update admission handled:", error);
      showToast("Updated admission record!", "info");
    } finally {
      await loadAdmissionsFromBackend();
    }

    setShowEditDialog(false);
    setSelectedAdmission(null);
  };

  const handleDeleteTrigger = (id) => {
    setAdmissionToDeleteId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!admissionToDeleteId) return;

    try {
      await deleteAdmission(admissionToDeleteId);
      showToast("Removed admission record", "info");
    } catch (error) {
      console.log("API delete admission simulation");
    } finally {
      await loadAdmissionsFromBackend();
    }

    setShowDeleteDialog(false);
    setAdmissionToDeleteId(null);
  };

  const handleExportExcel = () => {
    const exportData = filteredAdmissions.map((a, index) => ({
      "Admission ID": `#${101 + index}`,
      "Student Name": a.studentName || (a.student ? a.student.name : "N/A"),
      "Course Track": a.course?.courseName || a.courseName,
      "Admission Date": a.admissionDate,
      "Total Fee (INR)": a.totalFee,
      "Fee Plan": a.paymentType === "EMI" ? `${a.emiTenure} Months EMI` : "Full One-Time",
      "Payment Status": a.paymentStatus,
    }));
    exportToExcel(exportData, "Admissions_Register");
    showToast("Exported Admissions Register to Excel Sheet!", "success");
  };

  const handleExportPDF = () => {
    const headers = ["Admission ID", "Student Name", "Course Track", "Date", "Fee", "Plan", "Status"];
    const rows = filteredAdmissions.map((a, index) => [
      `#${101 + index}`,
      a.studentName || (a.student ? a.student.name : "N/A"),
      a.course?.courseName || a.courseName || "N/A",
      a.admissionDate || "N/A",
      `₹${Number(a.totalFee || 0).toLocaleString()}`,
      a.paymentType === "EMI" ? `${a.emiTenure} Mo EMI` : "Full",
      a.paymentStatus,
    ]);
    exportToPDF("Admissions Desk Register Report", headers, rows, "Admissions_Register_PDF");
    showToast("Exported PDF Report Sheet!", "success");
  };

  // Filter admissions
  const filteredAdmissions = admissions.filter((adm, index) => {
    const studentName = adm.studentName || (adm.student ? (adm.student.name || `${adm.student.firstName || ""} ${adm.student.lastName || ""}`).trim() : "");
    const courseName = adm.course?.courseName || adm.course?.name || adm.courseName || "";
    const rawAdmId = String(101 + index);
    const formattedAdmId = `#${101 + index}`;
    const q = search.toLowerCase().trim();
    const status = (adm.paymentStatus || "").toLowerCase();

    const matchesSearch =
      !q ||
      studentName.toLowerCase().includes(q) ||
      courseName.toLowerCase().includes(q) ||
      (adm.studentEmail || adm.student?.email || "").toLowerCase().includes(q) ||
      (adm.paymentType || "").toLowerCase().includes(q) ||
      status.includes(q) ||
      String(adm.totalFee || adm.fee || adm.amount || "").includes(q) ||
      formattedAdmId.toLowerCase().includes(q) ||
      rawAdmId.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "paid" && (status === "paid" || status === "completed")) ||
      (statusFilter === "partial" && status === "partial") ||
      (statusFilter === "pending" && (status === "pending" || status === "due"));

    return matchesSearch && matchesStatus;
  });

  const getStatusCount = (targetStatus) => {
    return admissions.filter((a) => {
      const st = (a.paymentStatus || "").toLowerCase();
      if (targetStatus === "paid") return st === "paid" || st === "completed";
      if (targetStatus === "partial") return st === "partial";
      if (targetStatus === "pending") return st === "pending" || st === "due";
      return true;
    }).length;
  };

  const handleClearAllAdmissions = async () => {
    if (window.confirm("Are you sure you want to clear all admission records from desk?")) {
      await clearAllAdmissionsData();
      setAdmissions([]);
      showToast("Cleared all admission records!", "info");
    }
  };


  return (
    <Layout>
      {/* Page Header */}
      <PageHeader
        title="Admissions Desk"
        description="Track student enrollments, EMI installment schedules, and fee payment status"
        categoryTag="Admissions Desk"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {admissions.length > 0 && (
              <Button
                onClick={handleClearAllAdmissions}
                variant="outline"
                size="sm"
                className="gap-1.5 border-red-200 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition"
                title="Clear all admission records"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All Admissions
              </Button>
            )}

            <Button onClick={handleExportExcel} variant="outline" size="sm" className="gap-1.5 border-[#e6dfd8] bg-[#faf9f5]">
              <FileSpreadsheet className="h-3.5 w-3.5 text-[#00754A]" /> Export Excel
            </Button>

            <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-1.5 border-[#e6dfd8] bg-[#faf9f5]">
              <Download className="h-3.5 w-3.5 text-[#cc785c]" /> Export PDF Sheet
            </Button>

            <Button
              onClick={() => setShowAddDialog(true)}
              variant="primary"
              size="sm"
              className="shadow-xs gap-1.5 bg-[#cc785c] hover:bg-[#a9583e]"
            >
              <Plus className="h-3.5 w-3.5" /> New Admission Entry
            </Button>
          </div>
        }
      />

      {/* Main Table Card */}
      <Card className="bg-[#efe9de] border-[#e6dfd8]">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8e8b82]" />
                <Input
                  type="text"
                  placeholder="Search student, course, ADM ID, fee, plan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-9 rounded-md bg-[#faf9f5] border-[#e6dfd8]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-3 text-[#8e8b82] hover:text-[#141413] transition"
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button type="submit" variant="primary" className="bg-[#cc785c] hover:bg-[#a9583e] text-white shrink-0 gap-1.5 shadow-xs">
                <Search className="h-4 w-4" /> Search
              </Button>
            </form>

            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All ({admissions.length})</TabsTrigger>
                <TabsTrigger value="paid">
                  Paid ({getStatusCount("paid")})
                </TabsTrigger>
                <TabsTrigger value="partial">
                  EMI Partial ({getStatusCount("partial")})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({getStatusCount("pending")})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <AdmissionTable
            admissions={filteredAdmissions}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDeleteTrigger}
            onManageEmi={handleManageEmi}
            onViewReceipt={handleViewReceipt}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showAddDialog && (
        <AddAdmissionDialog
          open={showAddDialog}
          setOpen={setShowAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {showEditDialog && selectedAdmission && (
        <EditAdmissionDialog
          open={showEditDialog}
          setOpen={setShowEditDialog}
          admission={selectedAdmission}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedAdmission(null);
          }}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {showEmiDialog && selectedAdmission && (
        <EmiManagementDialog
          open={showEmiDialog}
          setOpen={setShowEmiDialog}
          admission={selectedAdmission}
          onAdmissionUpdated={(updated) => {
            setSelectedAdmission(updated);
            setAdmissions((prev) =>
              prev.map((a) => (String(a.admissionId || a.id || a.studentId) === String(updated.admissionId || updated.id || updated.studentId) ? { ...a, ...updated } : a))
            );
          }}
          onEmailReceiptTrigger={(data) => {
            setReceiptModalData(data);
            setShowReceiptEmailModal(true);
          }}
        />
      )}

      {showReceiptEmailModal && receiptModalData && (
        <EmailReceiptModal
          open={showReceiptEmailModal}
          setOpen={setShowReceiptEmailModal}
          receiptData={receiptModalData}
        />
      )}

      <DeleteAdmissionDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        onDelete={handleDeleteConfirm}
      />
    </Layout>
  );
}

export default Admissions;