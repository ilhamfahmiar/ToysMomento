import { useState, useEffect } from "react";

/**
 * Hook untuk melacak section yang sedang aktif di viewport.
 * Menggunakan IntersectionObserver via react-intersection-observer.
 *
 * @param sectionIds - Array ID section yang ingin dilacak
 * @returns activeSection - ID section yang sedang aktif di viewport
 */
function useActiveSection(sectionIds: string[]): string {
  const [activeSection, setActiveSection] = useState<string>(
    sectionIds[0] ?? "",
  );

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.5 },
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [sectionIds]);

  return activeSection;
}

export default useActiveSection;
