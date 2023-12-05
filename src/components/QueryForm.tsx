"use client";

import { useState, useCallback, ChangeEvent, FormEvent } from "react";

export function QueryForm() {
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState("");
    const [reference, setReference] = useState("");
    const [loading, setLoading] = useState(false);
    
    const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    }, []);

    const onSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          setLoading(true);
    
          try {
            const res = await fetch(`/api/question?query=${query}`);
    
            const data = await res.json();
    
            if (!res.ok) {
              console.error("Failed to fetch answer: ", data);
              return;
            }
    
            setAnswer(data.answer);
            setReference(data.ref);
          } catch (err) {
            setAnswer("");
            setReference("");
          } finally {
            setLoading(false);
          }
        },
        [query]
      );
    
    return (
        <>
        <form onSubmit={onSubmit}>
            <div className="py-1 space-x-4">
            <input
                className="outline"
                type="text"
                value={query}
                onChange={onChange}
            />
            <button
                className="outline"
                type="submit"
                disabled={loading || query.length <= 0}
            >
                送信
            </button>
            </div>
        </form>
        <div className="flex flex-col items-center">
            <div className="py-1"> 回答: </div>
            <div className="py-1">{loading ? "loading..." : answer}</div>
            <div className="py-1"> 参考にしたデータ: </div>
            <div className="py-1">{loading ? "loading..." : reference}</div>
        </div>
        </>
    );
}