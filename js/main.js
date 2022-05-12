$(function() {
  var $win = $(window),
      $fv = $('.fv'),
      $header = $('.header'),
      fvHeight = $fv.outerHeight();
      fixedClass = 'fixed';

    $win.on('load scroll',function(){
      var value = $(this).scrollTop();
      if($win.width() > 768){
        if(value > fvHeight){
          $header.addClass(fixedClass);
        }else{
          $header.removeClass(fixedClass);
        }
      }
    });
    
    //ハンバーガーメニュー
    $('.burger_btn').on('click', function() {
      if ($('.header').hasClass('open')) {
        $('.header').removeClass('open');
      } else {
        $('.header').addClass('open');
      }
      $('body').toggleClass('noscroll');
    });
    
    // #maskのエリアをクリックした時にメニューを閉じる
    $('#mask').on('click', function() {
      $('.header').removeClass('open');
    });
    
    // リンクをクリックした時にメニューを閉じる
    $('.a_header_nav a').on('click', function() {
      $('.header').removeClass('open');
    });

    //スライダー
    $('.slider').slick({
      autoplay: true,
      autoplaySpeed: 2000,
      fade: true,
      speed: 1000,
      cssEase: 'linear'
    });
  });