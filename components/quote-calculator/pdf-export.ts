import { BIZ } from "@/lib/brand"
import { HUBS } from "@/lib/data"
import { CartItem, getDisplayName, getEffectiveRate, quoteTotals } from "./lib"

export function exportQuotePdf(cart: CartItem[]) {
  if (cart.length === 0) return
  const t = quoteTotals(cart)
  const rows = cart.map(item => {
    const qty = item.qty || 1
    const effRate = getEffectiveRate(item.id, item.name, qty, item.unitPrice)
    const displayName = getDisplayName(item.sectionTitle, item.name)
    const fullLabel = `${displayName} - ${item.sectionTitle}`
    const hubLabel = HUBS[item.hubId].title
    const qtyLabel = item.unit ? `${qty} ${item.unit}${qty > 1 ? "s" : ""}` : `x${qty}`
    return `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;">
        ${fullLabel}
        <span style="display:block;font-size:10px;color:#a1a1aa;margin-top:2px;">${hubLabel}</span>
      </td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center;">${qtyLabel}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;">R${effRate}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:700;">R${effRate * qty}</td>
    </tr>`
  }).join("")

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
    <title>${BIZ.name} — Quote</title>
    <style>
      body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#18181b;padding:32px;max-width:640px;margin:0 auto;}
      h1{font-size:20px;margin:0 0 4px;}
      p.sub{color:#71717a;font-size:13px;margin:0 0 24px;}
      table{width:100%;border-collapse:collapse;font-size:13px;}
      th{text-align:left;padding:8px 10px;border-bottom:2px solid #18181b;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;}
      tfoot td{padding:12px 10px;font-weight:800;font-size:15px;border-top:2px solid #18181b;}
      .savings{color:#059669;font-size:12px;margin-top:6px;}
      .footer{margin-top:32px;font-size:11px;color:#a1a1aa;}
    </style></head><body>
    <h1>${BIZ.name} — Quotation</h1>
    <p class="sub">Generated ${new Date().toLocaleString()} · ${BIZ.location}</p>
    <table>
      <thead><tr><th>Service</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Rate</th><th style="text-align:right;">Line Total</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="3">Total</td><td style="text-align:right;">R${t.total}</td></tr></tfoot>
    </table>
    ${t.savings > 0 ? `<p class="savings">Includes R${t.savings} saved with bulk pricing.</p>` : ""}
    <p class="footer">${BIZ.phone} · ${BIZ.email} · This quote is an estimate and may change on confirmation.</p>
    <script>window.onload = () => window.print()<\/script>
    </body></html>`

  const win = window.open("", "_blank")
  if (win) { win.document.write(html); win.document.close() }
}
