import { resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  const CategoryGrid: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    if (!fileData || !allFiles) {
      return null
    }

    // 현재 페이지의 하위 폴더만 필터링
    const currentPath = fileData.slug === "index" ? "" : fileData.slug!.replace("/index", "")

    const categories = allFiles
      .filter((file) => {
        const slug = file.slug ?? ""

        // index 파일만
        if (!slug.endsWith("/index")) return false

        const folderPath = slug.replace("/index", "")

        // project 폴더 제외
        if (folderPath === "project" || folderPath.startsWith("project/")) return false

        // 루트 페이지인 경우: 최상위 폴더만
        if (currentPath === "") {
          return !folderPath.includes("/")
        }

        // 하위 페이지인 경우: 현재 경로의 직계 하위 폴더만
        return (
          folderPath.startsWith(currentPath + "/") &&
          folderPath.slice(currentPath.length + 1).split("/").length === 1
        )
      })
      .map((file) => {
        const frontmatter = file.frontmatter ?? {}
        const slug = file.slug ?? ""
        const folderName = slug.replace("/index", "")

        return {
          title: frontmatter.title || folderName.split("/").pop() || folderName,
          icon: frontmatter.icon || "📁",
          slug: folderName,
        }
      })

    if (categories.length === 0) {
      return null
    }

    return (
      <div>
        <h2 class="section-title">카테고리</h2>
        <div class="category-grid">
          {categories.map((cat) => {
            const isUrl = cat.icon.startsWith("http://") || cat.icon.startsWith("https://")

            return (
              <a
                href={resolveRelative(fileData.slug!, (cat.slug + "/") as any)}
                class="category-card"
              >
                <div class="category-icon">
                  {isUrl ? <img src={cat.icon} alt={cat.title} /> : cat.icon}
                </div>
                <div class="category-title">{cat.title}</div>
              </a>
            )
          })}
        </div>
      </div>
    )
  }

  CategoryGrid.css = `
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.category-card {
  border: 1px solid var(--lightgray);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  background: var(--light);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 400px;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.category-icon {
  font-size: 2.5em;
  display: flex;
  justify-content: center;
  align-items: center;
}

.category-icon img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  margin: 0;
}

.category-title {
  font-size: 1em;
  font-weight: 600;
  margin: 0;
  color: var(--dark);
}

.category-type {
  font-weight: bold;
  color: var(--secondary);
  margin-bottom: 8px;
}

.category-desc {
  color: var(--gray);
  font-size: 0.95em;
}

.section-title {
  font-size: 2em;
  font-weight: bold;
  margin: 40px 0 20px 0;
  color: var(--dark);
}
`

  return CategoryGrid
}) satisfies QuartzComponentConstructor
