require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { createAdminToken, verifyAdminToken, adminAuthMiddleware } = require("./auth");

const app = express();

const corsOriginEnv = process.env.CORS_ORIGIN;
const allowedOrigins = corsOriginEnv && corsOriginEnv.trim() !== ""
  ? corsOriginEnv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : null;

const corsOptions = {
  // If CORS_ORIGIN is set, allow only those exact origins; otherwise allow all.
  origin: (origin, callback) => {
    // Non-browser requests often have no Origin header.
    if (!origin) return callback(null, true);
    if (!allowedOrigins) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// Ensure preflight requests are handled for all routes.
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

app.post("/admin/login", (req, res) => {
  const { password } = req.body || {};
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return res.status(500).json({ error: "ADMIN_PASSWORD is not configured on the server" });
  }
  if (password !== expected) {
    return res.status(401).json({ error: "Invalid password" });
  }
  res.json({ token: createAdminToken(), expiresIn: 86400 });
});

app.get("/admin/session", (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!verifyAdminToken(token)) {
    return res.status(401).json({ ok: false });
  }
  res.json({ ok: true });
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, mobile_no, feedback, purchase } = req.body;
    if (!name || !email || !mobile_no || !purchase) {
      return res.status(400).json({ error: "Name, email, mobile number and purchase are required" });
    }
    const newUser = await pool.query(
      "INSERT INTO deet (name, email, mobile_no, feedback, purchase) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, mobile_no, feedback || null, purchase]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: err.message || "Error during registration" });
  }
});

app.get("/users", adminAuthMiddleware, async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM deet ORDER BY reg_id DESC");
    res.json(allUsers.rows);
  } catch (err) {
    console.error("Fetch users error:", err.message);
    res.status(500).json({ error: err.message || "Error fetching users" });
  }
});

app.delete("/users/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const delUser = await pool.query("DELETE FROM deet WHERE reg_id = $1", [id]);
    if (delUser.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error deleting user" });
  }
});

app.put("/users/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback, purchase } = req.body;
    const updateUser = await pool.query(
      "UPDATE deet SET feedback = $1, purchase = $2 WHERE reg_id = $3 RETURNING *",
      [feedback, purchase, id]
    );
    if (updateUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(updateUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error updating user" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const allProducts = await pool.query("SELECT * FROM products ORDER BY product_id DESC");
    const allImages = await pool.query("SELECT * FROM product_images ORDER BY product_id, sort_order");
    const imagesByProduct = {};
    for (const img of allImages.rows) {
      if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = [];
      imagesByProduct[img.product_id].push(img);
    }
    const rows = allProducts.rows.map((p) => ({
      ...p,
      images: imagesByProduct[p.product_id] || [],
    }));
    res.json(rows);
  } catch (err) {
    console.error("Fetch products error:", err.message);
    res.status(500).json({ error: err.message || "Error fetching products" });
  }
});

app.post("/products", adminAuthMiddleware, async (req, res) => {
  try {
    const { name, price, description, image, images } = req.body;
    if (!name || !price || !description) {
      return res.status(400).json({ error: "Name, price, and description are required" });
    }
    const newProduct = await pool.query(
      "INSERT INTO products (name, price, description, image) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, price, description, image || null]
    );
    const productId = newProduct.rows[0].product_id;
    // Insert images into product_images
    const imgList = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
    for (let i = 0; i < imgList.length; i++) {
      await pool.query(
        "INSERT INTO product_images (product_id, image, sort_order) VALUES ($1, $2, $3)",
        [productId, imgList[i], i]
      );
    }
    // Return product with images
    const imgRows = await pool.query(
      "SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order",
      [productId]
    );
    res.status(201).json({ ...newProduct.rows[0], images: imgRows.rows });
  } catch (err) {
    console.error("Create product error:", err.message);
    res.status(500).json({ error: err.message || "Error creating product" });
  }
});

app.put("/products/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, image, images } = req.body;
    if (!name || !price || !description) {
      return res.status(400).json({ error: "Name, price, and description are required" });
    }
    const updatedProduct = await pool.query(
      "UPDATE products SET name = $1, price = $2, description = $3, image = $4 WHERE product_id = $5 RETURNING *",
      [name, price, description, image || null, id]
    );
    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    // If images array is provided, replace all product_images
    if (Array.isArray(images)) {
      await pool.query("DELETE FROM product_images WHERE product_id = $1", [id]);
      for (let i = 0; i < images.length; i++) {
        await pool.query(
          "INSERT INTO product_images (product_id, image, sort_order) VALUES ($1, $2, $3)",
          [id, images[i], i]
        );
      }
    }
    const imgRows = await pool.query(
      "SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order",
      [id]
    );
    res.json({ ...updatedProduct.rows[0], images: imgRows.rows });
  } catch (err) {
    console.error("Update product error:", err.message);
    res.status(500).json({ error: err.message || "Error updating product" });
  }
});

app.delete("/products/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    // product_images are deleted via ON DELETE CASCADE
    const deleted = await pool.query("DELETE FROM products WHERE product_id = $1", [id]);
    if (deleted.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err.message);
    res.status(500).json({ error: err.message || "Error deleting product" });
  }
});

// --- Product images CRUD ---

app.post("/products/:id/images", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "image is required" });
    // Get next sort_order
    const maxOrder = await pool.query(
      "SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM product_images WHERE product_id = $1",
      [id]
    );
    const nextOrder = maxOrder.rows[0].max_order + 1;
    const newImg = await pool.query(
      "INSERT INTO product_images (product_id, image, sort_order) VALUES ($1, $2, $3) RETURNING *",
      [id, image, nextOrder]
    );
    res.status(201).json(newImg.rows[0]);
  } catch (err) {
    console.error("Add product image error:", err.message);
    res.status(500).json({ error: err.message || "Error adding product image" });
  }
});

app.delete("/products/:productId/images/:imageId", adminAuthMiddleware, async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    const deleted = await pool.query(
      "DELETE FROM product_images WHERE image_id = $1 AND product_id = $2",
      [imageId, productId]
    );
    if (deleted.rowCount === 0) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.json({ message: "Product image deleted successfully" });
  } catch (err) {
    console.error("Delete product image error:", err.message);
    res.status(500).json({ error: err.message || "Error deleting product image" });
  }
});

app.get("/blogs", async (req, res) => {
  try {
    const allBlogs = await pool.query("SELECT * FROM blogs ORDER BY created_at DESC");
    res.json(allBlogs.rows);
  } catch (err) {
    console.error("Fetch blogs error:", err.message);
    res.status(500).json({ error: err.message || "Error fetching blogs" });
  }
});

app.post("/blogs", adminAuthMiddleware, async (req, res) => {
  try {
    const { title, excerpt, image, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    const newBlog = await pool.query(
      "INSERT INTO blogs (title, excerpt, image, content) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, excerpt || null, image || null, content]
    );
    res.status(201).json(newBlog.rows[0]);
  } catch (err) {
    console.error("Create blog error:", err.message);
    res.status(500).json({ error: err.message || "Error creating blog" });
  }
});

app.put("/blogs/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, image, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    const updatedBlog = await pool.query(
      "UPDATE blogs SET title = $1, excerpt = $2, image = $3, content = $4 WHERE blog_id = $5 RETURNING *",
      [title, excerpt || null, image || null, content, id]
    );
    if (updatedBlog.rows.length === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.json(updatedBlog.rows[0]);
  } catch (err) {
    console.error("Update blog error:", err.message);
    res.status(500).json({ error: err.message || "Error updating blog" });
  }
});

app.delete("/blogs/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBlog = await pool.query("DELETE FROM blogs WHERE blog_id = $1", [id]);
    if (deletedBlog.rowCount === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Delete blog error:", err.message);
    res.status(500).json({ error: err.message || "Error deleting blog" });
  }
});

app.get("/test-db", async (req, res) => {
  try {
    const testQuery = await pool.query("SELECT NOW()");
    res.json({
      status: "Database connection successful",
      timestamp: testQuery.rows[0].now,
    });
  } catch (err) {
    console.error("Database connection error:", err.message);
    res.status(500).json({
      error: "Database connection failed",
      details: err.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
