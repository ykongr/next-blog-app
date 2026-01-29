"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

// 投稿記事をフェッチしたときのレスポンスのデータ型
type PostApiResponse = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  categories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
};

// 投稿記事一覧表示ページ
const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  // 投稿記事配列 (State)。取得中と取得失敗時は null、既存投稿記事が0個なら []
  const [posts, setPosts] = useState<PostApiResponse[] | null>(null);

  // ウェブAPI (/api/posts) から投稿記事の一覧をフェッチする関数の定義
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const requestUrl = "/api/posts";
        const res = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          setPosts(null);
          throw new Error(
            `投稿記事の一覧のフェッチに失敗しました: (${res.status}: ${res.statusText})`,
          );
        }

        const apiResBody = (await res.json()) as PostApiResponse[];
        setPosts(apiResBody);
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : `予期せぬエラーが発生しました ${error}`;
        console.error(errorMsg);
        setFetchErrorMsg(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 投稿記事の一覧を取得中の画面
  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  // 投稿記事の一覧を取得失敗したときの画面
  if (!posts) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  return (
    <main>
      <div className="mb-4 text-sm font-bold sm:text-base md:text-2xl">
        投稿記事一覧
      </div>

      {posts.length === 0 ? (
        <div className="text-gray-500">投稿記事は1個も作成されていません</div>
      ) : (
        <div>
          <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm md:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-1 py-1 text-left sm:px-2 sm:py-2 md:px-4 md:py-2">
                  タイトル
                </th>
                <th className="border border-gray-300 px-1 py-1 text-left sm:px-2 sm:py-2 md:px-4 md:py-2">
                  カテゴリ
                </th>
                <th className="border border-gray-300 px-1 py-1 text-left sm:px-2 sm:py-2 md:px-4 md:py-2">
                  作成日
                </th>
                <th className="border border-gray-300 px-1 py-1 text-left sm:px-2 sm:py-2 md:px-4 md:py-2">
                  編集
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="border border-gray-300 px-1 py-1 sm:px-2 sm:py-2 md:px-4 md:py-2">
                    <a href={`/admin/posts/${post.id}`}>{post.title}</a>
                  </td>
                  <td className="border border-gray-300 px-1 py-1 sm:px-2 sm:py-2 md:px-4 md:py-2">
                    {post.categories.map((cat) => cat.category.name).join(", ")}
                  </td>
                  <td className="border border-gray-300 px-1 py-1 sm:px-2 sm:py-2 md:px-4 md:py-2">
                    {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="flex justify-center border border-gray-300 px-1 py-1 sm:px-2 sm:py-2 md:px-2 md:py-2">
                    <button
                      className={twMerge(
                        "rounded-md px-2 py-1 text-xs font-bold sm:px-5 sm:text-sm md:text-base",
                        "bg-indigo-500 text-white hover:bg-indigo-600",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                      )}
                    >
                      <a href={`/admin/posts/${post.id}`}>編集</a>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 flex justify-end">
            <button
              className={twMerge(
                "rounded-md px-2 py-1 text-xs font-bold sm:px-5 sm:text-sm md:text-base",
                "bg-green-700 text-white hover:bg-green-800",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <a href={`/admin/posts/new`}>新規作成</a>
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;
