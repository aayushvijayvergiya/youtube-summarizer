import subprocess
import json
import tempfile
import os
from typing import Optional, Dict, Any
from urllib.parse import urlparse, parse_qs


def get_youtube_transcript_v2(youtube_url: str) -> str:
    """
    Extract transcript from YouTube video using yt-dlp.
    This method is more reliable than youtube-transcript-api.
    
    Args:
        youtube_url (str): Full YouTube video URL
        
    Returns:
        str: Formatted transcript text
        
    Raises:
        ValueError: If video ID cannot be extracted or transcript is unavailable
    """
    try:
        video_id = extract_video_id(youtube_url)
        print(f"Extracted video ID: {video_id}")
        
        # Method 1: Try to get auto-generated subtitles using yt-dlp
        transcript = _get_transcript_with_ytdlp(youtube_url)
        
        if transcript:
            return transcript
            
        # Method 2: Fallback to youtube-transcript-api without proxy
        try:
            from app.summaryRepository.youtube_transcript import get_youtube_transcript
            return get_youtube_transcript(youtube_url)
        except Exception as e:
            print(f"youtube-transcript-api fallback failed: {e}")
            
        # Method 3: Extract audio and use speech recognition (if configured)
        # This would require additional setup - whisper/speech recognition
        
        raise ValueError("Could not extract transcript using any available method")
        
    except Exception as e:
        raise ValueError(f"Failed to retrieve transcript: {str(e)}")


def _get_transcript_with_ytdlp(youtube_url: str) -> Optional[str]:
    """
    Use yt-dlp to extract subtitles/transcript.
    
    Args:
        youtube_url (str): YouTube video URL
        
    Returns:
        Optional[str]: Transcript text if successful, None otherwise
    """
    try:
        # Create temporary directory for subtitle files
        with tempfile.TemporaryDirectory() as temp_dir:
            subtitle_file = os.path.join(temp_dir, "%(title)s.%(ext)s")
            
            # Try to download English subtitles
            cmd = [
                "yt-dlp",
                "--write-auto-subs",
                "--write-subs",
                "--sub-langs", "en,en-US,en-GB",
                "--sub-format", "vtt",
                "--skip-download",
                "--output", subtitle_file,
                youtube_url
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                # Find the downloaded subtitle file
                for file in os.listdir(temp_dir):
                    if file.endswith('.vtt'):
                        subtitle_path = os.path.join(temp_dir, file)
                        return _parse_vtt_file(subtitle_path)
                        
            print(f"yt-dlp subtitle extraction failed: {result.stderr}")
            return None
            
    except subprocess.TimeoutExpired:
        print("yt-dlp timed out")
        return None
    except FileNotFoundError:
        print("yt-dlp not found. Please install it: pip install yt-dlp")
        return None
    except Exception as e:
        print(f"yt-dlp error: {e}")
        return None


def _parse_vtt_file(vtt_path: str) -> str:
    """
    Parse VTT subtitle file and extract text.
    
    Args:
        vtt_path (str): Path to VTT file
        
    Returns:
        str: Extracted transcript text
    """
    try:
        with open(vtt_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        lines = content.split('\n')
        transcript_lines = []
        
        for line in lines:
            line = line.strip()
            # Skip empty lines, timestamps, and VTT headers
            if (line and 
                not line.startswith('WEBVTT') and 
                not line.startswith('NOTE') and
                not '-->' in line and
                not line.isdigit()):
                
                # Clean up common subtitle artifacts
                cleaned_line = line.replace('<c>', '').replace('</c>', '')
                cleaned_line = cleaned_line.replace('<i>', '').replace('</i>', '')
                cleaned_line = cleaned_line.replace('<b>', '').replace('</b>', '')
                
                if cleaned_line and cleaned_line not in transcript_lines:
                    transcript_lines.append(cleaned_line)
        
        return ' '.join(transcript_lines)
        
    except Exception as e:
        print(f"Error parsing VTT file: {e}")
        return ""


def get_video_info_ytdlp(youtube_url: str) -> Dict[str, Any]:
    """
    Get video information using yt-dlp.
    
    Args:
        youtube_url (str): YouTube video URL
        
    Returns:
        Dict[str, Any]: Video information including title, duration, etc.
    """
    try:
        cmd = [
            "yt-dlp",
            "--dump-json",
            "--no-download",
            youtube_url
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            video_info = json.loads(result.stdout)
            return {
                'title': video_info.get('title', 'Unknown Title'),
                'duration': video_info.get('duration', 0),
                'description': video_info.get('description', ''),
                'uploader': video_info.get('uploader', ''),
                'upload_date': video_info.get('upload_date', ''),
                'view_count': video_info.get('view_count', 0),
                'thumbnail': video_info.get('thumbnail', ''),
            }
        else:
            print(f"yt-dlp info extraction failed: {result.stderr}")
            return {}
            
    except Exception as e:
        print(f"Error getting video info: {e}")
        return {}


def extract_video_id(youtube_url: str) -> str:
    """
    Extract the video ID from a YouTube URL.
    
    Args:
        youtube_url (str): YouTube URL in various possible formats
        
    Returns:
        str: YouTube video ID
        
    Raises:
        ValueError: If video ID cannot be extracted
    """
    # Handle different URL formats
    parsed_url = urlparse(youtube_url)
    
    print(f'Parsed URL: {parsed_url}')
    
    # Format: youtube.com/watch?v=VIDEO_ID
    if parsed_url.netloc in ('youtube.com', 'www.youtube.com') and parsed_url.path == '/watch':
        query_params = parse_qs(parsed_url.query)
        if 'v' in query_params:
            return query_params['v'][0]
    
    # Format: youtu.be/VIDEO_ID
    elif parsed_url.netloc == 'youtu.be':
        return parsed_url.path.lstrip('/')
    
    # Format: youtube.com/embed/VIDEO_ID
    elif (parsed_url.netloc in ('youtube.com', 'www.youtube.com') and 
          parsed_url.path.startswith('/embed/')):
        return parsed_url.path.split('/embed/')[1]
    
    raise ValueError(f"Could not extract video ID from URL: {youtube_url}")
