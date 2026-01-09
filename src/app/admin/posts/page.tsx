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
  const fetchPosts = async () => {
    try {
      setIsLoading(true);

      // フェッチ処理の本体
      const requestUrl = "/api/posts";
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });

      // レスポンスのステータスコードが200以外の場合 (投稿記事のフェッチに失敗した場合)
      if (!res.ok) {
        setPosts(null);
        throw new Error(
          `投稿記事の一覧のフェッチに失敗しました: (${res.status}: ${res.statusText})`,
        ); // -> catch節に移動
      }

      // レスポンスのボディをJSONとして読み取り投稿記事配列 (State) にセット
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
      // 成功した場合も失敗した場合もローディング状態を解除
      setIsLoading(false);
    }
  };

  // コンポーネントがマウントされたとき (初回レンダリングのとき) に1回だけ実行
  useEffect(() => {
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
      <div className="mb-4 text-2xl font-bold">投稿記事一覧</div>

      {posts.length === 0 ? (
        <div className="text-gray-500">投稿記事は1個も作成されていません</div>
      ) : (
        <div>
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  タイトル
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  カテゴリ
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  作成日
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  編集
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="border border-gray-300 px-4 py-2">
                    <a href={`/admin/posts/${post.id}`}>{post.title}</a>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {post.categories.map((cat) => cat.category.name).join(", ")}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="border border-gray-300">
                    <button
                      className={twMerge(
                        "ml-4 rounded-md px-5 py-1 font-bold",
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
        </div>
      )}
    </main>
  );
};

export default Page;
