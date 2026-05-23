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
        <link rel="stylesheet" href="/static/tailwind.css" />
      </head>
      <body class="bg-gray-100 text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
