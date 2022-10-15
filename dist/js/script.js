const test = "test";

$(function () {
  $('.jsAccordionTitle').on('click', function () {
    $(this).next().toggleClass('is-open');
    $(this).toggleClass('is-active');
  });
});
