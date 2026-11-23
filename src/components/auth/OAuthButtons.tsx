"use client";

import { signIn } from "next-auth/react";

export function OAuthButtons({ google, github }: { google: boolean; github: boolean }) {
  if (!google && !github) {
    return (
      <p className="mt-4 rounded-lg border border-dashed border-ink-200 bg-ink-50/50 px-3 py-2 text-center text-xs text-ink-400">
        Google &amp; GitHub sign-in are wired up — add the OAuth keys in{" "}
        <span className="font-mono">.env.local</span> to enable the buttons.
      </p>
    );
  }
  return (
    <div className="mt-5">
      <div className="relative my-4 text-center">
        <span className="relative z-10 bg-white px-3 text-xs uppercase tracking-wider text-ink-400">
          or continue with
        </span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-ink-100" />
      </div>
      <div className="grid gap-2">
        {google && (
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/app" })}
            className="btn-outline w-full"
          >
            <GoogleIcon /> Continue with Google
          </button>
        )}
        {github && (
          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl: "/app" })}
            className="btn-outline w-full"
          >
            <GitHubIcon /> Continue with GitHub
          </button>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7C21.8 18.4 23 15.6 23 12.3Z" />
      <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.8c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.8H1.8v2.9C3.7 21.3 7.6 24 12 24Z" />
      <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V7.4H1.8C1 8.9.6 10.4.6 12.5s.4 3.6 1.2 5.1l3.8-2.9Z" />
      <path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.9 15.1.9 12 .9 7.6.9 3.7 3.6 1.8 7.4l3.8 2.9C6.5 7.4 9 5.4 12 5.4Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.9 10.9c.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.4-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.8 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.6.8.5A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}
