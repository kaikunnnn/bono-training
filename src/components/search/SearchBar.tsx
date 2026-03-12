import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import {
  SearchResult,
  CONTENT_TYPE_ICONS,
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_COLORS,
} from "@/types/search";
import { useSearchData, searchFromCache } from "@/hooks/useSearch";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  defaultValue?: string;
  /** 検索ページに遷移するか、コールバックのみ呼ぶか */
  navigateOnSearch?: boolean;
  /** オートコンプリートを有効にするか */
  showSuggestions?: boolean;
}

/**
 * 検索バーコンポーネント（オートコンプリート機能付き）
 * Sanityのデータをリアルタイムで検索
 */
const SearchBar: React.FC<SearchBarProps> = ({
  className,
  placeholder = "レッスン、記事、ガイドを検索...",
  autoFocus = false,
  onSearch,
  defaultValue = "",
  navigateOnSearch = true,
  showSuggestions = true,
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sanityから検索データを取得
  const { data: searchData, isLoading: isLoadingData } = useSearchData();

  // デバウンス用タイマー
  const debounceRef = useRef<NodeJS.Timeout>();

  // 検索候補を取得
  useEffect(() => {
    if (!showSuggestions || !searchData) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const results = searchFromCache(searchData, query, 8);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setSelectedIndex(-1);
    }, 150); // 150msデバウンス

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, showSuggestions, searchData]);

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 検索実行
  const executeSearch = useCallback(
    (searchQuery: string) => {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return;

      setIsOpen(false);

      if (onSearch) {
        onSearch(trimmedQuery);
      }

      if (navigateOnSearch) {
        navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      }
    },
    [onSearch, navigate, navigateOnSearch]
  );

  // 候補選択
  const selectSuggestion = useCallback(
    (result: SearchResult) => {
      setQuery(result.title);
      setIsOpen(false);

      // 直接そのコンテンツへ遷移
      let path = "";
      switch (result.type) {
        case "lesson":
          path = `/lessons/${result.slug}`;
          break;
        case "article":
          path = `/articles/${result.slug}`;
          break;
        case "guide":
          path = `/knowledge/${result.slug}`;
          break;
        case "roadmap":
          path = `/roadmaps/${result.slug}`;
          break;
      }
      navigate(path);
    },
    [navigate]
  );

  // フォーム送信
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        selectSuggestion(suggestions[selectedIndex]);
      } else {
        executeSearch(query);
      }
    },
    [query, selectedIndex, suggestions, executeSearch, selectSuggestion]
  );

  // キーボードナビゲーション
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Escape":
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, suggestions.length]
  );

  // クリア
  const handleClear = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    if (onSearch) {
      onSearch("");
    }
    inputRef.current?.focus();
  }, [onSearch]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {/* 検索アイコン / ローディング */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {isLoadingData && showSuggestions ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          {/* 入力フィールド */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            autoComplete="off"
            className={cn(
              "w-full pl-12 pr-12 py-3 sm:py-4",
              "text-base sm:text-lg",
              "bg-white border border-gray-200 rounded-2xl",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "placeholder:text-gray-400",
              "transition-all duration-200",
              isOpen && "rounded-b-none border-b-0"
            )}
          />

          {/* クリアボタン */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* オートコンプリートドロップダウン */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-t-0 border-gray-200 rounded-b-2xl shadow-lg overflow-hidden">
          <ul className="py-2">
            {suggestions.map((result, index) => {
              const colors = CONTENT_TYPE_COLORS[result.type];
              const icon = CONTENT_TYPE_ICONS[result.type];
              const label = CONTENT_TYPE_LABELS[result.type];

              return (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => selectSuggestion(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors",
                      selectedIndex === index
                        ? "bg-gray-50"
                        : "hover:bg-gray-50"
                    )}
                  >
                    {/* アイコン */}
                    <div
                      className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                        colors.bg
                      )}
                    >
                      <span className="text-lg">{icon}</span>
                    </div>

                    {/* コンテンツ */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded",
                            colors.bg,
                            colors.text
                          )}
                        >
                          {label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate mt-0.5">
                        {result.title}
                      </p>
                      {result.description && (
                        <p className="text-xs text-gray-500 truncate">
                          {result.description}
                        </p>
                      )}
                    </div>

                    {/* 矢印 */}
                    <ArrowRight className="flex-shrink-0 w-4 h-4 text-gray-400" />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* 全結果を見るリンク */}
          <div className="border-t border-gray-100 px-4 py-3">
            <button
              type="button"
              onClick={() => executeSearch(query)}
              className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Search className="w-4 h-4" />「{query}」で検索
            </button>
          </div>
        </div>
      )}

      {/* 検索ボタン（モバイル用・ドロップダウンが閉じている時のみ） */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => executeSearch(query)}
          className={cn(
            "mt-3 w-full py-3 px-6",
            "bg-gray-900 text-white font-medium rounded-xl",
            "hover:bg-gray-800 transition-colors",
            "sm:hidden"
          )}
        >
          検索
        </button>
      )}
    </div>
  );
};

export default SearchBar;
