import { Trash2 } from "lucide-react";
import { AutoSelect, ConfirmButton } from "@/components/admin/FormControls";
import { StatusPill } from "@/components/admin/StatusPill";
import { adminListFeedback } from "@/db/queries";
import { deleteFeedback, updateFeedback } from "@/lib/admin-actions";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Feedback" };

export default async function AdminFeedback() {
  const list = await adminListFeedback();
  const scored = list.length;
  const promoters = list.filter((f) => f.score >= 9).length;
  const detractors = list.filter((f) => f.score <= 6).length;
  const nps = scored ? Math.round(((promoters - detractors) / scored) * 100) : null;
  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Feedback</h1>
          <p className="text-sm text-white/50">Private feedback from the Reviews page. Not shown publicly.</p>
        </div>
        <div className="card px-5 py-3 text-right">
          <div className="text-xs text-white/50">Net Promoter Score ({scored} responses)</div>
          <div className="text-3xl font-semibold">{nps === null ? "–" : nps}</div>
        </div>
      </header>
      <div className="grid gap-3 xl:grid-cols-2">
        {list.map((f) => (
          <article key={f.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{f.name}</div>
                <a href={`mailto:${f.email}`} className="text-xs text-white/45 hover:text-white">
                  {f.email}
                </a>
              </div>
              <div className="text-right">
                <StatusPill status={f.status} />
                <div className="mt-1 text-[11px] text-white/35">{timeAgo(f.createdAt)}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="rounded-full bg-white/5 px-2.5 py-1 capitalize">{f.category}</span>
              <span className="text-white/60">
                Score <b className="text-white">{f.score}</b>/10
              </span>
            </div>
            <p className="mt-3 text-sm whitespace-pre-line text-white/75">{f.message}</p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <form action={updateFeedback}>
                <input type="hidden" name="id" value={f.id} />
                <AutoSelect name="status" label="Feedback status" defaultValue={f.status} options={["new", "read", "resolved"]} />
              </form>
              <form action={deleteFeedback}>
                <input type="hidden" name="id" value={f.id} />
                <ConfirmButton message="Delete this feedback?" className="rounded-full p-2 text-white/40 hover:text-coral-400">
                  <Trash2 size={15} />
                </ConfirmButton>
              </form>
            </div>
          </article>
        ))}
        {list.length === 0 && <p className="card p-10 text-center text-white/50 xl:col-span-2">No feedback yet.</p>}
      </div>
    </div>
  );
}
