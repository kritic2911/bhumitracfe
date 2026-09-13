import React, { useState } from "react";
import { API_URL, adminHeaders } from "../api";
import { themes } from "../themes";
import ListUsers from "./listUsers";
import "./AdminDashboard.css";

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS        = ["products", "blogs", "registrations"];
const emptyProduct = { name: "", price: "", description: "", images: [], variants: [] };
const emptyBlog    = { title: "", excerpt: "", image: "", content: "" };

// ─── Component ───────────────────────────────────────────────────────────────

const AdminDashboard = ({ theme, blogs, products, refreshBlogs, refreshProducts }) => {
  const isDark   = theme === themes.dark;
  const btnColor = isDark ? "#0a1610" : "#fffcf7";

  // ── tab ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("products");

  // ── shared ───────────────────────────────────────────────────────────────
  const [statusMessage, setStatusMessage] = useState("");
  const [saving, setSaving]               = useState(false);

  const showStatus = (msg) => {
    setStatusMessage(msg);
    window.setTimeout(() => setStatusMessage(""), 4000);
  };

  // ── product form state ────────────────────────────────────────────────────
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productForm, setProductForm]         = useState(emptyProduct);

  const resetProductForm = () => { setSelectedProduct(null); setProductForm(emptyProduct); };
  const handleProductChange = (field, value) =>
    setProductForm((prev) => ({ ...prev, [field]: value }));

  // images
  const handleProductImageUpload = (files) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setProductForm((prev) => ({ ...prev, images: [...prev.images, reader.result] }));
      reader.readAsDataURL(file);
    });
  };
  const removeProductImage = (idx) =>
    setProductForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  const addProductImageUrl = (url) => {
    if (!url.trim()) return;
    setProductForm((prev) => ({ ...prev, images: [...prev.images, url.trim()] }));
  };

  // variants (saved to product_variants DB table)
  const addVariantRow = () =>
    setProductForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { label: "", price: "", image: "" }],
    }));
  const updateVariantRow = (idx, field, value) =>
    setProductForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v)),
    }));
  const removeVariantRow = (idx) =>
    setProductForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }));
  const handleVariantImageUpload = (idx, file) => {
    const reader = new FileReader();
    reader.onload = () => updateVariantRow(idx, "image", reader.result);
    reader.readAsDataURL(file);
  };

  // ── product CRUD ──────────────────────────────────────────────────────────
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.description) {
      alert("Name, price, and description are required.");
      return;
    }
    setSaving(true);
    try {
      const imgList = productForm.images.length > 0
        ? productForm.images
        : ["/products/activator.jpg"];
      const payload = {
        name:        productForm.name,
        price:       productForm.price,
        description: productForm.description,
        image:       typeof imgList[0] === "string" ? imgList[0] : imgList[0].image,
        images:      imgList,
        variants:    productForm.variants.filter((v) => v.label.trim()),
      };
      const url    = selectedProduct
        ? `${API_URL}/products/${selectedProduct.product_id}`
        : `${API_URL}/products`;
      const method = selectedProduct ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: adminHeaders(), body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Save failed"); }
      await refreshProducts();
      showStatus(selectedProduct ? "Product updated." : "Product created.");
      resetProductForm();
      setShowProductForm(false);
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const editProduct = (product) => {
    setSelectedProduct(product);
    let imgs = [];
    if (product.images?.length > 0)
      imgs = product.images.map((i) => (typeof i === "string" ? i : i.image));
    else if (product.image) imgs = [product.image];
    setProductForm({
      name:        product.name,
      price:       product.price,
      description: product.description,
      images:      imgs,
      variants:    Array.isArray(product.variants) ? product.variants : [],
    });
    setShowProductForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, { method: "DELETE", headers: adminHeaders() });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Delete failed"); }
      await refreshProducts();
      showStatus("Product deleted.");
    } catch (err) { alert(err.message); }
  };

  // ── blog form state ───────────────────────────────────────────────────────
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogForm, setBlogForm]         = useState(emptyBlog);

  const resetBlogForm   = () => { setSelectedBlog(null); setBlogForm(emptyBlog); };
  const handleBlogChange = (field, value) => setBlogForm((prev) => ({ ...prev, [field]: value }));
  const handleBlogImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = () => setBlogForm((prev) => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  // ── blog CRUD ─────────────────────────────────────────────────────────────
  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.content) { alert("Title and content are required."); return; }
    setSaving(true);
    try {
      const payload = {
        title:   blogForm.title,
        excerpt: blogForm.excerpt || `${blogForm.content.slice(0, 120)}...`,
        image:   blogForm.image || "/carousel/products.jpg",
        content: blogForm.content,
      };
      const url    = selectedBlog ? `${API_URL}/blogs/${selectedBlog.blog_id}` : `${API_URL}/blogs`;
      const method = selectedBlog ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: adminHeaders(), body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Save failed"); }
      await refreshBlogs();
      showStatus(selectedBlog ? "Blog updated." : "Blog published.");
      resetBlogForm();
      setShowBlogForm(false);
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const editBlog = (blog) => {
    setSelectedBlog(blog);
    setBlogForm({
      title:   blog.title,
      excerpt: blog.excerpt  || "",
      image:   blog.image    || "",
      content: blog.content  || "",
    });
    setShowBlogForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteBlog = async (id) => {
    if (!window.confirm("Delete this blog post?")) return;
    try {
      const res = await fetch(`${API_URL}/blogs/${id}`, { method: "DELETE", headers: adminHeaders() });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Delete failed"); }
      await refreshBlogs();
      showStatus("Blog deleted.");
    } catch (err) { alert(err.message); }
  };

  // ── shared input style ────────────────────────────────────────────────────
  const iStyle  = { backgroundColor: theme.surface || theme.cardBackground, color: theme.text, borderColor: theme.borderColor };
  const surface = theme.surface || theme.cardBackground;

  // ── PDF export ────────────────────────────────────────────────────────────
  const exportPDF = () => {
    const sections = products.map((p) => {
      const variants = Array.isArray(p.variants) ? p.variants : [];
      const variantRows = variants.length
        ? variants.map((v) =>
            `<tr>
              <td style="padding:6px 10px;border:1px solid #ddd">${v.label}</td>
              <td style="padding:6px 10px;border:1px solid #ddd">${v.price || p.price}</td>
              <td style="padding:6px 10px;border:1px solid #ddd">${
                v.image
                  ? `<img src="${v.image}" style="max-width:160px;max-height:160px;object-fit:contain;display:block" />`
                  : "—"
              }</td>
            </tr>`
          ).join("")
        : `<tr><td colspan="3" style="padding:6px 10px;border:1px solid #ddd;color:#888">No variants defined</td></tr>`;

      const imgList = Array.isArray(p.images) && p.images.length
        ? p.images.map((i) => (typeof i === "string" ? i : i.image))
        : p.image ? [p.image] : [];
      const allImgs = imgList.map((src) =>
        `<img src="${src}" style="max-width:220px;max-height:220px;object-fit:contain;margin:6px;display:inline-block;vertical-align:top" />`
      ).join("") || "—";

      return `
        <div style="page-break-inside:avoid;margin-bottom:40px;border:1px solid #ccc;border-radius:8px;padding:20px">
          <h2 style="margin:0 0 4px;font-size:1.2rem">${p.name}</h2>
          <p style="margin:0 0 12px;color:#2d6a4f;font-weight:600;font-size:1rem">${p.price}</p>
          <p style="margin:0 0 12px;color:#555;font-size:0.9rem">${p.description}</p>
          <div style="margin-bottom:14px">${allImgs}</div>
          <table style="border-collapse:collapse;width:100%;font-size:0.88rem">
            <thead><tr style="background:#2d6a4f;color:#fff">
              <th style="padding:7px 10px;text-align:left">Size / Variant</th>
              <th style="padding:7px 10px;text-align:left">Price</th>
              <th style="padding:7px 10px;text-align:left">Packaging</th>
            </tr></thead>
            <tbody>${variantRows}</tbody>
          </table>
        </div>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><title>Bhumitra Product Catalog</title>
      <style>
        body { font-family: sans-serif; padding: 2rem; max-width: 900px; margin: 0 auto }
        h1   { color: #2d6a4f }
        @media print { .no-print { display: none } body { padding: 1rem } }
      </style></head><body>
      <h1>Bhumitra Product Catalog</h1>
      <button class="no-print" onclick="window.print()"
        style="margin-bottom:1.5rem;padding:0.5rem 1.2rem;background:#2d6a4f;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:1rem">
        🖨 Print / Save as PDF
      </button>
      ${sections}
    </body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  };

  const exportCSV = () => {
    const header = "Product Name,Price,Variants,Image URLs";
    const rows = products.map((p) => {
      const variants = Array.isArray(p.variants) ? p.variants : [];
      const vtxt = variants.length
        ? `"${variants.map((v) => v.label + (v.price ? ` (${v.price})` : "")).join("; ")}"`
        : "\"\"";
      const imgs = Array.isArray(p.images) && p.images.length
        ? `"${p.images.map((i) => (typeof i === "string" ? i : i.image)).join("; ")}"`
        : `"${p.image || ""}"`;
      return `"${p.name.replace(/"/g, '""')}","${p.price}",${vtxt},${imgs}`;
    });
    const csv  = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "bhumitra_catalog.csv";
    a.click(); URL.revokeObjectURL(url);
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="container py-4">

      {/* Header */}
      <div className="admin-header mb-4">
        <div>
          <h2 className="h4 mb-1">Admin</h2>
          <p className="small mb-0" style={{ color: theme.muted }}>
            Manage products, blog posts, and registrations.
          </p>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="alert py-2 px-3 mb-3 rounded-3 border-0"
          style={{ backgroundColor: theme.accentWash, color: theme.primary }}>
          {statusMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`admin-tab-btn${activeTab === tab ? " admin-tab-btn--active" : ""}`}
            style={activeTab === tab
              ? { backgroundColor: theme.primary, color: btnColor, borderColor: theme.primary }
              : { backgroundColor: "transparent", color: theme.text, borderColor: theme.borderColor }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "products" ? "📦 Products" : tab === "blogs" ? "📝 Blog posts" : "👥 Registrations"}
          </button>
        ))}
      </div>

      {/* ═══════════════════ PRODUCTS TAB ═══════════════════ */}
      {activeTab === "products" && (
        <div>
          {/* toolbar */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h3 className="h5 mb-0">Products ({products.length})</h3>
            <button
              type="button"
              className="btn btn-sm rounded-pill px-3"
              style={{ backgroundColor: theme.primary, color: btnColor, border: "none" }}
              onClick={() => { setShowProductForm((p) => !p); resetProductForm(); }}
            >
              {showProductForm ? "✕ Close form" : "+ Add product"}
            </button>
          </div>

          {/* product form */}
          {showProductForm && (
            <div className="admin-form-card mb-4"
              style={{ backgroundColor: surface, border: `1px solid ${theme.borderColor}` }}>
              <h4 className="admin-form-title">
                {selectedProduct ? "Edit product" : "New product"}
              </h4>
              <form onSubmit={handleProductSubmit}>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="form-label small">Product name *</label>
                    <input type="text" className="form-control rounded-3" style={iStyle}
                      value={productForm.name} placeholder="e.g. Bhumizyme"
                      onChange={(e) => handleProductChange("name", e.target.value)} />
                  </div>
                  <div className="admin-form-group admin-form-group--sm">
                    <label className="form-label small">Base price *</label>
                    <input type="text" className="form-control rounded-3" style={iStyle}
                      value={productForm.price} placeholder="₹199/L"
                      onChange={(e) => handleProductChange("price", e.target.value)} />
                  </div>
                </div>

                <div className="admin-form-group mb-3">
                  <label className="form-label small">Description *</label>
                  <textarea className="form-control rounded-3" rows="3" style={iStyle}
                    value={productForm.description} placeholder="Product description"
                    onChange={(e) => handleProductChange("description", e.target.value)} />
                </div>

                {/* images */}
                <div className="admin-form-group mb-3">
                  <label className="form-label small">Product images</label>
                  <input type="file" accept="image/*" multiple
                    className="form-control rounded-3 mb-2" style={iStyle}
                    onChange={(e) => e.target.files.length && handleProductImageUpload(e.target.files)} />
                  <div className="d-flex gap-2 mb-2">
                    <input type="text" className="form-control rounded-3" style={iStyle}
                      id="prod-img-url" placeholder="Or paste image URL"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addProductImageUrl(e.target.value);
                          e.target.value = "";
                        }
                      }} />
                    <button type="button" className="btn btn-sm rounded-pill px-3"
                      style={{ borderColor: theme.borderColor, color: theme.text, background: "transparent", whiteSpace: "nowrap" }}
                      onClick={() => {
                        const el = document.getElementById("prod-img-url");
                        if (el) { addProductImageUrl(el.value); el.value = ""; }
                      }}>
                      Add
                    </button>
                  </div>
                  {productForm.images.length > 0 && (
                    <div className="d-flex flex-wrap gap-2">
                      {productForm.images.map((img, i) => (
                        <div key={i} className="position-relative" style={{ width: 80, height: 80 }}>
                          <img src={img} alt="" className="rounded-3"
                            style={{ width: "100%", height: "100%", objectFit: "cover", border: `1px solid ${theme.borderColor}` }} />
                          <button type="button" onClick={() => removeProductImage(i)} aria-label="Remove"
                            className="position-absolute top-0 end-0 border-0 rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: 18, height: 18, fontSize: "0.6rem", background: "rgba(200,50,50,0.85)", color: "#fff", transform: "translate(30%,-30%)", cursor: "pointer", lineHeight: 1 }}>
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* variants → saved to product_variants table */}
                <div className="admin-form-group mb-3">
                  <label className="form-label small fw-semibold">Sizes / Variants</label>
                  <p className="small mb-2" style={{ color: theme.muted }}>
                    Add size options (e.g. 1 L, 5 L). Each has its own price and a packaging photo
                    shown to customers when they select that size.
                  </p>
                  {productForm.variants.map((v, idx) => (
                    <div key={idx} className="admin-variant-row mb-2"
                      style={{ backgroundColor: theme.background || theme.cardBackground, border: `1px solid ${theme.borderColor}` }}>
                      <div className="admin-variant-fields">
                        <div>
                          <label className="form-label small mb-1">Label *</label>
                          <input type="text" className="form-control form-control-sm rounded-3" style={iStyle}
                            placeholder="1 L" value={v.label}
                            onChange={(e) => updateVariantRow(idx, "label", e.target.value)} />
                        </div>
                        <div>
                          <label className="form-label small mb-1">Price</label>
                          <input type="text" className="form-control form-control-sm rounded-3" style={iStyle}
                            placeholder="₹199" value={v.price}
                            onChange={(e) => updateVariantRow(idx, "price", e.target.value)} />
                        </div>
                        <div style={{ flex: 2 }}>
                          <label className="form-label small mb-1">Packaging image</label>
                          <input type="file" accept="image/*"
                            className="form-control form-control-sm rounded-3 mb-1" style={iStyle}
                            onChange={(e) => e.target.files[0] && handleVariantImageUpload(idx, e.target.files[0])} />
                          <input type="text" className="form-control form-control-sm rounded-3" style={iStyle}
                            placeholder="Or paste image URL"
                            value={v.image && !v.image.startsWith("data:") ? v.image : ""}
                            onChange={(e) => updateVariantRow(idx, "image", e.target.value)} />
                        </div>
                        {v.image && (
                          <img src={v.image} alt=""
                            style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, border: `1px solid ${theme.borderColor}`, alignSelf: "flex-end" }} />
                        )}
                      </div>
                      <button type="button"
                        className="admin-variant-remove btn btn-sm btn-outline-danger rounded-pill mt-1"
                        onClick={() => removeVariantRow(idx)}>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-sm rounded-pill"
                    style={{ borderColor: theme.borderColor, color: theme.text, background: "transparent" }}
                    onClick={addVariantRow}>
                    + Add size / variant
                  </button>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn rounded-pill px-4" disabled={saving}
                    style={{ backgroundColor: theme.primary, color: btnColor, border: "none" }}>
                    {saving ? "Saving…" : selectedProduct ? "Save changes" : "Create product"}
                  </button>
                  <button type="button" className="btn rounded-pill px-3"
                    style={{ borderColor: theme.borderColor, color: theme.text, background: "transparent" }}
                    onClick={() => { resetProductForm(); setShowProductForm(false); }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* product grid */}
          <div className="row g-3 mb-3">
            {products.map((product) => {
              const thumb = (product.images?.length > 0
                ? (typeof product.images[0] === "string" ? product.images[0] : product.images[0].image)
                : product.image) || "/products/activator.jpg";
              const variantCount = Array.isArray(product.variants) ? product.variants.length : 0;
              return (
                <div key={product.product_id ?? product.id} className="col-md-4">
                  <div className="admin-product-card"
                    style={{ backgroundColor: surface, border: `1px solid ${theme.borderColor}` }}>
                    <div className="admin-product-img-wrap">
                      <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <span className="admin-product-price-badge"
                        style={{ backgroundColor: theme.primary, color: btnColor }}>
                        {product.price}
                      </span>
                      {variantCount > 0 && (
                        <span className="admin-product-variant-badge">
                          {variantCount} variant{variantCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="admin-product-body">
                      <h4 className="admin-product-name">{product.name}</h4>
                      <p className="admin-product-desc" style={{ color: theme.muted }}>
                        {product.description}
                      </p>
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-sm rounded-pill btn-outline-secondary"
                          onClick={() => editProduct(product)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-sm rounded-pill btn-outline-danger"
                          onClick={() => deleteProduct(product.product_id ?? product.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* export */}
          <div className="admin-export-row">
            <span className="small fw-semibold" style={{ color: theme.muted }}>Export:</span>
            <button type="button" className="btn btn-sm rounded-pill"
              style={{ borderColor: theme.borderColor, color: theme.text, background: "transparent" }}
              onClick={exportPDF}>
              📄 PDF catalog
            </button>
            <button type="button" className="btn btn-sm rounded-pill"
              style={{ borderColor: theme.borderColor, color: theme.text, background: "transparent" }}
              onClick={exportCSV}>
              📊 CSV / Excel
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════ BLOGS TAB ═══════════════════ */}
      {activeTab === "blogs" && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h3 className="h5 mb-0">Blog posts ({blogs.length})</h3>
            <button type="button" className="btn btn-sm rounded-pill px-3"
              style={{ backgroundColor: theme.primary, color: btnColor, border: "none" }}
              onClick={() => { setShowBlogForm((p) => !p); resetBlogForm(); }}>
              {showBlogForm ? "✕ Close form" : "+ Add blog post"}
            </button>
          </div>

          {showBlogForm && (
            <div className="admin-form-card mb-4"
              style={{ backgroundColor: surface, border: `1px solid ${theme.borderColor}` }}>
              <h4 className="admin-form-title">{selectedBlog ? "Edit blog post" : "New blog post"}</h4>
              <form onSubmit={handleBlogSubmit}>
                <div className="admin-form-group mb-3">
                  <label className="form-label small">Title *</label>
                  <input type="text" className="form-control rounded-3" style={iStyle}
                    value={blogForm.title} placeholder="Blog title"
                    onChange={(e) => handleBlogChange("title", e.target.value)} />
                </div>
                <div className="admin-form-group mb-3">
                  <label className="form-label small">Featured image (file)</label>
                  <input type="file" accept="image/*" className="form-control rounded-3" style={iStyle}
                    onChange={(e) => e.target.files[0] && handleBlogImageUpload(e.target.files[0])} />
                </div>
                <div className="admin-form-group mb-3">
                  <label className="form-label small">Or image URL</label>
                  <input type="text" className="form-control rounded-3" style={iStyle}
                    value={blogForm.image} placeholder="Paste image URL"
                    onChange={(e) => handleBlogChange("image", e.target.value)} />
                </div>
                {blogForm.image && (
                  <div className="mb-3">
                    <img src={blogForm.image} alt="" className="img-fluid rounded-3"
                      style={{ maxHeight: 180 }} />
                  </div>
                )}
                <div className="admin-form-group mb-3">
                  <label className="form-label small">Excerpt</label>
                  <textarea className="form-control rounded-3" rows="2" style={iStyle}
                    value={blogForm.excerpt} placeholder="Short teaser (auto-generated if blank)"
                    onChange={(e) => handleBlogChange("excerpt", e.target.value)} />
                </div>
                <div className="admin-form-group mb-3">
                  <label className="form-label small">Content *</label>
                  <textarea className="form-control rounded-3" rows="9" style={iStyle}
                    value={blogForm.content} placeholder="Write your blog post…"
                    onChange={(e) => handleBlogChange("content", e.target.value)} />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn rounded-pill px-4" disabled={saving}
                    style={{ backgroundColor: theme.primary, color: btnColor, border: "none" }}>
                    {saving ? "Saving…" : selectedBlog ? "Save changes" : "Publish"}
                  </button>
                  <button type="button" className="btn rounded-pill px-3"
                    style={{ borderColor: theme.borderColor, color: theme.text, background: "transparent" }}
                    onClick={() => { resetBlogForm(); setShowBlogForm(false); }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="row g-3">
            {blogs.map((blog) => (
              <div key={blog.blog_id ?? blog.id} className="col-md-6">
                <div className="admin-product-card"
                  style={{ backgroundColor: surface, border: `1px solid ${theme.borderColor}` }}>
                  {blog.image && (
                    <div className="admin-product-img-wrap">
                      <img src={blog.image} alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div className="admin-product-body">
                    <h4 className="admin-product-name">{blog.title}</h4>
                    <p className="admin-product-desc" style={{ color: theme.muted }}>{blog.excerpt}</p>
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-sm rounded-pill btn-outline-secondary"
                        onClick={() => editBlog(blog)}>Edit</button>
                      <button type="button" className="btn btn-sm rounded-pill btn-outline-danger"
                        onClick={() => deleteBlog(blog.blog_id ?? blog.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════ REGISTRATIONS TAB ═══════════════════ */}
      {activeTab === "registrations" && (
        <div>
          <div className="mb-3">
            <h3 className="h5 mb-1">Registrations</h3>
            <p className="small mb-0" style={{ color: theme.muted }}>
              Also available at the hidden <code>/list</code> route.
            </p>
          </div>
          <ListUsers theme={theme} embedded />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
