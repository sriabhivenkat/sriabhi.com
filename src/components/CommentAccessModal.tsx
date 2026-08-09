"use client";
import React, { useState } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CommentAccessModal({ open, onClose }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!open) return null;

  const handleClose = () => {
    // Reset so a future open starts fresh, but only once the modal is
    // actually closed — avoids the form flashing empty mid-submit.
    setStatus("idle");
    setErrorMessage("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setErrorMessage("Name and email are required.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("https://home.sriabhi.com/api/v1/request_comment_access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // so the backend can set the tracking cookie
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }

      setStatus("success");
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-lg p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-serif-custom font-bold text-black">
            Request comment access
          </h2>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-neutral-700 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {status === "success" ? (
          <div className="py-4">
            <p className="text-sm text-black">
              If you're not Sakthi, you'll be approved automatically. Check your e-mail for next steps.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 w-full bg-[#3D2B2E] rounded-lg py-2 text-sm font-medium text-white hover:bg-[#6B4C51] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-3">
            <p className="text-xs text-neutral-500 -mt-1 mb-1">
              Sakthi, if you're reading this, I had to build an entire feature to ensure you can't comment instead of just opening comments. I hate you.
            </p>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-neutral-400 mb-1">
                Name
              </label>
              <div className="flex flex-row gap-x-2">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-1/2 border border-gray-300 rounded-md p-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#3D2B2E]/30"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="w-1/2 border border-gray-300 rounded-md p-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#3D2B2E]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-neutral-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-md p-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#3D2B2E]/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-neutral-400 mb-1">
                Phone <span className="normal-case text-neutral-400">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 555-5555"
                className="w-full border border-gray-300 rounded-md p-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#3D2B2E]/30"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-red-600">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-1 w-full bg-[#3D2B2E] rounded-lg py-2 text-sm font-medium text-white hover:bg-[#6B4C51] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === "submitting" ? "Sending..." : "Send request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}