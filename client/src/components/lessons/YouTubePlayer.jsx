import { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { embedUrl } from '../../utils/youtube.js';

// Loads the YouTube IFrame API once for the whole app.
let apiPromise;
function loadApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ||= new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previous?.(); resolve(window.YT); };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => { apiPromise = undefined; reject(new Error('Could not load the YouTube player.')); };
    document.head.appendChild(script);
  });
  return apiPromise;
}

const ERRORS = {
  2: 'This video link is not valid.',
  5: 'Your browser could not play this video.',
  100: 'This video was removed or is private.',
  101: 'The video owner does not allow it to be played outside YouTube.',
  150: 'The video owner does not allow it to be played outside YouTube.',
};

/**
 * Plays a lesson inside LearnSphere using YouTube's privacy-enhanced embed.
 * `onEnded` fires when YouTube reports the video reached its end. It is only a hint (it also fires after skipping to the
 * end), so completion is still confirmed by the learner and saved by the server.
 */
export default function YouTubePlayer({ videoId, title, isShort = false, onEnded }) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const endedRef = useRef(onEnded);
  const [error, setError] = useState('');
  const [apiFailed, setApiFailed] = useState(false);
  endedRef.current = onEnded;

  useEffect(() => {
    let cancelled = false;
    setError('');
    setApiFailed(false);
    loadApi()
      .then((YT) => {
        if (cancelled || !hostRef.current) return;
        const mount = document.createElement('div');
        hostRef.current.replaceChildren(mount);
        playerRef.current = new YT.Player(mount, {
          host: 'https://www.youtube-nocookie.com', videoId,
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED) endedRef.current?.(); },
            onError: (e) => setError(ERRORS[e.data] || 'This video cannot be played.'),
          },
        });
        const iframe = hostRef.current.querySelector('iframe');
        if (iframe) { iframe.title = title; iframe.loading = 'lazy'; iframe.setAttribute('allow', 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen'); }
      })
      .catch(() => !cancelled && setApiFailed(true));
    return () => { cancelled = true; try { playerRef.current?.destroy(); } catch { /* player already gone */ } playerRef.current = null; };
  }, [videoId, title]);

  return (
    <div className={`player-wrap${isShort ? ' is-short' : ''}`}>
      {apiFailed ? (
        // The scripted player could not load (blocked script, offline). Fall back to a plain embedded iframe.
        <iframe className="player-frame" src={embedUrl(videoId)} title={title} loading="lazy" allowFullScreen
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" />
      ) : (
        <div className="player-frame" ref={hostRef} />
      )}
      {error && (
        <div className="player-error" role="alert">
          <AlertTriangle size={28} aria-hidden="true" />
          <strong>This video cannot be played here</strong>
          <p>{error} You can still read the lesson notes. Please let your instructor know.</p>
        </div>
      )}
    </div>
  );
}
