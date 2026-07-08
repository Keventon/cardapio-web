import {
  BackpackIcon,
  ClipboardIcon,
  MagnifyingGlassIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import type { MenuCategory } from "../../types/menu";
import { BurgerIcon } from "../icons/BurgerIcon";
import { ProfileDialog } from "../profile/ProfileDialog";

const COMPACT_HEADER_SCROLL_START = 190;
const FULL_HEADER_SCROLL_RESTORE = 90;

type CategoryNavProps = {
  activeCategory: MenuCategory["id"];
  cartCount: number;
  categories: MenuCategory[];
  onCategoryChange: (category: MenuCategory["id"]) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  storeName: string;
};

export function CategoryNav({
  activeCategory,
  cartCount,
  categories,
  onCategoryChange,
  onSearchChange,
  searchQuery,
  storeName,
}: CategoryNavProps) {
  const [isCompact, setIsCompact] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollOffset = isCompact ? 92 : 230;

  useEffect(() => {
    function handleScroll() {
      setIsCompact((currentIsCompact) => {
        if (currentIsCompact) {
          return window.scrollY > FULL_HEADER_SCROLL_RESTORE;
        }

        return window.scrollY > COMPACT_HEADER_SCROLL_START;
      });
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function focusSearchInput() {
    if (!isCompact) {
      searchInputRef.current?.focus();
      return;
    }

    window.scrollTo({ behavior: "smooth", left: 0, top: 0 });
    window.setTimeout(() => searchInputRef.current?.focus(), 300);
  }

  return (
    <section
      className={`sticky top-0 z-40 border-b border-border bg-surface/95 shadow-[0_8px_24px_rgba(94,54,30,0.08)] backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-8 lg:px-16 ${
        isCompact ? "px-3 py-2" : "px-5 py-4"
      }`}
    >
      <div
        className={`mx-auto flex max-w-342.5 flex-col transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isCompact ? "gap-2" : "gap-4"
        }`}
      >
        <div
          className={`overflow-hidden transition-[max-height,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isCompact
              ? "max-h-0 -translate-y-3 opacity-0"
              : "max-h-[11.25rem] translate-y-0 opacity-100"
          }`}
        >
          <div className="space-y-4">
            <div
              className={`flex items-start justify-between gap-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isCompact ? "-translate-y-2" : "translate-y-0"
              }`}
            >
              <div className="min-w-0">
                <a className="flex max-w-full" href="#menu">
                  <span className="flex min-w-0 max-w-full items-center gap-2 text-brand font-extrabold leading-tight text-primary-dark">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-soft text-primary-dark">
                      <BurgerIcon className="h-5 w-5" />
                    </span>
                    <span className="truncate">{storeName}</span>
                  </span>
                </a>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption font-extrabold text-text-muted">
                  <span className="inline-flex items-center gap-1 text-rating-text">
                    <StarFilledIcon className="h-3.5 w-3.5 text-rating" />
                    4.8
                  </span>
                  <span>25-35 min</span>
                  <span className="text-primary">Aberto</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 text-primary-dark sm:gap-3">
                <button
                  aria-label="Pesquisar no cardápio"
                  className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-surface-hover"
                  onClick={focusSearchInput}
                  type="button"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>

                <Dialog.Trigger asChild>
                  <button
                    aria-label="Abrir pedido"
                    className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-surface-hover"
                    type="button"
                  >
                    <BackpackIcon className="h-5 w-5" />
                    <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-micro font-extrabold leading-none text-white">
                      {cartCount}
                    </span>
                  </button>
                </Dialog.Trigger>

                <Link
                  aria-label="Meus pedidos"
                  className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-surface-hover"
                  to="pedidos"
                >
                  <ClipboardIcon className="h-5 w-5" />
                </Link>

                <ProfileDialog />
              </div>
            </div>

            <label
              className={`relative block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isCompact ? "-translate-y-2" : "translate-y-0"
              }`}
            >
              <span className="sr-only">Buscar no cardápio</span>
              <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-main" />
              <input
                className="h-13 w-full rounded-full border border-border-input bg-surface-soft px-12 text-body-sm font-medium text-text-main outline-none transition placeholder:text-placeholder-muted focus:border-primary focus:bg-white"
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar no cardápio..."
                ref={searchInputRef}
                type="search"
                value={searchQuery}
              />
            </label>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`shrink-0 overflow-hidden transition-[width,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isCompact
                ? "w-10 translate-x-0 opacity-100"
                : "pointer-events-none w-0 -translate-x-3 opacity-0"
            }`}
          >
            <button
              aria-label="Pesquisar no cardápio"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border-input bg-surface text-primary-dark transition hover:bg-surface-hover"
              onClick={focusSearchInput}
              type="button"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>

          <ScrollArea.Root className="min-w-0 flex-1">
            <ScrollArea.Viewport className="w-full">
              <div className="flex min-w-max gap-2 pb-2 pt-1 xl:pb-0">
                {categories.map((category) => (
                  <CategoryButton
                    category={category}
                    isActive={category.id === activeCategory}
                    key={category.label}
                    onCategoryChange={onCategoryChange}
                    scrollOffset={scrollOffset}
                  />
                ))}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="flex h-2.5 touch-none select-none bg-transparent p-0.5 xl:hidden"
              orientation="horizontal"
            >
              <ScrollArea.Thumb className="relative flex-1 rounded-full bg-scroll-thumb" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>
      </div>
    </section>
  );
}

function CategoryButton({
  category,
  isActive,
  onCategoryChange,
  scrollOffset,
}: {
  category: MenuCategory;
  isActive: boolean;
  onCategoryChange: (category: MenuCategory["id"]) => void;
  scrollOffset: number;
}) {
  const targetId = category.id === "all" ? "menu" : category.id;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onCategoryChange(category.id);

    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    window.scrollTo({
      behavior: "smooth",
      left: 0,
      top: target.getBoundingClientRect().top + window.scrollY - scrollOffset,
    });
  }

  return (
    <a
      className={`flex h-12 shrink-0 items-center rounded-full border px-5 text-left text-caption font-extrabold transition-all duration-300 ease-out hover:-translate-y-0.5 ${
        isActive
          ? "border-primary bg-primary text-white shadow-sm"
          : "border-border-input bg-surface text-text-subtle hover:bg-surface-pill-hover hover:text-primary-deep hover:shadow-sm"
      }`}
      href={`#${targetId}`}
      onClick={handleClick}
    >
      <span className="whitespace-nowrap">{category.label}</span>
    </a>
  );
}
