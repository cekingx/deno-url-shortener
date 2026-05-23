type LayoutProps = {
  title?: string;
  children: unknown;
};

export function Layout({ title = "URL Shortener", children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <style>
          {`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: system-ui, sans-serif;
            background: #f4f5f7;
            color: #1a1a2e;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .card {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            padding: 2rem 2.5rem;
            width: 100%;
            max-width: 380px;
          }
          h1 { font-size: 1.4rem; margin-bottom: 1.5rem; }
          label { display: block; font-size: 0.875rem; margin-bottom: 0.25rem; }
          input {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 1rem;
            margin-bottom: 1rem;
          }
          input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
          button {
            width: 100%;
            padding: 0.6rem;
            background: #6366f1;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
          }
          button:hover { background: #4f46e5; }
          .error {
            background: #fef2f2;
            color: #b91c1c;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            margin-bottom: 1rem;
          }
          .nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #fff; border-bottom: 1px solid #e5e7eb; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th, td { text-align: left; padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem; }
          th { font-weight: 600; color: #6b7280; }
        `}
        </style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
