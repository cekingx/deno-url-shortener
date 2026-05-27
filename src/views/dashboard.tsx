import { Layout } from "./layout.tsx";
import type { Link } from "../domain/link.ts";

type FormValues = {
  destination?: string;
  alias?: string;
  expiresAt?: string;
};

type DashboardPageProps = {
  success?: boolean;
  error?: "invalid_url" | "duplicate_alias" | "invalid_alias";
  formValues?: FormValues;
  links?: Link[];
  baseUrl?: string;
};

export function DashboardPage({
  success,
  error,
  formValues = {},
  links = [],
  baseUrl = "",
}: DashboardPageProps) {
  return (
    <Layout title="Dashboard — URL Shortener">
      <div class="max-w-4xl mx-auto px-6">
        <nav class="flex items-center justify-between bg-white border-b border-gray-200 mx-[-1.5rem] px-6 py-4 mb-8">
          <span class="font-semibold text-base">URL Shortener</span>
          <form method="post" action="/logout">
            <button
              class="px-4 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md cursor-pointer transition-colors"
              type="submit"
            >
              Logout
            </button>
          </form>
        </nav>

        <section class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 class="text-base font-semibold mb-5">Create a short link</h2>

          {success && (
            <div class="bg-green-50 text-green-700 border border-green-200 rounded-md px-3 py-2 text-sm mb-4">
              Link created successfully.
            </div>
          )}

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

          <form method="post" action="/admin/links">
            <label class="block text-sm mb-1" for="destination">
              Destination URL
            </label>
            <input
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              id="destination"
              name="destination"
              type="url"
              placeholder="https://example.com/very/long/url"
              value={formValues.destination ?? ""}
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
              value={formValues.alias ?? ""}
            />

            <label class="block text-sm mb-1" for="expires_at">
              Expiration date{" "}
              <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              id="expires_at"
              name="expires_at"
              type="datetime-local"
              value={formValues.expiresAt ?? ""}
            />

            <button
              class="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md text-sm font-medium cursor-pointer transition-colors"
              type="submit"
            >
              Create link
            </button>
          </form>
        </section>

        <section class="bg-white rounded-lg shadow-sm">
          <h2 class="text-base font-semibold px-6 py-4 border-b border-gray-100">
            Your links
          </h2>

          {links.length === 0 ? (
            <p class="text-gray-400 text-sm text-center py-12">
              No links yet. Create your first short link above.
            </p>
          ) : (
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th class="px-6 py-3 font-medium">Short URL</th>
                    <th class="px-6 py-3 font-medium">Destination</th>
                    <th class="px-6 py-3 font-medium">Clicks</th>
                    <th class="px-6 py-3 font-medium">Expires</th>
                    <th class="px-6 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  {links.map((link) => (
                    <LinkRow link={link} baseUrl={baseUrl} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

function LinkRow({ link, baseUrl }: { link: import("../domain/link.ts").Link; baseUrl: string }) {
  const shortUrl = `${baseUrl}/${link.shortCode}`;
  const expired = link.isExpired();

  return (
    <tr class="hover:bg-gray-50 transition-colors">
      <td class="px-6 py-3 whitespace-nowrap">
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="text-indigo-600 hover:text-indigo-800 font-mono text-xs"
        >
          {shortUrl}
        </a>
      </td>
      <td class="px-6 py-3 max-w-xs">
        <span class="block truncate text-gray-600" title={link.destinationUrl}>
          {link.destinationUrl}
        </span>
      </td>
      <td class="px-6 py-3 text-gray-700 tabular-nums">{link.clickCount}</td>
      <td class="px-6 py-3 whitespace-nowrap">
        {link.expiresAt ? (
          <span class="flex items-center gap-2">
            <span class="text-gray-600">{formatDate(link.expiresAt)}</span>
            {expired && (
              <span class="inline-block px-1.5 py-0.5 text-xs bg-red-50 text-red-600 border border-red-200 rounded">
                Expired
              </span>
            )}
          </span>
        ) : (
          <span class="text-gray-400">Never</span>
        )}
      </td>
      <td class="px-6 py-3 whitespace-nowrap">
        <div class="flex items-center gap-3">
          <a
            href={`/admin/links/${link.id}/edit`}
            class="text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            Edit
          </a>
          <button
            type="button"
            class="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
            disabled
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
