import type { ComponentPropsWithRef, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Message = {
  id: string;
  sentAt?: string;
  readAt?: string;
  typing?: boolean;
  status?: "sent" | "read" | "failed";
  user?: {
    name?: string;
    avatarUrl?: string;
    status?: "online" | "offline";
    me?: boolean;
  };
  text?: ReactNode;
  audio?: {
    duration: string;
  };
  image?: {
    src: string;
    alt: string;
    name: string;
    size: string;
  };
  video?: {
    src: string;
    alt: string;
  };
  reply?: {
    text: ReactNode;
  };
  urlPreview?: {
    title: string;
    description: string;
  };
  reactions?: {
    content: string;
    count: number;
  }[];
  attachment?: {
    name: string;
    size: string;
    type: "jpg" | "txt" | "pdf" | "mp4";
  };
};

interface MessageStatusProps {
  status: "sent" | "read" | "failed";
  readAt?: string;
}

export const MessageStatus = ({ status, readAt }: MessageStatusProps) => {
  return (
    <Button className="focus:outline-hidden">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        {status === "sent" && (
          <path
            d="M13 5L7 11L4 8"
            className="stroke-fg-quaternary"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {status === "read" && (
          <path
            d="M10.5 5L4.5 11L1.5 8M14.5 5L8.5 11L6.5 9"
            className="stroke-fg-brand-secondary"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {status === "failed" && (
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14ZM7.25 5C7.25 4.58579 7.58579 4.25 8 4.25C8.41421 4.25 8.75 4.58579 8.75 5V8.5C8.75 8.91421 8.41421 9.25 8 9.25C7.58579 9.25 7.25 8.91421 7.25 8.5V5ZM8 11.75C8.41421 11.75 8.75 11.4142 8.75 11C8.75 10.5858 8.41421 10.25 8 10.25C7.58579 10.25 7.25 10.5858 7.25 11C7.25 11.4142 7.58579 11.75 8 11.75Z"
            className="fill-fg-error-primary"
          />
        )}
      </svg>
    </Button>
  );
};

interface MessageItemProps extends ComponentPropsWithRef<"li"> {
  msg: Message;
  showUserLabel?: boolean;
}

export const MessageItem = ({
  msg,
  showUserLabel = true,
  ...props
}: MessageItemProps) => {
  const renderActions = () => (
    <div className="dark-mode absolute right-2 -bottom-5 z-1 flex gap-1.5 rounded-lg bg-primary_alt px-2 py-1.5 opacity-0 shadow-xl transition duration-100 ease-linear group-hover/msg:opacity-100">
      <button
        title="Generate with AI"
        aria-label="Generate with AI"
        className="cursor-pointer rounded p-0.5 text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
      ></button>

      {(msg.text || msg.attachment || msg.audio || msg.image) && (
        <button
          title={msg.text ? "Edit message" : "Download"}
          aria-label={msg.text ? "Edit message" : "Download"}
          className="cursor-pointer rounded p-0.5 text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
        ></button>
      )}

      <button
        title="Reply"
        aria-label="Reply"
        className="cursor-pointer rounded p-0.5 text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
      ></button>
      <button
        title="Copy"
        aria-label="Copy"
        className="cursor-pointer rounded p-0.5 text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
      ></button>
    </div>
  );

  return (
    <li key={msg.id} {...props} className="mb-4">
      <article className="relative">
        {/* User label */}
        {msg.user && showUserLabel && (
          <div className="mb-1">
            <span className="text-xs text-gray-500 uppercase font-medium">
              {msg.user.me ? "YOU" : "AGENT"}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-lg px-4 py-3 shadow-sm",
            msg.user?.me
              ? "bg-white border border-gray-200"
              : "bg-gray-100 border border-gray-200"
          )}
        >
          {/* Message content */}
          <div className="text-black text-sm leading-relaxed">{msg.text}</div>
        </div>
      </article>
    </li>
  );
};
