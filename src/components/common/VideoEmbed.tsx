import React from 'react';
import { ExternalLink, Play, Video } from 'lucide-react';

interface VideoEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

export const getEmbedUrl = (url: string): { embedUrl: string | null; platform: 'youtube' | 'facebook' | 'vimeo' | 'other' } => {
  if (!url) return { embedUrl: null, platform: 'other' };

  // YouTube match
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`,
      platform: 'youtube',
    };
  }

  // Vimeo match
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      platform: 'vimeo',
    };
  }

  // Facebook match
  if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.gg')) {
    return {
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`,
      platform: 'facebook',
    };
  }

  return { embedUrl: null, platform: 'other' };
};

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ url, title = 'Video Tutorial', className = '' }) => {
  const { embedUrl, platform } = getEmbedUrl(url);

  if (embedUrl) {
    return (
      <div className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-md border border-slate-200/80 ${className}`}>
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // Fallback for direct links or non-embeddable links
  return (
    <div className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 ${className}`}>
      <div className="w-14 h-14 bg-red-600/90 rounded-2xl flex items-center justify-center shadow-lg ring-8 ring-red-500/20">
        <Play className="w-7 h-7 text-white fill-current ml-0.5" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="font-bold text-sm text-white line-clamp-1">{title}</h4>
        <p className="text-xs text-slate-400 line-clamp-2">Direct video link. Click to open and watch on external platform.</p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 backdrop-blur-md"
      >
        <span>Watch Video</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};
