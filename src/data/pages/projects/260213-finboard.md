---
id: finboard
displayTitle: "FinBoard — a personal finance dashboard that shouldn't exist"
category: projects
date: 2026-02-13
thumbnail: https://cdn.infraphysics.net/f7a2-k9d1-m3b8.png
thumbnailAspect: wide
thumbnailShading: heavy
description: "A vanilla JS investment dashboard built in one session with Claude 4.6. No framework, no build step, no npm install. Just a folder you double-click."
status: deployed
tags: [Finance, Dashboard, Vanilla JS, Chart.js]
technologies: [JavaScript, HTML, CSS, Chart.js]
github: https://github.com/yago-mendoza/FinBoard
tldr:
  - Fifth attempt at building a personal finance tracker. The previous four died at various stages of ambition. This one was built in a single session with Claude 4.6 — 22 files, zero dependencies beyond Chart.js via CDN.
  - No build step. No npm install. No framework. Double-click index.html and you have a dashboard. The constraint is the feature.
  - Replaces MyViewer, a deprecated predecessor that was a 3,000-line monolith in a single script.js. FinBoard is modular, faster, and actually works on mobile.
  - Includes an unplanned incident where I accidentally pushed 84 real stock transactions to a public GitHub repo. Remediation involved deleting git history and force-pushing. The project now has a single commit. Infra-committed.
related: []
---

I've been told — mostly by people trying to sell me something — that my generation doesn't invest. That Gen Z would rather spend money on experiences, subscriptions, and overpriced oat milk than put it into an index fund. And honestly, there's some truth to that. But I think the real problem isn't that people my age don't want to invest. It's that nobody taught us how, and the people who try to teach us are usually just pitching their own platform.

So here's my actual advice, if you care: learn about finance. Not to invest — to _understand_. Read about compound interest, asset allocation, portfolio theory, the efficient market hypothesis. Read about why most actively managed funds underperform the S&P 500 over a 20-year horizon. Read about why diversification works even though it feels like hedging your bets. And then, only then, if you want to invest, do it with your own money, your own decisions, and your own spreadsheet. Not because you'll beat the market — {{you almost certainly won't|statistically, about 90% of actively managed funds underperform the S&P 500 over a 15-year period. This is not a controversial claim — it's just math plus fees.}} — but because understanding what your money does is a kind of literacy, and illiteracy has costs.

Now, there's a second question that comes up in conversations with friends who've already accepted that investing is worth learning about, and it's a darker one: --when you've already convinced yourself that AGI will be a reality, how do you face that future?-- Because if artificial general intelligence genuinely arrives — and I don't mean "chatbot that writes emails," I mean "entity that can do your job better than you" — then the investment strategies of the last century might be irrelevant. What does portfolio diversification mean when a single technology can obsolete entire sectors overnight? What does "buy and hold for 30 years" mean when nobody knows what the economy looks like in 10? I don't have an answer. Nobody does. But I think about it every time I buy a stock, which is probably not the healthiest relationship with a brokerage account.

Without further ado — and I should warn you, there's not a lot to learn from this article. This is not a tutorial on how to build a dashboard, and it's definitely not financial advice. It's the story of the fifth time I tried to build a personal finance tracker, and the first time it actually worked. If you take anything from this, let it be that sometimes the right approach is the stupidest one — and that a folder you can double-click has a surprising amount of engineering value.

>> 26.02.12 - Started this at noon. 22 files and a force push later, I have a dashboard, a security incident, and a single-commit repo. Good Wednesday.

# attempt number five

This is the fifth time I've tried to build something like this. The previous four attempts died at various stages of ambition — a Python CLI that got too complex, a React prototype that I abandoned when I realized I was building a framework instead of a tool, a quick-and-dirty HTML page that couldn't handle more than one CSV, and **MyViewer**, a deprecated predecessor that was a 3,000-line monolith in a single `script.js`. MyViewer technically worked, but it was the kind of code that makes you close the editor and go for a walk. Un-extendable. Un-debuggable. Un-maintainable. Un-everything.

I'd been postponing attempt number five because I was waiting for a model that could handle the specific challenges this project demands. Not general coding — specific financial logic:

- **Cross-filtering with collision rules.** When you filter by platform and by date range simultaneously, the results need to intersect correctly. When a filter removes all data from a chart, the chart should show an empty state, not crash. When you clear one filter, the other should still be active. These sound trivial but the interaction matrix is large, and getting it wrong produces bugs that only appear in specific filter combinations
- **Weighted average cost basis under partial exits.** If you buy 10 shares at 100, then 5 more at 120, your average cost is 106.67. If you sell 8, your remaining cost basis is still 106.67 — but the realized P&L depends on which shares you "sold" (FIFO, LIFO, average cost). I needed the model to understand this without me writing the formula
- **Consistent synthetic data generation.** For testing, the model needed to generate fake transactions that don't produce impossible states — no negative balances, no selling shares you don't own, no trades before market open

Claude 4.6 surprised me. I expected to need heavy steering on the financial calculations, and I did need some — particularly on how to compute {{mark-to-market P&L|mark-to-market: valuing your portfolio at current market prices, as opposed to book value (what you paid). The difference between "I paid 10K for these stocks" and "these stocks are worth 12K right now" is mark-to-market P&L.}} under partial liquidations. But the model understood the architecture well. The 22-file structure, the module boundaries, the event bus pattern — all of that came from the model with minimal guidance. I mostly just described what I wanted to see on screen, and it built the wiring.

## the CDN bet

The entire project is vanilla JS, HTML, and CSS. No build step. No `npm install`. No framework. **Chart.js** is the only external dependency, loaded via CDN. Everything else — the router, the state management, the financial engine, the CSV parser, the chart wrappers — is hand-written JavaScript split across clean modules.

Why? Because FinBoard is a single-user tool that reads a local CSV and renders charts. There's no auth, no database, no server logic — nothing that justifies a transpiler, a `node_modules` folder, or a build pipeline. The constraint is the feature: the entire app is a folder you double-click. `index.html` opens in your browser, loads demo data, and you have a dashboard. Host it on GitHub Pages. Drop it in Google Drive. Email it to yourself. It doesn't care.

The trade-off is real: no TypeScript means no compile-time safety. No SSR means no SEO. No code splitting means the whole app loads at once. But for a personal dashboard with one user and thirteen views, those are solutions to problems that don't exist. You could argue React or Vue would make the UI more maintainable, but at ~4K lines of JavaScript split across clean modules, the complexity never reaches the point where a virtual DOM or reactive state actually pays for itself.

{bkqt/tip|The double-click test}
If you're building a personal tool with no backend requirements, ask yourself: can someone use this by double-clicking a file? If yes, you probably don't need a build step. If no, are you sure you need a backend? The answer is often "no, I just need to rethink the data flow." FinBoard passes the double-click test. That simplicity is not accidental — it's the whole point.
{/bkqt}

## chart.js and the wrapper that didn't want to wrap

Chart.js loaded via CDN meant no `import` statements — the library sits on `window.Chart` and you work with it directly. The plan was simple: write a `charts.js` wrapper module that handles chart creation, destruction, and theming in one place. The rest of the app calls `createLineChart(canvas, data, options)` and never thinks about Chart.js internals.

The problem arrived in the first hour. Chart instances have a lifecycle: if you navigate between views and the canvas gets reused, you need to destroy the old chart before creating a new one. Miss this and you get a canvas reuse error — Chart.js refuses to draw on a canvas that already has a chart attached. The wrapper was supposed to handle this automatically, tracking instances by canvas ID and destroying them before re-creation.

It didn't. Charts leaked across view transitions, the instance tracker got out of sync with the actual DOM, and the console filled with `Canvas is already in use` errors. I spent a frustrating twenty minutes reading the Chart.js docs on `chart.destroy()` before realizing the issue was timing: the wrapper was trying to destroy charts that had already been removed from the DOM by the router's view swap.

Then it worked. The fix was to destroy charts _before_ the router swaps the view, not after. Brief, but the kind of brief that costs you twenty minutes of your life.

>> 26.02.12 - Both Claude 4.6 and GPT-5.3-Codex helped on this. I can't imagine what the next generation of models will look like — Matt Shumer says 5.3-Codex is the first one where he can launch a task, leave for hours, and come back to working software. 8 hours of sustained autonomy. And the part that strikes me most: when instructions are ambiguous, it makes decisions surprisingly similar to the ones you'd make yourself. Each iteration feels less like a tool and more like a colleague.

# what you're looking at

The dashboard is, at its core, a bet on a single idea: --your entire financial life can be described by one table--. Every row is a transaction. Every column is an attribute of that transaction. Everything else — the charts, the filters, the P&L calculations, the allocation breakdowns — is just looking at that same table from different angles.

This is a wealth management dashboard {{(wealth management — a term normally reserved for people who have wealth to manage, which disqualifies most of us, but the math is the same whether you're tracking 30K or 30M)|the only difference between managing 30K and 30M is the number of zeros and the quality of the furniture in the advisory office. The formulas, the diversification logic, the P&L calculations — identical. Your spreadsheet doesn't know you're not rich.}}. You give it a CSV of your trades. It gives you back a picture of where your money is, where it's been, and how much of it you've lost to your own decisions.

## the first chart: capital over time

Money goes in. It grows or it shrinks — that's the market's opinion, not yours. When you sell, the opinion becomes fact: the gain or loss becomes realized. That's the dashboard's portfolio-over-time area chart. An area that expands when you deposit and invest, and that wobbles up and down as the market changes its mind about what your positions are worth.

Everything else is just looking at the same data from different angles.

![FinBoard Dashboard|The dashboard view: KPIs, allocation donuts, and capital over time.](https://cdn.infraphysics.net/4e1c-r8w5-j6n2.png "center")

## holdings: what you own, what it costs, what it's worth

A sortable table of every position — active and closed. Live prices from Yahoo Finance via a CORS proxy. Cost basis, current value, unrealized P&L, weight in portfolio. Click any row and you drill down into the asset detail view.

The table separates active positions (things you still own) from closed ones (things you sold). Closed positions show realized P&L. Active positions show unrealized P&L that updates when prices refresh. The column headers are clickable — sort by P&L to see your winners and losers, sort by weight to see concentration risk.

![Holdings view|Sortable table with real-time prices and P&L.](https://cdn.infraphysics.net/b3x7-q2v9-h5t4.png "center")

## timeline: when you did what

The timeline combines three visualizations: a cumulative capital area chart with buy/sell bars overlay, a monthly contribution heatmap, and a table breaking down each month's activity. The heatmap uses color intensity to show when you were most active — useful for spotting patterns in your own behavior, like the fact that I tend to invest heavily in January and barely touch anything in summer.

![Timeline view|Cumulative capital, heatmap, and monthly flow.](https://cdn.infraphysics.net/w6p1-c8y3-d4s9.png "center")

## analysis: stratification and filtering

Four sub-tabs, each slicing the same data differently:

- **By platform.** How much capital is deployed where. Useful if you use multiple brokers and want to see concentration
- **By asset type.** Stocks vs. ETFs vs. crypto vs. commodities. The allocation you think you have versus the allocation you actually have
- **By period.** Yearly investment flow — how much went in, how much came out, net contribution per year
- **Butterfly P&L.** A horizontal bar chart showing unrealized P&L per asset — green bars to the right (winners), red bars to the left (losers). A visual slap that tells you exactly which picks are working and which are not

![Analysis view|Butterfly P&L chart showing per-asset unrealized gains and losses.](https://cdn.infraphysics.net/n9g5-a2f7-u1l6.png "center")

## asset detail: the deep dive

Click any holding and you get the per-asset view: a price chart with buy/sell markers overlaid (green arrows for buys, red for sells, positioned at the exact date and price), eight KPIs (average cost, current price, total invested, current value, unrealized P&L, realized P&L, number of transactions, holding period), and a full transaction history table.

![Asset detail|Per-asset price chart with transaction markers.](https://cdn.infraphysics.net/t8m3-e5z2-k7r1.png "center")

You could imagine extending this to overlay sector benchmarks, maybe even a custom weighted index of your top holdings to see if your manual picks are beating a simple DCA into an S&P 500 ETF — which, statistically speaking, they almost certainly are not, but the visualization would at least let you measure by how much you're underperforming, which is a kind of knowledge, I suppose. You could layer in dividend tracking, maybe even model reinvestment scenarios where the dividends auto-purchase more shares at the ex-date price, computing the hypothetical snowball effect against what you actually did with the cash. You could add correlation matrices between your holdings, drawdown analysis, risk-adjusted returns via Sharpe ratios, Monte Carlo simulations of future portfolio value based on historical volatility...

I'd go deeper into this but I have certain projects that are more bricks than bits waiting in the queue so... maybe another time.

# the incident

Here's the thing about developing a financial dashboard: at some point, you need data that looks real. Not "Jane bought 10 AAPL" — real patterns, real price ratios, real portfolio behavior. And the easiest source of realistic financial data is, unfortunately, your own actual financial data.

The problem starts with CORS. Browsers block `file://` reads for security reasons, which means if you double-click `index.html` and try to load a CSV from the same folder, the browser says no. The proper solution is `python -m http.server` — a one-line local server that serves files over `http://localhost:8000`, which browsers are happy with.

I didn't feel like it. Too lazy. So I hardcoded my real personal transactions directly into `demo-data.js` — the file that provides fallback data when no CSV is uploaded. This way `index.html` would just open with my real portfolio displayed. Convenient. 84 stock transactions across three brokers. 18 crypto transactions across four exchanges. Amounts, prices, platforms, timestamps. All real. All mine.

I pushed to GitHub.

I didn't realize until later that evening, when I was registering two new trades and the assistant helpfully asked if I was aware that my personal financial data was publicly visible on `github.com/yago-mendoza/FinBoard`. I was not, in fact, aware.

The commit that was supposed to fix this — titled "Anonymize example CSVs" — only anonymized the CSV files in the `examples/` folder. It did not touch `demo-data.js`. The personal data survived, cheerfully public, through 14 commits and several hours.

Remediation was nuclear: delete `.git` entirely, `git init` a fresh repository with anonymized demo data, and `git push --force origin main`. The project now has a single commit: `Initial commit -- clean repo with example demo data`. All history is gone. No traces of actual transactions in the public record.

--Infra-committed.--

I suppose that's the cost of the hash — though not quite as costly as in blockchain.

{bkqt/danger|In Hindsight}
The lazy shortcut (hardcoding real data instead of running `python -m http.server`) created a real exposure. 84 stock transactions reveal: which brokers you use, your investment patterns, your position sizes, and your timing. Combined with a name on the GitHub profile, that's more financial information than most people voluntarily share. The lesson is obvious: never commit real personal data, even "temporarily." Temporary has a way of becoming permanent when you push to remote.
{/bkqt}

# and what about the money that isn't invested?

FinBoard tracks what you bought and what it's worth. It knows you own 3 shares of MSFT at an average cost of 404.34. It knows your NVDA position is up 23%. It can tell you your total deployed capital, your realized P&L, your unrealized P&L.

But it doesn't know _how the money got there_.

There's no record of the salary deposit that funded the brokerage account. No record of the bank transfer from BBVA to Trade Republic three days before you bought AAPL. No record of the cash sitting in IBKR waiting to be deployed. FinBoard sees the purchases but not the procurement — like looking at a factory's output without knowing how the raw materials arrived.

Two CSVs existed: stock transactions and crypto transactions. 104 transactions total across seven platforms, four years. They recorded _what_ was bought, _where_, _when_, and _for how much_. The third CSV — the one tracking salary deposits, bank transfers, and the cash sitting idle in brokers — didn't exist. Nobody had ever written it down.

The missing data wasn't lost. It was latent. Every purchase implies a prior transfer. Every transfer implies a prior salary. The information was there, encoded in the purchase records themselves, waiting to be reverse-engineered.

I proposed this to Claude Code as essentially an {{industrial organization problem|Material Requirements Planning (MRP) — a production planning algorithm from manufacturing. Given a demand schedule (what products to build and when), MRP works backward through the bill of materials to compute the procurement schedule (what raw materials to order and when), respecting lead times and inventory constraints.}} — like **Material Requirements Planning** from university, where you work backwards from a production schedule to compute the procurement timeline. Except here, "production" is stock purchases and "procurement" is bank transfers. The finished goods demand becomes my purchase history. The raw materials are cash in broker accounts. The procurement schedule is the set of bank transfers I need to reconstruct. Lead times become transfer windows — 3 to 9 days before each purchase. And inventory is just the cash balance at each platform at any given moment.

MRP is O(n·m) for n products and m time periods — not NP-hard, but the constraint propagation gets interesting when you add timing windows, rounding heuristics (I tended to transfer round amounts — 500, 1000, 1850 — not exact purchase costs), and the global invariant that --no account can go negative at any point in the simulation--. That last constraint is what turns it from an accounting exercise into a validation problem.

The topology is a star network: employer pays into BBVA, BBVA distributes to brokers. All money flows through BBVA as the central hub. Seven platforms, four years, one question — can you reconstruct the complete cash flow history from the purchase records alone?

## the validation script

I invited Claude to invent a validation script as a kind of in-house reward signal — a function that tells you whether your reconstructed history is physically possible. A 256-line Python program that merges all three CSVs into a single chronological timeline (~170 events), then walks through it event by event. The core is deceptively simple:

```python
cash = defaultdict(float)

for dt, evt, sub, frm, to, amt, note in timeline:
    if evt == "LIQ":
        if sub in ("SAL", "INI"):
            cash[to] += amt
        elif sub == "TRF":
            if amt < 0:  # outgoing transfer
                cash[frm] += amt
                cash[to] -= amt
                if cash[frm] < -0.01:
                    errors.append(f"{frm} went NEGATIVE: {cash[frm]:.2f}")
    elif evt == "BUY":
        cash[plat] -= amt
        if cash[plat] < -0.01:
            errors.append(f"{plat} NEGATIVE after buying {note}")
    elif evt == "SEL":
        cash[plat] += amt
```

Salary deposits add money to BBVA. Transfers move money between accounts. Purchases subtract from brokers. Sales add back. If any account goes negative at any point, the reconstruction is wrong — the money wasn't there when it needed to be. After the simulation, it compares computed balances against declared balances. For brokers they must match within 1 EUR. For BBVA, the computed balance is always higher than real — because the simulation doesn't account for rent, food, and the general cost of being alive. That difference is expected. The error case is if computed is _lower_ than declared, which would mean the income model is wrong.

## four iterations to zero errors

| Iteration | Errors | What was wrong |
|---|---|---|
| 1 | 11 | No initial savings, salaries only in active months, sell proceeds double-counted |
| 2 | 3 | Balance mismatches — missing recent transfers |
| 3 | 3 | Rounded amounts didn't add up exactly — 70, 168, 260 EUR off |
| 4 | **0** | All balances match to the cent |

Iteration 1 was a mess. The simulation started with zero money and immediately tried to spend 5,600 EUR on crypto. BBVA went negative on the first transfer. Fix: add an initial savings event of 8,000 EUR. Sell proceeds were double-counted — the script already credits cash when it sees a sale, but I'd _also_ added explicit lines in the liquidity CSV for the same proceeds. Eliminated the duplicates.

Iteration 2 was structural reform: all 50 months of salary. Only 3 errors survived — balance mismatches where recent cash transfers hadn't been recorded.

Iteration 3 added the missing transfers. The mismatches shrank from thousands to hundreds. Over 44K EUR in total transfers, residuals of 0.16%, 0.38%, and 0.59%. Pure rounding error.

Iteration 4 fine-tuned three amounts. The first TDRP transfer: 600 became 670.74. The recent MYNV funding: 4000 became 3831.17. The IBKR cash reserve: 3018 became 2757.94.

## the result

| Platform | Computed | Declared | Status |
|---|---|---|---|
| TDRP | 552.20 | 552.20 | **MATCH** |
| MYNV | 4,035.72 | 4,035.72 | **MATCH** |
| IBKR | 3,018.00 | 3,018.00 | **MATCH** |
| BBVA | 68,506.21 | 1,310.92 | OK (diff = living expenses) |

Three platforms match to the cent. BBVA's difference — --67,195 EUR-- over 50 months — implies 1,344 EUR/month in living expenses. For a net salary of 1,980, that's a 32% savings rate. Reasonable. Consistent.

Capital summary: 8K initial savings + 99K salary = 107K total income. 44K transferred to platforms. 36K in purchases. 6K in sell proceeds. 30K net invested.

Three CSVs, three facets of the same financial reality, validated against each other to the cent. The total session cost was ~189K tokens — about --$5.13 at Opus 4.6 pricing--. The price of a mediocre coffee for a mathematically consistent reconstruction of 50 months of financial history.

{bkqt/note|Provisional reconstruction}
This entire liquidity history is heuristic — I _estimated_ transfer dates and amounts based on purchase patterns. The real transfer records exist in my BBVA bank statements and I'm in the process of requesting the full transaction history. Once I have it, every inferred transfer gets replaced with the actual one, and the validation script will tell me exactly how close (or far) the heuristic reconstruction was from reality. Think of this as a scaffold: it holds the shape while the real structure is being built.
{/bkqt}

What this section really demonstrates is what happens when you frame a personal finance problem as an industrial engineering one and hand it to a model with the context to reason about constraints. Claude didn't need to be taught MRP. It needed to be told that the problem _was_ MRP — and once framed, the constraint propagation, the iterative refinement, the validation loop, all of it followed naturally. The model's contribution wasn't code generation. It was organizational reasoning — the ability to hold 170 events across 7 platforms and 50 months in working memory and identify where the numbers didn't add up.

The next step is bigger: request the full BBVA transaction history, classify every transaction (rent, food, transport, subscriptions), and build a complete financial dataset from the first intern paycheck to the last loaf of bread. Not approximate. Not estimated. Validated to the cent. All in service of the thesis that --data about your own life is the most valuable dataset you'll never be given--. You have to build it yourself.

>> 26.02.12 - 189K tokens and a validated reconstruction of 4 years of cash flows. The script that validates it is 256 lines of Python. The data it validates took 50 months to generate. There's something satisfying about that ratio.
>> 26.02.13 - The frontend now includes the liquidity data too. I've requested the full transaction history from BBVA to replace the heuristic reconstruction with real records, but you know how banks are with these things — so for now, the scaffold holds.
