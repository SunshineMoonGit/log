function setupPagination() {
  const pageListings = document.querySelectorAll(".page-listing-wrapper[data-items-per-page]")

  pageListings.forEach((pageListing) => {
    const itemsPerPage = parseInt(pageListing.getAttribute("data-items-per-page") || "0")
    if (itemsPerPage === 0) return

    const paginatedContent = pageListing.querySelector(".paginated-content")
    if (!paginatedContent) return

    const items = Array.from(paginatedContent.querySelectorAll(".section-li"))
    const totalItems = items.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    if (totalPages <= 1) return

    let currentPage = 1

    const pagination = pageListing.querySelector(".pagination")
    if (!pagination) return

    const prevBtn = pagination.querySelector(".pagination-prev") as HTMLButtonElement
    const nextBtn = pagination.querySelector(".pagination-next") as HTMLButtonElement
    const numbersContainer = pagination.querySelector(".pagination-numbers") as HTMLDivElement

    function renderPageNumbers() {
      if (!numbersContainer) return

      numbersContainer.innerHTML = ""

      // 현재 페이지 기준으로 5개씩 보여주기
      const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1
      const endPage = Math.min(startPage + 4, totalPages)

      for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button")
        pageBtn.className = "pagination-number"
        pageBtn.textContent = String(i)
        pageBtn.dataset.page = String(i)

        if (i === currentPage) {
          pageBtn.classList.add("active")
          pageBtn.disabled = true
        }

        pageBtn.addEventListener("click", () => goToPage(i))
        numbersContainer.appendChild(pageBtn)
      }

      // 다음 그룹이 있으면 "..." 표시
      if (endPage < totalPages) {
        const dots = document.createElement("span")
        dots.className = "pagination-dots"
        dots.textContent = "..."
        numbersContainer.appendChild(dots)
      }
    }

    function goToPage(page: number) {
      if (page < 1 || page > totalPages) return

      currentPage = page
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage

      // 모든 아이템 숨기기
      items.forEach((item, index) => {
        if (index >= startIndex && index < endIndex) {
          (item as HTMLElement).style.display = ""
        } else {
          (item as HTMLElement).style.display = "none"
        }
      })

      // 버튼 상태 업데이트
      if (prevBtn) {
        prevBtn.disabled = currentPage === 1
      }
      if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages
      }

      // 페이지 번호 다시 렌더링
      renderPageNumbers()

      // 스크롤을 페이지 목록 상단으로
      pageListing.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    // 초기 렌더링
    goToPage(1)

    // 이벤트 리스너
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          // 이전 그룹의 마지막 페이지로 이동
          const newPage = Math.max(1, Math.floor((currentPage - 2) / 5) * 5 + 5)
          goToPage(newPage)
        }
      })
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
          // 다음 그룹의 첫 페이지로 이동
          const newPage = Math.min(totalPages, Math.floor(currentPage / 5) * 5 + 6)
          goToPage(newPage)
        }
      })
    }
  })
}

// 페이지 로드 시 및 SPA 네비게이션 시 실행
document.addEventListener("nav", setupPagination)
window.addEventListener("load", setupPagination)
