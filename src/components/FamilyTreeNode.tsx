"use client";

import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { User, Phone, MapPin, Heart, Shield } from "lucide-react";
import { Member } from "@/types";

interface NodeData {
  member: Member;
  relationshipLabel?: string;
  isCenter?: boolean;
  onSelect: (member: Member) => void;
}

const FamilyTreeNode = ({ data }: { data: NodeData }) => {
  const { member, relationshipLabel, isCenter, onSelect } = data;

  return (
    <div
      onClick={() => onSelect(member)}
      className={`group relative w-64 rounded-2xl bg-white p-3.5 border transition-all duration-200 cursor-pointer text-left ${
        isCenter
          ? "border-saffron-500 shadow-hover ring-2 ring-saffron-300/60"
          : "border-ivory-300 hover:border-saffron-400 shadow-card hover:shadow-hover"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-saffron-600 !w-2.5 !h-2.5" />

      {/* Relationship badge */}
      {relationshipLabel && (
        <div className="absolute -top-3 left-3 bg-gradient-to-r from-saffron-600 to-saffron-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
          {relationshipLabel}
        </div>
      )}

      {isCenter && (
        <div className="absolute -top-3 right-3 bg-forest-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
          <Shield className="w-2.5 h-2.5" />
          મુખ્ય સભ્ય
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={member.photo_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120"}
            alt={member.name}
            className="w-13 h-13 rounded-xl object-cover border-2 border-ivory-200 group-hover:border-saffron-400 transition-colors"
          />
          {member.is_lifetime_member && (
            <span
              className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full text-[9px]"
              title="આજીવન સભ્ય"
            >
              ★
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-charcoal-900 truncate group-hover:text-saffron-700">
            {member.name}
          </h4>
          <p className="text-[11px] text-charcoal-600 flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3 h-3 text-saffron-600 flex-shrink-0" />
            <span>{member.city} ({member.native_place})</span>
          </p>

          {member.employment?.company && (
            <p className="text-[10px] text-charcoal-500 truncate mt-0.5">
              {member.employment.job_title}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-ivory-200 flex items-center justify-between text-[10px] text-charcoal-500">
        <span className="font-medium text-forest-800">
          {member.committee_role || "સમાજ સભ્ય"}
        </span>
        <span className="text-saffron-700 font-semibold group-hover:underline">
          વિગત જુઓ →
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-saffron-600 !w-2.5 !h-2.5" />
    </div>
  );
};

export default memo(FamilyTreeNode);
