/* SHOW ALL SHOWS MODAL STUFF */

const showShowsButton = document.querySelector(".shows__btn")
const showShowsDialog = document.querySelector("#showShowsDialog")
const closeShowsDialogButton = document.querySelector(
  "#showShowsDialog .closeModalButton",
)
if (showShowsButton && showShowsDialog && closeShowsDialogButton) {
  showShowsButton.addEventListener("click", () => {
    showShowsDialog.showModal()
  })
  // The dialog fills the viewport, so a click that lands on the dialog itself
  // (not on the .dialog-panel inside it) is a click outside the content.
  showShowsDialog.addEventListener("click", (e) => {
    if (e.target === showShowsDialog) showShowsDialog.close()
  })
  closeShowsDialogButton.addEventListener("click", () => {
    showShowsDialog.close()
  })
}

/* MOBILE / POPUP MENU STUFF */

const hamburgerMenuButton = document.querySelector(".hamburger-menu-button")
const responsiveMenu = document.querySelector(".main-nav")
const responsiveMenuPanel = responsiveMenu?.querySelector(".main-nav__panel")

if (hamburgerMenuButton && responsiveMenu && responsiveMenuPanel) {
  const menuIcon = hamburgerMenuButton.querySelector("#hamToX")
  const menuFocusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(", ")
  const getMenuFocusableElements = () => {
    return [
      hamburgerMenuButton,
      ...responsiveMenu.querySelectorAll(menuFocusableSelector),
    ].filter((element) => {
      if (!(element instanceof HTMLElement)) return false
      if (element.hidden) return false
      if (element.getAttribute("aria-hidden") === "true") return false
      return true
    })
  }
  const setMenuIconState = (isOpen) => {
    if (!menuIcon) return
    menuIcon.classList.toggle("animate-ham-to-x", isOpen)
  }

  const lockScroll = () => {
    const scrollY = window.scrollY
    document.body.dataset.scrollLockY = String(scrollY)
    document.documentElement.style.setProperty(
      "--scroll-lock-y",
      `${scrollY}px`,
    )
    document.documentElement.classList.add("menu-open")
    document.body.classList.add("menu-open")
  }

  const unlockScroll = () => {
    const scrollY =
      Number.parseInt(document.body.dataset.scrollLockY || "0", 10) || 0
    const previousScrollBehavior = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = "auto"
    document.documentElement.classList.remove("menu-open")
    document.body.classList.remove("menu-open")
    delete document.body.dataset.scrollLockY
    document.documentElement.style.setProperty("--scroll-lock-y", "0px")
    window.scrollTo(0, scrollY)
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior
    })
  }

  const setMenuInert = (isInert) => {
    if ("inert" in responsiveMenu) {
      responsiveMenu.inert = isInert
      return
    }
    if (isInert) {
      responsiveMenu.setAttribute("inert", "")
      return
    }
    responsiveMenu.removeAttribute("inert")
  }

  const finalizeMenuClose = () => {
    responsiveMenu.hidden = true
    responsiveMenu.classList.remove("is-closing")
    setMenuInert(true)
    unlockScroll()
    // setPrimaryNavPinFrozen(false);
    requestAnimationFrame(() => {
      // refreshPrimaryNavPin();
    })
  }

  const openMenu = () => {
    // setPrimaryNavPinFrozen(true);
    lockScroll()
    responsiveMenu.classList.remove("is-open", "is-closing")
    responsiveMenu.hidden = false
    responsiveMenu.setAttribute("aria-hidden", "false")
    hamburgerMenuButton.setAttribute("aria-expanded", "true")
    setMenuInert(false)
    setMenuIconState(true)
    // Force closed-state styles to paint before toggling open-state transition.
    void responsiveMenuPanel.offsetHeight
    responsiveMenu.classList.add("is-open")
    requestAnimationFrame(() => {
      const [, firstMenuElement] = getMenuFocusableElements()
      firstMenuElement?.focus()
    })
  }

  const closeMenu = ({ immediate = false } = {}) => {
    responsiveMenu.setAttribute("aria-hidden", "true")
    hamburgerMenuButton.setAttribute("aria-expanded", "false")
    responsiveMenu.classList.remove("is-open")
    setMenuIconState(false)

    if (immediate) {
      finalizeMenuClose()
      return
    }

    responsiveMenu.classList.add("is-closing")
  }

  const isMenuOpen = () => {
    return responsiveMenu.classList.contains("is-open")
  }

  hamburgerMenuButton.addEventListener("click", () => {
    if (isMenuOpen()) {
      closeMenu()
      return
    }
    openMenu()
  })

  responsiveMenuPanel.addEventListener("transitionend", (event) => {
    if (event.propertyName !== "transform") return
    if (!responsiveMenu.classList.contains("is-closing")) return
    finalizeMenuClose()
  })

  responsiveMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu({ immediate: true })
    })
  })

  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab" && isMenuOpen()) {
      const focusableElements = getMenuFocusableElements()
      if (!focusableElements.length) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (!focusableElements.includes(activeElement)) {
        event.preventDefault()
        firstElement.focus()
        return
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
        return
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
      return
    }

    if (event.key !== "Escape") return
    if (!isMenuOpen()) return
    closeMenu()
    hamburgerMenuButton.focus()
  })

  document.addEventListener("focusin", (event) => {
    if (!isMenuOpen()) return

    const target = event.target
    if (!(target instanceof Node)) return
    if (responsiveMenu.contains(target) || hamburgerMenuButton.contains(target))
      return

    const [, firstMenuElement] = getMenuFocusableElements()
    firstMenuElement?.focus()
  })

  window.addEventListener("resize", () => {
    if (
      window.innerWidth >= 1024 &&
      (isMenuOpen() || responsiveMenu.classList.contains("is-closing"))
    ) {
      closeMenu({ immediate: true })
    }
  })
}
