import { DashtopApp } from "@dashtop/widget-sdk";

/**
 * News Aggregator
 *
 * AI-powered news feed. Browse headlines, save articles, manage sources.
 * Extends DashtopApp for the standard layout (header, tabs, chat, quick actions).
 */

interface NewsConfig {
  sources: string[];
  refreshTime: string;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  priority: "high" | "medium" | "low";
  category: string;
  summary: string;
}

const CATEGORIES = [
  { label: "All", icon: "📋" },
  { label: "AI & Tech", icon: "🤖" },
  { label: "Dev", icon: "💻" },
  { label: "Business", icon: "💼" },
  { label: "Science", icon: "🔬" },
];

const PRIORITY_BADGES: Record<string, { icon: string; color: string }> = {
  high: { icon: "🔴", color: "#ef4444" },
  medium: { icon: "🟡", color: "#eab308" },
  low: { icon: "🟢", color: "#22c55e" },
};

const MOCK_NEWS: NewsItem[] = [
  { id: "1", title: "GPT-5 Benchmarks Leak: Reasoning up 40%", source: "TechCrunch", time: "12m ago", priority: "high", category: "AI & Tech", summary: "Leaked benchmark results suggest GPT-5 achieves a 40% improvement in multi-step reasoning tasks compared to its predecessor, with notable gains in mathematical proof generation and code synthesis." },
  { id: "2", title: "React 21 Introduces Automatic Memoization", source: "Hacker News", time: "28m ago", priority: "high", category: "Dev", summary: "The React team has shipped automatic memoization in v21, eliminating the need for useMemo and useCallback in most cases. Early adopters report 15-30% render performance improvements with zero code changes." },
  { id: "3", title: "Apple Vision Pro 2 Cuts Weight by 35%", source: "The Verge", time: "1h ago", priority: "medium", category: "AI & Tech", summary: "Apple announces the second-generation Vision Pro with a 35% weight reduction, wider field of view, and a new R2 chip enabling real-time spatial AI features and eye-tracking improvements." },
  { id: "4", title: "Series B Funding Hits 3-Year High in Q1", source: "TechCrunch", time: "2h ago", priority: "medium", category: "Business", summary: "Venture capital data shows Series B rounds reached a 3-year high in Q1 2026, driven primarily by AI infrastructure and climate tech startups. Median round size climbed to $42M." },
  { id: "5", title: "CRISPR Trial Shows 94% Efficacy for Sickle Cell", source: "Nature Brief", time: "3h ago", priority: "high", category: "Science", summary: "A Phase III clinical trial of CRISPR-based gene therapy for sickle cell disease reports 94% of patients achieved sustained fetal hemoglobin production, effectively eliminating vaso-occlusive crises over 18 months." },
  { id: "6", title: "Rust Overtakes Go in Cloud-Native Adoption", source: "Hacker News", time: "4h ago", priority: "low", category: "Dev", summary: "The latest CNCF survey shows Rust surpassing Go in new cloud-native project adoption for the first time, driven by memory safety requirements and WebAssembly compatibility." },
  { id: "7", title: "EU AI Act Enforcement Begins Next Month", source: "Reuters", time: "5h ago", priority: "medium", category: "Business", summary: "The European Commission confirms that enforcement of the AI Act's high-risk provisions will begin in May 2026, with fines up to 7% of global revenue for non-compliant systems." },
  { id: "8", title: "James Webb Detects New Biosignature on K2-18 b", source: "NASA Wire", time: "6h ago", priority: "high", category: "Science", summary: "JWST observations reveal dimethyl sulfide in the atmosphere of exoplanet K2-18 b, a molecule on Earth produced exclusively by living organisms. The finding strengthens the case for potential biological activity." },
];

const SOURCES_LIST = [
  { name: "TechCrunch", active: true },
  { name: "Hacker News", active: true },
  { name: "The Verge", active: true },
  { name: "Reuters", active: true },
  { name: "Nature Brief", active: true },
  { name: "NASA Wire", active: true },
  { name: "Ars Technica", active: false },
  { name: "Wired", active: false },
];

class NewsAggregator extends DashtopApp<NewsConfig> {
  name = "News Aggregator";
  icon = "📰";
  color = "#f59e0b";
  tabs = ["Feed", "Saved", "Sources"];
  quickActions = CATEGORIES.map((cat) => ({
    label: cat.label,
    icon: cat.icon,
    active: cat.label === "All",
    onClick: () => this.filterByCategory(cat.label),
  }));
  placeholder = "Search news, summarize a topic...";

  renderContent(container: HTMLElement): void {
    switch (this.activeTab) {
      case 0:
        this.renderFeed(container);
        break;
      case 1:
        this.renderSaved(container);
        break;
      case 2:
        this.renderSources(container);
        break;
    }
  }

  async onChat(message: string): Promise<string> {
    const lower = message.toLowerCase();
    if (lower.includes("top") || lower.includes("headline") || lower.includes("today")) {
      return "Here are the top 3 AI stories today:\n1. GPT-5 benchmarks leak showing 40% reasoning gains\n2. Apple Vision Pro 2 with spatial AI features\n3. JWST biosignature detection on K2-18 b";
    }
    if (lower.includes("summar")) {
      return "Today's feed covers AI breakthroughs (GPT-5, Vision Pro 2), developer tooling shifts (React 21, Rust adoption), biotech advances (CRISPR trial), and regulatory updates (EU AI Act). High-priority stories focus on GPT-5 and the CRISPR results.";
    }
    if (lower.includes("save")) {
      return "You have " + this.getSavedIds().length + " saved articles. Switch to the Saved tab to view them.";
    }
    if (lower.includes("source")) {
      return "You're tracking 6 active sources: TechCrunch, Hacker News, The Verge, Reuters, Nature Brief, and NASA Wire. You can manage them in the Sources tab.";
    }
    return `Searching news for "${message}"... Found 3 related stories. The most relevant is about emerging developments in ${message}. Check the Feed tab for details.`;
  }

  // ── Feed Tab ───────────────────────────────

  private renderFeed(container: HTMLElement): void {
    const activeCategory = this.getState<string>("category", "All");
    const expandedId = this.getState<string | null>("expandedId", null);
    const savedIds = this.getSavedIds();

    const filtered =
      activeCategory === "All"
        ? MOCK_NEWS
        : MOCK_NEWS.filter((n) => n.category === activeCategory);

    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:32px;color:#999;">
        <div style="font-size:32px;margin-bottom:8px;">🔍</div>
        <div style="font-size:13px;">No stories in this category</div>
      </div>`;
      return;
    }

    container.innerHTML = filtered
      .map((item) => {
        const pb = PRIORITY_BADGES[item.priority];
        const isExpanded = expandedId === item.id;
        const isSaved = savedIds.includes(item.id);
        return `
        <div data-news="${item.id}" style="padding:10px 12px;border-bottom:1px solid #f4f4f5;cursor:pointer;${isExpanded ? "background:#fffbeb;" : ""}">
          <div style="display:flex;align-items:start;gap:8px;">
            <div style="flex:1;min-width:0;">
              <div style="font-size:12px;font-weight:600;line-height:1.4;">${item.title}</div>
              <div style="font-size:10px;color:#888;margin-top:2px;">${item.source} · ${item.time}</div>
            </div>
            <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
              <span title="${item.priority} priority" style="font-size:10px;">${pb.icon}</span>
              <button data-save="${item.id}" title="${isSaved ? "Unsave" : "Save"}" style="font-size:12px;border:none;background:none;cursor:pointer;padding:2px;">${isSaved ? "⭐" : "☆"}</button>
            </div>
          </div>
          ${isExpanded ? `<div style="font-size:11px;color:#555;line-height:1.6;margin-top:8px;padding:8px;background:#fefce8;border-radius:6px;">${item.summary}</div>` : ""}
        </div>`;
      })
      .join("");

    // Bind click to expand
    filtered.forEach((item) => {
      const el = container.querySelector(`[data-news="${item.id}"]`) as HTMLElement;
      el?.addEventListener("click", (e) => {
        // Don't expand when clicking the save button
        if ((e.target as HTMLElement).closest("[data-save]")) return;
        const current = this.getState<string | null>("expandedId", null);
        this.setState("expandedId", current === item.id ? null : item.id);
        this.refresh();
      });

      const saveBtn = container.querySelector(`[data-save="${item.id}"]`) as HTMLElement;
      saveBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleSave(item.id);
      });
    });
  }

  // ── Saved Tab ──────────────────────────────

  private renderSaved(container: HTMLElement): void {
    const savedIds = this.getSavedIds();

    if (savedIds.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:32px;color:#999;">
        <div style="font-size:32px;margin-bottom:8px;">⭐</div>
        <div style="font-size:13px;">No saved articles yet</div>
        <div style="font-size:11px;margin-top:4px;">Tap the star on any article to save it</div>
      </div>`;
      return;
    }

    const savedItems = MOCK_NEWS.filter((n) => savedIds.includes(n.id));
    this.renderList(
      container,
      savedItems.map((item) => ({
        id: item.id,
        label: item.title,
        sublabel: `${item.source} · ${item.time}`,
        badge: PRIORITY_BADGES[item.priority].icon,
        onClick: () => {
          this.activeTab = 0;
          this.setState("expandedId", item.id);
          this.refresh();
          // Re-render full widget to update tab bar
          if (this.root) {
            const tabBtn = this.root.querySelector('[data-tab="0"]') as HTMLElement;
            tabBtn?.click();
          }
        },
      }))
    );
  }

  // ── Sources Tab ────────────────────────────

  private renderSources(container: HTMLElement): void {
    this.renderList(
      container,
      SOURCES_LIST.map((src) => ({
        id: src.name,
        label: src.name,
        badge: src.active ? "✓ Active" : "Inactive",
        badgeColor: src.active ? "#22c55e" : undefined,
      }))
    );

    // Add hint at bottom
    const hint = document.createElement("div");
    hint.style.cssText =
      "text-align:center;padding:12px;color:#999;font-size:11px;border-top:1px solid #f4f4f5;";
    hint.innerHTML = `<span style="color:${this.color};cursor:pointer;">+ Add Source</span> · Manage your news feeds`;
    container.appendChild(hint);
  }

  // ── Category Filter ────────────────────────

  private filterByCategory(category: string): void {
    this.setState("category", category);
    // Update active state on quick actions
    this.quickActions.forEach((a) => {
      a.active = a.label === category;
    });
    this.refresh();
  }

  // ── Save Helpers ───────────────────────────

  private getSavedIds(): string[] {
    return this.getState<string[]>("savedIds", []);
  }

  private toggleSave(id: string): void {
    const saved = this.getSavedIds();
    if (saved.includes(id)) {
      this.setState(
        "savedIds",
        saved.filter((s) => s !== id)
      );
    } else {
      this.setState("savedIds", [...saved, id]);
    }
    this.refresh();
  }
}

export default new NewsAggregator().asWidget();
