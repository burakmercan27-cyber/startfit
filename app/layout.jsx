import "./globals.css";

export const metadata = {
  title: "BuddyFit",
  description: "Ein Trainingsplan für Einsteiger, der zu deinem Alltag passt und jede Übung erklärt.",
};
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#127A57" };

export default function RootLayout({ children }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("buddyfit-theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}` }} />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
