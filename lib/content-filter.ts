/**
 * Security and privacy filter for community forum and chat messages
 * Rule 10: NEVER allow credentials, codes or Steam Guard patterns in community content.
 */
export function inspectContentSafety(content: string): { isSafe: boolean; warning?: string } {
  if (!content || !content.trim()) {
    return { isSafe: false, warning: "Content cannot be empty" };
  }

  const normalized = content.toLowerCase();

  // 1. Detect 5-character Steam Guard patterns (e.g., "code is X4B82", "guard: 9KJ2A", "steam guard 2P9W4")
  const steamGuardRegex = /(?:code|guard|steam guard|steamguard|otp|pin|auth)(?:\s+(?:is|was|are|:|=|-)+|\s+|[:=#-])+([a-z0-9]{5})\b/i;
  if (steamGuardRegex.test(content)) {
    return {
      isSafe: false,
      warning: "Security Alert: Steam Guard codes or account credentials must NEVER be shared in community discussions. Sharing credentials compromises vault security.",
    };
  }

  // 2. Detect password sharing phrases (e.g., "password is ...", "pass: ...", "password: ...")
  const passwordRegex = /(?:password|passwd|pwd)(?:\s+(?:is|was|are|:|=|-)+|\s+|[:=#-])+([^\s]{4,})/i;
  if (passwordRegex.test(content)) {
    return {
      isSafe: false,
      warning: "Security Alert: Never share account passwords or login credentials in public community areas.",
    };
  }

  // 3. Detect piracy / crack terms
  const piracyRegex = /\b(?:crack|keygen|warez|torrent|repack|skidrow|fitgirl|bypass steam|steam emulator)\b/i;
  if (piracyRegex.test(normalized)) {
    return {
      isSafe: false,
      warning: "Policy Warning: Discussions involving game cracks, keygens, piracy, or platform circumvention tools are strictly prohibited.",
    };
  }

  return { isSafe: true };
}
