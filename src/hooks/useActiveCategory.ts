import { useEffect, useState } from "react";
import type { MenuCategory } from "../types/menu";

type UseActiveCategoryOptions = {
  categories: MenuCategory[];
  enabled: boolean;
};

export function useActiveCategory({
  categories,
  enabled,
}: UseActiveCategoryOptions) {
  const [activeCategory, setActiveCategory] =
    useState<MenuCategory["id"]>("all");

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const categoryIds = categories
      .filter((category) => category.id !== "all")
      .map((category) => category.id);
    const sections = categoryIds
      .map((categoryId) => document.getElementById(categoryId))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) {
      return;
    }

    function updateActiveCategory() {
      const activationLine = window.scrollY + 180;
      const currentSection = sections.findLast(
        (section) => section.offsetTop <= activationLine,
      );

      setActiveCategory((currentCategory) => {
        const nextCategory = currentSection?.id ?? "all";

        return currentCategory === nextCategory
          ? currentCategory
          : (nextCategory as MenuCategory["id"]);
      });
    }

    const observer = new IntersectionObserver(updateActiveCategory, {
      root: null,
      rootMargin: "-120px 0px -65% 0px",
      threshold: [0, 0.15, 0.5, 1],
    });

    sections.forEach((section) => observer.observe(section));
    updateActiveCategory();
    window.addEventListener("scroll", updateActiveCategory, { passive: true });
    window.addEventListener("resize", updateActiveCategory);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateActiveCategory);
      window.removeEventListener("resize", updateActiveCategory);
    };
  }, [categories, enabled]);

  return {
    activeCategory,
    setActiveCategory,
  };
}
