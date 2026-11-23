"use client";
// This component filters the expert list as a student searches or changes a dropdown.
import { useState } from "react";
import {
  experts as catalogue,
  statusLabel,
  type Expert,
} from "@/lib/catalogue";
import { ExpertCard } from "./ui";
export function Explorer({ experts = catalogue }: { experts?: Expert[] }) {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [field, setField] = useState("");
  const [status, setStatus] = useState("");
  // Break the search into words so a name and topic can match different parts of the same profile.
  const terms = (search.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter(
    (term) => !["and", "or", "in", "for", "the"].includes(term),
  );
  // Keep a profile only if it matches the search words and the selected dropdown filters.
  const filtered = experts.filter((e) => {
    const profile = `${e.name} ${e.field} ${e.description}`.toLowerCase();
    return (
      terms.every((term) => profile.includes(term)) &&
      (!country || e.country === country) &&
      (!field || e.field.toLowerCase().includes(field.toLowerCase())) &&
      (!status || e.status === status)
    );
  });
  return (
    <>
      <div className="filters">
        <div>
          <label htmlFor="search">Find an expert or a topic</label>
          <input
            id="search"
            type="search"
            placeholder="Try public speaking, leadership, or a name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="field">Field</label>
          <select
            id="field"
            value={field}
            onChange={(e) => setField(e.target.value)}
          >
            <option value="">All fields</option>
            {[
              "Entrepreneurship",
              "Leadership",
              "Public Speaking",
              "Technology",
              "Education",
              "Writing",
              "Career",
              "Agriculture",
              "Media",
              "Economics",
              "Sustainability",
              "Banking",
              "Social",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="country">Country</label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">All countries</option>
            {[...new Set(experts.map((e) => e.country))].sort().map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status">Collection status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {Object.entries(statusLabel).map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="results-label" aria-live="polite">
        <span>{filtered.length} collections to explore</span>
        <button
          className="text-link"
          onClick={() => {
            setSearch("");
            setCountry("");
            setField("");
            setStatus("");
          }}
        >
          Reset filters
        </button>
      </div>
      {filtered.length ? (
        <div className="grid-3">
          {filtered.map((e) => (
            <ExpertCard expert={e} key={e.id} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h3>No matching collections</h3>
          <p>Try one topic at a time, or reset your filters.</p>
        </div>
      )}
    </>
  );
}
