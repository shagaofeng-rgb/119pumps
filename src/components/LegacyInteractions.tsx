"use client";

import { useEffect } from "react";

export function LegacyInteractions({ path }: { path: string }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".legacy-content");
    if (!root) return;
    const cleanups: Array<() => void> = [];

    root.querySelectorAll<HTMLElement>(".sub_proDetail_main").forEach((section) => {
      const tabs = Array.from(section.querySelectorAll<HTMLElement>(".tab_menu > li"));
      const boxes = Array.from(section.querySelector<HTMLElement>(".tab_box")?.children || []).filter((element): element is HTMLElement => element instanceof HTMLElement);
      if (!tabs.length || !boxes.length) return;
      const activate = (index: number) => {
        tabs.forEach((tab, i) => tab.classList.toggle("current", i === index));
        boxes.forEach((box, i) => { box.style.display = i === index ? "block" : "none"; });
      };
      activate(0);
      tabs.forEach((tab, index) => {
        tab.setAttribute("role", "button");
        tab.tabIndex = 0;
        const onClick = () => activate(index);
        const onKey = (event: KeyboardEvent) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onClick(); } };
        tab.addEventListener("click", onClick);
        tab.addEventListener("keydown", onKey);
        cleanups.push(() => { tab.removeEventListener("click", onClick); tab.removeEventListener("keydown", onKey); });
      });
    });

    root.querySelectorAll<HTMLElement>(".pro_det_top_lunbo").forEach((carousel) => {
      const items = Array.from(carousel.querySelectorAll<HTMLElement>(":scope > .item"));
      if (items.length < 2) return;
      let current = 0;
      const show = (index: number) => {
        current = (index + items.length) % items.length;
        items.forEach((item, i) => { item.style.display = i === current ? "block" : "none"; });
      };
      show(0);
      const controls = document.createElement("div");
      controls.className = "imported-gallery-controls";
      const previous = document.createElement("button");
      previous.type = "button";
      previous.textContent = "‹";
      previous.setAttribute("aria-label", "Previous product image");
      const next = document.createElement("button");
      next.type = "button";
      next.textContent = "›";
      next.setAttribute("aria-label", "Next product image");
      previous.onclick = () => show(current - 1);
      next.onclick = () => show(current + 1);
      controls.append(previous, next);
      carousel.append(controls);
      cleanups.push(() => controls.remove());
    });

    const hotList = root.querySelector<HTMLElement>(".cbox01 .rollbox ul");
    if (hotList) {
      for (const [selector, direction] of [["#prev", -1], ["#next", 1]] as const) {
        const control = root.querySelector<HTMLElement>(`.cbox01 ${selector}`);
        if (!control) continue;
        const move = (event: Event) => { event.preventDefault(); hotList.scrollBy({ left: direction * 280, behavior: "smooth" }); };
        control.addEventListener("click", move);
        cleanups.push(() => control.removeEventListener("click", move));
      }
    }

    const enlarge = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      if (!target.closest(".sub_gallery, .pro_det_top_lunbo, .sub_pro_box, .sub_appli")) return;
      const link = target.closest<HTMLAnchorElement>("a");
      if (link && link.getAttribute("href") !== "#") return;
      event.preventDefault();
      const overlay = document.createElement("div");
      overlay.className = "image-lightbox";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-label", "Product image");
      const image = document.createElement("img");
      image.src = target.src;
      image.alt = target.alt;
      const close = document.createElement("button");
      close.type = "button";
      close.textContent = "×";
      close.setAttribute("aria-label", "Close image");
      close.onclick = () => overlay.remove();
      overlay.onclick = (click) => { if (click.target === overlay) overlay.remove(); };
      overlay.append(image, close);
      document.body.append(overlay);
    };
    root.addEventListener("click", enlarge);
    cleanups.push(() => root.removeEventListener("click", enlarge));

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [path]);
  return null;
}
