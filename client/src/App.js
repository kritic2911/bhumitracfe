import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import { themes } from "./themes";
import { API_URL, adminLogin, adminSessionCheck, setStoredAdminToken } from "./api";

import Register from "./components/register";
import AboutContact from "./components/AboutContact";
import ProductCatalog from "./components/ProductCatalog";
import Blog from "./components/Blog";
import AdminDashboard from "./components/AdminDashboard";
import ListUsers from "./components/listUsers";

function pathToPage(path) {
  switch (path) {
    case "/blog":
      return "blog";
    case "/register":
      return "register";
    case "/products":
      return "products";
    case "/list":
      return "list";
    case "/admin":
      return "admin";
    default:
      return "about";
  }
}

function pageToPath(page) {
  switch (page) {
    case "blog":
      return "/blog";
    case "register":
      return "/register";
    case "products":
      return "/products";
    case "list":
      return "/list";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}

function App() {
  const initialBlogs = [
    {
      blog_id: 1,
      id: 1,
      title: "Bhumizyme for cleaner homes",
      excerpt: "Eco-friendly enzyme cleaner for floor, tile, and toilet surfaces.",
      image: "/carousel/community.jpg",
      content:
        "Bhumizyme is made from natural ingredients and provides a safe, effective cleaning experience without harsh chemicals.",
      date: "2026-04-04T00:00:00Z",
      created_at: "2026-04-04T00:00:00Z",
    },
    {
      blog_id: 2,
      id: 2,
      title: "Upcycled cloth bags to reduce plastic",
      excerpt: "Reusing cloth materials to make stylish bags that replace single-use plastic.",
      image: "/carousel/products.jpg",
      content:
        "Cloth bags are durable, washable, and perfect for shopping. Tips on maintaining upcycled bags and the environmental impact of reusing fabrics.",
      date: "2026-04-02T00:00:00Z",
      created_at: "2026-04-02T00:00:00Z",
    },
    {
      blog_id: 3,
      id: 3,
      title: "Community events and impact",
      excerpt: "How local environmental work is bringing people together for change.",
      image: "/carousel/event.jpg",
      content:
        "Community action is at the heart of lasting sustainability: workshops, clean-up drives, and collaborations.",
      date: "2026-03-28T00:00:00Z",
      created_at: "2026-03-28T00:00:00Z",
    },
  ];

  const initialProducts = [
    {
      product_id: 1,
      id: 1,
      name: "Bhumizyme, the Bio-Enzyme Cleaner",
      price: "₹199/L",
      description:
        "Bhumizyme is a multipurpose floor, tile, toilet, etc cleaner made from 100% natural products. Safe for kids and pets.",
      image: "/products/bhumizyme.jpg",
    },
    {
      product_id: 2,
      id: 2,
      name: "UpCycled Cloth Bags",
      price: "₹49-69",
      description: "Reusable cotton bags made of upcycled clothes to help reduce plastic pollution.",
      image: "/products/cloth_bags.jpg",
    },
    {
      product_id: 3,
      id: 3,
      name: "Bio-Enzyme activator",
      price: "₹249",
      description: "Activator with a bhumizyme preparation PDF to prepare your own bioenzyme at home.",
      image: "/products/activator.jpg",
    },
  ];

  const [currentPage, setCurrentPage] = useState(() => pathToPage(window.location.pathname));
  const [currentTheme, setCurrentTheme] = useState(themes.light);
  const isDarkTheme = currentTheme === themes.dark;
  const [blogs, setBlogs] = useState(initialBlogs);
  const [products, setProducts] = useState(initialProducts);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [requestedPage, setRequestedPage] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    document.body.style.backgroundColor = currentTheme.background;
    document.body.style.color = currentTheme.text;
    document.documentElement.style.setProperty("--placeholder-color", currentTheme.placeHolderCol || currentTheme.muted);
    document.documentElement.style.setProperty("--app-primary", currentTheme.primary);
    document.documentElement.style.setProperty("--app-border", currentTheme.borderColor);
    document.documentElement.style.setProperty("--app-shadow", currentTheme.shadow);
    document.documentElement.style.setProperty("--app-accent-wash", currentTheme.accentWash);
  }, [currentTheme]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await adminSessionCheck();
      if (!cancelled && ok) setIsAuthenticated(true);
      if (!cancelled) setAuthReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (showAuthModal) {
      setAdminPassword("");
      setAuthError("");
    }
  }, [showAuthModal]);

  const normalizeBlog = (blog) => ({
    ...blog,
    id: blog.blog_id ?? blog.id,
    date: blog.created_at || blog.date,
  });

  const normalizeProduct = (product) => ({
    ...product,
    id: product.product_id ?? product.id,
  });

  const loadBlogs = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/blogs`);
      if (!response.ok) throw new Error("Could not load blogs");
      const data = await response.json();
      setBlogs(data.map(normalizeBlog));
    } catch (err) {
      console.error("Could not load blogs:", err.message);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) throw new Error("Could not load products");
      const data = await response.json();
      setProducts(data.map(normalizeProduct));
    } catch (err) {
      console.error("Could not load products:", err.message);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
    loadProducts();
  }, [loadBlogs, loadProducts]);

  useEffect(() => {
    const onPop = () => setCurrentPage(pathToPage(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if ((currentPage === "admin" || currentPage === "list") && !isAuthenticated) {
      setRequestedPage(currentPage);
      setShowAuthModal(true);
    }
  }, [currentPage, isAuthenticated, authReady]);

  const navigateTo = (page, path) => {
    setCurrentPage(page);
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
    }
  };

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === themes.light ? themes.dark : themes.light));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      await adminLogin(adminPassword);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      const nextPage = requestedPage || "admin";
      navigateTo(nextPage, pageToPath(nextPage));
    } catch (err) {
      setAuthError(err.message || "Login failed");
    }
  };

  const handleLogout = () => {
    setStoredAdminToken(null);
    setIsAuthenticated(false);
    navigateTo("about", "/");
  };

  const handleBlogNav = () => navigateTo("blog", "/blog");

  return (
    <div
      className="app-root"
      style={{
        backgroundColor: currentTheme.background,
        color: currentTheme.text,
      }}
    >
      <nav className="site-nav" style={{ backgroundColor: currentTheme.navBackground }}>
        <div className="container nav-inner">
          <span className="nav-brand" style={{ color: currentTheme.navText }}>
            Bhumitra CFE
          </span>
          <div className="nav-links">
            <button
              type="button"
              className={`nav-btn ${currentPage === "about" ? "active" : ""}`}
              onClick={() => navigateTo("about", "/")}
              style={{ color: currentTheme.navText }}
            >
              Home
            </button>
            <button
              type="button"
              className={`nav-btn ${currentPage === "register" ? "active" : ""}`}
              onClick={() => navigateTo("register", "/register")}
              style={{ color: currentTheme.navText }}
            >
              Register
            </button>
            <button
              type="button"
              className={`nav-btn ${currentPage === "products" ? "active" : ""}`}
              onClick={() => navigateTo("products", "/products")}
              style={{ color: currentTheme.navText }}
            >
              Products
            </button>
            <button
              type="button"
              className={`nav-btn ${currentPage === "blog" ? "active" : ""}`}
              onClick={handleBlogNav}
              style={{ color: currentTheme.navText }}
            >
              Blog
            </button>
            {isAuthenticated && (currentPage === "admin" || currentPage === "list") ? (
              <button
                type="button"
                className={`nav-btn ${currentPage === "list" ? "active" : ""}`}
                onClick={() => navigateTo("list", "/list")}
                style={{ color: currentTheme.navText }}
              >
                List
              </button>
            ) : null}
            {isAuthenticated && (currentPage === "admin" || currentPage === "list") ? (
              <button type="button" className="nav-btn" onClick={handleLogout} style={{ color: currentTheme.navText }}>
                Log out
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkTheme ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </nav>

      <div className="container-fluid p-0">
        {currentPage === "about" && <AboutContact theme={currentTheme} />}
        {currentPage === "register" && <Register theme={currentTheme} />}
        {currentPage === "products" && <ProductCatalog theme={currentTheme} products={products} />}
        {currentPage === "blog" && <Blog theme={currentTheme} posts={blogs} />}
        {currentPage === "list" && isAuthenticated && <ListUsers theme={currentTheme} />}
        {currentPage === "admin" && isAuthenticated && (
          <AdminDashboard
            theme={currentTheme}
            blogs={blogs}
            products={products}
            refreshBlogs={loadBlogs}
            refreshProducts={loadProducts}
          />
        )}
      </div>

      <footer
        className="py-4 mt-5"
        style={{
          borderTop: `1px solid ${currentTheme.borderColor}`,
          backgroundColor: currentTheme.surface || currentTheme.cardBackground,
          color: currentTheme.muted,
          fontSize: "0.88rem",
        }}
      >
        <div className="container text-center">
          <p className="mb-1">Bhumitra Citizens For Environment · Noida · bhumitracfe@gmail.com</p>
          <p className="mb-0 opacity-75">Eco-friendly products, workshops, and community action.</p>
        </div>
      </footer>

      {showAuthModal && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
          <div
            className="admin-modal"
            style={{
              backgroundColor: currentTheme.cardBackground,
              color: currentTheme.text,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="admin-modal-title" className="h5 mb-3">
              Admin sign-in
            </h2>
            <p className="small text-muted mb-3" style={{ color: currentTheme.muted }}>
              Protected areas require the admin password configured on the server.
            </p>
            <form onSubmit={handleAuth}>
              <div className="mb-3">
                <label className="form-label small">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{
                    backgroundColor: currentTheme.surface || currentTheme.cardBackground,
                    color: currentTheme.text,
                    borderColor: currentTheme.borderColor,
                  }}
                  required
                />
              </div>
              {authError ? (
                <p className="small text-danger mb-2" role="alert">
                  {authError}
                </p>
              ) : null}
              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setShowAuthModal(false);
                    navigateTo("about", "/");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: currentTheme.primary,
                    borderColor: currentTheme.primary,
                    color: isDarkTheme ? "#0a1610" : "#fffcf7",
                  }}
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
