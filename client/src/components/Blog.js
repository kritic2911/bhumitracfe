import React from "react";

const postKey = (post) => post.id ?? post.blog_id;
const postDate = (post) => post.date || post.created_at;

const Blog = ({ theme, posts }) => {
  const sortedPosts = [...posts].sort((a, b) => new Date(postDate(b)) - new Date(postDate(a)));
  const recentPosts = sortedPosts.slice(0, 5);
  const centerPost = recentPosts[0];
  const leftPosts = recentPosts.slice(1, 3);
  const rightPosts = recentPosts.slice(3, 5);

  return (
    <div className="container py-5">
      <h2 className="h3 text-center mb-2" style={{ fontWeight: 600 }}>
        Blog
      </h2>
      <p className="text-center mb-5 small" style={{ color: theme.muted }}>
        Stories on products, reuse, and community work.
      </p>

      <div className="blog-magazine-layout">
        <div className="blog-side-column">
          {leftPosts.map((post) => (
            <article
              key={postKey(post)}
              className="blog-card rounded-4 overflow-hidden"
              style={{
                backgroundColor: theme.surface || theme.cardBackground,
                color: theme.text,
                border: `1px solid ${theme.borderColor}`,
                boxShadow: `0 6px 20px ${theme.shadow}`,
              }}
            >
              <img src={post.image} alt="" className="blog-card-image" style={{ height: "160px" }} />
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
            style={{
              backgroundColor: theme.surface || theme.cardBackground,
              color: theme.text,
              border: `1px solid ${theme.borderColor}`,
              boxShadow: `0 10px 36px ${theme.shadow}`,
            }}
          >
            <img src={centerPost.image} alt="" className="blog-center-image w-100" style={{ height: "min(320px, 40vw)" }} />
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
              style={{
                backgroundColor: theme.surface || theme.cardBackground,
                color: theme.text,
                border: `1px solid ${theme.borderColor}`,
                boxShadow: `0 6px 20px ${theme.shadow}`,
              }}
            >
              <img src={post.image} alt="" className="blog-card-image" style={{ height: "160px" }} />
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
                  style={{
                    backgroundColor: theme.surface || theme.cardBackground,
                    color: theme.text,
                    border: `1px solid ${theme.borderColor}`,
                  }}
                >
                  <img src={post.image} alt="" className="w-100" style={{ height: "140px", objectFit: "cover" }} />
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
    </div>
  );
};

export default Blog;
