import { useEffect } from 'react';

export default function UtterancesComments(): JSX.Element {
  useEffect(() => {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('repo', 'Smpontelli/IgniteReactDesafio6');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    script.setAttribute('async', 'async');
    anchor.appendChild(script);
  }, []);

  return <div id="inject-comments-for-uterances" />;
}
