const { DateTime } = require("luxon");

module.exports = {
  layout: "layouts/diary.njk",
  tags: ["diary"],
  permalink: (data) => {
    const dt = DateTime.fromJSDate(data.page.date, { zone: "Asia/Shanghai" });
    const day = dt.toFormat("yyyy/LL/dd");
    // Same-day notes need a slug to avoid colliding on /YYYY/MM/DD/.
    return data.slug
      ? `/${day}/${data.slug}/index.html`
      : `/${day}/index.html`;
  }
};
