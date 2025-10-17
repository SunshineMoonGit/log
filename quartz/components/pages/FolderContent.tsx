import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

import style from "../styles/listPage.scss"
import { PageList, SortFn } from "../PageList"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { QuartzPluginData } from "../../plugins/vfile"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"
import { trieFromAllFiles } from "../../util/ctx"
// @ts-ignore
import script from "../scripts/pagination.inline"
import paginationStyle from "../styles/pagination.scss"

interface FolderContentOptions {
  /**
   * Whether to display number of folders
   */
  showFolderCount: boolean
  showSubfolders: boolean
  sort?: SortFn
  /**
   * Maximum number of items per page (0 = show all, no pagination)
   */
  itemsPerPage?: number
}

const defaultOptions: FolderContentOptions = {
  showFolderCount: true,
  showSubfolders: true,
  itemsPerPage: 5,
}

export default ((opts?: Partial<FolderContentOptions>) => {
  const options: FolderContentOptions = { ...defaultOptions, ...opts }

  const FolderContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, cfg } = props

    const trie = (props.ctx.trie ??= trieFromAllFiles(allFiles))
    const folder = trie.findNode(fileData.slug!.split("/"))
    if (!folder) {
      return null
    }

    const allPagesInFolder: QuartzPluginData[] =
      folder.children
        .map((node) => {
          // regular file, proceed
          if (node.data) {
            return node.data
          }

          if (node.isFolder && options.showSubfolders) {
            // folders that dont have data need synthetic files
            const getMostRecentDates = (): QuartzPluginData["dates"] => {
              let maybeDates: QuartzPluginData["dates"] | undefined = undefined
              for (const child of node.children) {
                if (child.data?.dates) {
                  // compare all dates and assign to maybeDates if its more recent or its not set
                  if (!maybeDates) {
                    maybeDates = { ...child.data.dates }
                  } else {
                    if (child.data.dates.created > maybeDates.created) {
                      maybeDates.created = child.data.dates.created
                    }

                    if (child.data.dates.modified > maybeDates.modified) {
                      maybeDates.modified = child.data.dates.modified
                    }

                    if (child.data.dates.published > maybeDates.published) {
                      maybeDates.published = child.data.dates.published
                    }
                  }
                }
              }
              return (
                maybeDates ?? {
                  created: new Date(),
                  modified: new Date(),
                  published: new Date(),
                }
              )
            }

            return {
              slug: node.slug,
              dates: getMostRecentDates(),
              frontmatter: {
                title: node.displayName,
                tags: [],
              },
            }
          }
        })
        .filter((page) => page !== undefined) ?? []

    // Sort by modified date (most recent first)
    const sortedPages = allPagesInFolder.sort((a, b) => {
      return (b.dates?.modified?.getTime() ?? 0) - (a.dates?.modified?.getTime() ?? 0)
    })

    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")
    const listProps = {
      ...props,
      sort: options.sort,
      allFiles: sortedPages,
    }

    const itemsPerPage = options.itemsPerPage ?? 0
    const totalPages = itemsPerPage > 0 ? Math.ceil(sortedPages.length / itemsPerPage) : 1

    const content = (
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)
    ) as ComponentChildren

    return (
      <div class="popover-hint">
        <article class={classes}>{content}</article>
        <div class="page-listing-wrapper" data-items-per-page={itemsPerPage} data-total-items={sortedPages.length}>
          <div class="page-listing">
            {options.showFolderCount && (
              <p class="folder-count">
                {i18n(cfg.locale).pages.folderContent.itemsUnderFolder({
                  count: allPagesInFolder.length,
                })}
              </p>
            )}
            <div class="paginated-content">
              <PageList {...listProps} />
            </div>
          </div>
          {itemsPerPage > 0 && totalPages > 1 && (
            <nav class="pagination" data-total-pages={totalPages}>
              <button class="pagination-btn pagination-prev" data-action="prev" disabled>
                ← 이전
              </button>
              <div class="pagination-numbers"></div>
              <button class="pagination-btn pagination-next" data-action="next">
                다음 →
              </button>
            </nav>
          )}
        </div>
      </div>
    )
  }

  FolderContent.css = concatenateResources(style, PageList.css, paginationStyle)
  FolderContent.afterDOMLoaded = script
  return FolderContent
}) satisfies QuartzComponentConstructor
