/**
 * Hook untuk smooth scroll ke section berdasarkan ID elemen.
 *
 * @returns scrollToSection - Fungsi untuk scroll ke section dengan ID tertentu
 */
function useSmoothScroll() {
  const scrollToSection = (sectionId: string): void => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return { scrollToSection };
}

export default useSmoothScroll;
