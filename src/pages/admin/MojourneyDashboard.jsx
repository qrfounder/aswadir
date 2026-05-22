import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Copy,
  CreditCard,
  ExternalLink,
  Link2,
  Loader2,
  LogOut,
  Radio,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { client } from "@/api/client";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import BrandLogo from "@/components/BrandLogo";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "live", label: "Live", icon: Radio },
  { id: "users", label: "Users", icon: Users },
  { id: "commerce", label: "Commerce", icon: CreditCard },
  { id: "analytics", label: "Analytics", icon: Activity },
  { id: "links", label: "Campaign links", icon: Link2 },
];

function formatMoney(cents, currency = "USD") {
  if (!cents) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format(cents / 100);
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className="text-white text-2xl font-black mt-1 tabular-nums">{value}</p>
      {sub ? <p className="text-gray-500 text-xs mt-1">{sub}</p> : null}
    </div>
  );
}

function eventLabel(type) {
  const map = {
    page_view: "Page view",
    checkout_view: "Checkout view",
    add_to_cart: "Add to cart",
    checkout_started: "Checkout started",
    add_payment_info: "Add payment info",
    payment_success: "Purchase",
    lead_register: "New account",
    user_login: "Login",
    subscription_updated: "Subscription",
  };
  return map[type] || type;
}

function eventColor(type) {
  if (type === "payment_success") return "text-success";
  if (type === "lead_register" || type === "user_login") return "text-primary";
  if (type === "add_payment_info") return "text-info";
  if (type === "checkout_started" || type === "add_to_cart") return "text-brand";
  return "text-gray-300";
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
      title="Copy link"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <span className="text-xs text-success">OK</span> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function MojourneyDashboard() {
  const { admin, logout } = useAdminAuth();
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [live, setLive] = useState([]);
  const [users, setUsers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [links, setLinks] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveSince, setLiveSince] = useState(null);
  const [resetting, setResetting] = useState(false);

  const loadOverview = useCallback(async () => {
    const data = await client.admin.overview();
    setOverview(data);
  }, []);

  const loadLive = useCallback(async (incremental = false) => {
    const data = await client.admin.live({
      since: incremental && liveSince ? liveSince : undefined,
      limit: 80,
    });
    if (incremental && data.events?.length) {
      setLive((prev) => {
        const ids = new Set(prev.map((e) => e.id));
        const merged = [...data.events.filter((e) => !ids.has(e.id)), ...prev];
        return merged.slice(0, 120);
      });
    } else if (!incremental) {
      setLive(data.events || []);
    }
    if (data.events?.[0]?.createdAt) {
      setLiveSince(data.serverTime || data.events[0].createdAt);
    }
  }, [liveSince]);

  const loadUsers = useCallback(async (q) => {
    const data = await client.admin.users({ q: q || undefined, limit: 100 });
    setUsers(data.users || []);
  }, []);

  const loadCommerce = useCallback(async () => {
    const [p, s] = await Promise.all([
      client.admin.purchases({ limit: 80 }),
      client.admin.subscriptions({ limit: 80 }),
    ]);
    setPurchases(p.purchases || []);
    setSubscriptions(s.subscriptions || []);
  }, []);

  const loadAnalytics = useCallback(async () => {
    const data = await client.admin.analytics({ hours: 168 });
    setAnalytics(data);
  }, []);

  const loadLinks = useCallback(async () => {
    const data = await client.admin.campaignLinks();
    setLinks(data.links || []);
  }, []);

  const refreshTab = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "overview") await loadOverview();
      else if (tab === "live") await loadLive(false);
      else if (tab === "users") await loadUsers(userQuery);
      else if (tab === "commerce") await loadCommerce();
      else if (tab === "analytics") await loadAnalytics();
      else if (tab === "links") await loadLinks();
    } finally {
      setLoading(false);
    }
  }, [tab, loadOverview, loadLive, loadUsers, userQuery, loadCommerce, loadAnalytics, loadLinks]);

  useEffect(() => {
    refreshTab();
  }, [refreshTab]);

  useEffect(() => {
    if (tab !== "live") return undefined;
    const id = setInterval(() => loadLive(true), 4000);
    return () => clearInterval(id);
  }, [tab, loadLive]);

  const eventBreakdownMap = useMemo(() => {
    const m = {};
    for (const row of overview?.eventBreakdown || []) {
      m[row.event_type] = row.count;
    }
    return m;
  }, [overview]);

  const openUser = async (id) => {
    const data = await client.admin.userDetail(id);
    setSelectedUser(data);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100">
      <header className="border-b border-white/10 bg-black/30 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <div>
              <p className="text-primary text-xs font-bold uppercase tracking-widest">Mojourney</p>
              <p className="text-white font-black text-sm">{admin?.username || "Admin"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshTab}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/5"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-white/10 text-sm text-gray-300 hover:text-white"
            >
              <ExternalLink className="w-4 h-4" /> Site
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-sm font-bold hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-52 flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap ${
                tab === id ? "bg-primary/20 text-primary" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <main className="flex-1 min-w-0">
          {loading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          )}

          {tab === "overview" && overview && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Users" value={overview.stats.users} />
                <StatCard
                  label="Revenue (paid)"
                  value={formatMoney(overview.stats.revenueCents)}
                  sub={`${overview.stats.paidPurchases} orders`}
                />
                <StatCard label="Active subs" value={overview.stats.activeSubscriptions} />
                <StatCard
                  label="24h events"
                  value={overview.stats.events24h}
                  sub={`${overview.stats.pageViews24h} page views`}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 p-4">
                  <h3 className="font-black text-white mb-3">Event breakdown (24h)</h3>
                  <ul className="space-y-2 text-sm">
                    {Object.entries(eventBreakdownMap).map(([k, v]) => (
                      <li key={k} className="flex justify-between">
                        <span className={eventColor(k)}>{eventLabel(k)}</span>
                        <span className="text-white font-bold">{v}</span>
                      </li>
                    ))}
                    {!Object.keys(eventBreakdownMap).length && (
                      <li className="text-gray-500">No events yet — traffic will appear here.</li>
                    )}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 p-4">
                  <h3 className="font-black text-white mb-3">Ops</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>Pending checkouts: <strong className="text-white">{overview.stats.pendingPurchases}</strong></li>
                    <li>Unclaimed paid orders: <strong className="text-warning">{overview.stats.unclaimedPaid}</strong></li>
                    <li>Products: {overview.products.join(", ")}</li>
                    {overview.siteUrl ? (
                      <li className="truncate">Site: {overview.siteUrl}</li>
                    ) : (
                      <li className="text-warning">Set SITE_URL in .env for campaign links</li>
                    )}
                  </ul>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 p-4">
                  <h3 className="font-black text-white mb-3">Recent users</h3>
                  <ul className="space-y-2 text-sm">
                    {overview.recentUsers.map((u) => (
                      <li key={u.id} className="flex justify-between gap-2">
                        <span className="truncate">{u.name} · {u.email}</span>
                        <button type="button" className="text-primary text-xs shrink-0" onClick={() => { setTab("users"); openUser(u.id); }}>
                          View
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 p-4">
                  <h3 className="font-black text-white mb-3">Recent payments</h3>
                  <ul className="space-y-2 text-sm">
                    {overview.recentPurchases.map((p) => (
                      <li key={p.payment_intent_id} className="flex justify-between gap-2">
                        <span className="truncate">{p.product_name} · {p.customer_email}</span>
                        <span className="text-success shrink-0">{formatMoney(p.amount, p.currency)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {tab === "live" && (
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-black text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Real-time feed
                </h3>
                <span className="text-xs text-gray-500">Polls every 4s</span>
              </div>
              <ul className="divide-y divide-white/5 max-h-[70vh] overflow-y-auto">
                {live.map((ev) => (
                  <li key={ev.id} className="px-4 py-3 text-sm flex flex-wrap gap-x-3 gap-y-1">
                    <span className={`font-bold ${eventColor(ev.eventType)}`}>{eventLabel(ev.eventType)}</span>
                    <span className="text-gray-500">{new Date(ev.createdAt).toLocaleString()}</span>
                    {ev.path && <span className="text-gray-400">{ev.path}</span>}
                    {ev.productId && <span className="text-brand">#{ev.productId}</span>}
                    {ev.locale && <span className="text-primary uppercase">{ev.locale}</span>}
                    {ev.utmSource && <span className="text-gray-500">src:{ev.utmSource}</span>}
                    {ev.ipAddress && <span className="text-gray-500">{ev.ipAddress}</span>}
                    {(ev.city || ev.country) && (
                      <span className="text-info">
                        {[ev.city, ev.region, ev.country].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {ev.metadata?.email && <span className="text-gray-400">{ev.metadata.email}</span>}
                  </li>
                ))}
                {!live.length && !loading && (
                  <li className="px-4 py-8 text-center text-gray-500">Waiting for events…</li>
                )}
              </ul>
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-4">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  loadUsers(userQuery);
                }}
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Search email or name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10"
                  />
                </div>
                <button type="submit" className="cta-button px-4 py-2 rounded-xl font-bold text-sm">
                  Search
                </button>
              </form>
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 text-gray-400 text-left">
                      <tr>
                        <th className="p-3">User</th>
                        <th className="p-3">Subs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr
                          key={u.id}
                          className="border-t border-white/5 hover:bg-white/5 cursor-pointer"
                          onClick={() => openUser(u.id)}
                        >
                          <td className="p-3">
                            <p className="font-bold text-white">{u.name}</p>
                            <p className="text-gray-500 text-xs">{u.email}</p>
                          </td>
                          <td className="p-3 text-xs text-gray-400">
                            {u.entitlementCount} ent · {u.subscriptionStatus || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {selectedUser && (
                  <div className="rounded-2xl border border-white/10 p-4 space-y-3 text-sm">
                    <h3 className="font-black text-white text-lg">{selectedUser.user.name}</h3>
                    <p className="text-gray-400">{selectedUser.user.email}</p>
                    <p>WhatsApp: {selectedUser.user.whatsapp || "—"}</p>
                    <p>Notes saved: {selectedUser.notesCount}</p>
                    <div>
                      <p className="text-gray-500 text-xs uppercase font-bold mb-1">Entitlements</p>
                      <p>{selectedUser.entitlements.map((e) => e.product_key).join(", ") || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase font-bold mb-1">Subscription</p>
                      <p>{selectedUser.subscription?.status || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase font-bold mb-1">Purchases</p>
                      <ul className="space-y-1 max-h-32 overflow-y-auto">
                        {selectedUser.purchases.map((p) => (
                          <li key={p.payment_intent_id}>
                            {p.product_name} · {p.status} · {formatMoney(p.amount, p.currency)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "commerce" && (
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <h3 className="font-black p-4 border-b border-white/10">Purchases</h3>
                <ul className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto text-sm">
                  {purchases.map((p) => (
                    <li key={p.payment_intent_id} className="p-3">
                      <p className="font-bold text-white">{p.product_name}</p>
                      <p className="text-gray-500">{p.customer_email} · {p.status}</p>
                      <p className="text-success text-xs">{formatMoney(p.amount, p.currency)}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <h3 className="font-black p-4 border-b border-white/10">Subscriptions</h3>
                <ul className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto text-sm">
                  {subscriptions.map((s) => (
                    <li key={s.id} className="p-3">
                      <p className="font-bold text-white">{s.email || s.user_id}</p>
                      <p className="text-gray-500">{s.status} · {s.product_id}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === "analytics" && analytics && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-gray-400 text-sm">
                  Visitors are detected by session with IP geolocation (city, region, country) on each event.
                </p>
                <button
                  type="button"
                  disabled={resetting}
                  onClick={resetAnalytics}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/40 text-destructive text-sm font-bold hover:bg-destructive/10 disabled:opacity-50"
                >
                  {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Reset all analytics
                </button>
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <h3 className="font-black text-white mb-3">Funnel (unique sessions, 7d)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-sm">
                  {Object.entries(analytics.funnel || {}).map(([k, v]) => (
                    <div key={k} className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-gray-500 text-xs">{eventLabel(k)}</p>
                      <p className="text-white font-black text-xl">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-black text-white">
                    Visitors ({analytics.visitorCount ?? analytics.visitors?.length ?? 0}, 7d)
                  </h3>
                  <span className="text-xs text-gray-500">IP · city · country</span>
                </div>
                <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="text-gray-500 text-xs uppercase tracking-wider bg-white/5">
                      <tr>
                        <th className="text-start p-3 font-bold">Last seen</th>
                        <th className="text-start p-3 font-bold">IP</th>
                        <th className="text-start p-3 font-bold">City</th>
                        <th className="text-start p-3 font-bold">Region</th>
                        <th className="text-start p-3 font-bold">Country</th>
                        <th className="text-end p-3 font-bold">Views</th>
                        <th className="text-end p-3 font-bold">Events</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(analytics.visitors || []).map((v) => (
                        <tr key={v.sessionId} className="hover:bg-white/5">
                          <td className="p-3 text-gray-400 whitespace-nowrap">
                            {new Date(v.lastSeen).toLocaleString()}
                          </td>
                          <td className="p-3 font-mono text-xs text-gray-300">{v.ipAddress || "—"}</td>
                          <td className="p-3 text-white">{v.city || "—"}</td>
                          <td className="p-3 text-gray-300">{v.region || "—"}</td>
                          <td className="p-3 text-primary font-bold uppercase">{v.country || "—"}</td>
                          <td className="p-3 text-end font-bold">{v.pageViews}</td>
                          <td className="p-3 text-end text-gray-500">{v.eventCount}</td>
                        </tr>
                      ))}
                      {!analytics.visitors?.length && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">
                            No visitors in this window. Browse the site or run ads — geo appears on the next page view.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  ["Traffic source", analytics.traffic?.bySource],
                  ["Country (sessions)", analytics.traffic?.byCountry],
                  ["Locale", analytics.traffic?.byLocale],
                  ["Product interest", analytics.traffic?.byProduct],
                ].map(([title, rows]) => (
                  <div key={title} className="rounded-2xl border border-white/10 p-4">
                    <h3 className="font-black text-white mb-3">{title}</h3>
                    <ul className="space-y-2 text-sm">
                      {(rows || []).map((r) => (
                        <li key={r.label} className="flex justify-between">
                          <span className="text-gray-400 truncate">{r.label}</span>
                          <span className="font-bold">{r.count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <h3 className="font-black text-white mb-3">Top pages (7d)</h3>
                <ul className="space-y-2 text-sm">
                  {(analytics.topPages || []).map((r) => (
                    <li key={r.label} className="flex justify-between">
                      <span className="text-gray-400">{r.label}</span>
                      <span className="font-bold">{r.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === "links" && (
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">
                Use these URLs in ads — each includes <code className="text-primary">lang</code> and UTM parameters for tracking.
              </p>
              <div className="rounded-2xl border border-white/10 divide-y divide-white/5 max-h-[70vh] overflow-y-auto">
                {links.map((link) => (
                  <div key={link.id} className="p-4 flex gap-3 items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm">{link.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 break-all">{link.url}</p>
                    </div>
                    <CopyButton text={link.url} />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
                {!links.length && !loading && (
                  <p className="p-6 text-gray-500 text-sm text-center">Set SITE_URL in server .env to generate links.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
