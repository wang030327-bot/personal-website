import { MusicCard } from "@/components/music/music-card";
import { MusicRecommendForm } from "@/components/music/music-recommend-form";
import { SectionTitle } from "@/components/ui/section-title";
import { isAdminAuthenticated } from "@/lib/auth";
import { getMusicArchive, getTodayMusic } from "@/lib/music";

export default async function MusicPage() {
  const isAdmin = await isAdminAuthenticated();
  const today = await getTodayMusic();
  const archive = (await getMusicArchive()).slice(1);

  return (
    <div className="space-y-12">
      {isAdmin ? <MusicRecommendForm /> : null}

      <section className="space-y-5">
        <SectionTitle
          eyebrow="Daily Pick"
          title="今日推荐音乐"
          description="管理员可在本页面直接粘贴网易云链接推荐当日音乐；访客可直接收听与浏览归档。"
        />
        {today ? <MusicCard item={today} /> : null}
      </section>

      <section className="space-y-5">
        <SectionTitle eyebrow="Archive" title="历史推荐" description="每条推荐都可直接跳转网易云歌曲页面。" />
        <div className="grid gap-4">
          {archive.map((item) => (
            <MusicCard key={item.id} item={item} compact />
          ))}
        </div>
      </section>
    </div>
  );
}

