const purgecss = {
  content: ["./hugo_stats.json"],
  defaultExtractor: (content) => {
    let stats;
    try {
      stats = JSON.parse(content).htmlElements;
    } catch (e) {
      console.warn('Failed to parse hugo_stats.json:', e);
      return [];
    }
    return [
      ...(stats?.tags || []),
      ...(stats?.classes || []),
      ...(stats?.ids || []),
    ];
  },
  safelist: [
    /^swiper-/,
    /^lb-/,
    /^gl/,
    /^go/,
    /^gc/,
    /^gs/,
    /^gi/,
    /^gz/,
    /^gprev/,
    /^gnext/,
    /^desc/,
    /^zoom/,
    /^search/,
    /^:is/,
    /dark/,
    /show/,
    /dragging/,
    /fullscreen/,
    /loaded/,
    /visible/,
    /current/,
    /active/,
  ],
};

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    '@fullhuman/postcss-purgecss': process.env.HUGO_ENVIRONMENT === 'production' ? purgecss : false,
  },
};
