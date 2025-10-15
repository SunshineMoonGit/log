import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "기쁘달",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "sunshinemoongit.github.io/log",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Pretendard",
        body: "Pretendard",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#fdfcfb",
          lightgray: "#f0eee9",
          gray: "#c4bfb3",
          darkgray: "#5a5347",
          dark: "#2d2a24",
          secondary: "#6b9bd1",
          tertiary: "#a8b5d1",
          highlight: "rgba(107, 155, 209, 0.12)",
          textHighlight: "#ffd97d88",
        },
        darkMode: {
          light: "#1a1a1f",
          lightgray: "#2a2a32",
          gray: "#5a5a68",
          darkgray: "#c8c8d4",
          dark: "#e8e8f0",
          secondary: "#8eaccd",
          tertiary: "#a8b5d1",
          highlight: "rgba(142, 172, 205, 0.15)",
          textHighlight: "#f0c97588",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
