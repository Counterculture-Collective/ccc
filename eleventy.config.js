const dateFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
})
const ordinalRules = new Intl.PluralRules("en-US", { type: "ordinal" })
const ordinalSuffixes = { one: "st", two: "nd", few: "rd", other: "th" }

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css")
  eleventyConfig.addPassthroughCopy("src/js")
  eleventyConfig.addPassthroughCopy("src/images")

  eleventyConfig.addFilter("limit", (arr, n) => arr.slice(0, n))

  eleventyConfig.addFilter("upcoming", (shows, limit) => {
    const today = new Date().toISOString().slice(0, 10)
    return shows.filter((show) => show.date >= today).slice(0, limit)
  })

  eleventyConfig.addFilter("showDate", (date) =>
    dateFormat
      .formatToParts(new Date(date))
      .map(({ type, value }) =>
        type === "day"
          ? value + '<sup>' + ordinalSuffixes[ordinalRules.select(Number(value))] + '</sup>'
          : value,
      )
      .join(""),
  )

  eleventyConfig.setServerOptions({ showAllHosts: true })

  return {
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
    },
  }
}
