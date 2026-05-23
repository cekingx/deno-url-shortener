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
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          margin: "0 auto",
          padding: "0 1.5rem",
        }}
      >
        <nav
          class="nav"
          style={{ margin: "0 -1.5rem 2rem", padding: "1rem 1.5rem" }}
        >
          <span style={{ fontWeight: 600, fontSize: "1rem" }}>
            URL Shortener
          </span>
          <form method="post" action="/logout">
            <button
              type="submit"
              style={{
                width: "auto",
                padding: "0.4rem 1rem",
                fontSize: "0.875rem",
                background: "#f3f4f6",
                color: "#374151",
                border: "1px solid #d1d5db",
              }}
            >
              Logout
            </button>
          </form>
        </nav>

        <section
          style={{
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            padding: "1.5rem 2rem",
            marginBottom: "2rem",
          }}
        >
          <h2 style={{ fontSize: "1rem", marginBottom: "1.25rem" }}>
            Create a short link
          </h2>

          {success && (
            <div
              style={{
                background: "#f0fdf4",
                color: "#15803d",
                border: "1px solid #bbf7d0",
                borderRadius: "6px",
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
                marginBottom: "1rem",
              }}
            >
              Link created successfully.
            </div>
          )}

          {error === "invalid_url" && (
            <div class="error">
              Destination must be a valid URL starting with http:// or https://
            </div>
          )}

          {error === "duplicate_alias" && (
            <div class="error">
              That alias is already in use. Please choose a different one.
            </div>
          )}

          <form method="post" action="/admin/links">
            <label for="destination">Destination URL</label>
            <input
              id="destination"
              name="destination"
              type="url"
              placeholder="https://example.com/very/long/url"
              value={formValues.destination ?? ""}
              required
            />

            <label for="alias">
              Custom alias{" "}
              <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            <input
              id="alias"
              name="alias"
              type="text"
              placeholder="my-link"
              value={formValues.alias ?? ""}
            />

            <label for="expires_at">
              Expiration date{" "}
              <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            <input
              id="expires_at"
              name="expires_at"
              type="datetime-local"
              value={formValues.expiresAt ?? ""}
              style={{ marginBottom: "1.25rem" }}
            />

            <button type="submit">Create link</button>
          </form>
        </section>

        <section>
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
            No links yet. Create your first short link above.
          </p>
        </section>
      </div>
    </Layout>
  );
}
