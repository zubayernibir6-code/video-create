/* act.js — acting helpers for the cast (cast.js). Everything writes into a paused GSAP timeline at explicit
 * times, so any frame can be seeked and rendered the same way every time.
 *
 * fromTo moves here use immediateRender:false: a fromTo otherwise applies its FROM pose the moment it is built, so a
 * scene's second walk or shake would show its start pose from t = 0.
 * Layers, so moves never fight over one property:
 *   actor wrapper (HTML div): position, walking, jumps, squash (transform-origin: bottom centre)
 *   .c-root:   breathing (scaleY) · whole-body tilt while talking (rotation; khata/app/calc)
 *   .c-head:   nods while talking (people) · arms/legs/face parts: gestures, steps, expressions
 *
 *   HKAct.idle(svg, tl, t0, t1)            breathing for the whole span
 *   HKAct.say(svg, tl, t, "s2-01", {arm})  lip-sync from HKLip + nods + a talking arm; returns end time
 *   HKAct.expr(svg, tl, t, "happy")        expression (remembered, so blinks reopen to the right lid)
 *   HKAct.blinks(svg, tl, t0, t1, seed)    blinks at a fixed, uneven rhythm (call after expressions)
 *   HKAct.walk(el, svg, tl, t0, t1, x0, x1) · hop · wave · point · armsUp · arms · look · shake · pop · dizzy
 */
(function () {
  var q = function (svg, s) { return Array.prototype.slice.call(svg.querySelectorAll(s)); };
  var one = function (svg, s) { return svg.querySelector(s); };
  var FPS = 30, LEAD = 0.25;

  function lids(svg) { return q(svg, ".c-face .c-lid"); }
  function sched(svg) { return (svg.__lids = svg.__lids || [[-1, HKCast.lidOf("neutral")]]); }
  function lidAt(svg, t) {
    var s = sched(svg), v = s[0][1];
    for (var i = 0; i < s.length; i++) if (s[i][0] <= t) v = s[i][1];
    return v;
  }

  window.HKAct = {
    // put a character in a scene with its FEET at (footX, footY), drawn w px wide; returns { el, svg }
    stand: function (parent, name, footX, footY, w, o) {
      o = o || {};
      var el = document.createElement("div");
      el.className = "actor " + (o.cls || "");
      parent.appendChild(el);
      var svg = HKCast.mount(el, name, o);
      var vb = svg.getAttribute("viewBox").split(" ").map(Number);
      var feet = svg.querySelector(".c-root").getAttribute("data-o").split(" ").map(Number);
      var k = w / vb[2];
      el.style.cssText = "position:absolute;left:" + (footX - feet[0] * k) + "px;top:" + (footY - feet[1] * k) + "px;width:" + w + "px;" +
        "transform-origin:" + (feet[0] * k) + "px " + (feet[1] * k) + "px;" + (o.z !== undefined ? "z-index:" + o.z + ";" : "");
      return { el: el, svg: svg };
    },
    // an HTML label (pill, card, big number) at x,y; css adds to the base style
    label: function (parent, html, x, y, css) {
      var d = document.createElement("div");
      d.className = "lbl";
      d.style.cssText = "position:absolute;left:" + x + "px;top:" + y + "px;font-family:'Hind Siliguri',sans-serif;font-weight:700;" + (css || "");
      d.innerHTML = html;
      parent.appendChild(d);
      return d;
    },
    expr: function (svg, tl, t, name) {
      HKCast.expr(svg, name, tl, t);
      sched(svg).push([t, HKCast.lidOf(name)]);
      sched(svg).sort(function (a, b) { return a[0] - b[0]; });
    },

    idle: function (svg, tl, t0, t1, amp) {
      var root = one(svg, ".c-root"), half = 1.3, n = Math.max(1, Math.floor((t1 - t0) / half));
      tl.fromTo(root, { scaleY: 1 }, { scaleY: 1 + (amp || 0.014), duration: half, ease: "sine.inOut", repeat: n - 1, yoyo: true }, t0);
      tl.to(root, { scaleY: 1, duration: 0.3, ease: "sine.out" }, t0 + n * half);
    },

    // blinks every 2.6–4.4 s (a fixed pattern from the seed); skipped while the lids are nearly shut
    blinks: function (svg, tl, t0, t1, seed) {
      var gaps = [2.9, 3.7, 2.6, 4.4, 3.1, 3.9, 2.7, 4.1];
      var i = (seed || 0) % gaps.length, t = t0 + 0.8 + ((seed || 0) % 5) * 0.31;
      while (t < t1 - 0.3) {
        var rest = lidAt(svg, t);
        if (rest < 0.8) {
          tl.to(lids(svg), { scaleY: 1, duration: 0.07, ease: "power1.in" }, t);
          tl.to(lids(svg), { scaleY: rest, duration: 0.09, ease: "power1.out" }, t + 0.07);
        }
        t += gaps[i % gaps.length]; i++;
      }
    },

    // lip-sync + body language for one line; the <audio> starts at the same t (assemble.mjs)
    say: function (svg, tl, t, id, o) {
      o = o || {};
      var L = window.HKLip && window.HKLip[id];
      if (!L) throw new Error("no lipsync for " + id);
      var m = q(svg, ".c-mouth-open"), env = L.env, k = o.open || 1;
      for (var i = 0; i < env.length; i++) {
        var v = Number(env.charAt(i)) / 9;
        tl.set(m, { scaleY: v * k }, t + i / FPS);
      }
      var end = t + env.length / FPS;
      tl.set(m, { scaleY: 0 }, end);
      // nods on the head (people) or a tilt of the whole body (khata, app, calc), once per 0.5 s of loud speech
      var head = one(svg, ".c-head"), tilt = head || one(svg, ".c-root"), amt = head ? 4 : 2.2, dir = 1;
      for (var s = LEAD; s < L.d - 0.5; s += 0.5) {
        var a = 0, n = 0;
        for (var f = Math.floor(s * FPS); f < Math.min(env.length, Math.floor((s + 0.5) * FPS)); f++) { a += Number(env.charAt(f)); n++; }
        if (n && a / n > 3.2) { tl.to(tilt, { rotation: dir * amt * (a / n / 9 + 0.4), duration: 0.25, ease: "sine.inOut" }, t + s); dir = -dir; }
      }
      tl.to(tilt, { rotation: 0, duration: 0.3, ease: "sine.out" }, end - 0.2);
      // a talking arm: lifts at the first sound, beats lightly, settles at the end
      if (o.arm !== "none") {
        var side = o.arm || "r", arm = one(svg, ".c-arm-" + side), fore = one(svg, ".c-fore-" + side);
        if (arm) {
          var sgn = side === "l" ? 1 : -1, rest = Number(arm.getAttribute("data-rest") || 0);
          var up = fore ? rest + sgn * 28 : sgn * -62;   // people lift the upper arm a little, hose arms swing up
          tl.to(arm, { rotation: up, duration: 0.35, ease: "back.out(1.6)" }, t + LEAD - 0.05);
          if (fore) tl.to(fore, { rotation: sgn * -70, duration: 0.35, ease: "back.out(1.6)" }, t + LEAD - 0.05);
          var beats = Math.floor((L.d - 0.9) / 0.7);
          for (var b = 0; b < beats; b++) tl.to(fore || arm, { rotation: (fore ? sgn * -70 : up) + sgn * (b % 2 ? 9 : -9), duration: 0.35, ease: "sine.inOut" }, t + LEAD + 0.35 + b * 0.7);
          tl.to(arm, { rotation: rest, duration: 0.4, ease: "power2.inOut" }, end - 0.25);
          if (fore) tl.to(fore, { rotation: 0, duration: 0.4, ease: "power2.inOut" }, end - 0.25);
        }
      }
      return end;
    },

    // walk the actor wrapper from x0 to x1 (px), legs and arms swinging, a little bounce per step
    walk: function (el, svg, tl, t0, t1, x0, x1, o) {
      o = o || {};
      var step = o.step || 0.36, n = Math.max(1, Math.round((t1 - t0) / step));
      var swing = o.swing || 20, ll = one(svg, ".c-leg-l"), lr = one(svg, ".c-leg-r");
      var al = one(svg, ".c-arm-l"), ar = one(svg, ".c-arm-r");
      tl.fromTo(el, { x: x0 }, { x: x1, duration: t1 - t0, ease: "none", immediateRender: false }, t0);
      tl.fromTo(el, { y: 0 }, { y: -(o.bounce || 12), duration: step / 2, ease: "sine.out", repeat: n * 2 - 1, yoyo: true, immediateRender: false }, t0);
      if (ll && lr) {
        tl.fromTo(ll, { rotation: -swing }, { rotation: swing, duration: step, ease: "sine.inOut", repeat: n - 1, yoyo: true, immediateRender: false }, t0);
        tl.fromTo(lr, { rotation: swing }, { rotation: -swing, duration: step, ease: "sine.inOut", repeat: n - 1, yoyo: true, immediateRender: false }, t0);
        tl.to([ll, lr], { rotation: 0, duration: 0.2 }, t1);
      }
      if (al && ar && !o.armsBusy) {
        var ra = Number(al.getAttribute("data-rest") || 0), rb = Number(ar.getAttribute("data-rest") || 0);
        tl.fromTo(al, { rotation: ra + swing * 0.8 }, { rotation: ra - swing * 0.8, duration: step, ease: "sine.inOut", repeat: n - 1, yoyo: true, immediateRender: false }, t0);
        tl.fromTo(ar, { rotation: rb - swing * 0.8 }, { rotation: rb + swing * 0.8, duration: step, ease: "sine.inOut", repeat: n - 1, yoyo: true, immediateRender: false }, t0);
        tl.to(al, { rotation: ra, duration: 0.25 }, t1);
        tl.to(ar, { rotation: rb, duration: 0.25 }, t1);
      }
    },

    // a hop: crouch, jump, land with a squash (on the wrapper; transform-origin bottom centre)
    hop: function (el, tl, t, h, dur, dx) {
      dur = dur || 0.6;
      tl.to(el, { scaleY: 0.86, scaleX: 1.08, duration: 0.1, ease: "power2.out" }, t);
      tl.to(el, { scaleY: 1.06, scaleX: 0.95, y: -(h || 110), x: "+=" + ((dx || 0) / 2), duration: dur / 2, ease: "power2.out" }, t + 0.1);
      tl.to(el, { scaleY: 1, scaleX: 1, y: 0, x: "+=" + ((dx || 0) / 2), duration: dur / 2, ease: "power2.in" }, t + 0.1 + dur / 2);
      tl.to(el, { scaleY: 0.9, scaleX: 1.06, duration: 0.08, ease: "power2.out" }, t + 0.1 + dur);
      tl.to(el, { scaleY: 1, scaleX: 1, duration: 0.25, ease: "back.out(2)" }, t + 0.18 + dur);
      return t + 0.43 + dur;
    },

    wave: function (svg, tl, t, side, times) {
      side = side || "r";
      var arm = one(svg, ".c-arm-" + side), fore = one(svg, ".c-fore-" + side), sgn = side === "l" ? 1 : -1;
      var rest = Number(arm.getAttribute("data-rest") || 0);
      tl.to(arm, { rotation: fore ? sgn * 150 : sgn * 150, duration: 0.3, ease: "back.out(1.7)" }, t);
      var w = fore || one(svg, ".c-arm-" + side + " .c-hand") || arm;
      for (var i = 0; i < (times || 3); i++) tl.to(w, { rotation: (fore ? 0 : 0) + sgn * (i % 2 ? 22 : -22), duration: 0.22, ease: "sine.inOut" }, t + 0.3 + i * 0.22);
      tl.to(w, { rotation: 0, duration: 0.2 }, t + 0.3 + (times || 3) * 0.22);
      tl.to(arm, { rotation: rest, duration: 0.35, ease: "power2.inOut" }, t + 0.5 + (times || 3) * 0.22);
      return t + 0.85 + (times || 3) * 0.22;
    },

    // hold an arm at an angle (deg; 0 = rest direction) for a while, then return
    point: function (svg, tl, t, side, angle, hold) {
      var arm = one(svg, ".c-arm-" + side), fore = one(svg, ".c-fore-" + side);
      var rest = Number(arm.getAttribute("data-rest") || 0);
      tl.to(arm, { rotation: angle, duration: 0.3, ease: "back.out(1.6)" }, t);
      if (fore) tl.to(fore, { rotation: 0, duration: 0.3 }, t);
      if (hold) tl.to(arm, { rotation: rest, duration: 0.35, ease: "power2.inOut" }, t + 0.3 + hold);
    },
    arms: function (svg, tl, t, l, r, dur, ease) {
      var al = one(svg, ".c-arm-l"), ar = one(svg, ".c-arm-r");
      if (l !== null && l !== undefined) tl.to(al, { rotation: l, duration: dur || 0.3, ease: ease || "back.out(1.5)" }, t);
      if (r !== null && r !== undefined) tl.to(ar, { rotation: r, duration: dur || 0.3, ease: ease || "back.out(1.5)" }, t);
    },
    rest: function (svg, tl, t, dur) {
      q(svg, ".c-arm-l, .c-arm-r").forEach(function (a) { tl.to(a, { rotation: Number(a.getAttribute("data-rest") || 0), duration: dur || 0.35, ease: "power2.inOut" }, t); });
      q(svg, ".c-fore-l, .c-fore-r").forEach(function (a) { tl.to(a, { rotation: 0, duration: dur || 0.35, ease: "power2.inOut" }, t); });
    },
    armsUp: function (svg, tl, t, hold) {
      this.arms(svg, tl, t, 140, -140, 0.25);
      if (hold) this.rest(svg, tl, t + 0.25 + hold);
    },
    look: function (svg, tl, t, dx, dy, dur) {
      tl.to(q(svg, ".c-pupil"), { x: dx || 0, y: dy || 0, duration: dur || 0.25, ease: "power2.out" }, t);
    },
    shake: function (el, tl, t, dur, amp) {
      var n = Math.max(2, Math.round(dur / 0.06));
      tl.fromTo(el, { x: -(amp || 6) }, { x: amp || 6, duration: 0.06, repeat: n - 1, yoyo: true, ease: "none", immediateRender: false }, t);
      tl.to(el, { x: 0, duration: 0.05 }, t + n * 0.06);
    },
    pop: function (el, tl, t, dur) {
      tl.fromTo(el, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: dur || 0.45, ease: "back.out(2.2)" }, t);
    },
    dizzy: function (svg, tl, t0, t1) {
      tl.set(q(svg, ".c-pupil"), { opacity: 0 }, t0);
      tl.set(q(svg, ".c-dizzy"), { opacity: 1 }, t0);
      tl.fromTo(q(svg, ".c-dizzy"), { rotation: 0 }, { rotation: 360 * Math.round((t1 - t0) / 0.6), duration: t1 - t0, ease: "none" }, t0);
      tl.set(q(svg, ".c-dizzy"), { opacity: 0 }, t1);
      tl.set(q(svg, ".c-pupil"), { opacity: 1 }, t1);
    },
    // count a <text> or element's text from a to b (Bengali digits, optional prefix/suffix, thousands comma)
    count: function (el, tl, t, a, b, dur, pre, suf) {
      var BN = "০১২৩৪৫৬৭৮৯", o = { v: a };
      var fmt = function (n) {   // Indian grouping (১২,৩৪,৫৬৭), Bengali digits
        var s = String(Math.round(n)), last3 = s.slice(-3), rest = s.slice(0, -3);
        s = rest ? rest.replace(/\B(?=(\d{2})+$)/g, ",") + "," + last3 : last3;
        return (pre || "") + s.replace(/\d/g, function (d) { return BN[d]; }) + (suf || "");
      };
      tl.fromTo(o, { v: a }, { v: b, duration: dur, ease: "power2.out", onUpdate: function () { el.textContent = fmt(o.v); } }, t);
      tl.set(el, { textContent: fmt(b) }, t + dur);
    },
  };
})();
