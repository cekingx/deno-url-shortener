import { Layout } from "./layout.tsx";

type LoginPageProps = {
  error?: string;
};

export function LoginPage({ error }: LoginPageProps) {
  return (
    <Layout title="Login">
      <div class="card">
        <h1>Sign in</h1>
        {error && <p class="error">{error}</p>}
        <form action="/login" method="post">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            autocomplete="username"
          />
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            autocomplete="current-password"
          />
          <button type="submit">Log in</button>
        </form>
      </div>
    </Layout>
  );
}
