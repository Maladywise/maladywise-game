/* Malady Wise mental health self-checks (PHQ-9, GAD-7, K10).
   Privacy: answers are read from the form in this page only. Nothing is stored
   (no localStorage, cookies or URL changes) and nothing is sent anywhere. No
   analytics events are fired from this file. */
(function () {
  "use strict";
  var form = document.getElementById("mhc-form");
  if (!form) return;
  var scale = form.getAttribute("data-scale");
  var out = document.getElementById("result");
  var msg = form.querySelector(".form-msg");

  var CRISIS =
    '<ul>' +
    '<li><b>Australia:</b> Lifeline <a href="tel:131114">13 11 14</a> (24/7, or text <a href="sms:0477131114">0477 13 11 14</a>), Suicide Call Back Service <a href="tel:1300659467">1300 659 467</a>, 13YARN <a href="tel:139276">13 92 76</a> for Aboriginal and Torres Strait Islander people. Emergency: <a href="tel:000">000</a>.</li>' +
    '<li><b>New Zealand:</b> call or text <a href="tel:1737">1737</a>. Emergency: <a href="tel:111">111</a>.</li>' +
    '<li><b>UK and Ireland:</b> Samaritans <a href="tel:116123">116 123</a>. Emergency: <a href="tel:999">999</a> (or 112).</li>' +
    '<li><b>US and Canada:</b> call or text <a href="tel:988">988</a>. Emergency: <a href="tel:911">911</a>.</li>' +
    '<li><b>Anywhere else:</b> find a free helpline at <a href="https://findahelpline.com/" rel="noopener">findahelpline.com</a>, or call your local emergency number (112 works from a mobile in many countries).</li>' +
    '<li><b>Under 25 in Australia:</b> Kids Helpline <a href="tel:1800551800">1800 55 1800</a> (24/7, ages 5 to 25).</li>' +
    '</ul>';

  function supportBox(tag) {
    return '<div class="support" role="region" aria-labelledby="sup-h-' + tag + '">' +
      '<h2 id="sup-h-' + tag + '">Support is available right now</h2>' +
      '<p>Thank you for answering honestly. You said you have had thoughts that you would be better off dead, or of hurting yourself. Many people have thoughts like these at some point, and you deserve support with them. You don’t have to be in crisis to reach out.</p>' +
      '<p><b>If you might act on these thoughts, or you don’t feel safe right now, call your emergency number or go to the nearest emergency department.</b></p>' +
      '<p>To talk to someone now, any time of day or night:</p>' + CRISIS +
      '<p>Please also tell your GP or doctor about these thoughts. It’s something they are trained to help with.</p></div>';
  }

  var S = {
    phq9: {
      n: 9, name: "PHQ-9", what: "symptoms of depression", period: "over the last 2 weeks",
      bands: [
        [0, 4, "Minimal", "Your answers suggest few or no symptoms of depression over the last 2 weeks."],
        [5, 9, "Mild", "Your answers suggest some mild symptoms of depression. These often ease with time, self-care and support. If they last more than a few weeks, get worse, or affect your work, study or relationships, see your GP."],
        [10, 14, "Moderate", "Your answers suggest moderate symptoms of depression. It’s worth booking a GP appointment to talk this through. Support such as talking therapy often helps at this level."],
        [15, 19, "Moderately severe", "Your answers suggest moderately severe symptoms of depression. Please book an appointment with your GP soon, ideally within the next week. Effective help is available."],
        [20, 27, "Severe", "Your answers suggest severe symptoms of depression. Please see your GP in the next day or two. If you can’t get an appointment, call a support line below, and if you feel unsafe, call your emergency number."]
      ]
    },
    gad7: {
      n: 7, name: "GAD-7", what: "symptoms of anxiety", period: "over the last 2 weeks",
      bands: [
        [0, 4, "Minimal", "Your answers suggest few or no symptoms of anxiety over the last 2 weeks."],
        [5, 9, "Mild", "Your answers suggest some mild symptoms of anxiety. Self-help and free online courses can help. If symptoms last, get worse, or affect your daily life, see your GP."],
        [10, 14, "Moderate", "Your answers suggest moderate symptoms of anxiety. A score of 10 or more is the level where a doctor would usually suggest a fuller check, so it’s worth booking a GP appointment."],
        [15, 21, "Severe", "Your answers suggest severe symptoms of anxiety. Please see your GP soon, ideally within the next week. Anxiety is very treatable, and you don’t have to manage this on your own."]
      ]
    },
    k10: {
      n: 10, name: "K10", what: "psychological distress", period: "in the past 4 weeks",
      bands: [
        [10, 15, "Low", "Your answers suggest a low level of psychological distress in the past 4 weeks."],
        [16, 21, "Moderate", "Your answers suggest a moderate level of psychological distress. Self-care, free online programs and talking with people you trust can help. If this lasts or affects your daily life, see your GP."],
        [22, 29, "High", "Your answers suggest a high level of psychological distress. It’s worth booking a GP appointment to talk about how you’ve been feeling and what support would help."],
        [30, 50, "Very high", "Your answers suggest a very high level of psychological distress. Please see your GP soon, ideally in the next few days. If you feel unsafe at any point, call a support line below or your emergency number."]
      ]
    }
  }[scale];
  if (!S) return;

  function val(i) {
    var r = form.querySelector('input[name="q' + i + '"]:checked');
    return r ? parseInt(r.value, 10) : null;
  }

  // PHQ-9 item 9: show support straight away when answered above 0.
  var live = document.getElementById("q9-support");
  if (scale === "phq9" && live) {
    Array.prototype.forEach.call(form.querySelectorAll('input[name="q9"]'), function (r) {
      r.addEventListener("change", function () {
        var v = val(9);
        if (v > 0) { if (!live.innerHTML) live.innerHTML = supportBox("live"); live.hidden = false; }
        else { live.hidden = true; live.innerHTML = ""; }
      });
    });
  }

  Array.prototype.forEach.call(form.querySelectorAll("fieldset.q"), function (fs) {
    fs.addEventListener("change", function () { fs.classList.remove("missing"); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var missing = [], total = 0, i, v;
    for (i = 1; i <= S.n; i++) {
      v = val(i);
      var fs = form.querySelector('fieldset[data-i="' + i + '"]');
      if (v === null) { missing.push(i); if (fs) fs.classList.add("missing"); }
      else total += v;
    }
    if (missing.length) {
      msg.textContent = "Please answer question" + (missing.length > 1 ? "s " : " ") + missing.join(", ") + " to see your result.";
      var first = form.querySelector('input[name="q' + missing[0] + '"]');
      if (first) first.focus();
      return;
    }
    msg.textContent = "";
    render(total);
  });

  form.addEventListener("reset", function () {
    out.hidden = true; out.innerHTML = ""; msg.textContent = "";
    if (live) { live.hidden = true; live.innerHTML = ""; }
    Array.prototype.forEach.call(form.querySelectorAll("fieldset.q"), function (fs) { fs.classList.remove("missing"); });
    window.scrollTo(0, form.getBoundingClientRect().top + window.pageYOffset - 20);
  });

  function render(total) {
    var band = S.bands.filter(function (b) { return total >= b[0] && total <= b[1]; })[0];
    var max = S.bands[S.bands.length - 1][1];
    var h = "";
    if (scale === "phq9" && val(9) > 0) h += supportBox("result");
    var diff = form.querySelector('input[name="diff"]:checked');
    h += '<div class="score-card"><h2 id="res-h" tabindex="-1">Your ' + S.name + ' score: ' + total + ' out of ' + max + '</h2>' +
      '<p class="score-big">' + band[2] + (scale === "k10" ? " distress" : " symptoms") + '</p>' +
      '<p>' + band[3] + '</p>' +
      (diff ? '<p>You said these problems have made daily life <b>' + diff.parentNode.textContent.trim().toLowerCase() + '</b>. How much symptoms affect your life matters as much as the score.</p>' : "") +
      '<ul class="bands" aria-label="Score ranges">' + S.bands.map(function (b) {
        var on = b === band;
        return '<li' + (on ? ' class="on" aria-current="true"' : "") + '><b>' + b[0] + "–" + b[1] + "</b><span>" + b[2] + "</span></li>";
      }).join("") + "</ul>" +
      '<p><b>This is a screening check, not a diagnosis.</b> It measures ' + S.what + ' ' + S.period + '. Only a health professional who talks with you can work out what’s going on and what would help. A low score doesn’t rule out a problem, and a high score doesn’t mean something is permanently wrong.</p></div>';
    h += '<p><a href="#next-steps">What to do next</a> is just below.</p>';
    out.innerHTML = h;
    out.hidden = false;
    var hd = document.getElementById("res-h");
    out.scrollIntoView({ block: "start" });
    if (scale === "phq9" && val(9) > 0) { var s = out.querySelector(".support h2"); if (s) { s.setAttribute("tabindex", "-1"); s.focus(); return; } }
    if (hd) hd.focus();
  }
})();
