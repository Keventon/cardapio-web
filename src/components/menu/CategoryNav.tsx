import * as ScrollArea from "@radix-ui/react-scroll-area";
import type { MouseEvent } from "react";
import type { MenuCategory } from "../../types/menu";

type CategoryNavProps = {
  activeCategory: MenuCategory["id"];
  categories: MenuCategory[];
  onCategoryChange: (category: MenuCategory["id"]) => void;
};

export function CategoryNav({
  activeCategory,
  categories,
  onCategoryChange,
}: CategoryNavProps) {
  return (
    <section className="sticky top-0 z-30 border-b border-border bg-surface-soft/95 px-5 py-4 shadow-sm backdrop-blur transition-shadow duration-300 ease-out sm:px-8 lg:px-16">
      <div className="mx-auto flex max-w-342.5 flex-col gap-4">
        <ScrollArea.Root className="min-w-0 flex-1">
          <ScrollArea.Viewport className="w-full">
            <div className="flex min-w-max gap-2 pb-2 xl:pb-0">
              {categories.map((category) => (
                <CategoryButton
                  category={category}
                  isActive={category.id === activeCategory}
                  key={category.label}
                  onCategoryChange={onCategoryChange}
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
    </section>
  );
}

function CategoryButton({
  category,
  isActive,
  onCategoryChange,
}: {
  category: MenuCategory;
  isActive: boolean;
  onCategoryChange: (category: MenuCategory["id"]) => void;
}) {
  const Icon = category.icon;
  const targetId = category.id === "all" ? "menu" : category.id;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onCategoryChange(category.id);

    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <a
      className={`flex h-11 shrink-0 items-center gap-3 rounded-full px-4 text-left text-micro font-extrabold transition-all duration-300 ease-out hover:-translate-y-0.5 ${
        isActive
          ? "bg-surface-pill text-primary-deep shadow-sm"
          : "text-text-subtle hover:bg-surface-pill-hover hover:text-primary-deep hover:shadow-sm"
      }`}
      href={`#${targetId}`}
      onClick={handleClick}
    >
      <Icon className="h-4 w-4" />
      <span className="whitespace-nowrap">{category.label}</span>
    </a>
  );
}
