import { useState, useCallback } from 'react';
import { API_BASE_URL } from "@/constants/api-constants";
import { useAuthContext } from "@/context/AuthContext";

interface Summary {
    id: number;
    title: string;
    summary: string;
    url: string;
}

interface SummarizeResponse {
    summary: string;
    title?: string;
    url?: string;
    [key: string]: unknown;
}

interface UseSummaryResult {
    summaries: Summary[];
    loading: boolean;
    error: string | null;
    fetchSummaries: () => Promise<void>;
    summarizeVideo: (videoUrl: string, format?: string) => Promise<SummarizeResponse>;
}

export function useSummary(): UseSummaryResult {
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { state: { token } } = useAuthContext();

    const fetchSummaries = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/summary/history`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch summaries');
            }
            const data = await response.json();
            setSummaries(Array.isArray(data.histories) ? data.histories : []);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unknown error');
            }
            setSummaries([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const summarizeVideo = useCallback(
        async (videoUrl: string, format: string = "paragraph") : Promise<SummarizeResponse> => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/summary/youtube`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        url: videoUrl,
                        format_type: format || "paragraph",
                    }),
                });
                const data: SummarizeResponse = await response.json();
                if (!response.ok) {
                    throw new Error((data as { detail?: string })?.detail || "Failed to summarize video");
                }
                return data;
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Unknown error");
                }
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [token]
    );

    return { summaries, loading, error, fetchSummaries, summarizeVideo };
}