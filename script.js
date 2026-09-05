/**
 * Mohamed Irfan (Rizirfan) Portfolio - Interaction Layer
 * Light editorial theme: reveals on scroll, a pinned story scene scrubbed by
 * scroll progress, kinetic step text, a custom cursor, case-card tilt, and a
 * pan/zoom lightbox. Everything degrades gracefully: no JS means a fully
 * readable, static page, and reduced-motion users get a static layout.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer =
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(hover: none)').matches;

  var clamp = function (v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  };

  var smooth = function (v) {
    return v * v * (3 - 2 * v);
  };

  var easeIn = function (v) {
    return 1 - Math.pow(1 - v, 3);
  };

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /* ======================================================================
     Hero headline: split into word spans, then animate in with a stagger.
     ====================================================================== */
  function splitHeroTitle() {
    var title = document.querySelector('.hero-title');
    if (!title) return;

    var words = title.textContent.trim().split(/\s+/);
    title.innerHTML = words
      .map(function (w, i) {
        return '<span class="hti" style="--hti-d:' + (110 + i * 38) + 'ms">' + w + '</span>';
      })
      .join(' ');

    title.classList.add('pre-shift');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        title.classList.add('is-in');
      });
    });
  }

  /* ======================================================================
     Reveals: fade-and-rise elements into view once, on intersect.
     ====================================================================== */
  function setupReveals() {
    var els = $$('.reveal');

    els.forEach(function (el) {
      el.classList.add('pre-reveal');
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        el.classList.remove('pre-reveal');
        el.classList.add('is-visible');
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          io.unobserve(el);
          el.classList.remove('pre-reveal');
          el.classList.add('is-visible');
          setTimeout(function () {
            el.classList.remove('reveal');
          }, 1000);
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' }
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ======================================================================
     Story section: pinned stage + scrubbed frames + parading steps.
     Only engaged on fine-pointer desktop viewports without reduced motion.
     ====================================================================== */
  function setupStory() {
    var section = document.getElementById('approach');
    if (!section) return;

    var track = $('.story-track', section);
    var stepsBox = $('.story-steps', section);
    var textStage = $('.story-text-stage', section);
    var stepEls = $$('.story-step', section);
    var dots = $$('.story-progress li', section);
    var scene = $('#storyScene');
    var plate = scene ? $('#scPlate', scene) : null;
    var frames = scene ? $$('.sc-frame', scene) : [];
    var navH = function () {
      return (document.querySelector('.site-nav') || { offsetHeight: 76 }).offsetHeight;
    };

    var engaged = !reduceMotion && window.innerWidth > 900;

    if (!engaged) {
      stepEls.forEach(function (el) { el.classList.add('is-active'); });
      return;
    }

    /* Geometry for the text-stage parade, refreshed on resize. */
    var midP = [0.17, 0.51, 0.84];
    var targets = [];
    var boxHeight = 0;

    function measure() {
      boxHeight = stepsBox.clientHeight;
      targets = stepEls.map(function (el) {
        return (boxHeight - el.offsetHeight) / 2 - el.offsetTop;
      });
    }

    function piecewise(p, xs, ys) {
      if (p <= xs[0]) return ys[0];
      if (p >= xs[xs.length - 1]) return ys[ys.length - 1];
      for (var i = 0; i < xs.length - 1; i++) {
        if (p <= xs[i + 1]) {
          var f = (p - xs[i]) / (xs[i + 1] - xs[i]);
          return ys[i] + (ys[i + 1] - ys[i]) * f;
        }
      }
      return ys[ys.length - 1];
    }

    function progressOf() {
      var rect = track.getBoundingClientRect();
      var winH = window.innerHeight;
      var runway = rect.height - (winH - navH());
      if (runway <= 0) return 1;
      var p = (navH() - rect.top) / runway;
      return clamp(p, 0, 1);
    }

    function applyFrame(f, p) {
      var t0 = parseFloat(f.getAttribute('data-t0'));
      var t1 = parseFloat(f.getAttribute('data-t1'));
      var o =
        smooth(clamp((p - t0) / 0.05, 0, 1)) *
        (1 - smooth(clamp((p - (t1 - 0.05)) / 0.05, 0, 1)));
      f.style.opacity = String(o);
      f.style.transform = 'translate3d(0, ' + (1 - o) * 14 + 'px, 0)';
      f.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    }

    function render(p) {
      /* Frames */
      frames.forEach(function (f) {
        applyFrame(f, p);
      });
      if (plate) {
        var po = smooth(clamp(p / 0.08, 0, 1));
        plate.style.opacity = String(po);
        plate.style.visibility = po < 0.01 ? 'hidden' : 'visible';
      }

      /* Stage button / progress / step activation */
      var stepIndex = p >= 0.68 ? 2 : p >= 0.34 ? 1 : 0;

      section.setAttribute('data-active', String(stepIndex));
      stepEls.forEach(function (el, i) {
        el.classList.toggle('is-active', i === stepIndex);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === stepIndex);
        var prog = 0;
        if (i === stepIndex) {
          prog = stepIndex === 0 ? clamp(p / 0.34, 0, 1)
            : stepIndex === 1 ? clamp((p - 0.34) / 0.34, 0, 1)
            : clamp((p - 0.68) / 0.32, 0, 1);
        }
        dot.style.setProperty('--prog', prog.toFixed(3));
      });

      /* Parade */
      if (targets.length) {
        textStage.style.transform =
          'translate3d(0, ' + piecewise(p, midP, targets) + 'px, 0)';
      }
    }

    var ticking = false;
    var lastP = -1;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var p = progressOf();
        render(p);
        lastP = p;
        ticking = false;
      });
    }

    dots.forEach(function (dot) {
      var btn = $('.story-progress-num', dot);
      if (!btn) return;
      btn.addEventListener('click', function () {
        var i = Number(dot.getAttribute('data-dot'));
        var p = midP[i];
        var rect = track.getBoundingClientRect();
        var winH = window.innerHeight;
        var top = rect.top + window.scrollY;
        var target = top + p * (rect.height - (winH - navH())) - navH();
        var behavior = reduceMotion ? 'auto' : 'smooth';
        window.scrollTo({ top: Math.max(0, target), behavior: behavior });
      });
    });

    measure();
    render(lastP >= 0 ? lastP : 0);
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      measure();
      onScroll();
    });
  }

  /* ======================================================================
     Kinetic lead-in text: stagger per-letter reveal on activation.
     ====================================================================== */
  function setupLeadIns() {
    $$('.story-lead-in').forEach(function (lead) {
      $$('.kti', lead).forEach(function (k, i) {
        k.style.setProperty('--kti-d', 60 + i * 32 + 'ms');
      });
    });
  }

  /* ======================================================================
     Nav elevation state once the page scrolls.
     ====================================================================== */
  function setupNav() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ======================================================================
     Case thumbnail pointer tilt.
     ====================================================================== */
  function setupTilt() {
    if (reduceMotion || !finePointer) return;
    $$('.case-thumb').forEach(function (thumb) {
      thumb.addEventListener('pointermove', function (e) {
        var r = thumb.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        thumb.style.setProperty('--rx', (py * -7).toFixed(2) + 'deg');
        thumb.style.setProperty('--ry', (px * 8).toFixed(2) + 'deg');
      });
      thumb.addEventListener('pointerleave', function () {
        thumb.style.setProperty('--rx', '0deg');
        thumb.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ======================================================================
     Custom cursor: instant dot + eased ring. Light/dark aware.
     ====================================================================== */
  function setupCursor() {
    if (reduceMotion || !finePointer) return;

    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    var tx = -100,
      ty = -100,
      rx = -100,
      ry = -100,
      shown = false;

    document.addEventListener(
      'pointermove',
      function (e) {
        tx = e.clientX;
        ty = e.clientY;
        if (!shown) {
          rx = tx;
          ry = ty;
          shown = true;
          place(dot, tx, ty, 6);
          place(ring, rx, ry, 34);
        }
        var t = e.target.closest
          ? e.target.closest('a, button, [data-cursor], .about-media')
          : null;
        ring.classList.toggle('is-hover', !!t);
        var zone = e.target.closest ? e.target.closest('[data-cursor]') : null;
        var isLight = zone && zone.getAttribute('data-cursor') === 'light';
        dot.classList.toggle('is-light', isLight);
        ring.classList.toggle('is-light', isLight);
      },
      { passive: true }
    );

    function place(el, x, y, size) {
      el.style.transform =
        'translate3d(' + (x - size / 2) + 'px, ' + (y - size / 2) + 'px, 0)';
    }

    (function loop() {
      rx += (tx - rx) * 0.2;
      ry += (ty - ry) * 0.2;
      if (shown) {
        place(dot, tx, ty, 6);
        var ringSize = ring.classList.contains('is-hover') ? 52 : 34;
        place(ring, rx, ry, ringSize);
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ======================================================================
     Lightbox: pan / zoom image preview for [data-zoom] links.
     ====================================================================== */
  function setupLightbox() {
    if (!('PointerEvent' in window)) return;

    var links = $$('a[data-zoom]');
    if (!links.length) return;

    var box = null;
    var img = null;
    var caption = null;
    var closeBtn = null;
    var scale = 1;
    var tx = 0,
      ty = 0;
    var dragging = false;
    var dragStartX = 0,
      dragStartY = 0,
      dragBaseX = 0,
      dragBaseY = 0;
    var lastFocus = null;

    function build() {
      box = document.createElement('div');
      box.className = 'ah-lightbox';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.setAttribute('aria-label', 'Image preview');
      box.tabIndex = -1;

      closeBtn = document.createElement('button');
      closeBtn.className = 'ah-lightbox-close';
      closeBtn.setAttribute('aria-label', 'Close preview');
      closeBtn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
      box.appendChild(closeBtn);

      var figure = document.createElement('figure');
      figure.className = 'ah-lightbox-figure';
      img = document.createElement('img');
      img.alt = '';
      figure.appendChild(img);
      caption = document.createElement('figcaption');
      caption.className = 'ah-lightbox-caption';
      figure.appendChild(caption);
      box.appendChild(figure);

      var hint = document.createElement('p');
      hint.className = 'ah-lightbox-hint';
      hint.textContent = 'Scroll to zoom · Drag to pan · Esc to close';
      box.appendChild(hint);

      document.body.appendChild(box);

      closeBtn.addEventListener('click', close);
      box.addEventListener('click', function (e) {
        if (e.target === box) close();
      });
      document.addEventListener('keydown', function (e) {
        if (box.classList.contains('is-open') && e.key === 'Escape') close();
      });

      box.addEventListener('wheel', onWheel, { passive: false });
      img.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      document.addEventListener('dblclick', onDoubleClick);
    }

    function open(link) {
      if (!box) build();

      lastFocus = document.activeElement;
      var src = link.getAttribute('href');
      var alt = link.getAttribute('data-zoom-alt') || '';
      caption.textContent = link.getAttribute('data-zoom-caption') || '';
      caption.style.display = caption.textContent ? 'grid' : 'grid';

      resetView();
      img.style.opacity = '0';
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';

      var preload = new Image();
      preload.onload = function () {
        img.src = preload.src;
        img.alt = alt;
        img.style.opacity = '1';
      };
      preload.src = src;

      requestAnimationFrame(function () {
        closeBtn.focus();
      });
    }

    function resetView() {
      scale = 1;
      tx = 0;
      ty = 0;
      if (img) {
        img.style.transform = 'translate(0px, 0px) scale(1)';
        img.style.transition = 'opacity 0.3s ease';
      }
    }

    function apply() {
      var halfW = (img.clientWidth * scale) / 2;
      var halfH = (img.clientHeight * scale) / 2;
      tx = clamp(tx, -halfW, halfW);
      ty = clamp(ty, -halfH, halfH);
      img.style.transform =
        'translate(' + tx + 'px, ' + ty + 'px) scale(' + scale + ')';
    }

    function onWheel(e) {
      e.preventDefault();
      var rect = box.getBoundingClientRect();
      var mx = e.clientX - rect.left - rect.width / 2;
      var my = e.clientY - rect.top - rect.height / 2;
      var k = Math.exp(-e.deltaY * 0.0012);
      var ns = clamp(scale * k, 1, 6);
      if (ns === scale) return;
      tx = mx - (mx / scale) * ns;
      ty = my - (my / scale) * ns;
      scale = ns;
      img.style.transition = 'none';
      apply();
    }

    function onPointerDown(e) {
      if (!box.classList.contains('is-open')) return;
      dragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragBaseX = tx;
      dragBaseY = ty;
      img.classList.add('is-dragging');
      img.style.transition = 'none';
      img.setPointerCapture && img.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e) {
      if (!dragging || !box || !box.classList.contains('is-open')) return;
      tx = dragBaseX + (e.clientX - dragStartX);
      ty = dragBaseY + (e.clientY - dragStartY);
      apply();
    }

    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      img.classList.remove('is-dragging');
    }

    function onDoubleClick() {
      if (!box.classList.contains('is-open')) return;
      if (scale > 1) {
        resetView();
      } else {
        scale = 2;
        img.style.transition = 'none';
        apply();
      }
    }

    function close() {
      if (!box) return;
      box.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        open(link);
      });
    });
  }

  /* ======================================================================
     Generic smooth-scroll for in-page anchors (styling handles offset).
     Native CSS scroll-behavior covers the rest.
     ====================================================================== */
  function setupAnchors() {
    if (!('scrollBehavior' in document.documentElement.style)) {
      $$('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var id = a.getAttribute('href');
          if (id.length < 2) return;
          var target = document.querySelector(id);
          if (!target) return;
          e.preventDefault();
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        });
      });
    }
  }

  /* ====================================================================== */
  onReady(function () {
    splitHeroTitle();
    setupReveals();
    setupLeadIns();
    setupStory();
    setupNav();
    setupTilt();
    setupCursor();
    setupLightbox();
    setupAnchors();
  });
})();