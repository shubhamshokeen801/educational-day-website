"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  ExternalLink,
  Users,
  UserCheck,
} from "lucide-react";

interface RegistrationRow {
  id: string;
  payment_status: string;
  payment_verification: string;
  status: string;
  registered_at: string;
  user_id: string | null;
  team_id: string | null;
  phone_number?: string;
  institute_name?: string;
  qualification?: string;
  payment_proof_url?: string;
  event_type: "regular" | "mun";
  portfolio_preference_1?: string;
  portfolio_preference_2?: string;
  ip_category?: string;
  referral_name?: string;
  users?: { name: string; email: string };
  teams?: { team_name: string; team_code: string; leader_email?: string };
  team_members?: {
    name: string;
    email: string;
    phone_number?: string;
    role?: string;
  }[];
  events?: { name: string; is_paid?: boolean; registration_fee?: number };
}

interface Event {
  id: string;
  name: string;
  type: "regular" | "mun";
}

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedReferrals, setSelectedReferrals] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "verified" | "pending"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [showReferralDropdown, setShowReferralDropdown] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<any[]>([]);

  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [regsRes, eventsRes] = await Promise.all([
      fetch("/api/registrations"),
      fetch("/api/events"),
    ]);

    const regsData = await regsRes.json();
    const eventsData = await eventsRes.json();

    if (!regsData.error) setRegistrations(regsData);
    if (!eventsData.error) setEvents(eventsData);
    setLoading(false);
  };

  // Extract unique referral names (memoized to avoid recalculation)
  const uniqueReferrals = useMemo(() => {
    const referrals = new Set<string>();
    registrations.forEach((reg) => {
      if (reg.referral_name && reg.referral_name.trim()) {
        referrals.add(reg.referral_name.trim());
      }
    });
    return Array.from(referrals).sort();
  }, [registrations]);

  const updateStatus = async (
    id: string,
    field: "payment_verification" | "status",
    value: string,
    sendEmail: boolean = false
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          [field]: value,
          send_email: sendEmail,
        }),
      });

      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
        );
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
    setUpdatingId(null);
  };

  const openImageModal = (url: string) => {
    setModalImageUrl(url);
    setShowImageModal(true);
  };

  const openTeamModal = (members: any[]) => {
    setSelectedTeamMembers(members);
    setShowTeamModal(true);
  };

  const isFreeEvent = (reg: RegistrationRow) => {
    return reg.events?.is_paid === false || reg.events?.registration_fee === 0;
  };

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let result = registrations;

    // Status filter
    if (statusFilter === "verified") {
      result = result.filter((r) => r.status === "verified");
    } else if (statusFilter === "pending") {
      result = result.filter((r) => r.payment_status === "pending");
    }

    // Event filter
    if (selectedEvents.length > 0) {
      result = result.filter(
        (r) => r.events?.name && selectedEvents.includes(r.events.name)
      );
    }

    // Referral filter
    if (selectedReferrals.length > 0) {
      result = result.filter(
        (r) => r.referral_name && selectedReferrals.includes(r.referral_name)
      );
    }

    if (!query) return result;

    const numericQuery = query.replace(/\D/g, "");

    result = result.filter((reg) => {
      const user = reg.users;
      const team = reg.teams;
      const members = reg.team_members || [];
      const event = reg.events;

      const textMatch =
        user?.name?.toLowerCase().includes(query) ||
        user?.email?.toLowerCase().includes(query) ||
        team?.team_name?.toLowerCase().includes(query) ||
        team?.team_code?.toLowerCase().includes(query) ||
        event?.name?.toLowerCase().includes(query) ||
        team?.leader_email?.toLowerCase().includes(query) ||
        reg.institute_name?.toLowerCase().includes(query) ||
        reg.qualification?.toLowerCase().includes(query) ||
        reg.portfolio_preference_1?.toLowerCase().includes(query) ||
        reg.portfolio_preference_2?.toLowerCase().includes(query) ||
        reg.ip_category?.toLowerCase().includes(query) ||
        reg.referral_name?.toLowerCase().includes(query) ||
        members.some(
          (m) =>
            m.name?.toLowerCase().includes(query) ||
            m.email?.toLowerCase().includes(query)
        );

      const phoneMatch =
        numericQuery.length > 0 &&
        (reg.phone_number?.replace(/\D/g, "").includes(numericQuery) ||
          members.some((m) =>
            m.phone_number?.replace(/\D/g, "").includes(numericQuery)
          ));

      return textMatch || phoneMatch;
    });

    return result;
  }, [
    searchQuery,
    selectedEvents,
    selectedReferrals,
    statusFilter,
    registrations,
  ]);

  const verifiedCount = registrations.filter(
    (r) => r.status === "verified"
  ).length;
  const pendingPaymentCount = registrations.filter(
    (r) => r.payment_verification === "pending" && !isFreeEvent(r)
  ).length;
  const referralCount = registrations.filter(
    (r) => r.referral_name && r.referral_name.trim()
  ).length;

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const downloadCSV = () => {
    const headers = [
      "#",
      "Event Type",
      "Event",
      "Name",
      "Team Name",
      "Email",
      "Phone",
      "Institute",
      "Qualification",
      "Portfolio Pref 1",
      "Portfolio Pref 2",
      "IP Category",
      "Referral Name",
      "Team Members",
      "Payment Status",
      "Payment Verification",
      "Overall Status",
      "Registered At",
    ];

    const rows = filtered.map((reg, i) => {
      const user = reg.users;
      const team = reg.teams;
      const members =
        reg.team_members?.map((m) => `${m.name} (${m.email})`).join("; ") || "";
      const participantName = reg.team_id
        ? reg.team_members?.find((m) => m.role === "leader")?.name ||
          reg.team_members?.[0]?.name ||
          "—"
        : user?.name || "—";
      const teamName = reg.team_id ? team?.team_name || "—" : "—";
      const email = reg.team_id
        ? team?.leader_email || "—"
        : user?.email || "—";
      const phone =
        reg.phone_number || reg.team_members?.[0]?.phone_number || "—";

      return [
        i + 1,
        reg.event_type.toUpperCase(),
        reg.events?.name ?? "—",
        participantName,
        teamName,
        email,
        phone,
        reg.institute_name || "—",
        reg.qualification || "—",
        reg.portfolio_preference_1 || "—",
        reg.portfolio_preference_2 || "—",
        reg.ip_category || "—",
        reg.referral_name || "—",
        members || "—",
        isFreeEvent(reg) ? "—" : reg.payment_status,
        isFreeEvent(reg) ? "—" : reg.payment_verification,
        reg.status,
        new Date(reg.registered_at).toLocaleString(),
      ];
    });

    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registrations.csv";
    a.click();
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      verified: "bg-green-100 text-green-800 border-green-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
    } as const;
    return (
      <span
        className={`px-2 py-1 text-xs rounded border ${
          colors[status as keyof typeof colors] || colors.pending
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-28">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setStatusFilter("verified");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "verified"
                    ? "bg-green-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Verified: <span className="font-bold">{verifiedCount}</span>
              </button>
              <button
                onClick={() => {
                  setStatusFilter("pending");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "pending"
                    ? "bg-yellow-500 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Pending Payment:{" "}
                <span className="font-bold">{pendingPaymentCount}</span>
              </button>
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Total: <span className="font-bold">{registrations.length}</span>
              </button>
              {/* <div className="px-4 py-2 bg-purple-50 border border-purple-300 rounded-lg text-sm font-medium text-purple-700">
                With Referrals: <span className="font-bold">{referralCount}</span>
              </div> */}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, email, team, phone, qualification, referral..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Event Filter */}
            <div className="relative">
              <button
                onClick={() => setShowEventDropdown(!showEventDropdown)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 min-w-[200px]"
              >
                <span className="flex-1 text-left text-sm">
                  {selectedEvents.length === 0
                    ? "Filter by Events"
                    : `${selectedEvents.length} events`}
                </span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    showEventDropdown ? "rotate-90" : ""
                  }`}
                />
              </button>

              {showEventDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowEventDropdown(false)}
                  />
                  <div className="absolute z-20 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-auto">
                    {selectedEvents.length > 0 && (
                      <div className="p-2 border-b bg-gray-50">
                        <button
                          onClick={() => {
                            setSelectedEvents([]);
                            setCurrentPage(1);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Clear all
                        </button>
                      </div>
                    )}
                    {events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => {
                          setSelectedEvents((prev) =>
                            prev.includes(event.name)
                              ? prev.filter((e) => e !== event.name)
                              : [...prev, event.name]
                          );
                          setCurrentPage(1);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 text-left"
                      >
                        <div
                          className={`w-4 h-4 border rounded flex items-center justify-center ${
                            selectedEvents.includes(event.name)
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedEvents.includes(event.name) && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="flex-1">{event.name}</span>
                        <span className="text-xs text-gray-500 uppercase">
                          {event.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Referral Filter */}
            <div className="relative">
              <button
                onClick={() => setShowReferralDropdown(!showReferralDropdown)}
                className="px-4 py-2 border border-purple-300 bg-purple-50 rounded-lg hover:bg-purple-100 flex items-center gap-2 min-w-[200px]"
              >
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span className="flex-1 text-left text-sm text-purple-700">
                  {selectedReferrals.length === 0
                    ? "Filter by Referrals"
                    : `${selectedReferrals.length} referrals`}
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-purple-600 transition-transform ${
                    showReferralDropdown ? "rotate-90" : ""
                  }`}
                />
              </button>

              {showReferralDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowReferralDropdown(false)}
                  />
                  <div className="absolute z-20 mt-1 w-64 bg-white border border-purple-300 rounded-lg shadow-lg max-h-80 overflow-auto">
                    {selectedReferrals.length > 0 && (
                      <div className="p-2 border-b bg-purple-50">
                        <button
                          onClick={() => {
                            setSelectedReferrals([]);
                            setCurrentPage(1);
                          }}
                          className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Clear all
                        </button>
                      </div>
                    )}
                    {uniqueReferrals.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No referrals found
                      </div>
                    ) : (
                      uniqueReferrals.map((referral) => (
                        <button
                          key={referral}
                          onClick={() => {
                            setSelectedReferrals((prev) =>
                              prev.includes(referral)
                                ? prev.filter((r) => r !== referral)
                                : [...prev, referral]
                            );
                            setCurrentPage(1);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-purple-50 text-left"
                        >
                          <div
                            className={`w-4 h-4 border rounded flex items-center justify-center ${
                              selectedReferrals.includes(referral)
                                ? "bg-purple-600 border-purple-600"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedReferrals.includes(referral) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="flex-1 font-medium">{referral}</span>
                          <span className="text-xs text-gray-500">
                            (
                            {
                              registrations.filter(
                                (r) => r.referral_name === referral
                              ).length
                            }
                            )
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Download */}
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">#</th>
                  <th className="px-3 py-3 text-left font-semibold">Name</th>
                  <th className="px-3 py-3 text-left font-semibold">
                    Team Name
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">Phone</th>
                  <th className="px-3 py-3 text-left font-semibold">Email</th>
                  <th className="px-3 py-3 text-left font-semibold">Event</th>
                  <th className="px-3 py-3 text-left font-semibold">
                    Institution
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">
                    Qualification
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">
                    Portfolio Pref 1
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">
                    Portfolio Pref 2
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">
                    IP Category
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">
                    Referral
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">
                    Team Members
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">
                    Payment SS
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">
                    Payment Status
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">
                    Payment Verification
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={17}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={17}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No registrations found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((reg, idx) => {
                    const globalIdx =
                      (currentPage - 1) * itemsPerPage + idx + 1;
                    const user = reg.users;
                    const team = reg.teams;
                    const participantName = reg.team_id
                      ? reg.team_members?.find((m) => m.role === "leader")
                          ?.name ||
                        reg.team_members?.[0]?.name ||
                        "—"
                      : user?.name || "—";
                    const teamName = reg.team_id ? team?.team_name || "—" : "—";
                    const phone =
                      reg.phone_number ||
                      reg.team_members?.[0]?.phone_number ||
                      "—";
                    const email = reg.team_id
                      ? team?.leader_email
                      : user?.email;
                    const isFree = isFreeEvent(reg);
                    const hasTeamMembers =
                      reg.team_id &&
                      reg.team_members &&
                      reg.team_members.length > 0;

                    return (
                      <tr key={reg.id} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-3">{globalIdx}</td>
                        <td className="px-3 py-3">{participantName}</td>
                        <td className="px-3 py-3">{teamName}</td>
                        <td className="px-3 py-3">{phone}</td>
                        <td className="px-3 py-3 text-blue-600">
                          {email || "—"}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <span>{reg.events?.name || "—"}</span>
                            <span className="text-xs text-gray-500 uppercase">
                              {reg.event_type}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {reg.institute_name || "—"}
                        </td>
                        <td className="px-3 py-3">
                          {reg.qualification || "—"}
                        </td>
                        <td className="px-3 py-3">
                          {reg.portfolio_preference_1 || "—"}
                        </td>
                        <td className="px-3 py-3">
                          {reg.portfolio_preference_2 || "—"}
                        </td>
                        <td className="px-3 py-3">{reg.ip_category || "—"}</td>
                        <td className="px-3 py-3">
                          {reg.referral_name ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                              {reg.referral_name}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {hasTeamMembers ? (
                            <button
                              onClick={() => openTeamModal(reg.team_members!)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                            >
                              <Users className="w-4 h-4" />
                              <span className="text-xs">
                                ({reg.team_members!.length})
                              </span>
                            </button>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {isFree ? (
                            <span className="text-gray-400">—</span>
                          ) : reg.payment_proof_url ? (
                            <button
                              onClick={() =>
                                openImageModal(reg.payment_proof_url!)
                              }
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-gray-400">No SS</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {isFree ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            <StatusBadge status={reg.payment_status} />
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {isFree ? (
                            <span className="text-gray-400">—</span>
                          ) : reg.payment_verification === "verified" ? (
                            <StatusBadge status="verified" />
                          ) : reg.payment_verification === "rejected" ? (
                            <StatusBadge status="rejected" />
                          ) : (
                            <button
                              onClick={() =>
                                updateStatus(
                                  reg.id,
                                  "payment_verification",
                                  "verified",
                                  true
                                )
                              }
                              disabled={updatingId === reg.id}
                              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-medium"
                            >
                              {updatingId === reg.id
                                ? "Sending..."
                                : "Confirm & Email"}
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={reg.status}
                            onChange={(e) =>
                              updateStatus(reg.id, "status", e.target.value)
                            }
                            disabled={updatingId === reg.id}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filtered.length)} of{" "}
                {filtered.length} registrations
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={modalImageUrl}
              alt="Payment Screenshot"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Team Members Modal */}
      {showTeamModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setShowTeamModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members ({selectedTeamMembers.length})
              </h3>
              <button
                onClick={() => setShowTeamModal(false)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">#</th>
                    <th className="px-4 py-2 text-left font-semibold">Name</th>
                    <th className="px-4 py-2 text-left font-semibold">Email</th>
                    <th className="px-4 py-2 text-left font-semibold">Phone</th>
                    <th className="px-4 py-2 text-left font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTeamMembers.map((member, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3">{member.name}</td>
                      <td className="px-4 py-3 text-blue-600">
                        {member.email}
                      </td>
                      <td className="px-4 py-3">
                        {member.phone_number || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            member.role === "leader"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
