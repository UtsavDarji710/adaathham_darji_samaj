"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Search,
  Plus,
  Clock,
  Sparkles,
  CheckCircle,
  X,
  User,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { JobPosting } from "@/types";

export default function JobsPage() {
  const { jobPostings, addJobPosting, addLog } = useData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState("ટેક્સટાઇલ & સિલાઇ");
  const [jobType, setJobType] = useState<JobPosting["job_type"]>("પૂર્ણ સમય (Full-time)");
  const [city, setCity] = useState("મોડાસા");
  const [salaryRange, setSalaryRange] = useState("");
  const [experience, setExperience] = useState("");
  const [description, setDescription] = useState("");
  const [contactPerson, setContactPerson] = useState(currentUser?.name || "");
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || "");
  const [contactEmail, setContactEmail] = useState(currentUser?.email || "");

  const filteredJobs = jobPostings.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "all" || job.job_type.includes(selectedType);

    return matchesSearch && matchesType;
  });

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !companyName.trim() || !contactPhone.trim()) {
      alert("કૃપા કરીને નોકરીનું શીર્ષક, કંપનીનું નામ અને સંપર્ક નંબર ભરો.");
      return;
    }

    addJobPosting({
      title: title.trim(),
      company_name: companyName.trim(),
      category,
      job_type: jobType,
      city: city.trim(),
      salary_range: salaryRange.trim() || undefined,
      experience: experience.trim() || undefined,
      description: description.trim(),
      contact_person: contactPerson.trim() || "સંચાલક",
      contact_phone: contactPhone.trim(),
      contact_email: contactEmail.trim() || undefined,
      posted_by: currentUser?.id,
      status: "active",
    });

    if (currentUser) {
      addLog(
        "નવી નોકરીની જાહેરાત",
        title,
        `કંપની: ${companyName}, શહેર: ${city}`,
        currentUser.name,
        currentUser.role || "member"
      );
    }

    setShowAddModal(false);
    setTitle("");
    setCompanyName("");
    setSalaryRange("");
    setExperience("");
    setDescription("");
    setSuccessToast("નોકરીની જાહેરાત સફળતાપૂર્વક મૂકવામાં આવી!");
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-ivory-300">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-bold mb-2">
            <Building className="w-3.5 h-3.5 text-forest-700" />
            <span>રોજગાર સહાયતા મંચ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            સમાજ નોકરી & રોજગાર ડિરેક્ટરી
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            સમાજના વ્યવસાયિકો દ્વારા ઉપલબ્ધ નોકરીની તકો અને સમાજના યુવાનો માટે રોજગારી સહકાર.
          </p>
        </div>

        {currentUser && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ નોકરીની જાહેરાત મૂકો</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-ivory-300 p-4 shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="નોકરીનું પદ, કંપની, અથવા શહેર શોધો..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-charcoal-400 flex-shrink-0" />
          <button
            onClick={() => setSelectedType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              selectedType === "all"
                ? "bg-forest-800 text-white"
                : "bg-ivory-100 text-charcoal-700 hover:bg-ivory-200"
            }`}
          >
            બધી ({jobPostings.length})
          </button>
          <button
            onClick={() => setSelectedType("પૂર્ણ સમય")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              selectedType === "પૂર્ણ સમય"
                ? "bg-forest-800 text-white"
                : "bg-ivory-100 text-charcoal-700 hover:bg-ivory-200"
            }`}
          >
            પૂર્ણ સમય (Full-time)
          </button>
          <button
            onClick={() => setSelectedType("અંશકાલીન")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              selectedType === "અંશકાલીન"
                ? "bg-forest-800 text-white"
                : "bg-ivory-100 text-charcoal-700 hover:bg-ivory-200"
            }`}
          >
            અંશકાલીન (Part-time)
          </button>
        </div>
      </div>

      {/* Jobs Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-3xl border border-ivory-300 p-5 shadow-card hover:shadow-hover hover:border-forest-300 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                  {job.job_type}
                </span>
                <span className="text-[11px] text-charcoal-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{job.created_at}</span>
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-charcoal-900 group-hover:text-forest-800 transition-colors">
                  {job.title}
                </h3>
                <p className="text-xs font-bold text-saffron-700 mt-0.5 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  <span>{job.company_name}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-600 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-forest-700" />
                  <span>{job.city}</span>
                </span>
                {job.salary_range && (
                  <span className="font-semibold text-charcoal-800 bg-ivory-100 px-2 py-0.5 rounded-md text-[11px]">
                    {job.salary_range}
                  </span>
                )}
                {job.experience && (
                  <span className="text-[11px] text-charcoal-500">
                    અનુભવ: {job.experience}
                  </span>
                )}
              </div>

              <p className="text-xs text-charcoal-600 line-clamp-3 leading-relaxed pt-1 border-t border-ivory-200">
                {job.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-ivory-200 flex items-center justify-between">
              <div className="text-[11px] text-charcoal-500">
                <span>સંપર્ક: </span>
                <span className="font-semibold text-charcoal-800">{job.contact_person}</span>
              </div>

              <a
                href={`tel:${job.contact_phone}`}
                className="px-3 py-1.5 bg-forest-50 hover:bg-forest-100 text-forest-800 font-bold text-xs rounded-xl border border-forest-200 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{job.contact_phone}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-ivory-300 p-8 space-y-3">
          <Briefcase className="w-10 h-10 text-charcoal-300 mx-auto" />
          <h3 className="font-bold text-base text-charcoal-800">કોઈ મેળ ખાતી નોકરી મળી નથી</h3>
          <p className="text-xs text-charcoal-500">
            અન્ય સર્ચ ટર્મ અથવા કેટેગરી પસંદ કરો, અથવા આપની પોતાની નોકરીની જાહેરાત મૂકો.
          </p>
        </div>
      )}

      {/* Post Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-forest-100 text-forest-800 rounded-xl">
                  <Building className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-charcoal-900">
                    નવી નોકરીની જાહેરાત મૂકો
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    સમાજના સભ્યો અને યુવાનો માટે આપના વ્યવસાયમાં રહેલ ખાલી જગ્યાની વિગત ભરો.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    નોકરીનું પદ / શીર્ષક (Job Title) *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="દા.ત. સિનિયર ટેલરિંગ માસ્ટર, સેલ્સ એક્ઝિક્યુટિવ"
                    required
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    કંપની / વ્યવસાયનું નામ *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="દા.ત. રોયલ મેન્સ ટેલર્સ"
                    required
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    ક્ષેત્ર / કેટેગરી *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:border-forest-500 focus:outline-none"
                  >
                    <option value="ટેક્સટાઇલ & સિલાઇ">ટેક્સટાઇલ & સિલાઇ</option>
                    <option value="એકાઉન્ટિંગ & ફાઇનાન્સ">એકાઉન્ટિંગ & ફાઇનાન્સ</option>
                    <option value="સેલ્સ & માર્કેટિંગ">સેલ્સ & માર્કેટિંગ</option>
                    <option value="ગ્રાફિક ડિઝાઇનિંગ & ફોટોગ્રાફી">ગ્રાફિક ડિઝાઇનિંગ & ફોટોગ્રાફી</option>
                    <option value="ઓટોમોબાઈલ & ટેકનિકલ">ઓટોમોબાઈલ & ટેકનિકલ</option>
                    <option value="અન્ય સેવાઓ">અન્ય સેવાઓ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    નોકરીનો પ્રકાર
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as JobPosting["job_type"])}
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:border-forest-500 focus:outline-none"
                  >
                    <option value="પૂર્ણ સમય (Full-time)">પૂર્ણ સમય (Full-time)</option>
                    <option value="અંશકાલીન (Part-time)">અંશકાલીન (Part-time)</option>
                    <option value="રિમોટ (Remote)">રિમોટ (Remote)</option>
                    <option value="ઇન્ટર્નશિપ (Internship)">ઇન્ટર્નશિપ (Internship)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    શહેર / સ્થળ *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="દા.ત. મોડાસા, અમદાવાદ"
                    required
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    અપેક્ષિત પગાર (Salary Range)
                  </label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="દા.ત. ₹18,000 - ₹25,000 / મહિનો"
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    જરૂરી અનુભવ
                  </label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="દા.ત. ૧ થી ૨ વર્ષ અથવા ફ્રેશર"
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    કામની વિગત (Job Description)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="નોકરી અંગે જરૂરી વિગતો અને જવાબદારીઓ જણાવો..."
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    સંપર્ક વ્યક્તિનું નામ *
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="દા.ત. દિનેશભાઈ દરજી"
                    required
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    સંપર્ક મોબાઈલ નંબર *
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="દા.ત. 98250 12345"
                    required
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-ivory-300 text-charcoal-700 text-xs font-bold rounded-xl hover:bg-ivory-50"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  જાહેરાત પ્રસિદ્ધ કરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

