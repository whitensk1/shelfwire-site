/**
 * Product video catalog — edit this file to add categories and clips.
 *
 * video: path under /media/ or full https URL
 * link: product page (WB, shop, etc.)
 * poster: optional thumbnail image
 *
 * Do not put personal / unrelated demo clips here — only product reels.
 */
window.SHELFWIRE_CATALOG = {
  siteName: "Shelfwire",
  tagline: "Product stories in motion",
  categories: [
    {
      id: "herby",
      title: "Herby",
      emoji: "🌿",
      blurb: "Short product reels for the Herby line",
      accent: "#3ecf8e",
      items: [
        // Add your Herby clips here, e.g.:
        // {
        //   id: "herby-1",
        //   title: "Herby — highlight",
        //   blurb: "One line about the product.",
        //   link: "https://your-product-url",
        //   video: "media/herby-1.mp4",
        //   poster: "media/herby-1.jpg",
        // },
      ],
    },
    {
      id: "catalog-drop",
      title: "Catalog drop",
      emoji: "📦",
      blurb: "Assortment shots for B2B buyers",
      accent: "#6c8cff",
      items: [],
    },
    {
      id: "pins",
      title: "Pinterest picks",
      emoji: "📌",
      blurb: "Clips mirrored from pin campaigns",
      accent: "#e8c07d",
      items: [],
    },
  ],
};
