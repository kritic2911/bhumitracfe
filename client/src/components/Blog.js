import React, { useMemo } from "react";

const postKey = (post) => post.id ?? post.blog_id;
const postDate = (post) => post.date || post.created_at;

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const postSlug = (post) => `${postKey(post)}-${slugify(post.title || "post")}`;

const postMatchesRouteRef = (post, routeRef) => {
  const raw = String(routeRef || "").trim();
  if (!raw) return false;
  const id = String(postKey(post));
  if (raw === id) return true; // backward-compatible old /blog/:id links
  if (raw === postSlug(post)) return true; // slug links
  const maybeIdPrefix = raw.match(/^(\d+)-/);
  return !!maybeIdPrefix && maybeIdPrefix[1] === id; // tolerate old/new slug-title edits
};

const Blog = ({ theme, posts, selectedPostId, onOpenPost, onClosePost }) => {
  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(postDate(b)) - new Date(postDate(a))),
    [posts]
  );

  const selectedPost =
    selectedPostId == null
      ? null
      : sortedPosts.find((post) => postMatchesRouteRef(post, selectedPostId)) || null;

  const recentPosts = sortedPosts.slice(0, 5);
  const centerPost = recentPosts[0];
  const leftPosts = recentPosts.slice(1, 3);
  const rightPosts = recentPosts.slice(3, 5);

  const openPost = (post) => onOpenPost?.(post);
  const closePost = () => onClosePost?.();

  return (
    <div className="container py-5">
      <h2 className="h3 text-center mb-2" style={{ fontWeight: 600 }}>
        Blog
      </h2>
      <p className="text-center mb-5 small" style={{ color: theme.muted }}>
        Stories on products, reuse, and community work.
      </p>

      {selectedPost ? (
        <article
          className="blog-reader"
          style={{
            backgroundColor: theme.surface || theme.cardBackground,
            color: theme.text,
            border: `1px solid ${theme.borderColor}`,
            boxShadow: `0 10px 36px ${theme.shadow}`,
          }}
        >
          <button
            type="button"
            className="blog-reader-back"
            onClick={closePost}
            style={{ color: theme.primary, borderColor: theme.borderColor }}
          >
            ← Back to all posts
          </button>

          <header className="blog-reader-header">
            <h1 className="blog-reader-title">{selectedPost.title}</h1>
            <p className="blog-reader-subheading" style={{ color: theme.muted }}>
              {selectedPost.excerpt}
            </p>
            <div className="blog-reader-meta" style={{ color: theme.muted }}>
              {new Date(postDate(selectedPost)).toLocaleDateString()}
            </div>
          </header>

          {selectedPost.image ? (
            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              className="blog-reader-image"
            />
          ) : null}

          <section className="blog-reader-content">
            {(selectedPost.content || "")
              .split("\n")
              .filter((line) => line.trim())
              .map((line, idx) => (
                <p key={`${postKey(selectedPost)}-${idx}`}>{line}</p>
              ))}
          </section>
        </article>
      ) : (
        <>
          <div className="blog-magazine-layout">
            <div className="blog-side-column">
              {leftPosts.map((post) => (
                <article
                  key={postKey(post)}
                  className="blog-card rounded-4 overflow-hidden"
                  onClick={() => openPost(post)}
                  onKeyDown={(e) => e.key === "Enter" && openPost(post)}
                  role="button"
                  tabIndex={0}
                  style={{
                    backgroundColor: theme.surface || theme.cardBackground,
                    color: theme.text,
                    border: `1px solid ${theme.borderColor}`,
                    boxShadow: `0 6px 20px ${theme.shadow}`,
                  }}
                >
                  <img src={post.image} alt={post.title} className="blog-card-image" style={{ height: "160px" }} />
                  <div className="blog-card-body">
                    <span className="blog-card-date" style={{ color: theme.muted }}>
                      {new Date(postDate(post)).toLocaleDateString()}
                    </span>
                    <h3 className="h6 mt-1">{post.title}</h3>
                    <p className="small mb-0" style={{ color: theme.muted }}>
                      {post.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {centerPost && (
              <article
                className="blog-center-card rounded-4 overflow-hidden"
                onClick={() => openPost(centerPost)}
                onKeyDown={(e) => e.key === "Enter" && openPost(centerPost)}
                role="button"
                tabIndex={0}
                style={{
                  backgroundColor: theme.surface || theme.cardBackground,
                  color: theme.text,
                  border: `1px solid ${theme.borderColor}`,
                  boxShadow: `0 10px 36px ${theme.shadow}`,
                }}
              >
                <img src={centerPost.image} alt={centerPost.title} className="blog-center-image w-100" style={{ height: "min(320px, 40vw)" }} />
                <div className="blog-center-content">
                  <span className="blog-card-date" style={{ color: theme.muted }}>
                    {new Date(postDate(centerPost)).toLocaleDateString()}
                  </span>
                  <h1 className="h3 mt-2 mb-3">{centerPost.title}</h1>
                  <p className="blog-center-excerpt" style={{ color: theme.muted }}>
                    {centerPost.excerpt}
                  </p>
                  <p className="mb-0" style={{ lineHeight: 1.7 }}>
                    {centerPost.content}
                  </p>
                </div>
              </article>
            )}

            <div className="blog-side-column">
              {rightPosts.map((post) => (
                <article
                  key={postKey(post)}
                  className="blog-card rounded-4 overflow-hidden"
                  onClick={() => openPost(post)}
                  onKeyDown={(e) => e.key === "Enter" && openPost(post)}
                  role="button"
                  tabIndex={0}
                  style={{
                    backgroundColor: theme.surface || theme.cardBackground,
                    color: theme.text,
                    border: `1px solid ${theme.borderColor}`,
                    boxShadow: `0 6px 20px ${theme.shadow}`,
                  }}
                >
                  <img src={post.image} alt={post.title} className="blog-card-image" style={{ height: "160px" }} />
                  <div className="blog-card-body">
                    <span className="blog-card-date" style={{ color: theme.muted }}>
                      {new Date(postDate(post)).toLocaleDateString()}
                    </span>
                    <h3 className="h6 mt-1">{post.title}</h3>
                    <p className="small mb-0" style={{ color: theme.muted }}>
                      {post.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {sortedPosts.length > 5 && (
            <div className="blog-archive mt-5 pt-4" style={{ borderTop: `1px solid ${theme.borderColor}` }}>
              <h3 className="h5 mb-4">More posts</h3>
              <div className="row g-4">
                {sortedPosts.slice(5).map((post) => (
                  <div key={postKey(post)} className="col-md-4">
                    <article
                      className="blog-card-sm rounded-4 overflow-hidden h-100"
                      onClick={() => openPost(post)}
                      onKeyDown={(e) => e.key === "Enter" && openPost(post)}
                      role="button"
                      tabIndex={0}
                      style={{
                        backgroundColor: theme.surface || theme.cardBackground,
                        color: theme.text,
                        border: `1px solid ${theme.borderColor}`,
                      }}
                    >
                      <img src={post.image} alt={post.title} className="w-100" style={{ height: "140px", objectFit: "cover" }} />
                      <div className="blog-card-body p-3">
                        <h5 className="h6">{post.title}</h5>
                        <p className="small mb-0" style={{ color: theme.muted }}>
                          {post.excerpt}
                        </p>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Blog;
