import { Layout } from "./layout.tsx";
import type { Link } from "../domain/link.ts";

type EditFormValues = {
  destination: string;
  alias: string;
  expiresAt: string;
};

type EditLinkPageProps = {
  link: Link;
  error?: "invalid_url" | "duplicate_alias" | "invalid_alias" | "not_found";
  formValues?: EditFormValues;
};

export function EditLinkPage({ link, error, formValues }: EditLinkPageProps) {
  const destination = formValues?.destination ?? link.destinationUrl;
  const alias = formValues?.alias ?? (link.customAlias ?? "");
  const expiresAt = formValues?.expiresAt ?? (link.expiresAt ?? "");

  return (
    <Layout title="Edit Link — URL Shortener">
      <div class="max-w-2xl mx-auto px-6 py-10">
        <div class="mb-6">
          <a
            href="/admin"
            class="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ← Back to dashboard
          </a>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h1 class="text-base font-semibold mb-5">Edit short link</h1>

          {error === "invalid_url" && (
            <div class="bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2 text-sm mb-4">
              Destination must be a valid URL starting with http:// or https://
            </div>
          )}

          {error === "duplicate_alias" && (
            <div class="bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2 text-sm mb-4">
              That alias is already in use. Please choose a different one.
            </div>
          )}

          {error === "invalid_alias" && (
            <div class="bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2 text-sm mb-4">
              Alias may only contain letters, numbers, hyphens, and underscores — no spaces.
            </div>
          )}

          <form method="post" action={`/admin/links/${link.id}/edit`}>
            <label class="block text-sm mb-1" for="destination">
              Destination URL
            </label>
            <input
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              id="destination"
              name="destination"
              type="url"
              placeholder="https://example.com/very/long/url"
              value={destination}
              required
            />

            <label class="block text-sm mb-1" for="alias">
              Custom alias{" "}
              <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              id="alias"
              name="alias"
              type="text"
              placeholder="my-link"
              value={alias}
            />

            <label class="block text-sm mb-1" for="expires_at">
              Expiration date{" "}
              <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-6 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              id="expires_at"
              name="expires_at"
              type="datetime-local"
              value={expiresAt}
            />

            <div class="flex items-center gap-3">
              <button
                class="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md text-sm font-medium cursor-pointer transition-colors"
                type="submit"
              >
                Save changes
              </button>
              <a
                href="/admin"
                class="px-5 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
