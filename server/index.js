require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { createAdminToken, verifyAdminToken, adminAuthMiddleware } = require("./auth");

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
const corsOptions = {
  origin: corsOrigin ? corsOrigin.split(",").map((s) => s.trim()) : true,
  credentials: true,
};
app.use(cors(corsOptions));
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
    res.json(allProducts.rows);
  } catch (err) {
    console.error("Fetch products error:", err.message);
    res.status(500).json({ error: err.message || "Error fetching products" });
  }
});

app.post("/products", adminAuthMiddleware, async (req, res) => {
  try {
    const { name, price, description, image } = req.body;
    if (!name || !price || !description) {
      return res.status(400).json({ error: "Name, price, and description are required" });
    }
    const newProduct = await pool.query(
      "INSERT INTO products (name, price, description, image) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, price, description, image || null]
    );
    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    console.error("Create product error:", err.message);
    res.status(500).json({ error: err.message || "Error creating product" });
  }
});

app.put("/products/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, image } = req.body;
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
    res.json(updatedProduct.rows[0]);
  } catch (err) {
    console.error("Update product error:", err.message);
    res.status(500).json({ error: err.message || "Error updating product" });
  }
});

app.delete("/products/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
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
