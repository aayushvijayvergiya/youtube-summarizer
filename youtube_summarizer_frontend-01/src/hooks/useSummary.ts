/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { apiService } from '@/service/apiService';

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

interface SaveSummaryRequest {
    summary: string;
    title: string;
    url: string;
}

interface UseSummaryResult {
    summaries: Summary[];
    loading: boolean;
    error: string | null;
    fetchSummaries: () => Promise<void>;
    summarizeVideo: (videoUrl: string, format?: string) => Promise<SummarizeResponse>;
    saveSummary: (saveSummaryRequest: SaveSummaryRequest) => Promise<void>;
}

export function useSummary(): UseSummaryResult {
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSummaries = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.get<{ histories: Summary[] }>("/summary/history");
            setSummaries(Array.isArray(data.histories) ? data.histories : []);
        } catch (err: any) {
            setError(err.message || 'Unknown error');
            setSummaries([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const summarizeVideo = useCallback(
        async (videoUrl: string, format: string = "paragraph") : Promise<SummarizeResponse> => {
            setLoading(true);
            setError(null);
            try {
                const data = await apiService.post<SummarizeResponse>(
                    "/summary/youtube",
                    {
                        url: videoUrl,
                        format_type: format || "paragraph",
                    }
                );
                return data;
            } catch (err: any) {
                setError(err.message || "Unknown error");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const saveSummary = useCallback(
        async ({ summary, title, url }: SaveSummaryRequest) => {
            setLoading(true);
            setError(null);
            try {
                await apiService.post("/summary/save", { summary, title, url });
                await fetchSummaries();
            } catch (err: any) {
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        }, [fetchSummaries])

    return { 
        summaries, 
        loading, 
        error, 
        fetchSummaries, 
        summarizeVideo,
        saveSummary 
    };
}