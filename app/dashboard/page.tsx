"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn, getUserEmail, getUserRole, removeToken } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    setEmail(getUserEmail());
    setRole(getUserRole());
  }, [router]);

  function handleLogout() {
    removeToken();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Workflow Approval</h1>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            Signed in as{" "}
            <span className="font-medium text-gray-700">{role}</span>
          </p>
        </div>

        {role === "REQUESTER" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/my-requests"
              className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-xl">
                📋
              </div>
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-700">
                My Requests
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                View and track your submitted requests
              </p>
            </Link>

            <Link
              href="/create-request"
              className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 text-xl">
                ✚
              </div>
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-700">
                New Request
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Submit a leave or budget request
              </p>
            </Link>
          </div>
        )}

        {role === "APPROVER" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/pending"
              className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600 text-xl">
                ⏳
              </div>
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-700">
                Pending Approvals
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Review and action pending requests
              </p>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
