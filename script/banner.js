document.addEventListener("DOMContentLoaded", () => {
  const bannerContainer = document.getElementById("banner-img");
  const bannerSlides = document.querySelectorAll(".img-item");
  const prevButton = document.getElementById("left-botton");
  const nextButton = document.getElementById("right-botton");

  const slideWidth = bannerSlides[0].offsetWidth;
  let currentSlideIndex = 0;

  const updateSlidePosition = () => {
    bannerContainer.style.transform = `translateX(-${currentSlideIndex * slideWidth}px)`;
  };

  prevButton.addEventListener("click", () => {
    currentSlideIndex = (currentSlideIndex - 1 + bannerSlides.length) % bannerSlides.length;
    updateSlidePosition();
  });

  nextButton.addEventListener("click", () => {
    currentSlideIndex = (currentSlideIndex + 1) % bannerSlides.length;
    updateSlidePosition();
  });

  setInterval(() => {
    currentSlideIndex = (currentSlideIndex + 1) % bannerSlides.length;
    updateSlidePosition();
  }, 4000);
});