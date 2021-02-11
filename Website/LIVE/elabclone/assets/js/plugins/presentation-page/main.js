/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2016, Codrops
 * http://www.codrops.com
 */
;
(function(window) {

  'use strict';

  // from: http://stackoverflow.com/a/21913575
  function getComputedTranslateY(obj) {
    if (!window.getComputedStyle) return;
    var style = getComputedStyle(obj),
      transform = style.transform || style.webkitTransform || style.mozTransform;
    var mat = transform.match(/^matrix3d\((.+)\)$/);
    if (mat) return parseFloat(mat[1].split(', ')[13]);
    mat = transform.match(/^matrix\((.+)\)$/);
    return mat ? parseFloat(mat[1].split(', ')[5]) : 0;
  }

  /**********************************************/
  /** https://gist.github.com/desandro/1866474 **/
  /**********************************************/
  var lastTime = 0;
  var prefixes = 'webkit moz ms o'.split(' ');
  // get unprefixed rAF and cAF, if present
  var requestAnimationFrame = window.requestAnimationFrame;
  var cancelAnimationFrame = window.cancelAnimationFrame;
  // loop through vendor prefixes and get prefixed rAF and cAF
  var prefix;
  for (var i = 0; i < prefixes.length; i++) {
    if (requestAnimationFrame && cancelAnimationFrame) {
      break;
    }
    prefix = prefixes[i];
    requestAnimationFrame = requestAnimationFrame || window[prefix + 'RequestAnimationFrame'];
    cancelAnimationFrame = cancelAnimationFrame || window[prefix + 'CancelAnimationFrame'] ||
      window[prefix + 'CancelRequestAnimationFrame'];
  }

  // fallback to setTimeout and clearTimeout if either request/cancel is not supported
  if (!requestAnimationFrame || !cancelAnimationFrame) {
    requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

    cancelAnimationFrame = function(id) {
      window.clearTimeout(id);
    };
  }
  /**********************************************/
  /** https://gist.github.com/desandro/1866474 **/
  /**********************************************/

  var docElem = window.document.documentElement;

  // some helper functions
  function scrollY() {
    return window.pageYOffset || docElem.scrollTop;
  }

  function extend(a, b) {
    for (var key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
    return a;
  }

  /**
   * Isometric grid obj
   */
  function IsoGrid(el, options) {
    this.isolayerEl = el;

    this.options = extend({}, this.options);
    extend(this.options, options);

    this.gridEl = this.isolayerEl.querySelector('.grid');

    // grid items
    this.gridItems = [].slice.call(this.gridEl.querySelectorAll('.grid__item'));
    this.gridItemsTotal = this.gridItems.length;

    this.didscroll = false;

    this._init();
  }

  IsoGrid.prototype.options = {
    // static or scrollable
    type: 'static',
    // grid perspective value
    perspective: 0,
    // grid transform
    transform: '',
    // each grid item animation (for the subitems)
    stackItemsAnimation: {
      // this follows the dynamics.js (https://github.com/michaelvillar/dynamics.js) animate fn syntax
      // properties (pos is the current subitem position)
      properties: function(pos) {
        return {
          translateZ: (pos + 1) * 50
        };
      },
      // animation options (pos is the current subitem position); itemstotal is the total number of subitems
      options: function(pos, itemstotal) {
        return {
          type: dynamics.bezier,
          duration: 500,
          points: [{
            "x": 0,
            "y": 0,
            "cp": [{
              "x": 0.2,
              "y": 1
            }]
          }, {
            "x": 1,
            "y": 1,
            "cp": [{
              "x": 0.3,
              "y": 1
            }]
          }]
        };
      }
    },
    // callback for loaded grid
    onGridLoaded: function() {
      return false;
    }
  };

  IsoGrid.prototype._init = function() {
    var self = this;

    imagesLoaded(this.gridEl, function() {
      // initialize masonry
      self.msnry = new Masonry(self.gridEl, {
        itemSelector: '.grid__item',
        isFitWidth: true
      });

      // the isolayer div element will be positioned fixed and will have a transformation based on the values defined in the HTML (data-attrs for the isolayer div element)
      if (self.options.type === 'scrollable') {
        self.isolayerEl.style.position = 'fixed';
      }

      self.isolayerEl.style.WebkitTransformStyle = self.isolayerEl.style.transformStyle = 'preserve-3d';

      var transformValue = self.options.perspective != 0 ? 'perspective(' + self.options.perspective + 'px) ' + self.options.transform : self.options.transform;
      self.isolayerEl.style.WebkitTransform = self.isolayerEl.style.transform = transformValue;

      // create the div element that will force the height for scrolling
      if (self.options.type === 'scrollable') {
        self._createPseudoScroller();
      }

      // init/bind events
      self._initEvents();

      // effects for loading grid elements:
      if (self.options.type === 'scrollable') {
        new AnimOnScroll(self.gridEl, {
          minDuration: 1,
          maxDuration: 1.2,
          viewportFactor: 0
        });
      }

      // grid is "loaded" (all images are loaded)
      self.options.onGridLoaded();
      classie.add(self.gridEl, 'grid--loaded');
    });
  };


  /**
   * Initialize/Bind events fn.
   */
  IsoGrid.prototype._initEvents = function() {
    var self = this;

    var scrollHandler = function() {
        requestAnimationFrame(function() {
          if (!self.didscroll) {
            self.didscroll = true;
            self._scrollPage();
          }
        });
      },
      mouseenterHandler = function(ev) {
        self._expandSubItems(ev.target);
      },
      mouseleaveHandler = function(ev) {
        self._collapseSubItems(ev.target);
      };

    if (this.options.type === 'scrollable') {
      // update the transform (ty) on scroll
      window.addEventListener('scroll', scrollHandler, false);
      // on resize (layoutComplete for the masonry instance) recalculate height
      this.msnry.on('layoutComplete', function(laidOutItems) {
        // reset the height of the pseudoScroller (grid´s height + additional space between the top of the rotated isolayerEl and the page)
        self.pseudoScrollerEl.style.height = self.gridEl.offsetHeight + self.isolayerEl.offsetTop * Math.sqrt(2) + 'px';
        self._scrollPage();
      });
    }

    this.gridItems.forEach(function(item) {
      item.addEventListener('mouseenter', mouseenterHandler);
      item.addEventListener('mouseleave', mouseleaveHandler);
    });
  };

  IsoGrid.prototype._expandSubItems = function(item) {
    var self = this,
      itemLink = item.querySelector('a'),
      subItems = [].slice.call(itemLink.querySelectorAll('.layer')),
      subItemsTotal = subItems.length;

    itemLink.style.zIndex = item.style.zIndex = this.gridItemsTotal;

    subItems.forEach(function(subitem, pos) {
      dynamics.stop(subitem);
      dynamics.animate(subitem, self.options.stackItemsAnimation.properties(pos), self.options.stackItemsAnimation.options(pos, subItemsTotal));
    });
  };

  IsoGrid.prototype._collapseSubItems = function(item) {
    var itemLink = item.querySelector('a');
    [].slice.call(itemLink.querySelectorAll('.layer')).forEach(function(subitem, pos) {
      dynamics.stop(subitem);
      dynamics.animate(subitem, {
        translateZ: 0 // enough to reset any transform value previously set
      }, {
        duration: 100,
        complete: function() {
          itemLink.style.zIndex = item.style.zIndex = 1;
        }
      })
    });
  };

  IsoGrid.prototype._scrollPage = function() {
    this.gridEl.style.WebkitTransform = this.gridEl.style.transform = 'translate3d(0,-' + scrollY() + 'px,0)';
    this.didscroll = false;
  };

  window.IsoGrid = IsoGrid;

})(window);

// classie

/*!
 * classie v1.0.1
 * class helper functions
 * from bonzo https://github.com/ded/bonzo
 * MIT license
 *
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, module: false */

(function(window) {

  'use strict';

  // class helper functions from bonzo https://github.com/ded/bonzo

  function classReg(className) {
    return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
  }

  // classList support for class management
  // altho to be fair, the api sucks because it won't accept multiple classes at once
  var hasClass, addClass, removeClass;

  if ('classList' in document.documentElement) {
    hasClass = function(elem, c) {
      return elem.classList.contains(c);
    };
    addClass = function(elem, c) {
      elem.classList.add(c);
    };
    removeClass = function(elem, c) {
      elem.classList.remove(c);
    };
  } else {
    hasClass = function(elem, c) {
      return classReg(c).test(elem.className);
    };
    addClass = function(elem, c) {
      if (!hasClass(elem, c)) {
        elem.className = elem.className + ' ' + c;
      }
    };
    removeClass = function(elem, c) {
      elem.className = elem.className.replace(classReg(c), ' ');
    };
  }

  function toggleClass(elem, c) {
    var fn = hasClass(elem, c) ? removeClass : addClass;
    fn(elem, c);
  }

  var classie = {
    // full names
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    // short names
    has: hasClass,
    add: addClass,
    remove: removeClass,
    toggle: toggleClass
  };

  // transport
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(classie);
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = classie;
  } else {
    // browser global
    window.classie = classie;
  }

})(window);


//	dynamics.min

(function() {
  var t, e, n, r, o, i, s, a, u, l, f, h, p, c, m, d, g, y, v, b, w, x, M, S, k, T, C, H, R, q, I, X, Y, A, j, z, F, G, O, V, Z, E, L, D, P, W, N, U, $, B, K, J, Q, _, te, ee, ne, re, oe = function(t, e) {
    return function() {
      return t.apply(e, arguments)
    }
  };
  I = function() {
    return "visible" === document.visibilityState || null != H.tests
  }, z = function() {
    var t;
    return t = [], "undefined" != typeof document && null !== document && document.addEventListener("visibilitychange", function() {
        var e, n, r, o;
        for (o = [], n = 0, r = t.length; r > n; n++) e = t[n], o.push(e(I()));
        return o
      }),
      function(e) {
        return t.push(e)
      }
  }(), S = function(t) {
    var e, n, r;
    n = {};
    for (e in t) r = t[e], n[e] = r;
    return n
  }, x = function(t) {
    var e;
    return e = {},
      function() {
        var n, r, o, i, s;
        for (r = "", i = 0, s = arguments.length; s > i; i++) n = arguments[i], r += n.toString() + ",";
        return o = e[r], o || (e[r] = o = t.apply(this, arguments)), o
      }
  }, j = function(t) {
    return function(e) {
      var n, r, o;
      return e instanceof Array || e instanceof NodeList || e instanceof HTMLCollection ? o = function() {
        var o, i, s;
        for (s = [], r = o = 0, i = e.length; i >= 0 ? i > o : o > i; r = i >= 0 ? ++o : --o) n = Array.prototype.slice.call(arguments, 1), n.splice(0, 0, e[r]), s.push(t.apply(this, n));
        return s
      }.apply(this, arguments) : t.apply(this, arguments)
    }
  }, y = function(t, e) {
    var n, r, o;
    o = [];
    for (n in e) r = e[n], o.push(null != t[n] ? t[n] : t[n] = r);
    return o
  }, v = function(t, e) {
    var n, r, o;
    if (null != t.style) return b(t, e);
    o = [];
    for (n in e) r = e[n], o.push(t[n] = r.format());
    return o
  }, b = function(t, e) {
    var n, r, o, i, s;
    e = F(e), i = [], n = X(t);
    for (r in e) s = e[r], ee.contains(r) ? i.push([r, s]) : (null != s.format && (s = s.format()), "number" == typeof s && (s = "" + s + re(r, s)), null != t.hasAttribute && t.hasAttribute(r) ? t.setAttribute(r, s) : null != t.style && (t.style[O(r)] = s), r in t && (t[r] = s));
    return i.length > 0 ? n ? (o = new l, o.applyProperties(i), t.setAttribute("transform", o.decompose().format())) : (s = i.map(function(t) {
      return ne(t[0], t[1])
    }).join(" "), t.style[O("transform")] = s) : void 0
  }, X = function(t) {
    var e, n;
    return "undefined" != typeof SVGElement && null !== SVGElement && "undefined" != typeof SVGSVGElement && null !== SVGSVGElement ? t instanceof SVGElement && !(t instanceof SVGSVGElement) : null != (e = null != (n = H.tests) && "function" == typeof n.isSVG ? n.isSVG(t) : void 0) ? e : !1
  }, E = function(t, e) {
    var n;
    return n = Math.pow(10, e), Math.round(t * n) / n
  }, f = function() {
    function t(t) {
      var e, n, r;
      for (this.obj = {}, n = 0, r = t.length; r > n; n++) e = t[n], this.obj[e] = 1
    }
    return t.prototype.contains = function(t) {
      return 1 === this.obj[t]
    }, t
  }(), te = function(t) {
    return t.replace(/([A-Z])/g, function(t) {
      return "-" + t.toLowerCase()
    })
  }, V = new f("marginTop,marginLeft,marginBottom,marginRight,paddingTop,paddingLeft,paddingBottom,paddingRight,top,left,bottom,right,translateX,translateY,translateZ,perspectiveX,perspectiveY,perspectiveZ,width,height,maxWidth,maxHeight,minWidth,minHeight,borderRadius".split(",")), C = new f("rotate,rotateX,rotateY,rotateZ,skew,skewX,skewY,skewZ".split(",")), ee = new f("translate,translateX,translateY,translateZ,scale,scaleX,scaleY,scaleZ,rotate,rotateX,rotateY,rotateZ,rotateC,rotateCX,rotateCY,skew,skewX,skewY,skewZ,perspective".split(",")), K = new f("accent-height,ascent,azimuth,baseFrequency,baseline-shift,bias,cx,cy,d,diffuseConstant,divisor,dx,dy,elevation,filterRes,fx,fy,gradientTransform,height,k1,k2,k3,k4,kernelMatrix,kernelUnitLength,letter-spacing,limitingConeAngle,markerHeight,markerWidth,numOctaves,order,overline-position,overline-thickness,pathLength,points,pointsAtX,pointsAtY,pointsAtZ,r,radius,rx,ry,seed,specularConstant,specularExponent,stdDeviation,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,surfaceScale,target,targetX,targetY,transform,underline-position,underline-thickness,viewBox,width,x,x1,x2,y,y1,y2,z".split(",")), re = function(t, e) {
    return "number" != typeof e ? "" : V.contains(t) ? "px" : C.contains(t) ? "deg" : ""
  }, ne = function(t, e) {
    var n, r;
    return n = ("" + e).match(/^([0-9.-]*)([^0-9]*)$/), null != n ? (e = n[1], r = n[2]) : e = parseFloat(e), e = E(parseFloat(e), 10), (null == r || "" === r) && (r = re(t, e)), "" + t + "(" + e + r + ")"
  }, F = function(t) {
    var e, n, r, o, i, s, a, u;
    r = {};
    for (o in t)
      if (i = t[o], ee.contains(o))
        if (n = o.match(/(translate|rotateC|rotate|skew|scale|perspective)(X|Y|Z|)/), n && n[2].length > 0) r[o] = i;
        else
          for (u = ["X", "Y", "Z"], s = 0, a = u.length; a > s; s++) e = u[s], r[n[1] + e] = i;
    else r[o] = i;
    return r
  }, T = function(t) {
    var e;
    return e = "opacity" === t ? 1 : 0, "" + e + re(t, e)
  }, R = function(t, e) {
    var n, r, o, i, s, a, f, h, p, m, d;
    if (i = {}, n = X(t), null != t.style)
      for (s = window.getComputedStyle(t, null), f = 0, p = e.length; p > f; f++) r = e[f], ee.contains(r) ? null == i.transform && (o = n ? new l(null != (d = t.transform.baseVal.consolidate()) ? d.matrix : void 0) : u.fromTransform(s[O("transform")]), i.transform = o.decompose()) : (a = null != t.hasAttribute && t.hasAttribute(r) ? t.getAttribute(r) : r in t ? t[r] : s[r], null != a && "d" !== r || !K.contains(r) || (a = t.getAttribute(r)), ("" === a || null == a) && (a = T(r)), i[r] = k(a));
    else
      for (h = 0, m = e.length; m > h; h++) r = e[h], i[r] = k(t[r]);
    return c(t, i), i
  }, c = function(t, e) {
    var n, r;
    for (r in e) n = e[r], n instanceof i && null != t.style && r in t.style && (n = new a([n, re(r, 0)])), e[r] = n;
    return e
  }, k = function(t) {
    var e, n, o, u, l;
    for (o = [r, s, i, a], u = 0, l = o.length; l > u; u++)
      if (n = o[u], e = n.create(t), null != e) return e;
    return null
  }, a = function() {
    function t(t) {
      this.parts = t, this.format = oe(this.format, this), this.interpolate = oe(this.interpolate, this)
    }
    return t.prototype.interpolate = function(e, n) {
      var r, o, i, s, a, u;
      for (s = this.parts, r = e.parts, i = [], o = a = 0, u = Math.min(s.length, r.length); u >= 0 ? u > a : a > u; o = u >= 0 ? ++a : --a) i.push(null != s[o].interpolate ? s[o].interpolate(r[o], n) : s[o]);
      return new t(i)
    }, t.prototype.format = function() {
      var t;
      return t = this.parts.map(function(t) {
        return null != t.format ? t.format() : t
      }), t.join("")
    }, t.create = function(e) {
      var n, r, s, a, u, l, f, h, p, c, m;
      for (e = "" + e, s = [], f = [{
          re: /(#[a-f\d]{3,6})/gi,
          klass: o,
          parse: function(t) {
            return t
          }
        }, {
          re: /(rgba?\([0-9.]*, ?[0-9.]*, ?[0-9.]*(?:, ?[0-9.]*)?\))/gi,
          klass: o,
          parse: function(t) {
            return t
          }
        }, {
          re: /([-+]?[\d.]+)/gi,
          klass: i,
          parse: parseFloat
        }], h = 0, c = f.length; c > h; h++)
        for (l = f[h], u = l.re; r = u.exec(e);) s.push({
          index: r.index,
          length: r[1].length,
          interpolable: l.klass.create(l.parse(r[1]))
        });
      for (s = s.sort(function(t, e) {
          return t.index > e.index ? 1 : -1
        }), a = [], n = 0, p = 0, m = s.length; m > p; p++) r = s[p], r.index < n || (r.index > n && a.push(e.substring(n, r.index)), a.push(r.interpolable), n = r.index + r.length);
      return n < e.length && a.push(e.substring(n)), new t(a)
    }, t
  }(), s = function() {
    function t(t) {
      this.format = oe(this.format, this), this.interpolate = oe(this.interpolate, this), this.obj = t
    }
    return t.prototype.interpolate = function(e, n) {
      var r, o, i, s, a;
      s = this.obj, r = e.obj, i = {};
      for (o in s) a = s[o], i[o] = null != a.interpolate ? a.interpolate(r[o], n) : a;
      return new t(i)
    }, t.prototype.format = function() {
      return this.obj
    }, t.create = function(e) {
      var n, r, o;
      if (e instanceof Object) {
        r = {};
        for (n in e) o = e[n], r[n] = k(o);
        return new t(r)
      }
      return null
    }, t
  }(), i = function() {
    function t(t) {
      this.format = oe(this.format, this), this.interpolate = oe(this.interpolate, this), this.value = parseFloat(t)
    }
    return t.prototype.interpolate = function(e, n) {
      var r, o;
      return o = this.value, r = e.value, new t((r - o) * n + o)
    }, t.prototype.format = function() {
      return E(this.value, 5)
    }, t.create = function(e) {
      return "number" == typeof e ? new t(e) : null
    }, t
  }(), r = function() {
    function t(t) {
      this.values = t, this.format = oe(this.format, this), this.interpolate = oe(this.interpolate, this)
    }
    return t.prototype.interpolate = function(e, n) {
      var r, o, i, s, a, u;
      for (s = this.values, r = e.values, i = [], o = a = 0, u = Math.min(s.length, r.length); u >= 0 ? u > a : a > u; o = u >= 0 ? ++a : --a) i.push(null != s[o].interpolate ? s[o].interpolate(r[o], n) : s[o]);
      return new t(i)
    }, t.prototype.format = function() {
      return this.values.map(function(t) {
        return null != t.format ? t.format() : t
      })
    }, t.createFromArray = function(e) {
      var n;
      return n = e.map(function(t) {
        return k(t) || t
      }), n = n.filter(function(t) {
        return null != t
      }), new t(n)
    }, t.create = function(e) {
      return e instanceof Array ? t.createFromArray(e) : null
    }, t
  }(), t = function() {
    function t(t, e) {
      this.rgb = null != t ? t : {}, this.format = e, this.toRgba = oe(this.toRgba, this), this.toRgb = oe(this.toRgb, this), this.toHex = oe(this.toHex, this)
    }
    return t.fromHex = function(e) {
      var n, r;
      return n = e.match(/^#([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i), null != n && (e = "#" + n[1] + n[1] + n[2] + n[2] + n[3] + n[3]), r = e.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i), null != r ? new t({
        r: parseInt(r[1], 16),
        g: parseInt(r[2], 16),
        b: parseInt(r[3], 16),
        a: 1
      }, "hex") : null
    }, t.fromRgb = function(e) {
      var n, r;
      return n = e.match(/^rgba?\(([0-9.]*), ?([0-9.]*), ?([0-9.]*)(?:, ?([0-9.]*))?\)$/), null != n ? new t({
        r: parseFloat(n[1]),
        g: parseFloat(n[2]),
        b: parseFloat(n[3]),
        a: parseFloat(null != (r = n[4]) ? r : 1)
      }, null != n[4] ? "rgba" : "rgb") : null
    }, t.componentToHex = function(t) {
      var e;
      return e = t.toString(16), 1 === e.length ? "0" + e : e
    }, t.prototype.toHex = function() {
      return "#" + t.componentToHex(this.rgb.r) + t.componentToHex(this.rgb.g) + t.componentToHex(this.rgb.b)
    }, t.prototype.toRgb = function() {
      return "rgb(" + this.rgb.r + ", " + this.rgb.g + ", " + this.rgb.b + ")"
    }, t.prototype.toRgba = function() {
      return "rgba(" + this.rgb.r + ", " + this.rgb.g + ", " + this.rgb.b + ", " + this.rgb.a + ")"
    }, t
  }(), o = function() {
    function e(t) {
      this.color = t, this.format = oe(this.format, this), this.interpolate = oe(this.interpolate, this)
    }
    return e.prototype.interpolate = function(n, r) {
      var o, i, s, a, u, l, f, h;
      for (a = this.color, o = n.color, s = {}, h = ["r", "g", "b"], l = 0, f = h.length; f > l; l++) i = h[l], u = Math.round((o.rgb[i] - a.rgb[i]) * r + a.rgb[i]), s[i] = Math.min(255, Math.max(0, u));
      return i = "a", u = E((o.rgb[i] - a.rgb[i]) * r + a.rgb[i], 5), s[i] = Math.min(1, Math.max(0, u)), new e(new t(s, o.format))
    }, e.prototype.format = function() {
      return "hex" === this.color.format ? this.color.toHex() : "rgb" === this.color.format ? this.color.toRgb() : "rgba" === this.color.format ? this.color.toRgba() : void 0
    }, e.create = function(n) {
      var r;
      if ("string" == typeof n) return r = t.fromHex(n) || t.fromRgb(n), null != r ? new e(r) : null
    }, e
  }(), n = function() {
    function t(t) {
      this.props = t, this.applyRotateCenter = oe(this.applyRotateCenter, this), this.format = oe(this.format, this), this.interpolate = oe(this.interpolate, this)
    }
    return t.prototype.interpolate = function(e, n) {
      var r, o, i, s, a, u, l, f, h, p, c, m;
      for (i = {}, p = ["translate", "scale", "rotate"], s = 0, f = p.length; f > s; s++)
        for (o = p[s], i[o] = [], r = a = 0, c = this.props[o].length; c >= 0 ? c > a : a > c; r = c >= 0 ? ++a : --a) i[o][r] = (e.props[o][r] - this.props[o][r]) * n + this.props[o][r];
      for (r = u = 1; 2 >= u; r = ++u) i.rotate[r] = e.props.rotate[r];
      for (m = ["skew"], l = 0, h = m.length; h > l; l++) o = m[l], i[o] = (e.props[o] - this.props[o]) * n + this.props[o];
      return new t(i)
    }, t.prototype.format = function() {
      return "translate(" + this.props.translate.join(",") + ") rotate(" + this.props.rotate.join(",") + ") skewX(" + this.props.skew + ") scale(" + this.props.scale.join(",") + ")"
    }, t.prototype.applyRotateCenter = function(t) {
      var e, n, r, o, i, s;
      for (n = w.createSVGMatrix(), n = n.translate(t[0], t[1]), n = n.rotate(this.props.rotate[0]), n = n.translate(-t[0], -t[1]), r = new l(n), o = r.decompose().props.translate, s = [], e = i = 0; 1 >= i; e = ++i) s.push(this.props.translate[e] -= o[e]);
      return s
    }, t
  }(), w = "undefined" != typeof document && null !== document ? document.createElementNS("http://www.w3.org/2000/svg", "svg") : void 0, l = function() {
    function t(t) {
      this.m = t, this.applyProperties = oe(this.applyProperties, this), this.decompose = oe(this.decompose, this), this.m || (this.m = w.createSVGMatrix())
    }
    return t.prototype.decompose = function() {
      var t, e, r, o, i;
      return o = new h([this.m.a, this.m.b]), i = new h([this.m.c, this.m.d]), t = o.length(), r = o.dot(i), o = o.normalize(), e = i.combine(o, 1, -r).length(), new n({
        translate: [this.m.e, this.m.f],
        rotate: [180 * Math.atan2(this.m.b, this.m.a) / Math.PI, this.rotateCX, this.rotateCY],
        scale: [t, e],
        skew: r / e * 180 / Math.PI
      })
    }, t.prototype.applyProperties = function(t) {
      var e, n, r, o, i, s, a, u;
      for (e = {}, i = 0, s = t.length; s > i; i++) r = t[i], e[r[0]] = r[1];
      for (n in e) o = e[n], "translateX" === n ? this.m = this.m.translate(o, 0) : "translateY" === n ? this.m = this.m.translate(0, o) : "scaleX" === n ? this.m = this.m.scaleNonUniform(o, 1) : "scaleY" === n ? this.m = this.m.scaleNonUniform(1, o) : "rotateZ" === n ? this.m = this.m.rotate(o) : "skewX" === n ? this.m = this.m.skewX(o) : "skewY" === n && (this.m = this.m.skewY(o));
      return this.rotateCX = null != (a = e.rotateCX) ? a : 0, this.rotateCY = null != (u = e.rotateCY) ? u : 0
    }, t
  }(), h = function() {
    function t(t) {
      this.els = t, this.combine = oe(this.combine, this), this.normalize = oe(this.normalize, this), this.length = oe(this.length, this), this.cross = oe(this.cross, this), this.dot = oe(this.dot, this), this.e = oe(this.e, this)
    }
    return t.prototype.e = function(t) {
      return 1 > t || t > this.els.length ? null : this.els[t - 1]
    }, t.prototype.dot = function(t) {
      var e, n, r;
      if (e = t.els || t, r = 0, n = this.els.length, n !== e.length) return null;
      for (n += 1; --n;) r += this.els[n - 1] * e[n - 1];
      return r
    }, t.prototype.cross = function(e) {
      var n, r;
      return r = e.els || e, 3 !== this.els.length || 3 !== r.length ? null : (n = this.els, new t([n[1] * r[2] - n[2] * r[1], n[2] * r[0] - n[0] * r[2], n[0] * r[1] - n[1] * r[0]]))
    }, t.prototype.length = function() {
      var t, e, n, r, o;
      for (t = 0, o = this.els, n = 0, r = o.length; r > n; n++) e = o[n], t += Math.pow(e, 2);
      return Math.sqrt(t)
    }, t.prototype.normalize = function() {
      var e, n, r, o, i;
      r = this.length(), o = [], i = this.els;
      for (n in i) e = i[n], o[n] = e / r;
      return new t(o)
    }, t.prototype.combine = function(e, n, r) {
      var o, i, s, a;
      for (i = [], o = s = 0, a = this.els.length; a >= 0 ? a > s : s > a; o = a >= 0 ? ++s : --s) i[o] = n * this.els[o] + r * e.els[o];
      return new t(i)
    }, t
  }(), e = function() {
    function t() {
      this.toMatrix = oe(this.toMatrix, this), this.format = oe(this.format, this), this.interpolate = oe(this.interpolate, this)
    }
    return t.prototype.interpolate = function(e, n, r) {
      var o, i, s, a, u, l, f, h, p, c, m, d, g, y, v, b, w, x;
      for (null == r && (r = null), s = this, i = new t, w = ["translate", "scale", "skew", "perspective"], d = 0, b = w.length; b > d; d++)
        for (f = w[d], i[f] = [], a = g = 0, x = s[f].length - 1; x >= 0 ? x >= g : g >= x; a = x >= 0 ? ++g : --g) i[f][a] = null == r || r.indexOf(f) > -1 || r.indexOf("" + f + ["x", "y", "z"][a]) > -1 ? (e[f][a] - s[f][a]) * n + s[f][a] : s[f][a];
      if (null == r || -1 !== r.indexOf("rotate")) {
        if (h = s.quaternion, p = e.quaternion, o = h[0] * p[0] + h[1] * p[1] + h[2] * p[2] + h[3] * p[3], 0 > o) {
          for (a = y = 0; 3 >= y; a = ++y) h[a] = -h[a];
          o = -o
        }
        for (o + 1 > .05 ? 1 - o >= .05 ? (m = Math.acos(o), l = 1 / Math.sin(m), c = Math.sin(m * (1 - n)) * l, u = Math.sin(m * n) * l) : (c = 1 - n, u = n) : (p[0] = -h[1], p[1] = h[0], p[2] = -h[3], p[3] = h[2], c = Math.sin(piDouble * (.5 - n)), u = Math.sin(piDouble * n)), i.quaternion = [], a = v = 0; 3 >= v; a = ++v) i.quaternion[a] = h[a] * c + p[a] * u
      } else i.quaternion = s.quaternion;
      return i
    }, t.prototype.format = function() {
      return this.toMatrix().toString()
    }, t.prototype.toMatrix = function() {
      var t, e, n, r, o, i, s, a, l, f, h, p, c, m, d, g;
      for (t = this, o = u.I(4), e = c = 0; 3 >= c; e = ++c) o.els[e][3] = t.perspective[e];
      for (i = t.quaternion, f = i[0], h = i[1], p = i[2], l = i[3], s = t.skew, r = [
          [1, 0],
          [2, 0],
          [2, 1]
        ], e = m = 2; m >= 0; e = --m) s[e] && (a = u.I(4), a.els[r[e][0]][r[e][1]] = s[e], o = o.multiply(a));
      for (o = o.multiply(new u([
          [1 - 2 * (h * h + p * p), 2 * (f * h - p * l), 2 * (f * p + h * l), 0],
          [2 * (f * h + p * l), 1 - 2 * (f * f + p * p), 2 * (h * p - f * l), 0],
          [2 * (f * p - h * l), 2 * (h * p + f * l), 1 - 2 * (f * f + h * h), 0],
          [0, 0, 0, 1]
        ])), e = d = 0; 2 >= d; e = ++d) {
        for (n = g = 0; 2 >= g; n = ++g) o.els[e][n] *= t.scale[e];
        o.els[3][e] = t.translate[e]
      }
      return o
    }, t
  }(), u = function() {
    function t(t) {
      this.els = t, this.toString = oe(this.toString, this), this.decompose = oe(this.decompose, this), this.inverse = oe(this.inverse, this), this.augment = oe(this.augment, this), this.toRightTriangular = oe(this.toRightTriangular, this), this.transpose = oe(this.transpose, this), this.multiply = oe(this.multiply, this), this.dup = oe(this.dup, this), this.e = oe(this.e, this)
    }
    return t.prototype.e = function(t, e) {
      return 1 > t || t > this.els.length || 1 > e || e > this.els[0].length ? null : this.els[t - 1][e - 1]
    }, t.prototype.dup = function() {
      return new t(this.els)
    }, t.prototype.multiply = function(e) {
      var n, r, o, i, s, a, u, l, f, h, p, c, m;
      for (c = e.modulus ? !0 : !1, n = e.els || e, "undefined" == typeof n[0][0] && (n = new t(n).els), h = this.els.length, u = h, l = n[0].length, o = this.els[0].length, i = [], h += 1; --h;)
        for (s = u - h, i[s] = [], p = l, p += 1; --p;) {
          for (a = l - p, m = 0, f = o, f += 1; --f;) r = o - f, m += this.els[s][r] * n[r][a];
          i[s][a] = m
        }
      return n = new t(i), c ? n.col(1) : n
    }, t.prototype.transpose = function() {
      var e, n, r, o, i, s, a;
      for (a = this.els.length, e = this.els[0].length, n = [], i = e, i += 1; --i;)
        for (r = e - i, n[r] = [], s = a, s += 1; --s;) o = a - s, n[r][o] = this.els[o][r];
      return new t(n)
    }, t.prototype.toRightTriangular = function() {
      var t, e, n, r, o, i, s, a, u, l, f, h, p, c;
      for (t = this.dup(), a = this.els.length, o = a, i = this.els[0].length; --a;) {
        if (n = o - a, 0 === t.els[n][n])
          for (r = f = p = n + 1; o >= p ? o > f : f > o; r = o >= p ? ++f : --f)
            if (0 !== t.els[r][n]) {
              for (e = [], u = i, u += 1; --u;) l = i - u, e.push(t.els[n][l] + t.els[r][l]);
              t.els[n] = e;
              break
            } if (0 !== t.els[n][n])
          for (r = h = c = n + 1; o >= c ? o > h : h > o; r = o >= c ? ++h : --h) {
            for (s = t.els[r][n] / t.els[n][n], e = [], u = i, u += 1; --u;) l = i - u, e.push(n >= l ? 0 : t.els[r][l] - t.els[n][l] * s);
            t.els[r] = e
          }
      }
      return t
    }, t.prototype.augment = function(e) {
      var n, r, o, i, s, a, u, l, f;
      if (n = e.els || e, "undefined" == typeof n[0][0] && (n = new t(n).els), r = this.dup(), o = r.els[0].length, l = r.els.length, a = l, u = n[0].length, l !== n.length) return null;
      for (l += 1; --l;)
        for (i = a - l, f = u, f += 1; --f;) s = u - f, r.els[i][o + s] = n[i][s];
      return r
    }, t.prototype.inverse = function() {
      var e, n, r, o, i, s, a, u, l, f, h, p, c;
      for (f = this.els.length, a = f, e = this.augment(t.I(f)).toRightTriangular(), u = e.els[0].length, i = [], f += 1; --f;) {
        for (o = f - 1, r = [], h = u, i[o] = [], n = e.els[o][o], h += 1; --h;) p = u - h, l = e.els[o][p] / n, r.push(l), p >= a && i[o].push(l);
        for (e.els[o] = r, s = c = 0; o >= 0 ? o > c : c > o; s = o >= 0 ? ++c : --c) {
          for (r = [], h = u, h += 1; --h;) p = u - h, r.push(e.els[s][p] - e.els[o][p] * e.els[s][o]);
          e.els[s] = r
        }
      }
      return new t(i)
    }, t.I = function(e) {
      var n, r, o, i, s;
      for (n = [], i = e, e += 1; --e;)
        for (r = i - e, n[r] = [], s = i, s += 1; --s;) o = i - s, n[r][o] = r === o ? 1 : 0;
      return new t(n)
    }, t.prototype.decompose = function() {
      var t, n, r, o, i, s, a, u, l, f, p, c, m, d, g, y, v, b, w, x, M, S, k, T, C, H, R, q, I, X, Y, A, j, z, F, G, O, V;
      for (s = this, x = [], v = [], b = [], f = [], u = [], t = [], n = I = 0; 3 >= I; n = ++I)
        for (t[n] = [], o = X = 0; 3 >= X; o = ++X) t[n][o] = s.els[n][o];
      if (0 === t[3][3]) return !1;
      for (n = Y = 0; 3 >= Y; n = ++Y)
        for (o = A = 0; 3 >= A; o = ++A) t[n][o] /= t[3][3];
      for (l = s.dup(), n = j = 0; 2 >= j; n = ++j) l.els[n][3] = 0;
      if (l.els[3][3] = 1, 0 !== t[0][3] || 0 !== t[1][3] || 0 !== t[2][3]) {
        for (c = new h(t.slice(0, 4)[3]), r = l.inverse(), M = r.transpose(), u = M.multiply(c).els, n = z = 0; 2 >= z; n = ++z) t[n][3] = 0;
        t[3][3] = 1
      } else u = [0, 0, 0, 1];
      for (n = F = 0; 2 >= F; n = ++F) x[n] = t[3][n], t[3][n] = 0;
      for (d = [], n = G = 0; 2 >= G; n = ++G) d[n] = new h(t[n].slice(0, 3));
      if (v[0] = d[0].length(), d[0] = d[0].normalize(), b[0] = d[0].dot(d[1]), d[1] = d[1].combine(d[0], 1, -b[0]), v[1] = d[1].length(), d[1] = d[1].normalize(), b[0] /= v[1], b[1] = d[0].dot(d[2]), d[2] = d[2].combine(d[0], 1, -b[1]), b[2] = d[1].dot(d[2]), d[2] = d[2].combine(d[1], 1, -b[2]), v[2] = d[2].length(), d[2] = d[2].normalize(), b[1] /= v[2], b[2] /= v[2], a = d[1].cross(d[2]), d[0].dot(a) < 0)
        for (n = O = 0; 2 >= O; n = ++O)
          for (v[n] *= -1, o = V = 0; 2 >= V; o = ++V) d[n].els[o] *= -1;
      g = function(t, e) {
        return d[t].els[e]
      }, m = [], m[1] = Math.asin(-g(0, 2)), 0 !== Math.cos(m[1]) ? (m[0] = Math.atan2(g(1, 2), g(2, 2)), m[2] = Math.atan2(g(0, 1), g(0, 0))) : (m[0] = Math.atan2(-g(2, 0), g(1, 1)), m[1] = 0), w = g(0, 0) + g(1, 1) + g(2, 2) + 1, w > 1e-4 ? (y = .5 / Math.sqrt(w), C = .25 / y, H = (g(2, 1) - g(1, 2)) * y, R = (g(0, 2) - g(2, 0)) * y, q = (g(1, 0) - g(0, 1)) * y) : g(0, 0) > g(1, 1) && g(0, 0) > g(2, 2) ? (y = 2 * Math.sqrt(1 + g(0, 0) - g(1, 1) - g(2, 2)), H = .25 * y, R = (g(0, 1) + g(1, 0)) / y, q = (g(0, 2) + g(2, 0)) / y, C = (g(2, 1) - g(1, 2)) / y) : g(1, 1) > g(2, 2) ? (y = 2 * Math.sqrt(1 + g(1, 1) - g(0, 0) - g(2, 2)), H = (g(0, 1) + g(1, 0)) / y, R = .25 * y, q = (g(1, 2) + g(2, 1)) / y, C = (g(0, 2) - g(2, 0)) / y) : (y = 2 * Math.sqrt(1 + g(2, 2) - g(0, 0) - g(1, 1)), H = (g(0, 2) + g(2, 0)) / y, R = (g(1, 2) + g(2, 1)) / y, q = .25 * y, C = (g(1, 0) - g(0, 1)) / y), f = [H, R, q, C], p = new e, p.translate = x, p.scale = v, p.skew = b, p.quaternion = f, p.perspective = u, p.rotate = m;
      for (k in p) {
        S = p[k];
        for (i in S) T = S[i], isNaN(T) && (S[i] = 0)
      }
      return p
    }, t.prototype.toString = function() {
      var t, e, n, r, o;
      for (n = "matrix3d(", t = r = 0; 3 >= r; t = ++r)
        for (e = o = 0; 3 >= o; e = ++o) n += E(this.els[t][e], 10), (3 !== t || 3 !== e) && (n += ",");
      return n += ")"
    }, t.matrixForTransform = x(function(t) {
      var e, n, r, o, i, s;
      return e = document.createElement("div"), e.style.position = "absolute", e.style.visibility = "hidden", e.style[O("transform")] = t, document.body.appendChild(e), r = window.getComputedStyle(e, null), n = null != (o = null != (i = r.transform) ? i : r[O("transform")]) ? o : null != (s = H.tests) ? s.matrixForTransform(t) : void 0, document.body.removeChild(e), n
    }), t.fromTransform = function(e) {
      var n, r, o, i, s, a;
      for (i = null != e ? e.match(/matrix3?d?\(([-0-9,e \.]*)\)/) : void 0, i ? (n = i[1].split(","), n = n.map(parseFloat), r = 6 === n.length ? [n[0], n[1], 0, 0, n[2], n[3], 0, 0, 0, 0, 1, 0, n[4], n[5], 0, 1] : n) : r = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], s = [], o = a = 0; 3 >= a; o = ++a) s.push(r.slice(4 * o, 4 * o + 4));
      return new t(s)
    }, t
  }(), G = x(function(t) {
    var e, n, r, o, i, s, a, u, l, f;
    if (void 0 !== document.body.style[t]) return "";
    for (o = t.split("-"), i = "", s = 0, u = o.length; u > s; s++) r = o[s], i += r.substring(0, 1).toUpperCase() + r.substring(1);
    for (f = ["Webkit", "Moz", "ms"], a = 0, l = f.length; l > a; a++)
      if (n = f[a], e = n + i, void 0 !== document.body.style[e]) return n;
    return ""
  }), O = x(function(t) {
    var e;
    return e = G(t), "Moz" === e ? "" + e + (t.substring(0, 1).toUpperCase() + t.substring(1)) : "" !== e ? "-" + e.toLowerCase() + "-" + te(t) : te(t)
  }), Z = "undefined" != typeof window && null !== window ? window.requestAnimationFrame : void 0, d = [], g = [], N = !1, U = 1, "undefined" != typeof window && null !== window && window.addEventListener("keyup", function(t) {
    return 68 === t.keyCode && t.shiftKey && t.ctrlKey ? H.toggleSlow() : void 0
  }), null == Z && (Y = 0, Z = function(t) {
    var e, n, r;
    return e = Date.now(), r = Math.max(0, 16 - (e - Y)), n = window.setTimeout(function() {
      return t(e + r)
    }, r), Y = e + r, n
  }), D = !1, L = !1, B = function() {
    return D ? void 0 : (D = !0, Z(P))
  }, P = function(t) {
    var e, n, r, o;
    if (L) return void Z(P);
    for (n = [], r = 0, o = d.length; o > r; r++) e = d[r], m(t, e) || n.push(e);
    return d = d.filter(function(t) {
      return -1 === n.indexOf(t)
    }), 0 === d.length ? D = !1 : Z(P)
  }, m = function(t, e) {
    var n, r, o, i, s, a, u, l;
    if (null == e.tStart && (e.tStart = t), i = (t - e.tStart) / e.options.duration, s = e.curve(i), r = {}, i >= 1) r = e.curve.returnsToSelf ? e.properties.start : e.properties.end;
    else {
      l = e.properties.start;
      for (n in l) o = l[n], r[n] = q(o, e.properties.end[n], s)
    }
    return v(e.el, r), "function" == typeof(a = e.options).change && a.change(e.el, Math.min(1, i)), i >= 1 && "function" == typeof(u = e.options).complete && u.complete(e.el), 1 > i
  }, q = function(t, e, n) {
    return null != t && null != t.interpolate ? t.interpolate(e, n) : null
  }, $ = function(t, e, n, r) {
    var o, i, s, a, f, h, p;
    if (null != r && (g = g.filter(function(t) {
        return t.id !== r
      })), H.stop(t, {
        timeout: !1
      }), !n.animated) return H.css(t, e), void("function" == typeof n.complete && n.complete(this));
    f = R(t, Object.keys(e)), e = F(e), o = {}, h = [];
    for (s in e) p = e[s], null != t.style && ee.contains(s) ? h.push([s, p]) : o[s] = k(p);
    return h.length > 0 && (i = X(t), i ? (a = new l, a.applyProperties(h)) : (p = h.map(function(t) {
      return ne(t[0], t[1])
    }).join(" "), a = u.fromTransform(u.matrixForTransform(p))), o.transform = a.decompose(), i && f.transform.applyRotateCenter([o.transform.props.rotate[1], o.transform.props.rotate[2]])), c(t, o), d.push({
      el: t,
      properties: {
        start: f,
        end: o
      },
      options: n,
      curve: n.type.call(n.type, n)
    }), B()
  }, _ = [], Q = 0, W = function(t) {
    return I() ? Z(function() {
      return -1 !== _.indexOf(t) ? t.realTimeoutId = setTimeout(function() {
        return t.fn(), M(t.id)
      }, t.delay) : void 0
    }) : void 0
  }, p = function(t, e) {
    var n;
    return Q += 1, n = {
      id: Q,
      tStart: Date.now(),
      fn: t,
      delay: e,
      originalDelay: e
    }, W(n), _.push(n), Q
  }, M = function(t) {
    return _ = _.filter(function(e) {
      return e.id === t && e.realTimeoutId && clearTimeout(e.realTimeoutId), e.id !== t
    })
  }, A = function(t, e) {
    var n;
    return null != t ? (n = t - e.tStart, e.originalDelay - n) : e.originalDelay
  }, "undefined" != typeof window && null !== window && window.addEventListener("unload", function() {}), J = null, z(function(t) {
    var e, n, r, o, i, s, a, u, l, f;
    if (L = !t, t) {
      if (D)
        for (n = Date.now() - J, i = 0, u = d.length; u > i; i++) e = d[i], null != e.tStart && (e.tStart += n);
      for (s = 0, l = _.length; l > s; s++) r = _[s], r.delay = A(J, r), W(r);
      return J = null
    }
    for (J = Date.now(), f = [], o = 0, a = _.length; a > o; o++) r = _[o], f.push(clearTimeout(r.realTimeoutId));
    return f
  }), H = {}, H.linear = function() {
    return function(t) {
      return t
    }
  }, H.spring = function(t) {
    var e, n, r, o, i, s;
    return null == t && (t = {}), y(t, H.spring.defaults), o = Math.max(1, t.frequency / 20), i = Math.pow(20, t.friction / 100), s = t.anticipationSize / 1e3, r = Math.max(0, s), e = function(e) {
        var n, r, o, i, a;
        return n = .8, i = s / (1 - s), a = 0, o = (i - n * a) / (i - a), r = (n - o) / i, r * e * t.anticipationStrength / 100 + o
      }, n = function(t) {
        return Math.pow(i / 10, -t) * (1 - t)
      },
      function(t) {
        var r, i, a, u, l, f, h, p;
        return f = t / (1 - s) - s / (1 - s), s > t ? (p = s / (1 - s) - s / (1 - s), h = 0 / (1 - s) - s / (1 - s), l = Math.acos(1 / e(p)), a = (Math.acos(1 / e(h)) - l) / (o * -s), r = e) : (r = n, l = 0, a = 1), i = r(f), u = o * (t - s) * a + l, 1 - i * Math.cos(u)
      }
  }, H.bounce = function(t) {
    var e, n, r, o;
    return null == t && (t = {}), y(t, H.bounce.defaults), r = Math.max(1, t.frequency / 20), o = Math.pow(20, t.friction / 100), e = function(t) {
      return Math.pow(o / 10, -t) * (1 - t)
    }, n = function(t) {
      var n, o, i, s;
      return s = -1.57, o = 1, n = e(t), i = r * t * o + s, n * Math.cos(i)
    }, n.returnsToSelf = !0, n
  }, H.gravity = function(t) {
    var e, n, r, o, i, s, a;
    return null == t && (t = {}), y(t, H.gravity.defaults), n = Math.min(t.bounciness / 1250, .8), o = t.elasticity / 1e3, a = 100, r = [], e = function() {
        var r, o;
        for (r = Math.sqrt(2 / a), o = {
            a: -r,
            b: r,
            H: 1
          }, t.returnsToSelf && (o.a = 0, o.b = 2 * o.b); o.H > .001;) e = o.b - o.a, o = {
          a: o.b,
          b: o.b + e * n,
          H: o.H * n * n
        };
        return o.b
      }(), s = function(n, r, o, i) {
        var s, a;
        return e = r - n, a = 2 / e * i - 1 - 2 * n / e, s = a * a * o - o + 1, t.returnsToSelf && (s = 1 - s), s
      },
      function() {
        var i, s, u, l;
        for (s = Math.sqrt(2 / (a * e * e)), u = {
            a: -s,
            b: s,
            H: 1
          }, t.returnsToSelf && (u.a = 0, u.b = 2 * u.b), r.push(u), i = e, l = []; u.b < 1 && u.H > .001;) i = u.b - u.a, u = {
          a: u.b,
          b: u.b + i * n,
          H: u.H * o
        }, l.push(r.push(u));
        return l
      }(), i = function(e) {
        var n, o, i;
        for (o = 0, n = r[o]; !(e >= n.a && e <= n.b) && (o += 1, n = r[o]););
        return i = n ? s(n.a, n.b, n.H, e) : t.returnsToSelf ? 0 : 1
      }, i.returnsToSelf = t.returnsToSelf, i
  }, H.forceWithGravity = function(t) {
    return null == t && (t = {}), y(t, H.forceWithGravity.defaults), t.returnsToSelf = !0, H.gravity(t)
  }, H.bezier = function() {
    var t, e, n;
    return e = function(t, e, n, r, o) {
        return Math.pow(1 - t, 3) * e + 3 * Math.pow(1 - t, 2) * t * n + 3 * (1 - t) * Math.pow(t, 2) * r + Math.pow(t, 3) * o
      }, t = function(t, n, r, o, i) {
        return {
          x: e(t, n.x, r.x, o.x, i.x),
          y: e(t, n.y, r.y, o.y, i.y)
        }
      }, n = function(t, e, n) {
        var r, o, i, s, a, u, l, f, h, p;
        for (r = null, h = 0, p = e.length; p > h && (o = e[h], t >= o(0).x && t <= o(1).x && (r = o), null === r); h++);
        if (!r) return n ? 0 : 1;
        for (f = 1e-4, s = 0, u = 1, a = (u + s) / 2, l = r(a).x, i = 0; Math.abs(t - l) > f && 100 > i;) t > l ? s = a : u = a, a = (u + s) / 2, l = r(a).x, i += 1;
        return r(a).y
      },
      function(e) {
        var r, o, i;
        return null == e && (e = {}), i = e.points, r = function() {
          var e, n, o;
          r = [], o = function(e, n) {
            var o;
            return o = function(r) {
              return t(r, e, e.cp[e.cp.length - 1], n.cp[0], n)
            }, r.push(o)
          };
          for (e in i) {
            if (n = parseInt(e), n >= i.length - 1) break;
            o(i[n], i[n + 1])
          }
          return r
        }(), o = function(t) {
          return 0 === t ? 0 : 1 === t ? 1 : n(t, r, this.returnsToSelf)
        }, o.returnsToSelf = 0 === i[i.length - 1].y, o
      }
  }(), H.easeInOut = function(t) {
    var e, n;
    return null == t && (t = {}), e = null != (n = t.friction) ? n : H.easeInOut.defaults.friction, H.bezier({
      points: [{
        x: 0,
        y: 0,
        cp: [{
          x: .92 - e / 1e3,
          y: 0
        }]
      }, {
        x: 1,
        y: 1,
        cp: [{
          x: .08 + e / 1e3,
          y: 1
        }]
      }]
    })
  }, H.easeIn = function(t) {
    var e, n;
    return null == t && (t = {}), e = null != (n = t.friction) ? n : H.easeIn.defaults.friction, H.bezier({
      points: [{
        x: 0,
        y: 0,
        cp: [{
          x: .92 - e / 1e3,
          y: 0
        }]
      }, {
        x: 1,
        y: 1,
        cp: [{
          x: 1,
          y: 1
        }]
      }]
    })
  }, H.easeOut = function(t) {
    var e, n;
    return null == t && (t = {}), e = null != (n = t.friction) ? n : H.easeOut.defaults.friction, H.bezier({
      points: [{
        x: 0,
        y: 0,
        cp: [{
          x: 0,
          y: 0
        }]
      }, {
        x: 1,
        y: 1,
        cp: [{
          x: .08 + e / 1e3,
          y: 1
        }]
      }]
    })
  }, H.spring.defaults = {
    frequency: 300,
    friction: 200,
    anticipationSize: 0,
    anticipationStrength: 0
  }, H.bounce.defaults = {
    frequency: 300,
    friction: 200
  }, H.forceWithGravity.defaults = H.gravity.defaults = {
    bounciness: 400,
    elasticity: 200
  }, H.easeInOut.defaults = H.easeIn.defaults = H.easeOut.defaults = {
    friction: 500
  }, H.css = j(function(t, e) {
    return b(t, e, !0)
  }), H.animate = j(function(t, e, n) {
    var r;
    return null == n && (n = {}), n = S(n), y(n, {
      type: H.easeInOut,
      duration: 1e3,
      delay: 0,
      animated: !0
    }), n.duration = Math.max(0, n.duration * U), n.delay = Math.max(0, n.delay), 0 === n.delay ? $(t, e, n) : (r = H.setTimeout(function() {
      return $(t, e, n, r)
    }, n.delay), g.push({
      id: r,
      el: t
    }))
  }), H.stop = j(function(t, e) {
    return null == e && (e = {}), null == e.timeout && (e.timeout = !0), e.timeout && (g = g.filter(function(n) {
      return n.el !== t || null != e.filter && !e.filter(n) ? !0 : (H.clearTimeout(n.id), !1)
    })), d = d.filter(function(e) {
      return e.el !== t
    })
  }), H.setTimeout = function(t, e) {
    return p(t, e * U)
  }, H.clearTimeout = function(t) {
    return M(t)
  }, H.toggleSlow = function() {
    return N = !N, U = N ? 3 : 1, "undefined" != typeof console && null !== console && "function" == typeof console.log ? console.log("dynamics.js: slow animations " + (N ? "enabled" : "disabled")) : void 0
  }, "object" == typeof module && "object" == typeof module.exports ? module.exports = H : "function" == typeof define ? define("dynamics", function() {
    return H
  }) : window.dynamics = H
}).call(this);

//	imagesloaded

/*!
 * imagesLoaded PACKAGED v3.1.8
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

(function() {
  function e() {}

  function t(e, t) {
    for (var n = e.length; n--;)
      if (e[n].listener === t) return n;
    return -1
  }

  function n(e) {
    return function() {
      return this[e].apply(this, arguments)
    }
  }
  var i = e.prototype,
    r = this,
    o = r.EventEmitter;
  i.getListeners = function(e) {
    var t, n, i = this._getEvents();
    if ("object" == typeof e) {
      t = {};
      for (n in i) i.hasOwnProperty(n) && e.test(n) && (t[n] = i[n])
    } else t = i[e] || (i[e] = []);
    return t
  }, i.flattenListeners = function(e) {
    var t, n = [];
    for (t = 0; e.length > t; t += 1) n.push(e[t].listener);
    return n
  }, i.getListenersAsObject = function(e) {
    var t, n = this.getListeners(e);
    return n instanceof Array && (t = {}, t[e] = n), t || n
  }, i.addListener = function(e, n) {
    var i, r = this.getListenersAsObject(e),
      o = "object" == typeof n;
    for (i in r) r.hasOwnProperty(i) && -1 === t(r[i], n) && r[i].push(o ? n : {
      listener: n,
      once: !1
    });
    return this
  }, i.on = n("addListener"), i.addOnceListener = function(e, t) {
    return this.addListener(e, {
      listener: t,
      once: !0
    })
  }, i.once = n("addOnceListener"), i.defineEvent = function(e) {
    return this.getListeners(e), this
  }, i.defineEvents = function(e) {
    for (var t = 0; e.length > t; t += 1) this.defineEvent(e[t]);
    return this
  }, i.removeListener = function(e, n) {
    var i, r, o = this.getListenersAsObject(e);
    for (r in o) o.hasOwnProperty(r) && (i = t(o[r], n), -1 !== i && o[r].splice(i, 1));
    return this
  }, i.off = n("removeListener"), i.addListeners = function(e, t) {
    return this.manipulateListeners(!1, e, t)
  }, i.removeListeners = function(e, t) {
    return this.manipulateListeners(!0, e, t)
  }, i.manipulateListeners = function(e, t, n) {
    var i, r, o = e ? this.removeListener : this.addListener,
      s = e ? this.removeListeners : this.addListeners;
    if ("object" != typeof t || t instanceof RegExp)
      for (i = n.length; i--;) o.call(this, t, n[i]);
    else
      for (i in t) t.hasOwnProperty(i) && (r = t[i]) && ("function" == typeof r ? o.call(this, i, r) : s.call(this, i, r));
    return this
  }, i.removeEvent = function(e) {
    var t, n = typeof e,
      i = this._getEvents();
    if ("string" === n) delete i[e];
    else if ("object" === n)
      for (t in i) i.hasOwnProperty(t) && e.test(t) && delete i[t];
    else delete this._events;
    return this
  }, i.removeAllListeners = n("removeEvent"), i.emitEvent = function(e, t) {
    var n, i, r, o, s = this.getListenersAsObject(e);
    for (r in s)
      if (s.hasOwnProperty(r))
        for (i = s[r].length; i--;) n = s[r][i], n.once === !0 && this.removeListener(e, n.listener), o = n.listener.apply(this, t || []), o === this._getOnceReturnValue() && this.removeListener(e, n.listener);
    return this
  }, i.trigger = n("emitEvent"), i.emit = function(e) {
    var t = Array.prototype.slice.call(arguments, 1);
    return this.emitEvent(e, t)
  }, i.setOnceReturnValue = function(e) {
    return this._onceReturnValue = e, this
  }, i._getOnceReturnValue = function() {
    return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0
  }, i._getEvents = function() {
    return this._events || (this._events = {})
  }, e.noConflict = function() {
    return r.EventEmitter = o, e
  }, "function" == typeof define && define.amd ? define("eventEmitter/EventEmitter", [], function() {
    return e
  }) : "object" == typeof module && module.exports ? module.exports = e : this.EventEmitter = e
}).call(this),
  function(e) {
    function t(t) {
      var n = e.event;
      return n.target = n.target || n.srcElement || t, n
    }
    var n = document.documentElement,
      i = function() {};
    n.addEventListener ? i = function(e, t, n) {
      e.addEventListener(t, n, !1)
    } : n.attachEvent && (i = function(e, n, i) {
      e[n + i] = i.handleEvent ? function() {
        var n = t(e);
        i.handleEvent.call(i, n)
      } : function() {
        var n = t(e);
        i.call(e, n)
      }, e.attachEvent("on" + n, e[n + i])
    });
    var r = function() {};
    n.removeEventListener ? r = function(e, t, n) {
      e.removeEventListener(t, n, !1)
    } : n.detachEvent && (r = function(e, t, n) {
      e.detachEvent("on" + t, e[t + n]);
      try {
        delete e[t + n]
      } catch (i) {
        e[t + n] = void 0
      }
    });
    var o = {
      bind: i,
      unbind: r
    };
    "function" == typeof define && define.amd ? define("eventie/eventie", o) : e.eventie = o
  }(this),
  function(e, t) {
    "function" == typeof define && define.amd ? define(["eventEmitter/EventEmitter", "eventie/eventie"], function(n, i) {
      return t(e, n, i)
    }) : "object" == typeof exports ? module.exports = t(e, require("wolfy87-eventemitter"), require("eventie")) : e.imagesLoaded = t(e, e.EventEmitter, e.eventie)
  }(window, function(e, t, n) {
    function i(e, t) {
      for (var n in t) e[n] = t[n];
      return e
    }

    function r(e) {
      return "[object Array]" === d.call(e)
    }

    function o(e) {
      var t = [];
      if (r(e)) t = e;
      else if ("number" == typeof e.length)
        for (var n = 0, i = e.length; i > n; n++) t.push(e[n]);
      else t.push(e);
      return t
    }

    function s(e, t, n) {
      if (!(this instanceof s)) return new s(e, t);
      "string" == typeof e && (e = document.querySelectorAll(e)), this.elements = o(e), this.options = i({}, this.options), "function" == typeof t ? n = t : i(this.options, t), n && this.on("always", n), this.getImages(), a && (this.jqDeferred = new a.Deferred);
      var r = this;
      setTimeout(function() {
        r.check()
      })
    }

    function f(e) {
      this.img = e
    }

    function c(e) {
      this.src = e, v[e] = this
    }
    var a = e.jQuery,
      u = e.console,
      h = u !== void 0,
      d = Object.prototype.toString;
    s.prototype = new t, s.prototype.options = {}, s.prototype.getImages = function() {
      this.images = [];
      for (var e = 0, t = this.elements.length; t > e; e++) {
        var n = this.elements[e];
        "IMG" === n.nodeName && this.addImage(n);
        var i = n.nodeType;
        if (i && (1 === i || 9 === i || 11 === i))
          for (var r = n.querySelectorAll("img"), o = 0, s = r.length; s > o; o++) {
            var f = r[o];
            this.addImage(f)
          }
      }
    }, s.prototype.addImage = function(e) {
      var t = new f(e);
      this.images.push(t)
    }, s.prototype.check = function() {
      function e(e, r) {
        return t.options.debug && h && u.log("confirm", e, r), t.progress(e), n++, n === i && t.complete(), !0
      }
      var t = this,
        n = 0,
        i = this.images.length;
      if (this.hasAnyBroken = !1, !i) return this.complete(), void 0;
      for (var r = 0; i > r; r++) {
        var o = this.images[r];
        o.on("confirm", e), o.check()
      }
    }, s.prototype.progress = function(e) {
      this.hasAnyBroken = this.hasAnyBroken || !e.isLoaded;
      var t = this;
      setTimeout(function() {
        t.emit("progress", t, e), t.jqDeferred && t.jqDeferred.notify && t.jqDeferred.notify(t, e)
      })
    }, s.prototype.complete = function() {
      var e = this.hasAnyBroken ? "fail" : "done";
      this.isComplete = !0;
      var t = this;
      setTimeout(function() {
        if (t.emit(e, t), t.emit("always", t), t.jqDeferred) {
          var n = t.hasAnyBroken ? "reject" : "resolve";
          t.jqDeferred[n](t)
        }
      })
    }, a && (a.fn.imagesLoaded = function(e, t) {
      var n = new s(this, e, t);
      return n.jqDeferred.promise(a(this))
    }), f.prototype = new t, f.prototype.check = function() {
      var e = v[this.img.src] || new c(this.img.src);
      if (e.isConfirmed) return this.confirm(e.isLoaded, "cached was confirmed"), void 0;
      if (this.img.complete && void 0 !== this.img.naturalWidth) return this.confirm(0 !== this.img.naturalWidth, "naturalWidth"), void 0;
      var t = this;
      e.on("confirm", function(e, n) {
        return t.confirm(e.isLoaded, n), !0
      }), e.check()
    }, f.prototype.confirm = function(e, t) {
      this.isLoaded = e, this.emit("confirm", this, t)
    };
    var v = {};
    return c.prototype = new t, c.prototype.check = function() {
      if (!this.isChecked) {
        var e = new Image;
        n.bind(e, "load", this), n.bind(e, "error", this), e.src = this.src, this.isChecked = !0
      }
    }, c.prototype.handleEvent = function(e) {
      var t = "on" + e.type;
      this[t] && this[t](e)
    }, c.prototype.onload = function(e) {
      this.confirm(!0, "onload"), this.unbindProxyEvents(e)
    }, c.prototype.onerror = function(e) {
      this.confirm(!1, "onerror"), this.unbindProxyEvents(e)
    }, c.prototype.confirm = function(e, t) {
      this.isConfirmed = !0, this.isLoaded = e, this.emit("confirm", this, t)
    }, c.prototype.unbindProxyEvents = function(e) {
      n.unbind(e.target, "load", this), n.unbind(e.target, "error", this)
    }, s
  });

/*!
 * Masonry PACKAGED v4.2.1
 * Cascading grid layout library
 * https://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */

! function(t, e) {
  "function" == typeof define && define.amd ? define("jquery-bridget/jquery-bridget", ["jquery"], function(i) {
    return e(t, i)
  }) : "object" == typeof module && module.exports ? module.exports = e(t, require("jquery")) : t.jQueryBridget = e(t, t.jQuery)
}(window, function(t, e) {
  "use strict";

  function i(i, r, a) {
    function h(t, e, n) {
      var o, r = "$()." + i + '("' + e + '")';
      return t.each(function(t, h) {
        var u = a.data(h, i);
        if (!u) return void s(i + " not initialized. Cannot call methods, i.e. " + r);
        var d = u[e];
        if (!d || "_" == e.charAt(0)) return void s(r + " is not a valid method");
        var l = d.apply(u, n);
        o = void 0 === o ? l : o
      }), void 0 !== o ? o : t
    }

    function u(t, e) {
      t.each(function(t, n) {
        var o = a.data(n, i);
        o ? (o.option(e), o._init()) : (o = new r(n, e), a.data(n, i, o))
      })
    }
    a = a || e || t.jQuery, a && (r.prototype.option || (r.prototype.option = function(t) {
      a.isPlainObject(t) && (this.options = a.extend(!0, this.options, t))
    }), a.fn[i] = function(t) {
      if ("string" == typeof t) {
        var e = o.call(arguments, 1);
        return h(this, t, e)
      }
      return u(this, t), this
    }, n(a))
  }

  function n(t) {
    !t || t && t.bridget || (t.bridget = i)
  }
  var o = Array.prototype.slice,
    r = t.console,
    s = "undefined" == typeof r ? function() {} : function(t) {
      r.error(t)
    };
  return n(e || t.jQuery), i
}),
function(t, e) {
  "function" == typeof define && define.amd ? define("ev-emitter/ev-emitter", e) : "object" == typeof module && module.exports ? module.exports = e() : t.EvEmitter = e()
}("undefined" != typeof window ? window : this, function() {
  function t() {}
  var e = t.prototype;
  return e.on = function(t, e) {
    if (t && e) {
      var i = this._events = this._events || {},
        n = i[t] = i[t] || [];
      return -1 == n.indexOf(e) && n.push(e), this
    }
  }, e.once = function(t, e) {
    if (t && e) {
      this.on(t, e);
      var i = this._onceEvents = this._onceEvents || {},
        n = i[t] = i[t] || {};
      return n[e] = !0, this
    }
  }, e.off = function(t, e) {
    var i = this._events && this._events[t];
    if (i && i.length) {
      var n = i.indexOf(e);
      return -1 != n && i.splice(n, 1), this
    }
  }, e.emitEvent = function(t, e) {
    var i = this._events && this._events[t];
    if (i && i.length) {
      i = i.slice(0), e = e || [];
      for (var n = this._onceEvents && this._onceEvents[t], o = 0; o < i.length; o++) {
        var r = i[o],
          s = n && n[r];
        s && (this.off(t, r), delete n[r]), r.apply(this, e)
      }
      return this
    }
  }, e.allOff = function() {
    delete this._events, delete this._onceEvents
  }, t
}),
function(t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("get-size/get-size", [], function() {
    return e()
  }) : "object" == typeof module && module.exports ? module.exports = e() : t.getSize = e()
}(window, function() {
  "use strict";

  function t(t) {
    var e = parseFloat(t),
      i = -1 == t.indexOf("%") && !isNaN(e);
    return i && e
  }

  function e() {}

  function i() {
    for (var t = {
        width: 0,
        height: 0,
        innerWidth: 0,
        innerHeight: 0,
        outerWidth: 0,
        outerHeight: 0
      }, e = 0; u > e; e++) {
      var i = h[e];
      t[i] = 0
    }
    return t
  }

  function n(t) {
    var e = getComputedStyle(t);
    return e || a("Style returned " + e + ". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"), e
  }

  function o() {
    if (!d) {
      d = !0;
      var e = document.createElement("div");
      e.style.width = "200px", e.style.padding = "1px 2px 3px 4px", e.style.borderStyle = "solid", e.style.borderWidth = "1px 2px 3px 4px", e.style.boxSizing = "border-box";
      var i = document.body || document.documentElement;
      i.appendChild(e);
      var o = n(e);
      r.isBoxSizeOuter = s = 200 == t(o.width), i.removeChild(e)
    }
  }

  function r(e) {
    if (o(), "string" == typeof e && (e = document.querySelector(e)), e && "object" == typeof e && e.nodeType) {
      var r = n(e);
      if ("none" == r.display) return i();
      var a = {};
      a.width = e.offsetWidth, a.height = e.offsetHeight;
      for (var d = a.isBorderBox = "border-box" == r.boxSizing, l = 0; u > l; l++) {
        var c = h[l],
          f = r[c],
          m = parseFloat(f);
        a[c] = isNaN(m) ? 0 : m
      }
      var p = a.paddingLeft + a.paddingRight,
        g = a.paddingTop + a.paddingBottom,
        y = a.marginLeft + a.marginRight,
        v = a.marginTop + a.marginBottom,
        _ = a.borderLeftWidth + a.borderRightWidth,
        z = a.borderTopWidth + a.borderBottomWidth,
        E = d && s,
        b = t(r.width);
      b !== !1 && (a.width = b + (E ? 0 : p + _));
      var x = t(r.height);
      return x !== !1 && (a.height = x + (E ? 0 : g + z)), a.innerWidth = a.width - (p + _), a.innerHeight = a.height - (g + z), a.outerWidth = a.width + y, a.outerHeight = a.height + v, a
    }
  }
  var s, a = "undefined" == typeof console ? e : function(t) {
      console.error(t)
    },
    h = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"],
    u = h.length,
    d = !1;
  return r
}),
function(t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("desandro-matches-selector/matches-selector", e) : "object" == typeof module && module.exports ? module.exports = e() : t.matchesSelector = e()
}(window, function() {
  "use strict";
  var t = function() {
    var t = window.Element.prototype;
    if (t.matches) return "matches";
    if (t.matchesSelector) return "matchesSelector";
    for (var e = ["webkit", "moz", "ms", "o"], i = 0; i < e.length; i++) {
      var n = e[i],
        o = n + "MatchesSelector";
      if (t[o]) return o
    }
  }();
  return function(e, i) {
    return e[t](i)
  }
}),
function(t, e) {
  "function" == typeof define && define.amd ? define("fizzy-ui-utils/utils", ["desandro-matches-selector/matches-selector"], function(i) {
    return e(t, i)
  }) : "object" == typeof module && module.exports ? module.exports = e(t, require("desandro-matches-selector")) : t.fizzyUIUtils = e(t, t.matchesSelector)
}(window, function(t, e) {
  var i = {};
  i.extend = function(t, e) {
    for (var i in e) t[i] = e[i];
    return t
  }, i.modulo = function(t, e) {
    return (t % e + e) % e
  }, i.makeArray = function(t) {
    var e = [];
    if (Array.isArray(t)) e = t;
    else if (t && "object" == typeof t && "number" == typeof t.length)
      for (var i = 0; i < t.length; i++) e.push(t[i]);
    else e.push(t);
    return e
  }, i.removeFrom = function(t, e) {
    var i = t.indexOf(e); - 1 != i && t.splice(i, 1)
  }, i.getParent = function(t, i) {
    for (; t.parentNode && t != document.body;)
      if (t = t.parentNode, e(t, i)) return t
  }, i.getQueryElement = function(t) {
    return "string" == typeof t ? document.querySelector(t) : t
  }, i.handleEvent = function(t) {
    var e = "on" + t.type;
    this[e] && this[e](t)
  }, i.filterFindElements = function(t, n) {
    t = i.makeArray(t);
    var o = [];
    return t.forEach(function(t) {
      if (t instanceof HTMLElement) {
        if (!n) return void o.push(t);
        e(t, n) && o.push(t);
        for (var i = t.querySelectorAll(n), r = 0; r < i.length; r++) o.push(i[r])
      }
    }), o
  }, i.debounceMethod = function(t, e, i) {
    var n = t.prototype[e],
      o = e + "Timeout";
    t.prototype[e] = function() {
      var t = this[o];
      t && clearTimeout(t);
      var e = arguments,
        r = this;
      this[o] = setTimeout(function() {
        n.apply(r, e), delete r[o]
      }, i || 100)
    }
  }, i.docReady = function(t) {
    var e = document.readyState;
    "complete" == e || "interactive" == e ? setTimeout(t) : document.addEventListener("DOMContentLoaded", t)
  }, i.toDashed = function(t) {
    return t.replace(/(.)([A-Z])/g, function(t, e, i) {
      return e + "-" + i
    }).toLowerCase()
  };
  var n = t.console;
  return i.htmlInit = function(e, o) {
    i.docReady(function() {
      var r = i.toDashed(o),
        s = "data-" + r,
        a = document.querySelectorAll("[" + s + "]"),
        h = document.querySelectorAll(".js-" + r),
        u = i.makeArray(a).concat(i.makeArray(h)),
        d = s + "-options",
        l = t.jQuery;
      u.forEach(function(t) {
        var i, r = t.getAttribute(s) || t.getAttribute(d);
        try {
          i = r && JSON.parse(r)
        } catch (a) {
          return void(n && n.error("Error parsing " + s + " on " + t.className + ": " + a))
        }
        var h = new e(t, i);
        l && l.data(t, o, h)
      })
    })
  }, i
}),
function(t, e) {
  "function" == typeof define && define.amd ? define("outlayer/item", ["ev-emitter/ev-emitter", "get-size/get-size"], e) : "object" == typeof module && module.exports ? module.exports = e(require("ev-emitter"), require("get-size")) : (t.Outlayer = {}, t.Outlayer.Item = e(t.EvEmitter, t.getSize))
}(window, function(t, e) {
  "use strict";

  function i(t) {
    for (var e in t) return !1;
    return e = null, !0
  }

  function n(t, e) {
    t && (this.element = t, this.layout = e, this.position = {
      x: 0,
      y: 0
    }, this._create())
  }

  function o(t) {
    return t.replace(/([A-Z])/g, function(t) {
      return "-" + t.toLowerCase()
    })
  }
  var r = document.documentElement.style,
    s = "string" == typeof r.transition ? "transition" : "WebkitTransition",
    a = "string" == typeof r.transform ? "transform" : "WebkitTransform",
    h = {
      WebkitTransition: "webkitTransitionEnd",
      transition: "transitionend"
    } [s],
    u = {
      transform: a,
      transition: s,
      transitionDuration: s + "Duration",
      transitionProperty: s + "Property",
      transitionDelay: s + "Delay"
    },
    d = n.prototype = Object.create(t.prototype);
  d.constructor = n, d._create = function() {
    this._transn = {
      ingProperties: {},
      clean: {},
      onEnd: {}
    }, this.css({
      position: "absolute"
    })
  }, d.handleEvent = function(t) {
    var e = "on" + t.type;
    this[e] && this[e](t)
  }, d.getSize = function() {
    this.size = e(this.element)
  }, d.css = function(t) {
    var e = this.element.style;
    for (var i in t) {
      var n = u[i] || i;
      e[n] = t[i]
    }
  }, d.getPosition = function() {
    var t = getComputedStyle(this.element),
      e = this.layout._getOption("originLeft"),
      i = this.layout._getOption("originTop"),
      n = t[e ? "left" : "right"],
      o = t[i ? "top" : "bottom"],
      r = this.layout.size,
      s = -1 != n.indexOf("%") ? parseFloat(n) / 100 * r.width : parseInt(n, 10),
      a = -1 != o.indexOf("%") ? parseFloat(o) / 100 * r.height : parseInt(o, 10);
    s = isNaN(s) ? 0 : s, a = isNaN(a) ? 0 : a, s -= e ? r.paddingLeft : r.paddingRight, a -= i ? r.paddingTop : r.paddingBottom, this.position.x = s, this.position.y = a
  }, d.layoutPosition = function() {
    var t = this.layout.size,
      e = {},
      i = this.layout._getOption("originLeft"),
      n = this.layout._getOption("originTop"),
      o = i ? "paddingLeft" : "paddingRight",
      r = i ? "left" : "right",
      s = i ? "right" : "left",
      a = this.position.x + t[o];
    e[r] = this.getXValue(a), e[s] = "";
    var h = n ? "paddingTop" : "paddingBottom",
      u = n ? "top" : "bottom",
      d = n ? "bottom" : "top",
      l = this.position.y + t[h];
    e[u] = this.getYValue(l), e[d] = "", this.css(e), this.emitEvent("layout", [this])
  }, d.getXValue = function(t) {
    var e = this.layout._getOption("horizontal");
    return this.layout.options.percentPosition && !e ? t / this.layout.size.width * 100 + "%" : t + "px"
  }, d.getYValue = function(t) {
    var e = this.layout._getOption("horizontal");
    return this.layout.options.percentPosition && e ? t / this.layout.size.height * 100 + "%" : t + "px"
  }, d._transitionTo = function(t, e) {
    this.getPosition();
    var i = this.position.x,
      n = this.position.y,
      o = parseInt(t, 10),
      r = parseInt(e, 10),
      s = o === this.position.x && r === this.position.y;
    if (this.setPosition(t, e), s && !this.isTransitioning) return void this.layoutPosition();
    var a = t - i,
      h = e - n,
      u = {};
    u.transform = this.getTranslate(a, h), this.transition({
      to: u,
      onTransitionEnd: {
        transform: this.layoutPosition
      },
      isCleaning: !0
    })
  }, d.getTranslate = function(t, e) {
    var i = this.layout._getOption("originLeft"),
      n = this.layout._getOption("originTop");
    return t = i ? t : -t, e = n ? e : -e, "translate3d(" + t + "px, " + e + "px, 0)"
  }, d.goTo = function(t, e) {
    this.setPosition(t, e), this.layoutPosition()
  }, d.moveTo = d._transitionTo, d.setPosition = function(t, e) {
    this.position.x = parseInt(t, 10), this.position.y = parseInt(e, 10)
  }, d._nonTransition = function(t) {
    this.css(t.to), t.isCleaning && this._removeStyles(t.to);
    for (var e in t.onTransitionEnd) t.onTransitionEnd[e].call(this)
  }, d.transition = function(t) {
    if (!parseFloat(this.layout.options.transitionDuration)) return void this._nonTransition(t);
    var e = this._transn;
    for (var i in t.onTransitionEnd) e.onEnd[i] = t.onTransitionEnd[i];
    for (i in t.to) e.ingProperties[i] = !0, t.isCleaning && (e.clean[i] = !0);
    if (t.from) {
      this.css(t.from);
      var n = this.element.offsetHeight;
      n = null
    }
    this.enableTransition(t.to), this.css(t.to), this.isTransitioning = !0
  };
  var l = "opacity," + o(a);
  d.enableTransition = function() {
    if (!this.isTransitioning) {
      var t = this.layout.options.transitionDuration;
      t = "number" == typeof t ? t + "ms" : t, this.css({
        transitionProperty: l,
        transitionDuration: t,
        transitionDelay: this.staggerDelay || 0
      }), this.element.addEventListener(h, this, !1)
    }
  }, d.onwebkitTransitionEnd = function(t) {
    this.ontransitionend(t)
  }, d.onotransitionend = function(t) {
    this.ontransitionend(t)
  };
  var c = {
    "-webkit-transform": "transform"
  };
  d.ontransitionend = function(t) {
    if (t.target === this.element) {
      var e = this._transn,
        n = c[t.propertyName] || t.propertyName;
      if (delete e.ingProperties[n], i(e.ingProperties) && this.disableTransition(), n in e.clean && (this.element.style[t.propertyName] = "", delete e.clean[n]), n in e.onEnd) {
        var o = e.onEnd[n];
        o.call(this), delete e.onEnd[n]
      }
      this.emitEvent("transitionEnd", [this])
    }
  }, d.disableTransition = function() {
    this.removeTransitionStyles(), this.element.removeEventListener(h, this, !1), this.isTransitioning = !1
  }, d._removeStyles = function(t) {
    var e = {};
    for (var i in t) e[i] = "";
    this.css(e)
  };
  var f = {
    transitionProperty: "",
    transitionDuration: "",
    transitionDelay: ""
  };
  return d.removeTransitionStyles = function() {
    this.css(f)
  }, d.stagger = function(t) {
    t = isNaN(t) ? 0 : t, this.staggerDelay = t + "ms"
  }, d.removeElem = function() {
    this.element.parentNode.removeChild(this.element), this.css({
      display: ""
    }), this.emitEvent("remove", [this])
  }, d.remove = function() {
    return s && parseFloat(this.layout.options.transitionDuration) ? (this.once("transitionEnd", function() {
      this.removeElem()
    }), void this.hide()) : void this.removeElem()
  }, d.reveal = function() {
    delete this.isHidden, this.css({
      display: ""
    });
    var t = this.layout.options,
      e = {},
      i = this.getHideRevealTransitionEndProperty("visibleStyle");
    e[i] = this.onRevealTransitionEnd, this.transition({
      from: t.hiddenStyle,
      to: t.visibleStyle,
      isCleaning: !0,
      onTransitionEnd: e
    })
  }, d.onRevealTransitionEnd = function() {
    this.isHidden || this.emitEvent("reveal")
  }, d.getHideRevealTransitionEndProperty = function(t) {
    var e = this.layout.options[t];
    if (e.opacity) return "opacity";
    for (var i in e) return i
  }, d.hide = function() {
    this.isHidden = !0, this.css({
      display: ""
    });
    var t = this.layout.options,
      e = {},
      i = this.getHideRevealTransitionEndProperty("hiddenStyle");
    e[i] = this.onHideTransitionEnd, this.transition({
      from: t.visibleStyle,
      to: t.hiddenStyle,
      isCleaning: !0,
      onTransitionEnd: e
    })
  }, d.onHideTransitionEnd = function() {
    this.isHidden && (this.css({
      display: "none"
    }), this.emitEvent("hide"))
  }, d.destroy = function() {
    this.css({
      position: "",
      left: "",
      right: "",
      top: "",
      bottom: "",
      transition: "",
      transform: ""
    })
  }, n
}),
function(t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("outlayer/outlayer", ["ev-emitter/ev-emitter", "get-size/get-size", "fizzy-ui-utils/utils", "./item"], function(i, n, o, r) {
    return e(t, i, n, o, r)
  }) : "object" == typeof module && module.exports ? module.exports = e(t, require("ev-emitter"), require("get-size"), require("fizzy-ui-utils"), require("./item")) : t.Outlayer = e(t, t.EvEmitter, t.getSize, t.fizzyUIUtils, t.Outlayer.Item)
}(window, function(t, e, i, n, o) {
  "use strict";

  function r(t, e) {
    var i = n.getQueryElement(t);
    if (!i) return void(h && h.error("Bad element for " + this.constructor.namespace + ": " + (i || t)));
    this.element = i, u && (this.$element = u(this.element)), this.options = n.extend({}, this.constructor.defaults), this.option(e);
    var o = ++l;
    this.element.outlayerGUID = o, c[o] = this, this._create();
    var r = this._getOption("initLayout");
    r && this.layout()
  }

  function s(t) {
    function e() {
      t.apply(this, arguments)
    }
    return e.prototype = Object.create(t.prototype), e.prototype.constructor = e, e
  }

  function a(t) {
    if ("number" == typeof t) return t;
    var e = t.match(/(^\d*\.?\d*)(\w*)/),
      i = e && e[1],
      n = e && e[2];
    if (!i.length) return 0;
    i = parseFloat(i);
    var o = m[n] || 1;
    return i * o
  }
  var h = t.console,
    u = t.jQuery,
    d = function() {},
    l = 0,
    c = {};
  r.namespace = "outlayer", r.Item = o, r.defaults = {
    containerStyle: {
      position: "relative"
    },
    initLayout: !0,
    originLeft: !0,
    originTop: !0,
    resize: !0,
    resizeContainer: !0,
    transitionDuration: "0.4s",
    hiddenStyle: {
      opacity: 0,
      transform: "scale(0.001)"
    },
    visibleStyle: {
      opacity: 1,
      transform: "scale(1)"
    }
  };
  var f = r.prototype;
  n.extend(f, e.prototype), f.option = function(t) {
    n.extend(this.options, t)
  }, f._getOption = function(t) {
    var e = this.constructor.compatOptions[t];
    return e && void 0 !== this.options[e] ? this.options[e] : this.options[t]
  }, r.compatOptions = {
    initLayout: "isInitLayout",
    horizontal: "isHorizontal",
    layoutInstant: "isLayoutInstant",
    originLeft: "isOriginLeft",
    originTop: "isOriginTop",
    resize: "isResizeBound",
    resizeContainer: "isResizingContainer"
  }, f._create = function() {
    this.reloadItems(), this.stamps = [], this.stamp(this.options.stamp), n.extend(this.element.style, this.options.containerStyle);
    var t = this._getOption("resize");
    t && this.bindResize()
  }, f.reloadItems = function() {
    this.items = this._itemize(this.element.children)
  }, f._itemize = function(t) {
    for (var e = this._filterFindItemElements(t), i = this.constructor.Item, n = [], o = 0; o < e.length; o++) {
      var r = e[o],
        s = new i(r, this);
      n.push(s)
    }
    return n
  }, f._filterFindItemElements = function(t) {
    return n.filterFindElements(t, this.options.itemSelector)
  }, f.getItemElements = function() {
    return this.items.map(function(t) {
      return t.element
    })
  }, f.layout = function() {
    this._resetLayout(), this._manageStamps();
    var t = this._getOption("layoutInstant"),
      e = void 0 !== t ? t : !this._isLayoutInited;
    this.layoutItems(this.items, e), this._isLayoutInited = !0
  }, f._init = f.layout, f._resetLayout = function() {
    this.getSize()
  }, f.getSize = function() {
    this.size = i(this.element)
  }, f._getMeasurement = function(t, e) {
    var n, o = this.options[t];
    o ? ("string" == typeof o ? n = this.element.querySelector(o) : o instanceof HTMLElement && (n = o), this[t] = n ? i(n)[e] : o) : this[t] = 0
  }, f.layoutItems = function(t, e) {
    t = this._getItemsForLayout(t), this._layoutItems(t, e), this._postLayout()
  }, f._getItemsForLayout = function(t) {
    return t.filter(function(t) {
      return !t.isIgnored
    })
  }, f._layoutItems = function(t, e) {
    if (this._emitCompleteOnItems("layout", t), t && t.length) {
      var i = [];
      t.forEach(function(t) {
        var n = this._getItemLayoutPosition(t);
        n.item = t, n.isInstant = e || t.isLayoutInstant, i.push(n)
      }, this), this._processLayoutQueue(i)
    }
  }, f._getItemLayoutPosition = function() {
    return {
      x: 0,
      y: 0
    }
  }, f._processLayoutQueue = function(t) {
    this.updateStagger(), t.forEach(function(t, e) {
      this._positionItem(t.item, t.x, t.y, t.isInstant, e)
    }, this)
  }, f.updateStagger = function() {
    var t = this.options.stagger;
    return null === t || void 0 === t ? void(this.stagger = 0) : (this.stagger = a(t), this.stagger)
  }, f._positionItem = function(t, e, i, n, o) {
    n ? t.goTo(e, i) : (t.stagger(o * this.stagger), t.moveTo(e, i))
  }, f._postLayout = function() {
    this.resizeContainer()
  }, f.resizeContainer = function() {
    var t = this._getOption("resizeContainer");
    if (t) {
      var e = this._getContainerSize();
      e && (this._setContainerMeasure(e.width, !0), this._setContainerMeasure(e.height, !1))
    }
  }, f._getContainerSize = d, f._setContainerMeasure = function(t, e) {
    if (void 0 !== t) {
      var i = this.size;
      i.isBorderBox && (t += e ? i.paddingLeft + i.paddingRight + i.borderLeftWidth + i.borderRightWidth : i.paddingBottom + i.paddingTop + i.borderTopWidth + i.borderBottomWidth), t = Math.max(t, 0), this.element.style[e ? "width" : "height"] = t + "px"
    }
  }, f._emitCompleteOnItems = function(t, e) {
    function i() {
      o.dispatchEvent(t + "Complete", null, [e])
    }

    function n() {
      s++, s == r && i()
    }
    var o = this,
      r = e.length;
    if (!e || !r) return void i();
    var s = 0;
    e.forEach(function(e) {
      e.once(t, n)
    })
  }, f.dispatchEvent = function(t, e, i) {
    var n = e ? [e].concat(i) : i;
    if (this.emitEvent(t, n), u)
      if (this.$element = this.$element || u(this.element), e) {
        var o = u.Event(e);
        o.type = t, this.$element.trigger(o, i)
      } else this.$element.trigger(t, i)
  }, f.ignore = function(t) {
    var e = this.getItem(t);
    e && (e.isIgnored = !0)
  }, f.unignore = function(t) {
    var e = this.getItem(t);
    e && delete e.isIgnored
  }, f.stamp = function(t) {
    t = this._find(t), t && (this.stamps = this.stamps.concat(t), t.forEach(this.ignore, this))
  }, f.unstamp = function(t) {
    t = this._find(t), t && t.forEach(function(t) {
      n.removeFrom(this.stamps, t), this.unignore(t)
    }, this)
  }, f._find = function(t) {
    return t ? ("string" == typeof t && (t = this.element.querySelectorAll(t)), t = n.makeArray(t)) : void 0
  }, f._manageStamps = function() {
    this.stamps && this.stamps.length && (this._getBoundingRect(), this.stamps.forEach(this._manageStamp, this))
  }, f._getBoundingRect = function() {
    var t = this.element.getBoundingClientRect(),
      e = this.size;
    this._boundingRect = {
      left: t.left + e.paddingLeft + e.borderLeftWidth,
      top: t.top + e.paddingTop + e.borderTopWidth,
      right: t.right - (e.paddingRight + e.borderRightWidth),
      bottom: t.bottom - (e.paddingBottom + e.borderBottomWidth)
    }
  }, f._manageStamp = d, f._getElementOffset = function(t) {
    var e = t.getBoundingClientRect(),
      n = this._boundingRect,
      o = i(t),
      r = {
        left: e.left - n.left - o.marginLeft,
        top: e.top - n.top - o.marginTop,
        right: n.right - e.right - o.marginRight,
        bottom: n.bottom - e.bottom - o.marginBottom
      };
    return r
  }, f.handleEvent = n.handleEvent, f.bindResize = function() {
    t.addEventListener("resize", this), this.isResizeBound = !0
  }, f.unbindResize = function() {
    t.removeEventListener("resize", this), this.isResizeBound = !1
  }, f.onresize = function() {
    this.resize()
  }, n.debounceMethod(r, "onresize", 100), f.resize = function() {
    this.isResizeBound && this.needsResizeLayout() && this.layout()
  }, f.needsResizeLayout = function() {
    var t = i(this.element),
      e = this.size && t;
    return e && t.innerWidth !== this.size.innerWidth
  }, f.addItems = function(t) {
    var e = this._itemize(t);
    return e.length && (this.items = this.items.concat(e)), e
  }, f.appended = function(t) {
    var e = this.addItems(t);
    e.length && (this.layoutItems(e, !0), this.reveal(e))
  }, f.prepended = function(t) {
    var e = this._itemize(t);
    if (e.length) {
      var i = this.items.slice(0);
      this.items = e.concat(i), this._resetLayout(), this._manageStamps(), this.layoutItems(e, !0), this.reveal(e), this.layoutItems(i)
    }
  }, f.reveal = function(t) {
    if (this._emitCompleteOnItems("reveal", t), t && t.length) {
      var e = this.updateStagger();
      t.forEach(function(t, i) {
        t.stagger(i * e), t.reveal()
      })
    }
  }, f.hide = function(t) {
    if (this._emitCompleteOnItems("hide", t), t && t.length) {
      var e = this.updateStagger();
      t.forEach(function(t, i) {
        t.stagger(i * e), t.hide()
      })
    }
  }, f.revealItemElements = function(t) {
    var e = this.getItems(t);
    this.reveal(e)
  }, f.hideItemElements = function(t) {
    var e = this.getItems(t);
    this.hide(e)
  }, f.getItem = function(t) {
    for (var e = 0; e < this.items.length; e++) {
      var i = this.items[e];
      if (i.element == t) return i
    }
  }, f.getItems = function(t) {
    t = n.makeArray(t);
    var e = [];
    return t.forEach(function(t) {
      var i = this.getItem(t);
      i && e.push(i)
    }, this), e
  }, f.remove = function(t) {
    var e = this.getItems(t);
    this._emitCompleteOnItems("remove", e), e && e.length && e.forEach(function(t) {
      t.remove(), n.removeFrom(this.items, t)
    }, this)
  }, f.destroy = function() {
    var t = this.element.style;
    t.height = "", t.position = "", t.width = "", this.items.forEach(function(t) {
      t.destroy()
    }), this.unbindResize();
    var e = this.element.outlayerGUID;
    delete c[e], delete this.element.outlayerGUID, u && u.removeData(this.element, this.constructor.namespace)
  }, r.data = function(t) {
    t = n.getQueryElement(t);
    var e = t && t.outlayerGUID;
    return e && c[e]
  }, r.create = function(t, e) {
    var i = s(r);
    return i.defaults = n.extend({}, r.defaults), n.extend(i.defaults, e), i.compatOptions = n.extend({}, r.compatOptions), i.namespace = t, i.data = r.data, i.Item = s(o), n.htmlInit(i, t), u && u.bridget && u.bridget(t, i), i
  };
  var m = {
    ms: 1,
    s: 1e3
  };
  return r.Item = o, r
}),
function(t, e) {
  "function" == typeof define && define.amd ? define(["outlayer/outlayer", "get-size/get-size"], e) : "object" == typeof module && module.exports ? module.exports = e(require("outlayer"), require("get-size")) : t.Masonry = e(t.Outlayer, t.getSize)
}(window, function(t, e) {
  var i = t.create("masonry");
  i.compatOptions.fitWidth = "isFitWidth";
  var n = i.prototype;
  return n._resetLayout = function() {
    this.getSize(), this._getMeasurement("columnWidth", "outerWidth"), this._getMeasurement("gutter", "outerWidth"), this.measureColumns(), this.colYs = [];
    for (var t = 0; t < this.cols; t++) this.colYs.push(0);
    this.maxY = 0, this.horizontalColIndex = 0
  }, n.measureColumns = function() {
    if (this.getContainerWidth(), !this.columnWidth) {
      var t = this.items[0],
        i = t && t.element;
      this.columnWidth = i && e(i).outerWidth || this.containerWidth
    }
    var n = this.columnWidth += this.gutter,
      o = this.containerWidth + this.gutter,
      r = o / n,
      s = n - o % n,
      a = s && 1 > s ? "round" : "floor";
    r = Math[a](r), this.cols = Math.max(r, 1)
  }, n.getContainerWidth = function() {
    var t = this._getOption("fitWidth"),
      i = t ? this.element.parentNode : this.element,
      n = e(i);
    this.containerWidth = n && n.innerWidth
  }, n._getItemLayoutPosition = function(t) {
    t.getSize();
    var e = t.size.outerWidth % this.columnWidth,
      i = e && 1 > e ? "round" : "ceil",
      n = Math[i](t.size.outerWidth / this.columnWidth);
    n = Math.min(n, this.cols);
    for (var o = this.options.horizontalOrder ? "_getHorizontalColPosition" : "_getTopColPosition", r = this[o](n, t), s = {
        x: this.columnWidth * r.col,
        y: r.y
      }, a = r.y + t.size.outerHeight, h = n + r.col, u = r.col; h > u; u++) this.colYs[u] = a;
    return s
  }, n._getTopColPosition = function(t) {
    var e = this._getTopColGroup(t),
      i = Math.min.apply(Math, e);
    return {
      col: e.indexOf(i),
      y: i
    }
  }, n._getTopColGroup = function(t) {
    if (2 > t) return this.colYs;
    for (var e = [], i = this.cols + 1 - t, n = 0; i > n; n++) e[n] = this._getColGroupY(n, t);
    return e
  }, n._getColGroupY = function(t, e) {
    if (2 > e) return this.colYs[t];
    var i = this.colYs.slice(t, t + e);
    return Math.max.apply(Math, i)
  }, n._getHorizontalColPosition = function(t, e) {
    var i = this.horizontalColIndex % this.cols,
      n = t > 1 && i + t > this.cols;
    i = n ? 0 : i;
    var o = e.size.outerWidth && e.size.outerHeight;
    return this.horizontalColIndex = o ? i + t : this.horizontalColIndex, {
      col: i,
      y: this._getColGroupY(i, t)
    }
  }, n._manageStamp = function(t) {
    var i = e(t),
      n = this._getElementOffset(t),
      o = this._getOption("originLeft"),
      r = o ? n.left : n.right,
      s = r + i.outerWidth,
      a = Math.floor(r / this.columnWidth);
    a = Math.max(0, a);
    var h = Math.floor(s / this.columnWidth);
    h -= s % this.columnWidth ? 0 : 1, h = Math.min(this.cols - 1, h);
    for (var u = this._getOption("originTop"), d = (u ? n.top : n.bottom) + i.outerHeight, l = a; h >= l; l++) this.colYs[l] = Math.max(d, this.colYs[l])
  }, n._getContainerSize = function() {
    this.maxY = Math.max.apply(Math, this.colYs);
    var t = {
      height: this.maxY
    };
    return this._getOption("fitWidth") && (t.width = this._getContainerFitWidth()), t
  }, n._getContainerFitWidth = function() {
    for (var t = 0, e = this.cols; --e && 0 === this.colYs[e];) t++;
    return (this.cols - t) * this.columnWidth - this.gutter
  }, n.needsResizeLayout = function() {
    var t = this.containerWidth;
    return this.getContainerWidth(), t != this.containerWidth
  }, i
});

//	modernizr

/*! modernizr 3.3.1 (Custom Build) | MIT *
 * https://modernizr.com/download/?-cssanimations-prefixed-setclasses !*/
! function(e, n, t) {
  function r(e, n) {
    return typeof e === n
  }

  function o() {
    var e, n, t, o, i, s, a;
    for (var f in C)
      if (C.hasOwnProperty(f)) {
        if (e = [], n = C[f], n.name && (e.push(n.name.toLowerCase()), n.options && n.options.aliases && n.options.aliases.length))
          for (t = 0; t < n.options.aliases.length; t++) e.push(n.options.aliases[t].toLowerCase());
        for (o = r(n.fn, "function") ? n.fn() : n.fn, i = 0; i < e.length; i++) s = e[i], a = s.split("."), 1 === a.length ? Modernizr[a[0]] = o : (!Modernizr[a[0]] || Modernizr[a[0]] instanceof Boolean || (Modernizr[a[0]] = new Boolean(Modernizr[a[0]])), Modernizr[a[0]][a[1]] = o), g.push((o ? "" : "no-") + a.join("-"))
      }
  }

  function i(e) {
    var n = w.className,
      t = Modernizr._config.classPrefix || "";
    if (x && (n = n.baseVal), Modernizr._config.enableJSClass) {
      var r = new RegExp("(^|\\s)" + t + "no-js(\\s|$)");
      n = n.replace(r, "$1" + t + "js$2")
    }
    Modernizr._config.enableClasses && (n += " " + t + e.join(" " + t), x ? w.className.baseVal = n : w.className = n)
  }

  function s(e) {
    return e.replace(/([a-z])-([a-z])/g, function(e, n, t) {
      return n + t.toUpperCase()
    }).replace(/^-/, "")
  }

  function a(e, n) {
    return !!~("" + e).indexOf(n)
  }

  function f() {
    return "function" != typeof n.createElement ? n.createElement(arguments[0]) : x ? n.createElementNS.call(n, "http://www.w3.org/2000/svg", arguments[0]) : n.createElement.apply(n, arguments)
  }

  function l(e, n) {
    return function() {
      return e.apply(n, arguments)
    }
  }

  function u(e, n, t) {
    var o;
    for (var i in e)
      if (e[i] in n) return t === !1 ? e[i] : (o = n[e[i]], r(o, "function") ? l(o, t || n) : o);
    return !1
  }

  function p(e) {
    return e.replace(/([A-Z])/g, function(e, n) {
      return "-" + n.toLowerCase()
    }).replace(/^ms-/, "-ms-")
  }

  function d() {
    var e = n.body;
    return e || (e = f(x ? "svg" : "body"), e.fake = !0), e
  }

  function c(e, t, r, o) {
    var i, s, a, l, u = "modernizr",
      p = f("div"),
      c = d();
    if (parseInt(r, 10))
      for (; r--;) a = f("div"), a.id = o ? o[r] : u + (r + 1), p.appendChild(a);
    return i = f("style"), i.type = "text/css", i.id = "s" + u, (c.fake ? c : p).appendChild(i), c.appendChild(p), i.styleSheet ? i.styleSheet.cssText = e : i.appendChild(n.createTextNode(e)), p.id = u, c.fake && (c.style.background = "", c.style.overflow = "hidden", l = w.style.overflow, w.style.overflow = "hidden", w.appendChild(c)), s = t(p, e), c.fake ? (c.parentNode.removeChild(c), w.style.overflow = l, w.offsetHeight) : p.parentNode.removeChild(p), !!s
  }

  function m(n, r) {
    var o = n.length;
    if ("CSS" in e && "supports" in e.CSS) {
      for (; o--;)
        if (e.CSS.supports(p(n[o]), r)) return !0;
      return !1
    }
    if ("CSSSupportsRule" in e) {
      for (var i = []; o--;) i.push("(" + p(n[o]) + ":" + r + ")");
      return i = i.join(" or "), c("@supports (" + i + ") { #modernizr { position: absolute; } }", function(e) {
        return "absolute" == getComputedStyle(e, null).position
      })
    }
    return t
  }

  function v(e, n, o, i) {
    function l() {
      p && (delete z.style, delete z.modElem)
    }
    if (i = r(i, "undefined") ? !1 : i, !r(o, "undefined")) {
      var u = m(e, o);
      if (!r(u, "undefined")) return u
    }
    for (var p, d, c, v, h, y = ["modernizr", "tspan", "samp"]; !z.style && y.length;) p = !0, z.modElem = f(y.shift()), z.style = z.modElem.style;
    for (c = e.length, d = 0; c > d; d++)
      if (v = e[d], h = z.style[v], a(v, "-") && (v = s(v)), z.style[v] !== t) {
        if (i || r(o, "undefined")) return l(), "pfx" == n ? v : !0;
        try {
          z.style[v] = o
        } catch (g) {}
        if (z.style[v] != h) return l(), "pfx" == n ? v : !0
      } return l(), !1
  }

  function h(e, n, t, o, i) {
    var s = e.charAt(0).toUpperCase() + e.slice(1),
      a = (e + " " + b.join(s + " ") + s).split(" ");
    return r(n, "string") || r(n, "undefined") ? v(a, n, o, i) : (a = (e + " " + N.join(s + " ") + s).split(" "), u(a, n, t))
  }

  function y(e, n, r) {
    return h(e, t, t, n, r)
  }
  var g = [],
    C = [],
    _ = {
      _version: "3.3.1",
      _config: {
        classPrefix: "",
        enableClasses: !0,
        enableJSClass: !0,
        usePrefixes: !0
      },
      _q: [],
      on: function(e, n) {
        var t = this;
        setTimeout(function() {
          n(t[e])
        }, 0)
      },
      addTest: function(e, n, t) {
        C.push({
          name: e,
          fn: n,
          options: t
        })
      },
      addAsyncTest: function(e) {
        C.push({
          name: null,
          fn: e
        })
      }
    },
    Modernizr = function() {};
  Modernizr.prototype = _, Modernizr = new Modernizr;
  var w = n.documentElement,
    x = "svg" === w.nodeName.toLowerCase(),
    S = "Moz O ms Webkit",
    b = _._config.usePrefixes ? S.split(" ") : [];
  _._cssomPrefixes = b;
  var E = function(n) {
    var r, o = prefixes.length,
      i = e.CSSRule;
    if ("undefined" == typeof i) return t;
    if (!n) return !1;
    if (n = n.replace(/^@/, ""), r = n.replace(/-/g, "_").toUpperCase() + "_RULE", r in i) return "@" + n;
    for (var s = 0; o > s; s++) {
      var a = prefixes[s],
        f = a.toUpperCase() + "_" + r;
      if (f in i) return "@-" + a.toLowerCase() + "-" + n
    }
    return !1
  };
  _.atRule = E;
  var N = _._config.usePrefixes ? S.toLowerCase().split(" ") : [];
  _._domPrefixes = N;
  var P = {
    elem: f("modernizr")
  };
  Modernizr._q.push(function() {
    delete P.elem
  });
  var z = {
    style: P.elem.style
  };
  Modernizr._q.unshift(function() {
    delete z.style
  }), _.testAllProps = h;
  _.prefixed = function(e, n, t) {
    return 0 === e.indexOf("@") ? E(e) : (-1 != e.indexOf("-") && (e = s(e)), n ? h(e, n, t) : h(e, "pfx"))
  };
  _.testAllProps = y, Modernizr.addTest("cssanimations", y("animationName", "a", !0)), o(), i(g), delete _.addTest, delete _.addAsyncTest;
  for (var T = 0; T < Modernizr._q.length; T++) Modernizr._q[T]();
  e.Modernizr = Modernizr
}(window, document);

function init() {

  // start up after 2sec no matter what
  window.setTimeout(function() {
    start();
  }, 500);
}

// fade in experience
function start() {
  $('body').removeClass("loading").addClass('loaded');
}