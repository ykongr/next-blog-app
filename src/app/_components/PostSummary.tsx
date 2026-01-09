"use client";
import type { Post } from "@/app/_types/Post";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";

type Props = {
  post: Post;
};

const PostSummary: React.FC<Props> = (props) => {
  const { post } = props;
  const safeHTML = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br"],
  });
  <Link href={`/posts/${post.id}`}>
    <div className="mb-1 text-lg font-bold">{post.title}</div>
    <div
      className="line-clamp-3"
      dangerouslySetInnerHTML={{ __html: safeHTML }}
    />
  </Link>;
  return (
    <div className="border border-slate-400 p-3">
      <div className="font-bold">{post.title}</div>
      <div>{post.content}</div>
    </div>
  );
};

export default PostSummary;
