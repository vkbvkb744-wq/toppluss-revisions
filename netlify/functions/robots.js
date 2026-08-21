exports.handler = async () => {
  const robots = `User-agent: *
Allow: /

Sitemap: https://www.topplussrevisions.com/sitemap.xml`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: robots,
  };
};
