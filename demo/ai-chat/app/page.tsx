import { Chat } from "@/components/chat";
import { DemoBanner } from "@/components/demo-banner";

/**
 * The only structural difference between the demo and the template: a banner
 * above the app. Everything below it is the template, unmodified.
 *
 * The height override is the whole reason this is not three lines. `Chat` is
 * `h-dvh` — it is written to BE the page, which is right for the template and
 * wrong the moment something sits above it: it would ask for the full
 * viewport inside a box that is 40px shorter and push its own composer off
 * the bottom. `h-full!` on the direct child wins over `h-dvh` and makes it
 * fill the flex cell instead.
 *
 * Done here rather than by editing components/chat.tsx on purpose. That file
 * is the product; the demo does not get to fork it, or the thing being
 * demonstrated stops being the thing being sold.
 */
export default function Page() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <DemoBanner />
      <div className="min-h-0 flex-1 [&>*]:h-full!">
        <Chat />
      </div>
    </div>
  );
}
