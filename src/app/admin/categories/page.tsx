"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Category } from "@/app/_types/Category";
import { twMerge } from "tailwind-merge";

// カテゴリをフェッチしたときのレスポンスのデータ型
type CategoryApiResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// カテゴリ一覧表示ページ
const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  // カテゴリ配列 (State)。取得中と取得失敗時は null、既存カテゴリが0個なら []
  const [categories, setCategories] = useState<Category[] | null>(null);

  // ウェブAPI (/api/categories) からカテゴリの一覧をフェッチする関数の定義
  const fetchCategories = async () => {
    try {
      setIsLoading(true);

      // フェッチ処理の本体
      const requestUrl = "/api/categories";
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });

      // レスポンスのステータスコードが200以外の場合 (カテゴリのフェッチに失敗した場合)
      if (!res.ok) {
        setCategories(null);
        throw new Error(
          `カテゴリの一覧のフェッチに失敗しました: (${res.status}: ${res.statusText})`,
        ); // -> catch節に移動
      }

      // レスポンスのボディをJSONとして読み取りカテゴリ配列 (State) にセット
      const apiResBody = (await res.json()) as CategoryApiResponse[];
      setCategories(
        apiResBody.map((body) => ({
          id: body.id,
          name: body.name,
        })),
      );
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
    fetchCategories();
  }, []);

  // カテゴリの一覧を取得中の画面
  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  // カテゴリの一覧を取得失敗したときの画面
  if (!categories) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  return (
    <main>
      <div className="mb-4 text-sm font-bold sm:text-base md:text-2xl">
        カテゴリ一覧
      </div>

      {categories.length === 0 ? (
        <div className="text-gray-500">カテゴリは1個も作成されていません</div>
      ) : (
        <div>
          <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm md:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-1 py-1 text-left sm:px-2 sm:py-2 md:px-4 md:py-2">
                  ID
                </th>
                <th className="border border-gray-300 px-1 py-1 text-left sm:px-2 sm:py-2 md:px-4 md:py-2">
                  名前
                </th>
                <th className="border border-gray-300 px-1 py-1 text-left sm:px-2 sm:py-2 md:px-4 md:py-2">
                  編集
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="border border-gray-300 px-1 py-1 sm:px-2 sm:py-2 md:px-4 md:py-2">
                    {category.id}
                  </td>
                  <td className="border border-gray-300 px-1 py-1 sm:px-2 sm:py-2 md:px-4 md:py-2">
                    <a href={`/admin/categories/${category.id}`}>
                      {category.name}
                    </a>
                  </td>
                  <td className="flex justify-center border border-gray-300 px-1 py-1 sm:px-2 sm:py-2 md:px-2 md:py-2">
                    <button
                      className={twMerge(
                        "rounded-md px-2 py-1 text-xs font-bold sm:px-5 sm:text-sm md:text-base",
                        "bg-indigo-500 text-white hover:bg-indigo-600",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                      )}
                    >
                      <a href={`/admin/categories/${category.id}`}>編集</a>
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
              <a href={`/admin/categories/new`}>新規作成</a>
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;
