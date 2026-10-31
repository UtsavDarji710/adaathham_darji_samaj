"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Users,
  Search,
  Plus,
  GitFork,
  X,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Shield,
  Eye,
  CheckCircle,
  Clock,
  Layers,
  ListFilter,
  Trash2,
  Lock,
  LogIn,
  UserPlus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import FamilyTreeNode from "@/components/FamilyTreeNode";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Member, RelationshipType, FamilyRelationship } from "@/types";

const nodeTypes = {
  familyNode: FamilyTreeNode,
};

const RELATIONSHIP_OPTIONS: { type: RelationshipType; label: string }[] = [
  { type: "husband", label: "પતિ (Husband)" },
  { type: "wife", label: "પત્ની (Wife)" },
  { type: "father", label: "પિતા (Father)" },
  { type: "mother", label: "માતા (Mother)" },
  { type: "son", label: "પુત્ર (Son)" },
  { type: "daughter", label: "પુત્રી (Daughter)" },
  { type: "brother", label: "ભાઈ (Brother)" },
  { type: "sister", label: "બહેન (Sister)" },
  { type: "father_in_law", label: "સસરા (Father-in-law)" },
  { type: "mother_in_law", label: "સાસુ (Mother-in-law)" },
  { type: "sister_in_law_nanand", label: "નણંદ (Husband's Sister)" },
  { type: "sister_in_law_bhabhi", label: "ભાભી (Brother's Wife)" },
  { type: "brother_in_law_banevi", label: "બનેવી (Sister's Husband)" },
  { type: "uncle_paternal", label: "કાકા (Paternal Uncle)" },
  { type: "aunt_paternal", label: "કાકી (Paternal Aunt)" },
  { type: "uncle_maternal", label: "મામા (Maternal Uncle)" },
  { type: "aunt_maternal", label: "મામી (Maternal Aunt)" },
  { type: "nephew", label: "ભત્રીજો (Nephew)" },
  { type: "niece", label: "ભત્રીજી (Niece)" },
  { type: "other", label: "અન્ય માન્ય પારિવારિક સંબંધો" },
];

export default function FamilyTreePage() {
  const { members, relationships, addRelationship, approveRelationship, deleteRelationship, addLog } = useData();
  const { currentUser, isAdmin, loginAs } = useAuth();

  // Selected center member for tree view (defaults to currentUser or first member)
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    currentUser?.id || members[0]?.id || "mem-1"
  );

  // Automatically focus on logged-in member's family when user logs in
  React.useEffect(() => {
    if (currentUser?.id) {
      setSelectedMemberId(currentUser.id);
    }
  }, [currentUser?.id]);
  const [inspectedMember, setInspectedMember] = useState<Member | null>(null);

  // Search & add relationship state
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetMemberForRelation, setTargetMemberForRelation] = useState<Member | null>(null);
  const [chosenRelation, setChosenRelation] = useState<RelationshipType>("son");
  const [customRelationNote, setCustomRelationNote] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // View mode: 'graph' or 'list'
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");

  const centerMember = useMemo(() => {
    return members.find((m) => m.id === selectedMemberId) || members[0];
  }, [members, selectedMemberId]);

  // Find relationships connected to centerMember
  const directRelationships = useMemo(() => {
    if (!centerMember) return [];
    return relationships.filter(
      (r) => r.from_member_id === centerMember.id || r.to_member_id === centerMember.id
    );
  }, [relationships, centerMember]);

  // Build ReactFlow Nodes and Edges
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!centerMember) return { initialNodes: [], initialEdges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Center Node (Selected Member)
    nodes.push({
      id: centerMember.id,
      type: "familyNode",
      position: { x: 380, y: 220 },
      data: {
        member: centerMember,
        isCenter: true,
        relationshipLabel: "કેન્દ્ર સભ્ય",
        onSelect: (m: Member) => setInspectedMember(m),
      },
    });

    // Group related members into Parents, Spouses, Children, Siblings/Relatives
    const related = relationships.filter(
      (r) => (r.from_member_id === centerMember.id || r.to_member_id === centerMember.id) && r.status === "approved"
    );

    let parentCount = 0;
    let childCount = 0;
    let spouseCount = 0;
    let relativeCount = 0;

    related.forEach((rel) => {
      const isFrom = rel.from_member_id === centerMember.id;
      const otherId = isFrom ? rel.to_member_id : rel.from_member_id;
      const otherMember = members.find((m) => m.id === otherId);

      if (!otherMember) return;

      // Determine positioning based on relationship type
      let posX = 380;
      let posY = 220;
      const rType = rel.relationship;

      if (rType === "husband" || rType === "wife") {
        posX = 380 + (spouseCount + 1) * 320;
        posY = 220;
        spouseCount++;
      } else if (rType === "father" || rType === "mother" || rType === "father_in_law" || rType === "mother_in_law") {
        posX = 150 + parentCount * 340;
        posY = 20;
        parentCount++;
      } else if (rType === "son" || rType === "daughter") {
        posX = 150 + childCount * 340;
        posY = 440;
        childCount++;
      } else {
        posX = 50 - relativeCount * 180;
        posY = 220 + (relativeCount % 2 === 0 ? 80 : -80);
        relativeCount++;
      }

      nodes.push({
        id: otherMember.id,
        type: "familyNode",
        position: { x: posX, y: posY },
        data: {
          member: otherMember,
          isCenter: false,
          relationshipLabel: rel.relationship_label,
          onSelect: (m: Member) => setInspectedMember(m),
        },
      });

      edges.push({
        id: `e-${rel.id}`,
        source: isFrom ? centerMember.id : otherMember.id,
        target: isFrom ? otherMember.id : centerMember.id,
        label: rel.relationship_label,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#c2410c", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#c2410c",
        },
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [centerMember, relationships, members]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state when nodes/edges change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle relationship submission
  const handleAddRelationshipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !centerMember || !targetMemberForRelation) return;

    const chosenOption = RELATIONSHIP_OPTIONS.find((o) => o.type === chosenRelation);
    const label = chosenOption?.label.split(" (")[0] || "સંબંધી";

    addRelationship({
      from_member_id: centerMember.id,
      from_member_name: centerMember.name,
      to_member_id: targetMemberForRelation.id,
      to_member_name: targetMemberForRelation.name,
      relationship: chosenRelation,
      relationship_label: label,
      status: isAdmin ? "approved" : "pending",
      requested_by: currentUser.id,
      approved_by: isAdmin ? currentUser.name : undefined,
    });

    addLog(
      "પરિવાર સંબંધ વિનંતી",
      `${centerMember.name} ↔ ${targetMemberForRelation.name}`,
      `સંબંધ: ${label} (સ્થિતિ: ${isAdmin ? "મંજૂર" : "ચકાસણી હેઠળ"})`,
      currentUser.name,
      currentUser.role || "member"
    );

    setShowAddModal(false);
    setTargetMemberForRelation(null);
    setSearchQuery("");
    setSuccessMessage(`સંબંધ વિનંતી સફળતાપૂર્વક સાચવાઈ ગઈ છે! ${isAdmin ? "સંબંધ માન્ય થઈ ગયો છે." : "મંજૂરી માટે મોકલાઈ છે."}`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Filtered members for relationship search
  const filteredSearchMembers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return members
      .filter((m) => m.id !== centerMember?.id)
      .filter((m) => m.name.toLowerCase().includes(q) || m.city.toLowerCase().includes(q) || m.native_place.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery, members, centerMember]);

  // Lock Guard: Only logged-in users can see the family tree
  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-ivory-100 via-ivory-50 to-white">
        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl border border-ivory-300 shadow-xl overflow-hidden p-6 sm:p-10 relative">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-saffron-100/60 via-amber-50/40 to-transparent rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-forest-100/50 via-forest-50/20 to-transparent rounded-tr-full pointer-events-none" />

          {/* Header & Logo */}
          <div className="text-center relative z-10">
            <div className="relative inline-block mb-4">
              <img
                src="/logo.png"
                alt="અડાઆઠમ દરજી સેવા સમિતિ"
                width={80}
                height={80}
                style={{ width: "80px", height: "80px", minWidth: "80px" }}
                className="w-20 h-20 object-contain rounded-full shadow-md mx-auto border-2 border-saffron-300 bg-white p-1"
              />
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-amber-500 to-amber-600 text-white p-1.5 rounded-full shadow-md border-2 border-white">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-3">
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span>સુરક્ષિત સભ્ય ઝોન • ગોપનીયતા રક્ષિત</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              પરિવાર વૃક્ષ જોવા માટે લૉગિન આવશ્યક છે
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2 max-w-lg mx-auto leading-relaxed">
              અડાઆઠમ દરજી સમાજના પરિવાર સભ્યોની ગોપીનીયતા અને વંશાવળીની સુરક્ષા ખાતર, ડિજિટલ પરિવાર વૃક્ષ અને સગાં-સંબંધીઓની વિગતો <strong>માત્ર લૉગિન થયેલા સભ્યો</strong> માટે જ ઉપલબ્ધ છે.
            </p>
          </div>

          {/* 3 Value Highlight Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-7 relative z-10">
            <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 text-center">
              <div className="w-8 h-8 rounded-xl bg-saffron-100 text-saffron-800 flex items-center justify-center mx-auto mb-2 font-bold">
                <GitFork className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-charcoal-900 mb-1">ઇન્ટરેક્ટિવ વંશાવળી</h4>
              <p className="text-[11px] text-charcoal-600 leading-normal">
                દાદા-પિતા, સંતાનો અને સગાં-સંબંધીઓનો સંપૂર્ણ ડિજિટલ નકશો.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 text-center">
              <div className="w-8 h-8 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center mx-auto mb-2 font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-charcoal-900 mb-1">૧૦૦% અંગત સુરક્ષા</h4>
              <p className="text-[11px] text-charcoal-600 leading-normal">
                સભ્યોના મોબાઇલ નંબર અને અંગત વિગતો જાહેર જનતા માટે લૉક.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 text-center">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2 font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-charcoal-900 mb-1">સંબંધો જોડો</h4>
              <p className="text-[11px] text-charcoal-600 leading-normal">
                તમારા પરિવારના નવા સભ્યો અને સંબંધો વંશાવળીમાં ઉમેરો.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
            >
              <LogIn className="w-4 h-4" />
              <span>સભ્ય લૉગિન કરો</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-ivory-100 text-charcoal-800 font-bold text-xs sm:text-sm border border-ivory-300 shadow-2xs transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-forest-700" />
              <span>નવા સભ્યની નોંધણી</span>
            </Link>
          </div>

          {/* Quick 1-Click Role Testing Hub for immediate verification */}
          <div className="mt-8 pt-6 border-t border-ivory-200 relative z-10">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold text-charcoal-600 inline-flex items-center gap-1.5 bg-ivory-100 px-3 py-1 rounded-full border border-ivory-300">
                <Sparkles className="w-3 h-3 text-saffron-600" />
                ટેસ્ટિંગ માટે ઝડપી ૧-ક્લિક લૉગિન (Quick Unlock)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => loginAs("president")}
                className="p-2.5 rounded-xl border border-saffron-200 hover:border-saffron-400 bg-saffron-50/70 hover:bg-saffron-100/80 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">👑</span>
                  <div>
                    <div className="font-bold text-xs text-saffron-950 group-hover:text-saffron-800">
                      પ્રમુખ શ્રી
                    </div>
                    <div className="text-[10px] text-saffron-700">દિનેશભાઈ દરજી</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => loginAs("secretary")}
                className="p-2.5 rounded-xl border border-purple-200 hover:border-purple-400 bg-purple-50/70 hover:bg-purple-100/80 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📋</span>
                  <div>
                    <div className="font-bold text-xs text-purple-950 group-hover:text-purple-800">
                      મંત્રી શ્રી
                    </div>
                    <div className="text-[10px] text-purple-700">મહેન્દ્રભાઈ દરજી</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => loginAs("member")}
                className="p-2.5 rounded-xl border border-forest-200 hover:border-forest-400 bg-forest-50/70 hover:bg-forest-100/80 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">👤</span>
                  <div>
                    <div className="font-bold text-xs text-forest-950 group-hover:text-forest-800">
                      સામાન્ય સભ્ય
                    </div>
                    <div className="text-[10px] text-forest-700">ભાવિનકુમાર દરજી</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Navigation controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-saffron-100 text-saffron-800">
              <GitFork className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
              પરિવાર વૃક્ષ (Family Tree)
            </h1>
          </div>
          <p className="text-sm text-charcoal-600 mt-1">
            અડાઆઠમ દરજી સમાજના પરિવારો અને વંશાવળીના સંબંધોની ઇન્ટરેક્ટિવ ડિજિટલ રજૂઆત.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Select active member dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-ivory-300 rounded-xl px-3 py-1.5 shadow-sm text-xs">
            <span className="text-charcoal-500 font-medium">સભ્ય પસંદ કરો:</span>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="bg-transparent font-bold text-charcoal-800 focus:outline-none cursor-pointer"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.city})
                </option>
              ))}
            </select>
          </div>

          {/* Toggle view mode */}
          <div className="flex items-center bg-ivory-200 p-1 rounded-xl border border-ivory-300 text-xs">
            <button
              onClick={() => setViewMode("graph")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === "graph"
                  ? "bg-white text-saffron-800 shadow-sm"
                  : "text-charcoal-600 hover:text-charcoal-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              ગ્રાફ વ્યૂ
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === "list"
                  ? "bg-white text-saffron-800 shadow-sm"
                  : "text-charcoal-600 hover:text-charcoal-900"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              યાદી વ્યૂ
            </button>
          </div>

          {/* Add relationship button */}
          <button
            onClick={() => {
              if (!currentUser) {
                setSuccessMessage("પરિવાર વૃક્ષમાં સભ્ય જોડવા માટે પ્રથમ લૉગિન કરવું જરૂરી છે. કૃપા કરીને ઉપર લૉગિન બટન દબાવો.");
                return;
              }
              setShowAddModal(true);
              setTargetMemberForRelation(null);
            }}
            className="flex items-center gap-1.5 bg-saffron-600 hover:bg-saffron-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            પરિવાર સભ્ય જોડો
          </button>
        </div>
      </div>

      {/* Dynamic Role Status Bar */}
      <div className={`mb-6 p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        !currentUser
          ? "bg-amber-50/80 border-amber-200 text-amber-900"
          : isAdmin
          ? "bg-purple-50/80 border-purple-200 text-purple-900"
          : "bg-forest-50/80 border-forest-200 text-forest-900"
      }`}>
        <div className="flex items-center gap-2.5">
          <GitFork className="w-4 h-4 flex-shrink-0 text-saffron-700" />
          <span>
            {!currentUser ? (
              <span>
                તમે <strong>અતિથિ (Guest)</strong> તરીકે પરિવાર વૃક્ષ જોઈ રહ્યા છો. તમારા પરિવાર સાથે જોડાવા માટે સભ્ય લૉગિન જરૂરી છે.
              </span>
            ) : isAdmin ? (
              <span>
                તમે <strong>{currentUser.committee_role || "એડમિન હોદ્દેદાર"}</strong> તરીકે સક્રિય છો: સભ્યો દ્વારા મોકલાયેલા સંબંધો ચકાસી શકો છો અને નવો સંબંધ સીધો મંજૂર કરી શકો છો.
              </span>
            ) : (
              <span>
                તમે <strong>સભ્ય ({currentUser.name})</strong> તરીકે છો: તમે તમારા પરિવારના સભ્યોને જોડવાની વિનંતી મોકલી શકો છો.
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
          {!currentUser ? (
            <Link
              href="/login"
              className="px-3 py-1 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors"
            >
              સભ્ય લૉગિન કરો →
            </Link>
          ) : (
            <span className="text-[11px] font-bold bg-white px-2.5 py-1 rounded-lg border border-ivory-300">
              {isAdmin ? "🛡️ એડમિન એડિટર" : "👤 સભ્ય એડિટર"}
            </span>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle className="w-5 h-5 text-forest-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-forest-600 hover:text-forest-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Member Bar */}
      <div className="bg-white border border-ivory-300 rounded-2xl p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={centerMember?.photo_url}
            alt={centerMember?.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-saffron-500 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-charcoal-900">{centerMember?.name}</h2>
              <span className="text-xs bg-saffron-100 text-saffron-800 font-bold px-2 py-0.5 rounded-full">
                {centerMember?.committee_role || "સમાજ સભ્ય"}
              </span>
            </div>
            <p className="text-xs text-charcoal-600 flex items-center gap-2 mt-0.5">
              <span>વતન: {centerMember?.native_place}</span>
              <span>•</span>
              <span>હાલ: {centerMember?.city}</span>
              <span>•</span>
              <span className="text-forest-700 font-medium">જોડાયેલા સંબંધો: {directRelationships.length}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInspectedMember(centerMember)}
            className="px-3.5 py-2 rounded-xl border border-ivory-300 hover:border-saffron-500 text-charcoal-700 hover:text-saffron-700 font-bold text-xs bg-ivory-50 transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            સંપૂર્ણ પ્રોફાઇલ જુઓ
          </button>
        </div>
      </div>

      {/* Main View Container */}
      {viewMode === "graph" ? (
        <div className="relative w-full h-[640px] bg-white rounded-3xl border border-ivory-300 shadow-card overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#e7decb" gap={20} size={1} />
            <Controls className="!bg-white !rounded-xl !border-ivory-300 !shadow-sm" />
          </ReactFlow>

          {/* Canvas Floating Instructions */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md border border-ivory-300 rounded-xl px-3 py-2 text-xs text-charcoal-600 shadow-sm pointer-events-none hidden sm:block">
            💡 માઉસ વડે ઝૂમ અને ડ્રેગ કરી શકાય છે. કોઈપણ સભ્ય પર ક્લિક કરીને વિગતો જુઓ.
          </div>
        </div>
      ) : (
        /* Mobile-Friendly List View */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm">
            <h3 className="font-bold text-base text-charcoal-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-saffron-600" />
              {centerMember?.name} સાથે જોડાયેલા પારિવારિક સંબંધો ({directRelationships.length})
            </h3>

            {directRelationships.length === 0 ? (
              <div className="text-center py-12 text-charcoal-500 text-sm">
                હજુ સુધી આ સભ્ય સાથે કોઈ પારિવારિક સંબંધ જોડાયેલ નથી.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {directRelationships.map((rel) => {
                  const otherId = rel.from_member_id === centerMember.id ? rel.to_member_id : rel.from_member_id;
                  const otherMember = members.find((m) => m.id === otherId);
                  if (!otherMember) return null;

                  return (
                    <div
                      key={rel.id}
                      className="p-4 rounded-xl border border-ivory-200 hover:border-saffron-300 bg-ivory-50/50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer min-w-0"
                        onClick={() => setInspectedMember(otherMember)}
                      >
                        <img
                          src={otherMember.photo_url}
                          alt={otherMember.name}
                          className="w-12 h-12 rounded-xl object-cover border border-ivory-300 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold bg-saffron-100 text-saffron-800 px-2 py-0.5 rounded-full inline-block mb-1">
                            {rel.relationship_label}
                          </span>
                          <h4 className="font-bold text-sm text-charcoal-900 truncate hover:text-saffron-700">
                            {otherMember.name}
                          </h4>
                          <p className="text-xs text-charcoal-500 truncate">
                            {otherMember.city} ({otherMember.native_place})
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rel.status === "approved"
                              ? "bg-forest-100 text-forest-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {rel.status === "approved" ? "મંજૂર" : "ચકાસણી હેઠળ"}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (confirm("શું તમે આ સંબંધ દૂર કરવા માંગો છો? સભ્યનું ખાતું કાઢી નખાશે નહીં.")) {
                                deleteRelationship(rel.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="સંબંધ દૂર કરો"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Member Details Drawer */}
      {inspectedMember && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-ivory-300">
              <span className="text-xs font-bold text-saffron-700 uppercase tracking-wider">
                સભ્યની વિગતવાર માહિતી
              </span>
              <button
                onClick={() => setInspectedMember(null)}
                className="p-1 rounded-lg hover:bg-ivory-100 text-charcoal-500 hover:text-charcoal-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 text-center border-b border-ivory-200">
              <img
                src={inspectedMember.photo_url}
                alt={inspectedMember.name}
                className="w-24 h-24 rounded-2xl object-cover mx-auto border-3 border-saffron-500 shadow-md mb-3"
              />
              <h3 className="font-bold text-lg text-charcoal-900">{inspectedMember.name}</h3>
              <p className="text-xs text-saffron-800 font-semibold mt-0.5">
                {inspectedMember.committee_role || "સમાજ સભ્ય"}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-xs bg-ivory-200 text-charcoal-700 px-2.5 py-0.5 rounded-full font-medium">
                  વતન: {inspectedMember.native_place}
                </span>
                <span className="text-xs bg-ivory-200 text-charcoal-700 px-2.5 py-0.5 rounded-full font-medium">
                  હાલ: {inspectedMember.city}
                </span>
              </div>
            </div>

            {/* Profile Information List */}
            <div className="py-5 space-y-4 text-xs">
              {/* Phone with Privacy Check */}
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-saffron-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-charcoal-500 block">સંપર્ક નંબર:</span>
                  {inspectedMember.privacy.phone === "private" && !isAdmin && currentUser?.id !== inspectedMember.id ? (
                    <span className="text-charcoal-400 italic flex items-center gap-1 font-semibold">
                      <Lock className="w-3 h-3" /> ગોપનીય (ખાનગી રાખેલ છે)
                    </span>
                  ) : (
                    <span className="font-bold text-charcoal-900">{inspectedMember.phone}</span>
                  )}
                </div>
              </div>

              {/* Lineage Details */}
              {(inspectedMember.father_name || inspectedMember.grandfather_name) && (
                <div className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200 space-y-1">
                  {inspectedMember.father_name && (
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-charcoal-500">પિતાનું નામ:</span>
                      <span className="font-bold text-charcoal-900">{inspectedMember.father_name}</span>
                    </div>
                  )}
                  {inspectedMember.grandfather_name && (
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-charcoal-500">દાદાનું નામ:</span>
                      <span className="font-bold text-charcoal-900">{inspectedMember.grandfather_name}</span>
                    </div>
                  )}
                </div>
              )}

              {(inspectedMember.maternal_uncle_name || inspectedMember.maternal_grandfather_name) && (
                <div className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200 space-y-1">
                  {inspectedMember.maternal_uncle_name && (
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-charcoal-500">મામાનું નામ:</span>
                      <span className="font-bold text-charcoal-900">{inspectedMember.maternal_uncle_name}</span>
                    </div>
                  )}
                  {inspectedMember.maternal_grandfather_name && (
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-charcoal-500">નાનાનું નામ:</span>
                      <span className="font-bold text-charcoal-900">{inspectedMember.maternal_grandfather_name}</span>
                    </div>
                  )}
                </div>
              )}

              {inspectedMember.marital_status && (
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 flex-shrink-0 text-center text-xs">💍</div>
                  <div className="flex-1">
                    <span className="text-charcoal-500 block">લગ્ન સ્થિતિ (Married Status):</span>
                    <span className="font-bold text-saffron-800">{inspectedMember.marital_status}</span>
                  </div>
                </div>
              )}

              {/* Address with Privacy Check */}
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-saffron-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-charcoal-500 block">સરનામું:</span>
                  {inspectedMember.privacy.address === "private" && !isAdmin && currentUser?.id !== inspectedMember.id ? (
                    <span className="text-charcoal-400 italic flex items-center gap-1 font-semibold">
                      <Lock className="w-3 h-3" /> સરનામું ખાનગી રાખેલ છે
                    </span>
                  ) : (
                    <span className="font-medium text-charcoal-800">
                      {inspectedMember.address}, {inspectedMember.city} - {inspectedMember.pincode}
                    </span>
                  )}
                </div>
              </div>

              {/* Employment */}
              {inspectedMember.employment && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-charcoal-500 block">વ્યવસાય / નોકરી:</span>
                    <span className="font-bold text-charcoal-900">{inspectedMember.employment.job_title}</span>
                    <span className="text-charcoal-600 block mt-0.5">
                      {inspectedMember.employment.company} ({inspectedMember.employment.city})
                    </span>
                  </div>
                </div>
              )}

              {/* Education */}
              {inspectedMember.education && (
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-saffron-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-charcoal-500 block">શૈક્ષણિક લાયકાત:</span>
                    <span className="font-bold text-charcoal-900">
                      {inspectedMember.education.highest_degree}
                    </span>
                    <span className="text-charcoal-600 block mt-0.5">
                      {inspectedMember.education.institution} ({inspectedMember.education.passing_year})
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-ivory-200 flex gap-2">
              <button
                onClick={() => {
                  setSelectedMemberId(inspectedMember.id);
                  setInspectedMember(null);
                }}
                className="flex-1 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                આ સભ્યનું વૃક્ષ જુઓ
              </button>
              <button
                onClick={() => setInspectedMember(null)}
                className="px-4 py-2.5 border border-ivory-300 text-charcoal-700 hover:bg-ivory-100 font-semibold rounded-xl text-xs"
              >
                બંધ કરો
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Family Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-ivory-300 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-saffron-100 text-saffron-700">
                  <Plus className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-base text-charcoal-900">
                  પરિવારના સભ્યને જોડો
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-charcoal-400 hover:text-charcoal-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRelationshipSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  મુખ્ય સભ્ય:
                </label>
                <div className="p-2.5 rounded-xl bg-ivory-100 border border-ivory-300 text-xs font-bold text-charcoal-800">
                  {centerMember?.name} ({centerMember?.city})
                </div>
              </div>

              {/* Step 1: Search member */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  પરિવારના સભ્યનું નામ શોધો *
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-charcoal-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="નામ, ગામ અથવા શહેર લખો..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                  />
                </div>

                {/* Filtered suggestions list */}
                {searchQuery.trim() !== "" && (
                  <div className="mt-2 border border-ivory-300 rounded-xl bg-white max-h-48 overflow-y-auto divide-y divide-ivory-100 shadow-sm">
                    {filteredSearchMembers.length > 0 ? (
                      filteredSearchMembers.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setTargetMemberForRelation(m);
                            setSearchQuery("");
                          }}
                          className="p-2.5 hover:bg-saffron-50 cursor-pointer flex items-center gap-3 transition-colors text-xs"
                        >
                          <img
                            src={m.photo_url}
                            alt={m.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-bold text-charcoal-900 block">{m.name}</span>
                            <span className="text-[11px] text-charcoal-500">
                              {m.city} ({m.native_place})
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-charcoal-500">
                        કોઈ સભ્ય મળ્યો નથી. કૃપા કરીને અન્ય નામ લખો.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Target Member Badge */}
              {targetMemberForRelation && (
                <div className="p-3 rounded-xl bg-saffron-50 border border-saffron-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={targetMemberForRelation.photo_url}
                      alt={targetMemberForRelation.name}
                      className="w-9 h-9 rounded-lg object-cover"
                    />
                    <div>
                      <span className="text-[11px] text-saffron-700 font-bold block">પસંદ કરેલ સભ્ય:</span>
                      <span className="font-bold text-xs text-charcoal-900">
                        {targetMemberForRelation.name}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTargetMemberForRelation(null)}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    બદલો
                  </button>
                </div>
              )}

              {/* Step 2: Choose relationship */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  આ વ્યક્તિ સાથે તમારો કયો સંબંધ છે? *
                </label>
                <select
                  value={chosenRelation}
                  onChange={(e) => setChosenRelation(e.target.value as RelationshipType)}
                  className="w-full py-2.5 px-3 border border-ivory-300 rounded-xl text-xs font-medium focus:border-saffron-500 focus:outline-none bg-white"
                  required
                >
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <option key={opt.type} value={opt.type}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100 text-[11px] text-charcoal-600 leading-relaxed border border-ivory-200">
                ℹ️ <strong>માર્ગદર્શન:</strong> ડુપ્લિકેટ પ્રોફાઇલ બનાવવાને બદલે ડેટાબેઝમાં પહેલેથી નોંધાયેલા સભ્યોને જ સંબંધ તરીકે પસંદ કરો. સંબંધ ઉમેરવાથી સામેની વ્યક્તિના મૂળ ખાતા પર કોઈ અસર થશે નહીં.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-ivory-300 text-charcoal-700 rounded-xl text-xs font-semibold hover:bg-ivory-100"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  disabled={!targetMemberForRelation}
                  className="px-5 py-2 bg-saffron-600 hover:bg-saffron-700 disabled:bg-charcoal-300 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  સંબંધ વિનંતી મોકલો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
