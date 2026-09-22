(function() {
  if (window.__alfaAnalyticsInitialized) {
    return;
  }
  window.__alfaAnalyticsInitialized = true;

  var googleAdsLeadConversionId = "AW-10860340363/2HJKCNGu3N8cEIvJzroo";
  var googleAdsWhatsAppConversionId = "AW-10860340363/DZ1cCM7ez-QcEIvJzroo";
  var googleAdsDirectionsConversionId = "AW-10860340363/pmXkCNC-xOQcEIvJzroo";

  window.__alfaRecentEvents = window.__alfaRecentEvents || {};
  window.__alfaRecentElements = window.__alfaRecentElements || new WeakMap();
  window.__alfaTrackedForms = window.__alfaTrackedForms || new WeakMap();
  window.__alfaHalfPageTracked = window.__alfaHalfPageTracked || {};

  function cleanText(text) {
    return (text || "").trim().replace(/\s+/g, " ");
  }

  function currentPagePayload() {
    return {
      page_path: window.location.pathname,
      page_location: window.location.href,
      page_title: document.title
    };
  }

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "metro-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  function storageGet(storage, key) {
    try {
      return storage.getItem(key);
    } catch (error) {
      return "";
    }
  }

  function storageSet(storage, key, value) {
    try {
      storage.setItem(key, value);
    } catch (error) {
      // Storage can be blocked by privacy settings; tracking still works without persistence.
    }
  }

  function persistentId(storage, key) {
    var value = storageGet(storage, key);
    if (value) return value;
    value = uuid();
    storageSet(storage, key, value);
    return value;
  }

  function queryValue(names) {
    var params = new URLSearchParams(window.location.search);
    for (var i = 0; i < names.length; i += 1) {
      var value = params.get(names[i]);
      if (value) return value;
    }
    return "";
  }

  function deviceType() {
    var width = window.innerWidth || document.documentElement.clientWidth || 0;
    var ua = navigator.userAgent || "";
    if (/ipad|tablet/i.test(ua) || (width >= 768 && width <= 1024 && /mobile/i.test(ua))) return "tablet";
    if (/mobile|android|iphone|ipod/i.test(ua) || width < 768) return "mobile";
    return "desktop";
  }

  function platformFromAttribution(payload) {
    var source = String(payload.utm_source || "").toLowerCase();
    var referrer = String(payload.referrer || "").toLowerCase();
    var clickId = String(payload.platform_click_id || "").toLowerCase();
    if (clickId.indexOf("fbclid=") === 0 || source.indexOf("facebook") >= 0 || referrer.indexOf("facebook") >= 0) return "Facebook";
    if (clickId.indexOf("ttclid=") === 0 || source.indexOf("tiktok") >= 0 || referrer.indexOf("tiktok") >= 0) return "TikTok";
    if (clickId.indexOf("gclid=") === 0 || clickId.indexOf("gbraid=") === 0 || clickId.indexOf("wbraid=") === 0 || source.indexOf("google") >= 0 || referrer.indexOf("google") >= 0) return "Google";
    if (clickId.indexOf("msclkid=") === 0 || source.indexOf("bing") >= 0 || referrer.indexOf("bing") >= 0) return "Bing";
    if (source.indexOf("whatsapp") >= 0 || referrer.indexOf("whatsapp") >= 0) return "WhatsApp";
    if (!source && !referrer) return "Direct";
    return payload.platform || "";
  }

  function attributionPayload() {
    var platformClickId =
      queryValue(["gclid"]) ? "gclid=" + queryValue(["gclid"]) :
      queryValue(["fbclid"]) ? "fbclid=" + queryValue(["fbclid"]) :
      queryValue(["ttclid"]) ? "ttclid=" + queryValue(["ttclid"]) :
      queryValue(["msclkid"]) ? "msclkid=" + queryValue(["msclkid"]) :
      queryValue(["wbraid"]) ? "wbraid=" + queryValue(["wbraid"]) :
      queryValue(["gbraid"]) ? "gbraid=" + queryValue(["gbraid"]) :
      "";
    var payload = {
      visitor_id: persistentId(window.localStorage, "alfa_visitor_id"),
      session_id: persistentId(window.sessionStorage, "alfa_session_id"),
      event_time: new Date().toISOString(),
      referrer: document.referrer || "",
      utm_source: queryValue(["utm_source"]),
      utm_medium: queryValue(["utm_medium"]),
      utm_campaign: queryValue(["utm_campaign"]),
      utm_content: queryValue(["utm_content"]),
      utm_term: queryValue(["utm_term"]),
      platform_click_id: platformClickId,
      device_type: deviceType(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      user_agent: navigator.userAgent || ""
    };
    payload.platform = platformFromAttribution(payload);
    return payload;
  }

  function recentlyTrackedElement(element, lockMs) {
    if (!element) return false;
    var now = Date.now();
    var trackedAt = window.__alfaRecentElements.get(element) || 0;
    if (now - trackedAt < lockMs) return true;
    window.__alfaRecentElements.set(element, now);
    return false;
  }

  function normalizedEventKey(payload) {
    return [
      payload.event || "",
      payload.link_url || "",
      payload.form_id || "",
      payload.page_path || ""
    ].join("|").toLowerCase();
  }

  window.alfaTrack = function(eventName, eventParams) {
    if (!eventName) return;
    var payload = Object.assign({ event: eventName }, currentPagePayload(), attributionPayload(), eventParams || {});
    var eventKey = normalizedEventKey(payload);
    var now = Date.now();

    if (window.__alfaRecentEvents[eventKey] && now - window.__alfaRecentEvents[eventKey] < 5000) {
      return;
    }
    window.__alfaRecentEvents[eventKey] = now;

    if (window.console && typeof window.console.info === "function") {
      window.console.info("[Metro Pinjaman Berlesen tracking]", eventName, payload);
    }

    sendVisitorEvent(payload);

    if (window.posthog && typeof window.posthog.capture === "function") {
      var posthogPayload = Object.assign({}, payload);
      delete posthogPayload.event;
      window.posthog.capture(eventName, posthogPayload);
    }

    if (eventName === "lead_form_submit" && typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: googleAdsLeadConversionId,
        value: 1.0,
        currency: "MYR",
        transaction_id: payload.booking_id || ""
      });
    }

    if (eventName === "whatsapp_click" && typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: googleAdsWhatsAppConversionId,
        value: 1.0,
        currency: "MYR"
      });
    }

    if (eventName === "location_click" && typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: googleAdsDirectionsConversionId,
        value: 1.0,
        currency: "MYR"
      });
    }

  };

  function sendVisitorEvent(payload) {
    if (["localhost", "127.0.0.1"].indexOf(window.location.hostname) >= 0) return;

    var body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      var blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/events", blob)) return;
    }

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
      keepalive: true
    }).catch(function() {});
  }

  function elementUrl(element) {
    if (!element) return "";
    if (element.matches("a[href]")) return element.getAttribute("href") || "";
    var attrs = Array.prototype.map.call(element.attributes || [], function(attr) {
      return attr.value;
    }).join(" ");
    var match = attrs.match(/(?:https?:\/\/|whatsapp:\/\/|waze:\/\/)[^\s'")]+/i);
    return match ? match[0] : "";
  }

  function eventNameForUrl(url) {
    if (/wa\.me|api\.whatsapp\.com|web\.whatsapp\.com|whatsapp:\/\//i.test(url)) return "whatsapp_click";
    if (/google\.com\/maps|maps\.google\.com|goo\.gl\/maps|maps\.app\.goo\.gl/i.test(url)) return "google_maps_click";
    if (/waze\.com|ul\.waze\.com|waze:\/\//i.test(url)) return "waze_click";
    return "";
  }

  function ctaType(target, url) {
    var text = cleanText(target.textContent || target.getAttribute("aria-label") || "");
    if (/apply|application/i.test(text)) return "application";
    if (/rate|loan|learn|view all/i.test(text)) return "loan_interest";
    if (/contact|get in touch|submit|book/i.test(text)) return "contact";
    if (url && url !== "#") return "link";
    return "";
  }

  function pathFromUrl(url) {
    if (!url || /^(?:mailto:|tel:|javascript:|#)/i.test(url)) return "";
    try {
      return new URL(url, window.location.href).pathname.toLowerCase();
    } catch (error) {
      return String(url).toLowerCase().split(/[?#]/)[0];
    }
  }

  function trackedClickEvent(target, url) {
    var id = String(target.id || "").toLowerCase();
    var text = cleanText(target.textContent || target.getAttribute("aria-label") || "").toLowerCase();
    var path = pathFromUrl(url);

    if (/wa\.me|api\.whatsapp\.com|web\.whatsapp\.com|whatsapp:\/\//i.test(url)) return "whatsapp_click";
    if (/^(?:mailto:|tel:)/i.test(url)) return "contact_click";
    if (
      /google\.com\/maps|maps\.google\.com|goo\.gl\/maps|maps\.app\.goo\.gl|waze\.com|ul\.waze\.com|waze:\/\//i.test(url) ||
      /(?:location|maps|waze)/i.test(id)
    ) return "location_click";
    if (
      /^contact-faq-\d+-question$/.test(id) ||
      (target.querySelector && target.querySelector("[id^='contact-faq-'][id$='-question']"))
    ) return "faq_click";
    if (/apply-now|apply-label/.test(id) || /\bapply now\b|\bmohon sekarang\b|立即申请/.test(text)) return "apply_now_click";
    if (/how-to-apply|how_to_apply/.test(path) || /nav-how-to-apply/.test(id)) return "how_to_apply_click";
    if (/contact(?:\.html)?$/.test(path) || /nav-contact-us/.test(id)) return "contact_us_click";
    if (/loan(?:\.html)?$/.test(path) || /nav-loan/.test(id)) return "loan_click";
    if (/about-us|about_us/.test(path) || /nav-about-us/.test(id)) return "about_us_click";
    return "";
  }

  function initPageViewTracking() {
    window.alfaTrack("page_view");
  }

  function initHalfPageTracking() {
    if (typeof window.addEventListener !== "function") return;

    function checkHalfPage() {
      var pagePath = window.location.pathname || "/";
      if (window.__alfaHalfPageTracked[pagePath]) return;

      var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      var pageHeight = Math.max(
        document.documentElement.scrollHeight || 0,
        document.body && document.body.scrollHeight || 0
      );
      var scrollableHeight = Math.max(pageHeight - viewportHeight, 1);
      var scrollPercent = Math.min(100, Math.round((scrollTop / scrollableHeight) * 100));

      if (scrollPercent < 50) return;
      window.__alfaHalfPageTracked[pagePath] = true;
      window.alfaTrack("scroll_half_page", {
        scroll_percent: scrollPercent
      });
      window.removeEventListener("scroll", checkHalfPage);
    }

    window.addEventListener("scroll", checkHalfPage, { passive: true });
    checkHalfPage();
  }

  function initConditionalClickTracking() {
    document.addEventListener("click", function(event) {
      var target = event.target.closest("a[href], button, [role='link'], [role='button']");
      if (!target) return;

      var url = elementUrl(target);
      var eventName = trackedClickEvent(target, url) || eventNameForUrl(url);
      if (recentlyTrackedElement(target, 5000)) return;
      var text = cleanText(target.textContent || target.getAttribute("aria-label") || "");

      if (eventName) {
        window.alfaTrack(eventName, {
          link_url: url,
          link_text: text,
          click_target_id: target.id || ""
        });
        return;
      }

      var type = ctaType(target, url);
      if (!type) return;

      window.alfaTrack("cta_click", {
        cta_text: text,
        cta_url: url,
        cta_type: type,
        link_url: url,
        link_text: text
      });
    });
  }

  function formName(form) {
    if (form.querySelector("[value='Personal Loan'], [name='loan-type']")) return "Loan application form";
    if (form.querySelector("input[type='date'], select")) return "Contact appointment booking";
    return cleanText(form.getAttribute("aria-label") || form.id || "Website form");
  }

  function formId(form) {
    if (form.querySelector("input[type='date'], select")) return "contact_booking";
    if (form.querySelector("[name='loan-type']")) return "how_to_apply_form";
    return form.id || "website_form";
  }

  function initFormTracking() {
    document.addEventListener("focusin", function(event) {
      var form = event.target.closest && event.target.closest("form");
      if (!form || window.__alfaTrackedForms.get(form)) return;
      window.__alfaTrackedForms.set(form, true);
      window.alfaTrack("form_start", {
        form_id: formId(form),
        form_name: formName(form)
      });
    });

    document.addEventListener("change", function(event) {
      var target = event.target;
      if (!target || !target.matches || !target.matches("select")) return;
      var selected = target.options && target.selectedIndex >= 0 ? target.options[target.selectedIndex].text : target.value;
      if (!/loan/i.test(target.name || target.closest("div")?.previousElementSibling?.textContent || "") && !/Personal Loan|Business Loan|Home Loan|Auto Loan/i.test(selected || "")) return;
      window.alfaTrack("loan_type_select", {
        form_id: formId(target.closest("form") || document.createElement("form")),
        loan_type: selected
      });
    });
  }

  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value);
    }

    return new Promise(function(resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-1000px";
      textarea.style.left = "-1000px";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand("copy");
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  function initCopyButtons() {
    document.addEventListener("click", function(event) {
      var button = event.target.closest("[data-copy-value]");
      if (!button) return;

      var value = button.getAttribute("data-copy-value") || "";
      if (!value) return;

      var originalText = button.getAttribute("data-copy-original") || button.textContent || "⧉";
      window.clearTimeout(button.__alfaCopyTimer);
      button.setAttribute("data-copy-original", originalText);
      button.textContent = "✓";
      button.setAttribute("aria-label", "Copied");
      button.setAttribute("title", "Copied");

      copyText(value).catch(function() {});

      button.__alfaCopyTimer = window.setTimeout(function() {
        button.textContent = originalText;
        button.setAttribute("aria-label", "Copy phone number");
        button.setAttribute("title", "Copy phone number");
      }, 1800);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      initPageViewTracking();
      initHalfPageTracking();
      initConditionalClickTracking();
      initFormTracking();
      initCopyButtons();
    });
  } else {
    initPageViewTracking();
    initHalfPageTracking();
    initConditionalClickTracking();
    initFormTracking();
    initCopyButtons();
  }
})();
