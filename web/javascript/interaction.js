const accordBtns = document.querySelectorAll(".acc-click");
const accordItems = document.querySelectorAll(".item");
var selected;

console.log(accordBtns);

accordBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    // Remove 'open' from all items
    accordItems.forEach((item) => item.classList.remove("open"));

    if (btn != selected) {
      // Add 'open' only to the clicked item's corresponding item
      accordItems[index].classList.add("open");

      selected = btn;
    } else {
      selected = [];
    }
  });
});
