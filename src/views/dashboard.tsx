import { Layout } from "./layout.tsx";

type FormValues = {
  destination?: string;
  alias?: string;
  expiresAt?: string;
};

type DashboardPageProps = {
  success?: boolean;
  error?: "invalid_url" | "duplicate_alias";
  formValues?: FormValues;
};

export function DashboardPage({
  success,
  error,
  formValues = {},
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

        <section>
          <p class="text-gray-500 text-sm">
            No links yet. Create your first short link above.
          </p>
        </section>
      </div>
    </Layout>
  );
}
