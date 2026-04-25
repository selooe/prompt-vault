export function getYouTubeEmbedUrl(url: string | null | undefined) {
  if (!url) return null;
  
  // This regex finds the Video ID from standard, shortened, or mobile YouTube links
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  // If we find a 11-character ID, return the proper embed URL
  return (match && match[2].length === 11) 
    ? `https://www.youtube.com/embed/${match[2]}` 
    : null;
}