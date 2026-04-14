"use client";

import { useState } from "react";

interface AssistanceRequestFormProps {
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: "kits", label: "Team Kits & Equipment" },
  { value: "training", label: "Training & Coaching" },
  { value: "medical", label: "Medical & Physiotherapy" },
  { value: "travel", label: "Travel & Accommodation" },
  { value: "facility", label: "Training Facility" },
  { value: "other", label: "Other" },
];

export function AssistanceRequestForm({ onSuccess }: AssistanceRequestFormProps) {
  const [form, setForm] = useState({
    teamName: "",
    location: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    category: "",
    description: "",
    amountRequested: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.teamName || !form.contactEmail || !form.category || !form.description || !form.amountRequested) {
      setError("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(form.amountRequested);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amountRequested: amount }),
      });
      if (!res.ok) throw new Error("Failed to submit request");
      setSubmitted(true);
      onSuccess?.();
    } catch {
      setError("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
        <p className="text-gray-600 mb-4">
          We&apos;ve received your assistance request. Our team will review it and get back to you at {form.contactEmail} within 2-3 business days.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ teamName: "", location: "", contactName: "", contactEmail: "", contactPhone: "", category: "", description: "", amountRequested: "" }); }}
          className="px-6 py-2 bg-[#065f46] text-white rounded-lg hover:bg-[#10b981] transition font-medium"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Team Name <span className="text-red-500">*</span>
          </label>
          <input
            name="teamName"
            value={form.teamName}
            onChange={handleChange}
            placeholder="e.g. Nairobi Warriors"
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#065f46] transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Location
          </label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. Nairobi, Kenya"
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#065f46] transition"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Contact Name <span className="text-red-500">*</span>
          </label>
          <input
            name="contactName"
            value={form.contactName}
            onChange={handleChange}
            placeholder="Team captain or manager"
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#065f46] transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Phone Number
          </label>
          <input
            name="contactPhone"
            value={form.contactPhone}
            onChange={handleChange}
            placeholder="+254 700 000 000"
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#065f46] transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="contactEmail"
          value={form.contactEmail}
          onChange={handleChange}
          placeholder="team@example.com"
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#065f46] transition"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#065f46] transition bg-white"
          >
            <option value="">Select category...</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Amount Needed (ADA) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="amountRequested"
            value={form.amountRequested}
            onChange={handleChange}
            placeholder="e.g. 500"
            min="1"
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#065f46] transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe what your team needs and how the funds will be used. Be specific about the impact..."
          rows={4}
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#065f46] transition resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 bg-[#065f46] text-white rounded-xl font-semibold hover:bg-[#10b981] transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Assistance Request"
        )}
      </button>

      <p className="text-xs text-center text-gray-400">
        All requests are reviewed by our team. You&apos;ll hear back within 2-3 business days.
      </p>
    </form>
  );
}
