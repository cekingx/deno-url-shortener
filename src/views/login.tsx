import { Layout } from "./layout.tsx";

type LoginPageProps = {
  error?: string;
};

export function LoginPage({ error }: LoginPageProps) {
  return (
    <Layout title="Login">
      <div class="min-h-screen flex items-center justify-center px-4">
        <div class="bg-white rounded-lg shadow-md p-8 w-full max-w-sm">
          <h1 class="text-xl font-semibold mb-6">Sign in</h1>
          {error && (
            <p class="bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2 text-sm mb-4">
              {error}
            </p>
          )}
          <form action="/login" method="post">
            <label class="block text-sm mb-1" for="username">Username</label>
            <input
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              type="text"
              id="username"
              name="username"
              required
              autocomplete="username"
            />
            <label class="block text-sm mb-1" for="password">Password</label>
            <input
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-6 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              type="password"
              id="password"
              name="password"
              required
              autocomplete="current-password"
            />
            <button
              class="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md text-sm font-medium cursor-pointer transition-colors"
              type="submit"
            >
              Log in
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
