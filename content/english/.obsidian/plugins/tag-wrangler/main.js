var ot = Object.defineProperty;
var gn = Object.getOwnPropertyDescriptor;
var yn = Object.getOwnPropertyNames;
var bn = Object.prototype.hasOwnProperty;
var wn = (n, e, t) =>
  e in n
    ? ot(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t })
    : (n[e] = t);
var vs = (n, e) => {
    for (var t in e) ot(n, t, { get: e[t], enumerable: !0 });
  },
  Sn = (n, e, t, s) => {
    if ((e && typeof e == "object") || typeof e == "function")
      for (let i of yn(e))
        !bn.call(n, i) &&
          i !== t &&
          ot(n, i, {
            get: () => e[i],
            enumerable: !(s = gn(e, i)) || s.enumerable,
          });
    return n;
  };
var kn = (n) => Sn(ot({}, "__esModule", { value: !0 }), n);
var be = (n, e, t) => (wn(n, typeof e != "symbol" ? e + "" : e, t), t);
var pi = {};
vs(pi, { default: () => Ut });
module.exports = kn(pi);
var M = require("obsidian");
function at() {
  let n,
    e,
    t = new Promise((s, i) => {
      (n = s), (e = i);
    });
  return { resolve: n, reject: e, promise: t };
}
function Es(n, e) {
  let t = Object.keys(e).map((s) => vn(n, s, e[s]));
  return t.length === 1
    ? t[0]
    : function () {
        t.forEach((s) => s());
      };
}
function vn(n, e, t) {
  let s = n[e],
    i = n.hasOwnProperty(e),
    r = t(s);
  return (
    s && Object.setPrototypeOf(r, s), Object.setPrototypeOf(o, r), (n[e] = o), a
  );
  function o(...l) {
    return r === s && n[e] === o && a(), r.apply(this, l);
  }
  function a() {
    n[e] === o && (i ? (n[e] = s) : delete n[e]),
      r !== s && ((r = s), Object.setPrototypeOf(o, s || Function));
  }
}
var lt;
((n) => Object.assign(n, require("obsidian")))(lt || (lt = {}));
var ce = class extends lt.Modal {
  constructor() {
    super(app);
    this.buttonContainerEl = this.modalEl.createDiv("modal-button-container");
    this.textContentEl = this.contentEl.createDiv("dialog-text");
    this.okButton = this.buttonContainerEl.createEl(
      "button",
      { cls: "mod-cta", text: i18next.t("dialogue.button-continue") },
      (t) => {
        t.addEventListener("click", async (s) => {
          var i;
          (await ((i = this.onOK) == null ? void 0 : i.call(this, s))) ||
            this.close();
        });
      },
    );
    this.containerEl.addClass("mod-confirmation"),
      this.containerEl.addClass("ophidian-dialog");
  }
  onOK(t) {
    return !1;
  }
  setOk(t) {
    this.okButton.textContent = t;
  }
  addButton(t, s, i, r) {
    return (
      this.buttonContainerEl
        .createEl("button", { cls: t, text: s }, r)
        .addEventListener("click", async (o) => {
          (await i(o)) || this.close();
        }),
      this
    );
  }
  addCancelButton(t) {
    return this.addButton(
      "",
      i18next.t("dialogue.button-cancel"),
      () => (this.close(), t && t()),
    );
  }
  setContent(t) {
    return (
      String.isString(t)
        ? this.textContentEl.setText(t)
        : this.textContentEl.appendChild(t),
      this
    );
  }
  setTitle(t) {
    return this.titleEl.setText(t), this;
  }
  setup(t) {
    return t && t(this), this;
  }
};
var ve = class extends ce {
  constructor() {
    super(...arguments);
    this.value = !1;
  }
  onOK(t) {
    this.value = !0;
  }
  confirm() {
    this.addCancelButton();
    let { resolve: t, promise: s } = at();
    return (this.onClose = () => t(this.value)), this.open(), s;
  }
};
var ct = class extends ce {
  constructor() {
    super(...arguments);
    this.value = !1;
    this.setting = this.contentEl.createDiv("is-mobile");
    this.inputEl = this.setting.createEl("input", { type: "text" }, (t) => {
      t.addEventListener("keypress", async (s) => {
        var i;
        s.key === "Enter" &&
          !s.isComposing &&
          ((await ((i = this.onOK) == null ? void 0 : i.call(this, s))) ||
            this.close());
      });
    });
  }
  onOK(t) {
    let { value: s } = this.inputEl;
    if (!this.isValid(s)) return this.handleInvalidEntry(s), !0;
    this.value = this.inputEl.value;
  }
  isValid(t) {
    return !0;
  }
  handleInvalidEntry(t) {}
  setPlaceholder(t) {
    return (
      t
        ? (this.inputEl.placeholder = t)
        : this.inputEl.removeAttribute("placeholder"),
      this
    );
  }
  setValue(t) {
    return (this.inputEl.value = t), this;
  }
  setPattern(t) {
    return (
      (this.inputEl.pattern = t),
      this.setValidator((s) => new RegExp(`^${t}$`).test(s))
    );
  }
  setValidator(t) {
    return (
      (this.isValid = t),
      (this.inputEl.oninput = () =>
        this.inputEl.setAttribute("aria-invalid", "" + !t(this.inputEl.value))),
      this
    );
  }
  onInvalidEntry(t) {
    return (this.handleInvalidEntry = t), this;
  }
  prompt() {
    this.addCancelButton();
    let { resolve: t, promise: s } = at();
    return (
      (this.onClose = () => t(this.value)),
      this.open(),
      this.inputEl.select(),
      this.inputEl.focus(),
      s
    );
  }
};
var Ht = class extends ce {
    constructor(t) {
      super();
      be(
        this,
        "progressEl",
        this.contentEl.createEl("progress", {
          value: 0,
          attr: { style: "width: 100%", max: 100 },
        }),
      );
      be(this, "counterEl", this.contentEl.createDiv({ text: "0%" }));
      this.okButton.detach(), this.addCancelButton(), (this.onClose = t);
    }
    setProgress(t) {
      (this.counterEl.textContent = `${t}%`), (this.progressEl.value = t);
    }
  },
  $e = class {
    constructor(e, t) {
      be(this, "aborted", !1);
      (this.progress = new Ht(() => (this.aborted = !0))
        .setTitle(e)
        .setContent(t)),
        this.progress.open();
    }
    async forEach(e, t) {
      try {
        if (this.aborted) return;
        let s = 0,
          i = e.length,
          r = 0,
          o = 0;
        for (let a of e) {
          if ((await t(a, s++, e, this), this.aborted)) return;
          if (((r += 100), r > i)) {
            let l = r % i,
              c = (r - l) / i;
            this.progress.setProgress((o += c)), (r = l);
          }
        }
        return o < 100 && this.progress.setProgress(100), this;
      } finally {
        (this.progress.onClose = () => null), this.progress.close();
      }
    }
    set title(e) {
      this.progress.setTitle(e);
    }
    set message(e) {
      this.progress.setContent(e);
    }
  };
var ye = require("obsidian");
var En = /^#[^\u2000-\u206F\u2E00-\u2E7F'!"#$%&()*+,.:;<=>?@^`{|}~\[\]\\\s]+$/,
  O = class {
    constructor(e) {
      let t = (this.tag = O.toTag(e)),
        s = (this.canonical = t.toLowerCase()),
        i = (this.canonical_prefix = s + "/");
      (this.name = t.slice(1)),
        (this.matches = function (r) {
          return (r = r.toLowerCase()), r == s || r.startsWith(i);
        });
    }
    toString() {
      return this.tag;
    }
    static isTag(e) {
      return En.test(e);
    }
    static toTag(e) {
      for (; e.startsWith("##"); ) e = e.slice(1);
      return e.startsWith("#") ? e : "#" + e;
    }
    static toName(e) {
      return this.toTag(e).slice(1);
    }
    static canonical(e) {
      return O.toTag(e).toLowerCase();
    }
  },
  ft = class {
    constructor(e, t) {
      let s = Object.assign(Object.create(null), {
        [e.tag]: t.tag,
        [e.name]: t.name,
      });
      (this.inString = function (i, r = 0) {
        return i.slice(0, r) + t.tag + i.slice(r + e.tag.length);
      }),
        (this.inArray = (i, r, o) =>
          i.map((a, l) => {
            if ((r && l & 1) || !a || typeof a != "string") return a;
            if (o) {
              if (!a.startsWith("#") || !O.isTag(a)) return a;
            } else if (/[ ,\n]/.test(a))
              return this.inArray(a.split(/([, \n]+)/), !0).join("");
            if (s[a]) return s[a];
            let c = a.toLowerCase();
            return s[c]
              ? (s[a] = s[c])
              : c.startsWith(e.canonical_prefix)
                ? (s[a] = s[c] = this.inString(a))
                : ("#" + c).startsWith(e.canonical_prefix)
                  ? (s[a] = s[c] = this.inString("#" + a).slice(1))
                  : (s[a] = s[c] = a);
          })),
        (this.willMergeTags = function (i) {
          if (e.canonical === t.canonical) return;
          let r = new Set(i.map((o) => o.toLowerCase()));
          for (let o of i.filter(e.matches)) {
            let a = this.inString(o);
            if (r.has(a.toLowerCase())) return [new O(o), new O(a)];
          }
        });
    }
  };
var Ss = require("obsidian");
var ut = Symbol.for("yaml.alias"),
  pt = Symbol.for("yaml.document"),
  q = Symbol.for("yaml.map"),
  Jt = Symbol.for("yaml.pair"),
  R = Symbol.for("yaml.scalar"),
  se = Symbol.for("yaml.seq"),
  _ = Symbol.for("yaml.node.type"),
  V = (n) => !!n && typeof n == "object" && n[_] === ut,
  Ee = (n) => !!n && typeof n == "object" && n[_] === pt,
  F = (n) => !!n && typeof n == "object" && n[_] === q,
  T = (n) => !!n && typeof n == "object" && n[_] === Jt,
  E = (n) => !!n && typeof n == "object" && n[_] === R,
  U = (n) => !!n && typeof n == "object" && n[_] === se;
function A(n) {
  if (n && typeof n == "object")
    switch (n[_]) {
      case q:
      case se:
        return !0;
    }
  return !1;
}
function N(n) {
  if (n && typeof n == "object")
    switch (n[_]) {
      case ut:
      case q:
      case R:
      case se:
        return !0;
    }
  return !1;
}
var Ts = (n) => (E(n) || A(n)) && !!n.anchor,
  fe = class {
    constructor(e) {
      Object.defineProperty(this, _, { value: e });
    }
    clone() {
      let e = Object.create(
        Object.getPrototypeOf(this),
        Object.getOwnPropertyDescriptors(this),
      );
      return this.range && (e.range = this.range.slice()), e;
    }
  };
var we = Symbol("break visit"),
  Tn = Symbol("skip children"),
  xe = Symbol("remove node");
function W(n, e) {
  typeof e == "object" &&
    (e.Collection || e.Node || e.Value) &&
    (e = Object.assign(
      { Alias: e.Node, Map: e.Node, Scalar: e.Node, Seq: e.Node },
      e.Value && { Map: e.Value, Scalar: e.Value, Seq: e.Value },
      e.Collection && { Map: e.Collection, Seq: e.Collection },
      e,
    )),
    Ee(n)
      ? Te(null, n.contents, e, Object.freeze([n])) === xe &&
        (n.contents = null)
      : Te(null, n, e, Object.freeze([]));
}
W.BREAK = we;
W.SKIP = Tn;
W.REMOVE = xe;
function Te(n, e, t, s) {
  let i;
  if (
    (typeof t == "function"
      ? (i = t(n, e, s))
      : F(e)
        ? t.Map && (i = t.Map(n, e, s))
        : U(e)
          ? t.Seq && (i = t.Seq(n, e, s))
          : T(e)
            ? t.Pair && (i = t.Pair(n, e, s))
            : E(e)
              ? t.Scalar && (i = t.Scalar(n, e, s))
              : V(e) && t.Alias && (i = t.Alias(n, e, s)),
    N(i) || T(i))
  ) {
    let r = s[s.length - 1];
    if (A(r)) r.items[n] = i;
    else if (T(r)) n === "key" ? (r.key = i) : (r.value = i);
    else if (Ee(r)) r.contents = i;
    else {
      let o = V(r) ? "alias" : "scalar";
      throw new Error(`Cannot replace node with ${o} parent`);
    }
    return Te(n, i, t, s);
  }
  if (typeof i != "symbol") {
    if (A(e)) {
      s = Object.freeze(s.concat(e));
      for (let r = 0; r < e.items.length; ++r) {
        let o = Te(r, e.items[r], t, s);
        if (typeof o == "number") r = o - 1;
        else {
          if (o === we) return we;
          o === xe && (e.items.splice(r, 1), (r -= 1));
        }
      }
    } else if (T(e)) {
      s = Object.freeze(s.concat(e));
      let r = Te("key", e.key, t, s);
      if (r === we) return we;
      r === xe && (e.key = null);
      let o = Te("value", e.value, t, s);
      if (o === we) return we;
      o === xe && (e.value = null);
    }
  }
  return i;
}
var Cn = {
    "!": "%21",
    ",": "%2C",
    "[": "%5B",
    "]": "%5D",
    "{": "%7B",
    "}": "%7D",
  },
  Nn = (n) => n.replace(/[!,[\]{}]/g, (e) => Cn[e]),
  L = class {
    constructor(e, t) {
      (this.marker = null),
        (this.yaml = Object.assign({}, L.defaultYaml, e)),
        (this.tags = Object.assign({}, L.defaultTags, t));
    }
    clone() {
      let e = new L(this.yaml, this.tags);
      return (e.marker = this.marker), e;
    }
    atDocument() {
      let e = new L(this.yaml, this.tags);
      switch (this.yaml.version) {
        case "1.1":
          this.atNextDocument = !0;
          break;
        case "1.2":
          (this.atNextDocument = !1),
            (this.yaml = { explicit: L.defaultYaml.explicit, version: "1.2" }),
            (this.tags = Object.assign({}, L.defaultTags));
          break;
      }
      return e;
    }
    add(e, t) {
      this.atNextDocument &&
        ((this.yaml = { explicit: L.defaultYaml.explicit, version: "1.1" }),
        (this.tags = Object.assign({}, L.defaultTags)),
        (this.atNextDocument = !1));
      let s = e.trim().split(/[ \t]+/),
        i = s.shift();
      switch (i) {
        case "%TAG": {
          if (
            s.length !== 2 &&
            (t(0, "%TAG directive should contain exactly two parts"),
            s.length < 2)
          )
            return !1;
          let [r, o] = s;
          return (this.tags[r] = o), !0;
        }
        case "%YAML": {
          if (((this.yaml.explicit = !0), s.length < 1))
            return t(0, "%YAML directive should contain exactly one part"), !1;
          let [r] = s;
          return r === "1.1" || r === "1.2"
            ? ((this.yaml.version = r), !0)
            : (t(6, `Unsupported YAML version ${r}`, !0), !1);
        }
        default:
          return t(0, `Unknown directive ${i}`, !0), !1;
      }
    }
    tagName(e, t) {
      if (e === "!") return "!";
      if (e[0] !== "!") return t(`Not a valid tag: ${e}`), null;
      if (e[1] === "<") {
        let o = e.slice(2, -1);
        return o === "!" || o === "!!"
          ? (t(`Verbatim tags aren't resolved, so ${e} is invalid.`), null)
          : (e[e.length - 1] !== ">" && t("Verbatim tags must end with a >"),
            o);
      }
      let [, s, i] = e.match(/^(.*!)([^!]*)$/);
      i || t(`The ${e} tag has no suffix`);
      let r = this.tags[s];
      return r
        ? r + decodeURIComponent(i)
        : s === "!"
          ? e
          : (t(`Could not resolve tag: ${e}`), null);
    }
    tagString(e) {
      for (let [t, s] of Object.entries(this.tags))
        if (e.startsWith(s)) return t + Nn(e.substring(s.length));
      return e[0] === "!" ? e : `!<${e}>`;
    }
    toString(e) {
      let t = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [],
        s = Object.entries(this.tags),
        i;
      if (e && s.length > 0 && N(e.contents)) {
        let r = {};
        W(e.contents, (o, a) => {
          N(a) && a.tag && (r[a.tag] = !0);
        }),
          (i = Object.keys(r));
      } else i = [];
      for (let [r, o] of s)
        (r === "!!" && o === "tag:yaml.org,2002:") ||
          ((!e || i.some((a) => a.startsWith(o))) && t.push(`%TAG ${r} ${o}`));
      return t.join(`
`);
    }
  };
L.defaultYaml = { explicit: !1, version: "1.2" };
L.defaultTags = { "!!": "tag:yaml.org,2002:" };
function ht(n) {
  if (/[\x00-\x19\s,[\]{}]/.test(n)) {
    let t = `Anchor must not contain whitespace or control characters: ${JSON.stringify(n)}`;
    throw new Error(t);
  }
  return !0;
}
function Yt(n) {
  let e = new Set();
  return (
    W(n, {
      Value(t, s) {
        s.anchor && e.add(s.anchor);
      },
    }),
    e
  );
}
function Gt(n, e) {
  for (let t = 1; ; ++t) {
    let s = `${n}${t}`;
    if (!e.has(s)) return s;
  }
}
function Cs(n, e) {
  let t = [],
    s = new Map(),
    i = null;
  return {
    onAnchor(r) {
      t.push(r), i || (i = Yt(n));
      let o = Gt(e, i);
      return i.add(o), o;
    },
    setAnchors() {
      for (let r of t) {
        let o = s.get(r);
        if (typeof o == "object" && o.anchor && (E(o.node) || A(o.node)))
          o.node.anchor = o.anchor;
        else {
          let a = new Error(
            "Failed to resolve repeated object (this should not happen)",
          );
          throw ((a.source = r), a);
        }
      }
    },
    sourceObjects: s,
  };
}
var ne = class extends fe {
  constructor(e) {
    super(ut),
      (this.source = e),
      Object.defineProperty(this, "tag", {
        set() {
          throw new Error("Alias nodes cannot have tags");
        },
      });
  }
  resolve(e) {
    let t;
    return (
      W(e, {
        Node: (s, i) => {
          if (i === this) return W.BREAK;
          i.anchor === this.source && (t = i);
        },
      }),
      t
    );
  }
  toJSON(e, t) {
    if (!t) return { source: this.source };
    let { anchors: s, doc: i, maxAliasCount: r } = t,
      o = this.resolve(i);
    if (!o) {
      let l = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
      throw new ReferenceError(l);
    }
    let a = s.get(o);
    if (!a || a.res === void 0) {
      let l = "This should not happen: Alias anchor was not resolved?";
      throw new ReferenceError(l);
    }
    if (
      r >= 0 &&
      ((a.count += 1),
      a.aliasCount === 0 && (a.aliasCount = dt(i, o, s)),
      a.count * a.aliasCount > r)
    ) {
      let l = "Excessive alias count indicates a resource exhaustion attack";
      throw new ReferenceError(l);
    }
    return a.res;
  }
  toString(e, t, s) {
    let i = `*${this.source}`;
    if (e) {
      if (
        (ht(this.source),
        e.options.verifyAliasOrder && !e.anchors.has(this.source))
      ) {
        let r = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new Error(r);
      }
      if (e.implicitKey) return `${i} `;
    }
    return i;
  }
};
function dt(n, e, t) {
  if (V(e)) {
    let s = e.resolve(n),
      i = t && s && t.get(s);
    return i ? i.count * i.aliasCount : 0;
  } else if (A(e)) {
    let s = 0;
    for (let i of e.items) {
      let r = dt(n, i, t);
      r > s && (s = r);
    }
    return s;
  } else if (T(e)) {
    let s = dt(n, e.key, t),
      i = dt(n, e.value, t);
    return Math.max(s, i);
  }
  return 1;
}
function x(n, e, t) {
  if (Array.isArray(n)) return n.map((s, i) => x(s, String(i), t));
  if (n && typeof n.toJSON == "function") {
    if (!t || !Ts(n)) return n.toJSON(e, t);
    let s = { aliasCount: 0, count: 1, res: void 0 };
    t.anchors.set(n, s),
      (t.onCreate = (r) => {
        (s.res = r), delete t.onCreate;
      });
    let i = n.toJSON(e, t);
    return t.onCreate && t.onCreate(i), i;
  }
  return typeof n == "bigint" && !(t && t.keep) ? Number(n) : n;
}
var mt = (n) => !n || (typeof n != "function" && typeof n != "object"),
  S = class extends fe {
    constructor(e) {
      super(R), (this.value = e);
    }
    toJSON(e, t) {
      return t && t.keep ? this.value : x(this.value, e, t);
    }
    toString() {
      return String(this.value);
    }
  };
S.BLOCK_FOLDED = "BLOCK_FOLDED";
S.BLOCK_LITERAL = "BLOCK_LITERAL";
S.PLAIN = "PLAIN";
S.QUOTE_DOUBLE = "QUOTE_DOUBLE";
S.QUOTE_SINGLE = "QUOTE_SINGLE";
var An = "tag:yaml.org,2002:";
function On(n, e, t) {
  if (e) {
    let s = t.filter((r) => r.tag === e),
      i = s.find((r) => !r.format) || s[0];
    if (!i) throw new Error(`Tag ${e} not found`);
    return i;
  }
  return t.find((s) => s.identify && s.identify(n) && !s.format);
}
function ie(n, e, t) {
  var s, i;
  if ((Ee(n) && (n = n.contents), N(n))) return n;
  if (T(n)) {
    let h =
      (i = (s = t.schema[q]).createNode) === null || i === void 0
        ? void 0
        : i.call(s, t.schema, null, t);
    return h.items.push(n), h;
  }
  (n instanceof String ||
    n instanceof Number ||
    n instanceof Boolean ||
    (typeof BigInt == "function" && n instanceof BigInt)) &&
    (n = n.valueOf());
  let {
      aliasDuplicateObjects: r,
      onAnchor: o,
      onTagObj: a,
      schema: l,
      sourceObjects: c,
    } = t,
    f;
  if (r && n && typeof n == "object") {
    if (((f = c.get(n)), f))
      return f.anchor || (f.anchor = o(n)), new ne(f.anchor);
    (f = { anchor: null, node: null }), c.set(n, f);
  }
  e && e.startsWith("!!") && (e = An + e.slice(2));
  let p = On(n, e, l.tags);
  if (!p) {
    if (
      (n && typeof n.toJSON == "function" && (n = n.toJSON()),
      !n || typeof n != "object")
    ) {
      let h = new S(n);
      return f && (f.node = h), h;
    }
    p = n instanceof Map ? l[q] : Symbol.iterator in Object(n) ? l[se] : l[q];
  }
  a && (a(p), delete t.onTagObj);
  let u = p != null && p.createNode ? p.createNode(t.schema, n, t) : new S(n);
  return e && (u.tag = e), f && (f.node = u), u;
}
function _e(n, e, t) {
  let s = t;
  for (let i = e.length - 1; i >= 0; --i) {
    let r = e[i];
    if (typeof r == "number" && Number.isInteger(r) && r >= 0) {
      let o = [];
      (o[r] = s), (s = o);
    } else s = new Map([[r, s]]);
  }
  return ie(s, void 0, {
    aliasDuplicateObjects: !1,
    keepUndefined: !1,
    onAnchor: () => {
      throw new Error("This should not happen, please report a bug.");
    },
    schema: n,
    sourceObjects: new Map(),
  });
}
var Ce = (n) =>
    n == null || (typeof n == "object" && !!n[Symbol.iterator]().next().done),
  re = class extends fe {
    constructor(e, t) {
      super(e),
        Object.defineProperty(this, "schema", {
          value: t,
          configurable: !0,
          enumerable: !1,
          writable: !0,
        });
    }
    clone(e) {
      let t = Object.create(
        Object.getPrototypeOf(this),
        Object.getOwnPropertyDescriptors(this),
      );
      return (
        e && (t.schema = e),
        (t.items = t.items.map((s) => (N(s) || T(s) ? s.clone(e) : s))),
        this.range && (t.range = this.range.slice()),
        t
      );
    }
    addIn(e, t) {
      if (Ce(e)) this.add(t);
      else {
        let [s, ...i] = e,
          r = this.get(s, !0);
        if (A(r)) r.addIn(i, t);
        else if (r === void 0 && this.schema)
          this.set(s, _e(this.schema, i, t));
        else
          throw new Error(
            `Expected YAML collection at ${s}. Remaining path: ${i}`,
          );
      }
    }
    deleteIn(e) {
      let [t, ...s] = e;
      if (s.length === 0) return this.delete(t);
      let i = this.get(t, !0);
      if (A(i)) return i.deleteIn(s);
      throw new Error(`Expected YAML collection at ${t}. Remaining path: ${s}`);
    }
    getIn(e, t) {
      let [s, ...i] = e,
        r = this.get(s, !0);
      return i.length === 0
        ? !t && E(r)
          ? r.value
          : r
        : A(r)
          ? r.getIn(i, t)
          : void 0;
    }
    hasAllNullValues(e) {
      return this.items.every((t) => {
        if (!T(t)) return !1;
        let s = t.value;
        return (
          s == null ||
          (e &&
            E(s) &&
            s.value == null &&
            !s.commentBefore &&
            !s.comment &&
            !s.tag)
        );
      });
    }
    hasIn(e) {
      let [t, ...s] = e;
      if (s.length === 0) return this.has(t);
      let i = this.get(t, !0);
      return A(i) ? i.hasIn(s) : !1;
    }
    setIn(e, t) {
      let [s, ...i] = e;
      if (i.length === 0) this.set(s, t);
      else {
        let r = this.get(s, !0);
        if (A(r)) r.setIn(i, t);
        else if (r === void 0 && this.schema)
          this.set(s, _e(this.schema, i, t));
        else
          throw new Error(
            `Expected YAML collection at ${s}. Remaining path: ${i}`,
          );
      }
    }
  };
re.maxFlowStringSingleLineLength = 60;
var Ns = (n) => n.replace(/^(?!$)(?: $)?/gm, "#");
function z(n, e) {
  return /^\n+$/.test(n) ? n.substring(1) : e ? n.replace(/^(?! *$)/gm, e) : n;
}
var H = (n, e, t) =>
  t.includes(`
`)
    ? `
` + z(t, e)
    : (n.endsWith(" ") ? "" : " ") + t;
var Qt = "flow",
  gt = "block",
  Be = "quoted";
function De(
  n,
  e,
  t = "flow",
  {
    indentAtStart: s,
    lineWidth: i = 80,
    minContentWidth: r = 20,
    onFold: o,
    onOverflow: a,
  } = {},
) {
  if (!i || i < 0) return n;
  let l = Math.max(1 + r, 1 + i - e.length);
  if (n.length <= l) return n;
  let c = [],
    f = {},
    p = i - e.length;
  typeof s == "number" && (s > i - Math.max(2, r) ? c.push(0) : (p = i - s));
  let u,
    h,
    y = !1,
    d = -1,
    m = -1,
    g = -1;
  t === gt && ((d = As(n, d)), d !== -1 && (p = d + l));
  for (let v; (v = n[(d += 1)]); ) {
    if (t === Be && v === "\\") {
      switch (((m = d), n[d + 1])) {
        case "x":
          d += 3;
          break;
        case "u":
          d += 5;
          break;
        case "U":
          d += 9;
          break;
        default:
          d += 1;
      }
      g = d;
    }
    if (
      v ===
      `
`
    )
      t === gt && (d = As(n, d)), (p = d + l), (u = void 0);
    else {
      if (
        v === " " &&
        h &&
        h !== " " &&
        h !==
          `
` &&
        h !== "	"
      ) {
        let b = n[d + 1];
        b &&
          b !== " " &&
          b !==
            `
` &&
          b !== "	" &&
          (u = d);
      }
      if (d >= p)
        if (u) c.push(u), (p = u + l), (u = void 0);
        else if (t === Be) {
          for (; h === " " || h === "	"; ) (h = v), (v = n[(d += 1)]), (y = !0);
          let b = d > g + 1 ? d - 2 : m - 1;
          if (f[b]) return n;
          c.push(b), (f[b] = !0), (p = b + l), (u = void 0);
        } else y = !0;
    }
    h = v;
  }
  if ((y && a && a(), c.length === 0)) return n;
  o && o();
  let w = n.slice(0, c[0]);
  for (let v = 0; v < c.length; ++v) {
    let b = c[v],
      k = c[v + 1] || n.length;
    b === 0
      ? (w = `
${e}${n.slice(0, k)}`)
      : (t === Be && f[b] && (w += `${n[b]}\\`),
        (w += `
${e}${n.slice(b + 1, k)}`));
  }
  return w;
}
function As(n, e) {
  let t = n[e + 1];
  for (; t === " " || t === "	"; ) {
    do t = n[(e += 1)];
    while (
      t &&
      t !==
        `
`
    );
    t = n[e + 1];
  }
  return e;
}
var bt = (n) => ({
    indentAtStart: n.indentAtStart,
    lineWidth: n.options.lineWidth,
    minContentWidth: n.options.minContentWidth,
  }),
  wt = (n) => /^(%|---|\.\.\.)/m.test(n);
function In(n, e, t) {
  if (!e || e < 0) return !1;
  let s = e - t,
    i = n.length;
  if (i <= s) return !1;
  for (let r = 0, o = 0; r < i; ++r)
    if (
      n[r] ===
      `
`
    ) {
      if (r - o > s) return !0;
      if (((o = r + 1), i - o <= s)) return !1;
    }
  return !0;
}
function Fe(n, e) {
  let t = JSON.stringify(n);
  if (e.options.doubleQuotedAsJSON) return t;
  let { implicitKey: s } = e,
    i = e.options.doubleQuotedMinMultiLineLength,
    r = e.indent || (wt(n) ? "  " : ""),
    o = "",
    a = 0;
  for (let l = 0, c = t[l]; c; c = t[++l])
    if (
      (c === " " &&
        t[l + 1] === "\\" &&
        t[l + 2] === "n" &&
        ((o += t.slice(a, l) + "\\ "), (l += 1), (a = l), (c = "\\")),
      c === "\\")
    )
      switch (t[l + 1]) {
        case "u":
          {
            o += t.slice(a, l);
            let f = t.substr(l + 2, 4);
            switch (f) {
              case "0000":
                o += "\\0";
                break;
              case "0007":
                o += "\\a";
                break;
              case "000b":
                o += "\\v";
                break;
              case "001b":
                o += "\\e";
                break;
              case "0085":
                o += "\\N";
                break;
              case "00a0":
                o += "\\_";
                break;
              case "2028":
                o += "\\L";
                break;
              case "2029":
                o += "\\P";
                break;
              default:
                f.substr(0, 2) === "00"
                  ? (o += "\\x" + f.substr(2))
                  : (o += t.substr(l, 6));
            }
            (l += 5), (a = l + 1);
          }
          break;
        case "n":
          if (s || t[l + 2] === '"' || t.length < i) l += 1;
          else {
            for (
              o +=
                t.slice(a, l) +
                `

`;
              t[l + 2] === "\\" && t[l + 3] === "n" && t[l + 4] !== '"';

            )
              (o += `
`),
                (l += 2);
            (o += r), t[l + 2] === " " && (o += "\\"), (l += 1), (a = l + 1);
          }
          break;
        default:
          l += 1;
      }
  return (o = a ? o + t.slice(a) : t), s ? o : De(o, r, Be, bt(e));
}
function zt(n, e) {
  if (
    e.options.singleQuote === !1 ||
    (e.implicitKey &&
      n.includes(`
`)) ||
    /[ \t]\n|\n[ \t]/.test(n)
  )
    return Fe(n, e);
  let t = e.indent || (wt(n) ? "  " : ""),
    s =
      "'" +
      n.replace(/'/g, "''").replace(
        /\n+/g,
        `$&
${t}`,
      ) +
      "'";
  return e.implicitKey ? s : De(s, t, Qt, bt(e));
}
function Re(n, e) {
  let { singleQuote: t } = e.options,
    s;
  if (t === !1) s = Fe;
  else {
    let i = n.includes('"'),
      r = n.includes("'");
    i && !r ? (s = zt) : r && !i ? (s = Fe) : (s = t ? zt : Fe);
  }
  return s(n, e);
}
function yt({ comment: n, type: e, value: t }, s, i, r) {
  let { blockQuote: o, commentString: a, lineWidth: l } = s.options;
  if (!o || /\n[\t ]+$/.test(t) || /^\s*$/.test(t)) return Re(t, s);
  let c = s.indent || (s.forceBlockIndent || wt(t) ? "  " : ""),
    f =
      o === "literal"
        ? !0
        : o === "folded" || e === S.BLOCK_FOLDED
          ? !1
          : e === S.BLOCK_LITERAL
            ? !0
            : !In(t, l, c.length);
  if (!t)
    return f
      ? `|
`
      : `>
`;
  let p, u;
  for (u = t.length; u > 0; --u) {
    let C = t[u - 1];
    if (
      C !==
        `
` &&
      C !== "	" &&
      C !== " "
    )
      break;
  }
  let h = t.substring(u),
    y = h.indexOf(`
`);
  y === -1
    ? (p = "-")
    : t === h || y !== h.length - 1
      ? ((p = "+"), r && r())
      : (p = ""),
    h &&
      ((t = t.slice(0, -h.length)),
      h[h.length - 1] ===
        `
` && (h = h.slice(0, -1)),
      (h = h.replace(/\n+(?!\n|$)/g, `$&${c}`)));
  let d = !1,
    m,
    g = -1;
  for (m = 0; m < t.length; ++m) {
    let C = t[m];
    if (C === " ") d = !0;
    else if (
      C ===
      `
`
    )
      g = m;
    else break;
  }
  let w = t.substring(0, g < m ? g + 1 : m);
  w && ((t = t.substring(w.length)), (w = w.replace(/\n+/g, `$&${c}`)));
  let b = (f ? "|" : ">") + (d ? (c ? "2" : "1") : "") + p;
  if ((n && ((b += " " + a(n.replace(/ ?[\r\n]+/g, " "))), i && i()), f))
    return (
      (t = t.replace(/\n+/g, `$&${c}`)),
      `${b}
${c}${w}${t}${h}`
    );
  t = t
    .replace(
      /\n+/g,
      `
$&`,
    )
    .replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2")
    .replace(/\n+/g, `$&${c}`);
  let k = De(`${w}${t}${h}`, c, gt, bt(s));
  return `${b}
${c}${k}`;
}
function Ln(n, e, t, s) {
  let { type: i, value: r } = n,
    { actualString: o, implicitKey: a, indent: l, inFlow: c } = e;
  if ((a && /[\n[\]{},]/.test(r)) || (c && /[[\]{},]/.test(r))) return Re(r, e);
  if (
    !r ||
    /^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(
      r,
    )
  )
    return a ||
      c ||
      r.indexOf(`
`) === -1
      ? Re(r, e)
      : yt(n, e, t, s);
  if (
    !a &&
    !c &&
    i !== S.PLAIN &&
    r.indexOf(`
`) !== -1
  )
    return yt(n, e, t, s);
  if (l === "" && wt(r)) return (e.forceBlockIndent = !0), yt(n, e, t, s);
  let f = r.replace(
    /\n+/g,
    `$&
${l}`,
  );
  if (o) {
    let p = (y) => {
        var d;
        return (
          y.default &&
          y.tag !== "tag:yaml.org,2002:str" &&
          ((d = y.test) === null || d === void 0 ? void 0 : d.test(f))
        );
      },
      { compat: u, tags: h } = e.doc.schema;
    if (h.some(p) || (u != null && u.some(p))) return Re(r, e);
  }
  return a ? f : De(f, l, Qt, bt(e));
}
function oe(n, e, t, s) {
  let { implicitKey: i, inFlow: r } = e,
    o =
      typeof n.value == "string"
        ? n
        : Object.assign({}, n, { value: String(n.value) }),
    { type: a } = n;
  a !== S.QUOTE_DOUBLE &&
    /[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(o.value) &&
    (a = S.QUOTE_DOUBLE);
  let l = (f) => {
      switch (f) {
        case S.BLOCK_FOLDED:
        case S.BLOCK_LITERAL:
          return i || r ? Re(o.value, e) : yt(o, e, t, s);
        case S.QUOTE_DOUBLE:
          return Fe(o.value, e);
        case S.QUOTE_SINGLE:
          return zt(o.value, e);
        case S.PLAIN:
          return Ln(o, e, t, s);
        default:
          return null;
      }
    },
    c = l(a);
  if (c === null) {
    let { defaultKeyType: f, defaultStringType: p } = e.options,
      u = (i && f) || p;
    if (((c = l(u)), c === null))
      throw new Error(`Unsupported default string type ${u}`);
  }
  return c;
}
function St(n, e) {
  let t = Object.assign(
      {
        blockQuote: !0,
        commentString: Ns,
        defaultKeyType: null,
        defaultStringType: "PLAIN",
        directives: null,
        doubleQuotedAsJSON: !1,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: "false",
        indentSeq: !0,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: "null",
        simpleKeys: !1,
        singleQuote: null,
        trueStr: "true",
        verifyAliasOrder: !0,
      },
      n.schema.toStringOptions,
      e,
    ),
    s;
  switch (t.collectionStyle) {
    case "block":
      s = !1;
      break;
    case "flow":
      s = !0;
      break;
    default:
      s = null;
  }
  return {
    anchors: new Set(),
    doc: n,
    indent: "",
    indentStep: typeof t.indent == "number" ? " ".repeat(t.indent) : "  ",
    inFlow: s,
    options: t,
  };
}
function Pn(n, e) {
  if (e.tag) {
    let i = n.filter((r) => r.tag === e.tag);
    if (i.length > 0) return i.find((r) => r.format === e.format) || i[0];
  }
  let t, s;
  if (E(e)) {
    s = e.value;
    let i = n.filter((r) => r.identify && r.identify(s));
    t = i.find((r) => r.format === e.format) || i.find((r) => !r.format);
  } else (s = e), (t = n.find((i) => i.nodeClass && s instanceof i.nodeClass));
  if (!t) {
    let i = s && s.constructor ? s.constructor.name : typeof s;
    throw new Error(`Tag not resolved for ${i} value`);
  }
  return t;
}
function Mn(n, e, { anchors: t, doc: s }) {
  if (!s.directives) return "";
  let i = [],
    r = (E(n) || A(n)) && n.anchor;
  r && ht(r) && (t.add(r), i.push(`&${r}`));
  let o = n.tag || (e.default ? null : e.tag);
  return o && i.push(s.directives.tagString(o)), i.join(" ");
}
function J(n, e, t, s) {
  var i;
  if (T(n)) return n.toString(e, t, s);
  if (V(n)) {
    if (e.doc.directives) return n.toString(e);
    if (!((i = e.resolvedAliases) === null || i === void 0) && i.has(n))
      throw new TypeError(
        "Cannot stringify circular structure without alias nodes",
      );
    e.resolvedAliases
      ? e.resolvedAliases.add(n)
      : (e.resolvedAliases = new Set([n])),
      (n = n.resolve(e.doc));
  }
  let r,
    o = N(n) ? n : e.doc.createNode(n, { onTagObj: (c) => (r = c) });
  r || (r = Pn(e.doc.schema.tags, o));
  let a = Mn(o, r, e);
  a.length > 0 && (e.indentAtStart = (e.indentAtStart || 0) + a.length + 1);
  let l =
    typeof r.stringify == "function"
      ? r.stringify(o, e, t, s)
      : E(o)
        ? oe(o, e, t, s)
        : o.toString(e, t, s);
  return a
    ? E(o) || l[0] === "{" || l[0] === "["
      ? `${a} ${l}`
      : `${a}
${e.indent}${l}`
    : l;
}
function Os({ key: n, value: e }, t, s, i) {
  let {
      allNullValues: r,
      doc: o,
      indent: a,
      indentStep: l,
      options: { commentString: c, indentSeq: f, simpleKeys: p },
    } = t,
    u = (N(n) && n.comment) || null;
  if (p) {
    if (u) throw new Error("With simple keys, key nodes cannot have comments");
    if (A(n)) {
      let C = "With simple keys, collection cannot be used as a key value";
      throw new Error(C);
    }
  }
  let h =
    !p &&
    (!n ||
      (u && e == null && !t.inFlow) ||
      A(n) ||
      (E(n)
        ? n.type === S.BLOCK_FOLDED || n.type === S.BLOCK_LITERAL
        : typeof n == "object"));
  t = Object.assign({}, t, {
    allNullValues: !1,
    implicitKey: !h && (p || !r),
    indent: a + l,
  });
  let y = !1,
    d = !1,
    m = J(
      n,
      t,
      () => (y = !0),
      () => (d = !0),
    );
  if (!h && !t.inFlow && m.length > 1024) {
    if (p)
      throw new Error(
        "With simple keys, single line scalar must not span more than 1024 characters",
      );
    h = !0;
  }
  if (t.inFlow) {
    if (r || e == null) return y && s && s(), h ? `? ${m}` : m;
  } else if ((r && !p) || (e == null && h))
    return (
      (m = `? ${m}`), u && !y ? (m += H(m, t.indent, c(u))) : d && i && i(), m
    );
  y && (u = null),
    h
      ? (u && (m += H(m, t.indent, c(u))),
        (m = `? ${m}
${a}:`))
      : ((m = `${m}:`), u && (m += H(m, t.indent, c(u))));
  let g = "",
    w = null;
  if (N(e)) {
    if (
      (e.spaceBefore &&
        (g = `
`),
      e.commentBefore)
    ) {
      let C = c(e.commentBefore);
      g += `
${z(C, t.indent)}`;
    }
    w = e.comment;
  } else e && typeof e == "object" && (e = o.createNode(e));
  (t.implicitKey = !1),
    !h && !u && E(e) && (t.indentAtStart = m.length + 1),
    (d = !1),
    !f &&
      l.length >= 2 &&
      !t.inFlow &&
      !h &&
      U(e) &&
      !e.flow &&
      !e.tag &&
      !e.anchor &&
      (t.indent = t.indent.substr(2));
  let v = !1,
    b = J(
      e,
      t,
      () => (v = !0),
      () => (d = !0),
    ),
    k = " ";
  return (
    g || u
      ? (k =
          b === "" && !t.inFlow
            ? g
            : `${g}
${t.indent}`)
      : !h && A(e)
        ? (!(b[0] === "[" || b[0] === "{") ||
            b.includes(`
`)) &&
          (k = `
${t.indent}`)
        : (b === "" ||
            b[0] ===
              `
`) &&
          (k = ""),
    (m += k + b),
    t.inFlow
      ? v && s && s()
      : w && !v
        ? (m += H(m, t.indent, c(w)))
        : d && i && i(),
    m
  );
}
function Xt(n, e) {
  (n === "debug" || n === "warn") &&
    (typeof process != "undefined" && process.emitWarning
      ? process.emitWarning(e)
      : console.warn(e));
}
var Is = "<<";
function kt(n, e, { key: t, value: s }) {
  if (n && n.doc.schema.merge && $n(t))
    if (((s = V(s) ? s.resolve(n.doc) : s), U(s)))
      for (let i of s.items) Zt(n, e, i);
    else if (Array.isArray(s)) for (let i of s) Zt(n, e, i);
    else Zt(n, e, s);
  else {
    let i = x(t, "", n);
    if (e instanceof Map) e.set(i, x(s, i, n));
    else if (e instanceof Set) e.add(i);
    else {
      let r = xn(t, i, n),
        o = x(s, r, n);
      r in e
        ? Object.defineProperty(e, r, {
            value: o,
            writable: !0,
            enumerable: !0,
            configurable: !0,
          })
        : (e[r] = o);
    }
  }
  return e;
}
var $n = (n) =>
  n === Is || (E(n) && n.value === Is && (!n.type || n.type === S.PLAIN));
function Zt(n, e, t) {
  let s = n && V(t) ? t.resolve(n.doc) : t;
  if (!F(s)) throw new Error("Merge sources must be maps or map aliases");
  let i = s.toJSON(null, n, Map);
  for (let [r, o] of i)
    e instanceof Map
      ? e.has(r) || e.set(r, o)
      : e instanceof Set
        ? e.add(r)
        : Object.prototype.hasOwnProperty.call(e, r) ||
          Object.defineProperty(e, r, {
            value: o,
            writable: !0,
            enumerable: !0,
            configurable: !0,
          });
  return e;
}
function xn(n, e, t) {
  if (e === null) return "";
  if (typeof e != "object") return String(e);
  if (N(n) && t && t.doc) {
    let s = St(t.doc, {});
    s.anchors = new Set();
    for (let r of t.anchors.keys()) s.anchors.add(r.anchor);
    (s.inFlow = !0), (s.inStringifyKey = !0);
    let i = n.toString(s);
    if (!t.mapKeyWarned) {
      let r = JSON.stringify(i);
      r.length > 40 && (r = r.substring(0, 36) + '..."'),
        Xt(
          t.doc.options.logLevel,
          `Keys with collection values will be stringified due to JS Object restrictions: ${r}. Set mapAsMap: true to use object keys.`,
        ),
        (t.mapKeyWarned = !0);
    }
    return i;
  }
  return JSON.stringify(e);
}
function Ne(n, e, t) {
  let s = ie(n, void 0, t),
    i = ie(e, void 0, t);
  return new I(s, i);
}
var I = class {
  constructor(e, t = null) {
    Object.defineProperty(this, _, { value: Jt }),
      (this.key = e),
      (this.value = t);
  }
  clone(e) {
    let { key: t, value: s } = this;
    return N(t) && (t = t.clone(e)), N(s) && (s = s.clone(e)), new I(t, s);
  }
  toJSON(e, t) {
    let s = t && t.mapAsMap ? new Map() : {};
    return kt(t, s, this);
  }
  toString(e, t, s) {
    return e && e.doc ? Os(this, e, t, s) : JSON.stringify(this);
  }
};
var je = {
  intAsBigInt: !1,
  keepSourceTokens: !1,
  logLevel: "warn",
  prettyErrors: !0,
  strict: !0,
  uniqueKeys: !0,
  version: "1.2",
};
function Et(n, e, t) {
  var s;
  return (((s = e.inFlow) !== null && s !== void 0 ? s : n.flow) ? Bn : _n)(
    n,
    e,
    t,
  );
}
function _n(
  { comment: n, items: e },
  t,
  {
    blockItemPrefix: s,
    flowChars: i,
    itemIndent: r,
    onChompKeep: o,
    onComment: a,
  },
) {
  let {
      indent: l,
      options: { commentString: c },
    } = t,
    f = Object.assign({}, t, { indent: r, type: null }),
    p = !1,
    u = [];
  for (let y = 0; y < e.length; ++y) {
    let d = e[y],
      m = null;
    if (N(d))
      !p && d.spaceBefore && u.push(""),
        vt(t, u, d.commentBefore, p),
        d.comment && (m = d.comment);
    else if (T(d)) {
      let w = N(d.key) ? d.key : null;
      w && (!p && w.spaceBefore && u.push(""), vt(t, u, w.commentBefore, p));
    }
    p = !1;
    let g = J(
      d,
      f,
      () => (m = null),
      () => (p = !0),
    );
    m && (g += H(g, r, c(m))), p && m && (p = !1), u.push(s + g);
  }
  let h;
  if (u.length === 0) h = i.start + i.end;
  else {
    h = u[0];
    for (let y = 1; y < u.length; ++y) {
      let d = u[y];
      h += d
        ? `
${l}${d}`
        : `
`;
    }
  }
  return (
    n
      ? ((h +=
          `
` + z(c(n), l)),
        a && a())
      : p && o && o(),
    h
  );
}
function Bn(
  { comment: n, items: e },
  t,
  { flowChars: s, itemIndent: i, onComment: r },
) {
  let {
    indent: o,
    indentStep: a,
    options: { commentString: l },
  } = t;
  i += a;
  let c = Object.assign({}, t, { indent: i, inFlow: !0, type: null }),
    f = !1,
    p = 0,
    u = [];
  for (let m = 0; m < e.length; ++m) {
    let g = e[m],
      w = null;
    if (N(g))
      g.spaceBefore && u.push(""),
        vt(t, u, g.commentBefore, !1),
        g.comment && (w = g.comment);
    else if (T(g)) {
      let b = N(g.key) ? g.key : null;
      b &&
        (b.spaceBefore && u.push(""),
        vt(t, u, b.commentBefore, !1),
        b.comment && (f = !0));
      let k = N(g.value) ? g.value : null;
      k
        ? (k.comment && (w = k.comment), k.commentBefore && (f = !0))
        : g.value == null && b && b.comment && (w = b.comment);
    }
    w && (f = !0);
    let v = J(g, c, () => (w = null));
    m < e.length - 1 && (v += ","),
      w && (v += H(v, i, l(w))),
      !f &&
        (u.length > p ||
          v.includes(`
`)) &&
        (f = !0),
      u.push(v),
      (p = u.length);
  }
  let h,
    { start: y, end: d } = s;
  if (u.length === 0) h = y + d;
  else if (
    (f ||
      (f =
        u.reduce((g, w) => g + w.length + 2, 2) >
        re.maxFlowStringSingleLineLength),
    f)
  ) {
    h = y;
    for (let m of u)
      h += m
        ? `
${a}${o}${m}`
        : `
`;
    h += `
${o}${d}`;
  } else h = `${y} ${u.join(" ")} ${d}`;
  return n && ((h += H(h, l(n), o)), r && r()), h;
}
function vt({ indent: n, options: { commentString: e } }, t, s, i) {
  if ((s && i && (s = s.replace(/^\n+/, "")), s)) {
    let r = z(e(s), n);
    t.push(r.trimStart());
  }
}
function ue(n, e) {
  let t = E(e) ? e.value : e;
  for (let s of n)
    if (T(s) && (s.key === e || s.key === t || (E(s.key) && s.key.value === t)))
      return s;
}
var P = class extends re {
  constructor(e) {
    super(q, e), (this.items = []);
  }
  static get tagName() {
    return "tag:yaml.org,2002:map";
  }
  add(e, t) {
    let s;
    T(e)
      ? (s = e)
      : !e || typeof e != "object" || !("key" in e)
        ? (s = new I(e, e.value))
        : (s = new I(e.key, e.value));
    let i = ue(this.items, s.key),
      r = this.schema && this.schema.sortMapEntries;
    if (i) {
      if (!t) throw new Error(`Key ${s.key} already set`);
      E(i.value) && mt(s.value)
        ? (i.value.value = s.value)
        : (i.value = s.value);
    } else if (r) {
      let o = this.items.findIndex((a) => r(s, a) < 0);
      o === -1 ? this.items.push(s) : this.items.splice(o, 0, s);
    } else this.items.push(s);
  }
  delete(e) {
    let t = ue(this.items, e);
    return t ? this.items.splice(this.items.indexOf(t), 1).length > 0 : !1;
  }
  get(e, t) {
    let s = ue(this.items, e),
      i = s && s.value;
    return !t && E(i) ? i.value : i;
  }
  has(e) {
    return !!ue(this.items, e);
  }
  set(e, t) {
    this.add(new I(e, t), !0);
  }
  toJSON(e, t, s) {
    let i = s ? new s() : t && t.mapAsMap ? new Map() : {};
    t && t.onCreate && t.onCreate(i);
    for (let r of this.items) kt(t, i, r);
    return i;
  }
  toString(e, t, s) {
    if (!e) return JSON.stringify(this);
    for (let i of this.items)
      if (!T(i))
        throw new Error(
          `Map items must all be pairs; found ${JSON.stringify(i)} instead`,
        );
    return (
      !e.allNullValues &&
        this.hasAllNullValues(!1) &&
        (e = Object.assign({}, e, { allNullValues: !0 })),
      Et(this, e, {
        blockItemPrefix: "",
        flowChars: { start: "{", end: "}" },
        itemIndent: e.indent || "",
        onChompKeep: s,
        onComment: t,
      })
    );
  }
};
function Dn(n, e, t) {
  let { keepUndefined: s, replacer: i } = t,
    r = new P(n),
    o = (a, l) => {
      if (typeof i == "function") l = i.call(e, a, l);
      else if (Array.isArray(i) && !i.includes(a)) return;
      (l !== void 0 || s) && r.items.push(Ne(a, l, t));
    };
  if (e instanceof Map) for (let [a, l] of e) o(a, l);
  else if (e && typeof e == "object") for (let a of Object.keys(e)) o(a, e[a]);
  return (
    typeof n.sortMapEntries == "function" && r.items.sort(n.sortMapEntries), r
  );
}
var Y = {
  collection: "map",
  createNode: Dn,
  default: !0,
  nodeClass: P,
  tag: "tag:yaml.org,2002:map",
  resolve(n, e) {
    return F(n) || e("Expected a mapping for this tag"), n;
  },
};
var B = class extends re {
  constructor(e) {
    super(se, e), (this.items = []);
  }
  static get tagName() {
    return "tag:yaml.org,2002:seq";
  }
  add(e) {
    this.items.push(e);
  }
  delete(e) {
    let t = Tt(e);
    return typeof t != "number" ? !1 : this.items.splice(t, 1).length > 0;
  }
  get(e, t) {
    let s = Tt(e);
    if (typeof s != "number") return;
    let i = this.items[s];
    return !t && E(i) ? i.value : i;
  }
  has(e) {
    let t = Tt(e);
    return typeof t == "number" && t < this.items.length;
  }
  set(e, t) {
    let s = Tt(e);
    if (typeof s != "number")
      throw new Error(`Expected a valid index, not ${e}.`);
    let i = this.items[s];
    E(i) && mt(t) ? (i.value = t) : (this.items[s] = t);
  }
  toJSON(e, t) {
    let s = [];
    t && t.onCreate && t.onCreate(s);
    let i = 0;
    for (let r of this.items) s.push(x(r, String(i++), t));
    return s;
  }
  toString(e, t, s) {
    return e
      ? Et(this, e, {
          blockItemPrefix: "- ",
          flowChars: { start: "[", end: "]" },
          itemIndent: (e.indent || "") + "  ",
          onChompKeep: s,
          onComment: t,
        })
      : JSON.stringify(this);
  }
};
function Tt(n) {
  let e = E(n) ? n.value : n;
  return (
    e && typeof e == "string" && (e = Number(e)),
    typeof e == "number" && Number.isInteger(e) && e >= 0 ? e : null
  );
}
function Fn(n, e, t) {
  let { replacer: s } = t,
    i = new B(n);
  if (e && Symbol.iterator in Object(e)) {
    let r = 0;
    for (let o of e) {
      if (typeof s == "function") {
        let a = e instanceof Set ? o : String(r++);
        o = s.call(e, a, o);
      }
      i.items.push(ie(o, void 0, t));
    }
  }
  return i;
}
var G = {
  collection: "seq",
  createNode: Fn,
  default: !0,
  nodeClass: B,
  tag: "tag:yaml.org,2002:seq",
  resolve(n, e) {
    return U(n) || e("Expected a sequence for this tag"), n;
  },
};
var pe = {
  identify: (n) => typeof n == "string",
  default: !0,
  tag: "tag:yaml.org,2002:str",
  resolve: (n) => n,
  stringify(n, e, t, s) {
    return (e = Object.assign({ actualString: !0 }, e)), oe(n, e, t, s);
  },
};
var Se = {
  identify: (n) => n == null,
  createNode: () => new S(null),
  default: !0,
  tag: "tag:yaml.org,2002:null",
  test: /^(?:~|[Nn]ull|NULL)?$/,
  resolve: () => new S(null),
  stringify: ({ source: n }, e) =>
    n && Se.test.test(n) ? n : e.options.nullStr,
};
var Ke = {
  identify: (n) => typeof n == "boolean",
  default: !0,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
  resolve: (n) => new S(n[0] === "t" || n[0] === "T"),
  stringify({ source: n, value: e }, t) {
    if (n && Ke.test.test(n)) {
      let s = n[0] === "t" || n[0] === "T";
      if (e === s) return n;
    }
    return e ? t.options.trueStr : t.options.falseStr;
  },
};
function $({ format: n, minFractionDigits: e, tag: t, value: s }) {
  if (typeof s == "bigint") return String(s);
  let i = typeof s == "number" ? s : Number(s);
  if (!isFinite(i)) return isNaN(i) ? ".nan" : i < 0 ? "-.inf" : ".inf";
  let r = JSON.stringify(s);
  if (!n && e && (!t || t === "tag:yaml.org,2002:float") && /^\d/.test(r)) {
    let o = r.indexOf(".");
    o < 0 && ((o = r.length), (r += "."));
    let a = e - (r.length - o - 1);
    for (; a-- > 0; ) r += "0";
  }
  return r;
}
var Ct = {
    identify: (n) => typeof n == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF|nan|NaN|NAN))$/,
    resolve: (n) =>
      n.slice(-3).toLowerCase() === "nan"
        ? NaN
        : n[0] === "-"
          ? Number.NEGATIVE_INFINITY
          : Number.POSITIVE_INFINITY,
    stringify: $,
  },
  Nt = {
    identify: (n) => typeof n == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
    resolve: (n) => parseFloat(n),
    stringify(n) {
      let e = Number(n.value);
      return isFinite(e) ? e.toExponential() : $(n);
    },
  },
  At = {
    identify: (n) => typeof n == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
    resolve(n) {
      let e = new S(parseFloat(n)),
        t = n.indexOf(".");
      return (
        t !== -1 &&
          n[n.length - 1] === "0" &&
          (e.minFractionDigits = n.length - t - 1),
        e
      );
    },
    stringify: $,
  };
var Ot = (n) => typeof n == "bigint" || Number.isInteger(n),
  es = (n, e, t, { intAsBigInt: s }) =>
    s ? BigInt(n) : parseInt(n.substring(e), t);
function Ls(n, e, t) {
  let { value: s } = n;
  return Ot(s) && s >= 0 ? t + s.toString(e) : $(n);
}
var It = {
    identify: (n) => Ot(n) && n >= 0,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^0o[0-7]+$/,
    resolve: (n, e, t) => es(n, 2, 8, t),
    stringify: (n) => Ls(n, 8, "0o"),
  },
  Lt = {
    identify: Ot,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9]+$/,
    resolve: (n, e, t) => es(n, 0, 10, t),
    stringify: $,
  },
  Pt = {
    identify: (n) => Ot(n) && n >= 0,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^0x[0-9a-fA-F]+$/,
    resolve: (n, e, t) => es(n, 2, 16, t),
    stringify: (n) => Ls(n, 16, "0x"),
  };
var Ps = [Y, G, pe, Se, Ke, It, Lt, Pt, Ct, Nt, At];
function Ms(n) {
  return typeof n == "bigint" || Number.isInteger(n);
}
var Mt = ({ value: n }) => JSON.stringify(n),
  Rn = [
    {
      identify: (n) => typeof n == "string",
      default: !0,
      tag: "tag:yaml.org,2002:str",
      resolve: (n) => n,
      stringify: Mt,
    },
    {
      identify: (n) => n == null,
      createNode: () => new S(null),
      default: !0,
      tag: "tag:yaml.org,2002:null",
      test: /^null$/,
      resolve: () => null,
      stringify: Mt,
    },
    {
      identify: (n) => typeof n == "boolean",
      default: !0,
      tag: "tag:yaml.org,2002:bool",
      test: /^true|false$/,
      resolve: (n) => n === "true",
      stringify: Mt,
    },
    {
      identify: Ms,
      default: !0,
      tag: "tag:yaml.org,2002:int",
      test: /^-?(?:0|[1-9][0-9]*)$/,
      resolve: (n, e, { intAsBigInt: t }) => (t ? BigInt(n) : parseInt(n, 10)),
      stringify: ({ value: n }) => (Ms(n) ? n.toString() : JSON.stringify(n)),
    },
    {
      identify: (n) => typeof n == "number",
      default: !0,
      tag: "tag:yaml.org,2002:float",
      test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
      resolve: (n) => parseFloat(n),
      stringify: Mt,
    },
  ],
  jn = {
    default: !0,
    tag: "",
    test: /^/,
    resolve(n, e) {
      return e(`Unresolved plain scalar ${JSON.stringify(n)}`), n;
    },
  },
  $s = [Y, G].concat(Rn, jn);
var qe = {
  identify: (n) => n instanceof Uint8Array,
  default: !1,
  tag: "tag:yaml.org,2002:binary",
  resolve(n, e) {
    if (typeof Buffer == "function") return Buffer.from(n, "base64");
    if (typeof atob == "function") {
      let t = atob(n.replace(/[\n\r]/g, "")),
        s = new Uint8Array(t.length);
      for (let i = 0; i < t.length; ++i) s[i] = t.charCodeAt(i);
      return s;
    } else
      return (
        e(
          "This environment does not support reading binary tags; either Buffer or atob is required",
        ),
        n
      );
  },
  stringify({ comment: n, type: e, value: t }, s, i, r) {
    let o = t,
      a;
    if (typeof Buffer == "function")
      a =
        o instanceof Buffer
          ? o.toString("base64")
          : Buffer.from(o.buffer).toString("base64");
    else if (typeof btoa == "function") {
      let l = "";
      for (let c = 0; c < o.length; ++c) l += String.fromCharCode(o[c]);
      a = btoa(l);
    } else
      throw new Error(
        "This environment does not support writing binary tags; either Buffer or btoa is required",
      );
    if ((e || (e = S.BLOCK_LITERAL), e !== S.QUOTE_DOUBLE)) {
      let l = Math.max(
          s.options.lineWidth - s.indent.length,
          s.options.minContentWidth,
        ),
        c = Math.ceil(a.length / l),
        f = new Array(c);
      for (let p = 0, u = 0; p < c; ++p, u += l) f[p] = a.substr(u, l);
      a = f.join(
        e === S.BLOCK_LITERAL
          ? `
`
          : " ",
      );
    }
    return oe({ comment: n, type: e, value: a }, s, i, r);
  },
};
function ts(n, e) {
  if (U(n))
    for (let t = 0; t < n.items.length; ++t) {
      let s = n.items[t];
      if (!T(s)) {
        if (F(s)) {
          s.items.length > 1 &&
            e("Each pair must have its own sequence indicator");
          let i = s.items[0] || new I(new S(null));
          if (
            (s.commentBefore &&
              (i.key.commentBefore = i.key.commentBefore
                ? `${s.commentBefore}
${i.key.commentBefore}`
                : s.commentBefore),
            s.comment)
          ) {
            let r = i.value || i.key;
            r.comment = r.comment
              ? `${s.comment}
${r.comment}`
              : s.comment;
          }
          s = i;
        }
        n.items[t] = T(s) ? s : new I(s);
      }
    }
  else e("Expected a sequence for this tag");
  return n;
}
function ss(n, e, t) {
  let { replacer: s } = t,
    i = new B(n);
  i.tag = "tag:yaml.org,2002:pairs";
  let r = 0;
  if (e && Symbol.iterator in Object(e))
    for (let o of e) {
      typeof s == "function" && (o = s.call(e, String(r++), o));
      let a, l;
      if (Array.isArray(o))
        if (o.length === 2) (a = o[0]), (l = o[1]);
        else throw new TypeError(`Expected [key, value] tuple: ${o}`);
      else if (o && o instanceof Object) {
        let c = Object.keys(o);
        if (c.length === 1) (a = c[0]), (l = o[a]);
        else throw new TypeError(`Expected { key: value } tuple: ${o}`);
      } else a = o;
      i.items.push(Ne(a, l, t));
    }
  return i;
}
var Ve = {
  collection: "seq",
  default: !1,
  tag: "tag:yaml.org,2002:pairs",
  resolve: ts,
  createNode: ss,
};
var he = class extends B {
  constructor() {
    super(),
      (this.add = P.prototype.add.bind(this)),
      (this.delete = P.prototype.delete.bind(this)),
      (this.get = P.prototype.get.bind(this)),
      (this.has = P.prototype.has.bind(this)),
      (this.set = P.prototype.set.bind(this)),
      (this.tag = he.tag);
  }
  toJSON(e, t) {
    if (!t) return super.toJSON(e);
    let s = new Map();
    t && t.onCreate && t.onCreate(s);
    for (let i of this.items) {
      let r, o;
      if (
        (T(i)
          ? ((r = x(i.key, "", t)), (o = x(i.value, r, t)))
          : (r = x(i, "", t)),
        s.has(r))
      )
        throw new Error("Ordered maps must not include duplicate keys");
      s.set(r, o);
    }
    return s;
  }
};
he.tag = "tag:yaml.org,2002:omap";
var Ue = {
  collection: "seq",
  identify: (n) => n instanceof Map,
  nodeClass: he,
  default: !1,
  tag: "tag:yaml.org,2002:omap",
  resolve(n, e) {
    let t = ts(n, e),
      s = [];
    for (let { key: i } of t.items)
      E(i) &&
        (s.includes(i.value)
          ? e(`Ordered maps must not include duplicate keys: ${i.value}`)
          : s.push(i.value));
    return Object.assign(new he(), t);
  },
  createNode(n, e, t) {
    let s = ss(n, e, t),
      i = new he();
    return (i.items = s.items), i;
  },
};
function xs({ value: n, source: e }, t) {
  return e && (n ? ns : is).test.test(e)
    ? e
    : n
      ? t.options.trueStr
      : t.options.falseStr;
}
var ns = {
    identify: (n) => n === !0,
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
    resolve: () => new S(!0),
    stringify: xs,
  },
  is = {
    identify: (n) => n === !1,
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/i,
    resolve: () => new S(!1),
    stringify: xs,
  };
var _s = {
    identify: (n) => typeof n == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?\.(?:inf|Inf|INF|nan|NaN|NAN)$/,
    resolve: (n) =>
      n.slice(-3).toLowerCase() === "nan"
        ? NaN
        : n[0] === "-"
          ? Number.NEGATIVE_INFINITY
          : Number.POSITIVE_INFINITY,
    stringify: $,
  },
  Bs = {
    identify: (n) => typeof n == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
    resolve: (n) => parseFloat(n.replace(/_/g, "")),
    stringify(n) {
      let e = Number(n.value);
      return isFinite(e) ? e.toExponential() : $(n);
    },
  },
  Ds = {
    identify: (n) => typeof n == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
    resolve(n) {
      let e = new S(parseFloat(n.replace(/_/g, ""))),
        t = n.indexOf(".");
      if (t !== -1) {
        let s = n.substring(t + 1).replace(/_/g, "");
        s[s.length - 1] === "0" && (e.minFractionDigits = s.length);
      }
      return e;
    },
    stringify: $,
  };
var We = (n) => typeof n == "bigint" || Number.isInteger(n);
function $t(n, e, t, { intAsBigInt: s }) {
  let i = n[0];
  if (
    ((i === "-" || i === "+") && (e += 1),
    (n = n.substring(e).replace(/_/g, "")),
    s)
  ) {
    switch (t) {
      case 2:
        n = `0b${n}`;
        break;
      case 8:
        n = `0o${n}`;
        break;
      case 16:
        n = `0x${n}`;
        break;
    }
    let o = BigInt(n);
    return i === "-" ? BigInt(-1) * o : o;
  }
  let r = parseInt(n, t);
  return i === "-" ? -1 * r : r;
}
function rs(n, e, t) {
  let { value: s } = n;
  if (We(s)) {
    let i = s.toString(e);
    return s < 0 ? "-" + t + i.substr(1) : t + i;
  }
  return $(n);
}
var Fs = {
    identify: We,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "BIN",
    test: /^[-+]?0b[0-1_]+$/,
    resolve: (n, e, t) => $t(n, 2, 2, t),
    stringify: (n) => rs(n, 2, "0b"),
  },
  Rs = {
    identify: We,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^[-+]?0[0-7_]+$/,
    resolve: (n, e, t) => $t(n, 1, 8, t),
    stringify: (n) => rs(n, 8, "0"),
  },
  js = {
    identify: We,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9][0-9_]*$/,
    resolve: (n, e, t) => $t(n, 0, 10, t),
    stringify: $,
  },
  Ks = {
    identify: We,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^[-+]?0x[0-9a-fA-F_]+$/,
    resolve: (n, e, t) => $t(n, 2, 16, t),
    stringify: (n) => rs(n, 16, "0x"),
  };
var de = class extends P {
  constructor(e) {
    super(e), (this.tag = de.tag);
  }
  add(e) {
    let t;
    T(e)
      ? (t = e)
      : typeof e == "object" && "key" in e && "value" in e && e.value === null
        ? (t = new I(e.key, null))
        : (t = new I(e, null)),
      ue(this.items, t.key) || this.items.push(t);
  }
  get(e, t) {
    let s = ue(this.items, e);
    return !t && T(s) ? (E(s.key) ? s.key.value : s.key) : s;
  }
  set(e, t) {
    if (typeof t != "boolean")
      throw new Error(
        `Expected boolean value for set(key, value) in a YAML set, not ${typeof t}`,
      );
    let s = ue(this.items, e);
    s && !t
      ? this.items.splice(this.items.indexOf(s), 1)
      : !s && t && this.items.push(new I(e));
  }
  toJSON(e, t) {
    return super.toJSON(e, t, Set);
  }
  toString(e, t, s) {
    if (!e) return JSON.stringify(this);
    if (this.hasAllNullValues(!0))
      return super.toString(Object.assign({}, e, { allNullValues: !0 }), t, s);
    throw new Error("Set items must all have null values");
  }
};
de.tag = "tag:yaml.org,2002:set";
var He = {
  collection: "map",
  identify: (n) => n instanceof Set,
  nodeClass: de,
  default: !1,
  tag: "tag:yaml.org,2002:set",
  resolve(n, e) {
    if (F(n)) {
      if (n.hasAllNullValues(!0)) return Object.assign(new de(), n);
      e("Set items must all have null values");
    } else e("Expected a mapping for this tag");
    return n;
  },
  createNode(n, e, t) {
    let { replacer: s } = t,
      i = new de(n);
    if (e && Symbol.iterator in Object(e))
      for (let r of e)
        typeof s == "function" && (r = s.call(e, r, r)),
          i.items.push(Ne(r, null, t));
    return i;
  },
};
function os(n, e) {
  let t = n[0],
    s = t === "-" || t === "+" ? n.substring(1) : n,
    i = (o) => (e ? BigInt(o) : Number(o)),
    r = s
      .replace(/_/g, "")
      .split(":")
      .reduce((o, a) => o * i(60) + i(a), i(0));
  return t === "-" ? i(-1) * r : r;
}
function qs(n) {
  let { value: e } = n,
    t = (o) => o;
  if (typeof e == "bigint") t = (o) => BigInt(o);
  else if (isNaN(e) || !isFinite(e)) return $(n);
  let s = "";
  e < 0 && ((s = "-"), (e *= t(-1)));
  let i = t(60),
    r = [e % i];
  return (
    e < 60
      ? r.unshift(0)
      : ((e = (e - r[0]) / i),
        r.unshift(e % i),
        e >= 60 && ((e = (e - r[0]) / i), r.unshift(e))),
    s +
      r
        .map((o) => (o < 10 ? "0" + String(o) : String(o)))
        .join(":")
        .replace(/000000\d*$/, "")
  );
}
var xt = {
    identify: (n) => typeof n == "bigint" || Number.isInteger(n),
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
    resolve: (n, e, { intAsBigInt: t }) => os(n, t),
    stringify: qs,
  },
  _t = {
    identify: (n) => typeof n == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
    resolve: (n) => os(n, !1),
    stringify: qs,
  },
  Ae = {
    identify: (n) => n instanceof Date,
    default: !0,
    tag: "tag:yaml.org,2002:timestamp",
    test: RegExp(
      "^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$",
    ),
    resolve(n) {
      let e = n.match(Ae.test);
      if (!e)
        throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
      let [, t, s, i, r, o, a] = e.map(Number),
        l = e[7] ? Number((e[7] + "00").substr(1, 3)) : 0,
        c = Date.UTC(t, s - 1, i, r || 0, o || 0, a || 0, l),
        f = e[8];
      if (f && f !== "Z") {
        let p = os(f, !1);
        Math.abs(p) < 30 && (p *= 60), (c -= 6e4 * p);
      }
      return new Date(c);
    },
    stringify: ({ value: n }) =>
      n.toISOString().replace(/((T00:00)?:00)?\.000Z$/, ""),
  };
var as = [
  Y,
  G,
  pe,
  Se,
  ns,
  is,
  Fs,
  Rs,
  js,
  Ks,
  _s,
  Bs,
  Ds,
  qe,
  Ue,
  Ve,
  He,
  xt,
  _t,
  Ae,
];
var Vs = new Map([
    ["core", Ps],
    ["failsafe", [Y, G, pe]],
    ["json", $s],
    ["yaml11", as],
    ["yaml-1.1", as],
  ]),
  Us = {
    binary: qe,
    bool: Ke,
    float: At,
    floatExp: Nt,
    floatNaN: Ct,
    floatTime: _t,
    int: Lt,
    intHex: Pt,
    intOct: It,
    intTime: xt,
    map: Y,
    null: Se,
    omap: Ue,
    pairs: Ve,
    seq: G,
    set: He,
    timestamp: Ae,
  },
  Ws = {
    "tag:yaml.org,2002:binary": qe,
    "tag:yaml.org,2002:omap": Ue,
    "tag:yaml.org,2002:pairs": Ve,
    "tag:yaml.org,2002:set": He,
    "tag:yaml.org,2002:timestamp": Ae,
  };
function Bt(n, e) {
  let t = Vs.get(e);
  if (!t)
    if (Array.isArray(n)) t = [];
    else {
      let s = Array.from(Vs.keys())
        .filter((i) => i !== "yaml11")
        .map((i) => JSON.stringify(i))
        .join(", ");
      throw new Error(
        `Unknown schema "${e}"; use one of ${s} or define customTags array`,
      );
    }
  if (Array.isArray(n)) for (let s of n) t = t.concat(s);
  else typeof n == "function" && (t = n(t.slice()));
  return t.map((s) => {
    if (typeof s != "string") return s;
    let i = Us[s];
    if (i) return i;
    let r = Object.keys(Us)
      .map((o) => JSON.stringify(o))
      .join(", ");
    throw new Error(`Unknown custom tag "${s}"; use one of ${r}`);
  });
}
var Kn = (n, e) => (n.key < e.key ? -1 : n.key > e.key ? 1 : 0),
  ke = class {
    constructor({
      compat: e,
      customTags: t,
      merge: s,
      resolveKnownTags: i,
      schema: r,
      sortMapEntries: o,
      toStringDefaults: a,
    }) {
      (this.compat = Array.isArray(e)
        ? Bt(e, "compat")
        : e
          ? Bt(null, e)
          : null),
        (this.merge = !!s),
        (this.name = (typeof r == "string" && r) || "core"),
        (this.knownTags = i ? Ws : {}),
        (this.tags = Bt(t, this.name)),
        (this.toStringOptions = a || null),
        Object.defineProperty(this, q, { value: Y }),
        Object.defineProperty(this, R, { value: pe }),
        Object.defineProperty(this, se, { value: G }),
        (this.sortMapEntries = o === !0 ? Kn : o || null);
    }
    clone() {
      let e = Object.create(
        ke.prototype,
        Object.getOwnPropertyDescriptors(this),
      );
      return (e.tags = this.tags.slice()), e;
    }
  };
function Hs(n, e) {
  let t = [],
    s = e.directives === !0;
  if (e.directives !== !1 && n.directives) {
    let c = n.directives.toString(n);
    c ? (t.push(c), (s = !0)) : n.directives.marker && (s = !0);
  }
  s && t.push("---");
  let i = St(n, e),
    { commentString: r } = i.options;
  if (n.commentBefore) {
    t.length !== 1 && t.unshift("");
    let c = r(n.commentBefore);
    t.unshift(z(c, ""));
  }
  let o = !1,
    a = null;
  if (n.contents) {
    if (N(n.contents)) {
      if (
        (n.contents.spaceBefore && s && t.push(""), n.contents.commentBefore)
      ) {
        let p = r(n.contents.commentBefore);
        t.push(z(p, ""));
      }
      (i.forceBlockIndent = !!n.comment), (a = n.contents.comment);
    }
    let c = a ? void 0 : () => (o = !0),
      f = J(n.contents, i, () => (a = null), c);
    a && (f += H(f, "", r(a))),
      (f[0] === "|" || f[0] === ">") && t[t.length - 1] === "---"
        ? (t[t.length - 1] = `--- ${f}`)
        : t.push(f);
  } else t.push(J(n.contents, i));
  let l = n.comment;
  return (
    l && o && (l = l.replace(/^\n+/, "")),
    l &&
      ((!o || a) && t[t.length - 1] !== "" && t.push(""), t.push(z(r(l), ""))),
    t.join(`
`) +
      `
`
  );
}
function Oe(n, e, t, s) {
  if (s && typeof s == "object")
    if (Array.isArray(s))
      for (let i = 0, r = s.length; i < r; ++i) {
        let o = s[i],
          a = Oe(n, s, String(i), o);
        a === void 0 ? delete s[i] : a !== o && (s[i] = a);
      }
    else if (s instanceof Map)
      for (let i of Array.from(s.keys())) {
        let r = s.get(i),
          o = Oe(n, s, i, r);
        o === void 0 ? s.delete(i) : o !== r && s.set(i, o);
      }
    else if (s instanceof Set)
      for (let i of Array.from(s)) {
        let r = Oe(n, s, i, i);
        r === void 0 ? s.delete(i) : r !== i && (s.delete(i), s.add(r));
      }
    else
      for (let [i, r] of Object.entries(s)) {
        let o = Oe(n, s, i, r);
        o === void 0 ? delete s[i] : o !== r && (s[i] = o);
      }
  return n.call(e, t, s);
}
var X = class {
  constructor(e, t, s) {
    (this.commentBefore = null),
      (this.comment = null),
      (this.errors = []),
      (this.warnings = []),
      Object.defineProperty(this, _, { value: pt });
    let i = null;
    typeof t == "function" || Array.isArray(t)
      ? (i = t)
      : s === void 0 && t && ((s = t), (t = void 0));
    let r = Object.assign({}, je, s);
    this.options = r;
    let { version: o } = r;
    s != null && s.directives
      ? ((this.directives = s.directives.atDocument()),
        this.directives.yaml.explicit && (o = this.directives.yaml.version))
      : (this.directives = new L({ version: o })),
      this.setSchema(o, s),
      e === void 0
        ? (this.contents = null)
        : (this.contents = this.createNode(e, i, s));
  }
  clone() {
    let e = Object.create(X.prototype, { [_]: { value: pt } });
    return (
      (e.commentBefore = this.commentBefore),
      (e.comment = this.comment),
      (e.errors = this.errors.slice()),
      (e.warnings = this.warnings.slice()),
      (e.options = Object.assign({}, this.options)),
      this.directives && (e.directives = this.directives.clone()),
      (e.schema = this.schema.clone()),
      (e.contents = N(this.contents)
        ? this.contents.clone(e.schema)
        : this.contents),
      this.range && (e.range = this.range.slice()),
      e
    );
  }
  add(e) {
    Ie(this.contents) && this.contents.add(e);
  }
  addIn(e, t) {
    Ie(this.contents) && this.contents.addIn(e, t);
  }
  createAlias(e, t) {
    if (!e.anchor) {
      let s = Yt(this);
      e.anchor = !t || s.has(t) ? Gt(t || "a", s) : t;
    }
    return new ne(e.anchor);
  }
  createNode(e, t, s) {
    let i;
    if (typeof t == "function") (e = t.call({ "": e }, "", e)), (i = t);
    else if (Array.isArray(t)) {
      let m = (w) =>
          typeof w == "number" || w instanceof String || w instanceof Number,
        g = t.filter(m).map(String);
      g.length > 0 && (t = t.concat(g)), (i = t);
    } else s === void 0 && t && ((s = t), (t = void 0));
    let {
        aliasDuplicateObjects: r,
        anchorPrefix: o,
        flow: a,
        keepUndefined: l,
        onTagObj: c,
        tag: f,
      } = s || {},
      { onAnchor: p, setAnchors: u, sourceObjects: h } = Cs(this, o || "a"),
      y = {
        aliasDuplicateObjects: r != null ? r : !0,
        keepUndefined: l != null ? l : !1,
        onAnchor: p,
        onTagObj: c,
        replacer: i,
        schema: this.schema,
        sourceObjects: h,
      },
      d = ie(e, f, y);
    return a && A(d) && (d.flow = !0), u(), d;
  }
  createPair(e, t, s = {}) {
    let i = this.createNode(e, null, s),
      r = this.createNode(t, null, s);
    return new I(i, r);
  }
  delete(e) {
    return Ie(this.contents) ? this.contents.delete(e) : !1;
  }
  deleteIn(e) {
    return Ce(e)
      ? this.contents == null
        ? !1
        : ((this.contents = null), !0)
      : Ie(this.contents)
        ? this.contents.deleteIn(e)
        : !1;
  }
  get(e, t) {
    return A(this.contents) ? this.contents.get(e, t) : void 0;
  }
  getIn(e, t) {
    return Ce(e)
      ? !t && E(this.contents)
        ? this.contents.value
        : this.contents
      : A(this.contents)
        ? this.contents.getIn(e, t)
        : void 0;
  }
  has(e) {
    return A(this.contents) ? this.contents.has(e) : !1;
  }
  hasIn(e) {
    return Ce(e)
      ? this.contents !== void 0
      : A(this.contents)
        ? this.contents.hasIn(e)
        : !1;
  }
  set(e, t) {
    this.contents == null
      ? (this.contents = _e(this.schema, [e], t))
      : Ie(this.contents) && this.contents.set(e, t);
  }
  setIn(e, t) {
    Ce(e)
      ? (this.contents = t)
      : this.contents == null
        ? (this.contents = _e(this.schema, Array.from(e), t))
        : Ie(this.contents) && this.contents.setIn(e, t);
  }
  setSchema(e, t = {}) {
    typeof e == "number" && (e = String(e));
    let s;
    switch (e) {
      case "1.1":
        this.directives
          ? (this.directives.yaml.version = "1.1")
          : (this.directives = new L({ version: "1.1" })),
          (s = { merge: !0, resolveKnownTags: !1, schema: "yaml-1.1" });
        break;
      case "1.2":
        this.directives
          ? (this.directives.yaml.version = "1.2")
          : (this.directives = new L({ version: "1.2" })),
          (s = { merge: !1, resolveKnownTags: !0, schema: "core" });
        break;
      case null:
        this.directives && delete this.directives, (s = null);
        break;
      default: {
        let i = JSON.stringify(e);
        throw new Error(
          `Expected '1.1', '1.2' or null as first argument, but found: ${i}`,
        );
      }
    }
    if (t.schema instanceof Object) this.schema = t.schema;
    else if (s) this.schema = new ke(Object.assign(s, t));
    else
      throw new Error(
        "With a null YAML version, the { schema: Schema } option is required",
      );
  }
  toJS({
    json: e,
    jsonArg: t,
    mapAsMap: s,
    maxAliasCount: i,
    onAnchor: r,
    reviver: o,
  } = {}) {
    let a = {
        anchors: new Map(),
        doc: this,
        keep: !e,
        mapAsMap: s === !0,
        mapKeyWarned: !1,
        maxAliasCount: typeof i == "number" ? i : 100,
        stringify: J,
      },
      l = x(this.contents, t || "", a);
    if (typeof r == "function")
      for (let { count: c, res: f } of a.anchors.values()) r(f, c);
    return typeof o == "function" ? Oe(o, { "": l }, "", l) : l;
  }
  toJSON(e, t) {
    return this.toJS({ json: !0, jsonArg: e, mapAsMap: !1, onAnchor: t });
  }
  toString(e = {}) {
    if (this.errors.length > 0)
      throw new Error("Document with errors cannot be stringified");
    if (
      "indent" in e &&
      (!Number.isInteger(e.indent) || Number(e.indent) <= 0)
    ) {
      let t = JSON.stringify(e.indent);
      throw new Error(`"indent" option must be a positive integer, not ${t}`);
    }
    return Hs(this, e);
  }
};
function Ie(n) {
  if (A(n)) return !0;
  throw new Error("Expected a YAML collection as document contents");
}
var Je = class extends Error {
    constructor(e, t, s, i) {
      super(),
        (this.name = e),
        (this.code = s),
        (this.message = i),
        (this.pos = t);
    }
  },
  j = class extends Je {
    constructor(e, t, s) {
      super("YAMLParseError", e, t, s);
    }
  },
  Ye = class extends Je {
    constructor(e, t, s) {
      super("YAMLWarning", e, t, s);
    }
  },
  ls = (n, e) => (t) => {
    if (t.pos[0] === -1) return;
    t.linePos = t.pos.map((a) => e.linePos(a));
    let { line: s, col: i } = t.linePos[0];
    t.message += ` at line ${s}, column ${i}`;
    let r = i - 1,
      o = n
        .substring(e.lineStarts[s - 1], e.lineStarts[s])
        .replace(/[\n\r]+$/, "");
    if (r >= 60 && o.length > 80) {
      let a = Math.min(r - 39, o.length - 79);
      (o = "\u2026" + o.substring(a)), (r -= a - 1);
    }
    if (
      (o.length > 80 && (o = o.substring(0, 79) + "\u2026"),
      s > 1 && /^ *$/.test(o.substring(0, r)))
    ) {
      let a = n.substring(e.lineStarts[s - 2], e.lineStarts[s - 1]);
      a.length > 80 &&
        (a =
          a.substring(0, 79) +
          `\u2026
`),
        (o = a + o);
    }
    if (/[^ ]/.test(o)) {
      let a = 1,
        l = t.linePos[1];
      l && l.line === s && l.col > i && (a = Math.min(l.col - i, 80 - r));
      let c = " ".repeat(r) + "^".repeat(a);
      t.message += `:

${o}
${c}
`;
    }
  };
function Z(
  n,
  { flow: e, indicator: t, next: s, offset: i, onError: r, startOnNewline: o },
) {
  let a = !1,
    l = o,
    c = o,
    f = "",
    p = "",
    u = !1,
    h = !1,
    y = null,
    d = null,
    m = null,
    g = null,
    w = null;
  for (let k of n)
    switch (
      (h &&
        (k.type !== "space" &&
          k.type !== "newline" &&
          k.type !== "comma" &&
          r(
            k.offset,
            "MISSING_CHAR",
            "Tags and anchors must be separated from the next token by white space",
          ),
        (h = !1)),
      k.type)
    ) {
      case "space":
        !e &&
          l &&
          t !== "doc-start" &&
          k.source[0] === "	" &&
          r(k, "TAB_AS_INDENT", "Tabs are not allowed as indentation"),
          (c = !0);
        break;
      case "comment": {
        c ||
          r(
            k,
            "MISSING_CHAR",
            "Comments must be separated from other tokens by white space characters",
          );
        let C = k.source.substring(1) || " ";
        f ? (f += p + C) : (f = C), (p = ""), (l = !1);
        break;
      }
      case "newline":
        l ? (f ? (f += k.source) : (a = !0)) : (p += k.source),
          (l = !0),
          (u = !0),
          (c = !0);
        break;
      case "anchor":
        y && r(k, "MULTIPLE_ANCHORS", "A node can have at most one anchor"),
          (y = k),
          w === null && (w = k.offset),
          (l = !1),
          (c = !1),
          (h = !0);
        break;
      case "tag": {
        d && r(k, "MULTIPLE_TAGS", "A node can have at most one tag"),
          (d = k),
          w === null && (w = k.offset),
          (l = !1),
          (c = !1),
          (h = !0);
        break;
      }
      case t:
        (y || d) &&
          r(
            k,
            "BAD_PROP_ORDER",
            `Anchors and tags must be after the ${k.source} indicator`,
          ),
          g &&
            r(
              k,
              "UNEXPECTED_TOKEN",
              `Unexpected ${k.source} in ${e || "collection"}`,
            ),
          (g = k),
          (l = !1),
          (c = !1);
        break;
      case "comma":
        if (e) {
          m && r(k, "UNEXPECTED_TOKEN", `Unexpected , in ${e}`),
            (m = k),
            (l = !1),
            (c = !1);
          break;
        }
      default:
        r(k, "UNEXPECTED_TOKEN", `Unexpected ${k.type} token`),
          (l = !1),
          (c = !1);
    }
  let v = n[n.length - 1],
    b = v ? v.offset + v.source.length : i;
  return (
    h &&
      s &&
      s.type !== "space" &&
      s.type !== "newline" &&
      s.type !== "comma" &&
      (s.type !== "scalar" || s.source !== "") &&
      r(
        s.offset,
        "MISSING_CHAR",
        "Tags and anchors must be separated from the next token by white space",
      ),
    {
      comma: m,
      found: g,
      spaceBefore: a,
      comment: f,
      hasNewline: u,
      anchor: y,
      tag: d,
      end: b,
      start: w != null ? w : b,
    }
  );
}
function me(n) {
  if (!n) return null;
  switch (n.type) {
    case "alias":
    case "scalar":
    case "double-quoted-scalar":
    case "single-quoted-scalar":
      if (
        n.source.includes(`
`)
      )
        return !0;
      if (n.end) {
        for (let e of n.end) if (e.type === "newline") return !0;
      }
      return !1;
    case "flow-collection":
      for (let e of n.items) {
        for (let t of e.start) if (t.type === "newline") return !0;
        if (e.sep) {
          for (let t of e.sep) if (t.type === "newline") return !0;
        }
        if (me(e.key) || me(e.value)) return !0;
      }
      return !1;
    default:
      return !0;
  }
}
function Ge(n, e, t) {
  if ((e == null ? void 0 : e.type) === "flow-collection") {
    let s = e.end[0];
    s.indent === n &&
      (s.source === "]" || s.source === "}") &&
      me(e) &&
      t(
        s,
        "BAD_INDENT",
        "Flow end indicator should be more indented than parent",
        !0,
      );
  }
}
function Dt(n, e, t) {
  let { uniqueKeys: s } = n.options;
  if (s === !1) return !1;
  let i =
    typeof s == "function"
      ? s
      : (r, o) =>
          r === o ||
          (E(r) &&
            E(o) &&
            r.value === o.value &&
            !(r.value === "<<" && n.schema.merge));
  return e.some((r) => i(r.key, t));
}
var Js = "All mapping items must start at the same column";
function Ys({ composeNode: n, composeEmptyNode: e }, t, s, i) {
  var r;
  let o = new P(t.schema);
  t.atRoot && (t.atRoot = !1);
  let a = s.offset;
  for (let l of s.items) {
    let { start: c, key: f, sep: p, value: u } = l,
      h = Z(c, {
        indicator: "explicit-key-ind",
        next: f || (p == null ? void 0 : p[0]),
        offset: a,
        onError: i,
        startOnNewline: !0,
      }),
      y = !h.found;
    if (y) {
      if (
        (f &&
          (f.type === "block-seq"
            ? i(
                a,
                "BLOCK_AS_IMPLICIT_KEY",
                "A block sequence may not be used as an implicit map key",
              )
            : "indent" in f && f.indent !== s.indent && i(a, "BAD_INDENT", Js)),
        !h.anchor && !h.tag && !p)
      ) {
        h.comment &&
          (o.comment
            ? (o.comment +=
                `
` + h.comment)
            : (o.comment = h.comment));
        continue;
      }
    } else
      ((r = h.found) === null || r === void 0 ? void 0 : r.indent) !==
        s.indent && i(a, "BAD_INDENT", Js);
    y &&
      me(f) &&
      i(
        f,
        "MULTILINE_IMPLICIT_KEY",
        "Implicit keys need to be on a single line",
      );
    let d = h.end,
      m = f ? n(t, f, h, i) : e(t, d, c, null, h, i);
    t.schema.compat && Ge(s.indent, f, i),
      Dt(t, o.items, m) && i(d, "DUPLICATE_KEY", "Map keys must be unique");
    let g = Z(p || [], {
      indicator: "map-value-ind",
      next: u,
      offset: m.range[2],
      onError: i,
      startOnNewline: !f || f.type === "block-scalar",
    });
    if (((a = g.end), g.found)) {
      y &&
        ((u == null ? void 0 : u.type) === "block-map" &&
          !g.hasNewline &&
          i(
            a,
            "BLOCK_AS_IMPLICIT_KEY",
            "Nested mappings are not allowed in compact mappings",
          ),
        t.options.strict &&
          h.start < g.found.offset - 1024 &&
          i(
            m.range,
            "KEY_OVER_1024_CHARS",
            "The : indicator must be at most 1024 chars after the start of an implicit block mapping key",
          ));
      let w = u ? n(t, u, g, i) : e(t, a, p, null, g, i);
      t.schema.compat && Ge(s.indent, u, i), (a = w.range[2]);
      let v = new I(m, w);
      t.options.keepSourceTokens && (v.srcToken = l), o.items.push(v);
    } else {
      y &&
        i(
          m.range,
          "MISSING_CHAR",
          "Implicit map keys need to be followed by map values",
        ),
        g.comment &&
          (m.comment
            ? (m.comment +=
                `
` + g.comment)
            : (m.comment = g.comment));
      let w = new I(m);
      t.options.keepSourceTokens && (w.srcToken = l), o.items.push(w);
    }
  }
  return (o.range = [s.offset, a, a]), o;
}
function Gs({ composeNode: n, composeEmptyNode: e }, t, s, i) {
  let r = new B(t.schema);
  t.atRoot && (t.atRoot = !1);
  let o = s.offset;
  for (let { start: a, value: l } of s.items) {
    let c = Z(a, {
      indicator: "seq-item-ind",
      next: l,
      offset: o,
      onError: i,
      startOnNewline: !0,
    });
    if (((o = c.end), !c.found))
      if (c.anchor || c.tag || l)
        l && l.type === "block-seq"
          ? i(
              o,
              "BAD_INDENT",
              "All sequence items must start at the same column",
            )
          : i(o, "MISSING_CHAR", "Sequence item without - indicator");
      else {
        c.comment && (r.comment = c.comment);
        continue;
      }
    let f = l ? n(t, l, c, i) : e(t, o, a, null, c, i);
    t.schema.compat && Ge(s.indent, l, i), (o = f.range[2]), r.items.push(f);
  }
  return (r.range = [s.offset, o, o]), r;
}
function ee(n, e, t, s) {
  let i = "";
  if (n) {
    let r = !1,
      o = "";
    for (let a of n) {
      let { source: l, type: c } = a;
      switch (c) {
        case "space":
          r = !0;
          break;
        case "comment": {
          t &&
            !r &&
            s(
              a,
              "MISSING_CHAR",
              "Comments must be separated from other tokens by white space characters",
            );
          let f = l.substring(1) || " ";
          i ? (i += o + f) : (i = f), (o = "");
          break;
        }
        case "newline":
          i && (o += l), (r = !0);
          break;
        default:
          s(a, "UNEXPECTED_TOKEN", `Unexpected ${c} at node end`);
      }
      e += l.length;
    }
  }
  return { comment: i, offset: e };
}
var cs = "Block collections are not allowed within flow collections",
  fs = (n) => n && (n.type === "block-map" || n.type === "block-seq");
function Qs({ composeNode: n, composeEmptyNode: e }, t, s, i) {
  let r = s.start.source === "{",
    o = r ? "flow map" : "flow sequence",
    a = r ? new P(t.schema) : new B(t.schema);
  a.flow = !0;
  let l = t.atRoot;
  l && (t.atRoot = !1);
  let c = s.offset + s.start.source.length;
  for (let y = 0; y < s.items.length; ++y) {
    let d = s.items[y],
      { start: m, key: g, sep: w, value: v } = d,
      b = Z(m, {
        flow: o,
        indicator: "explicit-key-ind",
        next: g || (w == null ? void 0 : w[0]),
        offset: c,
        onError: i,
        startOnNewline: !1,
      });
    if (!b.found) {
      if (!b.anchor && !b.tag && !w && !v) {
        y === 0 && b.comma
          ? i(b.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${o}`)
          : y < s.items.length - 1 &&
            i(b.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${o}`),
          b.comment &&
            (a.comment
              ? (a.comment +=
                  `
` + b.comment)
              : (a.comment = b.comment)),
          (c = b.end);
        continue;
      }
      !r &&
        t.options.strict &&
        me(g) &&
        i(
          g,
          "MULTILINE_IMPLICIT_KEY",
          "Implicit keys of flow sequence pairs need to be on a single line",
        );
    }
    if (y === 0)
      b.comma && i(b.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${o}`);
    else if (
      (b.comma || i(b.start, "MISSING_CHAR", `Missing , between ${o} items`),
      b.comment)
    ) {
      let k = "";
      e: for (let C of m)
        switch (C.type) {
          case "comma":
          case "space":
            break;
          case "comment":
            k = C.source.substring(1);
            break e;
          default:
            break e;
        }
      if (k) {
        let C = a.items[a.items.length - 1];
        T(C) && (C = C.value || C.key),
          C.comment
            ? (C.comment +=
                `
` + k)
            : (C.comment = k),
          (b.comment = b.comment.substring(k.length + 1));
      }
    }
    if (!r && !w && !b.found) {
      let k = v ? n(t, v, b, i) : e(t, b.end, w, null, b, i);
      a.items.push(k),
        (c = k.range[2]),
        fs(v) && i(k.range, "BLOCK_IN_FLOW", cs);
    } else {
      let k = b.end,
        C = g ? n(t, g, b, i) : e(t, k, m, null, b, i);
      fs(g) && i(C.range, "BLOCK_IN_FLOW", cs);
      let D = Z(w || [], {
        flow: o,
        indicator: "map-value-ind",
        next: v,
        offset: C.range[2],
        onError: i,
        startOnNewline: !1,
      });
      if (D.found) {
        if (!r && !b.found && t.options.strict) {
          if (w)
            for (let Q of w) {
              if (Q === D.found) break;
              if (Q.type === "newline") {
                i(
                  Q,
                  "MULTILINE_IMPLICIT_KEY",
                  "Implicit keys of flow sequence pairs need to be on a single line",
                );
                break;
              }
            }
          b.start < D.found.offset - 1024 &&
            i(
              D.found,
              "KEY_OVER_1024_CHARS",
              "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key",
            );
        }
      } else
        v &&
          ("source" in v && v.source && v.source[0] === ":"
            ? i(v, "MISSING_CHAR", `Missing space after : in ${o}`)
            : i(D.start, "MISSING_CHAR", `Missing , or : between ${o} items`));
      let Me = v ? n(t, v, D, i) : D.found ? e(t, D.end, w, null, D, i) : null;
      Me
        ? fs(v) && i(Me.range, "BLOCK_IN_FLOW", cs)
        : D.comment &&
          (C.comment
            ? (C.comment +=
                `
` + D.comment)
            : (C.comment = D.comment));
      let Wt = new I(C, Me);
      if ((t.options.keepSourceTokens && (Wt.srcToken = d), r)) {
        let Q = a;
        Dt(t, Q.items, C) && i(k, "DUPLICATE_KEY", "Map keys must be unique"),
          Q.items.push(Wt);
      } else {
        let Q = new P(t.schema);
        (Q.flow = !0), Q.items.push(Wt), a.items.push(Q);
      }
      c = Me ? Me.range[2] : D.end;
    }
  }
  let f = r ? "}" : "]",
    [p, ...u] = s.end,
    h = c;
  if (p && p.source === f) h = p.offset + p.source.length;
  else {
    let y = o[0].toUpperCase() + o.substring(1),
      d = l
        ? `${y} must end with a ${f}`
        : `${y} in block collection must be sufficiently indented and end with a ${f}`;
    i(c, l ? "MISSING_CHAR" : "BAD_INDENT", d),
      p && p.source.length !== 1 && u.unshift(p);
  }
  if (u.length > 0) {
    let y = ee(u, h, t.options.strict, i);
    y.comment &&
      (a.comment
        ? (a.comment +=
            `
` + y.comment)
        : (a.comment = y.comment)),
      (a.range = [s.offset, h, y.offset]);
  } else a.range = [s.offset, h, h];
  return a;
}
function zs(n, e, t, s, i) {
  let r;
  switch (t.type) {
    case "block-map": {
      r = Ys(n, e, t, i);
      break;
    }
    case "block-seq": {
      r = Gs(n, e, t, i);
      break;
    }
    case "flow-collection": {
      r = Qs(n, e, t, i);
      break;
    }
  }
  if (!s) return r;
  let o = e.directives.tagName(s.source, (u) => i(s, "TAG_RESOLVE_FAILED", u));
  if (!o) return r;
  let a = r.constructor;
  if (o === "!" || o === a.tagName) return (r.tag = a.tagName), r;
  let l = F(r) ? "map" : "seq",
    c = e.schema.tags.find((u) => u.collection === l && u.tag === o);
  if (!c) {
    let u = e.schema.knownTags[o];
    if (u && u.collection === l)
      e.schema.tags.push(Object.assign({}, u, { default: !1 })), (c = u);
    else
      return (
        i(s, "TAG_RESOLVE_FAILED", `Unresolved tag: ${o}`, !0), (r.tag = o), r
      );
  }
  let f = c.resolve(r, (u) => i(s, "TAG_RESOLVE_FAILED", u), e.options),
    p = N(f) ? f : new S(f);
  return (
    (p.range = r.range),
    (p.tag = o),
    c != null && c.format && (p.format = c.format),
    p
  );
}
function Ft(n, e, t) {
  let s = n.offset,
    i = qn(n, e, t);
  if (!i) return { value: "", type: null, comment: "", range: [s, s, s] };
  let r = i.mode === ">" ? S.BLOCK_FOLDED : S.BLOCK_LITERAL,
    o = n.source ? Vn(n.source) : [],
    a = o.length;
  for (let d = o.length - 1; d >= 0; --d) {
    let m = o[d][1];
    if (m === "" || m === "\r") a = d;
    else break;
  }
  if (!n.source || a === 0) {
    let d =
        i.chomp === "+"
          ? `
`.repeat(Math.max(0, o.length - 1))
          : "",
      m = s + i.length;
    return (
      n.source && (m += n.source.length),
      { value: d, type: r, comment: i.comment, range: [s, m, m] }
    );
  }
  let l = n.indent + i.indent,
    c = n.offset + i.length,
    f = 0;
  for (let d = 0; d < a; ++d) {
    let [m, g] = o[d];
    if (g === "" || g === "\r")
      i.indent === 0 && m.length > l && (l = m.length);
    else {
      if (m.length < l) {
        let w =
          "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
        t(c + m.length, "MISSING_CHAR", w);
      }
      i.indent === 0 && (l = m.length), (f = d);
      break;
    }
    c += m.length + g.length + 1;
  }
  let p = "",
    u = "",
    h = !1;
  for (let d = 0; d < f; ++d)
    p +=
      o[d][0].slice(l) +
      `
`;
  for (let d = f; d < a; ++d) {
    let [m, g] = o[d];
    c += m.length + g.length + 1;
    let w = g[g.length - 1] === "\r";
    if ((w && (g = g.slice(0, -1)), g && m.length < l)) {
      let b = `Block scalar lines must not be less indented than their ${i.indent ? "explicit indentation indicator" : "first line"}`;
      t(c - g.length - (w ? 2 : 1), "BAD_INDENT", b), (m = "");
    }
    r === S.BLOCK_LITERAL
      ? ((p += u + m.slice(l) + g),
        (u = `
`))
      : m.length > l || g[0] === "	"
        ? (u === " "
            ? (u = `
`)
            : !h &&
              u ===
                `
` &&
              (u = `

`),
          (p += u + m.slice(l) + g),
          (u = `
`),
          (h = !0))
        : g === ""
          ? u ===
            `
`
            ? (p += `
`)
            : (u = `
`)
          : ((p += u + g), (u = " "), (h = !1));
  }
  switch (i.chomp) {
    case "-":
      break;
    case "+":
      for (let d = a; d < o.length; ++d)
        p +=
          `
` + o[d][0].slice(l);
      p[p.length - 1] !==
        `
` &&
        (p += `
`);
      break;
    default:
      p += `
`;
  }
  let y = s + i.length + n.source.length;
  return { value: p, type: r, comment: i.comment, range: [s, y, y] };
}
function qn({ offset: n, props: e }, t, s) {
  if (e[0].type !== "block-scalar-header")
    return s(e[0], "IMPOSSIBLE", "Block scalar header not found"), null;
  let { source: i } = e[0],
    r = i[0],
    o = 0,
    a = "",
    l = -1;
  for (let u = 1; u < i.length; ++u) {
    let h = i[u];
    if (!a && (h === "-" || h === "+")) a = h;
    else {
      let y = Number(h);
      !o && y ? (o = y) : l === -1 && (l = n + u);
    }
  }
  l !== -1 &&
    s(
      l,
      "UNEXPECTED_TOKEN",
      `Block scalar header includes extra characters: ${i}`,
    );
  let c = !1,
    f = "",
    p = i.length;
  for (let u = 1; u < e.length; ++u) {
    let h = e[u];
    switch (h.type) {
      case "space":
        c = !0;
      case "newline":
        p += h.source.length;
        break;
      case "comment":
        t &&
          !c &&
          s(
            h,
            "MISSING_CHAR",
            "Comments must be separated from other tokens by white space characters",
          ),
          (p += h.source.length),
          (f = h.source.substring(1));
        break;
      case "error":
        s(h, "UNEXPECTED_TOKEN", h.message), (p += h.source.length);
        break;
      default: {
        let y = `Unexpected token in block scalar header: ${h.type}`;
        s(h, "UNEXPECTED_TOKEN", y);
        let d = h.source;
        d && typeof d == "string" && (p += d.length);
      }
    }
  }
  return { mode: r, indent: o, chomp: a, comment: f, length: p };
}
function Vn(n) {
  let e = n.split(/\n( *)/),
    t = e[0],
    s = t.match(/^( *)/),
    r = [s && s[1] ? [s[1], t.slice(s[1].length)] : ["", t]];
  for (let o = 1; o < e.length; o += 2) r.push([e[o], e[o + 1]]);
  return r;
}
function Rt(n, e, t) {
  let { offset: s, type: i, source: r, end: o } = n,
    a,
    l,
    c = (u, h, y) => t(s + u, h, y);
  switch (i) {
    case "scalar":
      (a = S.PLAIN), (l = Un(r, c));
      break;
    case "single-quoted-scalar":
      (a = S.QUOTE_SINGLE), (l = Wn(r, c));
      break;
    case "double-quoted-scalar":
      (a = S.QUOTE_DOUBLE), (l = Hn(r, c));
      break;
    default:
      return (
        t(
          n,
          "UNEXPECTED_TOKEN",
          `Expected a flow scalar value, but found: ${i}`,
        ),
        {
          value: "",
          type: null,
          comment: "",
          range: [s, s + r.length, s + r.length],
        }
      );
  }
  let f = s + r.length,
    p = ee(o, f, e, t);
  return { value: l, type: a, comment: p.comment, range: [s, f, p.offset] };
}
function Un(n, e) {
  let t = "";
  switch (n[0]) {
    case "	":
      t = "a tab character";
      break;
    case ",":
      t = "flow indicator character ,";
      break;
    case "%":
      t = "directive indicator character %";
      break;
    case "|":
    case ">": {
      t = `block scalar indicator ${n[0]}`;
      break;
    }
    case "@":
    case "`": {
      t = `reserved character ${n[0]}`;
      break;
    }
  }
  return (
    t && e(0, "BAD_SCALAR_START", `Plain value cannot start with ${t}`), Xs(n)
  );
}
function Wn(n, e) {
  return (
    (n[n.length - 1] !== "'" || n.length === 1) &&
      e(n.length, "MISSING_CHAR", "Missing closing 'quote"),
    Xs(n.slice(1, -1)).replace(/''/g, "'")
  );
}
function Xs(n) {
  let e, t;
  try {
    (e = new RegExp(
      `(.*?)(?<![ 	])[ 	]*\r?
`,
      "sy",
    )),
      (t = new RegExp(
        `[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`,
        "sy",
      ));
  } catch (l) {
    (e = /(.*?)[ \t]*\r?\n/sy), (t = /[ \t]*(.*?)[ \t]*\r?\n/sy);
  }
  let s = e.exec(n);
  if (!s) return n;
  let i = s[1],
    r = " ",
    o = e.lastIndex;
  for (t.lastIndex = o; (s = t.exec(n)); )
    s[1] === ""
      ? r ===
        `
`
        ? (i += r)
        : (r = `
`)
      : ((i += r + s[1]), (r = " ")),
      (o = t.lastIndex);
  let a = /[ \t]*(.*)/sy;
  return (a.lastIndex = o), (s = a.exec(n)), i + r + ((s && s[1]) || "");
}
function Hn(n, e) {
  let t = "";
  for (let s = 1; s < n.length - 1; ++s) {
    let i = n[s];
    if (
      !(
        i === "\r" &&
        n[s + 1] ===
          `
`
      )
    )
      if (
        i ===
        `
`
      ) {
        let { fold: r, offset: o } = Jn(n, s);
        (t += r), (s = o);
      } else if (i === "\\") {
        let r = n[++s],
          o = Yn[r];
        if (o) t += o;
        else if (
          r ===
          `
`
        )
          for (r = n[s + 1]; r === " " || r === "	"; ) r = n[++s + 1];
        else if (
          r === "\r" &&
          n[s + 1] ===
            `
`
        )
          for (r = n[++s + 1]; r === " " || r === "	"; ) r = n[++s + 1];
        else if (r === "x" || r === "u" || r === "U") {
          let a = { x: 2, u: 4, U: 8 }[r];
          (t += Gn(n, s + 1, a, e)), (s += a);
        } else {
          let a = n.substr(s - 1, 2);
          e(s - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${a}`), (t += a);
        }
      } else if (i === " " || i === "	") {
        let r = s,
          o = n[s + 1];
        for (; o === " " || o === "	"; ) o = n[++s + 1];
        o !==
          `
` &&
          !(
            o === "\r" &&
            n[s + 2] ===
              `
`
          ) &&
          (t += s > r ? n.slice(r, s + 1) : i);
      } else t += i;
  }
  return (
    (n[n.length - 1] !== '"' || n.length === 1) &&
      e(n.length, "MISSING_CHAR", 'Missing closing "quote'),
    t
  );
}
function Jn(n, e) {
  let t = "",
    s = n[e + 1];
  for (
    ;
    (s === " " ||
      s === "	" ||
      s ===
        `
` ||
      s === "\r") &&
    !(
      s === "\r" &&
      n[e + 2] !==
        `
`
    );

  )
    s ===
      `
` &&
      (t += `
`),
      (e += 1),
      (s = n[e + 1]);
  return t || (t = " "), { fold: t, offset: e };
}
var Yn = {
  0: "\0",
  a: "\x07",
  b: "\b",
  e: "\x1B",
  f: "\f",
  n: `
`,
  r: "\r",
  t: "	",
  v: "\v",
  N: "\x85",
  _: "\xA0",
  L: "\u2028",
  P: "\u2029",
  " ": " ",
  '"': '"',
  "/": "/",
  "\\": "\\",
  "	": "	",
};
function Gn(n, e, t, s) {
  let i = n.substr(e, t),
    o = i.length === t && /^[0-9a-fA-F]+$/.test(i) ? parseInt(i, 16) : NaN;
  if (isNaN(o)) {
    let a = n.substr(e - 2, t + 2);
    return s(e - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${a}`), a;
  }
  return String.fromCodePoint(o);
}
function us(n, e, t, s) {
  let {
      value: i,
      type: r,
      comment: o,
      range: a,
    } = e.type === "block-scalar"
      ? Ft(e, n.options.strict, s)
      : Rt(e, n.options.strict, s),
    l = t
      ? n.directives.tagName(t.source, (p) => s(t, "TAG_RESOLVE_FAILED", p))
      : null,
    c =
      t && l
        ? Qn(n.schema, i, l, t, s)
        : e.type === "scalar"
          ? zn(n, i, e, s)
          : n.schema[R],
    f;
  try {
    let p = c.resolve(i, (u) => s(t || e, "TAG_RESOLVE_FAILED", u), n.options);
    f = E(p) ? p : new S(p);
  } catch (p) {
    let u = p instanceof Error ? p.message : String(p);
    s(t || e, "TAG_RESOLVE_FAILED", u), (f = new S(i));
  }
  return (
    (f.range = a),
    (f.source = i),
    r && (f.type = r),
    l && (f.tag = l),
    c.format && (f.format = c.format),
    o && (f.comment = o),
    f
  );
}
function Qn(n, e, t, s, i) {
  var r;
  if (t === "!") return n[R];
  let o = [];
  for (let l of n.tags)
    if (!l.collection && l.tag === t)
      if (l.default && l.test) o.push(l);
      else return l;
  for (let l of o)
    if (!((r = l.test) === null || r === void 0) && r.test(e)) return l;
  let a = n.knownTags[t];
  return a && !a.collection
    ? (n.tags.push(Object.assign({}, a, { default: !1, test: void 0 })), a)
    : (i(
        s,
        "TAG_RESOLVE_FAILED",
        `Unresolved tag: ${t}`,
        t !== "tag:yaml.org,2002:str",
      ),
      n[R]);
}
function zn({ directives: n, schema: e }, t, s, i) {
  let r =
    e.tags.find((o) => {
      var a;
      return (
        o.default &&
        ((a = o.test) === null || a === void 0 ? void 0 : a.test(t))
      );
    }) || e[R];
  if (e.compat) {
    let o =
      e.compat.find((a) => {
        var l;
        return (
          a.default &&
          ((l = a.test) === null || l === void 0 ? void 0 : l.test(t))
        );
      }) || e[R];
    if (r.tag !== o.tag) {
      let a = n.tagString(r.tag),
        l = n.tagString(o.tag),
        c = `Value may be parsed as either ${a} or ${l}`;
      i(s, "TAG_RESOLVE_FAILED", c, !0);
    }
  }
  return r;
}
function Zs(n, e, t) {
  if (e) {
    t === null && (t = e.length);
    for (let s = t - 1; s >= 0; --s) {
      let i = e[s];
      switch (i.type) {
        case "space":
        case "comment":
        case "newline":
          n -= i.source.length;
          continue;
      }
      for (i = e[++s]; (i == null ? void 0 : i.type) === "space"; )
        (n += i.source.length), (i = e[++s]);
      break;
    }
  }
  return n;
}
var Xn = { composeNode: ps, composeEmptyNode: hs };
function ps(n, e, t, s) {
  let { spaceBefore: i, comment: r, anchor: o, tag: a } = t,
    l;
  switch (e.type) {
    case "alias":
      (l = Zn(n, e, s)),
        (o || a) &&
          s(e, "ALIAS_PROPS", "An alias node must not specify any properties");
      break;
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "block-scalar":
      (l = us(n, e, a, s)), o && (l.anchor = o.source.substring(1));
      break;
    case "block-map":
    case "block-seq":
    case "flow-collection":
      (l = zs(Xn, n, e, a, s)), o && (l.anchor = o.source.substring(1));
      break;
    default:
      throw (console.log(e), new Error(`Unsupporten token type: ${e.type}`));
  }
  return (
    o &&
      l.anchor === "" &&
      s(o, "BAD_ALIAS", "Anchor cannot be an empty string"),
    i && (l.spaceBefore = !0),
    r &&
      (e.type === "scalar" && e.source === ""
        ? (l.comment = r)
        : (l.commentBefore = r)),
    n.options.keepSourceTokens && (l.srcToken = e),
    l
  );
}
function hs(n, e, t, s, { spaceBefore: i, comment: r, anchor: o, tag: a }, l) {
  let c = { type: "scalar", offset: Zs(e, t, s), indent: -1, source: "" },
    f = us(n, c, a, l);
  return (
    o &&
      ((f.anchor = o.source.substring(1)),
      f.anchor === "" && l(o, "BAD_ALIAS", "Anchor cannot be an empty string")),
    i && (f.spaceBefore = !0),
    r && (f.comment = r),
    f
  );
}
function Zn({ options: n }, { offset: e, source: t, end: s }, i) {
  let r = new ne(t.substring(1));
  r.source === "" && i(e, "BAD_ALIAS", "Alias cannot be an empty string");
  let o = e + t.length,
    a = ee(s, o, n.strict, i);
  return (r.range = [e, o, a.offset]), a.comment && (r.comment = a.comment), r;
}
function en(n, e, { offset: t, start: s, value: i, end: r }, o) {
  let a = Object.assign({ directives: e }, n),
    l = new X(void 0, a),
    c = {
      atRoot: !0,
      directives: l.directives,
      options: l.options,
      schema: l.schema,
    },
    f = Z(s, {
      indicator: "doc-start",
      next: i || (r == null ? void 0 : r[0]),
      offset: t,
      onError: o,
      startOnNewline: !0,
    });
  f.found &&
    ((l.directives.marker = !0),
    i &&
      (i.type === "block-map" || i.type === "block-seq") &&
      !f.hasNewline &&
      o(
        f.end,
        "MISSING_CHAR",
        "Block collection cannot start on same line with directives-end marker",
      )),
    (l.contents = i ? ps(c, i, f, o) : hs(c, f.end, s, null, f, o));
  let p = l.contents.range[2],
    u = ee(r, p, !1, o);
  return u.comment && (l.comment = u.comment), (l.range = [t, p, u.offset]), l;
}
function Qe(n) {
  if (typeof n == "number") return [n, n + 1];
  if (Array.isArray(n)) return n.length === 2 ? n : [n[0], n[1]];
  let { offset: e, source: t } = n;
  return [e, e + (typeof t == "string" ? t.length : 1)];
}
function tn(n) {
  var e;
  let t = "",
    s = !1,
    i = !1;
  for (let r = 0; r < n.length; ++r) {
    let o = n[r];
    switch (o[0]) {
      case "#":
        (t +=
          (t === ""
            ? ""
            : i
              ? `

`
              : `
`) + (o.substring(1) || " ")),
          (s = !0),
          (i = !1);
        break;
      case "%":
        ((e = n[r + 1]) === null || e === void 0 ? void 0 : e[0]) !== "#" &&
          (r += 1),
          (s = !1);
        break;
      default:
        s || (i = !0), (s = !1);
    }
  }
  return { comment: t, afterEmptyLine: i };
}
var ze = class {
  constructor(e = {}) {
    (this.doc = null),
      (this.atDirectives = !1),
      (this.prelude = []),
      (this.errors = []),
      (this.warnings = []),
      (this.onError = (t, s, i, r) => {
        let o = Qe(t);
        r
          ? this.warnings.push(new Ye(o, s, i))
          : this.errors.push(new j(o, s, i));
      }),
      (this.directives = new L({ version: e.version || je.version })),
      (this.options = e);
  }
  decorate(e, t) {
    let { comment: s, afterEmptyLine: i } = tn(this.prelude);
    if (s) {
      let r = e.contents;
      if (t)
        e.comment = e.comment
          ? `${e.comment}
${s}`
          : s;
      else if (i || e.directives.marker || !r) e.commentBefore = s;
      else if (A(r) && !r.flow && r.items.length > 0) {
        let o = r.items[0];
        T(o) && (o = o.key);
        let a = o.commentBefore;
        o.commentBefore = a
          ? `${s}
${a}`
          : s;
      } else {
        let o = r.commentBefore;
        r.commentBefore = o
          ? `${s}
${o}`
          : s;
      }
    }
    t
      ? (Array.prototype.push.apply(e.errors, this.errors),
        Array.prototype.push.apply(e.warnings, this.warnings))
      : ((e.errors = this.errors), (e.warnings = this.warnings)),
      (this.prelude = []),
      (this.errors = []),
      (this.warnings = []);
  }
  streamInfo() {
    return {
      comment: tn(this.prelude).comment,
      directives: this.directives,
      errors: this.errors,
      warnings: this.warnings,
    };
  }
  *compose(e, t = !1, s = -1) {
    for (let i of e) yield* this.next(i);
    yield* this.end(t, s);
  }
  *next(e) {
    switch (e.type) {
      case "directive":
        this.directives.add(e.source, (t, s, i) => {
          let r = Qe(e);
          (r[0] += t), this.onError(r, "BAD_DIRECTIVE", s, i);
        }),
          this.prelude.push(e.source),
          (this.atDirectives = !0);
        break;
      case "document": {
        let t = en(this.options, this.directives, e, this.onError);
        this.atDirectives &&
          !t.directives.marker &&
          this.onError(
            e,
            "MISSING_CHAR",
            "Missing directives-end indicator line",
          ),
          this.decorate(t, !1),
          this.doc && (yield this.doc),
          (this.doc = t),
          (this.atDirectives = !1);
        break;
      }
      case "byte-order-mark":
      case "space":
        break;
      case "comment":
      case "newline":
        this.prelude.push(e.source);
        break;
      case "error": {
        let t = e.source
            ? `${e.message}: ${JSON.stringify(e.source)}`
            : e.message,
          s = new j(Qe(e), "UNEXPECTED_TOKEN", t);
        this.atDirectives || !this.doc
          ? this.errors.push(s)
          : this.doc.errors.push(s);
        break;
      }
      case "doc-end": {
        if (!this.doc) {
          let s = "Unexpected doc-end without preceding document";
          this.errors.push(new j(Qe(e), "UNEXPECTED_TOKEN", s));
          break;
        }
        let t = ee(
          e.end,
          e.offset + e.source.length,
          this.doc.options.strict,
          this.onError,
        );
        if ((this.decorate(this.doc, !0), t.comment)) {
          let s = this.doc.comment;
          this.doc.comment = s
            ? `${s}
${t.comment}`
            : t.comment;
        }
        this.doc.range[2] = t.offset;
        break;
      }
      default:
        this.errors.push(
          new j(Qe(e), "UNEXPECTED_TOKEN", `Unsupported token ${e.type}`),
        );
    }
  }
  *end(e = !1, t = -1) {
    if (this.doc)
      this.decorate(this.doc, !0), yield this.doc, (this.doc = null);
    else if (e) {
      let s = Object.assign({ directives: this.directives }, this.options),
        i = new X(void 0, s);
      this.atDirectives &&
        this.onError(
          t,
          "MISSING_CHAR",
          "Missing directives-end indicator line",
        ),
        (i.range = [0, t, t]),
        this.decorate(i, !1),
        yield i;
    }
  }
};
var tt = {};
vs(tt, {
  BOM: () => Xe,
  DOCUMENT: () => Ze,
  FLOW_END: () => et,
  SCALAR: () => Le,
  createScalarToken: () => nn,
  isCollection: () => si,
  isScalar: () => ni,
  prettyToken: () => ii,
  resolveAsScalar: () => sn,
  setScalarValue: () => rn,
  stringify: () => an,
  tokenType: () => gs,
  visit: () => ge,
});
function sn(n, e = !0, t) {
  if (n) {
    let s = (i, r, o) => {
      let a = typeof i == "number" ? i : Array.isArray(i) ? i[0] : i.offset;
      if (t) t(a, r, o);
      else throw new j([a, a + 1], r, o);
    };
    switch (n.type) {
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return Rt(n, e, s);
      case "block-scalar":
        return Ft(n, e, s);
    }
  }
  return null;
}
function nn(n, e) {
  var t;
  let {
      implicitKey: s = !1,
      indent: i,
      inFlow: r = !1,
      offset: o = -1,
      type: a = "PLAIN",
    } = e,
    l = oe(
      { type: a, value: n },
      {
        implicitKey: s,
        indent: i > 0 ? " ".repeat(i) : "",
        inFlow: r,
        options: { blockQuote: !0, lineWidth: -1 },
      },
    ),
    c =
      (t = e.end) !== null && t !== void 0
        ? t
        : [
            {
              type: "newline",
              offset: -1,
              indent: i,
              source: `
`,
            },
          ];
  switch (l[0]) {
    case "|":
    case ">": {
      let f = l.indexOf(`
`),
        p = l.substring(0, f),
        u =
          l.substring(f + 1) +
          `
`,
        h = [{ type: "block-scalar-header", offset: o, indent: i, source: p }];
      return (
        on(h, c) ||
          h.push({
            type: "newline",
            offset: -1,
            indent: i,
            source: `
`,
          }),
        { type: "block-scalar", offset: o, indent: i, props: h, source: u }
      );
    }
    case '"':
      return {
        type: "double-quoted-scalar",
        offset: o,
        indent: i,
        source: l,
        end: c,
      };
    case "'":
      return {
        type: "single-quoted-scalar",
        offset: o,
        indent: i,
        source: l,
        end: c,
      };
    default:
      return { type: "scalar", offset: o, indent: i, source: l, end: c };
  }
}
function rn(n, e, t = {}) {
  let { afterKey: s = !1, implicitKey: i = !1, inFlow: r = !1, type: o } = t,
    a = "indent" in n ? n.indent : null;
  if ((s && typeof a == "number" && (a += 2), !o))
    switch (n.type) {
      case "single-quoted-scalar":
        o = "QUOTE_SINGLE";
        break;
      case "double-quoted-scalar":
        o = "QUOTE_DOUBLE";
        break;
      case "block-scalar": {
        let c = n.props[0];
        if (c.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        o = c.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
        break;
      }
      default:
        o = "PLAIN";
    }
  let l = oe(
    { type: o, value: e },
    {
      implicitKey: i || a === null,
      indent: a !== null && a > 0 ? " ".repeat(a) : "",
      inFlow: r,
      options: { blockQuote: !0, lineWidth: -1 },
    },
  );
  switch (l[0]) {
    case "|":
    case ">":
      ei(n, l);
      break;
    case '"':
      ds(n, l, "double-quoted-scalar");
      break;
    case "'":
      ds(n, l, "single-quoted-scalar");
      break;
    default:
      ds(n, l, "scalar");
  }
}
function ei(n, e) {
  let t = e.indexOf(`
`),
    s = e.substring(0, t),
    i =
      e.substring(t + 1) +
      `
`;
  if (n.type === "block-scalar") {
    let r = n.props[0];
    if (r.type !== "block-scalar-header")
      throw new Error("Invalid block scalar header");
    (r.source = s), (n.source = i);
  } else {
    let { offset: r } = n,
      o = "indent" in n ? n.indent : -1,
      a = [{ type: "block-scalar-header", offset: r, indent: o, source: s }];
    on(a, "end" in n ? n.end : void 0) ||
      a.push({
        type: "newline",
        offset: -1,
        indent: o,
        source: `
`,
      });
    for (let l of Object.keys(n)) l !== "type" && l !== "offset" && delete n[l];
    Object.assign(n, { type: "block-scalar", indent: o, props: a, source: i });
  }
}
function on(n, e) {
  if (e)
    for (let t of e)
      switch (t.type) {
        case "space":
        case "comment":
          n.push(t);
          break;
        case "newline":
          return n.push(t), !0;
      }
  return !1;
}
function ds(n, e, t) {
  switch (n.type) {
    case "scalar":
    case "double-quoted-scalar":
    case "single-quoted-scalar":
      (n.type = t), (n.source = e);
      break;
    case "block-scalar": {
      let s = n.props.slice(1),
        i = e.length;
      n.props[0].type === "block-scalar-header" &&
        (i -= n.props[0].source.length);
      for (let r of s) r.offset += i;
      delete n.props, Object.assign(n, { type: t, source: e, end: s });
      break;
    }
    case "block-map":
    case "block-seq": {
      let i = {
        type: "newline",
        offset: n.offset + e.length,
        indent: n.indent,
        source: `
`,
      };
      delete n.items, Object.assign(n, { type: t, source: e, end: [i] });
      break;
    }
    default: {
      let s = "indent" in n ? n.indent : -1,
        i =
          "end" in n && Array.isArray(n.end)
            ? n.end.filter(
                (r) =>
                  r.type === "space" ||
                  r.type === "comment" ||
                  r.type === "newline",
              )
            : [];
      for (let r of Object.keys(n))
        r !== "type" && r !== "offset" && delete n[r];
      Object.assign(n, { type: t, indent: s, source: e, end: i });
    }
  }
}
var an = (n) => ("type" in n ? Kt(n) : jt(n));
function Kt(n) {
  switch (n.type) {
    case "block-scalar": {
      let e = "";
      for (let t of n.props) e += Kt(t);
      return e + n.source;
    }
    case "block-map":
    case "block-seq": {
      let e = "";
      for (let t of n.items) e += jt(t);
      return e;
    }
    case "flow-collection": {
      let e = n.start.source;
      for (let t of n.items) e += jt(t);
      for (let t of n.end) e += t.source;
      return e;
    }
    case "document": {
      let e = jt(n);
      if (n.end) for (let t of n.end) e += t.source;
      return e;
    }
    default: {
      let e = n.source;
      if ("end" in n && n.end) for (let t of n.end) e += t.source;
      return e;
    }
  }
}
function jt({ start: n, key: e, sep: t, value: s }) {
  let i = "";
  for (let r of n) i += r.source;
  if ((e && (i += Kt(e)), t)) for (let r of t) i += r.source;
  return s && (i += Kt(s)), i;
}
var ms = Symbol("break visit"),
  ti = Symbol("skip children"),
  ln = Symbol("remove item");
function ge(n, e) {
  "type" in n &&
    n.type === "document" &&
    (n = { start: n.start, value: n.value }),
    cn(Object.freeze([]), n, e);
}
ge.BREAK = ms;
ge.SKIP = ti;
ge.REMOVE = ln;
ge.itemAtPath = (n, e) => {
  let t = n;
  for (let [s, i] of e) {
    let r = t && t[s];
    if (r && "items" in r) t = r.items[i];
    else return;
  }
  return t;
};
ge.parentCollection = (n, e) => {
  let t = ge.itemAtPath(n, e.slice(0, -1)),
    s = e[e.length - 1][0],
    i = t && t[s];
  if (i && "items" in i) return i;
  throw new Error("Parent collection not found");
};
function cn(n, e, t) {
  let s = t(e, n);
  if (typeof s == "symbol") return s;
  for (let i of ["key", "value"]) {
    let r = e[i];
    if (r && "items" in r) {
      for (let o = 0; o < r.items.length; ++o) {
        let a = cn(Object.freeze(n.concat([[i, o]])), r.items[o], t);
        if (typeof a == "number") o = a - 1;
        else {
          if (a === ms) return ms;
          a === ln && (r.items.splice(o, 1), (o -= 1));
        }
      }
      typeof s == "function" && i === "key" && (s = s(e, n));
    }
  }
  return typeof s == "function" ? s(e, n) : s;
}
var Xe = "\uFEFF",
  Ze = "",
  et = "",
  Le = "",
  si = (n) => !!n && "items" in n,
  ni = (n) =>
    !!n &&
    (n.type === "scalar" ||
      n.type === "single-quoted-scalar" ||
      n.type === "double-quoted-scalar" ||
      n.type === "block-scalar");
function ii(n) {
  switch (n) {
    case Xe:
      return "<BOM>";
    case Ze:
      return "<DOC>";
    case et:
      return "<FLOW_END>";
    case Le:
      return "<SCALAR>";
    default:
      return JSON.stringify(n);
  }
}
function gs(n) {
  switch (n) {
    case Xe:
      return "byte-order-mark";
    case Ze:
      return "doc-mode";
    case et:
      return "flow-error-end";
    case Le:
      return "scalar";
    case "---":
      return "doc-start";
    case "...":
      return "doc-end";
    case "":
    case `
`:
    case `\r
`:
      return "newline";
    case "-":
      return "seq-item-ind";
    case "?":
      return "explicit-key-ind";
    case ":":
      return "map-value-ind";
    case "{":
      return "flow-map-start";
    case "}":
      return "flow-map-end";
    case "[":
      return "flow-seq-start";
    case "]":
      return "flow-seq-end";
    case ",":
      return "comma";
  }
  switch (n[0]) {
    case " ":
    case "	":
      return "space";
    case "#":
      return "comment";
    case "%":
      return "directive-line";
    case "*":
      return "alias";
    case "&":
      return "anchor";
    case "!":
      return "tag";
    case "'":
      return "single-quoted-scalar";
    case '"':
      return "double-quoted-scalar";
    case "|":
    case ">":
      return "block-scalar-header";
  }
  return null;
}
function K(n) {
  switch (n) {
    case void 0:
    case " ":
    case `
`:
    case "\r":
    case "	":
      return !0;
    default:
      return !1;
  }
}
var fn = "0123456789ABCDEFabcdef".split(""),
  ri =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()".split(
      "",
    ),
  un = ",[]{}".split(""),
  oi = ` ,[]{}
\r	`.split(""),
  ys = (n) => !n || oi.includes(n),
  st = class {
    constructor() {
      (this.atEnd = !1),
        (this.blockScalarIndent = -1),
        (this.blockScalarKeep = !1),
        (this.buffer = ""),
        (this.flowKey = !1),
        (this.flowLevel = 0),
        (this.indentNext = 0),
        (this.indentValue = 0),
        (this.lineEndPos = null),
        (this.next = null),
        (this.pos = 0);
    }
    *lex(e, t = !1) {
      e &&
        ((this.buffer = this.buffer ? this.buffer + e : e),
        (this.lineEndPos = null)),
        (this.atEnd = !t);
      let s = this.next || "stream";
      for (; s && (t || this.hasChars(1)); ) s = yield* this.parseNext(s);
    }
    atLineEnd() {
      let e = this.pos,
        t = this.buffer[e];
      for (; t === " " || t === "	"; ) t = this.buffer[++e];
      return !t ||
        t === "#" ||
        t ===
          `
`
        ? !0
        : t === "\r"
          ? this.buffer[e + 1] ===
            `
`
          : !1;
    }
    charAt(e) {
      return this.buffer[this.pos + e];
    }
    continueScalar(e) {
      let t = this.buffer[e];
      if (this.indentNext > 0) {
        let s = 0;
        for (; t === " "; ) t = this.buffer[++s + e];
        if (t === "\r") {
          let i = this.buffer[s + e + 1];
          if (
            i ===
              `
` ||
            (!i && !this.atEnd)
          )
            return e + s + 1;
        }
        return t ===
          `
` ||
          s >= this.indentNext ||
          (!t && !this.atEnd)
          ? e + s
          : -1;
      }
      if (t === "-" || t === ".") {
        let s = this.buffer.substr(e, 3);
        if ((s === "---" || s === "...") && K(this.buffer[e + 3])) return -1;
      }
      return e;
    }
    getLine() {
      let e = this.lineEndPos;
      return (
        (typeof e != "number" || (e !== -1 && e < this.pos)) &&
          ((e = this.buffer.indexOf(
            `
`,
            this.pos,
          )),
          (this.lineEndPos = e)),
        e === -1
          ? this.atEnd
            ? this.buffer.substring(this.pos)
            : null
          : (this.buffer[e - 1] === "\r" && (e -= 1),
            this.buffer.substring(this.pos, e))
      );
    }
    hasChars(e) {
      return this.pos + e <= this.buffer.length;
    }
    setNext(e) {
      return (
        (this.buffer = this.buffer.substring(this.pos)),
        (this.pos = 0),
        (this.lineEndPos = null),
        (this.next = e),
        null
      );
    }
    peek(e) {
      return this.buffer.substr(this.pos, e);
    }
    *parseNext(e) {
      switch (e) {
        case "stream":
          return yield* this.parseStream();
        case "line-start":
          return yield* this.parseLineStart();
        case "block-start":
          return yield* this.parseBlockStart();
        case "doc":
          return yield* this.parseDocument();
        case "flow":
          return yield* this.parseFlowCollection();
        case "quoted-scalar":
          return yield* this.parseQuotedScalar();
        case "block-scalar":
          return yield* this.parseBlockScalar();
        case "plain-scalar":
          return yield* this.parsePlainScalar();
      }
    }
    *parseStream() {
      let e = this.getLine();
      if (e === null) return this.setNext("stream");
      if (
        (e[0] === Xe && (yield* this.pushCount(1), (e = e.substring(1))),
        e[0] === "%")
      ) {
        let t = e.length,
          s = e.indexOf("#");
        if (s !== -1) {
          let r = e[s - 1];
          (r === " " || r === "	") && (t = s - 1);
        }
        for (;;) {
          let r = e[t - 1];
          if (r === " " || r === "	") t -= 1;
          else break;
        }
        let i = (yield* this.pushCount(t)) + (yield* this.pushSpaces(!0));
        return (
          yield* this.pushCount(e.length - i), this.pushNewline(), "stream"
        );
      }
      if (this.atLineEnd()) {
        let t = yield* this.pushSpaces(!0);
        return (
          yield* this.pushCount(e.length - t),
          yield* this.pushNewline(),
          "stream"
        );
      }
      return yield Ze, yield* this.parseLineStart();
    }
    *parseLineStart() {
      let e = this.charAt(0);
      if (!e && !this.atEnd) return this.setNext("line-start");
      if (e === "-" || e === ".") {
        if (!this.atEnd && !this.hasChars(4)) return this.setNext("line-start");
        let t = this.peek(3);
        if (t === "---" && K(this.charAt(3)))
          return (
            yield* this.pushCount(3),
            (this.indentValue = 0),
            (this.indentNext = 0),
            "doc"
          );
        if (t === "..." && K(this.charAt(3)))
          return yield* this.pushCount(3), "stream";
      }
      return (
        (this.indentValue = yield* this.pushSpaces(!1)),
        this.indentNext > this.indentValue &&
          !K(this.charAt(1)) &&
          (this.indentNext = this.indentValue),
        yield* this.parseBlockStart()
      );
    }
    *parseBlockStart() {
      let [e, t] = this.peek(2);
      if (!t && !this.atEnd) return this.setNext("block-start");
      if ((e === "-" || e === "?" || e === ":") && K(t)) {
        let s = (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0));
        return (
          (this.indentNext = this.indentValue + 1),
          (this.indentValue += s),
          yield* this.parseBlockStart()
        );
      }
      return "doc";
    }
    *parseDocument() {
      yield* this.pushSpaces(!0);
      let e = this.getLine();
      if (e === null) return this.setNext("doc");
      let t = yield* this.pushIndicators();
      switch (e[t]) {
        case "#":
          yield* this.pushCount(e.length - t);
        case void 0:
          return yield* this.pushNewline(), yield* this.parseLineStart();
        case "{":
        case "[":
          return (
            yield* this.pushCount(1),
            (this.flowKey = !1),
            (this.flowLevel = 1),
            "flow"
          );
        case "}":
        case "]":
          return yield* this.pushCount(1), "doc";
        case "*":
          return yield* this.pushUntil(ys), "doc";
        case '"':
        case "'":
          return yield* this.parseQuotedScalar();
        case "|":
        case ">":
          return (
            (t += yield* this.parseBlockScalarHeader()),
            (t += yield* this.pushSpaces(!0)),
            yield* this.pushCount(e.length - t),
            yield* this.pushNewline(),
            yield* this.parseBlockScalar()
          );
        default:
          return yield* this.parsePlainScalar();
      }
    }
    *parseFlowCollection() {
      let e,
        t,
        s = -1;
      do
        (e = yield* this.pushNewline()),
          (t = yield* this.pushSpaces(!0)),
          e > 0 && (this.indentValue = s = t);
      while (e + t > 0);
      let i = this.getLine();
      if (i === null) return this.setNext("flow");
      if (
        ((s !== -1 && s < this.indentNext && i[0] !== "#") ||
          (s === 0 &&
            (i.startsWith("---") || i.startsWith("...")) &&
            K(i[3]))) &&
        !(
          s === this.indentNext - 1 &&
          this.flowLevel === 1 &&
          (i[0] === "]" || i[0] === "}")
        )
      )
        return (this.flowLevel = 0), yield et, yield* this.parseLineStart();
      let r = 0;
      for (; i[r] === ","; )
        (r += yield* this.pushCount(1)),
          (r += yield* this.pushSpaces(!0)),
          (this.flowKey = !1);
      switch (((r += yield* this.pushIndicators()), i[r])) {
        case void 0:
          return "flow";
        case "#":
          return yield* this.pushCount(i.length - r), "flow";
        case "{":
        case "[":
          return (
            yield* this.pushCount(1),
            (this.flowKey = !1),
            (this.flowLevel += 1),
            "flow"
          );
        case "}":
        case "]":
          return (
            yield* this.pushCount(1),
            (this.flowKey = !0),
            (this.flowLevel -= 1),
            this.flowLevel ? "flow" : "doc"
          );
        case "*":
          return yield* this.pushUntil(ys), "flow";
        case '"':
        case "'":
          return (this.flowKey = !0), yield* this.parseQuotedScalar();
        case ":": {
          let o = this.charAt(1);
          if (this.flowKey || K(o) || o === ",")
            return (
              (this.flowKey = !1),
              yield* this.pushCount(1),
              yield* this.pushSpaces(!0),
              "flow"
            );
        }
        default:
          return (this.flowKey = !1), yield* this.parsePlainScalar();
      }
    }
    *parseQuotedScalar() {
      let e = this.charAt(0),
        t = this.buffer.indexOf(e, this.pos + 1);
      if (e === "'")
        for (; t !== -1 && this.buffer[t + 1] === "'"; )
          t = this.buffer.indexOf("'", t + 2);
      else
        for (; t !== -1; ) {
          let r = 0;
          for (; this.buffer[t - 1 - r] === "\\"; ) r += 1;
          if (r % 2 === 0) break;
          t = this.buffer.indexOf('"', t + 1);
        }
      let s = this.buffer.substring(0, t),
        i = s.indexOf(
          `
`,
          this.pos,
        );
      if (i !== -1) {
        for (; i !== -1; ) {
          let r = this.continueScalar(i + 1);
          if (r === -1) break;
          i = s.indexOf(
            `
`,
            r,
          );
        }
        i !== -1 && (t = i - (s[i - 1] === "\r" ? 2 : 1));
      }
      if (t === -1) {
        if (!this.atEnd) return this.setNext("quoted-scalar");
        t = this.buffer.length;
      }
      return (
        yield* this.pushToIndex(t + 1, !1), this.flowLevel ? "flow" : "doc"
      );
    }
    *parseBlockScalarHeader() {
      (this.blockScalarIndent = -1), (this.blockScalarKeep = !1);
      let e = this.pos;
      for (;;) {
        let t = this.buffer[++e];
        if (t === "+") this.blockScalarKeep = !0;
        else if (t > "0" && t <= "9") this.blockScalarIndent = Number(t) - 1;
        else if (t !== "-") break;
      }
      return yield* this.pushUntil((t) => K(t) || t === "#");
    }
    *parseBlockScalar() {
      let e = this.pos - 1,
        t = 0,
        s;
      e: for (let i = this.pos; (s = this.buffer[i]); ++i)
        switch (s) {
          case " ":
            t += 1;
            break;
          case `
`:
            (e = i), (t = 0);
            break;
          case "\r": {
            let r = this.buffer[i + 1];
            if (!r && !this.atEnd) return this.setNext("block-scalar");
            if (
              r ===
              `
`
            )
              break;
          }
          default:
            break e;
        }
      if (!s && !this.atEnd) return this.setNext("block-scalar");
      if (t >= this.indentNext) {
        this.blockScalarIndent === -1
          ? (this.indentNext = t)
          : (this.indentNext += this.blockScalarIndent);
        do {
          let i = this.continueScalar(e + 1);
          if (i === -1) break;
          e = this.buffer.indexOf(
            `
`,
            i,
          );
        } while (e !== -1);
        if (e === -1) {
          if (!this.atEnd) return this.setNext("block-scalar");
          e = this.buffer.length;
        }
      }
      if (!this.blockScalarKeep)
        do {
          let i = e - 1,
            r = this.buffer[i];
          for (r === "\r" && (r = this.buffer[--i]); r === " " || r === "	"; )
            r = this.buffer[--i];
          if (
            r ===
              `
` &&
            i >= this.pos
          )
            e = i;
          else break;
        } while (!0);
      return (
        yield Le,
        yield* this.pushToIndex(e + 1, !0),
        yield* this.parseLineStart()
      );
    }
    *parsePlainScalar() {
      let e = this.flowLevel > 0,
        t = this.pos - 1,
        s = this.pos - 1,
        i;
      for (; (i = this.buffer[++s]); )
        if (i === ":") {
          let r = this.buffer[s + 1];
          if (K(r) || (e && r === ",")) break;
          t = s;
        } else if (K(i)) {
          let r = this.buffer[s + 1];
          if (
            (i === "\r" &&
              (r ===
              `
`
                ? ((s += 1),
                  (i = `
`),
                  (r = this.buffer[s + 1]))
                : (t = s)),
            r === "#" || (e && un.includes(r)))
          )
            break;
          if (
            i ===
            `
`
          ) {
            let o = this.continueScalar(s + 1);
            if (o === -1) break;
            s = Math.max(s, o - 2);
          }
        } else {
          if (e && un.includes(i)) break;
          t = s;
        }
      return !i && !this.atEnd
        ? this.setNext("plain-scalar")
        : (yield Le, yield* this.pushToIndex(t + 1, !0), e ? "flow" : "doc");
    }
    *pushCount(e) {
      return e > 0
        ? (yield this.buffer.substr(this.pos, e), (this.pos += e), e)
        : 0;
    }
    *pushToIndex(e, t) {
      let s = this.buffer.slice(this.pos, e);
      return s
        ? (yield s, (this.pos += s.length), s.length)
        : (t && (yield ""), 0);
    }
    *pushIndicators() {
      switch (this.charAt(0)) {
        case "!":
          return (
            (yield* this.pushTag()) +
            (yield* this.pushSpaces(!0)) +
            (yield* this.pushIndicators())
          );
        case "&":
          return (
            (yield* this.pushUntil(ys)) +
            (yield* this.pushSpaces(!0)) +
            (yield* this.pushIndicators())
          );
        case ":":
        case "?":
        case "-":
          if (K(this.charAt(1)))
            return (
              this.flowLevel === 0
                ? (this.indentNext = this.indentValue + 1)
                : this.flowKey && (this.flowKey = !1),
              (yield* this.pushCount(1)) +
                (yield* this.pushSpaces(!0)) +
                (yield* this.pushIndicators())
            );
      }
      return 0;
    }
    *pushTag() {
      if (this.charAt(1) === "<") {
        let e = this.pos + 2,
          t = this.buffer[e];
        for (; !K(t) && t !== ">"; ) t = this.buffer[++e];
        return yield* this.pushToIndex(t === ">" ? e + 1 : e, !1);
      } else {
        let e = this.pos + 1,
          t = this.buffer[e];
        for (; t; )
          if (ri.includes(t)) t = this.buffer[++e];
          else if (
            t === "%" &&
            fn.includes(this.buffer[e + 1]) &&
            fn.includes(this.buffer[e + 2])
          )
            t = this.buffer[(e += 3)];
          else break;
        return yield* this.pushToIndex(e, !1);
      }
    }
    *pushNewline() {
      let e = this.buffer[this.pos];
      return e ===
        `
`
        ? yield* this.pushCount(1)
        : e === "\r" &&
            this.charAt(1) ===
              `
`
          ? yield* this.pushCount(2)
          : 0;
    }
    *pushSpaces(e) {
      let t = this.pos - 1,
        s;
      do s = this.buffer[++t];
      while (s === " " || (e && s === "	"));
      let i = t - this.pos;
      return (
        i > 0 && (yield this.buffer.substr(this.pos, i), (this.pos = t)), i
      );
    }
    *pushUntil(e) {
      let t = this.pos,
        s = this.buffer[t];
      for (; !e(s); ) s = this.buffer[++t];
      return yield* this.pushToIndex(t, !1);
    }
  };
var nt = class {
  constructor() {
    (this.lineStarts = []),
      (this.addNewLine = (e) => this.lineStarts.push(e)),
      (this.linePos = (e) => {
        let t = 0,
          s = this.lineStarts.length;
        for (; t < s; ) {
          let r = (t + s) >> 1;
          this.lineStarts[r] < e ? (t = r + 1) : (s = r);
        }
        if (this.lineStarts[t] === e) return { line: t + 1, col: 1 };
        if (t === 0) return { line: 0, col: e };
        let i = this.lineStarts[t - 1];
        return { line: t, col: e - i + 1 };
      });
  }
};
function te(n, e) {
  for (let t = 0; t < n.length; ++t) if (n[t].type === e) return !0;
  return !1;
}
function bs(n) {
  for (let e = 0; e < n.length; ++e)
    switch (n[e].type) {
      case "space":
      case "comment":
      case "newline":
        break;
      default:
        return !0;
    }
  return !1;
}
function hn(n) {
  switch (n == null ? void 0 : n.type) {
    case "alias":
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "flow-collection":
      return !0;
    default:
      return !1;
  }
}
function qt(n) {
  switch (n.type) {
    case "document":
      return n.start;
    case "block-map": {
      let e = n.items[n.items.length - 1];
      return e.sep || e.start;
    }
    case "block-seq":
      return n.items[n.items.length - 1].start;
    default:
      return [];
  }
}
function it(n) {
  var e;
  if (n.length === 0) return [];
  let t = n.length;
  e: for (; --t >= 0; )
    switch (n[t].type) {
      case "doc-start":
      case "explicit-key-ind":
      case "map-value-ind":
      case "seq-item-ind":
      case "newline":
        break e;
    }
  for (
    ;
    ((e = n[++t]) === null || e === void 0 ? void 0 : e.type) === "space";

  );
  return n.splice(t, n.length);
}
function pn(n) {
  if (n.start.type === "flow-seq-start")
    for (let e of n.items)
      e.sep &&
        !e.value &&
        !te(e.start, "explicit-key-ind") &&
        !te(e.sep, "map-value-ind") &&
        (e.key && (e.value = e.key),
        delete e.key,
        hn(e.value)
          ? e.value.end
            ? Array.prototype.push.apply(e.value.end, e.sep)
            : (e.value.end = e.sep)
          : Array.prototype.push.apply(e.start, e.sep),
        delete e.sep);
}
var rt = class {
  constructor(e) {
    (this.atNewLine = !0),
      (this.atScalar = !1),
      (this.indent = 0),
      (this.offset = 0),
      (this.onKeyLine = !1),
      (this.stack = []),
      (this.source = ""),
      (this.type = ""),
      (this.lexer = new st()),
      (this.onNewLine = e);
  }
  *parse(e, t = !1) {
    this.onNewLine && this.offset === 0 && this.onNewLine(0);
    for (let s of this.lexer.lex(e, t)) yield* this.next(s);
    t || (yield* this.end());
  }
  *next(e) {
    if (((this.source = e), this.atScalar)) {
      (this.atScalar = !1), yield* this.step(), (this.offset += e.length);
      return;
    }
    let t = gs(e);
    if (t)
      if (t === "scalar")
        (this.atNewLine = !1), (this.atScalar = !0), (this.type = "scalar");
      else {
        switch (((this.type = t), yield* this.step(), t)) {
          case "newline":
            (this.atNewLine = !0),
              (this.indent = 0),
              this.onNewLine && this.onNewLine(this.offset + e.length);
            break;
          case "space":
            this.atNewLine && e[0] === " " && (this.indent += e.length);
            break;
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
            this.atNewLine && (this.indent += e.length);
            break;
          case "doc-mode":
          case "flow-error-end":
            return;
          default:
            this.atNewLine = !1;
        }
        this.offset += e.length;
      }
    else {
      let s = `Not a YAML token: ${e}`;
      yield* this.pop({
        type: "error",
        offset: this.offset,
        message: s,
        source: e,
      }),
        (this.offset += e.length);
    }
  }
  *end() {
    for (; this.stack.length > 0; ) yield* this.pop();
  }
  get sourceToken() {
    return {
      type: this.type,
      offset: this.offset,
      indent: this.indent,
      source: this.source,
    };
  }
  *step() {
    let e = this.peek(1);
    if (this.type === "doc-end" && (!e || e.type !== "doc-end")) {
      for (; this.stack.length > 0; ) yield* this.pop();
      this.stack.push({
        type: "doc-end",
        offset: this.offset,
        source: this.source,
      });
      return;
    }
    if (!e) return yield* this.stream();
    switch (e.type) {
      case "document":
        return yield* this.document(e);
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return yield* this.scalar(e);
      case "block-scalar":
        return yield* this.blockScalar(e);
      case "block-map":
        return yield* this.blockMap(e);
      case "block-seq":
        return yield* this.blockSequence(e);
      case "flow-collection":
        return yield* this.flowCollection(e);
      case "doc-end":
        return yield* this.documentEnd(e);
    }
    yield* this.pop();
  }
  peek(e) {
    return this.stack[this.stack.length - e];
  }
  *pop(e) {
    let t = e || this.stack.pop();
    if (t)
      if (this.stack.length === 0) yield t;
      else {
        let s = this.peek(1);
        switch (
          (t.type === "block-scalar"
            ? (t.indent = "indent" in s ? s.indent : 0)
            : t.type === "flow-collection" &&
              s.type === "document" &&
              (t.indent = 0),
          t.type === "flow-collection" && pn(t),
          s.type)
        ) {
          case "document":
            s.value = t;
            break;
          case "block-scalar":
            s.props.push(t);
            break;
          case "block-map": {
            let i = s.items[s.items.length - 1];
            if (i.value) {
              s.items.push({ start: [], key: t, sep: [] }),
                (this.onKeyLine = !0);
              return;
            } else if (i.sep) i.value = t;
            else {
              Object.assign(i, { key: t, sep: [] }),
                (this.onKeyLine = !te(i.start, "explicit-key-ind"));
              return;
            }
            break;
          }
          case "block-seq": {
            let i = s.items[s.items.length - 1];
            i.value ? s.items.push({ start: [], value: t }) : (i.value = t);
            break;
          }
          case "flow-collection": {
            let i = s.items[s.items.length - 1];
            !i || i.value
              ? s.items.push({ start: [], key: t, sep: [] })
              : i.sep
                ? (i.value = t)
                : Object.assign(i, { key: t, sep: [] });
            return;
          }
          default:
            yield* this.pop(), yield* this.pop(t);
        }
        if (
          (s.type === "document" ||
            s.type === "block-map" ||
            s.type === "block-seq") &&
          (t.type === "block-map" || t.type === "block-seq")
        ) {
          let i = t.items[t.items.length - 1];
          i &&
            !i.sep &&
            !i.value &&
            i.start.length > 0 &&
            !bs(i.start) &&
            (t.indent === 0 ||
              i.start.every(
                (r) => r.type !== "comment" || r.indent < t.indent,
              )) &&
            (s.type === "document"
              ? (s.end = i.start)
              : s.items.push({ start: i.start }),
            t.items.splice(-1, 1));
        }
      }
    else {
      let s = "Tried to pop an empty stack";
      yield { type: "error", offset: this.offset, source: "", message: s };
    }
  }
  *stream() {
    switch (this.type) {
      case "directive-line":
        yield { type: "directive", offset: this.offset, source: this.source };
        return;
      case "byte-order-mark":
      case "space":
      case "comment":
      case "newline":
        yield this.sourceToken;
        return;
      case "doc-mode":
      case "doc-start": {
        let e = { type: "document", offset: this.offset, start: [] };
        this.type === "doc-start" && e.start.push(this.sourceToken),
          this.stack.push(e);
        return;
      }
    }
    yield {
      type: "error",
      offset: this.offset,
      message: `Unexpected ${this.type} token in YAML stream`,
      source: this.source,
    };
  }
  *document(e) {
    if (e.value) return yield* this.lineEnd(e);
    switch (this.type) {
      case "doc-start": {
        bs(e.start)
          ? (yield* this.pop(), yield* this.step())
          : e.start.push(this.sourceToken);
        return;
      }
      case "anchor":
      case "tag":
      case "space":
      case "comment":
      case "newline":
        e.start.push(this.sourceToken);
        return;
    }
    let t = this.startBlockValue(e);
    t
      ? this.stack.push(t)
      : yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML document`,
          source: this.source,
        };
  }
  *scalar(e) {
    if (this.type === "map-value-ind") {
      let t = qt(this.peek(2)),
        s = it(t),
        i;
      e.end
        ? ((i = e.end), i.push(this.sourceToken), delete e.end)
        : (i = [this.sourceToken]);
      let r = {
        type: "block-map",
        offset: e.offset,
        indent: e.indent,
        items: [{ start: s, key: e, sep: i }],
      };
      (this.onKeyLine = !0), (this.stack[this.stack.length - 1] = r);
    } else yield* this.lineEnd(e);
  }
  *blockScalar(e) {
    switch (this.type) {
      case "space":
      case "comment":
      case "newline":
        e.props.push(this.sourceToken);
        return;
      case "scalar":
        if (
          ((e.source = this.source),
          (this.atNewLine = !0),
          (this.indent = 0),
          this.onNewLine)
        ) {
          let t =
            this.source.indexOf(`
`) + 1;
          for (; t !== 0; )
            this.onNewLine(this.offset + t),
              (t =
                this.source.indexOf(
                  `
`,
                  t,
                ) + 1);
        }
        yield* this.pop();
        break;
      default:
        yield* this.pop(), yield* this.step();
    }
  }
  *blockMap(e) {
    var t;
    let s = e.items[e.items.length - 1];
    switch (this.type) {
      case "newline":
        if (((this.onKeyLine = !1), s.value)) {
          let i = "end" in s.value ? s.value.end : void 0,
            r = Array.isArray(i) ? i[i.length - 1] : void 0;
          (r == null ? void 0 : r.type) === "comment"
            ? i == null || i.push(this.sourceToken)
            : e.items.push({ start: [this.sourceToken] });
        } else
          s.sep ? s.sep.push(this.sourceToken) : s.start.push(this.sourceToken);
        return;
      case "space":
      case "comment":
        if (s.value) e.items.push({ start: [this.sourceToken] });
        else if (s.sep) s.sep.push(this.sourceToken);
        else {
          if (this.atIndentedComment(s.start, e.indent)) {
            let i = e.items[e.items.length - 2],
              r =
                (t = i == null ? void 0 : i.value) === null || t === void 0
                  ? void 0
                  : t.end;
            if (Array.isArray(r)) {
              Array.prototype.push.apply(r, s.start),
                r.push(this.sourceToken),
                e.items.pop();
              return;
            }
          }
          s.start.push(this.sourceToken);
        }
        return;
    }
    if (this.indent >= e.indent) {
      let i =
        !this.onKeyLine && this.indent === e.indent && (s.sep || bs(s.start));
      switch (this.type) {
        case "anchor":
        case "tag":
          i || s.value
            ? (e.items.push({ start: [this.sourceToken] }),
              (this.onKeyLine = !0))
            : s.sep
              ? s.sep.push(this.sourceToken)
              : s.start.push(this.sourceToken);
          return;
        case "explicit-key-ind":
          !s.sep && !te(s.start, "explicit-key-ind")
            ? s.start.push(this.sourceToken)
            : i || s.value
              ? e.items.push({ start: [this.sourceToken] })
              : this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [this.sourceToken] }],
                }),
            (this.onKeyLine = !0);
          return;
        case "map-value-ind":
          if (!s.sep) Object.assign(s, { key: null, sep: [this.sourceToken] });
          else if (s.value || (i && !te(s.start, "explicit-key-ind")))
            e.items.push({ start: [], key: null, sep: [this.sourceToken] });
          else if (te(s.sep, "map-value-ind"))
            this.stack.push({
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [], key: null, sep: [this.sourceToken] }],
            });
          else if (
            te(s.start, "explicit-key-ind") &&
            hn(s.key) &&
            !te(s.sep, "newline")
          ) {
            let r = it(s.start),
              o = s.key,
              a = s.sep;
            a.push(this.sourceToken),
              delete s.key,
              delete s.sep,
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: r, key: o, sep: a }],
              });
          } else s.sep.push(this.sourceToken);
          this.onKeyLine = !0;
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          let r = this.flowScalar(this.type);
          i || s.value
            ? (e.items.push({ start: [], key: r, sep: [] }),
              (this.onKeyLine = !0))
            : s.sep
              ? this.stack.push(r)
              : (Object.assign(s, { key: r, sep: [] }), (this.onKeyLine = !0));
          return;
        }
        default: {
          let r = this.startBlockValue(e);
          if (r) {
            i &&
              r.type !== "block-seq" &&
              te(s.start, "explicit-key-ind") &&
              e.items.push({ start: [] }),
              this.stack.push(r);
            return;
          }
        }
      }
    }
    yield* this.pop(), yield* this.step();
  }
  *blockSequence(e) {
    var t;
    let s = e.items[e.items.length - 1];
    switch (this.type) {
      case "newline":
        if (s.value) {
          let i = "end" in s.value ? s.value.end : void 0,
            r = Array.isArray(i) ? i[i.length - 1] : void 0;
          (r == null ? void 0 : r.type) === "comment"
            ? i == null || i.push(this.sourceToken)
            : e.items.push({ start: [this.sourceToken] });
        } else s.start.push(this.sourceToken);
        return;
      case "space":
      case "comment":
        if (s.value) e.items.push({ start: [this.sourceToken] });
        else {
          if (this.atIndentedComment(s.start, e.indent)) {
            let i = e.items[e.items.length - 2],
              r =
                (t = i == null ? void 0 : i.value) === null || t === void 0
                  ? void 0
                  : t.end;
            if (Array.isArray(r)) {
              Array.prototype.push.apply(r, s.start),
                r.push(this.sourceToken),
                e.items.pop();
              return;
            }
          }
          s.start.push(this.sourceToken);
        }
        return;
      case "anchor":
      case "tag":
        if (s.value || this.indent <= e.indent) break;
        s.start.push(this.sourceToken);
        return;
      case "seq-item-ind":
        if (this.indent !== e.indent) break;
        s.value || te(s.start, "seq-item-ind")
          ? e.items.push({ start: [this.sourceToken] })
          : s.start.push(this.sourceToken);
        return;
    }
    if (this.indent > e.indent) {
      let i = this.startBlockValue(e);
      if (i) {
        this.stack.push(i);
        return;
      }
    }
    yield* this.pop(), yield* this.step();
  }
  *flowCollection(e) {
    let t = e.items[e.items.length - 1];
    if (this.type === "flow-error-end") {
      let s;
      do yield* this.pop(), (s = this.peek(1));
      while (s && s.type === "flow-collection");
    } else if (e.end.length === 0) {
      switch (this.type) {
        case "comma":
        case "explicit-key-ind":
          !t || t.sep
            ? e.items.push({ start: [this.sourceToken] })
            : t.start.push(this.sourceToken);
          return;
        case "map-value-ind":
          !t || t.value
            ? e.items.push({ start: [], key: null, sep: [this.sourceToken] })
            : t.sep
              ? t.sep.push(this.sourceToken)
              : Object.assign(t, { key: null, sep: [this.sourceToken] });
          return;
        case "space":
        case "comment":
        case "newline":
        case "anchor":
        case "tag":
          !t || t.value
            ? e.items.push({ start: [this.sourceToken] })
            : t.sep
              ? t.sep.push(this.sourceToken)
              : t.start.push(this.sourceToken);
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          let i = this.flowScalar(this.type);
          !t || t.value
            ? e.items.push({ start: [], key: i, sep: [] })
            : t.sep
              ? this.stack.push(i)
              : Object.assign(t, { key: i, sep: [] });
          return;
        }
        case "flow-map-end":
        case "flow-seq-end":
          e.end.push(this.sourceToken);
          return;
      }
      let s = this.startBlockValue(e);
      s ? this.stack.push(s) : (yield* this.pop(), yield* this.step());
    } else {
      let s = this.peek(2);
      if (
        s.type === "block-map" &&
        (this.type === "map-value-ind" ||
          (this.type === "newline" && !s.items[s.items.length - 1].sep))
      )
        yield* this.pop(), yield* this.step();
      else if (this.type === "map-value-ind" && s.type !== "flow-collection") {
        let i = qt(s),
          r = it(i);
        pn(e);
        let o = e.end.splice(1, e.end.length);
        o.push(this.sourceToken);
        let a = {
          type: "block-map",
          offset: e.offset,
          indent: e.indent,
          items: [{ start: r, key: e, sep: o }],
        };
        (this.onKeyLine = !0), (this.stack[this.stack.length - 1] = a);
      } else yield* this.lineEnd(e);
    }
  }
  flowScalar(e) {
    if (this.onNewLine) {
      let t =
        this.source.indexOf(`
`) + 1;
      for (; t !== 0; )
        this.onNewLine(this.offset + t),
          (t =
            this.source.indexOf(
              `
`,
              t,
            ) + 1);
    }
    return {
      type: e,
      offset: this.offset,
      indent: this.indent,
      source: this.source,
    };
  }
  startBlockValue(e) {
    switch (this.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return this.flowScalar(this.type);
      case "block-scalar-header":
        return {
          type: "block-scalar",
          offset: this.offset,
          indent: this.indent,
          props: [this.sourceToken],
          source: "",
        };
      case "flow-map-start":
      case "flow-seq-start":
        return {
          type: "flow-collection",
          offset: this.offset,
          indent: this.indent,
          start: this.sourceToken,
          items: [],
          end: [],
        };
      case "seq-item-ind":
        return {
          type: "block-seq",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: [this.sourceToken] }],
        };
      case "explicit-key-ind": {
        this.onKeyLine = !0;
        let t = qt(e),
          s = it(t);
        return (
          s.push(this.sourceToken),
          {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: s }],
          }
        );
      }
      case "map-value-ind": {
        this.onKeyLine = !0;
        let t = qt(e),
          s = it(t);
        return {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: s, key: null, sep: [this.sourceToken] }],
        };
      }
    }
    return null;
  }
  atIndentedComment(e, t) {
    return this.type !== "comment" || this.indent <= t
      ? !1
      : e.every((s) => s.type === "newline" || s.type === "space");
  }
  *documentEnd(e) {
    this.type !== "doc-mode" &&
      (e.end ? e.end.push(this.sourceToken) : (e.end = [this.sourceToken]),
      this.type === "newline" && (yield* this.pop()));
  }
  *lineEnd(e) {
    switch (this.type) {
      case "comma":
      case "doc-start":
      case "doc-end":
      case "flow-seq-end":
      case "flow-map-end":
      case "map-value-ind":
        yield* this.pop(), yield* this.step();
        break;
      case "newline":
        this.onKeyLine = !1;
      case "space":
      case "comment":
      default:
        e.end ? e.end.push(this.sourceToken) : (e.end = [this.sourceToken]),
          this.type === "newline" && (yield* this.pop());
    }
  }
};
function ai(n) {
  let e = n.prettyErrors !== !1;
  return {
    lineCounter: n.lineCounter || (e && new nt()) || null,
    prettyErrors: e,
  };
}
function ws(n, e = {}) {
  let { lineCounter: t, prettyErrors: s } = ai(e),
    i = new rt(t == null ? void 0 : t.addNewLine),
    r = new ze(e),
    o = null;
  for (let a of r.compose(i.parse(n), !0, n.length))
    if (!o) o = a;
    else if (o.options.logLevel !== "silent") {
      o.errors.push(
        new j(
          a.range.slice(0, 2),
          "MULTIPLE_DOCS",
          "Source contains multiple documents; please use YAML.parseAllDocuments()",
        ),
      );
      break;
    }
  return (
    s && t && (o.errors.forEach(ls(n, t)), o.warnings.forEach(ls(n, t))), o
  );
}
var Vt = class {
  constructor(e, t, s, i) {
    (this.app = e),
      (this.filename = t),
      (this.basename = t.split("/").pop()),
      (this.tagPositions = s),
      (this.hasFrontMatter = !!i);
  }
  async renamed(e) {
    let t = this.app.vault.getAbstractFileByPath(this.filename),
      s = await this.app.vault.read(t),
      i = s;
    for (let {
      position: { start: r, end: o },
      tag: a,
    } of this.tagPositions) {
      if (i.slice(r.offset, o.offset) !== a) {
        let l = `File ${this.filename} has changed; skipping`;
        new Ss.Notice(l),
          console.error(l),
          console.debug(i.slice(r.offset, o.offset), a);
        return;
      }
      i = e.inString(i, r.offset);
    }
    if ((this.hasFrontMatter && (i = this.replaceInFrontMatter(i, e)), i !== s))
      return await this.app.vault.modify(t, i), !0;
  }
  replaceInFrontMatter(e, t) {
    let [s, i] = e.split(/^---\r?$\n?/m, 2);
    if (
      s.trim() !== "" ||
      !i.trim() ||
      !i.endsWith(`
`)
    )
      return e;
    let r = ws(i, { keepSourceTokens: !0 });
    if (r.errors.length) {
      let f = `YAML issue with ${this.filename}: ${r.errors[0]}`;
      console.error(f), new Ss.Notice(f + "; skipping frontmatter");
      return;
    }
    let o = !1,
      a = r.toJSON();
    function l(f, p, u = !1) {
      tt.setScalarValue(f.srcToken, p, { afterKey: u }),
        (o = !0),
        (f.value = p);
    }
    function c(f, p) {
      let u = r.get(f, !0);
      if (!u) return;
      let h = a[f];
      if (!(!h || !h.length))
        if (typeof h == "string") {
          let y = h.split(p ? /(^\s+|\s*,\s*|\s+$)/ : /([\s,]+)/),
            d = t.inArray(y, !0, p).join("");
          h != d && l(u, d, !0);
        } else
          Array.isArray(h) &&
            t.inArray(h, !1, p).forEach((y, d) => {
              h[d] !== y && l(u.get(d, !0), y);
            });
    }
    for (let {
      key: { value: f },
    } of r.contents.items)
      /^tags?$/i.test(f) ? c(f, !1) : /^alias(es)?$/i.test(f) && c(f, !0);
    return o ? e.replace(i, tt.stringify(r.contents.srcToken)) : e;
  }
};
async function dn(n, e, t = e) {
  let s = await fi(e, t);
  if (s === !1) return;
  if (!s || s === e)
    return new ye.Notice("Unchanged or empty tag: No changes made.");
  let i = new O(e),
    r = new O(s),
    o = new ft(i, r),
    a = o.willMergeTags(ci(n).reverse());
  if (a && (await ui(a, i, r))) return;
  let c = await ks(n, i);
  if (!c) return;
  let f = new $e(`Renaming to #${s}/*`, "Processing files..."),
    p = 0;
  return (
    await f.forEach(c, async (u) => {
      (f.message = "Processing " + u.basename), (await u.renamed(o)) && p++;
    }),
    new ye.Notice(
      `Operation ${f.aborted ? "cancelled" : "complete"}: ${p} file(s) updated`,
    )
  );
}
function ci(n) {
  return Object.keys(n.metadataCache.getTags());
}
async function ks(n, e) {
  let t = [],
    s = new $e(`Searching for ${e}/*`, "Matching files...");
  if (
    (await s.forEach(n.metadataCache.getCachedFiles(), (i) => {
      let { frontmatter: r, tags: o } = n.metadataCache.getCache(i) || {};
      o = (o || []).filter((c) => c.tag && e.matches(c.tag)).reverse();
      let a = ((0, ye.parseFrontMatterTags)(r) || []).filter(e.matches),
        l = ((0, ye.parseFrontMatterAliases)(r) || [])
          .filter(O.isTag)
          .filter(e.matches);
      (o.length || a.length || l.length) &&
        t.push(new Vt(n, i, o, a.length + l.length));
    }),
    !s.aborted)
  )
    return t;
}
async function fi(n, e = n) {
  return await new ct()
    .setTitle(`Renaming #${n} (and any sub-tags)`)
    .setContent(
      `Enter new name (must be a valid Obsidian tag name):
`,
    )
    .setPattern(
      "[^\u2000-\u206F\u2E00-\u2E7F'!\"#$%&\\(\\)*+,.:;<=>?@^`\\{\\|\\}~\\[\\]\\\\\\s]+",
    )
    .onInvalidEntry(
      (t) => new ye.Notice(`"${t}" is not a valid Obsidian tag name`),
    )
    .setValue(e)
    .prompt();
}
async function ui([n, e], t, s) {
  return !(await new ve()
    .setTitle("WARNING: No Undo!")
    .setContent(
      activeWindow.createEl("p", void 0, (i) => {
        i.innerHTML = `Renaming <code>${t}</code> to <code>${s}</code> will merge ${
          n.canonical === t.canonical
            ? "these tags"
            : `multiple tags
                        into existing tags (such as <code>${n}</code>
                        merging with <code>${e}</code>)`
        }.<br><br>
                This <b>cannot</b> be undone.  Do you wish to proceed?`;
      }),
    )
    .setup((i) => i.okButton.addClass("mod-warning"))
    .confirm());
}
var mn = "tag-wrangler:tag-pane";
function le(n, e, t, s, i) {
  return n.on(e, t, s, i), () => n.off(e, t, s, i);
}
var Ut = class extends M.Plugin {
  constructor() {
    super(...arguments);
    be(this, "pageAliases", new Map());
    be(this, "tagPages", new Map());
  }
  tagPage(t) {
    return Array.from(this.tagPages.get(O.canonical(t)) || "")[0];
  }
  openTagPage(t, s, i) {
    let r = {
      eState: s ? { rename: "all" } : { focus: !0 },
      ...(s ? { state: { mode: "source" } } : {}),
    };
    return this.app.workspace.getLeaf(i).openFile(t, r);
  }
  async createTagPage(t, s) {
    var a;
    let r = { tag: new O(t).canonical, file: void 0 };
    app.workspace.trigger("tag-page:will-create", r);
    let o = r.file && (await r.file);
    if (!o) {
      let l = new O(t).name.split("/").join(" "),
        c = this.app.fileManager.getNewFileParent(
          ((a = this.app.workspace.getActiveFile()) == null
            ? void 0
            : a.path) || "",
        ),
        f = this.app.vault.getAvailablePath(c.getParentPrefix() + l, "md");
      o = await this.app.vault.create(
        f,
        ["---", `Aliases: [ ${JSON.stringify(O.toTag(t))} ]`, "---", ""].join(`
`),
      );
    }
    (r.file = o),
      await this.openTagPage(o, !0, s),
      app.workspace.trigger("tag-page:did-create", r);
  }
  onload() {
    this.registerEvent(
      app.workspace.on("editor-menu", (r, o) => {
        let a = o.getClickableTokenAt(o.getCursor());
        (a == null ? void 0 : a.type) === "tag" && this.setupMenu(r, a.text);
      }),
    ),
      this.register(
        le(document, "contextmenu", ".tag-pane-tag", this.onMenu.bind(this), {
          capture: !0,
        }),
      ),
      this.app.workspace.registerHoverLinkSource(mn, {
        display: "Tag pane",
        defaultMod: !0,
      }),
      this.addChild(
        new Pe(this, {
          hoverSource: mn,
          selector: ".tag-pane-tag",
          container: ".tag-container",
          toTag(r) {
            var o;
            return (o = r.find(
              ".tag-pane-tag-text, tag-pane-tag-text, .tag-pane-tag .tree-item-inner-text",
            )) == null
              ? void 0
              : o.textContent;
          },
        }),
      ),
      this.addChild(
        new Pe(this, {
          hoverSource: "preview",
          selector: 'a.tag[href^="#"]',
          container:
            ".markdown-preview-view, .markdown-embed, .workspace-leaf-content",
          toTag(r) {
            return r.getAttribute("href");
          },
        }),
      ),
      this.addChild(
        new Pe(this, {
          hoverSource: "preview",
          selector:
            '.metadata-property[data-property-key="tags"] .multi-select-pill-content',
          container: ".metadata-properties",
          toTag(r) {
            return r.textContent;
          },
        }),
      ),
      this.addChild(
        new Pe(this, {
          hoverSource: "editor",
          selector: "span.cm-hashtag",
          container: ".markdown-source-view",
          toTag(r) {
            let o = r.textContent;
            if (!r.matches(".cm-formatting"))
              for (
                let a = r.previousElementSibling;
                a != null && a.matches("span.cm-hashtag:not(.cm-formatting)");
                a = a.previousElementSibling
              )
                o = a.textContent + o;
            for (
              let a = r.nextElementSibling;
              a != null && a.matches("span.cm-hashtag:not(.cm-formatting)");
              a = a.nextElementSibling
            )
              o += a.textContent;
            return o;
          },
        }),
      ),
      this.register(
        le(
          document,
          "pointerdown",
          ".tag-pane-tag",
          (r, o) => {
            o.draggable = "true";
          },
          { capture: !0 },
        ),
      ),
      this.register(
        le(
          document,
          "dragstart",
          ".tag-pane-tag",
          (r, o) => {
            var c;
            let a =
              (c = o.find(
                ".tag-pane-tag-text, tag-pane-tag-text, .tag-pane-tag .tree-item-inner-text",
              )) == null
                ? void 0
                : c.textContent;
            r.dataTransfer.setData("text/plain", "#" + a),
              app.dragManager.onDragStart(r, {
                source: "tag-wrangler",
                type: "text",
                title: a,
                icon: "hashtag",
              }),
              window.addEventListener("dragend", l, !0),
              window.addEventListener("drop", l, !0);
            function l() {
              (app.dragManager.draggable = null),
                window.removeEventListener("dragend", l, !0),
                window.removeEventListener("drop", l, !0);
            }
          },
          { capture: !1 },
        ),
      );
    let t = (r, o, a = app.dragManager.draggable, l) => {
      var p;
      if (
        (a == null ? void 0 : a.source) !== "tag-wrangler" ||
        r.defaultPrevented
      )
        return;
      let c =
          (p = o.find(
            ".tag-pane-tag-text, tag-pane-tag-text, .tag-pane-tag .tree-item-inner-text",
          )) == null
            ? void 0
            : p.textContent,
        f = c + "/" + O.toName(a.title).split("/").pop();
      O.canonical(c) !== O.canonical(a.title) &&
        ((r.dataTransfer.dropEffect = "move"),
        r.preventDefault(),
        l
          ? this.rename(O.toName(a.title), f)
          : (app.dragManager.updateHover(o, "is-being-dragged-over"),
            app.dragManager.setAction(`Rename to ${f}`)));
    };
    this.register(
      le(document.body, "dragover", ".tag-pane-tag.tree-item-self", t, {
        capture: !0,
      }),
    ),
      this.register(
        le(document.body, "dragenter", ".tag-pane-tag.tree-item-self", t, {
          capture: !0,
        }),
      ),
      this.registerDomEvent(
        window,
        "drop",
        (r) => {
          var l;
          let o =
            (l = r.target) == null
              ? void 0
              : l.matchParent(".tag-pane-tag.tree-item-self", r.currentTarget);
          if (!o) return;
          let a = app.dragManager.draggable;
          a && !r.defaultPrevented && t(r, o, a, !0);
        },
        { capture: !0 },
      );
    let s = this.app.metadataCache,
      i = this;
    this.register(
      Es(s, {
        getTags(r) {
          return function () {
            let a = r.call(this),
              l = new Set(Object.keys(a).map((c) => c.toLowerCase()));
            for (let c of i.tagPages.keys())
              l.has(c) || (a[i.tagPages.get(c).tag] = 0);
            return a;
          };
        },
      }),
    ),
      this.app.workspace.onLayoutReady(() => {
        s.getCachedFiles().forEach((r) => {
          var a, l;
          let o = (a = s.getCache(r)) == null ? void 0 : a.frontmatter;
          o &&
            (l = (0, M.parseFrontMatterAliases)(o)) != null &&
            l.filter(O.isTag) &&
            this.updatePage(this.app.vault.getAbstractFileByPath(r), o);
        }),
          this.registerEvent(
            s.on("changed", (r, o, a) =>
              this.updatePage(r, a == null ? void 0 : a.frontmatter),
            ),
          ),
          this.registerEvent(
            this.app.vault.on("delete", (r) => this.updatePage(r)),
          ),
          app.workspace.getLeavesOfType("tag").forEach((r) => {
            var o, a;
            (a =
              (o = r == null ? void 0 : r.view) == null
                ? void 0
                : o.requestUpdateTags) == null || a.call(o);
          });
      });
  }
  updatePage(t, s) {
    var r;
    let i =
      ((r = (0, M.parseFrontMatterAliases)(s)) == null
        ? void 0
        : r.filter(O.isTag)) || [];
    if (this.pageAliases.has(t)) {
      let o = new Set(i || []);
      for (let a of this.pageAliases.get(t)) {
        if (o.has(a)) continue;
        let l = O.canonical(a),
          c = this.tagPages.get(l);
        c && (c.delete(t), c.size || this.tagPages.delete(l));
      }
      i.length || this.pageAliases.delete(t);
    }
    if (i.length) {
      this.pageAliases.set(t, i);
      for (let o of i) {
        let a = O.canonical(o);
        if (this.tagPages.has(a)) this.tagPages.get(a).add(t);
        else {
          let l = new Set([t]);
          (l.tag = O.toTag(o)), this.tagPages.set(a, l);
        }
      }
    }
  }
  onMenu(t, s) {
    let i = t.obsidian_contextmenu;
    i ||
      ((i = t.obsidian_contextmenu = new M.Menu()),
      setTimeout(() => i.showAtPosition({ x: t.pageX, y: t.pageY }), 0));
    let r = s.find(
        ".tag-pane-tag-text, .tag-pane-tag .tree-item-inner-text",
      ).textContent,
      o = s.parentElement.parentElement.find(".collapse-icon");
    if ((this.setupMenu(i, r, o), o)) {
      let f = function (p) {
          var u;
          for (let h of (u = c.children) != null ? u : c.vChildren.children)
            h.setCollapsed(p);
        },
        a = r.split("/").slice(0, -1).join("/"),
        l = this.leafView(s.matchParent(".workspace-leaf")),
        c = a ? l.tagDoms["#" + a.toLowerCase()] : l.root;
      i.addItem(
        ae(
          "tag-hierarchy",
          "vertical-three-dots",
          "Collapse tags at this level",
          () => f(!0),
        ),
      ).addItem(
        ae(
          "tag-hierarchy",
          "expand-vertically",
          "Expand tags at this level",
          () => f(!1),
        ),
      );
    }
  }
  setupMenu(t, s, i = !1) {
    s = O.toTag(s).slice(1);
    let r = this.tagPage(s),
      o = this.app.internalPlugins.getPluginById("global-search"),
      a = o && o.instance,
      l = a && a.getGlobalSearchQuery(),
      c = this.app.plugins.plugins["smart-random-note"];
    t.addItem(ae("tag-rename", "pencil", "Rename #" + s, () => this.rename(s))),
      r
        ? t.addItem(
            ae("tag-page", "popup-open", "Open tag page", (f) =>
              this.openTagPage(r, !1, M.Keymap.isModEvent(f)),
            ),
          )
        : t.addItem(
            ae("tag-page", "create-new", "Create tag page", (f) =>
              this.createTagPage(s, M.Keymap.isModEvent(f)),
            ),
          ),
      a &&
        (t.addItem(
          ae("tag-search", "magnifying-glass", "New search for #" + s, () =>
            a.openGlobalSearch("tag:#" + s),
          ),
        ),
        l &&
          t.addItem(
            ae(
              "tag-search",
              "sheets-in-box",
              "Require #" + s + " in search",
              () => a.openGlobalSearch(l + " tag:#" + s),
            ),
          ),
        t.addItem(
          ae(
            "tag-search",
            "crossed-star",
            "Exclude #" + s + " from search",
            () => a.openGlobalSearch(l + " -tag:#" + s),
          ),
        )),
      c &&
        t.addItem(
          ae("tag-random", "dice", "Open random note", async () => {
            let f = await ks(this.app, new O(s));
            c.openRandomNote(
              f.map((p) => this.app.vault.getAbstractFileByPath(p.filename)),
            );
          }),
        ),
      this.app.workspace.trigger("tag-wrangler:contextmenu", t, s, {
        search: a,
        query: l,
        isHierarchy: i,
        tagPage: r,
      });
  }
  leafView(t) {
    let s;
    return (
      this.app.workspace.iterateAllLeaves((i) => {
        if (i.containerEl === t) return (s = i.view), !0;
      }),
      s
    );
  }
  async rename(t, s = t) {
    try {
      await dn(this.app, t, s);
    } catch (i) {
      console.error(i), new M.Notice("error: " + i);
    }
  }
};
function ae(n, e, t, s) {
  return (i) => {
    i.setIcon(e).setTitle(t).onClick(s), n && i.setSection(n);
  };
}
var Pe = class extends M.Component {
  constructor(e, t) {
    super(), (this.opts = t), (this.plugin = e);
  }
  onload() {
    let { selector: e, container: t, hoverSource: s, toTag: i } = this.opts;
    this.register(
      le(
        document,
        "mouseover",
        e,
        (r, o) => {
          let a = i(o),
            l = a && this.plugin.tagPage(a);
          l &&
            this.plugin.app.workspace.trigger("hover-link", {
              event: r,
              source: s,
              targetEl: o,
              linktext: l.path,
              hoverParent: o.matchParent(t),
            });
        },
        { capture: !1 },
      ),
    ),
      s === "preview" &&
        (this.register(
          le(document, "contextmenu", e, (r, o) => {
            let a = r.obsidian_contextmenu;
            a ||
              ((a = r.obsidian_contextmenu = new M.Menu()),
              setTimeout(
                () => a.showAtPosition({ x: r.pageX, y: r.pageY }),
                0,
              )),
              this.plugin.setupMenu(a, i(o));
          }),
        ),
        this.register(
          le(
            document,
            "dragstart",
            e,
            (r, o) => {
              let a = i(o);
              r.dataTransfer.setData("text/plain", O.toTag(a)),
                app.dragManager.onDragStart(r, {
                  source: "tag-wrangler",
                  type: "text",
                  title: a,
                  icon: "hashtag",
                });
            },
            { capture: !1 },
          ),
        )),
      this.register(
        le(
          document,
          s === "editor" ? "mousedown" : "click",
          e,
          (r, o) => {
            let { altKey: a } = r;
            if (!M.Keymap.isModEvent(r) && !a) return;
            let l = i(o),
              c = l && this.plugin.tagPage(l);
            return (
              c
                ? this.plugin.openTagPage(c, !1, M.Keymap.isModEvent(r))
                : new ve()
                    .setTitle("Create Tag Page")
                    .setContent(
                      `A tag page for ${l} does not exist.  Create it?`,
                    )
                    .confirm()
                    .then((f) => {
                      var u;
                      if (f)
                        return this.plugin.createTagPage(
                          l,
                          M.Keymap.isModEvent(r),
                        );
                      let p =
                        (u =
                          app.internalPlugins.getPluginById("global-search")) ==
                        null
                          ? void 0
                          : u.instance;
                      p == null || p.openGlobalSearch("tag:#" + l);
                    }),
              r.preventDefault(),
              r.stopImmediatePropagation(),
              !1
            );
          },
          { capture: !0 },
        ),
      );
  }
};
