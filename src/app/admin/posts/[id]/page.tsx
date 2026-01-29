"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { Category } from "@/app/_types/Category";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

// 投稿記事をフェッチしたときのレスポンスのデータ型
type PostApiResponse = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string;
  createdAt: string;
  categories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
};

// カテゴリをフェッチしたときのレスポンスのデータ型
type CategoryApiResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// 投稿記事の編集ページ
const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCoverImageURL, setNewCoverImageURL] = useState("");
  const [newCategoryIds, setNewCategoryIds] = useState<string[]>([]);

  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [coverImageURLError, setCoverImageURLError] = useState("");

  const [currentPost, setCurrentPost] = useState<PostApiResponse | undefined>(
    undefined,
  );

  // 動的ルートパラメータから id を取得
  const { id } = useParams() as { id: string };

  // ページの移動に使用するフック
  const router = useRouter();

  // カテゴリ配列 (State)
  const [categories, setCategories] = useState<Category[] | null>(null);

  // ウェブAPI (/api/posts/[id]) から投稿記事をフェッチする関数の定義

  // ウェブAPI (/api/categories) からカテゴリの一覧をフェッチする関数の定義

  // コンポーネントがマウントされたとき (初回レンダリングのとき) に1回だけ実行
  useEffect(() => {
    // 1. fetchPost を中に入れる
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const requestUrl = `/api/posts/${id}`; // id に依存している
        const res = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          setCurrentPost(undefined);
          throw new Error(
            `投稿記事のフェッチに失敗しました: (${res.status}: ${res.statusText})`,
          );
        }

        const apiResBody = (await res.json()) as PostApiResponse;
        setCurrentPost(apiResBody);
        setNewTitle(apiResBody.title);
        setNewContent(apiResBody.content);
        setNewCoverImageURL(apiResBody.coverImageURL);
        setNewCategoryIds(apiResBody.categories.map((c) => c.category.id));
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

    const fetchCategories = async () => {
      try {
        const requestUrl = "/api/categories";
        const res = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          setCategories(null);
          throw new Error(
            `カテゴリの一覧のフェッチに失敗しました: (${res.status}: ${res.statusText})`,
          );
        }

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
      }
    };

    // 2. fetchCategories ももし他で使わないなら中に入れるか、
    // 他で使うなら今のまま外に置いて useCallback で囲む必要があります。
    fetchPost();
    fetchCategories();

    // 3. 依存関係に [id] を入れる（fetchCategoriesが外にあるならそれも警告されます）
  }, [id]);
  // バリデーション関数
  const validateTitle = (title: string): string => {
    if (title.length < 1 || title.length > 100) {
      return "1文字以上100文字以内で入力してください。";
    }
    return "";
  };

  const validateContent = (content: string): string => {
    if (content.length < 1) {
      return "内容を入力してください。";
    }
    return "";
  };

  const validateCoverImageURL = (url: string): string => {
    if (url.length < 1) {
      return "カバー画像URLを入力してください。";
    }
    return "";
  };

  // タイトル変更時
  const updateTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitleError(validateTitle(value));
    setNewTitle(value);
  };

  // コンテンツ変更時
  const updateContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContentError(validateContent(value));
    setNewContent(value);
  };

  // カバー画像URL変更時
  const updateCoverImageURL = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCoverImageURLError(validateCoverImageURL(value));
    setNewCoverImageURL(value);
  };

  // カテゴリ選択変更時
  const updateCategoryIds = (categoryId: string) => {
    setNewCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const requestUrl = `/api/admin/posts/${id}`;
      const res = await fetch(requestUrl, {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          coverImageURL: newCoverImageURL,
          categoryIds: newCategoryIds,
        }),
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      router.replace("/admin/posts");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿記事の更新に失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (
      !window.confirm(`投稿記事「${currentPost?.title}」を本当に削除しますか？`)
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const requestUrl = `/api/admin/posts/${id}`;
      const res = await fetch(requestUrl, {
        method: "DELETE",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      router.replace("/admin/posts");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿記事の削除に失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
      setIsSubmitting(false);
    }
  };

  // 読み込み中の画面
  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  // 読み込み失敗時の画面
  if (!currentPost) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <div className="mb-4 text-sm font-bold sm:text-base md:text-2xl">
          投稿記事の編集
        </div>
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

      <form
        onSubmit={handleSubmit}
        className={twMerge("mb-4 space-y-4", isSubmitting && "opacity-50")}
      >
        <div className="space-y-6">
          {/* タイトル */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-bold sm:text-base"
            >
              タイトル
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="w-full rounded-md border-2 px-2 py-1 text-xs sm:text-sm md:text-base"
              placeholder="タイトルを入力してください"
              value={newTitle}
              onChange={updateTitle}
              required
            />
            {titleError && (
              <div className="flex items-center space-x-1 text-xs font-bold text-red-500 sm:text-sm">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="mr-0.5"
                />
                <div>{titleError}</div>
              </div>
            )}
          </div>

          {/* コンテンツ */}
          <div className="space-y-2">
            <label
              htmlFor="content"
              className="block text-sm font-bold sm:text-base"
            >
              コンテンツ
            </label>
            <textarea
              id="content"
              name="content"
              className="w-full rounded-md border-2 px-2 py-1 text-xs sm:text-sm md:text-base"
              placeholder="コンテンツを入力してください"
              value={newContent}
              onChange={updateContent}
              rows={10}
              required
            />
            {contentError && (
              <div className="flex items-center space-x-1 text-xs font-bold text-red-500 sm:text-sm">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="mr-0.5"
                />
                <div>{contentError}</div>
              </div>
            )}
          </div>

          {/* カバー画像URL */}
          <div className="space-y-2">
            <label
              htmlFor="coverImageURL"
              className="block text-sm font-bold sm:text-base"
            >
              カバー画像URL
            </label>
            <input
              type="text"
              id="coverImageURL"
              name="coverImageURL"
              className="w-full rounded-md border-2 px-2 py-1 text-xs sm:text-sm md:text-base"
              placeholder="カバー画像URLを入力してください"
              value={newCoverImageURL}
              onChange={updateCoverImageURL}
              required
            />
            {coverImageURLError && (
              <div className="flex items-center space-x-1 text-xs font-bold text-red-500 sm:text-sm">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="mr-0.5"
                />
                <div>{coverImageURLError}</div>
              </div>
            )}
          </div>

          {/* カテゴリ選択 */}
          <div className="space-y-2">
            <div className="block text-sm font-bold sm:text-base">カテゴリ</div>
            <div className="space-y-2">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center text-xs sm:text-sm md:text-base"
                  >
                    <input
                      type="checkbox"
                      checked={newCategoryIds.includes(category.id)}
                      onChange={() => updateCategoryIds(category.id)}
                      className="mr-2"
                    />
                    {category.name}
                  </label>
                ))
              ) : (
                <div className="text-xs text-gray-500 sm:text-sm md:text-base">
                  カテゴリなし
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-1 sm:space-x-2">
          <button
            type="submit"
            className={twMerge(
              "rounded-md px-2 py-1 text-xs font-bold sm:px-5 sm:text-sm md:text-base",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            disabled={
              isSubmitting ||
              titleError !== "" ||
              contentError !== "" ||
              coverImageURLError !== "" ||
              newTitle === "" ||
              newContent === "" ||
              newCoverImageURL === ""
            }
          >
            投稿記事を更新
          </button>

          <button
            type="button"
            className={twMerge(
              "rounded-md px-2 py-1 text-xs font-bold sm:px-5 sm:text-sm md:text-base",
              "bg-red-500 text-white hover:bg-red-600",
            )}
            onClick={handleDelete}
          >
            削除
          </button>
        </div>
      </form>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center rounded-lg bg-white px-8 py-4 shadow-lg">
            <FontAwesomeIcon
              icon={faSpinner}
              className="mr-2 animate-spin text-gray-500"
            />
            <div className="flex items-center text-gray-500">処理中...</div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;
