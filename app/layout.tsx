export const metadata = {
  title: 'Sakzee — Moving Dreams, Delivering Growth',
  description: "Ghana's trusted fulfillment and logistics partner.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}