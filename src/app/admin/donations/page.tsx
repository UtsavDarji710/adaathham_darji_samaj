"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileCheck,
  CreditCard,
  Lock,
  Plus,
  Trash2,
  Pencil,
  Eye,
  Settings,
  QrCode,
  AlertTriangle,
  Phone,
  User,
  Users,
  Calendar,
  Clock,
  Search,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  X,
  Receipt,
  Tag,
  Check,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Donation, Member, SAMITI_DONATION_PURPOSES } from "@/types";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";

const DONATION_PURPOSES = [...SAMITI_DONATION_PURPOSES];

const PAYMENT_METHODS = [
  "રોકડ (Cash)",
  "UPI / ઓનલાઇન",
  "બેંક ટ્રાન્સફર (NEFT/RTGS)",
  "ચેક (Cheque)",
];

const PRESET_AMOUNTS = [1100, 2100, 5100, 11000, 21000, 51000];

export default function AdminDonationsPage() {
  const {
    members,
    donations,
    bankDetails,
    addDonation,
    updateDonation,
    approveDonation,
    rejectDonation,
    deleteDonation,
    updateBankDetails,
    addLog,
  } = useData();
  const { currentUser } = useAuth();

  const [activeFilter, setActiveFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modal States
  const [previewProofDonation, setPreviewProofDonation] = useState<Donation | null>(null);
  const [rejectingDonation, setRejectingDonation] = useState<Donation | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [showBankConfigModal, setShowBankConfigModal] = useState(false);

  // Add Donation Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [donorSource, setDonorSource] = useState<"member" | "custom">("member");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [addDonorName, setAddDonorName] = useState("");
  const [addMobileNumber, setAddMobileNumber] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addPurpose, setAddPurpose] = useState(DONATION_PURPOSES[0]);
  const [addSpecificPurpose, setAddSpecificPurpose] = useState("");
  const [addYear, setAddYear] = useState(String(new Date().getFullYear()));
  const [addDate, setAddDate] = useState(new Date().toISOString().split("T")[0]);
  const [addPaymentMethod, setAddPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [addReceiptNumber, setAddReceiptNumber] = useState("");
  const [addStatus, setAddStatus] = useState<"approved" | "pending" | "rejected">("approved");
  const [addHastheInput, setAddHastheInput] = useState("");
  const [addHastheList, setAddHastheList] = useState<string[]>([]);
  const [addDonorPhoto, setAddDonorPhoto] = useState<string>("");
  const [addPaymentProof, setAddPaymentProof] = useState<string>("");
  const [addIsAnonymous, setAddIsAnonymous] = useState(false);
  const [addPublicConsent, setAddPublicConsent] = useState(true);
  const [addAdminRemarks, setAddAdminRemarks] = useState("");

  // Edit Donation Modal States
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [editDonorName, setEditDonorName] = useState("");
  const [editMobileNumber, setEditMobileNumber] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editPurpose, setEditPurpose] = useState(DONATION_PURPOSES[0]);
  const [editSpecificPurpose, setEditSpecificPurpose] = useState("");
  const [editYear, setEditYear] = useState(String(new Date().getFullYear()));
  const [editDate, setEditDate] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [editReceiptNumber, setEditReceiptNumber] = useState("");
  const [editStatus, setEditStatus] = useState<"approved" | "pending" | "rejected">("approved");
  const [editHastheInput, setEditHastheInput] = useState("");
  const [editHastheList, setEditHastheList] = useState<string[]>([]);
  const [editDonorPhoto, setEditDonorPhoto] = useState<string>("");
  const [editPaymentProof, setEditPaymentProof] = useState<string>("");
  const [editIsAnonymous, setEditIsAnonymous] = useState(false);
  const [editPublicConsent, setEditPublicConsent] = useState(true);
  const [editAdminRemarks, setEditAdminRemarks] = useState("");

  // Bank Config Form State
  const [bankAccountHolder, setBankAccountHolder] = useState(bankDetails.account_holder);
  const [bankName, setBankName] = useState(bankDetails.bank_name);
  const [bankAccountNumber, setBankAccountNumber] = useState(bankDetails.account_number);
  const [bankIfsc, setBankIfsc] = useState(bankDetails.ifsc_code);
  const [bankBranch, setBankBranch] = useState(bankDetails.branch_name);
  const [bankUpi, setBankUpi] = useState(bankDetails.upi_id || "");
  const [bankQrPreview, setBankQrPreview] = useState(bankDetails.qr_code_url);

  // Synchronize bank form state with bankDetails
  React.useEffect(() => {
    setBankAccountHolder(bankDetails.account_holder);
    setBankName(bankDetails.bank_name);
    setBankAccountNumber(bankDetails.account_number);
    setBankIfsc(bankDetails.ifsc_code);
    setBankBranch(bankDetails.branch_name);
    setBankUpi(bankDetails.upi_id || "");
    setBankQrPreview(bankDetails.qr_code_url);
  }, [bankDetails]);

  // Counts
  const pendingCount = donations.filter((d) => d.status === "pending" || (!d.status && d.payment_status === "pending")).length;
  const approvedCount = donations.filter((d) => d.status === "approved" || d.payment_status === "verified").length;
  const rejectedCount = donations.filter((d) => d.status === "rejected").length;

  const totalVerifiedFunds = donations
    .filter((d) => d.status === "approved" || d.payment_status === "verified")
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  // Filtered donations
  const filteredDonations = donations.filter((d) => {
    const isApproved = d.status === "approved" || d.payment_status === "verified";
    const isPending = d.status === "pending" || (!d.status && d.payment_status === "pending");
    const isRejected = d.status === "rejected";

    if (activeFilter === "pending" && !isPending) return false;
    if (activeFilter === "approved" && !isApproved) return false;
    if (activeFilter === "rejected" && !isRejected) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = d.donor_name?.toLowerCase().includes(q);
      const matchId = d.donation_id?.toLowerCase().includes(q) || d.receipt_number?.toLowerCase().includes(q);
      const matchPhone = d.mobile_number?.includes(q);
      const matchHasthe = d.hasthe_names?.some((h) => h.toLowerCase().includes(q));
      if (!matchName && !matchId && !matchPhone && !matchHasthe) return false;
    }

    return true;
  });

  // Action: Approve
  const handleApprove = (donation: Donation) => {
    const adminName = currentUser?.name || "ખજાનચી શ્રી";
    approveDonation(donation.id, adminName);
    addLog(
      "દાન ચુકવણી ચકાસણી & મંજૂરી",
      `${donation.donor_name} (${donation.donation_id || donation.receipt_number})`,
      `રકમ ₹${donation.amount} બેંક જમા થયાની ખરાઈ કરીને માન્ય કરવામાં આવી.`,
      adminName,
      currentUser?.role || "treasurer"
    );
    setSuccessToast(`"${donation.donor_name}" નું દાન સફળતાપૂર્વક મંજૂર કરવામાં આવ્યું!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Action: Open Reject Modal
  const handleOpenReject = (donation: Donation) => {
    setRejectingDonation(donation);
    setRejectionRemarks(donation.admin_remarks || "");
  };

  // Action: Confirm Reject
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingDonation) return;

    const adminName = currentUser?.name || "ખજાનચી શ્રી";
    const remarks = rejectionRemarks.trim() || "ચુકવણી પ્રૂફ મેળ ખાતું નથી અથવા બેંકમાં જમા થયેલ નથી.";

    rejectDonation(rejectingDonation.id, remarks, adminName);
    addLog(
      "દાન અસ્વીકાર",
      `${rejectingDonation.donor_name} (${rejectingDonation.donation_id || rejectingDonation.receipt_number})`,
      `કારણ: ${remarks}`,
      adminName,
      currentUser?.role || "treasurer"
    );

    setRejectingDonation(null);
    setRejectionRemarks("");
    setSuccessToast(`દાન અસ્વીકાર કરવામાં આવ્યું.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Action: Delete
  const handleDelete = (id: string, name: string) => {
    if (confirm(`શું તમે ખરેખર "${name}" નો દાન રેકોર્ડ કાઢી નાખવા માંગો છો? આ પ્રક્રિયા રદ કરી શકાશે નહીં.`)) {
      const adminName = currentUser?.name || "ખજાનચી / એડમિન";
      deleteDonation(id);
      addLog(
        "દાન રેકોર્ડ ડિલીટ કર્યો",
        name,
        `રેકોર્ડ ID: ${id}`,
        adminName,
        currentUser?.role || "treasurer"
      );
      setSuccessToast(`"${name}" નો દાન રેકોર્ડ સફળતાપૂર્વક ડિલીટ કરવામાં આવ્યો.`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  // Filtered members for Add Donation dropdown
  const filteredMembersForAdd = React.useMemo(() => {
    if (!memberSearchQuery.trim()) return members.slice(0, 10);
    const q = memberSearchQuery.toLowerCase().trim();
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.phone?.includes(q) ||
        (m.city && m.city.toLowerCase().includes(q)) ||
        (m.native_place && m.native_place.toLowerCase().includes(q))
    ).slice(0, 15);
  }, [members, memberSearchQuery]);

  const handleSelectMember = (m: Member) => {
    setSelectedMember(m);
    setAddDonorName(m.name);
    setAddMobileNumber(m.phone || "");
    setAddDonorPhoto(m.photo_url || "");
    setMemberSearchQuery("");
  };

  const handleClearSelectedMember = () => {
    setSelectedMember(null);
    setAddDonorName("");
    setAddMobileNumber("");
    setAddDonorPhoto("");
  };

  const handleOpenAddModal = () => {
    setDonorSource("member");
    setMemberSearchQuery("");
    setSelectedMember(null);
    setAddDonorName("");
    setAddMobileNumber("");
    setAddAmount("");
    setAddPurpose(DONATION_PURPOSES[0]);
    setAddSpecificPurpose("");
    setAddYear(String(new Date().getFullYear()));
    setAddDate(new Date().toISOString().split("T")[0]);
    setAddPaymentMethod(PAYMENT_METHODS[0]);
    setAddReceiptNumber(`ADS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);
    setAddStatus("approved");
    setAddHastheInput("");
    setAddHastheList([]);
    setAddDonorPhoto("");
    setAddPaymentProof("");
    setAddIsAnonymous(false);
    setAddPublicConsent(true);
    setAddAdminRemarks("");
    setShowAddModal(true);
  };

  const handleAddHasthe = () => {
    const val = addHastheInput.trim();
    if (val && !addHastheList.includes(val)) {
      setAddHastheList((prev) => [...prev, val]);
      setAddHastheInput("");
    }
  };

  const handleRemoveHasthe = (index: number) => {
    setAddHastheList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addDonorName.trim()) {
      alert("કૃપા કરીને દાતાનું નામ દાખલ કરો.");
      return;
    }
    const num = Number(addAmount);
    if (!num || num <= 0) {
      alert("કૃપા કરીને માન્ય રકમ દાખલ કરો.");
      return;
    }

    const adminName = currentUser?.name || "ખજાનચી / એડમિન";
    addDonation({
      user_id: selectedMember?.id,
      donor_id: selectedMember?.id,
      donor_name: addDonorName.trim(),
      mobile_number: addMobileNumber.trim(),
      amount: num,
      donation_purpose: addPurpose,
      purpose: addPurpose,
      specific_purpose: addSpecificPurpose.trim() || undefined,
      donation_year: addYear,
      date: addDate,
      payment_method: addPaymentMethod,
      receipt_number: addReceiptNumber.trim() || undefined,
      status: addStatus,
      payment_status: addStatus === "approved" ? "verified" : "pending",
      hasthe_names: addHastheList,
      donor_photo: addDonorPhoto || undefined,
      payment_proof: addPaymentProof || undefined,
      is_anonymous: addIsAnonymous,
      public_consent: addPublicConsent,
      approved_by: addStatus === "approved" ? adminName : undefined,
      approved_at: addStatus === "approved" ? addDate : undefined,
      admin_remarks: addAdminRemarks.trim() || undefined,
    });

    addLog(
      "એડમિન દ્વારા નવું દાન ઉમેર્યું",
      `${addDonorName.trim()} (રકમ: ₹${num.toLocaleString("en-IN")})`,
      `હેતુ: ${addPurpose}, પદ્ધતિ: ${addPaymentMethod}, સ્થિતિ: ${addStatus === "approved" ? "માન્ય" : "પેન્ડિંગ"}`,
      adminName,
      currentUser?.role || "treasurer"
    );

    setShowAddModal(false);
    setSuccessToast(`"${addDonorName.trim()}" નું ₹${num.toLocaleString("en-IN")} નું દાન સફળતાપૂર્વક ઉમેરાયું!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleOpenEditModal = (don: Donation) => {
    setEditingDonation(don);
    setEditDonorName(don.donor_name || "");
    setEditMobileNumber(don.mobile_number || "");
    setEditAmount(String(don.amount || ""));
    setEditPurpose(don.donation_purpose || don.purpose || DONATION_PURPOSES[0]);
    setEditSpecificPurpose(don.specific_purpose || "");
    setEditYear(don.donation_year || don.date?.split("-")[0] || String(new Date().getFullYear()));
    setEditDate(don.date || new Date().toISOString().split("T")[0]);
    setEditPaymentMethod(don.payment_method || PAYMENT_METHODS[0]);
    setEditReceiptNumber(don.receipt_number || don.donation_id || "");
    setEditStatus((don.status as any) || (don.payment_status === "verified" ? "approved" : "pending"));
    setEditHastheList(Array.isArray(don.hasthe_names) ? [...don.hasthe_names] : []);
    setEditHastheInput("");
    setEditDonorPhoto(don.donor_photo || "");
    setEditPaymentProof(don.payment_proof || "");
    setEditIsAnonymous(!!don.is_anonymous);
    setEditPublicConsent(don.public_consent !== false);
    setEditAdminRemarks(don.admin_remarks || "");
  };

  const handleEditAddHasthe = () => {
    const val = editHastheInput.trim();
    if (val && !editHastheList.includes(val)) {
      setEditHastheList((prev) => [...prev, val]);
      setEditHastheInput("");
    }
  };

  const handleEditRemoveHasthe = (index: number) => {
    setEditHastheList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDonation) return;
    if (!editDonorName.trim()) {
      alert("કૃપા કરીને દાતાનું નામ દાખલ કરો.");
      return;
    }
    const num = Number(editAmount);
    if (!num || num <= 0) {
      alert("કૃપા કરીને માન્ય રકમ દાખલ કરો.");
      return;
    }

    const adminName = currentUser?.name || "ખજાનચી / એડમિન";
    const updates: Partial<Donation> = {
      donor_name: editDonorName.trim(),
      mobile_number: editMobileNumber.trim(),
      amount: num,
      donation_purpose: editPurpose,
      purpose: editPurpose,
      specific_purpose: editSpecificPurpose.trim() || undefined,
      donation_year: editYear,
      date: editDate,
      payment_method: editPaymentMethod,
      receipt_number: editReceiptNumber.trim() || undefined,
      status: editStatus,
      payment_status: editStatus === "approved" ? "verified" : (editStatus === "pending" ? "pending" : editingDonation.payment_status),
      hasthe_names: editHastheList,
      donor_photo: editDonorPhoto || undefined,
      payment_proof: editPaymentProof || undefined,
      is_anonymous: editIsAnonymous,
      public_consent: editPublicConsent,
      admin_remarks: editAdminRemarks.trim() || undefined,
      approved_by: editStatus === "approved" ? (editingDonation.approved_by || adminName) : undefined,
      approved_at: editStatus === "approved" ? (editingDonation.approved_at || editDate) : undefined,
    };

    updateDonation(editingDonation.id, updates);

    addLog(
      "દાન વિગતો સુધારી",
      `${editDonorName.trim()} (ID: ${editingDonation.donation_id || editingDonation.receipt_number})`,
      `સુધારેલી રકમ: ₹${num.toLocaleString("en-IN")}, સ્થિતિ: ${editStatus}`,
      adminName,
      currentUser?.role || "treasurer"
    );

    setEditingDonation(null);
    setSuccessToast(`"${editDonorName.trim()}" નો દાન રેકોર્ડ સફળતાપૂર્વક અપડેટ થયો!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Bank QR Upload handler
  const handleBankQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setBankQrPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Bank Details (Requirement 13.7)
  const handleSaveBankConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateBankDetails({
      account_holder: bankAccountHolder.trim(),
      bank_name: bankName.trim(),
      account_number: bankAccountNumber.trim(),
      ifsc_code: bankIfsc.trim(),
      branch_name: bankBranch.trim(),
      upi_id: bankUpi.trim() || undefined,
      qr_code_url: bankQrPreview,
    });

    addLog(
      "બેંક વિગતો & QR કોડ અપડેટ",
      bankName.trim(),
      `ખાતા નંબર: ${bankAccountNumber.trim()}, IFSC: ${bankIfsc.trim()}`,
      currentUser?.name || "ખજાનચી",
      currentUser?.role || "treasurer"
    );

    setShowBankConfigModal(false);
    setSuccessToast("બેંક વિગતો અને પેમેન્ટ QR કોડ સફળતાપૂર્વક અપડેટ થયા!");
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Back button */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-saffron-700 hover:text-saffron-800 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>એડમિન ડેશબોર્ડ પર પાછા જાઓ</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
              <Heart className="w-6 h-6 fill-forest-700" />
            </span>
            <h1 className="text-2xl font-bold text-charcoal-900">
              દાન વ્યવસ્થાપન (Donation Management)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            સભ્યો દ્વારા નોંધાયેલા દાનની ચકાસણી, ચુકવણી પ્રૂફ ખરાઈ, મંજૂરી / અસ્વીકાર અને સત્તાવાર બેંક વિગતો/QR કોડ સંચાલન.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Add Donation Button */}
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>નવું દાન ઉમેરો (Add Donation)</span>
          </button>

          {/* Bank Configuration Button (Requirement 13.7) */}
          <button
            onClick={() => setShowBankConfigModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white border border-ivory-300 hover:border-saffron-500 text-charcoal-800 font-bold text-xs shadow-2xs transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4 text-saffron-600" />
            <span>બેંક & QR કોડ સેટિંગ્સ</span>
          </button>

          <div className="p-2.5 rounded-xl bg-forest-50 border border-forest-200 text-right">
            <span className="text-[10px] text-forest-700 font-bold block">માન્ય કુલ દાન:</span>
            <span className="text-base sm:text-lg font-extrabold text-forest-900">
              ₹{totalVerifiedFunds.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-ivory-100/80 rounded-2xl border border-ivory-300 w-max max-w-full">
          <button
            onClick={() => setActiveFilter("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeFilter === "pending"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-charcoal-700 hover:bg-white/70"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>પેન્ડિંગ ચકાસણી</span>
            {pendingCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeFilter === "pending"
                    ? "bg-white text-amber-900"
                    : "bg-amber-200 text-amber-900"
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFilter("approved")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeFilter === "approved"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-charcoal-700 hover:bg-white/70"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>માન્ય દાન ({approvedCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter("rejected")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeFilter === "rejected"
                ? "bg-red-600 text-white shadow-sm"
                : "text-charcoal-700 hover:bg-white/70"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>અસ્વીકાર ({rejectedCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === "all"
                ? "bg-charcoal-900 text-white shadow-sm"
                : "text-charcoal-700 hover:bg-white/70"
            }`}
          >
            <span>તમામ ({donations.length})</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="દાતા, ID અથવા હસ્તે શોધો..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-ivory-300 rounded-xl focus:outline-none focus:border-saffron-500 bg-white"
          />
        </div>
      </div>

      {/* Donation Requests Grid */}
      {filteredDonations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-ivory-300 p-12 text-center space-y-3">
          <Heart className="w-10 h-10 text-charcoal-300 mx-auto" />
          <h3 className="font-bold text-sm text-charcoal-800">
            {activeFilter === "pending"
              ? "હાલમાં કોઈ પેન્ડિંગ દાન અરજી નથી."
              : activeFilter === "approved"
              ? "કોઈ માન્ય દાન નોંધાયેલું નથી."
              : activeFilter === "rejected"
              ? "કોઈ અસ્વીકાર કરેલ દાન નથી."
              : "કોઈ દાન રેકોર્ડ મળ્યો નથી."}
          </h3>
          <p className="text-xs text-charcoal-500">
            સભ્યો પોર્ટલ પરથી દાન નોંધણી કરશે ત્યારે અહીં ચકાસણી માટે દર્શાવાશે.
          </p>
          <div className="pt-2">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>પ્રથમ દાન રેકોર્ડ ઉમેરો (Add Donation)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((don) => {
            const isApproved = don.status === "approved" || don.payment_status === "verified";
            const isRejected = don.status === "rejected";
            const isPending = !isApproved && !isRejected;

            return (
              <div
                key={don.id}
                className="bg-white rounded-3xl border border-ivory-300 shadow-card hover:shadow-hover transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3.5">
                  {/* Top: Status & Donation ID */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-ivory-200 text-xs">
                    <span className="font-mono font-bold text-charcoal-700 bg-ivory-100 px-2 py-0.5 rounded-md">
                      {don.donation_id || don.receipt_number || "DON-RECORD"}
                    </span>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isApproved
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : isRejected
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {isApproved && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                      {isRejected && <XCircle className="w-3 h-3 text-red-600" />}
                      {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                      <span>
                        {isApproved ? "માન્ય (Approved)" : isRejected ? "અસ્વીકાર (Rejected)" : "પેન્ડિંગ (Pending)"}
                      </span>
                    </span>
                  </div>

                  {/* Donor Info Header */}
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        don.donor_photo ||
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                      }
                      alt={don.donor_name}
                      className="w-12 h-12 rounded-xl object-cover border border-ivory-300 shadow-2xs flex-shrink-0"
                    />
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-charcoal-900 leading-snug">
                        {don.donor_name}
                      </h3>
                      {don.mobile_number && (
                        <p className="text-xs text-forest-800 font-bold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{don.mobile_number}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Donation Details */}
                  <div className="space-y-1.5 text-xs text-charcoal-700 bg-ivory-50 p-3 rounded-2xl border border-ivory-200">
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal-500">દાનનો હેતુ:</span>
                      <strong className="text-charcoal-900">
                        {don.donation_purpose || don.purpose || "સમાજ વિકાસ"}
                      </strong>
                    </div>

                    {don.specific_purpose && (
                      <div className="pt-1 text-[11px] text-charcoal-600 italic">
                        &ldquo;{don.specific_purpose}&rdquo;
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-charcoal-500">દાનનું વર્ષ:</span>
                      <span className="font-bold text-charcoal-900">
                        {don.donation_year || don.date.split("-")[0]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-charcoal-500">નોંધણી તારીખ:</span>
                      <span className="text-charcoal-700 font-medium">{don.date}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-ivory-200 font-bold">
                      <span className="text-charcoal-700">રકમ:</span>
                      <span className="text-base text-forest-900 font-extrabold">
                        ₹{don.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Multiple "હસ્તે" Names (Requirement 13.4) */}
                  {don.hasthe_names && don.hasthe_names.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-saffron-800 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>હસ્તે (Donated By / On Behalf Of):</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {don.hasthe_names.map((hName, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-saffron-50 text-saffron-900 font-semibold px-2 py-0.5 rounded-md border border-saffron-200"
                          >
                            {hName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Proof Button for Admin Verification (Requirement 13.4) */}
                  {don.payment_proof && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setPreviewProofDonation(don)}
                        className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-700" />
                        <span>ચુકવણીનો ફોટો (સ્ક્રીનશોટ) તપાસો</span>
                      </button>
                    </div>
                  )}

                  {/* Rejection remarks if rejected */}
                  {isRejected && don.admin_remarks && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">અસ્વીકાર કારણ / શેરો:</span>
                        <span>{don.admin_remarks}</span>
                      </div>
                    </div>
                  )}

                  {/* Approval metadata */}
                  {isApproved && don.approved_by && (
                    <p className="text-[11px] text-emerald-800 font-medium">
                      ✓ {don.approved_by} દ્વારા મંજૂર ({don.approved_at})
                    </p>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-ivory-50/70 border-t border-ivory-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!isApproved && (
                      <button
                        onClick={() => handleApprove(don)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>મંજૂર કરો</span>
                      </button>
                    )}

                    {!isRejected && (
                      <button
                        onClick={() => handleOpenReject(don)}
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>અસ્વીકાર</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(don)}
                      className="p-1.5 rounded-xl text-charcoal-400 hover:text-saffron-700 hover:bg-saffron-50 transition-colors"
                      title="વિગતો સુધારો (Edit)"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(don.id, don.donor_name)}
                      className="p-1.5 rounded-xl text-charcoal-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="ડિલીટ કરો"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: PAYMENT PROOF IMAGE PREVIEW (ADMIN ONLY) */}
      {previewProofDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-ivory-300 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-ivory-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-charcoal-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-forest-700" />
                  <span>ચુકવણી પ્રૂફ ખરાઈ (Payment Proof Verification)</span>
                </h3>
                <span className="text-xs text-charcoal-500 font-medium">
                  દાતા: <strong>{previewProofDonation.donor_name}</strong> | રકમ: ₹{previewProofDonation.amount}
                </span>
              </div>
              <button
                onClick={() => setPreviewProofDonation(null)}
                className="w-8 h-8 rounded-full bg-ivory-100 hover:bg-ivory-200 text-charcoal-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="rounded-2xl overflow-hidden border border-ivory-300 shadow-sm bg-black/5 p-1 text-center">
                <img
                  src={previewProofDonation.payment_proof}
                  alt="Payment Receipt Screenshot"
                  className="w-full max-h-[420px] object-contain mx-auto rounded-xl"
                />
              </div>

              <div className="p-3 rounded-xl bg-ivory-50 border border-ivory-200 text-xs text-charcoal-600 flex items-center justify-between">
                <span>Donation ID: <strong>{previewProofDonation.donation_id || previewProofDonation.receipt_number}</strong></span>
                <span>તારીખ: <strong>{previewProofDonation.date}</strong></span>
              </div>
            </div>

            <div className="p-4 border-t border-ivory-200 bg-ivory-50 flex items-center justify-end gap-2">
              {previewProofDonation.status !== "approved" && previewProofDonation.payment_status !== "verified" && (
                <button
                  onClick={() => {
                    handleApprove(previewProofDonation);
                    setPreviewProofDonation(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>ચુકવણી મંજૂર કરો</span>
                </button>
              )}

              {previewProofDonation.status !== "rejected" && (
                <button
                  onClick={() => {
                    const target = previewProofDonation;
                    setPreviewProofDonation(null);
                    handleOpenReject(target);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>અસ્વીકાર કરો</span>
                </button>
              )}

              <button
                onClick={() => setPreviewProofDonation(null)}
                className="px-4 py-2 rounded-xl bg-white border border-ivory-300 text-charcoal-700 font-bold text-xs hover:bg-ivory-100"
              >
                બંધ કરો
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REJECTION REMARKS (Requirement 13.4) */}
      {rejectingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-ivory-300 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <h3 className="font-bold text-base text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>દાન અસ્વીકાર (Reject Donation)</span>
              </h3>
              <button
                onClick={() => setRejectingDonation(null)}
                className="w-7 h-7 rounded-full bg-ivory-100 hover:bg-ivory-200 text-charcoal-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-charcoal-600">
              તમે <strong>&ldquo;{rejectingDonation.donor_name}&rdquo;</strong> (₹{rejectingDonation.amount}) ના દાનનો અસ્વીકાર કરી રહ્યા છો. કૃપા કરીને દાતાને જણાવવા માટે અસ્વીકારનું કારણ અથવા શેરો લખો:
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1">
                  અસ્વીકાર કારણ / શેરો (Rejection Remarks) *
                </label>
                <textarea
                  value={rejectionRemarks}
                  onChange={(e) => setRejectionRemarks(e.target.value)}
                  required
                  rows={3}
                  placeholder="દા.ત. બેંકમાં રકમ જમા થઈ નથી, અથવા સ્ક્રીનશોટ સ્પષ્ટ નથી..."
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setRejectingDonation(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-ivory-300 text-charcoal-700 font-bold text-xs hover:bg-ivory-100"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  અસ્વીકાર કન્ફર્મ કરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BANK DETAILS & PAYMENT QR CODE CONFIGURATION (Requirement 13.7) */}
      {showBankConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-ivory-300 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-ivory-200 flex items-center justify-between bg-gradient-to-r from-forest-50 to-ivory-50">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-forest-800 text-white">
                  <CreditCard className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-charcoal-900">
                    સત્તાવાર બેંક વિગતો & QR કોડ સેટિંગ્સ
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    આ વિગતો પબ્લિક દાન પેજ પર આપોઆપ પ્રતિબિંબિત થશે.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBankConfigModal(false)}
                className="w-8 h-8 rounded-full bg-ivory-200 hover:bg-ivory-300 text-charcoal-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBankConfig} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal-800 mb-1">
                  ખાતાધારકનું નામ (Account Holder Name) *
                </label>
                <input
                  type="text"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    બેંકનું નામ (Bank Name) *
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    શાખા (Branch Name) *
                  </label>
                  <input
                    type="text"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    ખાતા નંબર (Account Number) *
                  </label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    IFSC કોડ *
                  </label>
                  <input
                    type="text"
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-800 mb-1">
                  UPI ID (Google Pay, PhonePe, Paytm)
                </label>
                <input
                  type="text"
                  value={bankUpi}
                  onChange={(e) => setBankUpi(e.target.value)}
                  placeholder="દા.ત. adaathamdarjisamiti@sbi"
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600 font-mono"
                />
              </div>

              {/* QR Code Upload & Crop Editor (Task 1) */}
              <div className="space-y-2 pt-2 border-t border-ivory-200">
                <label className="block font-bold text-charcoal-800">
                  સત્તાવાર પેમેન્ટ QR કોડ (Payment QR Code) *
                </label>
                <ImageUploadWithCrop
                  currentImageUrl={bankQrPreview}
                  onImageCropped={(url) => setBankQrPreview(url)}
                  aspectRatio={1}
                  aspectRatioLabel="૧:૧ (QR કોડ ચોરસ)"
                  category="samiti-assets"
                  label="સત્તાવાર પેમેન્ટ QR કોડ અપલોડ &amp; ક્રોપ કરો"
                  helperText="UPI QR કોડનો ફોટો અપલોડ કરી ક્રોપ કરો. પબ્લિક પેજ પર આ જ QR કોડ દર્શાવાશે."
                />
              </div>

              <div className="pt-3 border-t border-ivory-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBankConfigModal(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-ivory-300 text-charcoal-700 font-bold hover:bg-ivory-100"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold shadow-md transition-colors"
                >
                  સાચવો (Save Bank Details)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD DONATION ON BEHALF OF ANY PERSON */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-ivory-300 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-ivory-200 flex items-center justify-between bg-gradient-to-r from-forest-50 via-emerald-50/40 to-ivory-50">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-xl bg-forest-800 text-white shadow-xs">
                  <Heart className="w-5 h-5 fill-white" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-charcoal-900">
                    નવું દાન ઉમેરો (Add Donation Record)
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    સમાજના સભ્ય અથવા અન્ય કોઈપણ વ્યક્તિ વતી એડમિન દ્વારા દાન નોંધણી.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-ivory-200 hover:bg-ivory-300 text-charcoal-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDonationSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              {/* Step 1: Donor Source Selector */}
              <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-2.5">
                <span className="block font-bold text-charcoal-800">દાતા પસંદગી (Donor Selection) *</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDonorSource("member");
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 ${
                      donorSource === "member"
                        ? "bg-forest-800 text-white border-forest-800 shadow-xs"
                        : "bg-white text-charcoal-700 border-ivory-300 hover:bg-ivory-100"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>સમાજના સભ્યમાંથી પસંદ કરો</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDonorSource("custom");
                      handleClearSelectedMember();
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 ${
                      donorSource === "custom"
                        ? "bg-forest-800 text-white border-forest-800 shadow-xs"
                        : "bg-white text-charcoal-700 border-ivory-300 hover:bg-ivory-100"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>અન્ય વ્યક્તિ / દાતા</span>
                  </button>
                </div>

                {/* If Member source selected */}
                {donorSource === "member" && (
                  <div className="space-y-2 pt-1">
                    {selectedMember ? (
                      <div className="p-3 rounded-xl bg-white border border-forest-300 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {selectedMember.photo_url ? (
                            <img
                              src={selectedMember.photo_url}
                              alt={selectedMember.name}
                              className="w-10 h-10 rounded-xl object-cover border border-ivory-300 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 font-bold flex items-center justify-center flex-shrink-0">
                              {selectedMember.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-charcoal-900 block truncate">
                              {selectedMember.name}
                            </span>
                            <span className="text-[11px] text-charcoal-500 block">
                              ફોન: {selectedMember.phone} | {selectedMember.city} ({selectedMember.native_place})
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearSelectedMember}
                          className="px-2.5 py-1 text-[11px] text-red-700 hover:bg-red-50 rounded-lg border border-red-200 font-semibold"
                        >
                          બદલો ✕
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={memberSearchQuery}
                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                            placeholder="સભ્યનું નામ, ફોન અથવા ગામ શોધો..."
                            className="w-full pl-8 pr-3 py-2 text-xs border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600 bg-white"
                          />
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1 divide-y divide-ivory-100 bg-white rounded-xl border border-ivory-200 p-1">
                          {filteredMembersForAdd.length === 0 ? (
                            <p className="p-2 text-charcoal-400 text-center">કોઈ સભ્ય મળ્યા નથી.</p>
                          ) : (
                            filteredMembersForAdd.map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => handleSelectMember(m)}
                                className="w-full text-left p-2 hover:bg-forest-50/70 rounded-lg flex items-center justify-between text-xs transition-colors"
                              >
                                <span className="font-bold text-charcoal-900">{m.name}</span>
                                <span className="text-charcoal-500 text-[11px]">
                                  {m.phone} • {m.city}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Donor Name & Mobile Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    દાતાનું પૂરું નામ (Donor Full Name) *
                  </label>
                  <input
                    type="text"
                    value={addDonorName}
                    onChange={(e) => setAddDonorName(e.target.value)}
                    required
                    placeholder="દા.ત. શેઠ શ્રી રમણલાલ પી. દરજી"
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    મોબાઇલ નંબર (Mobile Number)
                  </label>
                  <input
                    type="tel"
                    value={addMobileNumber}
                    onChange={(e) => setAddMobileNumber(e.target.value)}
                    placeholder="દા.ત. 98250 12345"
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600 font-mono"
                  />
                </div>
              </div>

              {/* Step 3: "હસ્તે" (On Behalf Of / Collected By) */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-ivory-50 border border-ivory-200">
                <label className="block font-bold text-saffron-900">
                  હસ્તે વિગત (Donated By / On Behalf Of / Managed By)
                </label>
                <p className="text-[11px] text-charcoal-500">
                  કોઈ અન્ય વ્યક્તિ કે પરિવારજન વતી દાન આપવામાં આવ્યું હોય તો તેમના નામ ઉમેરો:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addHastheInput}
                    onChange={(e) => setAddHastheInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddHasthe();
                      }
                    }}
                    placeholder="દા.ત. ચિ. રોહન દરજી (પુત્ર)"
                    className="flex-1 px-3 py-1.5 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-saffron-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddHasthe}
                    className="px-3.5 py-1.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs"
                  >
                    + ઉમેરો
                  </button>
                </div>
                {addHastheList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {addHastheList.map((hName, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-saffron-100 text-saffron-900 font-semibold px-2.5 py-1 rounded-lg border border-saffron-300 text-xs"
                      >
                        <span>{hName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHasthe(idx)}
                          className="text-saffron-700 hover:text-red-700 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 4: Amount & Presets */}
              <div className="space-y-1.5">
                <label className="block font-bold text-charcoal-800">
                  દાનની રકમ (Donation Amount in ₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-forest-800 text-sm">₹</span>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    required
                    min={1}
                    placeholder="દા.ત. 5100"
                    className="w-full pl-8 pr-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600 font-mono font-bold text-base text-forest-900"
                  />
                </div>
                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAddAmount(String(amt))}
                      className="px-2.5 py-1 rounded-lg bg-forest-50 hover:bg-forest-100 border border-forest-200 text-forest-900 font-bold text-[11px] transition-colors"
                    >
                      +₹{amt.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 5: Purpose & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    દાનનો હેતુ (Donation Purpose) *
                  </label>
                  <select
                    value={addPurpose}
                    onChange={(e) => setAddPurpose(e.target.value)}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600 font-semibold bg-white"
                  >
                    {DONATION_PURPOSES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    દાનનું વર્ષ (Year) *
                  </label>
                  <input
                    type="text"
                    value={addYear}
                    onChange={(e) => setAddYear(e.target.value)}
                    placeholder="2026"
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-800 mb-1">
                  વિશેષ હેતુ / સ્મૃતિ નોંધ (Specific Purpose / In Memory Of)
                </label>
                <input
                  type="text"
                  value={addSpecificPurpose}
                  onChange={(e) => setAddSpecificPurpose(e.target.value)}
                  placeholder="દા.ત. સ્વ. પિતાશ્રીની પુણ્યતિથિ નિમિત્તે અથવા નવા ભવન રૂમ અર્થે"
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600"
                />
              </div>

              {/* Step 6: Date & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    દાન તારીખ (Date) *
                  </label>
                  <input
                    type="date"
                    value={addDate}
                    onChange={(e) => setAddDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    ચુકવણી પદ્ધતિ (Payment Method) *
                  </label>
                  <select
                    value={addPaymentMethod}
                    onChange={(e) => setAddPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600 font-medium bg-white"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    દાન સ્થિતિ (Status) *
                  </label>
                  <select
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600 font-bold bg-white"
                  >
                    <option value="approved">માન્ય (Approved - સીધું મંજૂર)</option>
                    <option value="pending">પેન્ડિંગ (Pending Verification)</option>
                    <option value="rejected">અસ્વીકાર (Rejected)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-800 mb-1">
                  રસીદ નંબર / ટ્રાન્ઝેક્શન રેફરન્સ (Receipt / Ref No)
                </label>
                <input
                  type="text"
                  value={addReceiptNumber}
                  onChange={(e) => setAddReceiptNumber(e.target.value)}
                  placeholder="દા.ત. ADS-2026-0042 અથવા UPI Ref"
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600 font-mono"
                />
              </div>

              {/* Step 7: Image Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-ivory-200">
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    દાતાનો ફોટો (Donor Photo) - વૈકલ્પિક
                  </label>
                  <ImageUploadWithCrop
                    currentImageUrl={addDonorPhoto}
                    onImageCropped={(url) => setAddDonorPhoto(url)}
                    aspectRatio={1}
                    aspectRatioLabel="૧:૧ (પાસપોર્ટ કદ)"
                    category="donor-photos"
                    label="દાતાનો ફોટો અપલોડ કરો"
                    helperText="વેબસાઇટ પર દાતાઓની યાદીમાં દર્શાવવા માટે."
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    ચુકવણી પ્રૂફ / રસીદ ફોટો - વૈકલ્પિક
                  </label>
                  <ImageUploadWithCrop
                    currentImageUrl={addPaymentProof}
                    onImageCropped={(url) => setAddPaymentProof(url)}
                    aspectRatio={1}
                    aspectRatioLabel="સ્ક્રીનશોટ / રસીદ"
                    category="payment-proofs"
                    label="ચુકવણી સ્ક્રીનશોટ / રસીદ અપલોડ કરો"
                    helperText="ઓનલાઇન ટ્રાન્ઝેક્શન કે બેંક પાવતીનો ફોટો."
                  />
                </div>
              </div>

              {/* Step 8: Remarks & Toggles */}
              <div>
                <label className="block font-bold text-charcoal-800 mb-1">
                  એડમિન શેરો / વિશેષ નોંધ (Admin Remarks)
                </label>
                <textarea
                  value={addAdminRemarks}
                  onChange={(e) => setAddAdminRemarks(e.target.value)}
                  rows={2}
                  placeholder="દા.ત. રોકડ રકમ ખજાનચીશ્રી પાસે જમા થઈ ગઈ છે."
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-forest-600"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-ivory-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-charcoal-800">
                  <input
                    type="checkbox"
                    checked={addPublicConsent}
                    onChange={(e) => setAddPublicConsent(e.target.checked)}
                    className="w-4 h-4 text-forest-800 rounded border-ivory-300 focus:ring-forest-500"
                  />
                  <span>વેબસાઇટ પર દાતાની યાદીમાં નામ અને રકમ દર્શાવવાની સંમતિ (Public Listing)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-charcoal-800">
                  <input
                    type="checkbox"
                    checked={addIsAnonymous}
                    onChange={(e) => setAddIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-forest-800 rounded border-ivory-300 focus:ring-forest-500"
                  />
                  <span>ગુપ્ત દાન (Anonymous Donor - પબ્લિક યાદીમાં નામ ગુપ્ત રાખવું)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-ivory-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-ivory-300 text-charcoal-700 font-bold hover:bg-ivory-100"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>દાન સાચવો (Save Donation)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT DONATION DETAILS */}
      {editingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-ivory-300 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-ivory-200 flex items-center justify-between bg-gradient-to-r from-saffron-50 via-amber-50/40 to-ivory-50">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-xl bg-saffron-600 text-white shadow-xs">
                  <Pencil className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-charcoal-900">
                    દાન વિગતો સુધારો (Edit Donation)
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    ID: <strong>{editingDonation.donation_id || editingDonation.receipt_number}</strong> ની વિગતો અપડેટ કરો.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingDonation(null)}
                className="w-8 h-8 rounded-full bg-ivory-200 hover:bg-ivory-300 text-charcoal-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditDonationSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    દાતાનું પૂરું નામ *
                  </label>
                  <input
                    type="text"
                    value={editDonorName}
                    onChange={(e) => setEditDonorName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-saffron-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    મોબાઇલ નંબર
                  </label>
                  <input
                    type="tel"
                    value={editMobileNumber}
                    onChange={(e) => setEditMobileNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-saffron-600 font-mono"
                  />
                </div>
              </div>

              {/* Edit Hasthe */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-ivory-50 border border-ivory-200">
                <label className="block font-bold text-saffron-900">
                  હસ્તે વિગત (On Behalf Of / Managed By)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editHastheInput}
                    onChange={(e) => setEditHastheInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleEditAddHasthe();
                      }
                    }}
                    placeholder="હસ્તે નામ ઉમેરો..."
                    className="flex-1 px-3 py-1.5 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-saffron-500"
                  />
                  <button
                    type="button"
                    onClick={handleEditAddHasthe}
                    className="px-3.5 py-1.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs"
                  >
                    + ઉમેરો
                  </button>
                </div>
                {editHastheList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editHastheList.map((hName, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-saffron-100 text-saffron-900 font-semibold px-2.5 py-1 rounded-lg border border-saffron-300 text-xs"
                      >
                        <span>{hName}</span>
                        <button
                          type="button"
                          onClick={() => handleEditRemoveHasthe(idx)}
                          className="text-saffron-700 hover:text-red-700 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="block font-bold text-charcoal-800">
                  દાનની રકમ (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-forest-800 text-sm">₹</span>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    required
                    min={1}
                    className="w-full pl-8 pr-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-saffron-600 font-mono font-bold text-base text-forest-900"
                  />
                </div>
              </div>

              {/* Purpose & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    દાનનો હેતુ *
                  </label>
                  <select
                    value={editPurpose}
                    onChange={(e) => setEditPurpose(e.target.value)}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-saffron-600 font-semibold bg-white"
                  >
                    {DONATION_PURPOSES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    દાનનું વર્ષ *
                  </label>
                  <input
                    type="text"
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-saffron-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-800 mb-1">
                  વિશેષ હેતુ / સ્મૃતિ નોંધ
                </label>
                <input
                  type="text"
                  value={editSpecificPurpose}
                  onChange={(e) => setEditSpecificPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-saffron-600"
                />
              </div>

              {/* Date, Payment Method & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    દાન તારીખ *
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-saffron-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    ચુકવણી પદ્ધતિ *
                  </label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-saffron-600 font-medium bg-white"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    દાન સ્થિતિ *
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-saffron-600 font-bold bg-white"
                  >
                    <option value="approved">માન્ય (Approved)</option>
                    <option value="pending">પેન્ડિંગ (Pending)</option>
                    <option value="rejected">અસ્વીકાર (Rejected)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-800 mb-1">
                  રસીદ નંબર / ટ્રાન્ઝેક્શન રેફરન્સ
                </label>
                <input
                  type="text"
                  value={editReceiptNumber}
                  onChange={(e) => setEditReceiptNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-saffron-600 font-mono"
                />
              </div>

              {/* Image Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-ivory-200">
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    દાતાનો ફોટો (Donor Photo)
                  </label>
                  <ImageUploadWithCrop
                    currentImageUrl={editDonorPhoto}
                    onImageCropped={(url) => setEditDonorPhoto(url)}
                    aspectRatio={1}
                    aspectRatioLabel="૧:૧ (પાસપોર્ટ કદ)"
                    category="donor-photos"
                    label="દાતાનો ફોટો અપલોડ કરો"
                    helperText="વેબસાઇટ પર દાતાઓની યાદીમાં દર્શાવવા માટે."
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    ચુકવણી પ્રૂફ / રસીદ ફોટો
                  </label>
                  <ImageUploadWithCrop
                    currentImageUrl={editPaymentProof}
                    onImageCropped={(url) => setEditPaymentProof(url)}
                    aspectRatio={1}
                    aspectRatioLabel="સ્ક્રીનશોટ / રસીદ"
                    category="payment-proofs"
                    label="ચુકવણી સ્ક્રીનશોટ / રસીદ અપલોડ કરો"
                    helperText="ઓનલાઇન ટ્રાન્ઝેક્શન કે બેંક પાવતીનો ફોટો."
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-800 mb-1">
                  એડમિન શેરો / વિશેષ નોંધ (Admin Remarks)
                </label>
                <textarea
                  value={editAdminRemarks}
                  onChange={(e) => setEditAdminRemarks(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none focus:border-saffron-600"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-ivory-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-charcoal-800">
                  <input
                    type="checkbox"
                    checked={editPublicConsent}
                    onChange={(e) => setEditPublicConsent(e.target.checked)}
                    className="w-4 h-4 text-saffron-600 rounded border-ivory-300 focus:ring-saffron-500"
                  />
                  <span>વેબસાઇટ પર દાતાની યાદીમાં નામ અને રકમ દર્શાવવાની સંમતિ (Public Listing)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-charcoal-800">
                  <input
                    type="checkbox"
                    checked={editIsAnonymous}
                    onChange={(e) => setEditIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-saffron-600 rounded border-ivory-300 focus:ring-saffron-500"
                  />
                  <span>ગુપ્ત દાન (Anonymous Donor)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-ivory-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDonation(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-ivory-300 text-charcoal-700 font-bold hover:bg-ivory-100"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>ફેરફારો સાચવો (Save Changes)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
