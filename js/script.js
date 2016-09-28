$(window).on("load", function() {
    
    //to configure
    var numberOfColumns = 8;    //4, 8 or 16 (the same number as in styles.sass)
    var scrollNumber = 2;
    //global variables
    var line = 0;
    var numberOfLines, visibleLines;
    var $active;
    var mainImageTales;     //indexes of tales with big image
    
    
    //show pictures (animation) / hide loader
    $('.load').fadeOut(600, function(){ $(this).remove(); });
    $('img').each(function (i) {
        setTimeout(function () {
            $('img').eq(i).addClass('show');
        }, random(0, 800));
    });
    $('aside').removeClass('hide');
    
    //slide to top, start
    imagesOffset();
    slideTop();
    howManyLines();
    makeImageTales();
    
    //global functions
    function random (from, to) {
        return Math.floor((Math.random() * (to - from + 1)) + from);
    }
    function imagesOffset() {
        for (var i = 0; i < numberOfColumns * scrollNumber; i++)
            $('.container img:last-of-type').after('<img src="empty.gif">');
        $('.container img:last-of-type').after('<div class="clear"></div>');
    }
    function slideTop () {
        if (!isDim()) {
            $( 'html, body' ).animate({
                scrollTop: 0
            }, 600);
            line = 0;
            makeImageTales();
            howManyLines();
        }
    }
    function checkRatio () {
        return ($(window).width() / $(window).height());
    }
    function howManyLines () {
        numberOfLines = Math.ceil($('img:not(img[src="empty.gif"])').length / numberOfColumns);
        visibleLines = Math.floor(numberOfColumns / checkRatio());
    }
    function calculateImageTales () {
        if (numberOfColumns == 4)
            mainImageTales = [2, 3, 6, 7];
        else if (numberOfColumns == 8) {
            mainImageTales = [3, 4, 5, 6];
            var tmpArray = new Array(4);
            for (var i = 1; i < 4; i++) {
                for (var j = 0; j < 4; j++)
                    tmpArray[j] = mainImageTales[j] + i * 8;
                mainImageTales = mainImageTales.concat(tmpArray);    
            }
        }
        else if (numberOfColumns == 16) {
            mainImageTales = [5, 6, 7, 8, 9, 10, 11, 12];
            var tmpArray = new Array(8);
            for (var i = 1; i < 8; i++) {
                for (var j = 0; j < 8; j++)
                    tmpArray[j] = mainImageTales[j] + i * 16;
                mainImageTales = mainImageTales.concat(tmpArray);    
            }
        }
        else
            alert("Błąd, wartość numberOfColumns różna od 4, 8 lub 16!")
    }
    function makeImageTales () {
        //reset actual mainTales
        $('.relative img').unwrap('div');
        $('.container .inside').remove();
        $('img').attr('data-img', 'false');
        
        calculateImageTales();
        
        //add offset on mainImageTales
        for (var i = 0; i < mainImageTales.length; i++)
            mainImageTales[i] += numberOfColumns * line; 
        //set attributes on mainImageTales imgs
        for(var i = 0; i < mainImageTales.length; i++)
            $('img:nth-of-type(' + mainImageTales[i] + ')').attr('data-img', 'true');
        $('img[data-img="true"]').wrap('<div class="relative"/>').before('<div class="inside"></div>');
        
        wideMonitors();
    }
    function wideMonitors () {
        if ($(window).width() > 1920)
            $('.relative').addClass('px');
        else
            //set background size in pixels
            $('.relative.px').removeClass('px');
    }
    function scroll (e) {
        $(window).off('mousewheel DOMMouseScroll');
        setTimeout(function () {
            $(window).one('mousewheel DOMMouseScroll', scroll);       
        }, 1500);
        var wheelDirection;
        if (e.originalEvent.wheelDelta) {
            wheelDirection = e.originalEvent.wheelDelta;    
        }
        // Firefox doesn't implement wheelDelta
        if (e.detail) {
            wheelDirection = -e.detail;    
        }
        if (wheelDirection > 0)
            $('aside .up').trigger( 'mouseenter' );
        else if (wheelDirection < 0)
            $('aside .down').trigger( 'mouseenter' );
    }
    function hide () {
        $('.relative div').removeClass('transition');
        $('img').removeClass('dim');
        $(this).addClass('hide');
        $('aside').removeClass('hide');
        setTimeout(function (){
            $('img').css('transition-delay', '0ms');
            $('.inside').css('z-index', '-1');
        }, 1000);
    }
    function isLast ($object) {
        if ($active.next().is('.clear'))
            return true;
        if ($active.parent().next().is('.clear'))
            return true;
        if ($active.next().is('img[src="empty.gif"]'))
            return true;
        if ($active.parent().next().children().is('img[src="empty.gif"]'))
            return true;
        return false;
    }
    function isDim() {
        if($('img').is('.dim'))
            return true; 
        else
            return false;
    }
    function slide (e) {
        if (!isDim()) {
            var oldLine = line;
            if ($(this).is('.up'))
                line = line - scrollNumber;
            else
                line = line + scrollNumber;
            if (line < 0) {
                line = 0;
                return;
            }
            if (line > numberOfLines - visibleLines + 1) {
                line = oldLine;
                return;
            }
            console.log(line, numberOfLines - visibleLines + 1);
            $( 'html, body' ).animate({
                scrollTop: (parseInt($('img:nth-of-type(1)').css('height')) * line)
            }, 800);
            makeImageTales();
        }
    }
    //events functions
    $(window).resize(function () {
        slideTop();
        wideMonitors();
    });
    $('img:not(img[src="empty.gif"])').on('click', function () {
        if (!isDim()) {
            $('.inside').css('z-index', '1');
            var imageName = $(this).attr('src');
            $('img').each(function (item, value) {
                var rand = random(0, 500);
                $(value).css('transition-delay', (rand * 2) + 'ms').prev().css('transition-delay', rand + 'ms');
            });
            $('img').addClass('dim');
            $('.relative div').addClass('transition').css('background-image', 'url(' + imageName + ')');
            $active = $(this);
            $('div.full').removeClass('hide');
            $('aside').addClass('hide');
        }
    });
    $('div.full').on('click', hide);
    $(document).on('keydown', function (e) {
        e.preventDefault();
        if (e.keyCode == 39 && !isLast($(this))) {
            //next
            $('.relative div').removeClass('transition');
            $('img').removeClass('dim');
            if ($active.parent().is('.relative'))    //gdy w div 
                $active = $active.parent();
            if ($active.next().is('img'))            //gdy sąsiad obrazem
                var imageName = $active.next().attr('src');
            else                                    //gdy sąsiad div
                var imageName = $active.next().children('img').attr('src');
            setTimeout(function () {
                $('.relative div').css('background-image', 'url(' + imageName + ')');
                $('.relative div').addClass('transition');
                $('img').addClass('dim');
            }, 800);
            $active = $active.next('img, div');
        }
        if (e.keyCode == 37 && $active.prev().length) {
            //prev
            $('.relative div').removeClass('transition');
            $('img').removeClass('dim');
            if ($active.parent().is('.relative')) 
                $active = $active.parent();
            if ($active.prev().is('img'))
                var imageName = $active.prev().attr('src');
            else
                var imageName = $active.prev().children('img').attr('src');
            setTimeout(function () {
                $('.relative div').css('background-image', 'url(' + imageName + ')');
                $('.relative div').addClass('transition');
                $('img').addClass('dim');
            }, 800);
            $active = $active.prev('img, div');
        }
    });
    $('aside').on('mouseenter', function(event) {
        //set buttons positions shifts
        var offset;
        if (event.clientY - 60 < 0)
            offset = 10;
        else if (event.clientY > $(window).height() - 60)
            offset = $(window).height() - 94;
        else 
            offset = event.clientY - 40;
        $(this).children('button.up').css('top', offset - 20);
        $(this).children('button.down').css('top', offset + 60);
    });
    $('aside button').on('mouseenter', slide);
    $('aside button').on('click', slide);
    $(document).on('keydown', function ( e ) {
        e.preventDefault();
        if (e.keyCode == 38)
            $('aside .up').trigger('mouseenter');
        else if (e.keyCode == 40)
            $('aside .down').trigger('mouseenter');
    });
    $(window).one('mousewheel DOMMouseScroll', scroll);
});