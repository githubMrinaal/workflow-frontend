"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUserRole } from "@/lib/auth";
import { getRequestById, approveRequest, rejectRequest } from "@/lib/api";
import type { WorkflowRequest, RequestStatus } from "@/lib/types";

const statusStyles: Record<RequestStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
    </div>
  );
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const role = getUserRole();

  const [request, setRequest] = useState<WorkflowRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    getRequestById(Number(id))
      .then(setRequest)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load request"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleDecision(action: "approve" | "reject") {
    if (!request) return;
    setActionError("");
    setActionLoading(true);
    try {
      const updated =
        action === "approve"
          ? await approveRequest(request.id, { comment: comment || undefined })
          : await rejectRequest(request.id, { comment: comment || undefined });
      setRequest(updated);
      setComment("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Request Detail</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {request && (
          <div className="space-y-4">
            {/* Main card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{request.title}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{request.type}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[request.status]}`}
                >
                  {request.status}
                </span>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed mb-6">{request.description}</p>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="Type" value={request.type} />
                <Field label="Status" value={request.status} />

                {/* Type-specific fields */}
                {request.type === "LEAVE" && (
                  <>
                    <Field label="Start date" value={request.startDate} />
                    <Field label="End date" value={request.endDate} />
                    <Field label="Number of days" value={request.numberOfDays} />
                  </>
                )}
                {request.type === "BUDGET" && (
                  <>
                    <Field
                      label="Amount"
                      value={
                        request.amount != null
                          ? `${request.amount}${request.currency ? " " + request.currency : ""}`
                          : undefined
                      }
                    />
                  </>
                )}
              </dl>
            </div>

            {/* Audit info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Audit trail
              </h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="Requested by" value={request.requesterName} />
                <Field
                  label="Created at"
                  value={new Date(request.createdAt).toLocaleString()}
                />
                <Field label="Decided by" value={request.decidedByName} />
                <Field
                  label="Decided at"
                  value={request.decidedAt ? new Date(request.decidedAt).toLocaleString() : undefined}
                />
                {request.decisionComment && (
                  <div className="col-span-2">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Comment
                    </dt>
                    <dd className="mt-0.5 text-sm text-gray-900">{request.decisionComment}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Approver action panel */}
            {request.status === "PENDING" && role === "APPROVER" && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Decision</h3>

                {actionError && (
                  <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {actionError}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Add a comment for your decision…"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDecision("approve")}
                    disabled={actionLoading}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {actionLoading ? "…" : "Approve"}
                  </button>
                  <button
                    onClick={() => handleDecision("reject")}
                    disabled={actionLoading}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {actionLoading ? "…" : "Reject"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
