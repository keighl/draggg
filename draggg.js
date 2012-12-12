
/**
*
* Draggg - A touchable carousel
*
* Copyright (c) 2012 Kyle Truscott
*
* http://keighl.github.com/draggg
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*/


(function() {
  "use strict";

  var $, methods;

  methods = {
    init: function(options) {
      return $(this).each(function() {
        var $self, data, settings;
        $self = $(this);
        data = $self.data('draggg');
        settings = {
          animating: false,
          dragging: false,
          idx: 0,
          slides: $self.children(),
          width: $self.width(),
          touch_origin_x: 0,
          touch_origin_y: 0,
          x_prediction_threshold: 5,
          y_prediction_threshold: 20,
          translate_x_origin: 0,
          translate_x_curr: 0,
          x_threshold: 100,
          animate_x: 0
        };
        if (options) {
          $.extend(settings, options);
        }
        if (settings.slides.length <= 1) {
          return false;
        }
        window.draggg_touchable = (typeof window.ontouchend !== "undefined") || (typeof window.onmsgesturechange !== "undefined");
        settings.animation_timer = setInterval(function() {
          return methods.animate_x.call($self);
        }, 20);
        settings.ltie9 = $("html").hasClass("lt-ie9");
        $self.data('draggg', settings);
        methods.position_slides.call($self);
        if (draggg_touchable) {
          $self.bind("touchstart.draggg", function(e) {
            return methods.touch_began.call($self, e);
          });
        } else {
          $self.bind("mousedown.draggg", function(e) {
            return methods.touch_began.call($self, e);
          });
        }
        return $(window).resize(function() {
          return methods.reset_widths.call($self);
        });
      });
    },
    destroy: function() {
      var $self, data;
      $self = $(this);
      data = $self.data('draggg');
      if (!data) {
        return false;
      }
      $self.unbind("touchstart.draggg");
      $self.unbind("mousedown.draggg");
      $self.unbind("mousemove.draggg");
      $self.unbind("touchmove.draggg");
      $self.unbind("touchend.draggg");
      $self.unbind("mouseout.draggg");
      $self.unbind("mouseup.draggg");
      clearInterval(data.animation_timer);
      return $self.data('draggg', null);
    },
    reset_widths: function() {
      var $self, data;
      $self = $(this);
      data = $self.data('draggg');
      if (!data) {
        return false;
      }
      data.animating = false;
      data.width = $self.width();
      data.translate_x_curr = -data.idx * data.width;
      return methods.set_x_translation.call($self, data.translate_x_curr);
    },
    position_slides: function() {
      var $self, data;
      $self = $(this);
      data = $self.data('draggg');
      if (!data) {
        return false;
      }
      return $(data.slides).each(function(i, e) {
        return $(e).css({
          left: "" + (100 * i) + "%",
          display: "block"
        });
      });
    },
    touch_began: function(e) {
      var $self, clientX, clientY, data, touch;
      $self = $(this);
      data = $self.data('draggg');
      if (!data) {
        return false;
      }
      if (e.originalEvent.touches) {
        if (e.originalEvent.touches.length > 1) {
          methods.stop_dragging_x.call($self);
          return;
        } else {
          touch = e.originalEvent.touches[0];
          clientX = touch.pageX;
          clientY = touch.pageY;
        }
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      data.touch_origin_x = clientX;
      data.touch_origin_y = clientY;
      data.translate_x_origin = data.translate_x_curr;
      if (draggg_touchable) {
        $self.bind("touchmove.draggg", function(e) {
          return methods.touch_moved.call($self, e);
        });
        return $self.bind("touchend.draggg", function(e) {
          return methods.touch_ended.call($self, e);
        });
      } else {
        $self.bind("mousemove.draggg", function(e) {
          return methods.touch_moved.call($self, e);
        });
        $self.bind("mouseout.draggg", function(e) {
          return methods.touch_ended.call($self, e);
        });
        return $self.bind("mouseup.draggg", function(e) {
          return methods.touch_ended.call($self, e);
        });
      }
    },
    touch_ended: function(e) {
      var $self, data;
      $self = $(this);
      data = $self.data('draggg');
      if (!data) {
        return false;
      }
      if (data.dragging) {
        return methods.stop_dragging_x.call($self);
      }
    },
    touch_moved: function(e) {
      var $self, clientX, clientY, data, distX, distY, touch, x_diff;
      $self = $(this);
      data = $self.data('draggg');
      if (data) {
        if (e.originalEvent.touches) {
          if (e.originalEvent.touches.length > 1) {
            methods.stop_dragging_x.call($self);
            return true;
          } else {
            touch = e.originalEvent.touches[0];
            clientX = touch.pageX;
            clientY = touch.pageY;
          }
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        if (!data.dragging) {
          distX = Math.abs(data.touch_origin_x - clientX);
          distY = Math.abs(data.touch_origin_y - clientY);
          if (distY > data.y_prediction_threshold) {
            methods.stop_dragging_x.call($self);
          }
          if (distX > data.x_prediction_threshold) {
            methods.start_dragging_x.call($self);
          }
          return true;
        }
        data.animating = false;
        x_diff = data.touch_origin_x - clientX;
        data.translate_x_curr = data.translate_x_origin - x_diff;
        methods.set_x_translation.call($self, data.translate_x_curr);
        return e.preventDefault();
      }
    },
    start_dragging_x: function(e) {
      var $self, data;
      $self = $(this);
      data = $self.data('draggg');
      if (!data) {
        return false;
      }
      data.dragging = true;
      data.animating = false;
    },
    stop_dragging_x: function(e) {
      var $self, data, last_slide_idx;
      $self = $(this);
      data = $self.data('draggg');
      if (!data) {
        return false;
      }
      $self.unbind("mousemove.draggg");
      $self.unbind("touchmove.draggg");
      $self.unbind("touchend.draggg");
      $self.unbind("mouseout.draggg");
      $self.unbind("mouseup.draggg");
      data.dragging = false;
      last_slide_idx = data.slides.length - 1;
      if (data.translate_x_curr < (data.translate_x_origin - data.x_threshold)) {
        if (data.idx !== last_slide_idx) {
          methods.step_x_to.call($self, data.idx + 1);
          return;
        }
      } else if (data.translate_x_curr > (data.translate_x_origin + data.x_threshold)) {
        if (data.idx !== 0) {
          methods.step_x_to.call($self, data.idx - 1);
          return;
        }
      }
      methods.step_x_to.call($self, data.idx);
    },
    set_x_translation: function(x) {
      var $self, data;
      $self = $(this);
      data = $self.data('draggg');
      if (!data) {
        return false;
      }
      if (data.ltie9) {
        $self[0].style.left = "" + x + "px";
      } else {
        $self[0].style.msTransform = "translate(" + x + "px)";
        $self[0].style.webkitTransform = "translate3d(" + x + "px,0,0)";
        $self[0].style.MozTransform = "translate3d(" + x + "px,0,0)";
        $self[0].style.webkitTransform = "translate3d(" + x + "px,0,0)";
      }
    },
    next: function() {
      var $self, data, last_slide_idx;
      $self = $(this);
      data = $self.data('draggg');
      if (!data) {
        return false;
      }
      last_slide_idx = data.slides.length - 1;
      if (data.idx === last_slide_idx) {
        methods.step_x_to.call($self, 0);
      } else {
        methods.step_x_to.call($self, data.idx + 1);
      }
    },
    prev: function() {
      var $self, data, last_slide_idx;
      $self = $(this);
      data = $self.data('draggg');
      if (!data) {
        return false;
      }
      last_slide_idx = data.slides.length - 1;
      if (data.idx === 0) {
        methods.step_x_to.call($self, last_slide_idx);
      } else {
        methods.step_x_to.call($self, data.idx - 1);
      }
    },
    step_x_to: function(idx) {
      var $self, data;
      console.log(idx);
      $self = $(this);
      data = $self.data('draggg');
      if (!data) {
        return false;
      }
      data.animate_x = -idx * data.width;
      data.animating = true;
      return data.idx = idx;
    },
    animate_x: function() {
      var $self, data, f, k, x;
      $self = $(this);
      data = $self.data('draggg');
      if (!data) {
        return false;
      }
      if (data.animating) {
        k = 0.26;
        x = data.animate_x - data.translate_x_curr;
        f = k * x;
        if (Math.abs(f) < .01) {
          data.translate_x_curr = data.animate_x;
          data.animating = false;
          methods.set_x_translation.call($self, data.animate_x);
          return;
        }
        data.translate_x_curr += f;
        return methods.set_x_translation.call($self, data.translate_x_curr);
      }
    }
  };

  $ = jQuery;

  $.fn.draggg = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      return $.error('Method ' + method + ' does not exist on jQuery.draggg!');
    }
  };

}).call(this);
