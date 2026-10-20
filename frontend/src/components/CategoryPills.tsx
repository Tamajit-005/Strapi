import type { BlogPost } from "@/lib/types";

export default function CategoryPills({ post }: { post: BlogPost }) {
  if (!post.categories || post.categories.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {post.categories.map((cat) => (
        <span
          key={cat._id}
          className="inline-flex h-9 items-center whitespace-nowrap rounded-full border border-black px-3 font-serif text-[12px] leading-3.75 tracking-[0.01em] text-black uppercase transition-all duration-300 hover:rounded-lg"
        >
          {cat.name}
        </span>
      ))}
    </div>
  );
}
