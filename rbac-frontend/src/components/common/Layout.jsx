import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";

/* =====================================================
   LAYOUT — har protected page isi me wrap hoga
   Usage: <Layout><ActualPageContent /></Layout>
===================================================== */
function Layout({ children }) {
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
