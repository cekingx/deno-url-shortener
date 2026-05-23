import { Layout } from "./layout.tsx";

export function DashboardPage() {
  return (
    <Layout title="Dashboard — URL Shortener">
      <div style="width: 100%; max-width: 960px; margin: 0 auto; padding: 0 1.5rem;">
        <nav class="nav" style="margin: 0 -1.5rem 2rem; padding: 1rem 1.5rem;">
          <span style="font-weight: 600; font-size: 1rem;">URL Shortener</span>
          <form method="post" action="/logout">
            <button
              type="submit"
              style="width: auto; padding: 0.4rem 1rem; font-size: 0.875rem; background: #f3f4f6; color: #374151; border: 1px solid #d1d5db;"
            >
              Logout
            </button>
          </form>
        </nav>
        <p style="color: #6b7280;">
          No links yet. Use the form above to create your first short link.
        </p>
      </div>
    </Layout>
  );
}
