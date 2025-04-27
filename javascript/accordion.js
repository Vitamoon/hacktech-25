const explanationBlocks = document.querySelectorAll(".explanations .exp");

function checkSlide() {
  explanationBlocks.forEach((block) => {
    const slideInAt =
      window.scrollY + window.innerHeight - block.offsetHeight / 2;
    const blockBottom = block.offsetTop + block.offsetHeight;
    const isHalfShown = slideInAt > block.offsetTop;
    const isNotScrolledPast = window.scrollY < blockBottom;

    if (isHalfShown && isNotScrolledPast) {
      block.classList.add("slide-in");
    } else {
      block.classList.remove("slide-in");
    }
  });
}

// Throttling the scroll event to improve performance
let isScrolling = false;
window.addEventListener("scroll", () => {
  if (!isScrolling) {
    isScrolling = true;
    requestAnimationFrame(() => {
      checkSlide();
      isScrolling = false;
    });
  }
});
