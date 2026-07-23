#!/usr/bin/env node

const crypto = require("node:crypto");
const fs = require("node:fs");
const readline = require("node:readline");
const zlib = require("node:zlib");

const MONTHS = new Map([
  ["Jan", 0],
  ["Feb", 1],
  ["Mar", 2],
  ["Apr", 3],
  ["May", 4],
  ["Jun", 5],
  ["Jul", 6],
  ["Aug", 7],
  ["Sep", 8],
  ["Oct", 9],
  ["Nov", 10],
  ["Dec", 11],
]);

const STATIC_EXTENSION =
  /\.(?:avif|bmp|css|eot|gif|ico|jpe?g|js|mjs|map|mp3|mp4|ogg|otf|pdf|png|svg|ttf|webm|webp|woff2?|xml)(?:$|\/)/i;
const BOT_USER_AGENT =
  /(?:bot\b|crawler|spider|slurp|bingpreview|facebookexternalhit|headlesschrome|lighthouse|pagespeed|pingdom|uptimerobot|semrush|ahrefs|mj12bot|bytespider|yandex|baiduspider|sogou|petalbot|applebot|duckduckbot)/i;
const AUTOMATION_USER_AGENT =
  /(?:^|\s)(?:curl|wget|httpie|postmanruntime|python-requests|python-urllib|go-http-client|java\/|libwww-perl|axios\/|node-fetch\/)/i;
const SCANNER_PATH =
  /(?:^|\/)(?:\.env|\.git|wp-admin|wp-login|xmlrpc\.php|phpmyadmin|adminer|vendor\/phpunit|cgi-bin|actuator|server-status|boaform|HNAP1|solr|jenkins|console\/)(?:\/|$)|(?:etc\/passwd|proc\/self\/environ)/i;
const ADMIN_PATH =
  /(?:^|\/)(?:admin[^/]*|new(?:bird)?postauth|newcreationauth|handle(?:bird)?editdecision|makefeatured|featuretohome|makepicfeatured|uploadfeature(?:art)?single|unfeature(?:home|creation)|editpagedelete(?:plant)?)(?:\/|$)/i;
const HEALTH_PATH =
  /(?:^|\/)(?:health|healthz|ready|readiness|live|liveness)(?:\/|$)/i;
const ALLOWED_METHODS = new Set([
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);

const PRODUCT_EVENT_ENDPOINTS = new Map([
  ["POST /api/uploadplant", "catalog_submission_response"],
  ["POST /api/uploadbird", "catalog_submission_response"],
  ["POST /api/uploadpic", "media_upload_response"],
  ["POST /api/uploadbirdpic", "media_upload_response"],
  ["POST /api/uploadart", "media_upload_response"],
  ["POST /api/uploadcreation", "creation_upload_response"],
  ["POST /api/updatetext", "edit_submission_response"],
  ["POST /api/birdupdatetext", "edit_submission_response"],
  ["POST /api/newpostauth", "catalog_review_response"],
  ["POST /api/newbirdpostauth", "catalog_review_response"],
  ["POST /api/newcreationauth", "creation_review_response"],
  ["PUT /api/handleeditdecision", "edit_review_response"],
  ["PUT /api/handlebirdeditdecision", "edit_review_response"],
  ["POST /api/editpagedelete", "media_delete_response"],
  ["DELETE /api/editpagedeleteplant", "catalog_delete_response"],
  ["POST /api/admintoggle", "role_change_response"],
  ["POST /api/admindeleteuser", "account_delete_response"],
  ["POST /api/syncplantinfo", "plant_detail_api_response"],
  ["POST /api/syncbirdinfo", "bird_detail_api_response"],
  ["GET /api/searchnames", "plant_index_api_response"],
  ["GET /api/searchbirdnames", "bird_index_api_response"],
  ["GET /api/catalog/names", "catalog_index_api_response"],
]);

const DEFAULTS = Object.freeze({
  burstThreshold: 120,
  duplicateSeconds: 2,
  maxActiveSignatures: 250_000,
  maxMinuteSignatures: 50_000,
  reorderHours: 24,
  sessionMinutes: 30,
  siteHost: "biphflora.com",
  knownRoutesOnly: false,
});

function increment(target, key, amount = 1) {
  target[key] = (target[key] || 0) + amount;
}

function parseTimestamp(value) {
  const match = value.match(
    /^(\d{2})\/([A-Z][a-z]{2})\/(\d{4}):(\d{2}):(\d{2}):(\d{2}) ([+-])(\d{2})(\d{2})$/,
  );
  if (!match || !MONTHS.has(match[2])) {
    return undefined;
  }

  const offsetMinutes =
    (Number(match[8]) * 60 + Number(match[9])) * (match[7] === "+" ? 1 : -1);
  const localUtc = Date.UTC(
    Number(match[3]),
    MONTHS.get(match[2]),
    Number(match[1]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6]),
  );
  const timestamp = localUtc - offsetMinutes * 60_000;
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function parseNginxLine(line) {
  const match = line.match(
    /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"([A-Z]+)\s+([^\s"]+)(?:\s+[^\"]*)?"\s+(\d{3})\s+(?:\d+|-)\s+"([^\"]*)"\s+"([^\"]*)"/,
  );
  if (!match) {
    return undefined;
  }

  const timestamp = parseTimestamp(match[2]);
  if (timestamp === undefined) {
    return undefined;
  }

  return {
    ip: match[1],
    timestamp,
    method: match[3],
    target: match[4],
    status: Number(match[5]),
    referrer: match[6],
    userAgent: match[7],
  };
}

function normalizedPath(target) {
  try {
    const parsed = new URL(target, "http://local.invalid");
    const decoded = decodeURIComponent(parsed.pathname);
    return (decoded.replace(/\/{2,}/g, "/") || "/").slice(0, 1024);
  } catch (_) {
    return undefined;
  }
}

function isPrivateAddress(ip) {
  if (ip === "::1" || ip.startsWith("127.")) {
    return true;
  }
  if (/^10\./.test(ip) || /^192\.168\./.test(ip)) {
    return true;
  }
  const private172 = ip.match(/^172\.(\d+)\./);
  if (
    private172 &&
    Number(private172[1]) >= 16 &&
    Number(private172[1]) <= 31
  ) {
    return true;
  }
  return /^(?:fc|fd)[0-9a-f]{2}:/i.test(ip) || /^fe[89ab][0-9a-f]:/i.test(ip);
}

function normalizeUserAgent(userAgent) {
  return userAgent
    .toLowerCase()
    .replace(/(\d+)(?:\.\d+){1,}/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 512);
}

function signatureFor(entry, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(entry.ip)
    .update("\0")
    .update(normalizeUserAgent(entry.userAgent))
    .digest();
}

function classifyDevice(userAgent) {
  if (/(?:ipad|tablet|kindle|silk)/i.test(userAgent)) {
    return "tablet";
  }
  if (/(?:mobile|iphone|ipod|android)/i.test(userAgent)) {
    return "mobile";
  }
  return "desktop_or_other";
}

function classifySource(referrer, siteHost) {
  if (!referrer || referrer === "-") {
    return "direct_or_unattributed";
  }
  try {
    const hostname = new URL(referrer).hostname.toLowerCase();
    if (hostname === siteHost || hostname.endsWith(`.${siteHost}`)) {
      return "self_referral";
    }
    if (
      /(?:^|\.)(?:google|bing|baidu|yahoo|duckduckgo|sogou|so)\.[a-z.]+$/.test(
        hostname,
      )
    ) {
      return "search";
    }
    if (
      /(?:^|\.)(?:facebook|instagram|linkedin|reddit|tiktok|twitter|x|wechat|weibo|youtube)\.[a-z.]+$/.test(
        hostname,
      )
    ) {
      return "social";
    }
    return "external_referral";
  } catch (_) {
    return "invalid_or_unattributed";
  }
}

function classifyRoute(pathname) {
  const path = pathname.toLowerCase().replace(/\/+$/, "") || "/";
  const apiPath = path.startsWith("/api/") ? path.slice(4) : path;

  if (path === "/" || path === "/home" || path === "/index.html") return "home";
  if (path === "/databaseplant" || path === "/glossary") return "plant_catalog";
  if (path === "/databasebird" || path === "/glossarybird")
    return "bird_catalog";
  if (path === "/search" || path.startsWith("/search/"))
    return "plant_detail_or_search";
  if (path.startsWith("/searchbird/")) return "bird_detail_or_search";
  if (path === "/creation" || path.startsWith("/video/"))
    return "creative_content";
  if (path === "/aboutus") return "about";
  if (path === "/activities") return "activities";
  if (["/upload", "/editpage", "/birdeditpage"].includes(path))
    return "contribution_ui";

  if (path.startsWith("/api/")) {
    if (/(?:searchnames|searchbirdnames|catalog\/names)/.test(apiPath))
      return "search_api";
    if (
      /(?:syncplantinfo|syncbirdinfo|numofplants|numofbirds|getpics|getdb2pic|db2alt|creationdocumentary)/.test(
        apiPath,
      )
    ) {
      return "catalog_api";
    }
    if (/(?:login|logout|refresh|register|userinfo)/.test(apiPath))
      return "auth_api";
    if (/(?:upload|updatetext|edit|decision|feature)/.test(apiPath))
      return "contribution_api";
    if (apiPath.startsWith("/telemetry/")) return "telemetry_api";
    return "other_api";
  }

  return "other_public";
}

function classifyProductEvent(entry, pathname, excludedAddresses) {
  const category = PRODUCT_EVENT_ENDPOINTS.get(
    `${entry.method} ${pathname.toLowerCase()}`,
  );
  if (
    !category ||
    entry.status < 200 ||
    entry.status >= 300 ||
    isPrivateAddress(entry.ip) ||
    excludedAddresses.has(entry.ip) ||
    !entry.userAgent ||
    entry.userAgent === "-" ||
    BOT_USER_AGENT.test(entry.userAgent) ||
    AUTOMATION_USER_AGENT.test(entry.userAgent)
  ) {
    return undefined;
  }
  return category;
}

function filterEntry(entry, excludedAddresses = new Set()) {
  const pathname = normalizedPath(entry.target);
  if (!pathname) return { reason: "invalid_target" };
  if (!ALLOWED_METHODS.has(entry.method))
    return { reason: "non_user_flow_method" };
  if (isPrivateAddress(entry.ip) || excludedAddresses.has(entry.ip)) {
    return { reason: "known_internal_address" };
  }
  if (!entry.userAgent || entry.userAgent === "-")
    return { reason: "missing_user_agent" };
  if (BOT_USER_AGENT.test(entry.userAgent)) return { reason: "recognized_bot" };
  if (AUTOMATION_USER_AGENT.test(entry.userAgent))
    return { reason: "automation_or_test_client" };
  if (
    STATIC_EXTENSION.test(pathname) ||
    pathname.startsWith("/public/") ||
    pathname.startsWith("/static/")
  ) {
    return { reason: "static_asset" };
  }
  if (pathname === "/robots.txt" || pathname.startsWith("/.well-known/")) {
    return { reason: "static_or_protocol_request" };
  }
  if (HEALTH_PATH.test(pathname)) return { reason: "health_check" };
  if (ADMIN_PATH.test(pathname)) return { reason: "administration_route" };
  if (SCANNER_PATH.test(pathname)) return { reason: "obvious_scanner" };

  return { pathname };
}

class HyperLogLog {
  constructor(precision = 12) {
    this.precision = precision;
    this.registers = new Uint8Array(1 << precision);
  }

  add(digest) {
    const hash = digest.readUInt32BE(0);
    const index = hash >>> (32 - this.precision);
    const remainder = (hash << this.precision) >>> 0;
    const rank = Math.min(Math.clz32(remainder) + 1, 32 - this.precision + 1);
    this.registers[index] = Math.max(this.registers[index], rank);
  }

  estimate() {
    const count = this.registers.length;
    const alpha = 0.7213 / (1 + 1.079 / count);
    let inverseSum = 0;
    let zeros = 0;
    for (const register of this.registers) {
      inverseSum += 2 ** -register;
      if (register === 0) zeros += 1;
    }
    let estimate = (alpha * count * count) / inverseSum;
    if (estimate <= 2.5 * count && zeros > 0) {
      estimate = count * Math.log(count / zeros);
    }
    return Math.max(0, Math.round(estimate));
  }
}

class MinHeap {
  constructor() {
    this.items = [];
  }

  push(value) {
    const items = this.items;
    items.push(value);
    let index = items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (items[parent].last <= value.last) break;
      items[index] = items[parent];
      index = parent;
    }
    items[index] = value;
  }

  peek() {
    return this.items[0];
  }

  pop() {
    const items = this.items;
    if (items.length === 0) return undefined;
    const first = items[0];
    const last = items.pop();
    if (items.length === 0) return first;
    let index = 0;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      if (left >= items.length) break;
      const child =
        right < items.length && items[right].last < items[left].last
          ? right
          : left;
      if (items[child].last >= last.last) break;
      items[index] = items[child];
      index = child;
    }
    items[index] = last;
    return first;
  }

  rebuild(states) {
    this.items = [];
    for (const [signature, state] of states) {
      this.push({ signature, last: state.last });
    }
  }
}

class TimestampHeap {
  constructor() {
    this.items = [];
  }

  push(value) {
    const items = this.items;
    items.push(value);
    let index = items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (items[parent].timestamp <= value.timestamp) break;
      items[index] = items[parent];
      index = parent;
    }
    items[index] = value;
  }

  peek() {
    return this.items[0];
  }

  pop() {
    const items = this.items;
    if (items.length === 0) return undefined;
    const first = items[0];
    const last = items.pop();
    if (items.length === 0) return first;
    let index = 0;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      if (left >= items.length) break;
      const child =
        right < items.length && items[right].timestamp < items[left].timestamp
          ? right
          : left;
      if (items[child].timestamp >= last.timestamp) break;
      items[index] = items[child];
      index = child;
    }
    items[index] = last;
    return first;
  }
}

class SessionTracker {
  constructor({ gapMs, maxActiveSignatures }) {
    this.gapMs = gapMs;
    this.maxActiveSignatures = maxActiveSignatures;
    this.active = new Map();
    this.heap = new MinHeap();
    this.sessions = 0;
    this.completed = 0;
    this.totalDurationMs = 0;
    this.totalRequests = 0;
    this.totalDocumentLoads = 0;
    this.singleDocumentSessions = 0;
    this.capacityEvictions = 0;
  }

  finalizeState(state) {
    this.completed += 1;
    this.totalDurationMs += Math.max(0, state.last - state.started);
    this.totalRequests += state.requests;
    this.totalDocumentLoads += state.documentLoads;
    if (state.documentLoads === 1) this.singleDocumentSessions += 1;
  }

  evictBefore(cutoff) {
    while (this.heap.peek() && this.heap.peek().last < cutoff) {
      const candidate = this.heap.pop();
      const state = this.active.get(candidate.signature);
      if (state && state.last === candidate.last) {
        this.active.delete(candidate.signature);
        this.finalizeState(state);
      }
    }
  }

  process(signature, timestamp, documentLoad) {
    let state = this.active.get(signature);
    let startedNewSession = false;
    if (state && timestamp - state.last > this.gapMs) {
      this.active.delete(signature);
      this.finalizeState(state);
      state = undefined;
    }

    if (!state) {
      while (this.active.size >= this.maxActiveSignatures) {
        const oldest = this.heap.pop();
        if (!oldest) break;
        const oldestState = this.active.get(oldest.signature);
        if (oldestState && oldestState.last === oldest.last) {
          this.active.delete(oldest.signature);
          this.finalizeState(oldestState);
          this.capacityEvictions += 1;
        }
      }
      state = {
        started: timestamp,
        last: timestamp,
        requests: 0,
        documentLoads: 0,
      };
      this.active.set(signature, state);
      this.sessions += 1;
      startedNewSession = true;
    }

    state.last = Math.max(state.last, timestamp);
    state.requests += 1;
    if (documentLoad) state.documentLoads += 1;
    this.heap.push({ signature, last: state.last });
    if (this.heap.items.length > this.maxActiveSignatures * 8) {
      this.heap.rebuild(this.active);
    }
    return startedNewSession;
  }

  finish() {
    for (const state of this.active.values()) this.finalizeState(state);
    this.active.clear();
    this.heap.items = [];
  }

  summary() {
    const divisor = this.completed || 1;
    return {
      sessionCandidates: this.sessions,
      averageCandidateDurationSeconds: Number(
        (this.totalDurationMs / divisor / 1000).toFixed(2),
      ),
      averageRequestsPerSessionCandidate: Number(
        (this.totalRequests / divisor).toFixed(2),
      ),
      averageDocumentLoadsPerSessionCandidate: Number(
        (this.totalDocumentLoads / divisor).toFixed(2),
      ),
      singleDocumentSessionCandidates: this.singleDocumentSessions,
      capacityEvictions: this.capacityEvictions,
    };
  }
}

function emptyDistribution(keys = []) {
  return Object.fromEntries(keys.map((key) => [key, 0]));
}

function createWindow(label, start, end, options) {
  return {
    label,
    start,
    end,
    filteredRequests: 0,
    documentLoadCandidates: 0,
    signatures: new HyperLogLog(),
    sessions: new SessionTracker({
      gapMs: options.sessionMinutes * 60_000,
      maxActiveSignatures: options.maxActiveSignatures,
    }),
    sources: emptyDistribution([
      "direct_or_unattributed",
      "self_referral",
      "search",
      "social",
      "external_referral",
      "invalid_or_unattributed",
    ]),
    devices: emptyDistribution(["desktop_or_other", "mobile", "tablet"]),
    routes: {},
    statuses: emptyDistribution(["2xx", "3xx", "4xx", "5xx"]),
  };
}

function isDocumentLoad(event) {
  return (
    (event.method === "GET" || event.method === "HEAD") &&
    event.status >= 200 &&
    event.status < 300 &&
    !event.route.endsWith("_api")
  );
}

function periodKey(timestamp, unit) {
  const iso = new Date(timestamp).toISOString();
  if (unit === "month") return iso.slice(0, 7);
  if (unit === "day") return iso.slice(0, 10);
  return iso.slice(0, 13) + ":00Z";
}

function summarizeWindow(window) {
  window.sessions.finish();
  const calendarDays = Math.max(
    1,
    Math.ceil((window.end - window.start) / 86_400_000),
  );
  const topRouteCategories = Object.entries(window.routes)
    .sort(
      (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
    )
    .slice(0, 10)
    .map(([category, filteredRequests]) => ({ category, filteredRequests }));
  const sessionCandidateMetrics = window.sessions.summary();
  return {
    timeWindow: {
      start: new Date(window.start).toISOString(),
      end: new Date(window.end).toISOString(),
    },
    filteredRequests: window.filteredRequests,
    documentLoadCandidates: window.documentLoadCandidates,
    sessionCandidateMetrics,
    estimatedVisitorSignatures: {
      value: window.signatures.estimate(),
      method:
        "HMAC-SHA-256 signature estimated with HyperLogLog (4096 registers)",
      relativeStandardError: "approximately 1.63%",
    },
    averageFilteredRequestsPerCalendarDay: Number(
      (window.filteredRequests / calendarDays).toFixed(2),
    ),
    averageDocumentLoadCandidatesPerCalendarDay: Number(
      (window.documentLoadCandidates / calendarDays).toFixed(2),
    ),
    averageSessionCandidatesPerCalendarDay: Number(
      (sessionCandidateMetrics.sessionCandidates / calendarDays).toFixed(2),
    ),
    sourceCategories: window.sources,
    deviceCategories: window.devices,
    routeCategories: window.routes,
    topRouteCategories,
    statusClasses: window.statuses,
  };
}

function openLogStream(file) {
  const input = fs.createReadStream(file);
  return file.endsWith(".gz") ? input.pipe(zlib.createGunzip()) : input;
}

async function scanFile(file) {
  const input = openLogStream(file);
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  let totalLines = 0;
  let parsedLines = 0;
  let firstTimestamp;
  let lastTimestamp;
  for await (const line of lines) {
    totalLines += 1;
    const parsed = parseNginxLine(line);
    if (!parsed) continue;
    parsedLines += 1;
    firstTimestamp =
      firstTimestamp === undefined
        ? parsed.timestamp
        : Math.min(firstTimestamp, parsed.timestamp);
    lastTimestamp =
      lastTimestamp === undefined
        ? parsed.timestamp
        : Math.max(lastTimestamp, parsed.timestamp);
  }
  return { file, totalLines, parsedLines, firstTimestamp, lastTimestamp };
}

async function* parsedEntries(file) {
  const lines = readline.createInterface({
    input: openLogStream(file),
    crlfDelay: Infinity,
  });
  for await (const line of lines) {
    const entry = parseNginxLine(line);
    if (entry) yield entry;
  }
}

async function forEachParsedEntry(files, callback) {
  const iterators = files.map((file) =>
    parsedEntries(file)[Symbol.asyncIterator](),
  );
  const heads = await Promise.all(iterators.map((iterator) => iterator.next()));

  while (true) {
    let nextIndex = -1;
    for (let index = 0; index < heads.length; index += 1) {
      if (heads[index].done) continue;
      if (
        nextIndex === -1 ||
        heads[index].value.timestamp < heads[nextIndex].value.timestamp
      ) {
        nextIndex = index;
      }
    }
    if (nextIndex === -1) return;
    await callback(heads[nextIndex].value);
    heads[nextIndex] = await iterators[nextIndex].next();
  }
}

function createMinuteBuffer(options, filters, accept) {
  let currentMinute;
  let buckets = new Map();
  const recentAcrossMinutes = new Map();
  let capacityDropped = 0;
  const duplicateWindowMs = options.duplicateSeconds * 1000;

  function flush() {
    if (currentMinute === undefined) return;
    const acceptedEvents = [];
    for (const [signatureKey, bucket] of buckets) {
      if (bucket.burst) {
        increment(filters, "anomalous_signature_minute_burst", bucket.total);
        continue;
      }
      const recent = recentAcrossMinutes.get(signatureKey)?.routes || new Map();
      let latestTimestamp = -Infinity;
      for (const event of bucket.events) {
        const routeKey = `${event.method}\0${event.pathname}`;
        const previousTimestamp = recent.get(routeKey);
        if (
          previousTimestamp !== undefined &&
          event.timestamp >= previousTimestamp &&
          event.timestamp - previousTimestamp <= duplicateWindowMs
        ) {
          increment(filters, "rapid_duplicate_refresh");
          continue;
        }
        acceptedEvents.push(event);
        recent.set(routeKey, event.timestamp);
        latestTimestamp = Math.max(latestTimestamp, event.timestamp);
      }
      if (latestTimestamp > -Infinity) {
        recentAcrossMinutes.set(signatureKey, {
          last: latestTimestamp,
          routes: recent,
        });
      }
    }
    acceptedEvents
      .sort((left, right) => left.timestamp - right.timestamp)
      .forEach(accept);
    if (capacityDropped > 0) {
      increment(filters, "minute_buffer_capacity", capacityDropped);
    }
    buckets = new Map();
    capacityDropped = 0;
  }

  return {
    add(event) {
      const minute = Math.floor(event.timestamp / 60_000) * 60_000;
      if (currentMinute === undefined) currentMinute = minute;
      if (minute !== currentMinute) {
        flush();
        currentMinute = minute;
        const cutoff = minute - duplicateWindowMs;
        for (const [signatureKey, recent] of recentAcrossMinutes) {
          if (recent.last < cutoff) recentAcrossMinutes.delete(signatureKey);
        }
      }

      let bucket = buckets.get(event.signatureKey);
      if (!bucket) {
        if (buckets.size >= options.maxMinuteSignatures) {
          capacityDropped += 1;
          return;
        }
        bucket = { total: 0, burst: false, events: [] };
        buckets.set(event.signatureKey, bucket);
      }
      bucket.total += 1;
      if (bucket.total > options.burstThreshold) {
        bucket.burst = true;
        bucket.events = [];
      } else if (!bucket.burst) {
        bucket.events.push(event);
      }
    },
    finish: flush,
  };
}

function createChronologicalBuffer(options, filters, accept) {
  const heap = new TimestampHeap();
  const reorderWindowMs = options.reorderHours * 3_600_000;
  let maxSeen = -Infinity;
  let lastEmitted = -Infinity;
  let peakEntries = 0;

  function emitNext() {
    const event = heap.pop();
    if (event.timestamp < lastEmitted) {
      increment(filters, "late_beyond_reorder_window");
    }
    accept(event);
    lastEmitted = Math.max(lastEmitted, event.timestamp);
  }

  return {
    add(event) {
      maxSeen = Math.max(maxSeen, event.timestamp);
      heap.push(event);
      peakEntries = Math.max(peakEntries, heap.items.length);
      const safeCutoff = maxSeen - reorderWindowMs;
      while (heap.peek() && heap.peek().timestamp <= safeCutoff) emitNext();
    },
    finish() {
      while (heap.peek()) emitNext();
    },
    summary() {
      return { peakEntries };
    },
  };
}

function sanitizeOptions(options = {}) {
  function positiveInteger(value, fallback) {
    return Number.isInteger(value) && value > 0 ? value : fallback;
  }
  return {
    ...DEFAULTS,
    ...options,
    burstThreshold: positiveInteger(
      options.burstThreshold,
      DEFAULTS.burstThreshold,
    ),
    duplicateSeconds: positiveInteger(
      options.duplicateSeconds,
      DEFAULTS.duplicateSeconds,
    ),
    maxActiveSignatures: positiveInteger(
      options.maxActiveSignatures,
      DEFAULTS.maxActiveSignatures,
    ),
    maxMinuteSignatures: positiveInteger(
      options.maxMinuteSignatures,
      DEFAULTS.maxMinuteSignatures,
    ),
    reorderHours: positiveInteger(options.reorderHours, DEFAULTS.reorderHours),
    sessionMinutes: positiveInteger(
      options.sessionMinutes,
      DEFAULTS.sessionMinutes,
    ),
    siteHost: String(options.siteHost || DEFAULTS.siteHost).toLowerCase(),
  };
}

async function collectTrafficMetrics({
  files,
  asOf,
  secret = crypto.randomBytes(32),
  excludedAddresses = new Set(),
  options: suppliedOptions = {},
}) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new TypeError("At least one log file is required");
  }
  const options = sanitizeOptions(suppliedOptions);
  const scans = await Promise.all(files.map(scanFile));
  const orderedScans = scans
    .filter((scan) => scan.firstTimestamp !== undefined)
    .sort((a, b) => a.firstTimestamp - b.firstTimestamp);
  if (orderedScans.length === 0)
    throw new Error("No parseable Nginx entries found");

  const observedStart = Math.min(
    ...orderedScans.map((scan) => scan.firstTimestamp),
  );
  const observedEnd = Math.max(
    ...orderedScans.map((scan) => scan.lastTimestamp),
  );
  const effectiveEnd = asOf ? new Date(asOf).getTime() : observedEnd;
  if (!Number.isFinite(effectiveEnd))
    throw new TypeError("Invalid asOf timestamp");

  const day = 86_400_000;
  const windows = [
    createWindow(
      "last_30_days",
      effectiveEnd - 30 * day,
      effectiveEnd,
      options,
    ),
    createWindow(
      "last_90_days",
      effectiveEnd - 90 * day,
      effectiveEnd,
      options,
    ),
    createWindow(
      "last_365_days",
      effectiveEnd - 365 * day,
      effectiveEnd,
      options,
    ),
    createWindow("all_retained_logs", observedStart, effectiveEnd, options),
  ];
  const filters = {};
  const successfulProductResponses = {};
  const monthlyProductResponses = new Map();
  const monthly = new Map();
  const peakDays = new Map();
  const peakHours = new Map();
  let nonChronologicalEntries = 0;
  let lastTimestamp = -Infinity;

  function accept(event) {
    if (event.timestamp < lastTimestamp) nonChronologicalEntries += 1;
    lastTimestamp = Math.max(lastTimestamp, event.timestamp);
    const documentLoad = isDocumentLoad(event);
    const month = periodKey(event.timestamp, "month");
    const dayKey = periodKey(event.timestamp, "day");
    const hourKey = periodKey(event.timestamp, "hour");
    if (!monthly.has(month))
      monthly.set(month, {
        filteredRequests: 0,
        documentLoadCandidates: 0,
        sessionCandidatesByStartMonth: 0,
      });
    const monthEntry = monthly.get(month);
    monthEntry.filteredRequests += 1;
    if (documentLoad) monthEntry.documentLoadCandidates += 1;
    peakDays.set(dayKey, (peakDays.get(dayKey) || 0) + 1);
    peakHours.set(hourKey, (peakHours.get(hourKey) || 0) + 1);

    for (const window of windows) {
      if (event.timestamp < window.start || event.timestamp > window.end)
        continue;
      window.filteredRequests += 1;
      if (documentLoad) window.documentLoadCandidates += 1;
      window.signatures.add(event.signatureDigest);
      window.sessions.evictBefore(
        Math.floor(event.timestamp / 60_000) * 60_000 -
          options.sessionMinutes * 60_000,
      );
      const startedNewSession = window.sessions.process(
        event.signatureKey,
        event.timestamp,
        documentLoad,
      );
      if (window.label === "all_retained_logs" && startedNewSession) {
        monthEntry.sessionCandidatesByStartMonth += 1;
      }
      increment(window.sources, event.source);
      increment(window.devices, event.device);
      increment(window.routes, event.route);
      increment(window.statuses, `${Math.floor(event.status / 100)}xx`);
    }
  }

  const minuteBuffer = createMinuteBuffer(options, filters, accept);
  const chronologicalBuffer = createChronologicalBuffer(
    options,
    filters,
    (event) => minuteBuffer.add(event),
  );
  await forEachParsedEntry(
    orderedScans.map((scan) => scan.file),
    async (entry) => {
      if (entry.timestamp > effectiveEnd) {
        increment(filters, "after_reporting_cutoff");
        return;
      }
      const pathname = normalizedPath(entry.target);
      const productEvent = pathname
        ? classifyProductEvent(entry, pathname, excludedAddresses)
        : undefined;
      if (productEvent) {
        increment(successfulProductResponses, productEvent);
        const month = periodKey(entry.timestamp, "month");
        if (!monthlyProductResponses.has(month)) {
          monthlyProductResponses.set(month, {});
        }
        increment(monthlyProductResponses.get(month), productEvent);
      }

      const result = filterEntry(entry, excludedAddresses);
      if (result.reason) {
        increment(filters, result.reason);
        return;
      }
      const route = classifyRoute(result.pathname);
      if (
        options.knownRoutesOnly &&
        (route === "other_public" || route === "other_api")
      ) {
        increment(filters, "unrecognized_product_route");
        return;
      }
      const signatureDigest = signatureFor(entry, secret);
      chronologicalBuffer.add({
        timestamp: entry.timestamp,
        method: entry.method,
        status: entry.status,
        pathname: result.pathname,
        signatureDigest,
        signatureKey: signatureDigest.toString("hex"),
        source: classifySource(entry.referrer, options.siteHost),
        device: classifyDevice(entry.userAgent),
        route,
      });
    },
  );
  chronologicalBuffer.finish();
  minuteBuffer.finish();

  const highest = (map) => {
    let result = { period: null, filteredRequests: 0 };
    for (const [period, count] of map) {
      if (count > result.filteredRequests)
        result = { period, filteredRequests: count };
    }
    return result;
  };

  const resultWindows = {};
  for (const window of windows)
    resultWindows[window.label] = summarizeWindow(window);
  const totalLogEntries = scans.reduce((sum, scan) => sum + scan.totalLines, 0);
  const parsedEntries = scans.reduce((sum, scan) => sum + scan.parsedLines, 0);

  return {
    schemaVersion: 1,
    collectedOn: new Date().toISOString(),
    definitions: {
      filteredRequests: options.knownRoutesOnly
        ? "Parsed requests to recognized product route categories remaining after fixed bot, scanner, health, static, admin, internal/test, burst, and rapid-duplicate exclusions."
        : "Parsed requests remaining after fixed bot, scanner, health, static, admin, internal/test, burst, and rapid-duplicate exclusions.",
      documentLoadCandidates:
        "Included successful GET/HEAD requests to non-API route categories; a conservative navigation proxy, not complete SPA pageviews.",
      sessionCandidates: `Included requests sharing an ephemeral HMAC IP + normalized user-agent signature, split after more than ${options.sessionMinutes} minutes of inactivity.`,
      estimatedVisitorSignatures:
        "Approximate distinct HMAC signatures; not verified unique visitors or people.",
      chronologicalReordering: `Included events are reordered within a ${options.reorderHours}-hour bounded window before burst, duplicate, and session calculations.`,
    },
    sourceSummary: {
      fileCount: files.length,
      totalLogEntries,
      parsedEntries,
      unparseableEntries: totalLogEntries - parsedEntries,
      addressField:
        "First field in the active Nginx combined log; proxy/client semantics must be verified from deployment configuration.",
      observedTimeRange: {
        start: new Date(observedStart).toISOString(),
        end: new Date(observedEnd).toISOString(),
      },
    },
    privacy: {
      rawIdentifiersEmitted: false,
      signatureSecret: "ephemeral or externally supplied; never emitted",
      outputCategoriesOnly: true,
    },
    filtering: {
      ...filters,
      nonChronologicalEntries,
      burstThresholdPerSignatureMinute: options.burstThreshold,
      rapidDuplicateWindowSeconds: options.duplicateSeconds,
      knownRoutesOnly: options.knownRoutesOnly,
      reorderWindowHours: options.reorderHours,
      peakReorderBufferEntries: chronologicalBuffer.summary().peakEntries,
    },
    successfulProductEndpointResponses: {
      exactDefinition:
        "2xx responses from fixed product endpoints after bot, automation, missing-UA, and known-internal exclusions; response counts are not people and can include repeated tests.",
      total: Object.values(successfulProductResponses).reduce(
        (sum, value) => sum + value,
        0,
      ),
      byFixedCategory: successfulProductResponses,
      monthly: [...monthlyProductResponses.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([month, categories]) => ({ month, categories })),
    },
    windows: resultWindows,
    monthlyTrend: [...monthly.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([month, values]) => ({ month, ...values })),
    peaks: {
      highestFilteredRequestDay: highest(peakDays),
      highestFilteredRequestHour: highest(peakHours),
    },
    unavailable: {
      verifiedUniqueVisitors: "No consented identity-backed analytics source.",
      countries: "No verified GeoIP source was used.",
      newVersusReturningVisitors:
        "Ephemeral request signatures do not establish a stable person or consented identity.",
      bounceRate:
        "Nginx requests cannot observe complete client-side SPA navigation or engagement.",
      uptime:
        "Access-log presence is not an availability monitor and cannot establish uptime.",
    },
    limitations: [
      "Results cover retained, parseable log entries only and inherit Nginx log rotation gaps.",
      options.knownRoutesOnly
        ? "Strict mode excludes unrecognized routes; this reduces scanner noise but can omit legitimate routes missing from the fixed classifier."
        : "Broad mode retains unrecognized routes and can therefore include distributed scanners not caught by the fixed filters.",
      "Direct traffic to backend/frontend ports and client-side SPA route changes may be absent.",
      "IP plus normalized user-agent HMAC signatures can merge shared devices or split one person across devices and browser changes.",
      "If a reverse proxy or CDN is present and Nginx has not restored the originating client address, session/signature metrics are edge-dependent and must be treated as low confidence.",
      "Source and device categories are user-agent/referrer classifications, not verified demographics.",
      "Each reporting window starts its own inactivity sequence, so a session crossing the window boundary can be counted as a new candidate inside that window.",
      `Entries arriving more than ${options.reorderHours} hours late cannot be fully reordered; any late_beyond_reorder_window count reduces duplicate, burst, and session confidence.`,
      "Any nonChronologicalEntries or capacityEvictions reduce session-candidate confidence.",
      "HTTP requests, document-load candidates, session candidates, signatures, and people are distinct measures.",
    ],
  };
}

function parseArguments(argv) {
  const files = [];
  const options = {};
  let asOf;
  let excludeIpFile;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--as-of") asOf = argv[++index];
    else if (argument === "--site-host") options.siteHost = argv[++index];
    else if (argument === "--burst-threshold")
      options.burstThreshold = Number(argv[++index]);
    else if (argument === "--duplicate-seconds")
      options.duplicateSeconds = Number(argv[++index]);
    else if (argument === "--max-active-signatures")
      options.maxActiveSignatures = Number(argv[++index]);
    else if (argument === "--max-minute-signatures")
      options.maxMinuteSignatures = Number(argv[++index]);
    else if (argument === "--reorder-hours")
      options.reorderHours = Number(argv[++index]);
    else if (argument === "--known-routes-only") options.knownRoutesOnly = true;
    else if (argument === "--exclude-ip-file") excludeIpFile = argv[++index];
    else if (argument.startsWith("--"))
      throw new Error(`Unknown option: ${argument}`);
    else files.push(argument);
  }
  return { files, asOf, excludeIpFile, options };
}

async function main() {
  const { files, asOf, excludeIpFile, options } = parseArguments(
    process.argv.slice(2),
  );
  if (files.length === 0) {
    throw new Error(
      "Usage: node scripts/collect-traffic-metrics.js [options] <oldest.log[.gz]> ... <newest.log>",
    );
  }
  const excludedAddresses = new Set();
  if (excludeIpFile) {
    const values = fs.readFileSync(excludeIpFile, "utf8").split(/\r?\n/);
    for (const value of values)
      if (value.trim()) excludedAddresses.add(value.trim());
  }
  const result = await collectTrafficMetrics({
    files,
    asOf,
    excludedAddresses,
    secret: process.env.TRAFFIC_METRICS_HASH_SECRET || crypto.randomBytes(32),
    options,
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  HyperLogLog,
  TimestampHeap,
  classifyDevice,
  classifyRoute,
  classifySource,
  collectTrafficMetrics,
  filterEntry,
  normalizeUserAgent,
  normalizedPath,
  parseNginxLine,
  parseTimestamp,
  signatureFor,
};
