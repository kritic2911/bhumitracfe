import React, { useState } from "react";
import { API_URL, adminHeaders } from "../api";
import { themes } from "../themes";
import ListUsers from "./listUsers";

const AdminDashboard = ({ theme, blogs, products, refreshBlogs, refreshProducts }) => {
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: "",
    excerpt: "",
    image: "",
    content: "",
  });
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    description: "",
    images: [],
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const resetBlogForm = () => {
    setSelectedBlog(null);
    setBlogForm({ title: "", excerpt: "", image: "", content: "" });
  };

  const resetProductForm = () => {
    setSelectedProduct(null);
    setProductForm({ name: "", price: "", description: "", images: [] });
  };

  const handleBlogChange = (field, value) => {
    setBlogForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlogImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setBlogForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleProductChange = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProductImageUpload = (files) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setProductForm((prev) => ({ ...prev, images: [...prev.images, reader.result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeProductImage = (index) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addProductImageUrl = (url) => {
    if (!url.trim()) return;
    setProductForm((prev) => ({ ...prev, images: [...prev.images, url.trim()] }));
  };

  const showStatus = (message) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(""), 4000);
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();

    if (!blogForm.title || !blogForm.content) {
      alert("Title and content are required to publish a blog.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: blogForm.title,
        excerpt: blogForm.excerpt || `${blogForm.content.slice(0, 120)}...`,
        image: blogForm.image || "/carousel/products.jpg",
        content: blogForm.content,
      };

      const response = await fetch(
        selectedBlog ? `${API_URL}/blogs/${selectedBlog.blog_id}` : `${API_URL}/blogs`,
        {
          method: selectedBlog ? "PUT" : "POST",
          headers: adminHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unable to save blog");
      }

      await refreshBlogs();
      showStatus(selectedBlog ? "Blog updated successfully." : "Blog published successfully.");
      resetBlogForm();
      setShowBlogForm(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!productForm.name || !productForm.price || !productForm.description) {
      alert("Name, price, and description are required for a product.");
      return;
    }

    setSaving(true);
    try {
      const imgList = productForm.images.length > 0 ? productForm.images : ["/products/activator.jpg"];
      const payload = {
        name: productForm.name,
        price: productForm.price,
        description: productForm.description,
        image: imgList[0],
        images: imgList,
      };

      const response = await fetch(
        selectedProduct ? `${API_URL}/products/${selectedProduct.product_id}` : `${API_URL}/products`,
        {
          method: selectedProduct ? "PUT" : "POST",
          headers: adminHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unable to save product");
      }

      await refreshProducts();
      showStatus(selectedProduct ? "Product updated successfully." : "Product added successfully.");
      resetProductForm();
      setShowProductForm(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const editBlog = (blog) => {
    setSelectedBlog(blog);
    setBlogForm({
      title: blog.title,
      excerpt: blog.excerpt || "",
      image: blog.image || "",
      content: blog.content || "",
    });
    setShowBlogForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const editProduct = (product) => {
    setSelectedProduct(product);
    // Build images list from the product_images array (objects with .image) or fall back to single image
    let imgs = [];
    if (product.images && product.images.length > 0) {
      imgs = product.images.map((img) => (typeof img === "string" ? img : img.image));
    } else if (product.image) {
      imgs = [product.image];
    }
    setProductForm({
      name: product.name,
      price: product.price,
      description: product.description,
      images: imgs,
    });
    setShowProductForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers: adminHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unable to delete product");
      }
      await refreshProducts();
      showStatus("Product deleted successfully.");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const deleteBlog = async (blogId) => {
    if (!window.confirm("Delete this blog post?")) return;

    try {
      const response = await fetch(`${API_URL}/blogs/${blogId}`, {
        method: "DELETE",
        headers: adminHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unable to delete blog");
      }
      await refreshBlogs();
      showStatus("Blog deleted successfully.");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const inputStyle = {
    backgroundColor: theme.surface || theme.cardBackground,
    color: theme.text,
    borderColor: theme.borderColor,
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h2 className="h4 mb-1">Admin</h2>
          <p className="small mb-0" style={{ color: theme.muted }}>
            Manage registrations (via user list route), products, and blog posts.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-sm rounded-pill px-3"
            style={{ backgroundColor: theme.primary, color: theme === themes.dark ? "#0a1610" : "#fffcf7", border: "none" }}
            onClick={() => {
              setShowBlogForm((prev) => !prev);
              resetBlogForm();
            }}
          >
            {showBlogForm ? "Close blog form" : selectedBlog ? "Edit blog" : "Add blog"}
          </button>
          <button
            type="button"
            className="btn btn-sm rounded-pill px-3 outline"
            style={{
              borderColor: theme.borderColor,
              color: theme.text,
              background: "transparent",
            }}
            onClick={() => {
              setShowProductForm((prev) => !prev);
              resetProductForm();
            }}
          >
            {showProductForm ? "Close product form" : selectedProduct ? "Edit product" : "Add product"}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="alert py-2 px-3 mb-4 rounded-3 border-0" style={{ backgroundColor: theme.accentWash, color: theme.primary }}>
          {statusMessage}
        </div>
      )}

      {showBlogForm && (
        <div
          className="card border-0 rounded-4 mb-4 p-4 admin-blog-form"
          style={{ backgroundColor: theme.surface || theme.cardBackground, color: theme.text, border: `1px solid ${theme.borderColor}` }}
        >
          <h3 className="h5 mb-3">{selectedBlog ? "Update blog post" : "New blog post"}</h3>
          <form onSubmit={handleBlogSubmit}>
            <div className="mb-3">
              <label className="form-label small">Title</label>
              <input
                type="text"
                className="form-control rounded-3"
                value={blogForm.title}
                onChange={(e) => handleBlogChange("title", e.target.value)}
                style={inputStyle}
                placeholder="Enter blog title"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small">Featured image (file)</label>
              <input
                type="file"
                accept="image/*"
                className="form-control rounded-3"
                onChange={(e) => e.target.files[0] && handleBlogImageUpload(e.target.files[0])}
                style={inputStyle}
              />
            </div>
            <div className="mb-3">
              <label className="form-label small">Or image URL</label>
              <input
                type="text"
                className="form-control rounded-3"
                value={blogForm.image}
                onChange={(e) => handleBlogChange("image", e.target.value)}
                style={inputStyle}
                placeholder="Paste image URL (optional)"
              />
            </div>
            {blogForm.image && (
              <div className="mb-3">
                <img src={blogForm.image} alt="" className="img-fluid rounded-3" style={{ maxHeight: "240px" }} />
              </div>
            )}
            <div className="mb-3">
              <label className="form-label small">Excerpt</label>
              <textarea
                className="form-control rounded-3"
                rows="3"
                value={blogForm.excerpt}
                onChange={(e) => handleBlogChange("excerpt", e.target.value)}
                style={inputStyle}
                placeholder="Short excerpt for the blog card"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small">Content</label>
              <textarea
                className="form-control rounded-3 blog-editor-textarea"
                rows="8"
                value={blogForm.content}
                onChange={(e) => handleBlogChange("content", e.target.value)}
                style={inputStyle}
                placeholder="Write your blog post here..."
              />
            </div>
            <button
              type="submit"
              className="btn rounded-pill px-4"
              disabled={saving}
              style={{ backgroundColor: theme.primary, color: theme === themes.dark ? "#0a1610" : "#fffcf7", border: "none" }}
            >
              {saving ? "Saving…" : selectedBlog ? "Save changes" : "Publish"}
            </button>
          </form>
        </div>
      )}

      {showProductForm && (
        <div
          className="card border-0 rounded-4 mb-4 p-4"
          style={{ backgroundColor: theme.surface || theme.cardBackground, color: theme.text, border: `1px solid ${theme.borderColor}` }}
        >
          <h3 className="h5 mb-3">{selectedProduct ? "Update product" : "New product"}</h3>
          <form onSubmit={handleProductSubmit}>
            <div className="mb-3">
              <label className="form-label small">Name</label>
              <input
                type="text"
                className="form-control rounded-3"
                value={productForm.name}
                onChange={(e) => handleProductChange("name", e.target.value)}
                style={inputStyle}
                placeholder="Product name"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small">Price</label>
              <input
                type="text"
                className="form-control rounded-3"
                value={productForm.price}
                onChange={(e) => handleProductChange("price", e.target.value)}
                style={inputStyle}
                placeholder="₹199/L or ₹49-69"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small">Description</label>
              <textarea
                className="form-control rounded-3"
                rows="3"
                value={productForm.description}
                onChange={(e) => handleProductChange("description", e.target.value)}
                style={inputStyle}
                placeholder="Product description"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small">Product images (files)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="form-control rounded-3"
                onChange={(e) => e.target.files.length > 0 && handleProductImageUpload(e.target.files)}
                style={inputStyle}
              />
            </div>
            <div className="mb-3">
              <label className="form-label small">Or add image by URL</label>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control rounded-3"
                  id="product-image-url-input"
                  style={inputStyle}
                  placeholder="Paste image URL and click Add"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addProductImageUrl(e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm rounded-pill px-3"
                  style={{ borderColor: theme.borderColor, color: theme.text, background: "transparent", whiteSpace: "nowrap" }}
                  onClick={() => {
                    const input = document.getElementById("product-image-url-input");
                    if (input) {
                      addProductImageUrl(input.value);
                      input.value = "";
                    }
                  }}
                >
                  Add
                </button>
              </div>
            </div>
            {productForm.images.length > 0 && (
              <div className="mb-3">
                <label className="form-label small">Image previews ({productForm.images.length})</label>
                <div className="d-flex flex-wrap gap-2">
                  {productForm.images.map((img, idx) => (
                    <div key={idx} className="position-relative" style={{ width: "90px", height: "90px" }}>
                      <img
                        src={img}
                        alt=""
                        className="rounded-3"
                        style={{ width: "100%", height: "100%", objectFit: "cover", border: `1px solid ${theme.borderColor}` }}
                      />
                      <button
                        type="button"
                        className="position-absolute top-0 end-0 border-0 rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "20px",
                          height: "20px",
                          fontSize: "0.65rem",
                          backgroundColor: "rgba(200,50,50,0.85)",
                          color: "#fff",
                          transform: "translate(30%, -30%)",
                          cursor: "pointer",
                          lineHeight: 1,
                        }}
                        onClick={() => removeProductImage(idx)}
                        aria-label={`Remove image ${idx + 1}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              type="submit"
              className="btn rounded-pill px-4"
              disabled={saving}
              style={{ backgroundColor: theme.primary, color: theme === themes.dark ? "#0a1610" : "#fffcf7", border: "none" }}
            >
              {saving ? "Saving…" : selectedProduct ? "Save product" : "Create product"}
            </button>
          </form>
        </div>
      )}

      <div className="mb-5">
        <h3 className="h5 mb-3">Products</h3>
        <div className="row g-3">
          {products.map((product) => (
            <div key={product.product_id ?? product.id} className="col-md-4">
              <div
                className="card h-100 border-0 rounded-4 overflow-hidden"
                style={{ backgroundColor: theme.surface || theme.cardBackground, border: `1px solid ${theme.borderColor}` }}
              >
                <div className="position-relative">
                  <img src={
                    (product.images && product.images.length > 0
                      ? (typeof product.images[0] === "string" ? product.images[0] : product.images[0].image)
                      : product.image) || "/products/activator.jpg"
                  } alt="" className="w-100" style={{ objectFit: "cover", height: "200px" }} />
                  <div
                    className="position-absolute top-0 end-0 m-2 px-2 py-1 rounded-pill small fw-semibold"
                    style={{
                      backgroundColor: theme.primary,
                      color: theme === themes.dark ? "#0a1610" : "#fffcf7",
                    }}
                  >
                    {product.price}
                  </div>
                  {product.images && product.images.length > 1 && (
                    <div
                      className="position-absolute bottom-0 start-0 m-2 px-2 py-1 rounded-pill small fw-semibold"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.55)",
                        color: "#fff",
                        fontSize: "0.72rem",
                      }}
                    >
                      {product.images.length} images
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <h4 className="h6">{product.name}</h4>
                  <p className="small" style={{ color: theme.muted }}>
                    {product.description}
                  </p>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-sm rounded-pill btn-outline-secondary" onClick={() => editProduct(product)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm rounded-pill btn-outline-danger"
                      onClick={() => deleteProduct(product.product_id ?? product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="h5 mb-3">Blog posts</h3>
        <div className="row g-3">
          {blogs.map((blog) => (
            <div key={blog.blog_id ?? blog.id} className="col-md-6">
              <div
                className="card h-100 border-0 rounded-4 overflow-hidden"
                style={{ backgroundColor: theme.surface || theme.cardBackground, border: `1px solid ${theme.borderColor}` }}
              >
                <img src={blog.image} alt="" className="w-100" style={{ objectFit: "cover", height: "200px" }} />
                <div className="card-body">
                  <h4 className="h6">{blog.title}</h4>
                  <p className="small mb-2" style={{ color: theme.muted }}>
                    {blog.excerpt}
                  </p>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-sm rounded-pill btn-outline-secondary" onClick={() => editBlog(blog)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm rounded-pill btn-outline-danger"
                      onClick={() => deleteBlog(blog.blog_id ?? blog.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-users-section pb-4">
        <h3 className="h5 mb-3">Registrations</h3>
        <p className="small mb-3" style={{ color: theme.muted }}>
          Full table is also available at the hidden <code>/list</code> route.
        </p>
        <ListUsers theme={theme} embedded />
      </div>
    </div>
  );
};

export default AdminDashboard;
