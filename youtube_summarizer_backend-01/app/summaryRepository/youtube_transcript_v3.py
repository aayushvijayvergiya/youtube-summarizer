import time
import random
from typing import Optional, Dict, Any
from youtube_transcript_api import YouTubeTranscriptApi
import yt_dlp
from urllib.parse import urlparse, parse_qs

def get_youtube_transcript_robust(youtube_url: str, max_retries: int = 3) -> Dict[str, Any]:
    """
    Robust YouTube transcript extraction with multiple fallback methods.
    
    Args:
        youtube_url (str): YouTube video URL
        max_retries (int): Maximum retry attempts for each method
        
    Returns:
        Dict[str, Any]: Contains 'transcript', 'title', 'method_used'
        
    Raises:
        ValueError: If all methods fail
    """
    video_id = extract_video_id(youtube_url)
    
    # Method 1: Basic youtube-transcript-api (fastest)
    print("Attempting Method 1: Basic youtube-transcript-api...")
    try:
        transcript = _get_transcript_basic(video_id)
        if transcript:
            title = _get_title_ytdlp(youtube_url) or "YouTube Video"
            return {
                'transcript': transcript,
                'title': title,
                'method_used': 'youtube-transcript-api'
            }
    except Exception as e:
        print(f"Method 1 failed: {str(e)}")
    
    # Method 2: yt-dlp with retries and delays
    print("Attempting Method 2: yt-dlp with anti-blocking measures...")
    for attempt in range(max_retries):
        try:
            result = _get_transcript_ytdlp_robust(youtube_url, attempt)
            if result:
                return {
                    'transcript': result['transcript'],
                    'title': result['title'],
                    'method_used': f'yt-dlp (attempt {attempt + 1})'
                }
        except Exception as e:
            print(f"Method 2 attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                delay = random.uniform(2, 5) * (attempt + 1)  # Progressive delay
                print(f"Waiting {delay:.1f} seconds before retry...")
                time.sleep(delay)
    
    # Method 3: yt-dlp with different options
    print("Attempting Method 3: yt-dlp with alternative configuration...")
    try:
        result = _get_transcript_ytdlp_alternative(youtube_url)
        if result:
            return {
                'transcript': result['transcript'],
                'title': result['title'],
                'method_used': 'yt-dlp-alternative'
            }
    except Exception as e:
        print(f"Method 3 failed: {str(e)}")
    
    raise ValueError("All transcript extraction methods failed. YouTube may be blocking requests.")

def _get_transcript_basic(video_id: str) -> Optional[str]:
    """Basic youtube-transcript-api method."""
    transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
    
    # Try different language options
    language_options = [['en'], ['en-US', 'en-GB'], ['en-auto']]
    
    for langs in language_options:
        try:
            transcript = transcript_list.find_transcript(langs)
            transcript_data = transcript.fetch()
            return " ".join([entry['text'] for entry in transcript_data])
        except:
            continue
    
    # Try auto-generated
    try:
        transcript = transcript_list.find_generated_transcript(['en'])
        transcript_data = transcript.fetch()
        return " ".join([entry['text'] for entry in transcript_data])
    except:
        pass
    
    return None

def _get_transcript_ytdlp_robust(youtube_url: str, attempt: int) -> Optional[Dict[str, str]]:
    """yt-dlp method with anti-blocking measures."""
    ydl_opts = {
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitleslangs': ['en', 'en-US', 'en-GB'],
        'skip_download': True,
        'quiet': True,
        'no_warnings': True,
        # Anti-blocking measures
        'sleep_interval': random.uniform(1, 3),
        'max_sleep_interval': 5,
        'sleep_interval_subtitles': random.uniform(1, 2),
        # Rotate user agents
        'http_headers': {
            'User-Agent': _get_random_user_agent(attempt)
        }
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=False)
        
        # Get subtitles
        subtitles = info.get('subtitles', {})
        auto_subtitles = info.get('automatic_captions', {})
        
        # Try manual subtitles first
        for lang in ['en', 'en-US', 'en-GB']:
            if lang in subtitles:
                subtitle_url = subtitles[lang][0]['url']
                transcript = _download_subtitle_content(subtitle_url)
                if transcript:
                    return {
                        'transcript': transcript,
                        'title': info.get('title', 'YouTube Video')
                    }
        
        # Try auto-generated subtitles
        for lang in ['en', 'en-US', 'en-GB']:
            if lang in auto_subtitles:
                subtitle_url = auto_subtitles[lang][0]['url']
                transcript = _download_subtitle_content(subtitle_url)
                if transcript:
                    return {
                        'transcript': transcript,
                        'title': info.get('title', 'YouTube Video')
                    }
    
    return None

def _get_transcript_ytdlp_alternative(youtube_url: str) -> Optional[Dict[str, str]]:
    """Alternative yt-dlp configuration."""
    ydl_opts = {
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitleslangs': ['en'],
        'skip_download': True,
        'quiet': True,
        'extractor_args': {
            'youtube': {
                'skip': ['dash', 'hls']  # Skip some formats to be faster
            }
        }
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=False)
        
        # Simple subtitle extraction
        auto_subtitles = info.get('automatic_captions', {})
        if 'en' in auto_subtitles and auto_subtitles['en']:
            subtitle_url = auto_subtitles['en'][0]['url']
            transcript = _download_subtitle_content(subtitle_url)
            if transcript:
                return {
                    'transcript': transcript,
                    'title': info.get('title', 'YouTube Video')
                }
    
    return None

def _get_title_ytdlp(youtube_url: str) -> Optional[str]:
    """Get video title using yt-dlp."""
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'skip_download': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            return info.get('title')
    except:
        return None

def _download_subtitle_content(subtitle_url: str) -> Optional[str]:
    """Download and parse subtitle content."""
    try:
        import requests
        import xml.etree.ElementTree as ET
        
        response = requests.get(subtitle_url, timeout=10)
        response.raise_for_status()
        
        # Parse XML subtitle content
        root = ET.fromstring(response.content)
        transcript_parts = []
        
        for text_elem in root.findall('.//text'):
            if text_elem.text:
                transcript_parts.append(text_elem.text.strip())
        
        return " ".join(transcript_parts)
    except:
        return None

def _get_random_user_agent(attempt: int) -> str:
    """Get a random user agent based on attempt number."""
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
    ]
    return user_agents[attempt % len(user_agents)]

def extract_video_id(youtube_url: str) -> str:
    """Extract video ID from YouTube URL."""
    parsed_url = urlparse(youtube_url)
    
    if parsed_url.netloc in ('youtube.com', 'www.youtube.com') and parsed_url.path == '/watch':
        query_params = parse_qs(parsed_url.query)
        if 'v' in query_params:
            return query_params['v'][0]
    elif parsed_url.netloc == 'youtu.be':
        return parsed_url.path.lstrip('/')
    elif (parsed_url.netloc in ('youtube.com', 'www.youtube.com') and
          parsed_url.path.startswith('/embed/')):
        return parsed_url.path.split('/embed/')[1]
    
    raise ValueError(f"Could not extract video ID from URL: {youtube_url}")