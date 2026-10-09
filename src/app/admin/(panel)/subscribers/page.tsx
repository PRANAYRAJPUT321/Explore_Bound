import { Download, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/admin/FormControls";
import { adminListSubscribers } from "@/db/queries";
import { deleteSubscriber } from "@/lib/admin-actions";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Subscribers" };

export default async function AdminSubscribers() {
  const list = await adminListSubscribers();
  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Newsletter subscribers</h1>
          <p className="text-sm text-white/50">{list.length} people want your deals. Export to Mailchimp, Brevo or any email tool.</p>
        </div>
        <a href="/admin/export/subscribers" className="btn-primary">
          <Download size={16} /> Export CSV
        </a>
      </header>
      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-xs text-white/45">
            <tr>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Subscribed</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t border-white/5">
                <td className="px-5 py-3">{s.email}</td>
                <td className="px-5 py-3 text-white/55">{formatDate(s.createdAt)}</td>
                <td className="px-5 py-3 text-right">
                  <form action={deleteSubscriber}>
                    <input type="hidden" name="id" value={s.id} />
                    <ConfirmButton message={`Remove ${s.email}?`} className="rounded-full p-1.5 text-white/40 hover:text-coral-400">
                      <Trash2 size={14} />
                    </ConfirmButton>
                  </form>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-white/45">
                  No subscribers yet — the footer signup form feeds this list.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
