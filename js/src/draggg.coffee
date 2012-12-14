###*
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
 ###

"use strict";

methods =

  init: (options) ->
    $(this).each ->
      $self = $(@)
      data  = $self.data 'draggg'

      settings =
        animating: false
        dragging: false
        idx: 0
        slides: $self.children()
        width: $self.width()
        touch_origin_x: 0
        touch_origin_y: 0
        x_prediction_threshold: 5
        y_prediction_threshold: 20
        translate_x_origin: 0
        translate_x_curr: 0
        x_threshold: 100
        animate_x: 0
        animate_interpolation: 0.5
        before: ->
        after: ->
        new_idx: (idx) ->

      $.extend(settings, options) if options

      return false if settings.slides.length <= 1

      window.draggg_touchable = (typeof window.ontouchend != "undefined") or (typeof window.onmsgesturechange != "undefined")

      settings.animation_timer = setInterval ->
        methods.animate_x.call $self
      , 20

      settings.ltie9 = $("html").hasClass "lt-ie9"

      $self.data 'draggg', settings

      methods.position_slides.call($self)

      if draggg_touchable
        $self.bind "touchstart.draggg", (e) ->
          methods.touch_began.call $self, e
      else
        $self.bind "mousedown.draggg", (e) ->
          methods.touch_began.call $self, e

      $(window).resize ->
        methods.reset_widths.call $self

  destroy: ->
    $self = $(@)
    data  = $self.data 'draggg'
    return false unless data
    $self.unbind "touchstart.draggg"
    $self.unbind "mousedown.draggg"
    $self.unbind "mousemove.draggg"
    $self.unbind "touchmove.draggg"
    $self.unbind "touchend.draggg"
    $self.unbind "mouseout.draggg"
    $self.unbind "mouseup.draggg"
    clearInterval data.animation_timer
    $self.data 'draggg', null

  reset_widths: ->
    $self = $(@)
    data  = $self.data 'draggg'
    return false unless data
    data.animating        = false
    data.width            = $self.width()
    data.translate_x_curr = -data.idx*data.width
    methods.set_x_translation.call $self, data.translate_x_curr

  position_slides: ->
    $self = $(@)
    data  = $self.data 'draggg'
    return false unless data
    $(data.slides).each (i, e) ->
      $(e).css
        left: "#{100 * i}%"
        display: "block"

  touch_began: (e) ->
    $self = $(@)
    data  = $self.data 'draggg'
    return false unless data

    if e.originalEvent.touches
      if e.originalEvent.touches.length > 1
        methods.stop_dragging_x.call $self
        return
      else
        touch   = e.originalEvent.touches[0]
        clientX = touch.pageX
        clientY = touch.pageY
    else
      clientX = e.clientX
      clientY = e.clientY

    data.touch_origin_x     = clientX
    data.touch_origin_y     = clientY
    data.translate_x_origin = data.translate_x_curr

    if draggg_touchable
      $self.bind "touchmove.draggg", (e) ->
        methods.touch_moved.call $self, e

      $self.bind "touchend.draggg", (e) ->
        methods.touch_ended.call $self, e

    else
      $self.bind "mousemove.draggg", (e) ->
        methods.touch_moved.call $self, e

      $self.bind "mouseout.draggg", (e) ->
        methods.touch_ended.call $self, e

      $self.bind "mouseup.draggg", (e) ->
        methods.touch_ended.call $self, e

  touch_ended: (e) ->
    $self = $(@)
    data  = $self.data 'draggg'
    return false unless data
    methods.stop_dragging_x.call $self if data.dragging

  touch_moved: (e) ->
    $self = $(@)
    data  = $self.data 'draggg'
    if data
      if e.originalEvent.touches
        if e.originalEvent.touches.length > 1
          methods.stop_dragging_x.call $self
          return true
        else
          touch   = e.originalEvent.touches[0]
          clientX = touch.pageX
          clientY = touch.pageY
      else
        clientX = e.clientX
        clientY = e.clientY

      if !data.dragging
        distX = Math.abs data.touch_origin_x-clientX
        distY = Math.abs data.touch_origin_y-clientY
        if distY > data.y_prediction_threshold
          methods.stop_dragging_x.call $self
        if distX > data.x_prediction_threshold
          methods.start_dragging_x.call $self
        return true

      data.animating        = false
      x_diff                = (data.touch_origin_x - clientX)
      data.translate_x_curr = data.translate_x_origin - x_diff
      methods.set_x_translation.call($self, data.translate_x_curr)
      e.preventDefault()

  start_dragging_x: (e) ->
    $self = $(@)
    data  = $self.data 'draggg'
    return false unless data
    data.before.call $self
    data.dragging  = true
    data.animating = false
    return

  stop_dragging_x: (e) ->
    $self = $(@)
    data  = $self.data 'draggg'
    return false unless data
    $self.unbind "mousemove.draggg"
    $self.unbind "touchmove.draggg"
    $self.unbind "touchend.draggg"
    $self.unbind "mouseout.draggg"
    $self.unbind "mouseup.draggg"
    data.dragging = false

    data.after.call $self

    last_slide_idx = data.slides.length-1
    if data.translate_x_curr < (data.translate_x_origin - data.x_threshold)
      unless data.idx == last_slide_idx
        methods.step_x_to.call $self, data.idx+1
        return
    else if data.translate_x_curr > (data.translate_x_origin + data.x_threshold)
      unless data.idx == 0
        methods.step_x_to.call $self, data.idx-1
        return
    methods.step_x_to.call $self, data.idx
    return

  set_x_translation: (x) ->
    $self = $(@)
    data  = $self.data 'draggg'
    return false unless data
    if data.ltie9
      $self[0].style.left = "#{x}px"
    else
      $self[0].style.msTransform     = "translate(#{x}px)"
      $self[0].style.webkitTransform = "translate3d(#{x}px,0,0)"
      $self[0].style.MozTransform    = "translate3d(#{x}px,0,0)"
      $self[0].style.webkitTransform = "translate3d(#{x}px,0,0)"
    return

  next: ->
    $self = $(@)
    data  = $self.data 'draggg'
    return false unless data
    last_slide_idx = data.slides.length-1
    if data.idx == last_slide_idx
      methods.step_x_to.call $self, 0
    else
      methods.step_x_to.call $self, data.idx+1
    return

  prev: ->
    $self = $(@)
    data  = $self.data 'draggg'
    return false unless data
    last_slide_idx = data.slides.length-1
    if data.idx == 0
      methods.step_x_to.call $self, last_slide_idx
    else
      methods.step_x_to.call $self, data.idx-1
    return

  step_x_to: (idx) ->
    $self = $(@)
    data  = $self.data 'draggg'
    return false unless data
    unless data.animating
      data.animate_x = -idx*data.width
      data.animating = true
      data.idx = idx
      data.new_idx.call $self, data.idx

  animate_x: ->
    $self = $(@)
    data  = $self.data 'draggg'
    return false unless data

    if data.animating
      k = data.animate_interpolation
      x = data.animate_x - data.translate_x_curr;
      f = k * x;

      if Math.abs(f) < .01
        data.translate_x_curr = data.animate_x;
        data.animating = false
        methods.set_x_translation.call $self, data.animate_x
        return

      data.translate_x_curr += f;
      methods.set_x_translation.call $self, data.translate_x_curr


###########################

$ = jQuery
$.fn.draggg = (method) ->

  if methods[method]
    return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
  else if (typeof method == 'object' || !method)
    return methods.init.apply(this, arguments);
  else
    $.error('Method ' +  method + ' does not exist on jQuery.draggg!')

